import { GoogleGenAI } from "@google/genai";
import { IIntentDetectionService, IntentDetectionResult, UserIntent, IntentParameters } from './IIntentDetectionService';

// Extended interface for enhanced intent detection with data validation
export interface EnhancedIntentDetectionResult extends IntentDetectionResult {
  isDataSufficient: boolean;
  missingData: string[];
  suggestedQuestion?: string;
}

// Gemini 2.5 Flash Lite service for fast intent detection with data validation
export class GeminiIntentService implements IIntentDetectionService {
  private readonly client: GoogleGenAI;

  constructor() {
    // API key from environment variable GEMINI_API_KEY
    this.client = new GoogleGenAI({});
  }

  async detectIntent(message: string, conversationHistory?: any): Promise<EnhancedIntentDetectionResult> {
    const prompt = this.buildGeminiPrompt(message, conversationHistory);

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-06-17",
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster intent detection
          },
          temperature: 0.1
        }
      });

      const content = response.text;
      if (!content) {
        throw new Error('No content in Gemini response');
      }

      return this.parseGeminiResponse(content, message);
    } catch (error) {
      console.error('Gemini intent detection error:', error);
      throw error;
    }
  }

  private detectLanguage(message: string): 'uk' | 'en' {
    // Simple language detection based on character patterns
    const ukrainianPattern = /[іїєґяюэыё]/i;
    const englishPattern = /[a-z]/i;
    
    const hasUkrainian = ukrainianPattern.test(message);
    const hasEnglish = englishPattern.test(message);
    
    // If has Ukrainian characters, it's Ukrainian
    if (hasUkrainian) return 'uk';
    
    // If only English characters, it's English
    if (hasEnglish && !hasUkrainian) return 'en';
    
    // Default to Ukrainian for this platform
    return 'uk';
  }

  private buildGeminiPrompt(message: string, conversationHistory?: any, userLanguage: 'uk' | 'en' = 'uk'): string {
    // Build context information
    let contextInfo = '';
    if (conversationHistory) {
      contextInfo = `
CONVERSATION CONTEXT:
- Current step: ${conversationHistory.step || 'unknown'}
- Active lesson: ${conversationHistory.currentLesson ? 'YES (id: ' + conversationHistory.currentLesson.id + ')' : 'NO'}
- Lesson topic: ${conversationHistory.lessonTopic || 'not specified'}
- Children age: ${conversationHistory.lessonAge || 'not specified'}
- Generated slides: ${conversationHistory.generatedSlides?.length || 0}
- Has lesson plan: ${conversationHistory.planningResult ? 'YES' : 'NO'}

IMPORTANT: If there's an active lesson and user asks about slides ("next", "third", "another slide", "let's go"), this is almost always CREATE_NEW_SLIDE!
`;
    }

    return `You are an expert intent recognition system for the HiBody educational platform.

CRITICAL: Respond ONLY with a valid JSON object. No additional text!

${contextInfo}

TASK: Analyze the user's message and conversation context, then:
1. Determine the intent
2. Extract parameters
3. Check if sufficient data is available
4. If NOT sufficient - indicate what needs to be asked

USER'S LANGUAGE: ${userLanguage}
IMPORTANT: All suggested questions and responses should be in ${userLanguage === 'uk' ? 'UKRAINIAN' : 'ENGLISH'} language!

SUPPORTED INTENTS (exact values):
- CREATE_LESSON: create a lesson (requires: topic, age)
- GENERATE_PLAN: create lesson plan  
- EDIT_PLAN: modify/improve lesson plan (phrases: "improve plan", "change plan", "update plan")
- CREATE_SLIDE: create a slide
- CREATE_NEW_SLIDE: add new slide (when there's an active lesson)
- REGENERATE_SLIDE: regenerate slide
- EDIT_HTML_INLINE: text changes in HTML
- EDIT_SLIDE: improve slide
- IMPROVE_HTML: general HTML code improvements
- FREE_CHAT: general conversation, greetings, non-lesson questions
- HELP: help request

PARAMETERS to extract:
- topic: lesson topic (from user text)
- age: children's age (numbers, ranges, "preschoolers", "schoolchildren")
- slideNumber: slide number (if mentioned)
- instruction: specific user instruction
- rawMessage: original message

INTENT DETECTION LOGIC:

1. **CREATE_LESSON** - if user wants to create a lesson:
   - Phrases: "create lesson", "make lesson", "lesson about", "teach children"
   - REQUIRED: topic (subject) + age (age group)
   - If something missing → isDataSufficient: false

2. **CREATE_NEW_SLIDE** - if there's an active lesson and asking for slide:
   - Phrases: "next slide", "another slide", "third slide", "let's continue"
   - Context: conversationHistory.currentLesson exists

3. **EDIT_PLAN** - editing lesson plan:
   - Phrases: "change plan", "improve plan", "add to plan"
   - Context: conversationHistory.step === 'planning'

4. **HELP** - help request:
   - Phrases: "help", "how to use", "what can you do"

5. **FREE_CHAT** - general communication:
   - Greetings: "hello", "hi", "good day"
   - General questions not about lessons

RESPONSE FORMAT (JSON):
{
  "intent": "EXACT_INTENT",
  "confidence": 0.95,
  "language": "${userLanguage}",
  "parameters": {
    "topic": "lesson topic",
    "age": "children age", 
    "slideNumber": 1,
    "instruction": "what to do",
    "rawMessage": "original text"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": "${userLanguage === 'uk' ? 'Question in Ukrainian' : 'Question in English'}"
}

ANALYSIS EXAMPLES:

MESSAGE: "${userLanguage === 'uk' ? 'Створи урок про динозаврів' : 'Create a lesson about dinosaurs'}"
ANALYSIS: has topic="${userLanguage === 'uk' ? 'динозаври' : 'dinosaurs'}", but missing age
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "${userLanguage}",
  "parameters": {
    "topic": "${userLanguage === 'uk' ? 'динозаври' : 'dinosaurs'}",
    "age": null,
    "rawMessage": "${userLanguage === 'uk' ? 'Створи урок про динозаврів' : 'Create a lesson about dinosaurs'}"
  },
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "${userLanguage === 'uk' ? 'Для дітей якого віку створити урок про динозаврів?' : 'For what age should I create a lesson about dinosaurs?'}"
}

MESSAGE: "${userLanguage === 'uk' ? 'Наступний слайд' : 'Next slide'}" (with active lesson)
RESPONSE:
{
  "intent": "CREATE_NEW_SLIDE",
  "confidence": 0.98,
  "language": "${userLanguage}", 
  "parameters": {
    "instruction": "${userLanguage === 'uk' ? 'створити наступний слайд' : 'create next slide'}",
    "rawMessage": "${userLanguage === 'uk' ? 'Наступний слайд' : 'Next slide'}"
  },
  "isDataSufficient": true,
  "missingData": []
}

ANALYZE THIS MESSAGE:
"${message}"`;
  }

  private parseGeminiResponse(content: string, originalMessage: string): EnhancedIntentDetectionResult {
    try {
      // Clean response from extra text
      let jsonText = content.trim();
      
      // Find JSON block
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (!parsed.intent) {
        throw new Error('Missing intent in response');
      }

      // Normalize intent to enum values
      const normalizedIntent = this.normalizeIntent(parsed.intent);

      const result: EnhancedIntentDetectionResult = {
        intent: normalizedIntent,
        confidence: parsed.confidence || 0.8,
        language: parsed.language || 'uk', // Use Gemini detected language
        reasoning: parsed.reasoning || `Intent detected: ${normalizedIntent}`,
        parameters: {
          topic: parsed.parameters?.topic || null,
          age: parsed.parameters?.age || null,
          slideNumber: parsed.parameters?.slideNumber || null,
          instruction: parsed.parameters?.instruction || null,
          rawMessage: originalMessage,
          ...parsed.parameters
        },
        isDataSufficient: parsed.isDataSufficient !== false,
        missingData: parsed.missingData || [],
        suggestedQuestion: parsed.suggestedQuestion
      };

      console.log('📊 Gemini Intent Analysis:', {
        intent: result.intent,
        confidence: result.confidence,
        language: parsed.language || 'uk',
        isDataSufficient: result.isDataSufficient,
        missingData: result.missingData,
        parameters: result.parameters
      });

      return result;

    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      console.error('📝 Raw response:', content);
      
      // Fallback response
      return {
        intent: UserIntent.FREE_CHAT,
        confidence: 0.5,
        language: 'uk', // Default to Ukrainian
        reasoning: 'Failed to parse response, defaulting to free chat',
        parameters: {
          rawMessage: originalMessage
        },
        isDataSufficient: true,
        missingData: [],
        suggestedQuestion: undefined
      };
    }
  }

  private normalizeIntent(intent: string): UserIntent {
    const intentMap: Record<string, UserIntent> = {
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
      'HELP': UserIntent.HELP
    };

    return intentMap[intent.toUpperCase()] || UserIntent.FREE_CHAT;
  }
} 