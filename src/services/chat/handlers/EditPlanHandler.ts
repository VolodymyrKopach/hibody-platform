import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { ClaudeSonnetContentService } from '../../content/ClaudeSonnetContentService';

// Single Responsibility: Обробка редагування плану
export class EditPlanHandler implements IIntentHandler {
  private contentService: ClaudeSonnetContentService;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not found in environment variables (CLAUDE_API_KEY)');
    }
    this.contentService = new ClaudeSonnetContentService(apiKey);
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
        message: `🤔 Схоже, ви хочете покращити план уроку, але наразі немає активного плану.

💡 **Давайте створимо новий план!** Скажіть мені:
• Про що має бути урок? (тема)
• Для якого віку дітей? (вік)

**Приклад:** "Створи урок про динозаврів для дітей 6 років"`,
        conversationHistory: undefined,
        actions: []
      };
    }

    console.log('🔧 Processing plan modifications with Claude Sonnet...');
    
    try {
      // Витягуємо зміни з повідомлення користувача
      const userChanges = this.extractChangesFromMessage(intent.parameters.rawMessage);
      
      // Генеруємо оновлений план з Claude Sonnet
      const updatedPlan = await this.contentService.generateEditedPlan(
        conversationHistory.planningResult!,
        userChanges,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        step: 'planning',
        planningResult: updatedPlan
      };

      return {
        success: true,
        message: `✨ **План оновлено з використанням Claude Sonnet!**

${updatedPlan}`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'approve_plan',
            label: '✅ Схвалити план і генерувати слайди',
            description: 'Схвалити оновлений план і почати створення слайдів'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Error updating plan with Claude:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при оновленні плану. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}

💡 **Альтернатива:** Спробуйте переформулювати ваші зміни або створити новий план.`,
        conversationHistory,
        actions: []
      };
    }
  }

  private extractChangesFromMessage(rawMessage: string): string {
    // Видаляємо префікс якщо він є
    const cleanMessage = rawMessage.replace(/^Внести наступні зміни до плану:\s*/i, '');
    return cleanMessage.trim();
  }


} 