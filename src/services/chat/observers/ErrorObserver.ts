import { GoogleGenAI } from "@google/genai";
import { ChatResponse, ConversationHistory } from '../types';
import { IntentDetectionResult } from '../../intent/IIntentDetectionService';

export interface ErrorContext {
  userMessage: string;
  conversationHistory?: ConversationHistory;
  intentResult?: IntentDetectionResult;
  originalError?: string;
}

/**
 * ErrorObserver - intercepts errors before sending to client
 * and transforms them into friendly messages via AI
 */
export class ErrorObserver {
  private genAI: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for ErrorObserver');
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Intercepts error and transforms it into friendly message
   */
  async interceptError(
    errorResponse: ChatResponse, 
    context: ErrorContext
  ): Promise<ChatResponse> {
    console.log('🔍 [ERROR OBSERVER] Intercepting error:', errorResponse.error);

    // Check if we need to intercept
    if (!this.shouldIntercept(errorResponse)) {
      return errorResponse;
    }

    try {
      // Generate friendly message via AI
      const friendlyMessage = await this.generateFriendlyMessage(errorResponse, context);
      
      // Return as successful response (not error!)
      return {
        success: true, // ✅ Important: this is NOT an error for the client
        message: friendlyMessage,
        conversationHistory: errorResponse.conversationHistory,
        actions: errorResponse.actions || []
      };
    } catch (aiError) {
      console.error('❌ [ERROR OBSERVER] AI generation failed:', aiError);
      
      // If AI fails, return original error response
      return errorResponse;
    }
  }

  /**
   * Determines if this error should be intercepted
   */
  private shouldIntercept(response: ChatResponse): boolean {
    // Intercept only errors
    if (response.success) return false;
    
    // Can add logic to skip certain types of errors
    // For example, leave system errors as is
    return true;
  }

  /**
   * Generates friendly message via Gemini 2.5 Flash Lite
   */
  private async generateFriendlyMessage(
    errorResponse: ChatResponse,
    context: ErrorContext
  ): Promise<string> {
    const prompt = this.buildErrorTransformPrompt(errorResponse, context);
    
    // Use the cheapest model
    const response = await this.genAI.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: prompt
    });
    
    const friendlyMessage = response.text || '';

    return friendlyMessage.trim();
  }

  /**
   * Builds prompt for transforming error into friendly message
   */
  private buildErrorTransformPrompt(
    errorResponse: ChatResponse,
    context: ErrorContext
  ): string {
    const lessonContext = context.conversationHistory?.currentLesson 
      ? `Current lesson: "${context.conversationHistory.currentLesson.title || 'untitled'}" (${context.conversationHistory.currentLesson.slides?.length || 0} slides)`
      : 'No lesson created yet';

    const operationContext = context.intentResult?.intent 
      ? `Operation: ${context.intentResult.intent}`
      : 'Operation undefined';

    return `
You are a friendly AI assistant for creating educational lessons.

TASK: Transform technical error into natural, friendly message. Respond in the same language as the user's message.

CONTEXT:
- User message: "${context.userMessage}"
- ${operationContext}
- ${lessonContext}
- Technical error: "${errorResponse.message}"
- Error details: "${errorResponse.error || 'not specified'}"

RULES:
1. NEVER use words like: "error", "failed", "❌", "mistake"
2. Always be positive and supportive
3. Speak as if this is a normal part of conversation
4. Offer specific actions or alternatives
5. Use emojis naturally (not as error indicators)
6. Respond in the same language as the user's message
7. Be concise but helpful

TONE EXAMPLES:
- Instead of "Slide doesn't exist" → "Let's clarify which slide you meant"
- Instead of "Lesson not found" → "Looks like we need to create a lesson first"
- Instead of "Invalid parameter" → "Not quite clear, could you clarify?"

Generate a friendly message that:
1. Acknowledges user's intent
2. Explains situation without mentioning errors
3. Suggests next steps or alternatives
4. Encourages continued work

Response should be short (1-3 sentences) and helpful.
`;
  }


}
