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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    // Pass the API key explicitly to the Google GenAI client
    this.client = new GoogleGenAI({ apiKey });
  }

  async detectIntent(message: string, conversationHistory?: any): Promise<EnhancedIntentDetectionResult> {
    // Let AI detect language naturally instead of hardcoded detection
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

  private buildGeminiPrompt(message: string, conversationHistory?: any): string {
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
      
      // === ADD COMPRESSED CONVERSATION CONTEXT ===
      if (conversationHistory.conversationContext) {
        contextInfo += `
DETAILED CONVERSATION HISTORY:
${conversationHistory.conversationContext}

CRITICAL: Use this conversation history to better understand the user's intent and provide more accurate responses.
When user says "create lesson" or similar, look at the conversation history to identify what topic they were discussing.
Example: If they previously asked "who is batman" and now say "create lesson", the topic should be "batman" or "superheroes".
`;
      }
    }

    return `You are an expert intent recognition system for the HiBody educational platform.

CRITICAL: Respond ONLY with a valid JSON object. No additional text!

${contextInfo}

TASK: Analyze the user's message and conversation context, then:
1. Determine the intent
2. Extract parameters
3. Check if sufficient data is available
4. If NOT sufficient - indicate what needs to be asked

IMPORTANT: Detect the user's language from their message and respond in the SAME language!

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
- topic: lesson topic (from user text OR conversation history)
- age: children's age (numbers, ranges, "preschoolers", "schoolchildren")
- slideNumber: slide number (if mentioned)
- instruction: specific user instruction
- rawMessage: original message

INTENT DETECTION LOGIC:

**CRITICAL: RESOLVE CONTEXTUAL REFERENCES**
When user says "it", "that", "this topic", "the same thing", etc., OR when they say "create lesson" without specifying a topic, 
look at the conversation history to understand what they were discussing previously.

TOPIC EXTRACTION PRIORITY:
1. EXPLICIT topic in current message ("create lesson about dinosaurs")
2. CONTEXTUAL reference in current message ("create lesson about it", "lesson about that")
3. TOPIC FROM CONVERSATION HISTORY - scan the conversation for topics they discussed:
   - Look for questions like "who is X", "what is Y", "tell me about Z"
   - Look for educational discussions about specific subjects
   - Extract the main subject/character/concept they were interested in

Examples:
- "Tell me about dinosaurs" → "Let's create lesson" = CREATE_LESSON with topic="dinosaurs"
- "Who is Batman?" → "Create lesson" = CREATE_LESSON with topic="batman" or "superheroes"
- "We discussed space" → "Make lesson about that" = CREATE_LESSON with topic="space"
- "I mentioned animals earlier" → "Create lesson about them" = CREATE_LESSON with topic="animals"

**CRITICAL: EVEN WITHOUT EXPLICIT REFERENCE, CHECK CONVERSATION HISTORY**
If user says just "create lesson" or "let's create lesson", scan the conversation history for any educational topics they were discussing.

1. **CREATE_LESSON** - if user explicitly wants to create a lesson:
   - EXPLICIT phrases: "create lesson", "make lesson", "lesson about", "teach children"
   - **CONTEXTUAL phrases**: "lesson about it", "lesson about that", or just "create lesson" (scan history)
   - Must have CLEAR intent to create educational content
   - **IMPORTANT**: If no explicit topic, search conversation history for educational topics discussed
   - Just asking about a topic (like "tell me about dinosaurs") is NOT lesson creation UNLESS followed by lesson creation request

2. **CREATE_NEW_SLIDE** - if there's an active lesson and asking for slide:
   - Phrases: "next slide", "another slide", "third slide", "let's continue"
   - Context: conversationHistory.currentLesson exists

3. **EDIT_PLAN** - editing lesson plan:
   - Phrases: "change plan", "improve plan", "add to plan"
   - Context: conversationHistory.step === 'planning'

4. **HELP** - help request:
   - Phrases: "help", "how to use", "what can you do"

5. **FREE_CHAT** - general communication and questions:
   - Greetings: "hello", "hi", "good day"
   - General questions about topics: "tell me about X", "what is Y"
   - Casual conversation without explicit lesson creation intent
   - Any question that's not explicitly asking to create educational content

RESPONSE FORMAT (JSON):
{
  "intent": "EXACT_INTENT",
  "confidence": 0.95,
  "language": "detected_language_code",
  "parameters": {
    "topic": "lesson topic",
    "age": "children age", 
    "slideNumber": 1,
    "instruction": "what to do",
    "rawMessage": "original text"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": "Question in the same language as user's message"
}

ANALYSIS EXAMPLES:

MESSAGE: "Create a lesson about dinosaurs"
ANALYSIS: has topic="dinosaurs", but missing age
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "dinosaurs",
    "age": null,
    "rawMessage": "Create a lesson about dinosaurs"
  },
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "For what age should I create a lesson about dinosaurs?"
}

MESSAGE: "Next slide" (with active lesson)
RESPONSE:
{
  "intent": "CREATE_NEW_SLIDE",
  "confidence": 0.98,
  "language": "en", 
  "parameters": {
    "instruction": "create next slide",
    "rawMessage": "Next slide"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "let's create lesson" (after conversation about Batman)
ANALYSIS: User previously asked about Batman, now wants to create lesson. Extract topic from conversation history.
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "batman",
    "age": null,
    "rawMessage": "let's create lesson"
  },
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "For what age should I create a lesson about Batman?"
}

MESSAGE: "підкажи хто такі динозаври"
ANALYSIS: asking about topic, but NOT requesting lesson creation
RESPONSE:
{
  "intent": "FREE_CHAT",
  "confidence": 0.90,
  "language": "uk",
  "parameters": {
    "rawMessage": "підкажи хто такі динозаври"
  },
  "isDataSufficient": true,
  "missingData": []
}

**CONTEXTUAL REFERENCE EXAMPLES:**

MESSAGE: "let's create lesson about it" (after discussing dinosaurs)
ANALYSIS: contextual reference - "it" refers to "dinosaurs" from conversation history
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "dinosaurs",
    "age": null,
    "rawMessage": "let's create lesson about it"
  },
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "For what age should I create a lesson about dinosaurs?"
}

MESSAGE: "create lesson about it" (after talking about space)
ANALYSIS: has topic="space" (from context), but missing age
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "space",
    "age": null,
    "rawMessage": "create lesson about it"
  },
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "For what age should I create a lesson about space?"
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
        language: parsed.language || 'en', // Default to English if not detected
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
        language: 'en', // Default to English
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