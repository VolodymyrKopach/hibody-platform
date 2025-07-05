import { IntentDetectionResult } from '../../intent/IIntentDetectionService';
import { ConversationHistory, ChatResponse } from '../types';

// Open/Closed Principle: Інтерфейс для обробників намірів
export interface IIntentHandler {
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean;
  handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse>;
} 