import { type ConversationHistory, type ChatResponse } from '../types';
import { type SlideDescription, type SlideGenerationProgress, type SimpleLesson, type SimpleSlide } from '@/types/chat';
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
    let lesson = this.lessonManagementService.createLesson(
      history.lessonTopic || 'New Lesson',
      history.lessonAge || '8-9 years'
    );

    console.log('🎯 Starting synchronous slide generation - waiting for all slides to complete');

    try {
      // Generate all slides synchronously and wait for completion
      const generatedSlides = await this.generateAllSlidesSync(slideDescriptions, history, lesson);
      
      // Add all generated slides to the lesson (capture the returned lesson)
      for (const slide of generatedSlides) {
        lesson = this.lessonManagementService.addSlideToLesson(lesson, slide);
      }

      console.log(`🎉 All slides generated successfully! Generated ${generatedSlides.length} slides`);

      const newConversationHistory: ConversationHistory = {
        ...history,
        step: 'bulk_generation',
        slideDescriptions,
        slideGenerationProgress: slideDescriptions.map(desc => ({
          slideNumber: desc.slideNumber,
          title: desc.title,
          status: 'completed',
          progress: 100
        })),
        bulkGenerationStartTime: new Date(),
        isGeneratingAllSlides: false, // Generation is now complete
        currentLesson: lesson
      };

      return {
        success: true,
        message: `🎉 **Lesson generation completed!**

📚 **Generated ${generatedSlides.length} slides:**
${generatedSlides.map((slide: SimpleSlide, index: number) => {
  // Remove duration from title (e.g., "Introduction (5 minutes)" -> "Introduction")
  const titleWithoutDuration = slide.title.replace(/\s*\(?\d+\s*minutes?\)?\s*$/i, '').replace(/\s*-.*?\d+\s*minutes?\s*$/i, '');
  return `${index + 1}. ${titleWithoutDuration}`;
}).join('\n')}

✨ Your lesson is ready! Check the slide panel to view and edit your slides.`,
        conversationHistory: newConversationHistory,
        lesson: lesson, // Return lesson with generated slides
        actions: []
      };

    } catch (error) {
      console.error('❌ Error generating slides:', error);
      
      return {
        success: false,
        message: `❌ **Slide generation failed**\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
        conversationHistory: history,
        error: error instanceof Error ? error.message : 'Unknown error',
        actions: []
      };
    }
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

  // Synchronous slide generation - waits for all slides to complete
  private async generateAllSlidesSync(
    slideDescriptions: SlideDescription[],
    history: ConversationHistory,
    lesson: SimpleLesson
  ): Promise<SimpleSlide[]> {
    const planText = history.planningResult || '';
    const topic = history.lessonTopic || 'lesson';
    const age = history.lessonAge || '6-8 years';

    if (!planText) {
      throw new Error('No lesson plan available for slide generation');
    }

    console.log('🎯 Generating slides from lesson plan synchronously');
    
    // Generate slides from the actual lesson plan content
    const slides = await this.slideGenerationService.generateSlidesFromPlan(
      planText,
      topic,
      age
    );

    return slides;
  }

  private async generateAllSlidesAsync(
    slideDescriptions: SlideDescription[],
    history: ConversationHistory,
    lesson: SimpleLesson,
    sessionId: string
  ): Promise<void> {
    try {
      // Use the sequential API route which has proper SSE integration
      const planText = history.planningResult || '';
      const topic = history.lessonTopic || 'lesson';
      const age = history.lessonAge || '6-8 years';

      if (!planText) {
        console.error('❌ No lesson plan available for slide generation');
        return;
      }

      console.log('🎯 Starting content-driven slide generation via API route');
      
      // Call the sequential API route which handles SSE communication
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/generation/slides/sequential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideDescriptions,
          lesson,
          topic,
          age,
          sessionId,
          planText
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.lesson) {
        // Add slides to the lesson object (capture the returned lesson)
        for (const slide of result.lesson.slides) {
          lesson = this.lessonManagementService.addSlideToLesson(lesson, slide);
        }

        console.log(`🎉 API Generation completed! ${result.lesson.slides.length} slides generated from lesson plan`);

        // The SSE system (via sessionId) will handle sending the completion message to the frontend
        // No need for manual callback here since the frontend should be listening to SSE events
        
      } else {
        throw new Error(result.error || 'Unknown API error');
      }

    } catch (error) {
      console.error('❌ Error in async slide generation via API:', error);
      
      // Still send error message via callback if available (fallback)
      if (this.onMessageCallback) {
        const errorMessage = {
          id: `msg_${Date.now()}`,
          text: `❌ **Slide generation failed**\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
          sender: 'ai' as const,
          timestamp: new Date(),
          status: 'delivered' as const,
          feedback: null
        };

        this.onMessageCallback(errorMessage);
      }
    }
  }

  // Add a callback mechanism to send messages back to the frontend
  private onMessageCallback?: (message: any) => void;

  setMessageCallback(callback: (message: any) => void) {
    this.onMessageCallback = callback;
  }
} 