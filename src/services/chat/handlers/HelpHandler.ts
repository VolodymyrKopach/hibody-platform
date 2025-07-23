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
    // Use English as the universal help language
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
  }
} 