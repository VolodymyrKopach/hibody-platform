// Експортуємо типи для використання в інших частинах системи
export interface ConversationHistory {
  step: 'planning' | 'plan_editing' | 'slide_generation' | 'completed';
  planningResult?: string;
  approvedPlan?: string;
  generationMode: 'individual' | 'global';
  totalSlides: number;
  currentSlideIndex?: number;
  generatedSlides?: any[];
  originalMessage?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversationHistory?: ConversationHistory;
  actions?: ChatAction[];
  error?: string;
}

export interface ChatAction {
  action: string;
  label: string;
  description?: string;
} 