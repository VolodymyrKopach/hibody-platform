import { SimpleLesson, SimpleSlide } from '@/types/chat';
import { ISlideStore } from '@/types/store';
import { ChatService } from './ChatService';
import { SlideDescription } from '@/types/chat';

// === SOLID: SRP - SlideStoreGenerationAdapter відповідає тільки за інтеграцію генерації з Store ===
export class SlideStoreGenerationAdapter {
  constructor(
    private store: ISlideStore,
    private generationService: ParallelSlideGenerationService
  ) {}

  // === SOLID: DIP - Використання абстракції Store ===
  async generateSlidesWithStoreUpdates(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    lesson: SimpleLesson
  ): Promise<void> {
    console.log('🚀 [SlideStoreAdapter] Starting generation with Store integration');

    // Оновлюємо Store - початок генерації
    this.store.actions.setCurrentLesson(lesson);
    this.store.actions.setGenerating(true);

    try {
      // Запускаємо паралельну генерацію з callbacks для Store
      await this.generationService.generateAllSlidesParallel(
        slideDescriptions,
        lessonTopic,
        lessonAge,
        lesson,
        {
          // === SOLID: OCP - Callbacks для розширення функціональності ===
          onSlideReady: (slide: SimpleSlide, updatedLesson: SimpleLesson) => {
            console.log(`🎨 [SlideStoreAdapter] Slide ready: ${slide.title}`);
            
            // Додаємо слайд до Store ВІДРАЗУ
            this.store.actions.addSlide(slide);
            
            // Оновлюємо урок
            this.store.actions.updateLesson({
              slides: updatedLesson.slides,
              updatedAt: new Date()
            });

            // Автоматично відкриваємо панель слайдів при першому слайді
            const currentState = this.store.getState();
            if ((currentState.slides?.length || 0) === 1 && !currentState.slidePanelOpen) {
              this.store.actions.setSlidePanelOpen(true);
              console.log('📱 [SlideStoreAdapter] Auto-opened slide panel for first slide');
            }
          },

                     onProgressUpdate: (progress) => {
             // Оновлюємо прогрес кожного слайду в Store
             progress.forEach(slideProgress => {
               this.store.actions.setSlideGenerationProgress(
                 `slide-${slideProgress.slideNumber}`, 
                 slideProgress.progress || 0
               );
             });
           },

          onError: (error: string, slideNumber: number) => {
            console.error(`❌ [SlideStoreAdapter] Generation error for slide ${slideNumber}:`, error);
            // Можемо додати error state до Store при потребі
          },

          onComplete: (finalLesson: SimpleLesson, stats) => {
            console.log(`🎉 [SlideStoreAdapter] Generation completed:`, stats);
            
            // Завершуємо генерацію
            this.store.actions.setGenerating(false);
            
            // Оновлюємо фінальний стан уроку
            this.store.actions.updateLesson({
              slides: finalLesson.slides,
              updatedAt: new Date()
            });

            // Очищуємо прогрес генерації
            this.clearGenerationProgress();
          }
        }
      );

    } catch (error) {
      console.error('❌ [SlideStoreAdapter] Generation failed:', error);
      
      // Скидаємо стан генерації при помилці
      this.store.actions.setGenerating(false);
      this.clearGenerationProgress();
      
      throw error;
    }
  }

  // === SOLID: SRP - Очищення прогресу генерації ===
  private clearGenerationProgress(): void {
    // Очищаємо всі прогреси генерації
    const currentState = this.store.getState();
    
    currentState.generationProgress.forEach((_, slideId) => {
      this.store.actions.setSlideGenerationProgress(slideId, 0);
    });
  }

  // === SOLID: OCP - Додаткові методи для розширення ===
  
  // Генерація окремого слайду з оновленням Store
  async generateSingleSlide(
    description: string, 
    lessonTopic: string, 
    lessonAge: string
  ): Promise<SimpleSlide> {
    console.log('🎯 [SlideStoreAdapter] Generating single slide');

    // Використовуємо паралельну генерацію для одного слайду
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
            // Додаємо до Store
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

  // Оновлення існуючого слайду з Store
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

    // Тут можна додати логіку оновлення слайду через AI
    // Поки що просто оновлюємо статус
    this.store.actions.updateSlide(slideId, {
      status: 'completed',
      updatedAt: new Date()
    });
  }

  // Отримання статистики генерації
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

// === SOLID: SRP - Factory для створення адаптера ===
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

// === SOLID: ISP - Специфічний інтерфейс для Store-based генерації ===
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