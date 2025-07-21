import { type ConversationHistory, type ChatResponse } from '../types';
import { type SlideDescription, type SlideGenerationProgress, type SimpleLesson } from '@/types/chat';
import { HelpHandler } from '../handlers/HelpHandler';
import { 
  IActionHandlerService,
  ISlideGenerationService,
  ISlideEditingService,
  ILessonManagementService,
  ISlideAnalysisService
} from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Action Handling ===
export class ActionHandlerService implements IActionHandlerService {
  constructor(
    private slideGenerationService: ISlideGenerationService,
    private slideEditingService: ISlideEditingService,
    private lessonManagementService: ILessonManagementService,
    private slideAnalysisService: ISlideAnalysisService
  ) {}

  async handleAction(action: string, history?: ConversationHistory, intent?: any): Promise<ChatResponse> {
    switch (action) {
      case 'approve_plan':
        return await this.handleApprovePlan(history);
      
      case 'edit_plan':
        return await this.handleEditPlanAction(history);

      case 'regenerate_slide':
        return await this.handleRegenerateSlide(history, intent);
        
      case 'help':
        const helpHandler = new HelpHandler();
        return await helpHandler.handle(intent || { intent: 'help', language: 'uk' });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async handleApprovePlan(history?: ConversationHistory): Promise<ChatResponse> {
    if (!history?.planningResult) {
      throw new Error('No plan to approve');
    }

    const slideDescriptions = this.slideAnalysisService.extractSlideDescriptions(history.planningResult);
    const lesson = this.lessonManagementService.createLesson(
      history.lessonTopic || 'Новий урок',
      history.lessonAge || '8-9 років'
    );

    const initialProgress: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
      slideNumber: desc.slideNumber,
      title: desc.title,
      status: 'pending',
      progress: 0
    }));

    const newConversationHistory: ConversationHistory = {
      ...history,
      step: 'bulk_generation',
      slideDescriptions,
      slideGenerationProgress: initialProgress,
      bulkGenerationStartTime: new Date(),
      isGeneratingAllSlides: true,
      currentLesson: lesson
    };

    // Start async generation
    this.generateAllSlidesAsync(slideDescriptions, history, lesson);

    return {
      success: true,
      message: `🎨 **Розпочинаємо генерацію всіх слайдів!**

📊 **План генерації:**
${slideDescriptions.map(desc => `${desc.slideNumber}. ${desc.title}`).join('\n')}

⏳ **Прогрес:** Генерується ${slideDescriptions.length} слайд(ів)...`,
      conversationHistory: newConversationHistory,
      actions: [
        {
          action: 'cancel_generation',
          label: '⏹️ Скасувати генерацію',
          description: 'Зупинити процес генерації слайдів'
        }
      ],
      lesson: lesson
    };
  }

  private async handleEditPlanAction(history?: ConversationHistory): Promise<ChatResponse> {
    if (!history) {
      throw new Error('No conversation history for plan editing');
    }

    const newConversationHistory: ConversationHistory = {
      ...history,
      step: 'plan_editing'
    };

    return {
      success: true,
      message: `Напишіть які зміни хочете внести до плану. Наприклад:
        
- "Додай слайд про літаючих динозаврів"
- "Зміни вік дітей на 8 років"  
- "Зроби урок коротшим - 4 слайди"
- "Додай більше ігор"`,
      conversationHistory: newConversationHistory,
      actions: []
    };
  }

  private async handleRegenerateSlide(history?: ConversationHistory, intent?: any): Promise<ChatResponse> {
    if (!history?.currentLesson) {
      return {
        success: false,
        message: `❌ **Помилка регенерації**

Не знайдено урок для регенерації слайдів.`,
        conversationHistory: history,
        error: 'No lesson context for slide regeneration'
      };
    }

    const slideNumber = intent?.parameters?.slideNumber || history.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > history.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка регенерації**

Слайд ${slideNumber} не існує.`,
        conversationHistory: history,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = history.currentLesson.slides[slideNumber - 1];
      const regeneratedSlide = await this.slideEditingService.regenerateSlide(
        currentSlide,
        history.lessonTopic || 'урок',
        history.lessonAge || '6-8 років'
      );

      // Update lesson with regenerated slide
      const updatedSlides = history.currentLesson.slides.map((slide, index) => 
        index === slideNumber - 1 ? regeneratedSlide : slide
      );

      const updatedLesson = this.lessonManagementService.updateLesson(history.currentLesson, {
        slides: updatedSlides
      });

      const detectedChanges = this.slideAnalysisService.analyzeSlideChanges(
        currentSlide, 
        regeneratedSlide.htmlContent || '', 
        'Повна регенерація слайду'
      );

      return {
        success: true,
        message: `🔄 **Слайд ${slideNumber} перегенеровано!**

📋 **Детальний звіт про зміни:**
${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...history,
          currentLesson: updatedLesson,
          currentSlideIndex: slideNumber
        },
        actions: [
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${slideNumber + 1}`
          },
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати ще раз',
            description: `Створити ще один варіант слайду ${slideNumber}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 Виникла помилка при перегенерації слайду ${slideNumber}.`,
        conversationHistory: history,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateAllSlidesAsync(
    slideDescriptions: SlideDescription[],
    history: ConversationHistory,
    lesson: SimpleLesson
  ): Promise<void> {
    try {
      const result = await this.slideGenerationService.generateAllSlides(
        slideDescriptions,
        history.lessonTopic || 'урок',
        history.lessonAge || '6-8 років'
      );

      // Add slides to lesson
      for (const slide of result.slides) {
        this.lessonManagementService.addSlideToLesson(lesson, slide);
      }

      console.log(`🎉 Generation completed! ${result.completedSlides}/${result.totalSlides} slides generated`);
    } catch (error) {
      console.error('❌ Error in async slide generation:', error);
    }
  }
} 