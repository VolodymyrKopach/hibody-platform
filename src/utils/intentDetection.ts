// AI-Based Intent Detection System
// Підтримує багато мов та використовує Gemini для визначення намірів
import { GeminiIntentService } from '@/services/intent/GeminiIntentService';
import { UserIntent } from '@/services/intent/IIntentDetectionService';

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number;
  language: string;
  reasoning: string;
  parameters: {
    topic?: string | null;
    age?: string | null;
    slideNumber?: number | null;
    instruction?: string | null;
    rawMessage?: string;
  };
  isDataSufficient?: boolean;
  missingData?: string[];
  suggestedQuestion?: string;
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

// Основна функція для детекції намірів через Gemini
export async function detectIntent(
  message: string, 
  conversationHistory?: any
): Promise<IntentDetectionResult> {
  const geminiService = new GeminiIntentService();
  return await geminiService.detectIntent(message, conversationHistory);
}

// ВИДАЛЕНО: fallbackIntentDetection та extractMultilingualKeywords 
// ВСЕ має йти через нейронну мережу! 