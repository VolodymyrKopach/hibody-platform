import { IIntentDetectionService, IntentDetectionResult, UserIntent, IntentParameters } from './IIntentDetectionService';

// Extended interface for enhanced intent detection with data validation
export interface EnhancedIntentDetectionResult extends IntentDetectionResult {
  isDataSufficient: boolean;
  missingData: string[];
  suggestedQuestion?: string;
}

// Enhanced Claude Haiku service for intent detection with data validation
export class ClaudeHaikuIntentService implements IIntentDetectionService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectIntent(message: string, conversationHistory?: any): Promise<EnhancedIntentDetectionResult> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.buildHaikuPrompt(message, conversationHistory);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Fast intent detection
          max_tokens: 1000,
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

      return this.parseHaikuResponse(content, message);
    } catch (error) {
      console.error('Claude Haiku intent detection error:', error);
      throw error;
    }
  }

  private buildHaikuPrompt(message: string, conversationHistory?: any): string {
    // Формуємо контекстну інформацію
    let contextInfo = '';
    if (conversationHistory) {
      contextInfo = `
КОНТЕКСТ РОЗМОВИ:
- Крок: ${conversationHistory.step || 'невідомо'}
- Поточний урок: ${conversationHistory.currentLesson ? 'ТАК (id: ' + conversationHistory.currentLesson.id + ')' : 'НІ'}
- Тема уроку: ${conversationHistory.lessonTopic || 'не вказана'}
- Вік дітей: ${conversationHistory.lessonAge || 'не вказаний'}
- Згенеровані слайди: ${conversationHistory.generatedSlides?.length || 0}
- Є план уроку: ${conversationHistory.planningResult ? 'ТАК' : 'НІ'}

ВАЖЛИВО: Якщо є активний урок і користувач просить про слайди ("наступний", "третій", "ще слайд", "давай"), це майже завжди CREATE_NEW_SLIDE!
`;
    }

    return `Ви - експертна система розпізнавання намірів для освітньої платформи HiBody.

КРИТИЧНО ВАЖЛИВО: Відповідайте ТІЛЬКИ валідним JSON-об'єктом. Ніякого додаткового тексту!

${contextInfo}

ЗАВДАННЯ: Проаналізуйте повідомлення користувача та контекст розмови, потім:
1. Визначте намір (intent)
2. Витягніть параметри
3. Перевірте чи вистачає даних
4. Якщо НЕ вистачає - вкажіть що потрібно запитати

ІНТЕНТИ (точні значення):
- CREATE_LESSON: створити урок (потребує: topic, age)
- GENERATE_PLAN: створити план уроку  
- EDIT_PLAN: змінити/покращити план уроку (фрази: "покращ план", "змін план", "оновити план")
- CREATE_SLIDE: створити слайд
- CREATE_NEW_SLIDE: додати новий слайд
- REGENERATE_SLIDE: перегенерувати слайд
- EDIT_HTML_INLINE: текстові зміни в HTML
- EDIT_SLIDE: покращити слайд
- IMPROVE_HTML: загальні покращення HTML коду
- FREE_CHAT: загальна розмова, привітання, питання не пов'язані з уроками
- HELP: допомога
- EXPORT: експорт/завантаження
- PREVIEW: перегляд

ВАЖЛИВО: Фрази типу "схвалити план", "почати генерацію слайдів", "перейти до створення" НЕ є інтентами - це дії (actions) які обробляються окремо!

КРИТЕРІЇ ДОСТАТНОСТІ ДАНИХ:
- CREATE_LESSON: ОБОВ'ЯЗКОВО topic + age
- CREATE_SLIDE: ОБОВ'ЯЗКОВО topic
- EDIT_SLIDE: ОБОВ'ЯЗКОВО slideNumber

ПРИКЛАДИ ВІДПОВІДЕЙ:

Для "створи урок про динозаврів для дітей 8 років":
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "8 років",
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "Користувач хоче створити урок",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

Для "зроби урок про космос":
{
  "intent": "CREATE_LESSON",
  "confidence": 0.8,
  "parameters": {
    "topic": "космос",
    "age": null,
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "Тема визначена, але вік не вказано",
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "Для якого віку дітей створити урок про космос? (наприклад: 6 років, 8-10 років)"
}

Для "покращ план":
{
  "intent": "EDIT_PLAN",
  "confidence": 0.9,
  "parameters": {
    "topic": null,
    "age": null,
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "Користувач хоче змінити план уроку",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

Для "привіт, як справи":
{
  "intent": "FREE_CHAT",
  "confidence": 0.9,
  "parameters": {
    "topic": null,
    "age": null,
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "Загальне привітання",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

ПРИКЛАДИ З КОНТЕКСТОМ:

Для "давай тепер третій слайд" (коли є активний урок):
{
  "intent": "CREATE_NEW_SLIDE",
  "confidence": 0.9,
  "parameters": {
    "topic": null,
    "age": null,
    "slideNumber": 3
  },
  "language": "uk",
  "reasoning": "У контексті активного уроку користувач просить створити наступний слайд",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

Для "наступний слайд" (коли є активний урок):
{
  "intent": "CREATE_NEW_SLIDE",
  "confidence": 0.95,
  "parameters": {
    "topic": null,
    "age": null,
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "У контексті активного уроку - створення наступного слайду",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

ПОВЕРТАЙТЕ ТІЛЬКИ JSON! Проаналізуйте повідомлення з урахуванням контексту: "${message}"`;
  }

  private parseHaikuResponse(content: string, originalMessage: string): EnhancedIntentDetectionResult {
    console.log('🔍 Raw Claude response:', content);
    
    try {
      // Try to extract JSON from the response
      let jsonString = content;
      
      // Look for JSON block in markdown code fence
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
        console.log('📦 Extracted from code block:', jsonString);
      } else {
        // Look for any JSON object
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('📦 Extracted JSON:', jsonString);
        }
      }

      const result = JSON.parse(jsonString);
      console.log('✅ Parsed result:', result);

      // Map Claude's response format to our enum values
      const intentMapping: { [key: string]: UserIntent } = {
        'CREATE_LESSON': UserIntent.CREATE_LESSON,
        'GENERATE_PLAN': UserIntent.GENERATE_PLAN,
        'EDIT_PLAN': UserIntent.EDIT_PLAN,
        'CREATE_SLIDE': UserIntent.CREATE_SLIDE,
        'CREATE_NEW_SLIDE': UserIntent.CREATE_NEW_SLIDE,
        'REGENERATE_SLIDE': UserIntent.REGENERATE_SLIDE,
        'EDIT_HTML_INLINE': UserIntent.EDIT_HTML_INLINE,
        'EDIT_SLIDE': UserIntent.EDIT_SLIDE,
        'IMPROVE_HTML': UserIntent.IMPROVE_HTML,
        'FREE_CHAT': UserIntent.FREE_CHAT,
        'HELP': UserIntent.HELP,
        'EXPORT': UserIntent.EXPORT,
        'PREVIEW': UserIntent.PREVIEW
      };

      const mappedIntent = intentMapping[result.intent] || UserIntent.FREE_CHAT;
      console.log('🎯 Mapped intent:', result.intent, '→', mappedIntent);

      return {
        intent: mappedIntent,
        confidence: result.confidence || 0.5,
        parameters: {
          ...result.parameters,
          rawMessage: originalMessage
        },
        language: result.language || 'other',
        reasoning: result.reasoning || 'AI-based detection',
        isDataSufficient: result.isDataSufficient ?? true,
        missingData: result.missingData || [],
        suggestedQuestion: result.suggestedQuestion
      };
    } catch (parseError) {
      console.error('❌ Failed to parse Haiku response:', parseError);
      console.error('📝 Original content:', content);
      
      // Fallback - create a basic FREE_CHAT response
      console.log('🔄 Using fallback FREE_CHAT response');
      return {
        intent: UserIntent.FREE_CHAT,
        confidence: 0.3,
        parameters: {
          rawMessage: originalMessage
        },
        language: 'other',
        reasoning: 'Fallback due to parse error',
        isDataSufficient: true,
        missingData: [],
        suggestedQuestion: undefined
      };
    }
  }
} 