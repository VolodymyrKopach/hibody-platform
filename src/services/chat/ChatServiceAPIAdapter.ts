import { SlideDescription, SimpleLesson, SlideGenerationProgress, SimpleSlide } from '@/types/chat';
import { ConversationHistory, ChatResponse } from './types';
import { ContextCompressionService } from '@/services/context/ContextCompressionService';

// Client-side callbacks for real-time updates
export interface ParallelGenerationCallbacks {
  onSlideReady?: (slide: SimpleSlide) => void;
  onProgressUpdate?: (progress: SlideGenerationProgress) => void;
  onError?: (error: string, slideIndex?: number) => void;
  onComplete?: (lesson: SimpleLesson) => void;
}

/**
 * Client-side adapter that makes API calls to server endpoints
 * instead of instantiating Gemini services directly in the browser
 */
export class ChatServiceAPIAdapter {
  private baseURL: string;
  private compressionService: ContextCompressionService;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    this.compressionService = new ContextCompressionService();
  }

  /**
   * Prepare conversation context by checking tokens and compressing if needed
   */
  private async prepareConversationContext(
    conversationHistory?: ConversationHistory,
    conversationContext?: string
  ): Promise<{
    conversationHistory?: ConversationHistory; 
    compressionApplied: boolean;
  }> {
    // If no context provided, return as is
    if (!conversationContext && !conversationHistory) {
      return { conversationHistory, compressionApplied: false };
    }

    // Prepare conversation history object
    const preparedHistory: ConversationHistory = conversationHistory ? 
      { ...conversationHistory } : 
      { step: 'planning' }; // Default step if no conversation history

    // Check conversation context size
    if (conversationContext) {
      const contextTokens = this.compressionService.estimateTokens(conversationContext);
      
      console.log(`🔍 [API Adapter] Checking context size: ${conversationContext.length} chars (${contextTokens} tokens)`);
      
      if (this.compressionService.shouldCompress(conversationContext)) {
        console.log('🤖 [API Adapter] Compressing context before sending request...');
        
        try {
          const compressedContext = await this.compressionService.adaptiveCompression(conversationContext);
          const finalTokens = this.compressionService.estimateTokens(compressedContext);
          
          console.log(`📉 [API Adapter] Context compressed: ${conversationContext.length} → ${compressedContext.length} chars`);
          console.log(`📊 [API Adapter] Tokens reduced: ${contextTokens} → ${finalTokens} tokens`);
          
          // === PUT COMPRESSED CONTEXT INTO CONVERSATION HISTORY ===
          preparedHistory.conversationContext = compressedContext;
          
          return { 
            conversationHistory: preparedHistory, 
            compressionApplied: true 
          };
        } catch (error) {
          console.error('❌ [API Adapter] Context compression failed:', error);
          
          // Fallback to simple truncation
          const parts = conversationContext.split(' | ');
          const fallbackContext = [parts[0], ...parts.slice(-8)].join(' | ');
          
          console.log(`📉 [API Adapter] Using fallback truncation: ${conversationContext.length} → ${fallbackContext.length} chars`);
          
          // === PUT FALLBACK CONTEXT INTO CONVERSATION HISTORY ===
          preparedHistory.conversationContext = fallbackContext;
          
          return { 
            conversationHistory: preparedHistory, 
            compressionApplied: true 
          };
        }
      } else {
        // === PUT ORIGINAL CONTEXT INTO CONVERSATION HISTORY ===
        preparedHistory.conversationContext = conversationContext;
      }
    }

    // Check conversation history size
    if (conversationHistory) {
      const historyString = JSON.stringify(conversationHistory);
      const historyTokens = this.compressionService.estimateTokens(historyString);
      
      console.log(`🔍 [API Adapter] Conversation history size: ${historyString.length} chars (${historyTokens} tokens)`);
      
      // If history is too large, we might need to compress some fields
      if (historyTokens > 3000) {
        console.log('⚠️ [API Adapter] Conversation history is large, consider optimizing');
      }
    }

    return { conversationHistory: preparedHistory, compressionApplied: false };
  }

  /**
   * Send chat message to server API with pre-request context compression
   */
  async sendMessage(
    message: string, 
    conversationHistory?: ConversationHistory,
    action?: string,
    conversationContext?: string
  ): Promise<ChatResponse> {
    try {
      console.log('📤 [API Adapter] Preparing message for chat API...');
      
      // === PRE-REQUEST COMPRESSION CHECK ===
      const { 
        conversationHistory: preparedHistory, 
        compressionApplied 
      } = await this.prepareConversationContext(conversationHistory, conversationContext);

      if (compressionApplied) {
        console.log('✅ [API Adapter] Context compression applied before request');
      }
      
      console.log('📤 [API Adapter] Sending message to chat API...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: preparedHistory,
          action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Chat API request failed');
      }

      const result = await response.json();
      console.log('✅ [API Adapter] Chat response received');
      
      return result;

    } catch (error) {
      console.error('❌ [API Adapter] Chat API error:', error);
      throw error;
    }
  }

  // /**
  //  * Handle plan approval with parallel slide generation via API
  //  */
  // async handleApprovePlanParallel(
  //   conversationHistory: ConversationHistory,
  //   callbacks?: ParallelGenerationCallbacks
  // ): Promise<ChatResponse> {
  //   try {
  //     if (!conversationHistory?.planningResult) {
  //       throw new Error('No plan to approve');
  //     }
  //
  //     console.log('🎨 [API Adapter] Starting parallel generation via API...');
  //
  //     // Extract slide descriptions from the plan
  //     const slideDescriptions = this.extractAllSlideDescriptions(conversationHistory.planningResult);
  //
  //     console.log('📋 [API Adapter] Extracted slide descriptions:', slideDescriptions.length);
  //
  //     // Note: Sequential generation endpoint has been removed
  //     throw new Error('Sequential generation endpoint has been removed. Use parallel generation instead.');
  //
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.details || errorData.error || 'Parallel generation API request failed');
  //     }
  //
  //     const result = await response.json();
  //
  //     console.log('✅ [API Adapter] Parallel generation completed via API');
  //
  //     // Simulate real-time callbacks since we can't get them from a simple HTTP request
  //     // In a real implementation, you'd use WebSockets or Server-Sent Events
  //     if (callbacks?.onComplete && result.lesson) {
  //       callbacks.onComplete(result.lesson);
  //     }
  //
  //     // Return a chat response format
  //      return {
  //        success: true,
  //        message: result.message || 'Slides generated successfully!',
  //        lesson: result.lesson,
  //        conversationHistory: {
  //          ...conversationHistory,
  //          currentLesson: result.lesson,
  //          step: 'slide_generation'
  //        }
  //      };
  //
  //   } catch (error) {
  //     console.error('❌ [API Adapter] Parallel generation error:', error);
  //
  //     if (callbacks?.onError) {
  //       callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
  //     }
  //
  //     throw error;
  //   }
  // }

  /**
   * Extract slide descriptions from plan text
   * This is the same logic that was in ChatServiceParallelAdapter
   */
  private extractAllSlideDescriptions(planText: string): SlideDescription[] {
    const slideDescriptions: SlideDescription[] = [];
    const slideRegex = /### Slide (\\d+):\\s*([^(]+)(?:\\((\\d+)-(\\d+)\\s+min\\))?\\s*\\*\\*Type:\\*\\*\\s*([^\\*]+)\\s*\\*\\*Goal:\\*\\*\\s*([^\\*]+)\\s*\\*\\*Content:\\*\\*\\s*(.*?)(?=\\*\\*Interactive elements:\\*\\*|\\*\\*|$)/g;
    
    let match;
    while ((match = slideRegex.exec(planText)) !== null) {
      const slideNumber = parseInt(match[1]);
      const title = match[2].trim();
      const type = match[5].trim();
      const goal = match[6].trim();
      const content = match[7].trim();
      
      slideDescriptions.push({
        slideNumber,
        title,
        type,
        goal,
        content,
        description: `${goal}\n\n${content}`
      });
    }
    
    console.log(`📋 [API Adapter] Extracted ${slideDescriptions.length} slide descriptions`);
    return slideDescriptions;
  }

  /**
   * Edit existing plan via API
   */
  async editPlan(
    currentPlan: string,
    userChanges: string,
    topic: string,
    age: string
  ): Promise<string> {
    try {
      console.log('✏️ [API Adapter] Editing plan via API...');
      
      const response = await fetch('/api/content/edit-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPlan,
          userChanges,
          topic,
          age
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Plan editing API request failed');
      }

      const result = await response.json();
      console.log('✅ [API Adapter] Plan edited successfully');
      
      return result.editedPlan;

    } catch (error) {
      console.error('❌ [API Adapter] Plan editing error:', error);
      throw error;
    }
  }

  /**
   * Generate single slide content via API
   */
  async generateSlideContent(
    slideDescription: string,
    topic: string,
    age: string
  ): Promise<string> {
    try {
      console.log('🎯 [API Adapter] Generating slide content via API...');
      
      const response = await fetch('/api/content/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideDescription,
          topic,
          age
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Slide content generation API request failed');
      }

      const result = await response.json();
      console.log('✅ [API Adapter] Slide content generated successfully');
      
      return result.htmlContent;

    } catch (error) {
      console.error('❌ [API Adapter] Slide content generation error:', error);
      throw error;
    }
  }
} 