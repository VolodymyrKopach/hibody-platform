// === SOLID: Dependency Inversion Principle ===
// Main ChatService depends on abstractions, not concretions

import { IIntentDetectionService } from '../intent/IIntentDetectionService';
import { IntentDetectionServiceFactory } from '../intent/IntentDetectionServiceFactory';
import { IIntentHandler } from './handlers/IIntentHandler';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { FallbackHandler } from './handlers/FallbackHandler';
import { EditPlanHandler } from './handlers/EditPlanHandler';
import { EnhancedCreateLessonHandler } from './handlers/EnhancedCreateLessonHandler';
import { HelpHandler } from './handlers/HelpHandler';
import { DataCollectionHandler } from './handlers/DataCollectionHandler';
import { type ConversationHistory, type ChatResponse } from './types';

// === Import new separated services ===
import { 
  ISlideGenerationService,
  ISlideEditingService,
  ILessonManagementService,
  ISlideAnalysisService,
  IActionHandlerService,
  IIntentMappingService
} from './interfaces/IChatServices';
import { SlideGenerationService } from './services/SlideGenerationService';
import { SlideEditingService } from './services/SlideEditingService';
import { LessonManagementService } from './services/LessonManagementService';
import { SlideAnalysisService } from './services/SlideAnalysisService';
import { ActionHandlerService } from './services/ActionHandlerService';
import { IntentMappingService } from './services/IntentMappingService';

// === SOLID: Dependency Inversion Principle ===
// Main ChatService depends on abstractions, not concretions
export class ChatService {
  private intentDetectionService: IIntentDetectionService;
  private handlers: IIntentHandler[];
  private slideGenerationService: ISlideGenerationService;
  private slideEditingService: ISlideEditingService;
  private lessonManagementService: ILessonManagementService;
  private slideAnalysisService: ISlideAnalysisService;
  private actionHandlerService: IActionHandlerService;
  private intentMappingService: IIntentMappingService;

  constructor() {
    // Initialize all dependencies
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found in environment variables (GEMINI_API_KEY)');
    }

    const contentService = new GeminiContentService();
    const simpleEditService = new GeminiSimpleEditService();

    // === SOLID: Dependency Injection ===
    this.intentDetectionService = IntentDetectionServiceFactory.create();
    this.slideGenerationService = new SlideGenerationService(contentService);
    this.slideEditingService = new SlideEditingService(simpleEditService);
    this.lessonManagementService = new LessonManagementService();
    this.slideAnalysisService = new SlideAnalysisService();
    this.intentMappingService = new IntentMappingService();
    
    this.actionHandlerService = new ActionHandlerService(
      this.slideGenerationService,
      this.slideEditingService,
      this.lessonManagementService,
      this.slideAnalysisService
    );

    // === SOLID: Open/Closed Principle ===
    // Easy to add new handlers without modifying existing code
    this.handlers = [
      new DataCollectionHandler(),
      new EnhancedCreateLessonHandler(),
      new EditPlanHandler(),
      new HelpHandler(),
      new FallbackHandler()
    ];
  }

  // === SOLID: Single Responsibility ===
  // Main process method only coordinates, doesn't do business logic
  async processMessage(
    message: string, 
    conversationHistory?: ConversationHistory,
    action?: string
  ): Promise<ChatResponse> {
    try {
      // Log conversation context if provided
      if (conversationHistory?.conversationContext) {
        console.log(`💬 [CHAT SERVICE] Received conversation context: ${conversationHistory.conversationContext.length} chars`);
        console.log(`📝 [CONTEXT PREVIEW]`, conversationHistory.conversationContext.substring(0, 200) + '...');
      }
      
      const intentResult = await this.intentDetectionService.detectIntent(message, conversationHistory);
      
      console.log(`🎯 [INTENT DETECTED] ${intentResult.intent} (confidence: ${intentResult.confidence})`);
      console.log(`📝 [PARAMETERS]`, intentResult.parameters);
      
      // Handle actions first
      if (action) {
        return await this.actionHandlerService.handleAction(action, conversationHistory, intentResult);
      }
      
      // Handle specific intents
      if (intentResult.intent === 'create_new_slide') {
        return await this.handleCreateNewSlide(conversationHistory);
      }
      
      if (intentResult.intent === 'create_slide') {
        return await this.handleCreateSlide(conversationHistory, intentResult);
      }

      if (intentResult.intent === 'regenerate_slide') {
        return await this.actionHandlerService.handleAction('regenerate_slide', conversationHistory, intentResult);
      }

      if (intentResult.intent === 'edit_slide') {
        return await this.handleEditSlide(conversationHistory, intentResult);
      }

      if (intentResult.intent === 'improve_html') {
        return await this.handleImproveSlide(conversationHistory, intentResult);
      }

      if (intentResult.intent === 'edit_html_inline') {
        return await this.handleInlineEditSlide(conversationHistory, intentResult);
      }
      
      // Find appropriate handler
      const handler = this.findHandler(intentResult, conversationHistory);
      
      if (!handler) {
        const mappedIntent = this.intentMappingService.mapUnknownIntent(intentResult);
        if (mappedIntent) {
          const mappedHandler = this.findHandler(mappedIntent, conversationHistory);
          if (mappedHandler) {
            return await mappedHandler.handle(mappedIntent, conversationHistory as any);
          }
        }
        
        return this.generateFallbackResponse(intentResult, conversationHistory);
      }

      return await handler.handle(intentResult, conversationHistory);

    } catch (error) {
      console.error('Chat service error:', error);
      
      return {
        success: false,
        message: `Вибачте, сталася помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}. Спробуйте ще раз.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private findHandler(intentResult: any, conversationHistory?: ConversationHistory): IIntentHandler | undefined {
    return this.handlers.find(handler => 
      handler.canHandle(intentResult, conversationHistory)
    );
  }

  private async handleCreateNewSlide(conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    return {
      success: false,
      message: '🤔 Слайди тепер генеруються всі відразу після схвалення плану уроку.',
      conversationHistory,
      error: 'generate_next_slide deprecated - use bulk generation'
    };
  }

  private async handleCreateSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (conversationHistory?.currentLesson) {
      return await this.handleCreateAdditionalSlide(conversationHistory, intentResult);
    }
    
    return {
      success: false,
      message: '🤔 Схоже ви хочете створити слайд, але спочатку потрібно створити урок.',
      conversationHistory,
      error: 'CREATE_SLIDE without lesson context'
    };
  }

  private async handleCreateAdditionalSlide(conversationHistory: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory.currentLesson) {
      throw new Error('No lesson context for additional slide creation');
    }

    const slideTitle = intentResult?.parameters?.slideTitle || `Додатковий слайд`;
    const slideDescription = intentResult?.parameters?.slideDescription || 
      `Додатковий навчальний матеріал для уроку про ${conversationHistory.lessonTopic}`;

    try {
      const newSlide = await this.slideGenerationService.generateSlide(
        slideDescription,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      newSlide.title = slideTitle;

      const updatedLesson = this.lessonManagementService.addSlideToLesson(
        conversationHistory.currentLesson,
        newSlide
      );

      return {
        success: true,
        message: `✅ **Новий слайд додано!**

Слайд "${slideTitle}" успішно створено та додано до уроку.`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson
        },
        actions: [
          {
            action: 'create_slide',
            label: '➕ Додати ще слайд',
            description: 'Створити ще один слайд для цього уроку'
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 Виникла помилка при створенні нового слайду.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Помилка редагування** - Не знайдено урок для редагування слайдів.`,
        conversationHistory,
        error: 'No lesson context for slide editing'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка редагування** - Слайд ${slideNumber} не існує.`,
        conversationHistory,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = conversationHistory.currentLesson.slides[slideNumber - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || 'Покращити слайд';
      
      const editedSlide = await this.slideEditingService.editSlide(
        currentSlide,
        editInstruction,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      const updatedSlides = conversationHistory.currentLesson.slides.map((slide, index) => 
        index === slideNumber - 1 ? editedSlide : slide
      );

      const updatedLesson = this.lessonManagementService.updateLesson(conversationHistory.currentLesson, {
        slides: updatedSlides
      });

      const detectedChanges = this.slideAnalysisService.analyzeSlideChanges(
        currentSlide, 
        editedSlide.htmlContent || '', 
        editInstruction
      );

      return {
        success: true,
        message: `🔧 **Слайд ${slideNumber} відредаговано!**

📋 **Детальний звіт про зміни:**
${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson,
          currentSlideIndex: slideNumber
        },
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumber}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 Виникла помилка при редагуванні слайду ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleImproveSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Помилка покращення** - Не знайдено урок для покращення слайдів.`,
        conversationHistory,
        error: 'No lesson context for slide improvement'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка покращення** - Слайд ${slideNumber} не існує.`,
        conversationHistory,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = conversationHistory.currentLesson.slides[slideNumber - 1];
      const improvementInstruction = intentResult?.parameters?.rawMessage || 'Зробити слайд яскравішим та інтерактивнішим';
      
      const improvedSlide = await this.slideEditingService.improveSlide(
        currentSlide,
        improvementInstruction,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      const updatedSlides = conversationHistory.currentLesson.slides.map((slide, index) => 
        index === slideNumber - 1 ? improvedSlide : slide
      );

      const updatedLesson = this.lessonManagementService.updateLesson(conversationHistory.currentLesson, {
        slides: updatedSlides
      });

      const detectedChanges = this.slideAnalysisService.analyzeSlideChanges(
        currentSlide, 
        improvedSlide.htmlContent || '', 
        improvementInstruction
      );

      return {
        success: true,
        message: `🎨 **Слайд ${slideNumber} покращено!**

📋 **Детальний звіт про покращення:**
${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson
        },
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumber}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 Виникла помилка при покращенні слайду ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleInlineEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Помилка редагування** - Не знайдено урок для редагування слайдів.`,
        conversationHistory,
        error: 'No lesson context for inline slide editing'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка редагування** - Слайд ${slideNumber} не існує.`,
        conversationHistory,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = conversationHistory.currentLesson.slides[slideNumber - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || '';
      const targetText = intentResult?.parameters?.targetText || '';
      const newText = intentResult?.parameters?.newText || '';
      
      const finalInstruction = targetText && newText 
        ? `Замініть "${targetText}" на "${newText}"`
        : editInstruction;
      
      const editedSlide = await this.slideEditingService.editSlide(
        currentSlide,
        finalInstruction,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      const updatedSlides = conversationHistory.currentLesson.slides.map((slide, index) => 
        index === slideNumber - 1 ? editedSlide : slide
      );

      const updatedLesson = this.lessonManagementService.updateLesson(conversationHistory.currentLesson, {
        slides: updatedSlides
      });

      const detectedChanges = this.slideAnalysisService.analyzeSlideChanges(
        currentSlide, 
        editedSlide.htmlContent || '', 
        finalInstruction
      );

      return {
        success: true,
        message: `🔧 **Слайд ${slideNumber} відредаговано!**

📋 **Детальний звіт про редагування:**
${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson
        },
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumber}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 Виникла помилка при редагуванні слайду ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateFallbackResponse(intentResult: any, conversationHistory?: ConversationHistory): ChatResponse {
    const language = intentResult.language || 'uk';
    
    const message = language === 'uk' 
      ? `🤔 Я поки не впевнений, як саме вам допомогти з цим запитом.

**Ось що я можу зробити:**
• 📚 Створити новий урок
• 📝 Редагувати існуючий план уроку
• 🎨 Додати нові слайди до уроку
• ❓ Надати допомогу з командами`
      : `🤔 I'm not sure how to help you with this request yet.

**Here's what I can do:**
• 📚 Create a new lesson
• 📝 Edit existing lesson plans
• 🎨 Add new slides to lessons
• ❓ Provide help with commands`;

    return {
      success: true,
      message,
      conversationHistory,
      actions: [
        {
          action: 'help',
          label: '❓ Допомога',
          description: 'Показати доступні команди'
        }
      ]
    };
  }
} 