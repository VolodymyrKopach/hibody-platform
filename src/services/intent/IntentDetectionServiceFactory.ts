import { IIntentDetectionService } from './IIntentDetectionService';
import { GeminiIntentService } from './GeminiIntentService';

export class IntentDetectionServiceFactory {
  static create(): IIntentDetectionService {
    // Using Gemini 2.5 Flash Lite for fast and cost-effective intent detection
    return new GeminiIntentService();
  }
} 