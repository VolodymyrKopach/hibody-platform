import { IIntentHandler, ChatHandlerResult, ConversationHistory } from './IIntentHandler';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Обробка невідомих намірів
export class FallbackHandler implements IIntentHandler {
  
  canHandle(intent: IntentDetectionResult): boolean {
    return intent.intent === UserIntent.FREE_CHAT || intent.confidence < 0.5;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatHandlerResult> {
    const fallbackMessage = this.generateFallbackMessage(intent.language);

    return {
      success: true,
      message: fallbackMessage,
      conversationHistory,
      actions: [
        {
          action: 'help',
          label: '❓ Допомога',
          description: 'Показати доступні команди'
        }
      ]
    };
  }

  private generateFallbackMessage(language: string): string {
    switch (language) {
      case 'uk':
        return `🤔 Вибачте, я не зрозумів ваш запит. 

**Спробуйте:**
• "Створи урок про [тема] для дітей [вік] років"
• "Допоможи" - для перегляду всіх команд
• "Покращ слайд [номер]" - для редагування

🎯 **Приклади:**
• "Створи урок про космос для дітей 7 років"
• "Зроби урок математики про віднімання"`;

      case 'en':
        return `🤔 Sorry, I didn't understand your request.

**Try:**
• "Create lesson about [topic] for [age] year old children"
• "Help" - to see all commands
• "Improve slide [number]" - for editing

🎯 **Examples:**
• "Create lesson about space for 7 year old children"
• "Make math lesson about subtraction"`;

      default:
        return `🤔 I understand multiple languages:
• Ukrainian: "Створи урок про..."
• English: "Create lesson about..."
• Russian: "Создай урок о..."

Type "допоможи", "help", or "помощь" for more information.`;
    }
  }
} 