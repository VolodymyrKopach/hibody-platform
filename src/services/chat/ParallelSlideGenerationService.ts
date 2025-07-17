import { GeminiContentService } from '@/services/content/GeminiContentService';
import { SlideDescription, SlideGenerationProgress, SimpleSlide, SimpleLesson } from '@/types/chat';

export interface ParallelGenerationCallbacks {
  onSlideReady: (slide: SimpleSlide, lesson: SimpleLesson) => void;
  onProgressUpdate: (progress: SlideGenerationProgress[]) => void;
  onError: (error: string, slideNumber: number) => void;
  onComplete: (lesson: SimpleLesson, stats: GenerationStats) => void;
}

export interface GenerationStats {
  totalSlides: number;
  completedSlides: number;
  failedSlides: number;
  startTime: Date;
  endTime: Date;
  totalTimeMs: number;
}

export class ParallelSlideGenerationService {
  private contentService: GeminiContentService;

  constructor() {
    this.contentService = new GeminiContentService();
  }

  /**
   * Генерує всі слайди ПАРАЛЕЛЬНО з real-time callbacks
   */
  async generateAllSlidesParallel(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    lesson: SimpleLesson,
    callbacks: ParallelGenerationCallbacks
  ): Promise<GenerationStats> {
    const startTime = new Date();
    console.log(`🚀 [PARALLEL] Starting generation of ${slideDescriptions.length} slides...`);

    // Ініціалізуємо прогрес
    const progressState: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
      slideNumber: desc.slideNumber,
      title: desc.title,
      status: 'pending',
      progress: 0
    }));

    callbacks.onProgressUpdate([...progressState]);

    let completedSlides = 0;
    let failedSlides = 0;

    // Створюємо всі промиси відразу (ПАРАЛЕЛЬНА ГЕНЕРАЦІЯ)
    const slidePromises = slideDescriptions.map(async (slideDesc, index) => {
      try {
        console.log(`📄 [PARALLEL] Starting slide ${slideDesc.slideNumber}: "${slideDesc.title}"`);
        
        // Оновлюємо прогрес - почали генерацію
        progressState[index].status = 'generating';
        progressState[index].progress = 25;
        callbacks.onProgressUpdate([...progressState]);

        // Генеруємо HTML контент слайду
        const slideHTML = await this.contentService.generateSlideContent(
          slideDesc.description,
          lessonTopic,
          lessonAge
        );

        // Оновлюємо прогрес - HTML згенеровано
        progressState[index].progress = 75;
        callbacks.onProgressUpdate([...progressState]);

        // Створюємо об'єкт слайду
        const slide: SimpleSlide = {
          id: `slide_${Date.now()}_${slideDesc.slideNumber}_${Math.random().toString(36).substr(2, 9)}`,
          title: slideDesc.title,
          content: slideDesc.description,
          htmlContent: slideHTML,
          type: this.mapSlideTypeToSimple(slideDesc.type),
          status: 'completed'
        };

        // Додаємо слайд до уроку ВІДРАЗУ
        lesson.slides.push(slide);
        lesson.updatedAt = new Date();

        // Оновлюємо прогрес - слайд завершено
        progressState[index].status = 'completed';
        progressState[index].progress = 100;
        progressState[index].htmlContent = slideHTML;
        
        completedSlides++;
        callbacks.onProgressUpdate([...progressState]);

        console.log(`✅ [PARALLEL] Slide ${slideDesc.slideNumber} completed (${completedSlides}/${slideDescriptions.length})`);

        // Викликаємо callback для відображення слайду ВІДРАЗУ
        callbacks.onSlideReady(slide, lesson);

        return slide;

      } catch (error) {
        console.error(`❌ [PARALLEL] Error generating slide ${slideDesc.slideNumber}:`, error);
        
        progressState[index].status = 'error';
        progressState[index].progress = 0;
        progressState[index].error = error instanceof Error ? error.message : 'Unknown error';
        
        failedSlides++;
        callbacks.onProgressUpdate([...progressState]);
        callbacks.onError(error instanceof Error ? error.message : 'Unknown error', slideDesc.slideNumber);

        return null;
      }
    });

    // Чекаємо завершення всіх слайдів
    await Promise.all(slidePromises);

    const endTime = new Date();
    const totalTimeMs = endTime.getTime() - startTime.getTime();

    const stats: GenerationStats = {
      totalSlides: slideDescriptions.length,
      completedSlides,
      failedSlides,
      startTime,
      endTime,
      totalTimeMs
    };

    console.log(`🎉 [PARALLEL] Generation completed in ${totalTimeMs}ms: ${completedSlides}/${slideDescriptions.length} slides`);

    callbacks.onComplete(lesson, stats);

    return stats;
  }

  /**
   * Мапер типів слайдів
   */
  private mapSlideTypeToSimple(type: 'welcome' | 'content' | 'activity' | 'summary'): 'title' | 'content' | 'interactive' | 'summary' {
    switch (type) {
      case 'welcome':
        return 'title';
      case 'content':
        return 'content';
      case 'activity':
        return 'interactive';
      case 'summary':
        return 'summary';
      default:
        return 'content';
    }
  }
} 