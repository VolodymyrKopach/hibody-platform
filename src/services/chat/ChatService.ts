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
import { type ConversationHistory, type ChatResponse, type BatchEditPlan, type EnhancedBatchEditResponse } from './types';

// === Import new separated services ===
import { 
  ISlideGenerationService,
  ISlideEditingService,
  IBatchSlideEditingService,
  ILessonManagementService,
  ISlideAnalysisService,
  IActionHandlerService,
  IIntentMappingService,
  BatchEditParams
} from './interfaces/IChatServices';
import { SlideGenerationService } from './services/SlideGenerationService';
import { SlideEditingService } from './services/SlideEditingService';
import { BatchSlideEditingService } from './services/BatchSlideEditingService';
import { LessonManagementService } from './services/LessonManagementService';
import { SlideAnalysisService } from './services/SlideAnalysisService';
import { ActionHandlerService } from './services/ActionHandlerService';
import { IntentMappingService } from './services/IntentMappingService';
import { AIClarificationService } from './services/AIClarificationService';
import { ErrorObserver } from './observers/ErrorObserver';
import { SlideValidationHelper } from './helpers/SlideValidationHelper';

// === SOLID: Dependency Inversion Principle ===
// Main ChatService depends on abstractions, not concretions
export class ChatService {
  private intentDetectionService: IIntentDetectionService;
  private handlers: IIntentHandler[];
  private slideGenerationService: ISlideGenerationService;
  private slideEditingService: ISlideEditingService;
  private batchSlideEditingService: IBatchSlideEditingService;
  private lessonManagementService: ILessonManagementService;
  private slideAnalysisService: ISlideAnalysisService;
  private actionHandlerService: IActionHandlerService;
  private intentMappingService: IIntentMappingService;
  private clarificationService: AIClarificationService;
  private errorObserver: ErrorObserver;
  private slideValidationHelper: SlideValidationHelper;
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
    this.batchSlideEditingService = new BatchSlideEditingService();
    this.lessonManagementService = new LessonManagementService();
    this.slideAnalysisService = new SlideAnalysisService();
    this.intentMappingService = new IntentMappingService();
    this.clarificationService = new AIClarificationService();
    this.errorObserver = new ErrorObserver();
    this.slideValidationHelper = new SlideValidationHelper(this.clarificationService);
    
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
        const response = await this.actionHandlerService.handleAction(action, conversationHistory, intentResult);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }
      






      if (intentResult.intent === 'edit_slide') {
        const response = await this.handleEditSlide(conversationHistory, intentResult);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }

      if (intentResult.intent === 'improve_html') {
        const response = await this.handleImproveSlide(conversationHistory, intentResult);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }

      if (intentResult.intent === 'edit_html_inline') {
        const response = await this.handleInlineEditSlide(conversationHistory, intentResult);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }

      if (intentResult.intent === 'batch_edit_slides') {
        const response = await this.handleBatchEditSlides(conversationHistory, intentResult);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }
      
      // Find appropriate handler
      const handler = this.findHandler(intentResult, conversationHistory);
      
      if (!handler) {
        const mappedIntent = this.intentMappingService.mapUnknownIntent(intentResult);
        if (mappedIntent) {
          const mappedHandler = this.findHandler(mappedIntent, conversationHistory);
          if (mappedHandler) {
            const response = await mappedHandler.handle(mappedIntent, conversationHistory as any);
            if (!response.success) {
              return await this.errorObserver.interceptError(response, {
                userMessage: message,
                conversationHistory,
                intentResult: mappedIntent
              });
            }
            return response;
          }
        }
        
        const response = this.generateFallbackResponse(intentResult, conversationHistory);
        if (!response.success) {
          return await this.errorObserver.interceptError(response, {
            userMessage: message,
            conversationHistory,
            intentResult
          });
        }
        return response;
      }

      const response = await handler.handle(intentResult, conversationHistory);
      
      // 🔍 ERROR OBSERVER: Перехоплюємо помилки перед відправкою клієнту
      if (!response.success) {
        console.log('🔍 [ERROR OBSERVER] Intercepting error response from handler');
        return await this.errorObserver.interceptError(response, {
          userMessage: message,
          conversationHistory,
          intentResult
        });
      }
      
      return response;

    } catch (error) {
      console.error('💥 [CHAT SERVICE] Exception occurred:', error);
      
      // Навіть exception перетворюємо на дружнє повідомлення через ErrorObserver
      const errorResponse: ChatResponse = {
        success: false,
        message: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      return await this.errorObserver.interceptError(errorResponse, {
        userMessage: message,
        conversationHistory,
        intentResult: await this.intentDetectionService.detectIntent(message, conversationHistory)
      });
    }
  }

  private findHandler(intentResult: any, conversationHistory?: ConversationHistory): IIntentHandler | undefined {
    return this.handlers.find(handler => 
      handler.canHandle(intentResult, conversationHistory)
    );
  }





    private async handleEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    const slideNumber = intentResult?.parameters?.slideNumber;
    
    // Використовуємо helper для валідації
    const validation = await this.slideValidationHelper.validateSlideAccess(slideNumber, {
      conversationHistory,
      intentResult,
      operation: 'edit'
    });
    
    if (validation.error) {
      return validation.error;
    }
    
    const finalSlideNumber = validation.finalSlideNumber!;

    try {
      const currentSlide = conversationHistory.currentLesson.slides[finalSlideNumber - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || 'Improve slide';
      
      const editedSlide = await this.slideEditingService.editSlide(
        currentSlide,
        editInstruction,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years'
      );

      const updatedSlides = conversationHistory.currentLesson.slides.map((slide, index) => 
        index === finalSlideNumber - 1 ? editedSlide : slide
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
        message: `🔧 **Slide ${finalSlideNumber} edited!**\n\n📋 **Detailed change report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
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
        message: `😔 An error occurred while editing slide ${finalSlideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleImproveSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    const slideNumber = intentResult?.parameters?.slideNumber;
    
    // Використовуємо helper для валідації
    const validation = await this.slideValidationHelper.validateSlideAccess(slideNumber, {
      conversationHistory,
      intentResult,
      operation: 'improve'
    });
    
    if (validation.error) {
      return validation.error;
    }
    
    const finalSlideNumber = validation.finalSlideNumber!;

    try {
      const currentSlide = conversationHistory.currentLesson.slides[finalSlideNumber - 1];
      const improvementInstruction = intentResult?.parameters?.rawMessage || 'Make the slide brighter and more interactive';
      
      const improvedSlide = await this.slideEditingService.improveSlide(
        currentSlide,
        improvementInstruction,
        conversationHistory.lessonTopic || 'lesson',
        conversationHistory.lessonAge || '6-8 years'
      );

      const updatedSlides = conversationHistory.currentLesson.slides.map((slide, index) => 
        index === finalSlideNumber - 1 ? improvedSlide : slide
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
        message: `🎨 **Slide ${finalSlideNumber} improved!**\n\n📋 **Detailed improvement report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
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
        message: `😔 An error occurred while improving slide ${finalSlideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleInlineEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    const slideNumber = intentResult?.parameters?.slideNumber;
    
    // Використовуємо helper для валідації
    const validation = await this.slideValidationHelper.validateSlideAccess(slideNumber, {
      conversationHistory,
      intentResult,
      operation: 'edit'
    });
    
    if (validation.error) {
      return validation.error;
    }
    
    const finalSlideNumber = validation.finalSlideNumber!;

    try {
      const currentSlide = conversationHistory.currentLesson.slides[finalSlideNumber - 1];
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
        index === finalSlideNumber - 1 ? editedSlide : slide
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
        message: `🔧 **Slide ${finalSlideNumber} edited!**\n\n📋 **Detailed editing report:**\n${detectedChanges.map(change => `• ${change}`).join('\n')}`,
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
        message: `😔 An error occurred while editing slide ${finalSlideNumber}.`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleBatchEditSlides(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      return {
        success: false,
        message: `❌ **Batch editing error** - No lesson found for editing slides.`,
        conversationHistory,
        error: 'No lesson context for batch slide editing'
      };
    }

    const { parameters } = intentResult;
    const totalSlides = conversationHistory.currentLesson.slides.length;

    try {
      // Check if we have a complex batch edit plan (different instructions per slide)
      if (parameters?.batchEditPlan) {
        console.log(`🎯 [CHAT SERVICE] Complex batch edit detected`);
        console.log(`📝 [CHAT SERVICE] Plan:`, parameters.batchEditPlan);

        const batchEditPlan = parameters.batchEditPlan;
        const affectedSlides = Object.keys(batchEditPlan);
        
        // Format response message
        const slideText = affectedSlides.length === 1 ? 'slide' : 'slides';
        const planSummary = Object.entries(batchEditPlan)
          .map(([slideId, instruction]) => `• ${slideId}: ${instruction}`)
          .join('\n');

        const responseMessage = `🎯 **Batch Edit Plan Created**\n\n` +
          `📋 **${affectedSlides.length} ${slideText} will be edited:**\n${planSummary}\n\n` +
          `⏱️ **Estimated time:** ~${Math.ceil(affectedSlides.length * 30)} seconds\n\n` +
          `✅ Ready to start editing. The client will process each slide individually for optimal performance.`;

        return {
          success: true,
          message: responseMessage,
          conversationHistory,
          actions: [],
          enhancedBatchEdit: {
            intent: 'BATCH_EDIT_SLIDES',
            batchEditPlan,
            affectedSlides,
            requiresClientAction: true,
            progressTracking: {
              totalSlides: affectedSlides.length,
              estimatedTime: affectedSlides.length * 30 // seconds
            }
          }
        };
      }

      // Handle simple batch edit (same instruction for all slides)
      const editInstruction = parameters?.editInstruction || parameters?.instruction || parameters?.rawMessage || 'Improve slides';
      const affectedSlides = parameters?.affectedSlides || 'all';
      const slideNumbers = parameters?.slideNumbers || [];
      const slideRange = parameters?.slideRange;

      // Determine which slides to edit
      let targetSlideNumbers: number[];
      
      if (affectedSlides === 'all') {
        targetSlideNumbers = Array.from({ length: totalSlides }, (_, i) => i + 1);
      } else if (affectedSlides === 'specific' && slideNumbers.length > 0) {
        targetSlideNumbers = slideNumbers.filter((num: number) => num >= 1 && num <= totalSlides);
      } else if (affectedSlides === 'range' && slideRange) {
        const { start, end } = slideRange;
        targetSlideNumbers = Array.from(
          { length: Math.min(end, totalSlides) - Math.max(start, 1) + 1 }, 
          (_, i) => Math.max(start, 1) + i
        );
      } else {
        // Fallback to all slides
        targetSlideNumbers = Array.from({ length: totalSlides }, (_, i) => i + 1);
      }

      if (targetSlideNumbers.length === 0) {
        return {
          success: false,
          message: `❌ **Batch editing error** - No valid slides found to edit.`,
          conversationHistory,
          error: 'No valid slides specified'
        };
      }

      console.log(`🔄 [CHAT SERVICE] Simple batch edit of ${targetSlideNumbers.length} slides`);
      console.log(`📝 [CHAT SERVICE] Instruction: "${editInstruction}"`);
      console.log(`🎯 [CHAT SERVICE] Target slides: ${targetSlideNumbers.join(', ')}`);

      // Create batch edit plan for simple case
      const batchEditPlan: Record<string, string> = {};
      targetSlideNumbers.forEach(slideNum => {
        batchEditPlan[`slide-${slideNum}`] = editInstruction;
      });

      // Format response message
      const slideText = targetSlideNumbers.length === 1 ? 'slide' : 'slides';
      const slideList = targetSlideNumbers.length <= 5 
        ? targetSlideNumbers.join(', ')
        : `${targetSlideNumbers.slice(0, 3).join(', ')} and ${targetSlideNumbers.length - 3} more`;

      const responseMessage = `🔄 **Batch Edit Plan Created**\n\n` +
        `📝 **Edit instruction:** "${editInstruction}"\n` +
        `🎯 **Target slides:** ${slideList}\n` +
        `⏱️ **Estimated time:** ~${Math.ceil(targetSlideNumbers.length * 30)} seconds\n\n` +
        `✅ Ready to start editing. The client will process each slide individually for optimal performance.`;

      return {
        success: true,
        message: responseMessage,
        conversationHistory,
        actions: [],
        enhancedBatchEdit: {
          intent: 'BATCH_EDIT_SLIDES',
          batchEditPlan,
          affectedSlides: targetSlideNumbers.map(num => `slide-${num}`),
          requiresClientAction: true,
          progressTracking: {
            totalSlides: targetSlideNumbers.length,
            estimatedTime: targetSlideNumbers.length * 30 // seconds
          }
        }
      };

    } catch (error) {
      console.error('❌ [CHAT SERVICE] Batch edit error:', error);
      
      return {
        success: false,
        message: `😔 An error occurred while creating batch edit plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateFallbackResponse(intentResult: any, conversationHistory?: ConversationHistory): ChatResponse {
    // Use a generic helpful message - AI will respond in user's language
    const message = `🤔 I'm not sure how to help you with this request yet.\n\n**Here's what I can do:**\n• 📚 Create a new lesson\n• 📝 Edit existing lesson plans\n• 🎨 Add new slides to lessons\n• ❓ Provide help with commands`;

    return {
      success: true,
      message,
      conversationHistory,
      actions: []
    };
  }


} 