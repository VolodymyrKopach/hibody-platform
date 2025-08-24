import { ParallelSlideGenerationService, ParallelGenerationCallbacks, GenerationStats } from '@/services/chat/ParallelSlideGenerationService';
import { SlideStore } from '@/stores/SlideStore';
import { PlanParser } from '@/utils/planParser';
import { TemplateData } from '@/types/templates';
import { SlideDescription, SimpleLesson, SimpleSlide, SlideGenerationProgress } from '@/types/chat';

/**
 * Адаптер для інтеграції template flow з існуючими сервісами генерації слайдів
 * Зв'язує template систему з chat-based генерацією
 */
export class TemplateGenerationAdapter {
  private parallelService: ParallelSlideGenerationService;
  private slideStore: SlideStore;

  constructor(slideStore: SlideStore) {
    this.parallelService = new ParallelSlideGenerationService();
    this.slideStore = slideStore;
  }

  /**
   * Головний метод для запуску генерації слайдів з template flow
   */
  async startTemplateGeneration(
    generatedPlan: string,
    templateData: TemplateData,
    callbacks?: TemplateGenerationCallbacks
  ): Promise<TemplateGenerationResult> {
    console.log('🎨 [TemplateAdapter] Starting template-based slide generation', {
      templateData,
      planLength: generatedPlan.length
    });

    try {
      // === STEP 1: Парсинг markdown плану ===
      const slideDescriptions = this.parseMarkdownPlan(generatedPlan, templateData.slideCount);
      console.log('📄 [TemplateAdapter] Parsed slide descriptions:', slideDescriptions.length);

      // === STEP 2: Ініціалізація уроку ===
      const lesson = this.initializeLesson(templateData, slideDescriptions);
      console.log('📚 [TemplateAdapter] Initialized lesson:', lesson.id);

      // === STEP 3: Налаштування SlideStore ===
      this.setupSlideStore(lesson);

      // === STEP 4: Запуск паралельної генерації ===
      const stats = await this.runParallelGeneration(
        slideDescriptions,
        templateData,
        lesson,
        callbacks
      );

      console.log('✅ [TemplateAdapter] Generation completed successfully', stats);

      return {
        success: true,
        lesson,
        stats,
        slideDescriptions
      };

    } catch (error) {
      console.error('❌ [TemplateAdapter] Generation failed:', error);
      
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
        console.warn('⚠️ [TemplateAdapter] Plan parsing validation warnings:', validation.errors);
      }

      // Статистика парсингу
      const stats = PlanParser.getParsingStats(slideDescriptions);
      console.log('📊 [TemplateAdapter] Parsing stats:', stats);

      return slideDescriptions;

    } catch (error) {
      console.error('❌ [TemplateAdapter] Failed to parse plan:', error);
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
      slides: [], // Слайди будуть додаватися під час генерації
      metadata: {
        generatedFrom: 'template',
        originalSlideCount: templateData.slideCount,
        templateData
      }
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
    
    console.log('🏪 [TemplateAdapter] SlideStore configured for template generation');
  }

  /**
   * Запуск паралельної генерації з callbacks
   */
  private async runParallelGeneration(
    slideDescriptions: SlideDescription[],
    templateData: TemplateData,
    lesson: SimpleLesson,
    callbacks?: TemplateGenerationCallbacks
  ): Promise<GenerationStats> {
    
    // Створюємо callbacks для ParallelSlideGenerationService
    const parallelCallbacks: ParallelGenerationCallbacks = {
      onSlideReady: (slide: SimpleSlide, updatedLesson: SimpleLesson) => {
        console.log(`🎨 [TemplateAdapter] Slide ready: ${slide.title}`);
        
        // Оновлюємо SlideStore
        this.slideStore.actions.addSlide(slide);
        this.slideStore.actions.updateLesson({
          slides: updatedLesson.slides,
          updatedAt: new Date()
        });

        // Автоматично відкриваємо панель слайдів для першого слайду
        const currentState = this.slideStore.getState();
        if ((currentState.slides?.length || 0) === 1 && !currentState.slidePanelOpen) {
          this.slideStore.actions.setSlidePanelOpen(true);
          console.log('📱 [TemplateAdapter] Auto-opened slide panel for first slide');
        }

        // Викликаємо template callback
        callbacks?.onSlideReady?.(slide, updatedLesson);
      },

      onProgressUpdate: (progress: SlideGenerationProgress[]) => {
        console.log('📊 [TemplateAdapter] Progress update:', progress.length, 'slides');
        
        // Оновлюємо прогрес в SlideStore
        progress.forEach(p => {
          this.slideStore.actions.setSlideGenerationProgress(
            `slide_${p.slideNumber}`, 
            p.progress
          );
        });

        // Викликаємо template callback
        callbacks?.onProgressUpdate?.(progress);
      },

      onError: (error: string, slideNumber: number) => {
        console.error(`❌ [TemplateAdapter] Slide ${slideNumber} generation failed:`, error);
        callbacks?.onSlideError?.(error, slideNumber);
      },

      onComplete: (finalLesson: SimpleLesson, stats: GenerationStats) => {
        console.log('🎉 [TemplateAdapter] All slides generated successfully!', stats);
        
        // Оновлюємо SlideStore
        this.slideStore.actions.setGenerating(false);
        this.slideStore.actions.updateLesson({
          slides: finalLesson.slides,
          updatedAt: new Date()
        });

        // Викликаємо template callback
        callbacks?.onComplete?.(finalLesson, stats);
      }
    };

    // Запускаємо паралельну генерацію
    return await this.parallelService.generateAllSlidesParallel(
      slideDescriptions,
      templateData.topic,
      templateData.ageGroup,
      lesson,
      parallelCallbacks
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
    console.log('🛑 [TemplateAdapter] Stopping generation...');
    this.slideStore.actions.setGenerating(false);
  }

  /**
   * Очищення стану
   */
  cleanup(): void {
    console.log('🧹 [TemplateAdapter] Cleaning up...');
    this.slideStore.actions.reset();
  }
}

// === Типи для TemplateGenerationAdapter ===

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

// === Factory для створення адаптера ===
export class TemplateGenerationAdapterFactory {
  static create(slideStore: SlideStore): TemplateGenerationAdapter {
    return new TemplateGenerationAdapter(slideStore);
  }

  static createWithNewStore(): { adapter: TemplateGenerationAdapter; store: SlideStore } {
    const store = new SlideStore({
      logging: { enabled: true, level: 'info' },
      persistence: { enabled: false, key: 'template-generation' }
    });
    
    const adapter = new TemplateGenerationAdapter(store);
    
    return { adapter, store };
  }
}
