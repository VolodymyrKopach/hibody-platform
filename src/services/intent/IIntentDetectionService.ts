// Single Responsibility Principle: Інтерфейс для визначення намірів
export interface IIntentDetectionService {
  detectIntent(message: string, conversationHistory?: any): Promise<IntentDetectionResult>;
}

// Типи для batch операцій
export interface BatchEditRequest {
  slideNumbers: number[];
  editInstruction: string;
  affectedSlides: 'all' | 'specific' | 'range';
  lessonId: string;
  sessionId?: string;
}

export interface SlideRangeDetection {
  type: 'all' | 'specific' | 'range' | 'single';
  numbers: number[];
  range?: { start: number; end: number };
  totalSlides?: number;
}

// Open/Closed Principle: Базовий результат, який можна розширювати
export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number;
  parameters: IntentParameters;
  language: 'uk' | 'en' | 'ru' | 'other';
  reasoning: string;
}

export interface IntentParameters {
  slideNumber?: number;
  topic?: string;
  age?: string;
  lessonType?: string;
  targetElement?: string;
  keywords?: string[];
  slideSubject?: string;
  slideType?: 'intro' | 'content' | 'activity' | 'quiz' | 'summary' | 'game' | 'welcome';
  regenerationInstruction?: string;
  actionType?: 'replace' | 'delete' | 'rename' | 'edit';
  targetText?: string;
  newText?: string;
  rawMessage: string;
  
  // Batch editing parameters
  slideNumbers?: number[];        // [1, 3, 5] - які слайди редагувати
  editInstruction?: string;       // "make titles bigger"
  affectedSlides?: 'all' | 'specific' | 'range' | 'single';
  batchOperation?: boolean;       // true для batch операцій
  slideRange?: { start: number; end: number }; // для range операцій
  batchEditPlan?: Record<string, string>; // slideId -> instruction for complex batch edits
}

export enum UserIntent {
  CREATE_LESSON = 'create_lesson',
  GENERATE_PLAN = 'generate_plan',
  EDIT_PLAN = 'edit_plan',
  GENERATE_SLIDES = 'generate_slides',
  CREATE_SLIDE = 'create_slide',
  CREATE_NEW_SLIDE = 'create_new_slide',
  REGENERATE_SLIDE = 'regenerate_slide',
  EDIT_HTML_INLINE = 'edit_html_inline',
  EDIT_SLIDE = 'edit_slide',
  BATCH_EDIT_SLIDES = 'batch_edit_slides',  // Новий інтент для batch редагування
  IMPROVE_HTML = 'improve_html',
  FREE_CHAT = 'free_chat',
  HELP = 'help'
} 