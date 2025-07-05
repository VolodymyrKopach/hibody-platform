import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Обробка запитів допомоги
export class HelpHandler implements IIntentHandler {
  
  canHandle(intent: IntentDetectionResult): boolean {
    return intent.intent === UserIntent.HELP;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    const helpMessage = this.generateHelpMessage(intent.language);

    return {
      success: true,
      message: helpMessage,
      conversationHistory,
      actions: []
    };
  }

  private generateHelpMessage(language: string): string {
    switch (language) {
      case 'uk':
        return `🎓 **Як користуватися HiBody платформою:**

**Створення уроків:**
• "Створи урок про [тема] для дітей [вік] років"
• "Зроби урок математики про додавання"

**Редагування:**
• "Покращ слайд 2"
• "Заміни слово 'кіт' на 'собака'"
• "Додай слайд про [тема]"

**Керування слайдами:**
• "Перегенеруй слайд 3"
• "Зроби слайд яскравішим"

**Експорт:**
• "Експортуй урок"
• "Покажи урок"

**Поради:**
✨ Будьте конкретними в описах
🎨 Вказуйте вік дітей для кращого результату
📚 Можете створювати уроки з будь-якої теми`;

      case 'en':
        return `🎓 **How to use HiBody platform:**

**Creating lessons:**
• "Create lesson about [topic] for [age] year old children"
• "Make math lesson about addition"

**Editing:**
• "Improve slide 2"
• "Replace word 'cat' with 'dog'"
• "Add slide about [topic]"

**Managing slides:**
• "Regenerate slide 3"
• "Make slide more colorful"

**Export:**
• "Export lesson"
• "Preview lesson"

**Tips:**
✨ Be specific in descriptions
🎨 Specify children's age for better results
📚 You can create lessons on any topic`;

      default:
        return `🎓 **HiBody platform help available in:**
• Ukrainian - "допоможи"
• English - "help"
• Russian - "помощь"`;
    }
  }
} 