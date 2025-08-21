import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { type SimpleSlide } from '@/types/chat';
import { 
  IBatchSlideEditingService, 
  BatchEditSession, 
  BatchProgress, 
  BatchEditResult, 
  BatchEditParams 
} from '../interfaces/IChatServices';
import { getThumbnailUpdateService } from '../../slides/ThumbnailUpdateService';

// === SOLID: Single Responsibility - Batch Slide Editing ===
export class BatchSlideEditingService implements IBatchSlideEditingService {
  private sessions = new Map<string, BatchEditSession>();
  private progressTrackers = new Map<string, BatchProgress>();
  private simpleEditService: GeminiSimpleEditService;
  private thumbnailUpdateService = getThumbnailUpdateService();

  constructor() {
    this.simpleEditService = new GeminiSimpleEditService();
  }

  async startBatchEdit(params: BatchEditParams): Promise<BatchEditSession> {
    const batchId = this.generateBatchId();
    
    const session: BatchEditSession = {
      batchId,
      lessonId: params.lessonId,
      slideNumbers: params.slideNumbers,
      editInstruction: params.editInstruction,
      status: 'pending',
      createdAt: new Date(),
      completedSlides: [],
      failedSlides: [],
      totalSlides: params.slideNumbers.length
    };

    // Initialize progress tracker
    const progress: BatchProgress = {
      batchId,
      completed: 0,
      total: params.slideNumbers.length,
      status: 'editing',
      results: [],
      estimatedTimeRemaining: params.slideNumbers.length * 30 // 30 seconds per slide estimate
    };

    this.sessions.set(batchId, session);
    this.progressTrackers.set(batchId, progress);

    console.log(`🔄 [BATCH EDIT] Started batch ${batchId} for ${params.slideNumbers.length} slides`);
    console.log(`📝 [BATCH EDIT] Instruction: "${params.editInstruction}"`);
    console.log(`🎯 [BATCH EDIT] Slides: ${params.slideNumbers.join(', ')}`);

    // Start async processing
    this.processBatchEdit(session, params).catch(error => {
      console.error(`❌ [BATCH EDIT] Error in batch ${batchId}:`, error);
      this.updateSessionStatus(batchId, 'error');
    });

    return session;
  }

  async editSlideInBatch(slideId: string, batchId: string, slideIndex: number): Promise<BatchEditResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔧 [BATCH EDIT] Editing slide ${slideIndex} in batch ${batchId}`);
      
      // This would be called from the API endpoint with the actual slide data
      // For now, we'll return a placeholder result
      const result: BatchEditResult = {
        slideId,
        slideIndex,
        success: true,
        editingTime: Date.now() - startTime
      };

      // Update progress
      this.updateProgress(batchId, slideIndex, result);
      
      return result;
    } catch (error) {
      console.error(`❌ [BATCH EDIT] Error editing slide ${slideIndex}:`, error);
      
      const result: BatchEditResult = {
        slideId,
        slideIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        editingTime: Date.now() - startTime
      };

      this.updateProgress(batchId, slideIndex, result);
      return result;
    }
  }

  async getBatchProgress(batchId: string): Promise<BatchProgress> {
    const progress = this.progressTrackers.get(batchId);
    if (!progress) {
      throw new Error(`Batch ${batchId} not found`);
    }
    return progress;
  }

  async cancelBatchEdit(batchId: string): Promise<boolean> {
    const session = this.sessions.get(batchId);
    if (!session) {
      return false;
    }

    session.status = 'error';
    this.sessions.set(batchId, session);
    
    const progress = this.progressTrackers.get(batchId);
    if (progress) {
      progress.status = 'error';
      this.progressTrackers.set(batchId, progress);
    }

    console.log(`🛑 [BATCH EDIT] Cancelled batch ${batchId}`);
    return true;
  }

  // Private methods
  private async processBatchEdit(session: BatchEditSession, params: BatchEditParams): Promise<void> {
    session.status = 'editing';
    this.sessions.set(session.batchId, session);

    console.log(`🚀 [BATCH EDIT] Processing batch ${session.batchId}`);
    console.log(`📝 [BATCH EDIT] Edit instruction: "${params.editInstruction}"`);
    
    // TODO: In a real implementation, fetch lesson and slides from database
    // For now, we'll simulate the process with actual slide editing
    
    const results: BatchEditResult[] = [];
    
    for (let i = 0; i < session.slideNumbers.length; i++) {
      const slideNumber = session.slideNumbers[i];
      const slideId = `slide_${slideNumber}`; // Assuming slide ID format
      const startTime = Date.now();
      
      try {
        console.log(`🔧 [BATCH EDIT] Editing slide ${slideNumber} (${i + 1}/${session.totalSlides})`);
        
        // TODO: Fetch actual slide from database
        // For simulation, create a mock slide
        const mockSlide: SimpleSlide = {
          id: slideId,
          title: `Slide ${slideNumber}`,
          htmlContent: `<div>Mock content for slide ${slideNumber}</div>`,
          type: 'content'
        };
        
        // Edit the slide using GeminiSimpleEditService
        const editedHTML = await this.simpleEditService.editSlide(
          mockSlide.htmlContent,
          params.editInstruction,
          params.topic || 'lesson',
          params.age || '6-8 years'
        );
        
        // Create updated slide
        const updatedSlide: SimpleSlide = {
          ...mockSlide,
          htmlContent: editedHTML,
          updatedAt: new Date()
        };
        
        // Regenerate thumbnail for the updated slide (only on client-side)
        let thumbnailUrl = '';
        if (typeof document !== 'undefined') {
          try {
            console.log(`🎨 [BATCH EDIT] Regenerating thumbnail for slide ${slideNumber}`);
            thumbnailUrl = await this.thumbnailUpdateService.regenerateThumbnail(
              slideId,
              editedHTML,
              { forceRegenerate: true, fast: true }
            );
          } catch (error) {
            console.error(`❌ [BATCH EDIT] Failed to regenerate thumbnail for slide ${slideNumber}:`, error);
          }
        } else {
          console.log(`💻 [BATCH EDIT] Server-side: Skipping thumbnail regeneration for slide ${slideNumber}`);
        }
        
        // Create successful result
        const result: BatchEditResult = {
          slideId,
          slideIndex: slideNumber,
          success: true,
          updatedSlide,
          thumbnailUrl,
          editingTime: Date.now() - startTime
        };
        
        results.push(result);
        session.completedSlides.push(slideNumber);
        
        console.log(`✅ [BATCH EDIT] Completed slide ${slideNumber} in ${result.editingTime}ms`);
        
      } catch (error) {
        console.error(`❌ [BATCH EDIT] Failed to edit slide ${slideNumber}:`, error);
        
        const result: BatchEditResult = {
          slideId,
          slideIndex: slideNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          editingTime: Date.now() - startTime
        };
        
        results.push(result);
        session.failedSlides.push(slideNumber);
      }
      
      // Update progress after each slide
      const progress = this.progressTrackers.get(session.batchId);
      if (progress) {
        progress.completed = session.completedSlides.length;
        progress.currentSlide = slideNumber;
        progress.estimatedTimeRemaining = (session.totalSlides - (i + 1)) * 30;
        progress.results = results;
        this.progressTrackers.set(session.batchId, progress);
      }
    }

    // Mark as completed
    session.status = 'completed';
    this.sessions.set(session.batchId, session);
    
    const progress = this.progressTrackers.get(session.batchId);
    if (progress) {
      progress.status = 'completed';
      progress.estimatedTimeRemaining = 0;
      progress.results = results;
      this.progressTrackers.set(session.batchId, progress);
    }

    console.log(`🎉 [BATCH EDIT] Batch ${session.batchId} completed!`);
    console.log(`📊 [BATCH EDIT] Results: ${session.completedSlides.length} success, ${session.failedSlides.length} failed`);
    console.log(`🎨 [BATCH EDIT] Thumbnails regenerated for ${results.filter(r => r.success && r.thumbnailUrl).length} slides`);
  }

  private updateProgress(batchId: string, slideIndex: number, result: BatchEditResult): void {
    const progress = this.progressTrackers.get(batchId);
    if (!progress) return;

    if (!progress.results) {
      progress.results = [];
    }
    
    progress.results.push(result);
    progress.completed = progress.results.filter(r => r.success).length;
    
    if (progress.completed >= progress.total) {
      progress.status = 'completed';
      progress.estimatedTimeRemaining = 0;
    }

    this.progressTrackers.set(batchId, progress);
  }

  private updateSessionStatus(batchId: string, status: BatchEditSession['status']): void {
    const session = this.sessions.get(batchId);
    if (session) {
      session.status = status;
      this.sessions.set(batchId, session);
    }
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility method to determine affected slides
  static determineAffectedSlides(
    affectedSlides: 'all' | 'specific' | 'range' | 'single',
    slideNumbers?: number[],
    slideRange?: { start: number; end: number },
    totalSlides?: number
  ): number[] {
    switch (affectedSlides) {
      case 'all':
        if (!totalSlides) throw new Error('Total slides count required for "all" operation');
        return Array.from({ length: totalSlides }, (_, i) => i + 1);
        
      case 'specific':
        if (!slideNumbers || slideNumbers.length === 0) {
          throw new Error('Slide numbers required for "specific" operation');
        }
        return slideNumbers;
        
      case 'range':
        if (!slideRange) throw new Error('Slide range required for "range" operation');
        const { start, end } = slideRange;
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        
      case 'single':
        if (!slideNumbers || slideNumbers.length === 0) {
          throw new Error('Slide number required for "single" operation');
        }
        return [slideNumbers[0]];
        
      default:
        throw new Error(`Unknown affected slides type: ${affectedSlides}`);
    }
  }
}
