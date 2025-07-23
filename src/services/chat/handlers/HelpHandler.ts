import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Handling help requests
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
        return `🎓 **Як користуватися HiBody платформою:**\n\n**Створення уроків:**\n• "Створи урок про [тема] для дітей [вік] років"\n• "Зроби урок математики про додавання"\n\n**Редагування:**\n• "Покращ слайд 2"\n• "Заміни слово \'кіт\' на \'собака\'"\n• "Додай слайд про [тема]"\n\n**Керування слайдами:**\n• "Перегенеруй слайд 3"\n• "Зроби слайд яскравішим"\n\n**Експорт:**\n• "Експортуй урок"\n• "Покажи урок"\n\n**Поради:**\n✨ Будьте конкретними в описах\n🎨 Вказуйте вік дітей для кращого результату\n📚 Можете створювати уроки з будь-якої теми`;

      case 'en':
        return `🎓 **How to use HiBody platform:**\n\n**Creating lessons:**\n• "Create lesson about [topic] for [age] year old children"\n• "Make math lesson about addition"\n\n**Editing:**\n• "Improve slide 2"\n• "Replace word \'cat\' with \'dog\'"\n• "Add slide about [topic]"\n\n**Managing slides:**\n• "Regenerate slide 3"\n• "Make slide more colorful"\n\n**Export:**\n• "Export lesson"\n• "Preview lesson"\n\n**Tips:**\n✨ Be specific in descriptions\n🎨 Specify children\'s age for better results\n📚 You can create lessons on any topic`;

      default:
        return `🎓 **HiBody platform help available in:**\n• Ukrainian - "допоможи"\n• English - "help"\n• Russian - "помощь"`;
    }
  }
} 