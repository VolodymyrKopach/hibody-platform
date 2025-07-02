import { IIntentDetectionService, IntentDetectionResult, UserIntent, IntentParameters } from './IIntentDetectionService';

// Keyword-based fallback service for development
export class KeywordIntentDetectionService implements IIntentDetectionService {
  
  async detectIntent(message: string): Promise<IntentDetectionResult> {
    const lowerMessage = message.toLowerCase();
    
    // Keyword patterns for different intents
    const patterns: Record<UserIntent, string[]> = {
      [UserIntent.CREATE_LESSON]: [
        'створ', 'зроб', 'урок', 'lesson', 'create', 'make',
        'про', 'about', 'тема', 'topic', 'для дітей', 'for children'
      ],
      [UserIntent.HELP]: [
        'допомог', 'help', 'як', 'how', 'що', 'what', 'поясни', 'explain'
      ],
      [UserIntent.FREE_CHAT]: [
        'привіт', 'hello', 'hi', 'дякую', 'thank', 'ок', 'ok'
      ],
      // Add defaults for other intents
      [UserIntent.GENERATE_PLAN]: [],
      [UserIntent.CREATE_SLIDE]: [],
      [UserIntent.CREATE_NEW_SLIDE]: [],
      [UserIntent.REGENERATE_SLIDE]: [],
      [UserIntent.EDIT_HTML_INLINE]: [],
      [UserIntent.EDIT_SLIDE]: [],
      [UserIntent.IMPROVE_HTML]: [],
      [UserIntent.EXPORT]: [],
      [UserIntent.PREVIEW]: []
    };

    // Determine intent based on keywords
    let detectedIntent: UserIntent = UserIntent.FREE_CHAT;
    let confidence = 0.5;

    for (const [intent, keywords] of Object.entries(patterns)) {
      const matchCount = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matchCount > 0) {
        detectedIntent = intent as UserIntent;
        confidence = Math.min(0.9, 0.6 + (matchCount * 0.1));
        break;
      }
    }

    // Extract parameters
    const parameters: IntentParameters = {
      rawMessage: message,
      keywords: this.extractKeywords(lowerMessage)
    };

    // Extract topic if creating lesson
    if (detectedIntent === UserIntent.CREATE_LESSON) {
      const topicMatch = message.match(/про\s+([^,\.!?]+)|about\s+([^,\.!?]+)/i);
      if (topicMatch) {
        parameters.topic = topicMatch[1] || topicMatch[2];
      }
      
      // Extract age
      const ageMatch = message.match(/(\d+)[\s-]*(\d*)\s*(рік|років|year|old)/i);
      if (ageMatch) {
        parameters.age = ageMatch[0];
      }
    }

    return {
      intent: detectedIntent,
      confidence,
      parameters,
      language: this.detectLanguage(message),
      reasoning: 'Keyword-based pattern matching'
    };
  }

  private extractKeywords(message: string): string[] {
    const words = message.split(/\s+/);
    return words.filter(word => word.length > 2);
  }

  private detectLanguage(message: string): 'uk' | 'en' | 'ru' | 'other' {
    const ukKeywords = ['урок', 'для', 'дітей', 'створ', 'про', 'років'];
    const enKeywords = ['lesson', 'for', 'children', 'create', 'about', 'years'];
    
    const ukMatches = ukKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
    const enMatches = enKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
    
    if (ukMatches > enMatches) return 'uk';
    if (enMatches > ukMatches) return 'en';
    return 'other';
  }
}

// Neural-based service that requires API key
export class NeuralIntentDetectionService implements IIntentDetectionService {
  
  async detectIntent(message: string): Promise<IntentDetectionResult> {
    // ВСЕ йде через нейронну мережу - НІЯКИХ regex patterns!
    return await this.detectIntentWithAI(message);
  }

  private async detectIntentWithAI(message: string): Promise<IntentDetectionResult> {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key required - no fallback allowed');
    }

    const prompt = this.buildNeuralPrompt(message);

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('No content in Claude response');
      }

      return this.parseAIResponse(content, message);
    } catch (error) {
      console.error('Neural intent detection error:', error);
      throw new Error('Neural network required - no fallback to regex patterns allowed');
    }
  }

  private buildNeuralPrompt(message: string): string {
    return `Ви - експертна нейронна мережа для аналізу намірів користувачів в освітній платформі HiBody.

КРИТИЧНО ВАЖЛИВО: 
- Аналізуйте ТІЛЬКИ семантичний зміст повідомлення
- НЕ використовуйте pattern matching або regex
- Підтримуйте БУДЬ-ЯКУ мову (українська, англійська, російська, французька, німецька, тощо)
- Розумійте контекст та наміри, а не конкретні слова

ТИПИ НАМІРІВ:
1. CREATE_LESSON - створити урок (будь-якою мовою)
2. GENERATE_PLAN - створити план уроку  
3. CREATE_SLIDE - створити слайд
4. CREATE_NEW_SLIDE - додати новий слайд до існуючого уроку
5. REGENERATE_SLIDE - повністю перегенерувати слайд
6. EDIT_HTML_INLINE - конкретні текстові зміни
7. EDIT_SLIDE - покращити/відредагувати слайд
8. IMPROVE_HTML - загальні покращення (кольори, анімації)
9. FREE_CHAT - загальна розмова
10. HELP - запит допомоги
11. EXPORT - експорт/завантаження
12. PREVIEW - перегляд

Аналізуйте наміри семантично, розуміючи контекст незалежно від мови.

Поверніть JSON:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "extracted topic",
    "age": "extracted age",
    "slideNumber": null,
    "targetElement": null,
    "slideSubject": null,
    "slideType": null,
    "targetText": null,
    "newText": null,
    "keywords": ["semantic", "keywords"],
    "rawMessage": "${message}"
  },
  "language": "detected language",
  "reasoning": "neural network semantic analysis"
}

Проаналізуйте це повідомлення: "${message}"`;
  }

  private parseAIResponse(content: string, originalMessage: string): IntentDetectionResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const result = JSON.parse(jsonString);

      if (!result.intent || !result.confidence || !result.parameters) {
        throw new Error('Incomplete neural network result');
      }

      return {
        intent: result.intent as UserIntent,
        confidence: result.confidence,
        parameters: {
          ...result.parameters,
          rawMessage: originalMessage
        },
        language: result.language || 'other',
        reasoning: result.reasoning || 'Neural network semantic analysis'
      };
    } catch (parseError) {
      console.error('Failed to parse neural network response:', content);
      throw new Error('Invalid neural network response format');
    }
  }
} 