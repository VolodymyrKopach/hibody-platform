import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { EnhancedIntentDetectionResult } from '../../intent/GeminiIntentService';
import { GeminiContentService } from '../../content/GeminiContentService';

// Handler for editing lesson plans based on user feedback
export class EditPlanHandler implements IIntentHandler {
  private contentService: GeminiContentService | null = null;

  private getContentService(): GeminiContentService {
    if (!this.contentService) {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key required for content generation (GEMINI_API_KEY)');
      }
      this.contentService = new GeminiContentService();
    }
    return this.contentService;
  }
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    // Handle EDIT_PLAN intent only when there's an existing plan to edit
    return intent.intent === UserIntent.EDIT_PLAN && 
           conversationHistory?.step === 'planning' &&
           !!conversationHistory?.planningResult;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    if (!conversationHistory?.planningResult) {
      return {
        success: false,
        message: 'No lesson plan found to edit. Please create a lesson plan first.',
        error: 'No existing plan to edit'
      };
    }

    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    const editInstruction = enhancedIntent.parameters.rawMessage || enhancedIntent.parameters.instruction || '';
    const currentPlan = conversationHistory.planningResult;
    const topic = conversationHistory.lessonTopic || 'lesson';
    const age = conversationHistory.lessonAge || '6-8 years';

    try {
      console.log('🔧 EditPlanHandler: Processing plan edit request');
      console.log(`📝 Edit instruction: "${editInstruction}"`);
      console.log(`🎯 Current topic: ${topic}, Age: ${age}`);

      // Use conversation context if available for better editing
      let conversationContext = '';
      if (conversationHistory.conversationContext) {
        conversationContext = conversationHistory.conversationContext;
        console.log(`📝 [EDIT PLAN] Using conversation context: ${conversationContext.length} chars`);
      }
      
      // Generate updated plan using Gemini 2.5 Flash with edit instructions
      const updatedPlan = await this.getContentService().editLessonPlan(
        currentPlan,
        editInstruction,
        topic,
        age,
        'en', // Always use English
        conversationContext
      );

      console.log('✅ Lesson plan updated successfully');

      // Generate summary of changes made
      const changesSummary = await this.getContentService().summarizePlanChanges(
        currentPlan,
        updatedPlan,
        editInstruction,
        'en' // Always use English
      );

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        step: 'planning', // Keep in planning step for further edits
        planningResult: updatedPlan,
        totalSlides: this.extractSlideCount(updatedPlan),
        originalMessage: intent.parameters.rawMessage,
        // Keep existing lesson metadata
        lessonTopic: topic,
        lessonAge: age
      };

      // Format response message with changes summary
      const responseMessage = this.formatEditResponse(updatedPlan, changesSummary, 'en');

      return {
        success: true,
        message: responseMessage,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'approve_plan',
            label: '✅ Approve updated plan',
            description: 'Approve the updated plan and proceed to slide creation'
          },
          {
            action: 'edit_plan_more',
            label: '🔧 Make more changes',
            description: 'Make additional changes to the plan'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to edit lesson plan:', error);
      
      return {
        success: false,
        message: `Sorry, an error occurred while editing the plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractSlideCount(planText: string): number {
    // Extract number of slides from the updated plan
    const slideMatches = planText.match(/##\s+Слайд\s+\d+/gi) || 
                        planText.match(/##\s+Slide\s+\d+/gi) ||
                        planText.match(/слайд\s+\d+/gi) || 
                        planText.match(/slide\s+\d+/gi);
    
    if (slideMatches) {
      // Extract the highest slide number
      const numbers = slideMatches.map(match => {
        const num = match.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      });
      return Math.max(...numbers);
    }
    
    return 3; // Default fallback
  }

  private formatEditResponse(updatedPlan: string, changesSummary: string, language: string): string {
    const header = '🔧 **Lesson plan updated!**\n\n';
    const changesHeader = '📋 **Changes made:**\n';
    const planHeader = '\n📚 **Updated lesson plan:**\n\n';
    
    return `${header}${changesHeader}${changesSummary}${planHeader}${updatedPlan}`;
  }
}
