import { SlideStore } from '@/stores/SlideStore';
import { PlanParser } from '@/utils/planParser';
import { TemplateData } from '@/types/templates';
import { SlideDescription, SimpleLesson, SimpleSlide, SlideGenerationProgress } from '@/types/chat';
import { getLocalThumbnailStorage } from '@/services/slides/LocalThumbnailService';

/**
 * API-based адаптер для template генерації слайдів
 * Використовує server-side API endpoints замість прямих сервісів
 */
export class TemplateAPIAdapter {
  private slideStore: SlideStore;
  private abortController: AbortController | null = null;
  private thumbnailService = getLocalThumbnailStorage();

  constructor(slideStore: SlideStore) {
    this.slideStore = slideStore;
  }

  /**
   * Головний метод для запуску генерації слайдів через API
   */
  async startTemplateGeneration(
    generatedPlan: string,
    templateData: TemplateData,
    callbacks?: TemplateGenerationCallbacks,
    language?: string
  ): Promise<TemplateGenerationResult> {
    console.log('🌐 [TemplateAPIAdapter] Starting API-based slide generation', {
      templateData,
      planLength: generatedPlan.length
    });

    try {
      // Створюємо новий AbortController для можливості скасування
      this.abortController = new AbortController();

      // === STEP 1: Парсинг markdown плану ===
      const slideDescriptions = this.parseMarkdownPlan(generatedPlan, templateData.slideCount);

      // === STEP 2: Ініціалізація уроку ===
      const lesson = this.initializeLesson(templateData, slideDescriptions);

      // === STEP 3: Налаштування SlideStore ===
      this.setupSlideStore(lesson);

      // === STEP 4: Запуск паралельної генерації через API ===
      const stats = await this.runParallelAPIGeneration(
        slideDescriptions,
        templateData,
        lesson,
        callbacks,
        language
      );

      console.log('✅ [TemplateAPIAdapter] Generation completed successfully', stats);

      return {
        success: true,
        lesson,
        stats,
        slideDescriptions
      };

    } catch (error) {
      console.error('❌ [TemplateAPIAdapter] Generation failed:', error);
      
      // Очищуємо стан при помилці
      this.slideStore.actions.setGenerating(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      callbacks?.onError?.(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Парсинг markdown плану в SlideDescription[]
   */
  private parseMarkdownPlan(markdownPlan: string, slideCount: number): SlideDescription[] {
    try {
      const slideDescriptions = PlanParser.parseMarkdownToSlideDescriptions(markdownPlan, slideCount);
      
      // Валідація результатів
      const validation = PlanParser.validateSlideDescriptions(slideDescriptions);
      if (!validation.isValid) {
        console.warn('⚠️ [TemplateAPIAdapter] Plan parsing validation warnings:', validation.errors);
      }

      return slideDescriptions;

    } catch (error) {
      console.error('❌ [TemplateAPIAdapter] Failed to parse plan:', error);
      throw new Error(`Failed to parse lesson plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ініціалізація SimpleLesson об'єкта
   */
  private initializeLesson(templateData: TemplateData, slideDescriptions: SlideDescription[]): SimpleLesson {
    const now = new Date();
    
    return {
      id: `template_lesson_${now.getTime()}`,
      title: `${templateData.topic} (${templateData.ageGroup})`,
      description: `Template-generated lesson about ${templateData.topic} for children aged ${templateData.ageGroup}${templateData.additionalInfo ? `. ${templateData.additionalInfo}` : ''}`,
      subject: 'General Education',
      ageGroup: templateData.ageGroup,
      duration: this.calculateEstimatedDuration(slideDescriptions.length),
      createdAt: now,
      updatedAt: now,
      authorId: 'template-generator',
      slides: [] // Слайди будуть додаватися під час генерації
    };
  }

  /**
   * Налаштування SlideStore для template flow
   */
  private setupSlideStore(lesson: SimpleLesson): void {
    // Очищуємо попередній стан
    this.slideStore.actions.reset();
    
    // Встановлюємо новий урок
    this.slideStore.actions.setCurrentLesson(lesson);
    
    // Позначаємо що генерація почалася
    this.slideStore.actions.setGenerating(true);
    
  }

  /**
   * Запуск паралельної генерації через API endpoints
   */
  private async runParallelAPIGeneration(
    slideDescriptions: SlideDescription[],
    templateData: TemplateData,
    lesson: SimpleLesson,
    callbacks?: TemplateGenerationCallbacks,
    language?: string
  ): Promise<GenerationStats> {
    
    const startTime = Date.now();
    const totalSlides = slideDescriptions.length;
    let completedSlides = 0;
    let failedSlides = 0;
    const errors: string[] = [];

    // Створюємо placeholder слайди для збереження порядку
    const placeholderSlides: SimpleSlide[] = slideDescriptions.map((slideDesc, index) => ({
      id: `placeholder_${index + 1}_${Date.now()}`,
      title: slideDesc.title,
      content: 'Генерується...',
      htmlContent: '',
      status: 'generating' as const,
      isPlaceholder: true,
      updatedAt: new Date()
    }));

    // Додаємо всі placeholder'и до store одразу
    this.slideStore.actions.addSlides(placeholderSlides);

    // Створюємо проміси для всіх слайдів
    const slidePromises = slideDescriptions.map(async (slideDesc, index) => {
      const slideNumber = index + 1;
      
      try {
        
        // Оновлюємо прогрес - початок генерації
        this.updateSlideProgress(slideNumber, 0);
        callbacks?.onProgressUpdate?.([{
          slideNumber,
          progress: 0,
          status: 'generating',
          title: slideDesc.title
        }]);

        // Викликаємо API endpoint для генерації слайду
        const slide = await this.generateSlideViaAPI(slideDesc, templateData, slideNumber, language);
        
        // Оновлюємо прогрес - завершено
        this.updateSlideProgress(slideNumber, 100);
        
        // Оновлюємо placeholder слайд на згенерований
        const placeholderId = placeholderSlides[index].id;
        this.slideStore.actions.updateSlide(placeholderId, {
          id: slide.id,
          title: slide.title,
          content: slide.content,
          htmlContent: slide.htmlContent,
          status: slide.status,
          isPlaceholder: false,
          previewUrl: slide.previewUrl,
          thumbnailUrl: slide.thumbnailUrl,
          updatedAt: slide.updatedAt,
          estimatedDuration: slide.estimatedDuration,
          interactive: slide.interactive,
          visualElements: slide.visualElements,
          description: slide.description
        });

        
        // Автоматично генеруємо превью для слайду
        if (slide.htmlContent) {
          
          try {
            const thumbnailBase64 = await this.generateThumbnailWithRetry(slide.id, slide.htmlContent, slideNumber);
          } catch (error) {
            console.error(`❌ [TemplateAPIAdapter] Preview generation failed for slide ${slideNumber} after retries:`, {
              slideId: slide.id,
              error: error instanceof Error ? error.message : error,
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        } else {
          console.warn(`⚠️ [TemplateAPIAdapter] No HTML content for slide ${slideNumber}, skipping preview generation:`, {
            slideId: slide.id,
            title: slide.title
          });
        }
        
        // Оновлюємо урок
        const currentState = this.slideStore.getState();
        const updatedLesson: SimpleLesson = {
          ...lesson,
          slides: currentState.slides || [],
          updatedAt: new Date()
        };
        
        this.slideStore.actions.updateLesson({
          slides: updatedLesson.slides,
          updatedAt: updatedLesson.updatedAt
        });

        // Автоматично відкриваємо панель слайдів для першого слайду
        if (slideNumber === 1 && !currentState.slidePanelOpen) {
          this.slideStore.actions.setSlidePanelOpen(true);
        }

        // Викликаємо callback
        callbacks?.onSlideReady?.(slide, updatedLesson);
        
        completedSlides++;
        
        return slide;

      } catch (error) {
        console.error(`❌ [TemplateAPIAdapter] Slide ${slideNumber} generation failed:`, error);
        
        failedSlides++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Slide ${slideNumber}: ${errorMessage}`);
        
        // Оновлюємо прогрес - помилка
        this.updateSlideProgress(slideNumber, 0, 'error');
        callbacks?.onSlideError?.(errorMessage, slideNumber);
        
        return null;
      }
    });

    // Чекаємо завершення всіх промісів
    const results = await Promise.allSettled(slidePromises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Створюємо статистику
    const stats: GenerationStats = {
      totalSlides,
      completedSlides,
      failedSlides,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalTimeMs: duration,
      duration, // Keep for backward compatibility
      averageTimePerSlide: completedSlides > 0 ? duration / completedSlides : 0,
      errors
    };

    // Завершуємо генерацію
    this.slideStore.actions.setGenerating(false);
    
    // Отримуємо фінальний урок
    const finalState = this.slideStore.getState();
    const finalLesson: SimpleLesson = {
      ...lesson,
      slides: finalState.slides || [],
      updatedAt: new Date()
    };

    // Викликаємо callback завершення
    callbacks?.onComplete?.(finalLesson, stats);

    console.log(`🎉 [TemplateAPIAdapter] Parallel generation completed:`, stats);

    return stats;
  }

  /**
   * Генерація одного слайду через API
   */
  private async generateSlideViaAPI(
    slideDesc: SlideDescription,
    templateData: TemplateData,
    slideNumber: number,
    language?: string
  ): Promise<SimpleSlide> {
    
    const requestBody = {
      slideNumber,
      title: slideDesc.title,
      description: slideDesc.description,
      type: slideDesc.type,
      templateData: {
        topic: templateData.topic,
        ageGroup: templateData.ageGroup,
        slideCount: templateData.slideCount,
        hasAdditionalInfo: !!templateData.additionalInfo,
        additionalInfo: templateData.additionalInfo
      },
      sessionId: `template_${Date.now()}`,
      language: language || 'en',
      slideStructure: slideDesc.slideStructure
    };


    const response = await fetch('/api/templates/slides/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: this.abortController?.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.details || 
        errorData.error || 
        `API request failed with status ${response.status}`
      );
    }

    const result = await response.json();
    
    if (!result.success || !result.slide) {
      throw new Error(result.error || 'API returned unsuccessful result');
    }

    
    return result.slide;
  }

  /**
   * Оновлення прогресу слайду
   */
  private updateSlideProgress(slideNumber: number, progress: number, status: 'generating' | 'completed' | 'error' = 'generating'): void {
    this.slideStore.actions.setSlideGenerationProgress(
      `slide_${slideNumber}`, 
      progress
    );
  }

  /**
   * Розрахунок орієнтовної тривалості уроку
   */
  private calculateEstimatedDuration(slideCount: number): number {
    // Базова формула: 3-5 хвилин на слайд
    const baseMinutesPerSlide = 4;
    const estimatedMinutes = slideCount * baseMinutesPerSlide;
    
    // Округлюємо до найближчих 5 хвилин
    return Math.round(estimatedMinutes / 5) * 5;
  }

  /**
   * Генерація превью з повторними спробами
   */
  private async generateThumbnailWithRetry(
    slideId: string, 
    htmlContent: string, 
    slideNumber: number, 
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
        // Додаємо невелику затримку між спробами
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        const thumbnailBase64 = await this.thumbnailService.generateThumbnail(slideId, htmlContent);
        
        return thumbnailBase64;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ [TemplateAPIAdapter] Thumbnail generation attempt ${attempt} failed for slide ${slideNumber}:`, lastError.message);
        
        if (attempt === maxRetries) {
          console.error(`❌ [TemplateAPIAdapter] All ${maxRetries} attempts failed for slide ${slideNumber}`);
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('Unknown error during thumbnail generation');
  }

  /**
   * Отримання поточного стану генерації
   */
  getGenerationState(): TemplateGenerationState {
    const state = this.slideStore.getState();
    
    return {
      isGenerating: state.isGenerating || false,
      currentLesson: state.currentLesson,
      slides: state.slides || [],
      totalSlides: state.currentLesson?.slides?.length || 0,
      completedSlides: (state.slides || []).filter(s => s.status === 'completed').length,
      generationProgress: state.generationProgress || new Map()
    };
  }

  /**
   * Зупинка генерації
   */
  stopGeneration(): void {
    console.log('🛑 [TemplateAPIAdapter] Stopping generation...');
    
    // Скасовуємо всі активні запити
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.slideStore.actions.setGenerating(false);
  }

  /**
   * Очищення стану
   */
  cleanup(): void {
    console.log('🧹 [TemplateAPIAdapter] Cleaning up...');
    
    // Скасовуємо активні запити
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.slideStore.actions.reset();
  }
}

// === Типи для TemplateAPIAdapter ===

export interface TemplateGenerationCallbacks {
  onSlideReady?: (slide: SimpleSlide, lesson: SimpleLesson) => void;
  onProgressUpdate?: (progress: SlideGenerationProgress[]) => void;
  onSlideError?: (error: string, slideNumber: number) => void;
  onComplete?: (lesson: SimpleLesson, stats: GenerationStats) => void;
  onError?: (error: string) => void;
}

export interface TemplateGenerationResult {
  success: boolean;
  lesson?: SimpleLesson;
  stats?: GenerationStats;
  slideDescriptions?: SlideDescription[];
  error?: string;
}

export interface TemplateGenerationState {
  isGenerating: boolean;
  currentLesson: SimpleLesson | null;
  slides: SimpleSlide[];
  totalSlides: number;
  completedSlides: number;
  generationProgress: Map<string, number>;
}

export interface GenerationStats {
  totalSlides: number;
  completedSlides: number;
  failedSlides: number;
  startTime: Date;
  endTime: Date;
  totalTimeMs: number;
  duration: number; // Keep for backward compatibility
  averageTimePerSlide: number;
  errors: string[];
}

// === Factory для створення API адаптера ===
export class TemplateAPIAdapterFactory {
  static create(slideStore: SlideStore): TemplateAPIAdapter {
    return new TemplateAPIAdapter(slideStore);
  }

  static createWithNewStore(): { adapter: TemplateAPIAdapter; store: SlideStore } {
    const store = new SlideStore({
      logging: { enabled: true, level: 'info' },
      persistence: { enabled: false, key: 'template-generation' }
    });
    
    const adapter = new TemplateAPIAdapter(store);
    
    return { adapter, store };
  }
}
