import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { GeminiContentService } from '../../content/GeminiContentService';

// Single Responsibility: Handling plan editing
export class EditPlanHandler implements IIntentHandler {
  private contentService: GeminiContentService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables (GEMINI_API_KEY)');
    }
    this.contentService = new GeminiContentService();
  }
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    return intent.intent === UserIntent.EDIT_PLAN || 
           conversationHistory?.step === 'plan_editing';
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    // Handle case when user wants to edit plan but no conversation history exists
    if (!conversationHistory || !conversationHistory.planningResult) {
      return {
        success: true,
        message: `🤔 It seems you want to improve the lesson plan, but there\'s no active plan yet.\n\n💡 **Let\'s create a new plan!** Tell me:\n• What should the lesson be about? (topic)\n• For what age group? (age)\n\n**Example:** "Create a lesson about dinosaurs for 6-year-old children"`,
        conversationHistory: undefined,
        actions: []
      };
    }

    console.log('🔧 Processing plan modifications with Gemini 2.5 Flash...');
    
    try {
      // Extract changes from user message
      const userChanges = this.extractChangesFromMessage(intent.parameters.rawMessage);
      
      // === PASS CONVERSATION CONTEXT TO PLAN EDITING ===
      const conversationContext = conversationHistory?.conversationContext;
      
      if (conversationContext) {
        console.log(`📝 [EDIT PLAN HANDLER] Using conversation context: ${conversationContext.length} chars`);
      }
      
      // Generate updated plan with Gemini 2.5 Flash, considering conversation context
      const updatedPlan = await this.contentService.generateEditedPlan(
        conversationHistory.planningResult!,
        userChanges,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years',
        conversationContext
      );

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        step: 'planning',
        planningResult: updatedPlan
      };

      return {
        success: true,
        message: `✨ **Plan updated with AI!**\n\n${updatedPlan}`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'approve_plan',
            label: '✅ Approve plan and generate slides',
            description: 'Approve the updated plan and start slide creation'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Error updating plan with Gemini 2.5 Flash:', error);
      
      return {
        success: false,
        message: `😔 An error occurred while updating the plan. Please try again.\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 **Alternative:** Try rephrasing your changes or creating a new plan.`,
        conversationHistory,
        actions: []
      };
    }
  }

  private extractChangesFromMessage(rawMessage: string): string {
    // Remove prefix if present
    const cleanMessage = rawMessage.replace(/^Внести наступні зміни до плану:\s*/i, '');
    return cleanMessage.trim();
  }


} 