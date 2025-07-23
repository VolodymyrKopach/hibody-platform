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
      history.lessonTopic || 'New Lesson',
      history.lessonAge || '8-9 years'
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
      message: `🎨 **Starting generation of all slides!**

📊 **Generation plan:**
${slideDescriptions.map(desc => `${desc.slideNumber}. ${desc.title}`).join('\n')}

⏳ **Progress:** Generating ${slideDescriptions.length} slide(s)...`,
      conversationHistory: newConversationHistory,
      actions: [
        {
          action: 'cancel_generation',
          label: '⏹️ Cancel generation',
          description: 'Stop the slide generation process'
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
      message: `Write what changes you want to make to the plan. For example:
        
- "Add a slide about flying dinosaurs"
- "Change the children's age to 8 years"  
- "Make the lesson shorter - 4 slides"
- "Add more games"`,
      conversationHistory: newConversationHistory,
      actions: []
    };
  }

  private async handleRegenerateSlide(history?: ConversationHistory, intent?: any): Promise<ChatResponse> {
    if (!history?.currentLesson) {
      return {
        success: false,
        message: `❌ **Regeneration error**

No lesson found for slide regeneration.`,
        conversationHistory: history,
        error: 'No lesson context for slide regeneration'
      };
    }

    const slideNumber = intent?.parameters?.slideNumber || history.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > history.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Regeneration error**

Slide ${slideNumber} does not exist.`,
        conversationHistory: history,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = history.currentLesson.slides[slideNumber - 1];
      const regeneratedSlide = await this.slideEditingService.regenerateSlide(
        currentSlide,
        history.lessonTopic || 'lesson',
        history.lessonAge || '6-8 years'
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
        'Complete slide regeneration'
      );

      return {
        success: true,
        message: `🔄 **Slide ${slideNumber} regenerated!**

📋 **Detailed change report:**
${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...history,
          currentLesson: updatedLesson,
          currentSlideIndex: slideNumber
        },
        actions: [
          {
            action: 'generate_next_slide',
            label: '▶️ Next slide',
            description: `Generate slide ${slideNumber + 1}`
          },
          {
            action: 'regenerate_slide',
            label: '🔄 Regenerate again',
            description: `Create another version of slide ${slideNumber}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 An error occurred while regenerating slide ${slideNumber}.`,
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
        history.lessonTopic || 'lesson',
        history.lessonAge || '6-8 years'
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