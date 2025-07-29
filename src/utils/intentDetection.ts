// AI-Based Intent Detection System
// Supports multiple languages and uses Gemini for intent detection
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
You are an expert AI assistant for analyzing user messages in an educational content creation platform called TeachSpark.

TeachSpark Platform allows teachers to create interactive HTML lessons for children through natural language commands.

Your task is to analyze the user's message and determine their intent with high accuracy.

SUPPORTED INTENTS:
1. CREATE_LESSON - User wants to create a new lesson
   Examples: "create lesson about dinosaurs", "create lesson about animals", "make a lesson about space"

2. GENERATE_PLAN - User wants to create a lesson plan/structure
   Examples: "create lesson plan", "make a lesson plan", "compose a lesson plan"

3. CREATE_SLIDE - User wants to create a single slide
   Examples: "create slide about animals", "create slide about space", "make a slide about numbers"

4. CREATE_NEW_SLIDE - User wants to add a new slide to existing lesson
   Examples: "add slide about a giraffe", "add slide about tigers", "add slide about birds"

5. REGENERATE_SLIDE - User wants to completely regenerate an existing slide
   Examples: "regenerate slide 2", "regenerate slide 3", "recreate slide 1"

6. EDIT_HTML_INLINE - User wants to make specific text changes
   Examples: "replace 'elephant' with 'tiger'", "replace 'elephant' with 'tiger'", "replace 'cat' with 'dog'"

7. EDIT_SLIDE - User wants to edit/improve an existing slide
   Examples: "improve slide 2", "improve slide 1", "fix slide 3"

8. IMPROVE_HTML - User wants general improvements (colors, animations, etc.)
   Examples: "make it brighter", "make it more colorful", "make it prettier"

9. FREE_CHAT - General conversation, questions, or unclear intent
   Examples: "how are you?", "what is this?", "help"

10. HELP - User asks for help or instructions
    Examples: "help me", "help", "how to use", "what can I do?"

11. EXPORT - User wants to export/download lesson
    Examples: "export lesson", "download lesson", "download lesson"

12. PREVIEW - User wants to preview/view lesson
    Examples: "show lesson", "preview lesson", "view lesson"

PARAMETER EXTRACTION:
- slideNumber: Extract slide numbers (1, 2, 3, etc.)
- topic: Extract the main topic/subject
- age: Extract age information ("for children 6 years old", "for kids 5 years old")
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
    "topic": "dinosaurs",
    "age": "6 years old",
    "slideNumber": null,
    "targetElement": null,
    "rawMessage": "create lesson about dinosaurs for 6 years old children"
  },
  "language": "en",
  "reasoning": "User clearly wants to create a new lesson about dinosaurs for 6-year-old children. High confidence due to clear keywords."
}

Analyze this message and return only valid JSON:
`;

// Main function for intent detection via Gemini
export async function detectIntent(
  message: string, 
  conversationHistory?: any
): Promise<IntentDetectionResult> {
  const geminiService = new GeminiIntentService();
  return await geminiService.detectIntent(message, conversationHistory);
}

// DELETED: fallbackIntentDetection and extractMultilingualKeywords 
// EVERYTHING should go through the neural network! 