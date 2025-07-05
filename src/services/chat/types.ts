// Експортуємо типи для використання в інших частинах системи
import { SimpleLesson } from '@/types/chat';
import { IntentDetectionResult } from '../intent/IIntentDetectionService';

export interface ConversationHistory {
  step: 'planning' | 'slide_generation' | 'plan_editing' | 'data_collection';
  planningResult?: string;
  approvedPlan?: string;
  generationMode?: 'individual' | 'batch';
  totalSlides?: number;
  currentSlideIndex?: number;
  generatedSlides?: Array<{ id: number; html: string }>;
  originalMessage?: string;
  pendingIntent?: IntentDetectionResult; // For data collection
  missingData?: string[]; // For data collection
  
  // Додаткові поля для генерації уроків
  lessonTopic?: string;
  lessonAge?: string;
  currentLesson?: SimpleLesson;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversationHistory?: ConversationHistory;
  actions?: ChatAction[];
  error?: string;
  lesson?: SimpleLesson; // Використовуємо SimpleLesson замість any
}

export interface ChatAction {
  action: string;
  label: string;
  description?: string;
} 