// AI-Based Intent Detection System
// Підтримує багато мов та використовує Claude для визначення намірів

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number;
  parameters: IntentParameters;
  language: 'uk' | 'en' | 'ru' | 'other';
  reasoning: string;
}

export interface IntentParameters {
  topic?: string;
  age?: string;
  slideNumber?: number;
  targetElement?: string;
  slideSubject?: string;
  slideType?: string;
  targetText?: string;
  newText?: string;
  keywords?: string[];
  rawMessage: string;
}

export enum UserIntent {
  CREATE_LESSON = 'CREATE_LESSON',
  GENERATE_PLAN = 'GENERATE_PLAN',
  CREATE_SLIDE = 'CREATE_SLIDE',
  CREATE_NEW_SLIDE = 'CREATE_NEW_SLIDE',
  REGENERATE_SLIDE = 'REGENERATE_SLIDE',
  EDIT_HTML_INLINE = 'EDIT_HTML_INLINE',
  EDIT_SLIDE = 'EDIT_SLIDE',
  IMPROVE_HTML = 'IMPROVE_HTML',
  FREE_CHAT = 'FREE_CHAT',
  HELP = 'HELP',
  EXPORT = 'EXPORT',
  PREVIEW = 'PREVIEW'
}

const INTENT_DETECTION_PROMPT = `
You are an expert AI assistant for analyzing user messages in an educational content creation platform called HiBody.

HiBody Platform allows teachers to create interactive HTML lessons for children through natural language commands.

Your task is to analyze the user's message and determine their intent with high accuracy.

SUPPORTED INTENTS:
1. CREATE_LESSON - User wants to create a new lesson
   Examples: "створи урок про динозаврів", "create lesson about animals", "сделай урок о космосе"

2. GENERATE_PLAN - User wants to create a lesson plan/structure
   Examples: "створи план уроку", "make a lesson plan", "составь план урока"

3. CREATE_SLIDE - User wants to create a single slide
   Examples: "створи слайд про тварин", "create slide about space", "сделай слайд о числах"

4. CREATE_NEW_SLIDE - User wants to add a new slide to existing lesson
   Examples: "додай слайд про жирафа", "add slide about tigers", "добавь слайд про птиц"

5. REGENERATE_SLIDE - User wants to completely regenerate an existing slide
   Examples: "перегенеруй слайд 2", "regenerate slide 3", "пересоздай слайд 1"

6. EDIT_HTML_INLINE - User wants to make specific text changes
   Examples: "заміни 'слон' на 'тигр'", "replace 'elephant' with 'tiger'", "замени 'кот' на 'собака'"

7. EDIT_SLIDE - User wants to edit/improve an existing slide
   Examples: "покращ слайд 2", "improve slide 1", "исправь слайд 3"

8. IMPROVE_HTML - User wants general improvements (colors, animations, etc.)
   Examples: "зроби яскравішим", "make it more colorful", "сделай красивее"

9. FREE_CHAT - General conversation, questions, or unclear intent
   Examples: "як справи?", "what is this?", "помощь"

10. HELP - User asks for help or instructions
    Examples: "допоможи", "help", "как пользоваться", "що я можу робити?"

11. EXPORT - User wants to export/download lesson
    Examples: "експортуй урок", "download lesson", "скачать урок"

12. PREVIEW - User wants to preview/view lesson
    Examples: "покажи урок", "preview lesson", "посмотреть урок"

PARAMETER EXTRACTION:
- slideNumber: Extract slide numbers (1, 2, 3, etc.)
- topic: Extract the main topic/subject
- age: Extract age information ("для дітей 6 років", "for kids 5 years old")
- targetElement: Extract what specifically to edit/change
- targetText and newText: For replacement commands
- slideSubject: For new slides, what should they be about
- slideType: Determine if it's intro, content, activity, quiz, summary, game, or welcome

LANGUAGE DETECTION:
- uk: Ukrainian language
- en: English language  
- ru: Russian language
- other: Other languages

RESPONSE FORMAT (JSON only):
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "6 років",
    "slideNumber": null,
    "targetElement": null,
    "rawMessage": "створи урок про динозаврів для дітей 6 років"
  },
  "language": "uk",
  "reasoning": "User clearly wants to create a new lesson about dinosaurs for 6-year-old children. High confidence due to clear keywords."
}

Analyze this message and return only valid JSON:
`;

export async function detectIntentWithAI(message: string, conversationHistory?: any): Promise<IntentDetectionResult> {
  // ТІЛЬКИ нейронна мережа - НІЯКИХ fallback функцій!
  return await detectIntentDirectly(message, conversationHistory);
}

// Direct Claude API call for intent detection
async function detectIntentDirectly(message: string, conversationHistory?: any): Promise<IntentDetectionResult> {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key required - no regex fallback allowed');
  }

  const prompt = conversationHistory 
    ? `${INTENT_DETECTION_PROMPT}

Context:
- Current step: ${conversationHistory.step || 'unknown'}
- Active lesson: ${conversationHistory.currentLesson ? 'YES' : 'NO'}
- Lesson topic: ${conversationHistory.lessonTopic || 'none'}
- User age: ${conversationHistory.age || 'none'}
- Generated slides: ${conversationHistory.slidesCount || 0}

Message to analyze: "${message}"`
    : `${INTENT_DETECTION_PROMPT}

Message to analyze: "${message}"`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
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

  try {
    const result = JSON.parse(content);
    
    // Map the intent to our UserIntent enum and add commandType
    return {
      intent: result.intent as UserIntent,
      confidence: result.confidence || 0.8,
      parameters: {
        ...result.parameters,
        rawMessage: message
      },
      language: result.language || 'other',
      reasoning: result.reasoning || 'AI-based neural network detection'
    };
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content);
    throw new Error('Invalid JSON response from Claude - neural network required');
  }
}

// ВИДАЛЕНО: fallbackIntentDetection та extractMultilingualKeywords 
// ВСЕ має йти через нейронну мережу! 