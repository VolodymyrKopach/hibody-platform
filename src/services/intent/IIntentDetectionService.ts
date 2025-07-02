// Single Responsibility Principle: Інтерфейс для визначення намірів
export interface IIntentDetectionService {
  detectIntent(message: string): Promise<IntentDetectionResult>;
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
}

export enum UserIntent {
  CREATE_LESSON = 'create_lesson',
  GENERATE_PLAN = 'generate_plan',
  CREATE_SLIDE = 'create_slide',
  CREATE_NEW_SLIDE = 'create_new_slide',
  REGENERATE_SLIDE = 'regenerate_slide',
  EDIT_HTML_INLINE = 'edit_html_inline',
  EDIT_SLIDE = 'edit_slide',
  IMPROVE_HTML = 'improve_html',
  FREE_CHAT = 'free_chat',
  HELP = 'help',
  EXPORT = 'export',
  PREVIEW = 'preview'
} 