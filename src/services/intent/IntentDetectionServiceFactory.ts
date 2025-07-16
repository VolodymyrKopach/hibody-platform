import { IIntentDetectionService } from './IIntentDetectionService';
import { GeminiIntentService } from './GeminiIntentService';

export class IntentDetectionServiceFactory {
  static create(): IIntentDetectionService {
    // Використовуємо Gemini замість Claude Haiku
    return new GeminiIntentService();
  }
} 