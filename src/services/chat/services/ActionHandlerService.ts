import { type ConversationHistory, type ChatResponse } from '../types';
import { type SlideDescription, type SlideGenerationProgress, type SimpleLesson, type SimpleSlide } from '@/types/chat';

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

    console.log('🚀 Starting PARALLEL slide generation using single slide endpoint');

    // Initialize progress tracking
    const sessionId = `parallel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    // Return minimal response - actual generation will happen client-side
    return {
      success: true,
      message: `✅ **Plan approved!** Starting slide generation...`,
      conversationHistory: newConversationHistory,
      lesson: lesson,
      sessionId: sessionId, // Pass sessionId for client-side tracking
      actions: []
    };
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