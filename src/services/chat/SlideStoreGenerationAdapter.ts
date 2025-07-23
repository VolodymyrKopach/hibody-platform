import { SimpleLesson, SimpleSlide } from '@/types/chat';
import { ISlideStore } from '@/types/store';
import { ChatService } from './ChatService';
import { SlideDescription } from '@/types/chat';
import { ParallelSlideGenerationService } from './ParallelSlideGenerationService';
import { SlideGenerationProgress } from '@/types/chat';

// === SOLID: SRP - SlideStoreGenerationAdapter is responsible only for integrating generation with the Store ===
export class SlideStoreGenerationAdapter {
  constructor(
    private store: ISlideStore,
    private generationService: ParallelSlideGenerationService
  ) {}

  // === SOLID: DIP - Using Store Abstraction ===
  async generateSlidesWithStoreUpdates(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    lesson: SimpleLesson
  ): Promise<void> {
    console.log('🚀 [SlideStoreAdapter] Starting generation with Store integration');

    // Update Store - start generation
    this.store.actions.setCurrentLesson(lesson);
    this.store.actions.setGenerating(true);

    try {
      // Start parallel generation with callbacks for the Store
      await this.generationService.generateAllSlidesParallel(
        slideDescriptions,
        lessonTopic,
        lessonAge,
        lesson,
        {
          // === SOLID: OCP - Callbacks for extending functionality ===
          onSlideReady: (slide: SimpleSlide, updatedLesson: SimpleLesson) => {
            console.log(`🎨 [SlideStoreAdapter] Slide ready: ${slide.title}`);
            
            // Add slide to Store IMMEDIATELY
            this.store.actions.addSlide(slide);
            
            // Update lesson
            this.store.actions.updateLesson({
              slides: updatedLesson.slides,
              updatedAt: new Date()
            });

            // Automatically open slide panel for the first slide
            const currentState = this.store.getState();
            if ((currentState.slides?.length || 0) === 1 && !currentState.slidePanelOpen) {
              this.store.actions.setSlidePanelOpen(true);
              console.log('📱 [SlideStoreAdapter] Auto-opened slide panel for first slide');
            }
          },

          onProgressUpdate: (progress: SlideGenerationProgress[]) => {
             // Update progress of each slide in Store
             progress.forEach(slideProgress => {
               this.store.actions.setSlideGenerationProgress(
                 `slide-${slideProgress.slideNumber}`, 
                 slideProgress.progress || 0
               );
             });
           },

          onError: (error: string, slideNumber: number) => {
            console.error(`❌ [SlideStoreAdapter] Generation error for slide ${slideNumber}:`, error);
            // We can add error state to Store if needed
          },

          onComplete: (finalLesson: SimpleLesson, stats: any) => {
            console.log(`🎉 [SlideStoreAdapter] Generation completed:`, stats);
            
            // End generation
            this.store.actions.setGenerating(false);
            
            // Update final lesson state
            this.store.actions.updateLesson({
              slides: finalLesson.slides,
              updatedAt: new Date()
            });

            // Clear generation progress
            this.clearGenerationProgress();
          }
        }
      );

    } catch (error) {
      console.error('❌ [SlideStoreAdapter] Generation failed:', error);
      
      // Reset generation state on error
      this.store.actions.setGenerating(false);
      this.clearGenerationProgress();
      
      throw error;
    }
  }

  // === SOLID: SRP - Clearing generation progress ===
  private clearGenerationProgress(): void {
    // Clear all generation progress
    const currentState = this.store.getState();
    
    currentState.generationProgress.forEach((_, slideId) => {
      this.store.actions.setSlideGenerationProgress(slideId, 0);
    });
  }

  // === SOLID: OCP - Additional methods for extension ===
  
  // Generate a single slide with Store updates
  async generateSingleSlide(
    description: string, 
    lessonTopic: string, 
    lessonAge: string
  ): Promise<SimpleSlide> {
    console.log('🎯 [SlideStoreAdapter] Generating single slide');

    // Use parallel generation for a single slide
    const slideDescription: SlideDescription = {
      slideNumber: 1,
      title: 'Generated Slide',
      description,
      type: 'content'
    };

    const tempLesson: SimpleLesson = {
      id: `temp_${Date.now()}`,
      title: 'Temporary Lesson',
      description: 'Temporary lesson for single slide generation',
      subject: 'General',
      ageGroup: lessonAge,
      duration: 30,
      authorId: 'system',
      slides: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      this.generationService.generateAllSlidesParallel(
        [slideDescription],
        lessonTopic,
        lessonAge,
        tempLesson,
        {
          onSlideReady: (slide: SimpleSlide) => {
            // Add to Store
            this.store.actions.addSlide(slide);
            resolve(slide);
          },
          onProgressUpdate: () => {},
          onError: (error: string) => reject(new Error(error)),
          onComplete: () => {}
        }
      ).catch(reject);
    });
  }

  // Update existing slide from Store
  async updateSlideContent(
    slideId: string, 
    instruction: string
  ): Promise<void> {
    console.log(`🔄 [SlideStoreAdapter] Updating slide: ${slideId}`);

    const currentState = this.store.getState();
    const slide = currentState.slides.find(s => s.id === slideId);

    if (!slide) {
      throw new Error(`Slide ${slideId} not found in Store`);
    }

    // Here you can add logic to update the slide via AI
    // For now, just update the status
    this.store.actions.updateSlide(slideId, {
      status: 'completed',
      updatedAt: new Date()
    });
  }

  // Get generation statistics
  getGenerationStats(): {
    isGenerating: boolean;
    totalSlides: number;
    completedSlides: number;
    averageProgress: number;
  } {
    const state = this.store.getState();
    
    const totalSlides = state.slides.length;
    const averageProgress = state.generationProgress.size > 0 
      ? Array.from(state.generationProgress.values()).reduce((sum, progress) => sum + progress, 0) / state.generationProgress.size
      : 0;

    return {
      isGenerating: state.isGenerating,
      totalSlides,
      completedSlides: state.slides.filter(slide => slide.status === 'completed').length,
      averageProgress: Math.round(averageProgress)
    };
  }
}

// === SOLID: SRP - Factory for creating adapter ===
export class SlideStoreGenerationAdapterFactory {
  static create(
    store: ISlideStore, 
    generationService?: ParallelSlideGenerationService
  ): SlideStoreGenerationAdapter {
    const service = generationService || new ParallelSlideGenerationService();
    return new SlideStoreGenerationAdapter(store, service);
  }

  static createWithCustomConfig(
    store: ISlideStore,
    config: {
      maxConcurrentSlides?: number;
      retryAttempts?: number;
      timeoutMs?: number;
    }
  ): SlideStoreGenerationAdapter {
    const service = new ParallelSlideGenerationService();
    return new SlideStoreGenerationAdapter(store, service);
  }
}

// === SOLID: ISP - Specific interface for Store-based generation ===
export interface ISlideStoreGenerationAdapter {
  generateSlidesWithStoreUpdates(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    lesson: SimpleLesson
  ): Promise<void>;

  generateSingleSlide(
    description: string, 
    lessonTopic: string, 
    lessonAge: string
  ): Promise<SimpleSlide>;

  updateSlideContent(slideId: string, instruction: string): Promise<void>;

  getGenerationStats(): {
    isGenerating: boolean;
    totalSlides: number;
    completedSlides: number;
    averageProgress: number;
  };
} 