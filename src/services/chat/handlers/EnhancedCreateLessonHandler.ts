import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { EnhancedIntentDetectionResult } from '../../intent/ClaudeHaikuIntentService';
import { ClaudeSonnetContentService } from '../../content/ClaudeSonnetContentService';

// Enhanced handler with Claude Sonnet integration and data validation
export class EnhancedCreateLessonHandler implements IIntentHandler {
  private contentService: ClaudeSonnetContentService | null = null;

  private getContentService(): ClaudeSonnetContentService {
    if (!this.contentService) {
      const claudeApiKey = process.env.CLAUDE_API_KEY;
      if (!claudeApiKey) {
        throw new Error('Claude API key required for content generation (CLAUDE_API_KEY)');
      }
      this.contentService = new ClaudeSonnetContentService(claudeApiKey);
    }
    return this.contentService;
  }
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    return intent.intent === UserIntent.CREATE_LESSON && 
           !conversationHistory && 
           enhancedIntent.isDataSufficient === true;
  }

  async handle(intent: IntentDetectionResult): Promise<ChatResponse> {
    const enhancedIntent = intent as EnhancedIntentDetectionResult;
    
    // Check if we have sufficient data
    if (enhancedIntent.isDataSufficient === false && enhancedIntent.suggestedQuestion) {
      return {
        success: true,
        message: `🤔 ${enhancedIntent.suggestedQuestion}

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

    // Validate required parameters
    const { topic, age } = intent.parameters;
    if (!topic || !age) {
      return {
        success: false,
        message: 'Помилка: не вистачає обов\'язкових даних для створення уроку (тема або вік).',
        error: 'Missing required parameters'
      };
    }

    console.log('🎨 Generating lesson plan with Claude Sonnet...');
    console.log(`📋 Topic: ${topic}, Age: ${age}, Language: ${intent.language}`);
    
    try {
      // Generate plan using Claude Sonnet (no hardcoded templates!)
      const generatedPlan = await this.getContentService().generateLessonPlan(
        topic, 
        age, 
        intent.language
      );

      console.log('✅ Lesson plan generated successfully');

      const newConversationHistory: ConversationHistory = {
        step: 'planning',
        planningResult: generatedPlan,
        generationMode: 'individual',
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
            label: '✅ Почати генерацію слайдів',
            description: 'Схвалити план і перейти до створення слайдів'
          },
          {
            action: 'edit_plan',
            label: '✏️ Змінити план',
            description: 'Внести правки до плану уроку'
          },
          {
            action: 'regenerate_plan',
            label: '🔄 Створити новий план',
            description: 'Згенерувати альтернативний варіант плану'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      
      return {
        success: false,
        message: `Вибачте, сталася помилка при генерації плану уроку: ${error instanceof Error ? error.message : 'Невідома помилка'}. Спробуйте ще раз.`,
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