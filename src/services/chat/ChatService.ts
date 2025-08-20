// === SOLID: Dependency Inversion Principle ===
// Main ChatService depends on abstractions, not concretions

import { IIntentDetectionService } from '../intent/IIntentDetectionService';
import { IntentDetectionServiceFactory } from '../intent/IntentDetectionServiceFactory';
import { IIntentHandler } from './handlers/IIntentHandler';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { FallbackHandler } from './handlers/FallbackHandler';

import { EnhancedCreateLessonHandler } from './handlers/EnhancedCreateLessonHandler';
import { EditPlanHandler } from './handlers/EditPlanHandler';
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
  private onAsyncMessageCallback?: (message: any) => void;

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
    this.slideGenerationService = new SlideGenerationService();
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
      new FallbackHandler()
    ];
  }

  // Set callback for async messages (like slide generation completion)
  setAsyncMessageCallback(callback: (message: any) => void) {
    this.onAsyncMessageCallback = callback;
    // Connect the callback to ActionHandlerService
    if (this.actionHandlerService && 'setMessageCallback' in this.actionHandlerService) {
      (this.actionHandlerService as any).setMessageCallback(callback);
    }
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
        message: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
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





  private async handleEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Editing error** - No lesson found for editing slides.`,
        conversationHistory,
        error: 'No lesson context for slide editing'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Editing error** - Slide ${slideNumber} does not exist.`,
        conversationHistory,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = conversationHistory.currentLesson.slides[slideNumber - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || 'Improve slide';
      
      const editedSlide = await this.slideEditingService.editSlide(
        currentSlide,
        editInstruction,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years'
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
        message: `🔧 **Slide ${slideNumber} edited!**\n\n📋 **Detailed change report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson,
          currentSlideIndex: slideNumber
        },
        actions: [],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 An error occurred while editing slide ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleImproveSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Improvement error** - No lesson found for improving slides.`,
        conversationHistory,
        error: 'No lesson context for slide improvement'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Improvement error** - Slide ${slideNumber} does not exist.`,
        conversationHistory,
        error: `Slide ${slideNumber} does not exist`
      };
    }

    try {
      const currentSlide = conversationHistory.currentLesson.slides[slideNumber - 1];
      const improvementInstruction = intentResult?.parameters?.rawMessage || 'Make the slide brighter and more interactive';
      
      const improvedSlide = await this.slideEditingService.improveSlide(
        currentSlide,
        improvementInstruction,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years'
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
        message: `🎨 **Slide ${slideNumber} improved!**\n\n📋 **Detailed improvement report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson
        },
        actions: [],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 An error occurred while improving slide ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleInlineEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Editing error** - No lesson found for editing slides.`,
        conversationHistory,
        error: 'No lesson context for inline slide editing'
      };
    }

    const slideNumber = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    if (slideNumber < 1 || slideNumber > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Editing error** - Slide ${slideNumber} does not exist.`,
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
        ? `Replace \"${targetText}\" with \"${newText}\"`
        : editInstruction;
      
      const editedSlide = await this.slideEditingService.editSlide(
        currentSlide,
        finalInstruction,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years'
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
        message: `🔧 **Slide ${slideNumber} edited!**\n\n📋 **Detailed editing report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
        conversationHistory: {
          ...conversationHistory,
          currentLesson: updatedLesson
        },
        actions: [],
        lesson: updatedLesson
      };
    } catch (error) {
      return {
        success: false,
        message: `😔 An error occurred while editing slide ${slideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateFallbackResponse(intentResult: any, conversationHistory?: ConversationHistory): ChatResponse {
    const language = intentResult.language || 'uk';
    
    const message = language === 'uk' 
      ? `🤔 I\'m not yet sure how to help you with this request.\n\n**Here\'s what I can do:**\n• 📚 Create a new lesson\n• 📝 Edit existing lesson plans\n• 🎨 Add new slides to lessons\n• ❓ Provide help with commands`
      : `🤔 I\'m not sure how to help you with this request yet.\n\n**Here\'s what I can do:**\n• 📚 Create a new lesson\n• 📝 Edit existing lesson plans\n• 🎨 Add new slides to lessons\n• ❓ Provide help with commands`;

    return {
      success: true,
      message,
      conversationHistory,
      actions: []
    };
  }
} 