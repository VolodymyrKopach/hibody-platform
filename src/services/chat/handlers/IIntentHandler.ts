import { IntentDetectionResult } from '../../intent/IIntentDetectionService';
import { ConversationHistory } from '../types';

// Interface Segregation Principle: Кожен handler має свою відповідальність
export interface IIntentHandler {
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean;
  handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatHandlerResult>;
}

export interface ChatHandlerResult {
  success: boolean;
  message: string;
  conversationHistory?: ConversationHistory;
  actions?: Array<{
    action: string;
    label: string;
    description?: string;
  }>;
  error?: string;
}

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