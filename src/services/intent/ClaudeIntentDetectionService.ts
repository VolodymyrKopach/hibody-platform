import { IIntentDetectionService, IntentDetectionResult, UserIntent } from './IIntentDetectionService';

// Single Responsibility: Реалізація через Claude API
export class ClaudeIntentDetectionService implements IIntentDetectionService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectIntent(message: string): Promise<IntentDetectionResult> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.buildPrompt(message);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Використовуємо швидкий Haiku для intent detection
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

      return this.parseClaudeResponse(content, message);
    } catch (error) {
      console.error('Claude intent detection error:', error);
      throw error;
    }
  }

  private buildPrompt(message: string): string {
    return `Fast intent detection for HiBody educational platform. Analyze user messages and return JSON only.

INTENTS:
1. CREATE_LESSON - "створи урок", "create lesson", "сделай урок"
2. GENERATE_PLAN - "створи план", "make plan", "составь план"  
3. CREATE_SLIDE - "створи слайд", "create slide", "сделай слайд"
4. CREATE_NEW_SLIDE - "додай слайд", "add slide", "добавь слайд"
5. REGENERATE_SLIDE - "перегенеруй слайд N", "regenerate slide N"
6. EDIT_HTML_INLINE - "заміни X на Y", "replace X with Y"
7. EDIT_SLIDE - "покращ слайд N", "improve slide N"
8. IMPROVE_HTML - "зроби яскравішим", "make colorful"
9. FREE_CHAT - general conversation
10. HELP - "допоможи", "help"
11. EXPORT - "експортуй", "download"
12. PREVIEW - "покажи", "preview"

Extract: slideNumber, topic, age, targetText/newText, slideSubject
Languages: uk, en, ru, other

Return JSON:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "6 років",
    "slideNumber": null,
    "targetElement": null,
    "slideSubject": null,
    "slideType": null,
    "targetText": null,
    "newText": null,
    "keywords": ["створи", "урок"],
    "rawMessage": "${message}"
  },
  "language": "uk",
  "reasoning": "brief explanation"
}

Analyze this message: "${message}"`;
  }

  private parseClaudeResponse(content: string, originalMessage: string): IntentDetectionResult {
    try {
      // Clean the response - remove any markdown or extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const result = JSON.parse(jsonString);

      // Validate required fields
      if (!result.intent || !result.confidence || !result.parameters) {
        throw new Error('Incomplete intent detection result');
      }

      return {
        intent: result.intent as UserIntent,
        confidence: result.confidence,
        parameters: {
          ...result.parameters,
          rawMessage: originalMessage
        },
        language: result.language || 'other',
        reasoning: result.reasoning || 'AI-based detection'
      };
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      throw new Error('Invalid AI response format');
    }
  }
} 