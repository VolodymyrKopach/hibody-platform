import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Обробка невідомих намірів
export class FallbackHandler implements IIntentHandler {
  
  canHandle(intent: IntentDetectionResult): boolean {
    return intent.intent === UserIntent.FREE_CHAT || intent.confidence < 0.5;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    // Detect if this is a friendly chat or unknown request
    const isFriendlyChat = intent.intent === UserIntent.FREE_CHAT && intent.confidence >= 0.7;
    
    const message = isFriendlyChat 
      ? this.generateFriendlyResponse(intent.language)
      : this.generateFallbackMessage(intent.language);

    return {
      success: true,
      message,
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

  private generateFriendlyResponse(language: string): string {
    switch (language) {
      case 'uk':
        return `👋 Привіт!

Я - ваш асистент для створення інтерактивних уроків для дітей. 

🎯 **Що я можу:**
• Створювати освітні уроки для різних вікових груп
• Генерувати цікаві слайди з активностями
• Адаптувати матеріал під конкретний вік дитини

**Почнемо?** Напишіть, наприклад:
• "Створи урок про тварин для дітей 5 років"
• "Зроби урок математики про додавання"`;

      case 'en':
        return `👋 Hello!

I'm your assistant for creating interactive lessons for children.

🎯 **What I can do:**
• Create educational lessons for different age groups
• Generate engaging slides with activities
• Adapt content to specific child's age

**Let's start?** Try typing:
• "Create lesson about animals for 5 year old children"
• "Make math lesson about addition"`;

      default:
        return `👋 Hello! Привіт! Привет!

I'm your multilingual assistant for creating children's lessons.

🌍 **Languages supported:**
• Ukrainian: "Створи урок про..."
• English: "Create lesson about..."
• Russian: "Создай урок о..."

Ready to create something amazing? ✨`;
    }
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