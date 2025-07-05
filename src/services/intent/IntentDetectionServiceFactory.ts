import { IIntentDetectionService } from './IIntentDetectionService';
import { ClaudeHaikuIntentService } from './ClaudeHaikuIntentService';
import { ClaudeIntentDetectionService } from './ClaudeIntentDetectionService';

// Factory for creating Claude Haiku intent detection service ONLY
export class IntentDetectionServiceFactory {
  
  static create(): IIntentDetectionService {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    if (claudeApiKey) {
      console.log('✅ Using Claude Haiku for enhanced intent detection');
      return new ClaudeHaikuIntentService(claudeApiKey);
    } else {
      console.warn('⚠️ CLAUDE_API_KEY not found, using fallback intent detection');
      return new ClaudeIntentDetectionService('');
    }
  }
} 