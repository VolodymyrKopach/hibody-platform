import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { ClaudeHaikuIntentService, EnhancedIntentDetectionResult } from '../../intent/ClaudeHaikuIntentService';
import { EnhancedCreateLessonHandler } from './EnhancedCreateLessonHandler';
import { ClaudeSonnetContentService } from '../../content/ClaudeSonnetContentService';

// Handler for collecting missing data from users
export class DataCollectionHandler implements IIntentHandler {
  private haikuService: ClaudeHaikuIntentService | null = null;
  private lessonHandler: EnhancedCreateLessonHandler | null = null;
  private contentService: ClaudeSonnetContentService | null = null;

  constructor() {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      throw new Error('Claude API key not found in environment variables (CLAUDE_API_KEY)');
    }
    this.contentService = new ClaudeSonnetContentService(claudeApiKey);
  }

  private getHaikuService(): ClaudeHaikuIntentService {
    if (!this.haikuService) {
      const claudeApiKey = process.env.CLAUDE_API_KEY;
      if (!claudeApiKey) {
        throw new Error('Claude API key required for DataCollectionHandler');
      }
      this.haikuService = new ClaudeHaikuIntentService(claudeApiKey);
    }
    return this.haikuService;
  }

  private getLessonHandler(): EnhancedCreateLessonHandler {
    if (!this.lessonHandler) {
      this.lessonHandler = new EnhancedCreateLessonHandler();
    }
    return this.lessonHandler;
  }
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    
    // Handle data collection step
    if (conversationHistory?.step === 'data_collection' && conversationHistory.pendingIntent) {
      return true;
    }
    
    // Handle CREATE_LESSON with insufficient data (first request)
    if (intent.intent === UserIntent.CREATE_LESSON && 
        !conversationHistory && 
        enhancedIntent.isDataSufficient === false) {
      return true;
    }
    
    return false;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    
    // Handle first request with insufficient data
    if (!conversationHistory && enhancedIntent.isDataSufficient === false) {
      console.log('❌ Insufficient data for CREATE_LESSON, asking for missing information');
      
      return {
        success: true,
        message: `🤔 ${enhancedIntent.suggestedQuestion || 'Будь ласка, надайте додаткову інформацію для створення уроку.'}

**Приклади:**
• "для дітей 6 років"
• "для дошкільнят 4-5 років"  
• "для школярів 8-10 років"`,
        conversationHistory: {
          step: 'data_collection',
          pendingIntent: enhancedIntent,
          missingData: enhancedIntent.missingData || []
        },
        actions: []
      };
    }
    
    // Handle follow-up data collection
    if (!conversationHistory?.pendingIntent) {
      throw new Error('No pending intent in conversation history');
    }

    console.log('🔍 Re-analyzing message with additional context...');

    try {
      // Combine original message with new information
      const originalMessage = conversationHistory.pendingIntent.parameters.rawMessage;
      const newMessage = intent.parameters.rawMessage;
      const combinedMessage = `${originalMessage} ${newMessage}`;
      
      console.log(`📝 Combined message: "${combinedMessage}"`);
      
      // Re-analyze with Haiku to check if we now have sufficient data
      const reAnalyzedIntent = await this.getHaikuService().detectIntent(combinedMessage, conversationHistory);

      console.log(`🎯 Re-analysis result: ${reAnalyzedIntent.intent}, sufficient: ${reAnalyzedIntent.isDataSufficient}`);

      if (reAnalyzedIntent.isDataSufficient) {
        console.log('✅ Sufficient data collected, proceeding with lesson creation');
        
        // Now we have enough data, proceed with lesson creation
        return await this.getLessonHandler().handle(reAnalyzedIntent);
      } else {
        // Still missing data, ask for more
        console.log(`❌ Still missing data:`, reAnalyzedIntent.missingData);
        
        return {
          success: true,
          message: `🤔 ${reAnalyzedIntent.suggestedQuestion || 'Будь ласка, надайте додаткову інформацію.'}

**Допоможіть уточнити деталі для створення кращого уроку.**`,
          conversationHistory: {
            ...conversationHistory,
            pendingIntent: reAnalyzedIntent
          },
          actions: []
        };
      }
    } catch (error) {
      console.error('Data collection error:', error);
      
      return {
        success: false,
        message: `Вибачте, сталася помилка при обробці вашого запиту: ${error instanceof Error ? error.message : 'Невідома помилка'}. Спробуйте ще раз з повним описом.`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 