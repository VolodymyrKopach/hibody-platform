/**
 * === SOLID: SRP - Optimized Batch Edit Service ===
 *
 * Client-side service for efficient batch slide editing
 * Uses individual slide endpoints for cost optimization
 */

import { SimpleSlide } from '@/types/chat';

// === SOLID: ISP - Service interfaces ===
export interface BatchEditProgress {
  completed: number;
  total: number;
  currentSlide?: string;
  currentInstruction?: string;
  results: SlideEditResult[];
  errors: SlideEditError[];
  isCompleted: boolean;
  estimatedTimeRemaining?: number;
}

export interface SlideEditResult {
  slideId: string;
  success: boolean;
  editedContent?: string;
  thumbnailUrl?: string;
  editingTime: number;
  originalSlide: SimpleSlide;
}

export interface SlideEditError {
  slideId: string;
  error: string;
  instruction: string;
  editingTime: number;
}

export interface BatchEditPlan {
  [slideId: string]: string; // slideId -> instruction
}

// === SOLID: SRP - Progress callback type ===
export type ProgressCallback = (progress: BatchEditProgress) => void;

// === SOLID: SRP - Main service class ===
export class OptimizedBatchEditService {
  private batchId: string;
  private progress: BatchEditProgress;
  private onProgressUpdate?: ProgressCallback;

  constructor(batchId?: string) {
    this.batchId = batchId || `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.progress = {
      completed: 0,
      total: 0,
      results: [],
      errors: [],
      isCompleted: false
    };
  }

  /**
   * Execute batch edit plan with progress tracking (always parallel)
   */
  async executeBatchEdit(
    batchPlan: BatchEditPlan,
    slides: SimpleSlide[],
    options: {
      topic?: string;
      age?: string;
      onProgress?: ProgressCallback;
    } = {}
  ): Promise<BatchEditProgress> {
    const { topic = 'lesson', age = '6-8 years', onProgress } = options;

    this.onProgressUpdate = onProgress;
    const slideEntries = Object.entries(batchPlan);

    // Initialize progress
    this.progress = {
      completed: 0,
      total: slideEntries.length,
      results: [],
      errors: [],
      isCompleted: false,
      estimatedTimeRemaining: slideEntries.length * 30 // 30 seconds per slide estimate
    };

    console.log(`🚀 [BATCH EDIT] Starting batch edit with ${slideEntries.length} slides`);
    console.log(`⚙️ [BATCH EDIT] Mode: parallel (always)`);
    console.log(`🆔 [BATCH EDIT] Batch ID: ${this.batchId}`);

    this.updateProgress();

    try {
      await this.executeParallel(slideEntries, slides, topic, age);

      this.progress.isCompleted = true;
      this.progress.estimatedTimeRemaining = 0;
      this.updateProgress();

      console.log(`🎉 [BATCH EDIT] Batch completed: ${this.progress.results.length} success, ${this.progress.errors.length} errors`);

      return this.progress;

    } catch (error) {
      console.error(`❌ [BATCH EDIT] Batch failed:`, error);
      throw error;
    }
  }

  /**
   * Execute all slides in parallel
   */
  private async executeParallel(
    slideEntries: [string, string][],
    slides: SimpleSlide[],
    topic: string,
    age: string
  ): Promise<void> {
    const promises = slideEntries.map(async ([slideKey, instruction], index) => {
      // Extract slide number from key (e.g., "slide-1" -> 1)
      const slideNumber = this.extractSlideNumber(slideKey);
      const slide = slides[slideNumber - 1]; // Convert to 0-based index

      if (!slide) {
        this.addError(slideKey, `Slide not found at position ${slideNumber}`, instruction, 0);
        return;
      }

      try {
        const result = await this.editSingleSlide(slide, instruction, topic, age, slideNumber);
        this.addResult(result);
      } catch (error) {
        this.addError(slideKey, error instanceof Error ? error.message : 'Unknown error', instruction, 0);
      }

      // Thread-safe progress update
      this.updateProgress();
    });

    await Promise.allSettled(promises);
  }

  /**
   * Edit a single slide using the optimized API
   */
  private async editSingleSlide(
    slide: SimpleSlide,
    instruction: string,
    topic: string,
    age: string,
    slideIndex: number
  ): Promise<SlideEditResult> {
    const startTime = Date.now();

    console.log(`🔧 [BATCH EDIT] Editing slide ${slide.id} (${slideIndex}): "${instruction}"`);

    try {
      const response = await fetch(`/api/slides/${slide.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction,
          slideContent: slide.htmlContent || slide.content || '',
          topic,
          age,
          batchId: this.batchId,
          slideIndex
        }),
      });

      const data = await response.json();
      const editingTime = Date.now() - startTime;

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log(`✅ [BATCH EDIT] Slide ${slide.id} edited successfully in ${editingTime}ms`);

      return {
        slideId: slide.id,
        success: true,
        editedContent: data.editedContent,
        thumbnailUrl: data.thumbnailUrl,
        editingTime,
        originalSlide: slide
      };

    } catch (error) {
      const editingTime = Date.now() - startTime;
      console.error(`❌ [BATCH EDIT] Failed to edit slide ${slide.id}:`, error);

      throw error; // Re-throw to be caught by caller
    }
  }

  /**
   * Add successful result
   */
  private addResult(result: SlideEditResult): void {
    this.progress.results.push(result);
  }

  /**
   * Add error result
   */
  private addError(slideId: string, error: string, instruction: string, editingTime: number): void {
    this.progress.errors.push({
      slideId,
      error,
      instruction,
      editingTime
    });
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(): void {
    // Calculate completed based on actual results and errors (thread-safe)
    this.progress.completed = this.progress.results.length + this.progress.errors.length;

    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.progress });
    }
  }

  /**
   * Extract slide number from slide key (e.g., "slide-1" -> 1)
   */
  private extractSlideNumber(slideKey: string): number {
    const match = slideKey.match(/slide-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  /**
   * Get current progress
   */
  getProgress(): BatchEditProgress {
    return { ...this.progress };
  }

  /**
   * Get batch ID
   */
  getBatchId(): string {
    return this.batchId;
  }
}
