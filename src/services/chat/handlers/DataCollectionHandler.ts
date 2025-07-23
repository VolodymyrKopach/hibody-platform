import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { GeminiIntentService, EnhancedIntentDetectionResult } from '../../intent/GeminiIntentService';
import { EnhancedCreateLessonHandler } from './EnhancedCreateLessonHandler';
import { GeminiContentService } from '../../content/GeminiContentService';

// Handler for collecting missing data from users
export class DataCollectionHandler implements IIntentHandler {
  private geminiService: GeminiIntentService | null = null;
  private lessonHandler: EnhancedCreateLessonHandler | null = null;
  private contentService: GeminiContentService | null = null;

  constructor() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found in environment variables (GEMINI_API_KEY)');
    }
    this.contentService = new GeminiContentService();
  }

  private getGeminiService(): GeminiIntentService {
    if (!this.geminiService) {
      this.geminiService = new GeminiIntentService();
    }
    return this.geminiService;
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
    // Note: conversationHistory is always present (created by API adapter) but may only contain context
    if (intent.intent === UserIntent.CREATE_LESSON && 
        (!conversationHistory?.step || conversationHistory.step === 'planning') && 
        !conversationHistory?.planningResult &&
        enhancedIntent.isDataSufficient === false) {
      return true;
    }
    
    return false;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    
    // Handle first request with insufficient data
    if ((!conversationHistory?.step || conversationHistory.step === 'planning') && 
        !conversationHistory?.planningResult &&
        enhancedIntent.isDataSufficient === false) {
      console.log('❌ Insufficient data for CREATE_LESSON, asking for missing information');
      
      // === PRESERVE CONVERSATION CONTEXT FROM INITIAL REQUEST ===
      const preservedContext = conversationHistory?.conversationContext;
      
      if (preservedContext) {
        console.log(`📝 [DATA COLLECTION] Preserving conversation context: ${preservedContext.length} chars`);
      }
      
      return {
        success: true,
        message: `🤔 ${enhancedIntent.suggestedQuestion || 'Please provide additional information to create the lesson.'}`, // Translated
        conversationHistory: {
          step: 'data_collection',
          pendingIntent: enhancedIntent,
          missingData: enhancedIntent.missingData || [],
          // === PRESERVE CONVERSATION CONTEXT ===
          conversationContext: preservedContext
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
      
      // === PASS CONVERSATION CONTEXT TO RE-ANALYSIS ===
      // Preserve the conversation context when re-analyzing intent
      const contextualConversationHistory = {
        ...conversationHistory,
        conversationContext: conversationHistory.conversationContext
      };
      
      if (conversationHistory.conversationContext) {
        console.log(`📝 [DATA COLLECTION] Using conversation context for re-analysis: ${conversationHistory.conversationContext.length} chars`);
      }
      
      // Re-analyze with Gemini to check if we now have sufficient data
      const reAnalyzedIntent = await this.getGeminiService().detectIntent(combinedMessage, contextualConversationHistory);

      console.log(`🎯 Re-analysis result: ${reAnalyzedIntent.intent}, sufficient: ${reAnalyzedIntent.isDataSufficient}`);

      if (reAnalyzedIntent.isDataSufficient) {
        console.log('✅ Sufficient data collected, proceeding with lesson creation');
        
        // === PASS CONVERSATION CONTEXT TO LESSON HANDLER ===
        // Pass the conversation context to the lesson handler for better lesson generation
        return await this.getLessonHandler().handle(reAnalyzedIntent, contextualConversationHistory);
      } else {
        // Still missing data, ask for more
        console.log(`❌ Still missing data:`, reAnalyzedIntent.missingData);
        
        return {
          success: true,
          message: `🤔 ${reAnalyzedIntent.suggestedQuestion || 'Please provide additional information.'}\n\n**Help clarify details for creating a better lesson.**`, // Translated
          conversationHistory: {
            ...conversationHistory,
            pendingIntent: reAnalyzedIntent,
            // === PRESERVE CONVERSATION CONTEXT ===
            conversationContext: conversationHistory.conversationContext
          },
          actions: []
        };
      }
    } catch (error) {
      console.error('Data collection error:', error);
      
      return {
        success: false,
        message: `Sorry, an error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with a complete description.`, // Translated
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 