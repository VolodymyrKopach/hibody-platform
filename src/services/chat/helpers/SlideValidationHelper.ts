import { ConversationHistory, ChatResponse } from '../types';
import { AIClarificationService } from '../services/AIClarificationService';

export type SlideOperation = 'edit' | 'improve' | 'regenerate' | 'batch_edit';

export interface SlideValidationContext {
  conversationHistory?: ConversationHistory;
  intentResult?: any;
  operation: SlideOperation;
}

/**
 * Helper для валідації слайдів та генерації дружніх повідомлень
 * Виносить повторювану логіку з ChatService
 */
export class SlideValidationHelper {
  constructor(private clarificationService: AIClarificationService) {}

  /**
   * Перевіряє чи є урок в контексті
   */
  async validateLessonContext(context: SlideValidationContext): Promise<ChatResponse | null> {
    if (!context.conversationHistory?.currentLesson) {
      return await this.generateClarification('missing_lesson_context', {
        operation: context.operation,
        userMessage: context.intentResult?.parameters?.rawMessage
      }, context.conversationHistory);
    }
    return null;
  }

  /**
   * Перевіряє чи вказано номер слайду для множинних слайдів
   */
  async validateSlideSelection(
    slideNumber: number | undefined, 
    context: SlideValidationContext
  ): Promise<ChatResponse | null> {
    const lesson = context.conversationHistory?.currentLesson;
    if (!lesson) return null;

    // Потрібен явний номер для множинних слайдів
    if (!slideNumber && lesson.slides.length > 1) {
      return await this.generateClarification('unclear_slide_selection', {
        operation: context.operation,
        availableSlides: lesson.slides.length,
        slidesList: this.buildSlidesList(lesson.slides),
        userMessage: context.intentResult?.parameters?.rawMessage,
        lessonTopic: context.conversationHistory?.lessonTopic
      }, context.conversationHistory);
    }
    return null;
  }

  /**
   * Перевіряє чи валідний номер слайду
   */
  async validateSlideNumber(
    slideNumber: number, 
    context: SlideValidationContext
  ): Promise<ChatResponse | null> {
    const lesson = context.conversationHistory?.currentLesson;
    if (!lesson) return null;

    if (slideNumber < 1 || slideNumber > lesson.slides.length) {
      return await this.generateClarification('invalid_slide_number', {
        operation: context.operation,
        requestedSlide: slideNumber,
        availableSlides: lesson.slides.length,
        slidesList: this.buildSlidesList(lesson.slides),
        userMessage: context.intentResult?.parameters?.rawMessage,
        lessonTopic: context.conversationHistory?.lessonTopic
      }, context.conversationHistory);
    }
    return null;
  }

  /**
   * Повна валідація слайду: контекст + селекція + номер
   */
  async validateSlideAccess(
    slideNumber: number | undefined,
    context: SlideValidationContext
  ): Promise<{ error?: ChatResponse; finalSlideNumber?: number }> {
    // 1. Перевіряємо контекст уроку
    const lessonError = await this.validateLessonContext(context);
    if (lessonError) return { error: lessonError };

    // 2. Перевіряємо селекцію слайду
    const selectionError = await this.validateSlideSelection(slideNumber, context);
    if (selectionError) return { error: selectionError };

    // 3. Визначаємо фінальний номер слайду
    const finalSlideNumber = slideNumber ?? 1;

    // 4. Перевіряємо валідність номера
    const numberError = await this.validateSlideNumber(finalSlideNumber, context);
    if (numberError) return { error: numberError };

    return { finalSlideNumber };
  }

  /**
   * Генерує дружнє уточнення
   */
  private async generateClarification(
    scenario: 'invalid_slide_number' | 'missing_lesson_context' | 'unclear_slide_selection',
    context: {
      operation: SlideOperation;
      requestedSlide?: number;
      availableSlides?: number;
      slidesList?: Array<{ title: string; id: string | number }>;
      userMessage?: string;
      lessonTopic?: string;
    },
    conversationHistory?: ConversationHistory
  ): Promise<ChatResponse> {
    try {
      const clarification = await this.clarificationService.generateClarification(scenario, context);
      
      return {
        success: true, // Це НЕ помилка, а уточнення
        message: clarification,
        conversationHistory,
        actions: []
      };
    } catch (error) {
      console.error('❌ [SLIDE VALIDATION] Failed to generate clarification:', error);
      
      // Fallback до вбудованих шаблонів сервісу
      const fallbackClarification = await this.clarificationService.generateClarification(scenario, context);
      
      return {
        success: true,
        message: fallbackClarification,
        conversationHistory,
        actions: []
      };
    }
  }

  /**
   * Будує список слайдів для відображення
   */
  private buildSlidesList(slides: any[]): Array<{ title: string; id: number }> {
    return slides.map((slide: any, index: number) => ({
      title: slide.title || `Slide ${index + 1}`,
      id: index + 1
    }));
  }
}
