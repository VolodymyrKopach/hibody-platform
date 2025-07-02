import { IIntentHandler, ChatHandlerResult, ConversationHistory } from './IIntentHandler';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Обробка редагування плану
export class EditPlanHandler implements IIntentHandler {
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    return conversationHistory?.step === 'plan_editing';
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatHandlerResult> {
    if (!conversationHistory) {
      throw new Error('Conversation history required for plan editing');
    }

    console.log('🔧 Processing plan modifications...');
    
    // Simulate AI processing time for plan modification
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updatedPlan = conversationHistory.planningResult + `

**🔄 ОНОВЛЕННЯ:** ${intent.parameters.rawMessage}`;

    const newConversationHistory: ConversationHistory = {
      ...conversationHistory,
      step: 'planning',
      planningResult: updatedPlan
    };

    return {
      success: true,
      message: `План оновлено згідно з вашими побажаннями:

${updatedPlan}`,
      conversationHistory: newConversationHistory,
      actions: [
        {
          action: 'approve_plan',
          label: '✅ Генерувати перший слайд',
          description: 'Схвалити оновлений план'
        },
        {
          action: 'edit_plan',
          label: '✏️ Редагувати ще',
          description: 'Внести додаткові зміни'
        }
      ]
    };
  }
} 