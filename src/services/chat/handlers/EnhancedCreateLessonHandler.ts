import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { EnhancedIntentDetectionResult } from '../../intent/GeminiIntentService';
import { GeminiContentService } from '../../content/GeminiContentService';

// Enhanced handler with Gemini 2.5 Flash integration and data validation
export class EnhancedCreateLessonHandler implements IIntentHandler {
  private contentService: GeminiContentService | null = null;

  private getContentService(): GeminiContentService {
    if (!this.contentService) {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key required for content generation (GEMINI_API_KEY)');
      }
      this.contentService = new GeminiContentService();
    }
    return this.contentService;
  }
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    
    // Handle CREATE_LESSON when:
    // 1. Intent is CREATE_LESSON
    // 2. We have sufficient data
    // 3. Not in the middle of another lesson creation process
    return intent.intent === UserIntent.CREATE_LESSON && 
           enhancedIntent.isDataSufficient === true &&
           // Allow conversation history, just make sure we're not in an active lesson creation step
           (!conversationHistory?.step || conversationHistory.step === 'planning') &&
           !conversationHistory?.planningResult; // Not already in lesson planning
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    const topic = intent.parameters.topic;
    const age = intent.parameters.age;

    console.log(`🎯 [ENHANCED CREATE LESSON] Processing lesson creation`);
    console.log(`📚 Topic: "${topic}"`);
    console.log(`👶 Age: "${age}"`);
    console.log(`🌐 Language: "${intent.language}"`);

    if (!topic || !age) {
      console.log('❌ Missing required data for lesson creation');
      return {
        success: false,
        message: `❌ **Insufficient data for lesson creation**\n\nPlease specify:\n${!topic ? '• Lesson topic' : ''}\n${!age ? '• Children age' : ''}\n\n💡 **Example:** "Create a lesson about animals for 6-year-old children"`,
        error: 'Missing required parameters'
      };
    }
    
    try {
      // === PASS CONVERSATION CONTEXT TO LESSON PLAN GENERATION ===
      const conversationContext = conversationHistory?.conversationContext;
      
      if (conversationContext) {
        console.log(`📝 [LESSON HANDLER] Using conversation context: ${conversationContext.length} chars`);
      }
      
      // Generate plan using Gemini 2.5 Flash with conversation context
      const generatedPlan = await this.getContentService().generateLessonPlan(
        topic, 
        age, 
        intent.language,
        conversationContext
      );

      console.log('✅ Lesson plan generated successfully');

      const newConversationHistory: ConversationHistory = {
        step: 'planning',
        planningResult: generatedPlan,
        totalSlides: this.extractSlideCount(generatedPlan),
        originalMessage: intent.parameters.rawMessage,
        lessonTopic: topic,
        lessonAge: age
      };

      return {
        success: true,
        message: generatedPlan,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'approve_plan',
            label: '✅ Approve plan and generate slides', // Translated
            description: 'Approve the plan and proceed to slide creation' // Translated
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      
      return {
        success: false,
        message: `Sorry, an error occurred while generating the lesson plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`, // Translated
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractSlideCount(planText: string): number {
    // Extract number of slides from the generated plan
    const slideMatches = planText.match(/##\s+Слайд\s+\d+/gi) || 
                        planText.match(/##\s+Slide\s+\d+/gi) ||
                        planText.match(/слайд\s+\d+/gi) || 
                        planText.match(/slide\s+\d+/gi);
    
    if (slideMatches) {
      // Extract the highest slide number
      const numbers = slideMatches.map(match => {
        const num = match.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      });
      return Math.max(...numbers);
    }
    
    return 6; // Default to 6 if can't detect
  }
} 