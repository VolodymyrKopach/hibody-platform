// Експортуємо типи для використання в інших частинах системи
import { SimpleLesson, SlideGenerationProgress, SlideDescription } from '@/types/chat';
import { IntentDetectionResult } from '../intent/IIntentDetectionService';

export interface ConversationHistory {
  step: 'planning' | 'slide_generation' | 'plan_editing' | 'data_collection' | 'bulk_generation';
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
  
  // === НОВІ ПОЛЯ ДЛЯ МАСОВОЇ ГЕНЕРАЦІЇ СЛАЙДІВ ===
  slideDescriptions?: SlideDescription[]; // Всі описи слайдів з плану
  slideGenerationProgress?: SlideGenerationProgress[]; // Прогрес генерації кожного слайду
  bulkGenerationStartTime?: Date; // Час початку масової генерації
  isGeneratingAllSlides?: boolean; // Флаг що показує чи генеруються всі слайди
  
  // === КОНТЕКСТ РОЗМОВИ ===
  conversationContext?: string; // Стиснений контекст всієї розмови
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