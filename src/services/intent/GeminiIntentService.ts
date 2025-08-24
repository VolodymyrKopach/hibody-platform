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
    // Debug: Check if lesson plan exists
    const hasLessonPlan = conversationHistory?.planningResult ? true : false;
    const isInPlanningStep = conversationHistory?.step === 'planning';
    console.log('🔍 [DEBUG] Has lesson plan:', hasLessonPlan);
    console.log('🔍 [DEBUG] Conversation step:', conversationHistory?.step);
    
    // Check if this is a plan editing request (in planning step with plan modifications)
    const planEditKeywords = ['add slide', 'remove slide', 'delete slide', 'modify', 'change', 'edit', 'update', 'shorter', 'longer', 'keep only'];
    const isPlanEdit = isInPlanningStep && hasLessonPlan && 
      planEditKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    // Debug logging for context
    console.log('🔍 [DEBUG] Context analysis:');
    console.log('  - isPlanEdit:', isPlanEdit);
    console.log('  - isInPlanningStep:', isInPlanningStep);
    console.log('  - hasLessonPlan:', hasLessonPlan);
    console.log('  - message contains keywords:', planEditKeywords.filter(k => message.toLowerCase().includes(k)));
    
    // Let AI handle all intent detection with proper context
    
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
- Has lesson plan: ${conversationHistory.planningResult ? 'YES - PLAN EXISTS, READY FOR SLIDE GENERATION' : 'NO'}${conversationHistory.currentLesson?.slides ? `
- Available slides: ${conversationHistory.currentLesson.slides.length} slides (1-${conversationHistory.currentLesson.slides.length})
- Slide titles: ${conversationHistory.currentLesson.slides.map((slide: any, index: number) => `${index + 1}. "${slide.title}"`).join(', ')}` : ''}

CRITICAL CONTEXT RULES:
- If step === 'planning' AND planningResult exists → User is still editing the plan, NOT ready for generation
- Only when user explicitly approves the plan (says "approve", "ok", "generate") → GENERATE_SLIDES
- If step === 'planning' and user wants to modify plan → EDIT_PLAN (even if they mention "slides")

IMPORTANT: If there's an active lesson and user asks about slides ("next", "third", "another slide", "let's go"), this is almost always CREATE_NEW_SLIDE!
`;
      
      // === ADD COMPRESSED CONVERSATION CONTEXT ===
      if (conversationHistory.conversationContext) {
        contextInfo += `
DETAILED CONVERSATION HISTORY:
${conversationHistory.conversationContext}

CRITICAL: Use this conversation history to better understand the user's intent and provide more accurate responses.
When user says "create lesson", "create studying plan", or similar, look at the conversation history to identify:
1. TOPIC: What subject/topic they were discussing (e.g., "present simple", "batman", "dinosaurs")
2. AGE: What age group was mentioned (e.g., "9 years old", "5-6 years", "children")
3. CONTEXT: Any additional details about the lesson structure

Examples:
- Previous: "rate lesson about present simple for 9 years old" → Current: "create studying plan" → Extract: topic="present simple", age="9 years old"
- Previous: "who is batman" → Current: "create lesson" → Extract: topic="batman" or "superheroes"
- Previous: "tell me about dinosaurs for 6 year olds" → Current: "make a lesson" → Extract: topic="dinosaurs", age="6 years old"
- Previous: "lesson about math for 8 year olds" → Current: "create study plan" → Extract: topic="math", age="8 years old"
- Previous: "teaching colors to toddlers" → Current: "make educational plan" → Extract: topic="colors", age="toddlers" or "2-3 years old"
`;
      }
    }

    return `You are an expert intent recognition system for the TeachSpark educational platform.

CRITICAL: Respond ONLY with a valid JSON object. No additional text!

${contextInfo}

TASK: Analyze the user's message and conversation context, then:
1. Determine the intent
2. Extract parameters
3. Check if sufficient data is available
4. If NOT sufficient - indicate what needs to be asked

IMPORTANT: Detect the user's language from their message and respond in the SAME language!

**CONTEXT-AWARE PRIORITY RULES**: 
- CRITICAL: Check conversation step FIRST before deciding intent
- If step === 'planning' → User is still working on the plan, NOT ready for generation
- If step === 'planning' AND user mentions "add/remove/change slides" → EDIT_PLAN
- If step === 'planning' AND user says "approve/ok/generate" → GENERATE_SLIDES  
- If step !== 'planning' AND plan exists AND user mentions generation → GENERATE_SLIDES
- Be tolerant of typos and variations in key phrases

SUPPORTED INTENTS (exact values):
- CREATE_LESSON: create a lesson (requires: topic, age) - includes "create studying plan", "make lesson plan", "create educational content"
- GENERATE_PLAN: **DEPRECATED** - use CREATE_LESSON instead
- EDIT_PLAN: modify/improve lesson plan (phrases: "improve plan", "change plan", "update plan")
- GENERATE_SLIDES: generate all slides from lesson plan (bulk generation)
- CREATE_SLIDE: create a single slide
- CREATE_NEW_SLIDE: add new slide (when there's an active lesson)
- REGENERATE_SLIDE: regenerate slide
- EDIT_HTML_INLINE: text changes in HTML
- EDIT_SLIDE: improve slide
- BATCH_EDIT_SLIDES: edit multiple slides at once ("make all titles bigger", "edit slides 1-3")
- IMPROVE_HTML: general HTML code improvements
- FREE_CHAT: general conversation, greetings, non-lesson questions
- HELP: help request

PARAMETERS to extract:
- topic: lesson topic (from user text OR conversation history)
- age: children's age (numbers, ranges, "preschoolers", "schoolchildren")
- slideNumber: slide number (if mentioned) - **CRITICAL: ALWAYS try to extract slide number from user message**
- slideNumbers: array of slide numbers for batch operations ([1, 3, 5])
- editInstruction: specific editing instruction for batch operations
- affectedSlides: 'all' | 'specific' | 'range' | 'single'
- slideRange: {start: number, end: number} for range operations
- batchOperation: true for batch editing operations
- instruction: specific user instruction
- rawMessage: original message

**SLIDE NUMBER DETECTION RULES:**
- EXPLICIT numbers: "edit slide 3", "change slide 2", "improve slide 1"
- ORDINAL numbers: "edit first slide", "change second slide", "improve third slide"
- POSITIONAL words: "edit next slide", "change previous slide", "improve last slide"
- CONTEXTUAL references: "edit this slide", "change that slide" (try to infer from context)
- If NO slide number mentioned and multiple slides exist → set slideNumber: null (will trigger validation)

INTENT DETECTION LOGIC:

**CRITICAL: CONTEXT-DEPENDENT DECISION MAKING**
The conversation state determines the correct intent:

1. **CRITICAL FIRST CHECK**: If conversationHistory.step === 'planning' → User is still editing the plan
   - If user wants to modify plan ("add slides", "remove slides", "change", "edit") → EDIT_PLAN
   - If user explicitly approves ("approve", "ok", "generate", "proceed") → GENERATE_SLIDES
2. If conversationHistory.step !== 'planning' AND planningResult exists AND user says approval phrases → GENERATE_SLIDES
3. If conversationHistory.step !== 'planning' AND planningResult exists AND user says slide generation phrases → GENERATE_SLIDES
4. If conversationHistory.currentLesson exists (but no planningResult) AND user asks for slides → CREATE_NEW_SLIDE  
5. If no lesson context and user wants to create content → CREATE_LESSON

**TYPO TOLERANCE**: Be flexible with spelling mistakes in key phrases. Focus on the intent rather than exact spelling.

**CRITICAL: RESOLVE CONTEXTUAL REFERENCES**
When user says "it", "that", "this topic", "the same thing", etc., OR when they say "create lesson" without specifying a topic, 
look at the conversation history to understand what they were discussing previously.

TOPIC AND AGE EXTRACTION PRIORITY:
1. EXPLICIT topic/age in current message ("create lesson about dinosaurs for 5 year olds")
2. CONTEXTUAL reference in current message ("create lesson about it", "lesson about that")
3. TOPIC AND AGE FROM CONVERSATION HISTORY - scan the conversation for:
   **TOPICS**: Look for questions like "who is X", "what is Y", "tell me about Z"
   **AGES**: Look for phrases like "age 3", "3 years old", "for 5 year olds", "preschoolers", numbers followed by age context
   - Extract the main subject/character/concept they were interested in
   - Extract any age mentions from previous conversations

Examples:
- "Tell me about dinosaurs" → "Let's create lesson" = CREATE_LESSON with topic="dinosaurs"
- "Who is Batman?" → "Create lesson" = CREATE_LESSON with topic="batman" or "superheroes"
- "We discussed space" → "Make lesson about that" = CREATE_LESSON with topic="space"
- "I mentioned animals earlier" → "Create lesson about them" = CREATE_LESSON with topic="animals"
- "lets create a lesson about him 3" → age="3", topic="batman" (from previous context)
- "create presentation" (after discussing batman and age 3) = topic="batman", age="3"

**CRITICAL: EVEN WITHOUT EXPLICIT REFERENCE, CHECK CONVERSATION HISTORY**
If user says just "create lesson" or "let's create lesson", scan the conversation history for any educational topics they were discussing.

1. **CREATE_LESSON** - if user explicitly wants to create a lesson:
   - **EXPLICIT phrases**: "create lesson", "make lesson", "lesson about", "teach children", "create studying plan", "make study plan", "create educational plan", "develop lesson", "design lesson"
   - **CONTEXTUAL phrases**: "lesson about it", "lesson about that", or just "create lesson" (scan history)
   - **PLANNING phrases**: "create studying plan", "make study plan", "plan a lesson", "design curriculum"
   - Must have CLEAR intent to create educational content
   - **CRITICAL**: If no explicit topic in current message, ALWAYS search conversation history for:
     - Educational topics discussed ("present simple", "dinosaurs", "batman")
     - Age mentions ("9 years old", "for children 5", "preschoolers")
   - Just asking about a topic (like "tell me about dinosaurs") is NOT lesson creation UNLESS followed by lesson creation request

2. **GENERATE_SLIDES** - if user wants to generate all slides from an existing lesson plan:
   - Phrases: "generate slides", "create slides", "make slides", "build slides"
   - **TYPO variations**: "generete slides", "genrate slides", "generatr slides", "creat slides"
   - **EXTENDED phrases**: "then generate slides", "lets generate it", "okay, lets generate it", "generate them", "create them", "make them"
   - **APPROVAL phrases**: "go", "proceed", "continue", "start", "let's go", "approve", "yes"
   - Context: must have conversationHistory.planningResult (lesson plan exists)
   - **CRITICAL**: If planningResult exists and user says approval phrases OR slide generation phrases, this is GENERATE_SLIDES!
   - This triggers bulk slide generation from the lesson plan

3. **CREATE_NEW_SLIDE** - if there's an active lesson and asking for slide:
   - Phrases: "next slide", "another slide", "third slide", "let's continue"
   - Context: conversationHistory.currentLesson exists
   - **IMPORTANT**: Only if currentLesson exists AND no planningResult waiting for approval

4. **EDIT_PLAN** - editing lesson plan:
   - **CRITICAL**: If conversationHistory.step === 'planning' AND planningResult exists, ANY modification request is EDIT_PLAN
   - Phrases: "change plan", "improve plan", "add to plan", "modify plan", "update plan"
   - **SLIDE MODIFICATION**: "add slide", "remove slide", "delete slide"
   - **CONTENT CHANGES**: "make shorter", "make longer", "change focus"
   - **DIFFICULTY CHANGES**: "make easier", "make harder"
   - Context: conversationHistory.step === 'planning' AND conversationHistory.planningResult exists
   - **PRIORITY**: This takes precedence over CREATE_SLIDE when in planning phase

5. **BATCH_EDIT_SLIDES** - editing multiple slides at once:
   - **CRITICAL**: If conversationHistory.currentLesson exists AND user wants to edit multiple slides
   - **ALL SLIDES**: "make all titles bigger", "change all backgrounds", "improve all slides"
   - **SPECIFIC SLIDES**: "edit slides 1, 3, and 5", "change slides 2 and 4"
   - **RANGE SLIDES**: "edit slides 1-3", "improve slides 2 through 5", "change first 3 slides"
   - **BATCH KEYWORDS**: "all slides", "multiple slides", "slides 1-3", "first few slides"
   - Context: conversationHistory.currentLesson exists (active lesson with slides)
   - **PRIORITY**: Takes precedence over single EDIT_SLIDE when multiple slides mentioned

6. **HELP** - help request:
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

MESSAGE: "go" (with conversationHistory.planningResult exists)
ANALYSIS: User wants to approve plan and generate slides
RESPONSE:
{
  "intent": "GENERATE_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": null,
    "age": null,
    "instruction": "approve plan and generate slides",
    "rawMessage": "go"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

MESSAGE: "generete slides" (with conversationHistory.planningResult exists)
ANALYSIS: User wants to generate slides (typo in "generate"), plan exists
RESPONSE:
{
  "intent": "GENERATE_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": null,
    "age": null,
    "instruction": "generate slides from lesson plan",
    "rawMessage": "generete slides"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

MESSAGE: "then generate slides" (with conversationHistory.planningResult exists)
ANALYSIS: User wants to proceed with slide generation, plan exists
RESPONSE:
{
  "intent": "GENERATE_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": null,
    "age": null,
    "instruction": "generate slides from lesson plan",
    "rawMessage": "then generate slides"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

MESSAGE: "okay, lets generate it" (with conversationHistory.planningResult exists)
ANALYSIS: User agrees to generate slides, plan exists
RESPONSE:
{
  "intent": "GENERATE_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": null,
    "age": null,
    "instruction": "generate slides from lesson plan",
    "rawMessage": "okay, lets generate it"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

MESSAGE: "lets create a presentation" (after discussing batman and age 3)
ANALYSIS: has topic="batman" and age="3" from conversation context
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "batman",
    "age": "3",
    "rawMessage": "lets create a presentation"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
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

MESSAGE: "create studying plan" (after conversation: "rate lesson about present simple for 9 years old")
ANALYSIS: User previously discussed "present simple" and "9 years old", now wants to create studying plan. Extract both topic and age from conversation history.
RESPONSE:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "present simple",
    "age": "9 years old",
    "rawMessage": "create studying plan"
  },
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}

MESSAGE: "tell me about dinosaurs"
ANALYSIS: asking about topic, but NOT requesting lesson creation
RESPONSE:
{
  "intent": "FREE_CHAT",
  "confidence": 0.90,
  "language": "en",
  "parameters": {
    "rawMessage": "tell me about dinosaurs"
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

MESSAGE: "Add slide about carnivorous dinosaurs" (with conversationHistory.step === 'planning' and planningResult exists)
ANALYSIS: User wants to edit the existing lesson plan by adding a slide about carnivorous dinosaurs
RESPONSE:
{
  "intent": "EDIT_PLAN",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "topic": "carnivorous dinosaurs",
    "instruction": "add slide about carnivorous dinosaurs",
    "rawMessage": "Add slide about carnivorous dinosaurs"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "Remove the first slide" (with conversationHistory.step === 'planning' and planningResult exists)
ANALYSIS: User wants to edit the existing lesson plan by removing a slide
RESPONSE:
{
  "intent": "EDIT_PLAN",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "slideNumber": 1,
    "instruction": "remove the first slide",
    "rawMessage": "Remove the first slide"
  },
  "isDataSufficient": true,
  "missingData": []
}

**BATCH EDITING EXAMPLES:**

MESSAGE: "make all titles bigger" (with active lesson)
ANALYSIS: User wants to edit all slides in the lesson to make titles bigger
RESPONSE:
{
  "intent": "BATCH_EDIT_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "editInstruction": "make titles bigger",
    "affectedSlides": "all",
    "batchOperation": true,
    "rawMessage": "make all titles bigger"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "edit slides 1, 3, and 5 - change background color" (with active lesson)
ANALYSIS: User wants to edit specific slides (1, 3, 5) to change background color
RESPONSE:
{
  "intent": "BATCH_EDIT_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "slideNumbers": [1, 3, 5],
    "editInstruction": "change background color",
    "affectedSlides": "specific",
    "batchOperation": true,
    "rawMessage": "edit slides 1, 3, and 5 - change background color"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "improve slides 2-4" (with active lesson)
ANALYSIS: User wants to improve slides in range 2 to 4
RESPONSE:
{
  "intent": "BATCH_EDIT_SLIDES",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "slideNumbers": [2, 3, 4],
    "slideRange": {"start": 2, "end": 4},
    "editInstruction": "improve slides",
    "affectedSlides": "range",
    "batchOperation": true,
    "rawMessage": "improve slides 2-4"
  },
  "isDataSufficient": true,
  "missingData": []
}

**SINGLE SLIDE EDITING EXAMPLES:**

MESSAGE: "edit slide 3" (with active lesson)
ANALYSIS: User wants to edit specific slide number 3
RESPONSE:
{
  "intent": "EDIT_SLIDE",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "slideNumber": 3,
    "instruction": "edit slide",
    "rawMessage": "edit slide 3"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "в другому слайді зміни заголовок, в третьому додай картинку, а в четвертому зроби текст більшим" (with active lesson)
ANALYSIS: User wants to edit multiple slides with different instructions for each slide
RESPONSE:
{
  "intent": "BATCH_EDIT_SLIDES",
  "confidence": 0.95,
  "language": "uk",
  "parameters": {
    "slideNumbers": [2, 3, 4],
    "batchEditPlan": {
      "slide-2": "зміни заголовок",
      "slide-3": "додай картинку", 
      "slide-4": "зроби текст більшим"
    },
    "affectedSlides": "specific",
    "batchOperation": true,
    "rawMessage": "в другому слайді зміни заголовок, в третьому додай картинку, а в четвертому зроби текст більшим"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "improve first slide" (with active lesson)
ANALYSIS: User wants to improve the first slide (ordinal number)
RESPONSE:
{
  "intent": "EDIT_SLIDE",
  "confidence": 0.95,
  "language": "en",
  "parameters": {
    "slideNumber": 1,
    "instruction": "improve slide",
    "rawMessage": "improve first slide"
  },
  "isDataSufficient": true,
  "missingData": []
}

MESSAGE: "change the slide" (with active lesson having multiple slides)
ANALYSIS: User wants to change a slide but didn't specify which one
RESPONSE:
{
  "intent": "EDIT_SLIDE",
  "confidence": 0.85,
  "language": "en",
  "parameters": {
    "slideNumber": null,
    "instruction": "change slide",
    "rawMessage": "change the slide"
  },
  "isDataSufficient": false,
  "missingData": ["slideNumber"],
  "suggestedQuestion": "Which slide would you like to change? Please specify the slide number (1-3)."
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
        language: parsed.language || 'en',
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
      'GENERATE_PLAN': UserIntent.CREATE_LESSON, // Map GENERATE_PLAN to CREATE_LESSON
      'EDIT_PLAN': UserIntent.EDIT_PLAN,
      'CREATE_SLIDE': UserIntent.CREATE_SLIDE,
      'CREATE_NEW_SLIDE': UserIntent.CREATE_NEW_SLIDE,
      'REGENERATE_SLIDE': UserIntent.REGENERATE_SLIDE,
      'EDIT_HTML_INLINE': UserIntent.EDIT_HTML_INLINE,
      'EDIT_SLIDE': UserIntent.EDIT_SLIDE,
      'BATCH_EDIT_SLIDES': UserIntent.BATCH_EDIT_SLIDES,
      'IMPROVE_HTML': UserIntent.IMPROVE_HTML,
      'FREE_CHAT': UserIntent.FREE_CHAT,
      'HELP': UserIntent.HELP
    };

    return intentMap[intent.toUpperCase()] || UserIntent.FREE_CHAT;
  }


} 