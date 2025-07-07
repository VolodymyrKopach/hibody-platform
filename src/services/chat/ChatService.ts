import { IIntentDetectionService } from '../intent/IIntentDetectionService';
import { IntentDetectionServiceFactory } from '../intent/IntentDetectionServiceFactory';
import { IIntentHandler } from './handlers/IIntentHandler';
import { ClaudeSonnetContentService } from '../content/ClaudeSonnetContentService';
import { SimpleEditService } from '../content/SimpleEditService';
import { FallbackHandler } from './handlers/FallbackHandler';
import { EditPlanHandler } from './handlers/EditPlanHandler';
import { EnhancedCreateLessonHandler } from './handlers/EnhancedCreateLessonHandler';
import { HelpHandler } from './handlers/HelpHandler';
import { DataCollectionHandler } from './handlers/DataCollectionHandler';
import { type ConversationHistory, type ChatResponse } from './types';
import { type SimpleSlide } from '@/types/chat';
import { type SlideImageInfo } from '@/types/lesson';
import { type ProcessedSlideData, extractImagePrompts, processSlideWithImages } from '@/utils/slideImageProcessor';

// Single Responsibility: Координує роботу чату через dependency injection
export class ChatService {
  private intentDetectionService: IIntentDetectionService;
  private handlers: IIntentHandler[];
  private contentService: ClaudeSonnetContentService;
  private simpleEditService: SimpleEditService;

  constructor() {
    // Dependency Inversion: залежимо від абстракцій, не від конкретних класів
    this.intentDetectionService = IntentDetectionServiceFactory.create();
    
    // Open/Closed: легко додавати нові обробники без зміни існуючого коду
    this.handlers = [
      new DataCollectionHandler(), // Першим - для обробки збору даних
      new EnhancedCreateLessonHandler(),
      new EditPlanHandler(),
      new HelpHandler(),
      new FallbackHandler() // Завжди останній
    ];

    // Ініціалізуємо content service для генерації слайдів
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      throw new Error('Claude API key not found in environment variables (CLAUDE_API_KEY)');
    }
    this.contentService = new ClaudeSonnetContentService(claudeApiKey);
    this.simpleEditService = new SimpleEditService(claudeApiKey);
  }

  async processMessage(
    message: string, 
    conversationHistory?: ConversationHistory,
    action?: string
  ): Promise<ChatResponse> {
    try {
      // Спочатку визначаємо намір користувача з урахуванням контексту
      const intentResult = await this.intentDetectionService.detectIntent(message, conversationHistory);
      
      console.log(`🎯 [INTENT DETECTED] ${intentResult.intent} (confidence: ${intentResult.confidence})`);
      console.log(`📝 [PARAMETERS]`, intentResult.parameters);
      
      // Обробляємо спеціальні дії (approve_plan, edit_plan тощо)
      if (action) {
        return await this.handleAction(action, conversationHistory, intentResult);
      }
      
      // Спеціальна обробка для інтентів які мають обрублятися як дії
      if (intentResult.intent === 'create_new_slide') {
        console.log('🔄 Handling CREATE_NEW_SLIDE intent as generate_next_slide action');
        return await this.handleGenerateNextSlide(conversationHistory);
      }
      
      // Уніфікована обробка створення слайдів (як першого, так і наступних)
      if (intentResult.intent === 'create_slide') {
        console.log('🎨 Handling CREATE_SLIDE intent');
        
        // Якщо є контекст уроку - це додатковий слайд
        if (conversationHistory?.currentLesson) {
          console.log('📚 Existing lesson found, creating additional slide');
          return await this.handleGenerateNextSlide(conversationHistory);
        }
        
        // Інакше це помилка - CREATE_SLIDE без контексту має бути CREATE_LESSON
        return {
          success: false,
          message: '🤔 Схоже ви хочете створити слайд, але спочатку потрібно створити урок.\n\nСпробуйте: "Створи урок про [тема] для дітей [вік] років"',
          conversationHistory,
          error: 'CREATE_SLIDE without lesson context'
        };
      }
      
      if (intentResult.intent === 'regenerate_slide') {
        return await this.handleRegenerateSlide(conversationHistory, intentResult);
      }

      // Обробляємо редагування та покращення слайдів
      if (intentResult.intent === 'edit_slide') {
        return await this.handleEditSlide(conversationHistory, intentResult);
      }

      if (intentResult.intent === 'improve_html') {
        return await this.handleImproveSlide(conversationHistory, intentResult);
      }

      if (intentResult.intent === 'edit_html_inline') {
        return await this.handleInlineEditSlide(conversationHistory, intentResult);
      }
      
      // Знаходимо відповідний обробник
      const handler = this.findHandler(intentResult, conversationHistory);
      
      if (!handler) {
        // Спробуємо відобразити невідомий інтент на існуючий
        const mappedIntent = this.tryMapUnknownIntent(intentResult);
        if (mappedIntent) {
          console.log(`🔄 Mapped unknown intent ${intentResult.intent} → ${mappedIntent.intent}`);
          const mappedHandler = this.findHandler(mappedIntent, conversationHistory);
          if (mappedHandler) {
            return await mappedHandler.handle(mappedIntent, conversationHistory as any);
          }
        }
        
        // Якщо не вдалося відобразити, повертаємо дружнє повідомлення з пропозиціями
        return this.generateFallbackResponse(intentResult, conversationHistory);
      }

      // Обробляємо запит
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

  private findHandler(
    intentResult: any, 
    conversationHistory?: ConversationHistory
  ): IIntentHandler | undefined {
    // Спеціальні випадки для інтентів які не мають окремих handlers
    if (intentResult.intent === 'create_new_slide' || intentResult.intent === 'regenerate_slide') {
      // Ці інтенти обробляються через actions
      return undefined;
    }

    return this.handlers.find(handler => 
      handler.canHandle(intentResult, conversationHistory)
    );
  }

  private async handleAction(
    action: string, 
    conversationHistory?: ConversationHistory,
    intentResult?: any
  ): Promise<ChatResponse> {
    switch (action) {
      case 'approve_plan':
        return await this.handleApprovePlan(conversationHistory);
      
      case 'edit_plan':
        return await this.handleEditPlanAction(conversationHistory);

      case 'generate_next_slide':
        return await this.handleGenerateNextSlide(conversationHistory);

      case 'regenerate_slide':
        return await this.handleRegenerateSlide(conversationHistory, intentResult);
        
      case 'help':
        const helpHandler = new HelpHandler();
        return await helpHandler.handle(intentResult || { intent: 'help', language: 'uk' });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async handleApprovePlan(conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    if (!conversationHistory?.planningResult) {
      throw new Error('No plan to approve');
    }

    console.log('🎨 Generating first slide HTML using Claude Sonnet...');
    console.log('📋 Lesson plan:', conversationHistory.planningResult.substring(0, 200) + '...');
    
    try {
      // Витягуємо опис першого слайду з плану уроку
      const firstSlideDescription = this.extractSlideDescription(conversationHistory.planningResult, 1);
      console.log('📝 First slide description:', firstSlideDescription.substring(0, 100) + '...');

      // Генеруємо HTML слайд через Claude Sonnet
      const slideHTML = await this.contentService.generateSlideContent(
        firstSlideDescription,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Slide HTML generated successfully, length:', slideHTML.length);

      // Створюємо урок з першим слайдом
      const lesson = {
        id: `lesson_${Date.now()}`,
        title: conversationHistory.lessonTopic || 'Новий урок',
        description: `Урок про ${conversationHistory.lessonTopic} для дітей ${conversationHistory.lessonAge}`,
        subject: 'Загальне навчання',
        ageGroup: conversationHistory.lessonAge || '8-9 років',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'ai-chat',
        slides: [{
          id: `slide_${Date.now()}`,
          title: `${conversationHistory.lessonTopic} - Слайд 1`,
          content: 'Слайд 1 згенеровано на основі навчальної програми',
          htmlContent: slideHTML,
          type: 'content' as const,
          status: 'completed' as const
        }]
      };

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        step: 'slide_generation',
        currentSlideIndex: 1,
        generatedSlides: [{ id: 1, html: slideHTML }],
        currentLesson: lesson
      };

      console.log('🎯 ChatService returning lesson object with real generated slide:', {
        lessonId: lesson.id,
        title: lesson.title,
        slidesCount: lesson.slides.length,
        slideHtmlPreview: slideHTML.substring(0, 100) + '...'
      });

      return {
        success: true,
        message: `✅ **Перший слайд готовий!** (1/${conversationHistory.totalSlides})

Слайд згенеровано з використанням Claude Sonnet на основі навчальної програми та доданий до правої панелі.

🎯 **Що далі?**
• Переглянути слайд у правій панелі ➡️
• Генерувати наступний слайд
• Покращити поточний слайд`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд 2/${conversationHistory.totalSlides}`
          },
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: 'Створити новий варіант цього слайду'
          }
        ],
        lesson: lesson
      };
    } catch (error) {
      console.error('❌ Error generating slide with Claude:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при генерації слайду. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleEditPlanAction(conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    if (!conversationHistory) {
      throw new Error('No conversation history for plan editing');
    }

    const newConversationHistory: ConversationHistory = {
      ...conversationHistory,
      step: 'plan_editing'
    };

    return {
      success: true,
      message: `Напишіть які зміни хочете внести до плану. Наприклад:
        
- "Додай слайд про літаючих динозаврів"
- "Зміни вік дітей на 8 років"  
- "Зроби урок коротшим - 4 слайди"
- "Додай більше ігор"`,
      conversationHistory: newConversationHistory,
      actions: []
    };
  }

  private async handleGenerateNextSlide(conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    if (!conversationHistory || !conversationHistory.currentLesson) {
      throw new Error('No lesson context for next slide generation');
    }

    const currentSlideNumber = conversationHistory.currentSlideIndex || 1;
    const nextSlideNumber = currentSlideNumber + 1;
    
    if (nextSlideNumber > (conversationHistory.totalSlides || 6)) {
      return {
        success: true,
        message: `🎉 **Урок завершено!**

Всі ${conversationHistory.totalSlides} слайдів створено успішно на основі навчальної програми!

🎯 **Доступні дії:**
• Переглянути всі слайди у правій панелі
• Зберегти урок до бібліотеки
• Експортувати урок`,
        conversationHistory,
        actions: [
          {
            action: 'save_lesson',
            label: '💾 Зберегти урок',
            description: 'Зберегти урок до особистої бібліотеки'
          }
        ]
      };
    }

    console.log(`🎨 Generating slide ${nextSlideNumber} using Claude Sonnet...`);
    
    try {
      // Витягуємо опис слайду з навчальної програми
      const slideDescription = this.extractSlideDescription(
        conversationHistory.planningResult || '', 
        nextSlideNumber
      );
      
      console.log('📝 Slide description:', slideDescription.substring(0, 100) + '...');

      // Генеруємо HTML слайд через Claude Sonnet
      const slideHTML = await this.contentService.generateSlideContent(
        slideDescription,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Slide HTML generated successfully, length:', slideHTML.length);

      // Додаємо новий слайд до існуючого уроку
      const updatedLesson = {
        ...conversationHistory.currentLesson,
        slides: [
          ...conversationHistory.currentLesson.slides,
          {
            id: `slide_${Date.now()}`,
            title: `${conversationHistory.lessonTopic} - Слайд ${nextSlideNumber}`,
            content: `Слайд ${nextSlideNumber} згенеровано на основі навчальної програми`,
            htmlContent: slideHTML,
            type: 'content' as const,
            status: 'completed' as const
          }
        ]
      };

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        currentSlideIndex: nextSlideNumber,
        generatedSlides: [
          ...(conversationHistory.generatedSlides || []),
          { id: nextSlideNumber, html: slideHTML }
        ],
        currentLesson: updatedLesson
      };

      return {
        success: true,
        message: `✅ **Слайд ${nextSlideNumber} готовий!** (${nextSlideNumber}/${conversationHistory.totalSlides})

Слайд згенеровано з використанням Claude Sonnet на основі навчальної програми та додано до правої панелі.

🎯 **Що далі?**`,
        conversationHistory: newConversationHistory,
        actions: nextSlideNumber < (conversationHistory.totalSlides || 6) ? [
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${nextSlideNumber + 1}/${conversationHistory.totalSlides}`
          },
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${nextSlideNumber}`
          }
        ] : [
          {
            action: 'save_lesson',
            label: '💾 Зберегти урок',
            description: 'Зберегти урок до особистої бібліотеки'
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      console.error('❌ Error generating next slide with Claude:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при генерації слайду ${nextSlideNumber}. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleRegenerateSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory || !conversationHistory.currentLesson) {
      throw new Error('No lesson context for slide regeneration');
    }

    // Використовуємо номер слайду з параметрів інтенту, якщо є, інакше поточний слайд
    const slideNumberToRegenerate = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    // Перевіряємо чи існує слайд з таким номером
    if (slideNumberToRegenerate < 1 || slideNumberToRegenerate > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка регенерації**

Слайд ${slideNumberToRegenerate} не існує. У поточному уроці є тільки ${conversationHistory.currentLesson.slides.length} слайд(ів).

Доступні слайди: 1-${conversationHistory.currentLesson.slides.length}`,
        conversationHistory,
        error: `Slide ${slideNumberToRegenerate} does not exist`
      };
    }
    
    console.log(`🔄 Regenerating slide ${slideNumberToRegenerate} using Claude Sonnet...`);
    
    try {
      // Витягуємо опис слайду з навчальної програми
      const slideDescription = this.extractSlideDescription(
        conversationHistory.planningResult || '', 
        slideNumberToRegenerate
      );
      
      console.log('📝 Slide description for regeneration:', slideDescription.substring(0, 100) + '...');

      // Генеруємо новий HTML слайд через Claude Sonnet
      const newSlideHTML = await this.contentService.generateSlideContent(
        `${slideDescription}. Створіть НОВИЙ варіант цього слайду з іншим дизайном та підходом.`,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Slide HTML regenerated successfully, length:', newSlideHTML.length);

      // Знаходимо ID слайду який треба оновити
      const slideToUpdate = conversationHistory.currentLesson.slides[slideNumberToRegenerate - 1];
      const slideId = slideToUpdate.id;

      // Аналізуємо зміни між старим та новим слайдом
      const detectedChanges = this.analyzeSlideChanges(slideToUpdate, newSlideHTML, 'Повна регенерація слайду');

      // Оновлюємо поточний слайд (ЗАМІНЮЄМО, а не створюємо новий)
      const updatedLesson = {
        ...conversationHistory.currentLesson,
        slides: conversationHistory.currentLesson.slides.map((slide, index) => 
          index === slideNumberToRegenerate - 1 ? {
            ...slide,
            id: slideId, // ЗБЕРІГАЄМО той же ID!
            htmlContent: newSlideHTML,
            content: `Слайд ${slideNumberToRegenerate} перегенеровано на основі навчальної програми`,
            updatedAt: new Date()
          } : slide
        )
      };

      // Оновлюємо також generatedSlides з тим же ID
      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        generatedSlides: (conversationHistory.generatedSlides || []).map(slide => 
          slide.id === slideNumberToRegenerate ? { 
            ...slide, 
            id: slideNumberToRegenerate, // Зберігаємо numberic ID
            html: newSlideHTML 
          } : slide
        ),
        currentLesson: updatedLesson,
        currentSlideIndex: slideNumberToRegenerate // Оновлюємо поточний індекс на регенерований слайд
      };

      return {
        success: true,
        message: `🔄 **Слайд ${slideNumberToRegenerate} перегенеровано!**

Новий варіант слайду створено з використанням Claude Sonnet на основі навчальної програми та **замінено** попередній слайд в правій панелі.

📋 **Детальний звіт про зміни:**
${detectedChanges.map(change => `• ${change}`).join('\n')}

🎯 **Тип операції:** Повна регенерація контенту`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${slideNumberToRegenerate + 1}/${conversationHistory.totalSlides}`
          },
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати ще раз',
            description: `Створити ще один варіант слайду ${slideNumberToRegenerate}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      console.error('❌ Error regenerating slide with Claude:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при перегенерації слайду ${slideNumberToRegenerate}. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory || !conversationHistory.currentLesson) {
      throw new Error('No lesson context for slide editing');
    }

    // Використовуємо номер слайду з параметрів інтенту, якщо є, інакше поточний слайд
    const slideNumberToEdit = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    // Перевіряємо чи існує слайд з таким номером
    if (slideNumberToEdit < 1 || slideNumberToEdit > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка редагування**

Слайд ${slideNumberToEdit} не існує. У поточному уроці є тільки ${conversationHistory.currentLesson.slides.length} слайд(ів).

Доступні слайди: 1-${conversationHistory.currentLesson.slides.length}`,
        conversationHistory,
        error: `Slide ${slideNumberToEdit} does not exist`
      };
    }
    
          console.log(`🔧 Performing simple edit on slide ${slideNumberToEdit}...`);
    
    try {
      // Отримуємо поточний слайд
      const currentSlide = conversationHistory.currentLesson.slides[slideNumberToEdit - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || 'Покращити слайд';
      
      // Використовуємо простий підхід - надсилаємо HTML до Claude
      const editedSlideHTML = await this.simpleEditService.editSlide(
        currentSlide.htmlContent || currentSlide.content,
        editInstruction,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Simple slide edit completed, length:', editedSlideHTML.length);

      // ВАЖЛИВО: Обробляємо зображення після редагування
      console.log('🎨 Processing images after slide editing...');
      const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(editedSlideHTML);
      
      // Використовуємо HTML з обробленими зображеннями
      const finalSlideHTML = imageProcessingResult.htmlWithImages;
      
      // Логуємо результати обробки зображень
      if (imageProcessingResult.generatedImages.length > 0) {
        const successful = imageProcessingResult.generatedImages.filter(img => img.success).length;
        const failed = imageProcessingResult.generatedImages.length - successful;
        console.log(`📸 Image processing after edit: ${successful} successful, ${failed} failed`);
      }
      
      // Виводимо помилки якщо є
      if (imageProcessingResult.processingErrors.length > 0) {
        console.warn('⚠️ Image processing errors after edit:', imageProcessingResult.processingErrors);
      }

      console.log('✅ Final slide with images ready after edit, length:', finalSlideHTML.length);

      // Зберігаємо ID слайду який треба оновити
      const slideId = currentSlide.id;

      // Аналізуємо зміни між старим та новим слайдом
      const detectedChanges = this.simpleEditService.analyzeChanges(
        currentSlide.htmlContent || currentSlide.content,
        finalSlideHTML,
        editInstruction
      );

      // Оновлюємо поточний слайд (ЗАМІНЮЄМО, а не створюємо новий)
      const updatedLesson = {
        ...conversationHistory.currentLesson,
        slides: conversationHistory.currentLesson.slides.map((slide, index) => 
          index === slideNumberToEdit - 1 ? {
            ...slide,
            id: slideId, // ЗБЕРІГАЄМО той же ID!
            htmlContent: finalSlideHTML,
            content: `Слайд ${slideNumberToEdit} відредаговано: ${editInstruction}`,
            updatedAt: new Date()
          } : slide
        )
      };

      // Оновлюємо також generatedSlides з тим же ID
      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        generatedSlides: (conversationHistory.generatedSlides || []).map(slide => 
          slide.id === slideNumberToEdit ? { 
            ...slide, 
            id: slideNumberToEdit, // Зберігаємо numberic ID
            html: finalSlideHTML 
          } : slide
        ),
        currentLesson: updatedLesson,
        currentSlideIndex: slideNumberToEdit // Оновлюємо поточний індекс на редагований слайд
      };

      return {
        success: true,
        message: `🔧 **Слайд ${slideNumberToEdit} відредаговано!**

Слайд оновлено згідно з вашою інструкцією. Слайд **замінено** в правій панелі.

📋 **Детальний звіт про зміни:**
${detectedChanges.map((change: string) => `• ${change}`).join('\n')}

🎯 **Ваша інструкція:** "${editInstruction}"

✨ **Простий підхід редагування:**
• Claude отримує весь HTML слайду
• Виконує інструкцію користувача
• Повертає оновлений слайд`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumberToEdit}`
          },
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${slideNumberToEdit + 1}/${conversationHistory.totalSlides}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      console.error('❌ Error with simple slide editing:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при редагуванні слайду ${slideNumberToEdit}. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleImproveSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory || !conversationHistory.currentLesson) {
      throw new Error('No lesson context for slide improvement');
    }

    // Використовуємо номер слайду з параметрів інтенту, якщо є, інакше поточний слайд
    const slideNumberToImprove = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    // Перевіряємо чи існує слайд з таким номером
    if (slideNumberToImprove < 1 || slideNumberToImprove > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка покращення**

Поточний слайд ${slideNumberToImprove} не існує. У поточному уроці є тільки ${conversationHistory.currentLesson.slides.length} слайд(ів).`,
        conversationHistory,
        error: `Current slide ${slideNumberToImprove} does not exist`
      };
    }
    
    console.log(`🎨 Improving slide ${slideNumberToImprove} using Claude Sonnet...`);
    
    try {
      // Отримуємо поточний слайд
      const currentSlide = conversationHistory.currentLesson.slides[slideNumberToImprove - 1];
      const improvementInstruction = intentResult?.parameters?.rawMessage || 'Зробити слайд яскравішим та інтерактивнішим';
      
      // Генеруємо покращений HTML слайд через Claude Sonnet
      const improvedSlideHTML = await this.contentService.generateSlideContent(
        `Покращити дизайн та інтерактивність існуючого слайду: "${improvementInstruction}". 
        
Поточний HTML контент слайду для покращення (зберегти основний зміст, покращити дизайн):
${currentSlide.htmlContent.substring(0, 1000)}...

Створіть покращену версію з кращим дизайном, анімаціями та інтерактивністю.`,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Slide HTML improved successfully, length:', improvedSlideHTML.length);

      // Зберігаємо ID слайду який треба оновити
      const slideId = currentSlide.id;

      // Аналізуємо зміни між старим та новим слайдом
      const detectedChanges = this.analyzeSlideChanges(currentSlide, improvedSlideHTML, improvementInstruction);

      // Оновлюємо поточний слайд (ЗАМІНЮЄМО, а не створюємо новий)
      const updatedLesson = {
        ...conversationHistory.currentLesson,
        slides: conversationHistory.currentLesson.slides.map((slide, index) => 
          index === slideNumberToImprove - 1 ? {
            ...slide,
            id: slideId, // ЗБЕРІГАЄМО той же ID!
            htmlContent: improvedSlideHTML,
            content: `Слайд ${slideNumberToImprove} покращено: ${improvementInstruction}`,
            updatedAt: new Date()
          } : slide
        )
      };

      // Оновлюємо також generatedSlides з тим же ID
      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        generatedSlides: (conversationHistory.generatedSlides || []).map(slide => 
          slide.id === slideNumberToImprove ? { 
            ...slide, 
            id: slideNumberToImprove, // Зберігаємо numberic ID
            html: improvedSlideHTML 
          } : slide
        ),
        currentLesson: updatedLesson
      };

      return {
        success: true,
        message: `🎨 **Слайд ${slideNumberToImprove} покращено!**

Слайд оновлено з кращим дизайном та інтерактивністю, **замінено** попередній слайд в правій панелі.

📋 **Детальний звіт про покращення:**
${detectedChanges.map(change => `• ${change}`).join('\n')}

🎯 **Застосовано:** "${improvementInstruction}"`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumberToImprove}`
          },
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${slideNumberToImprove + 1}/${conversationHistory.totalSlides}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      console.error('❌ Error improving slide with Claude:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при покращенні слайду ${slideNumberToImprove}. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleInlineEditSlide(conversationHistory?: ConversationHistory, intentResult?: any): Promise<ChatResponse> {
    if (!conversationHistory || !conversationHistory.currentLesson) {
      throw new Error('No lesson context for inline slide editing');
    }

    // Використовуємо номер слайду з параметрів інтенту, якщо є, інакше поточний слайд
    const slideNumberToEdit = intentResult?.parameters?.slideNumber || conversationHistory.currentSlideIndex || 1;
    
    // Перевіряємо чи існує слайд з таким номером
    if (slideNumberToEdit < 1 || slideNumberToEdit > conversationHistory.currentLesson.slides.length) {
      return {
        success: false,
        message: `❌ **Помилка редагування**

Слайд ${slideNumberToEdit} не існує. У поточному уроці є тільки ${conversationHistory.currentLesson.slides.length} слайд(ів).

Доступні слайди: 1-${conversationHistory.currentLesson.slides.length}`,
        conversationHistory,
        error: `Slide ${slideNumberToEdit} does not exist`
      };
    }
    
          console.log(`🔧 Performing simple inline edit on slide ${slideNumberToEdit}...`);
    
    try {
      // Отримуємо поточний слайд
      const currentSlide = conversationHistory.currentLesson.slides[slideNumberToEdit - 1];
      const editInstruction = intentResult?.parameters?.rawMessage || '';
      const targetText = intentResult?.parameters?.targetText || '';
      const newText = intentResult?.parameters?.newText || '';
      
      // Формуємо інструкцію для точкового редагування
      let finalInstruction = '';
      if (targetText && newText) {
        finalInstruction = `Замініть "${targetText}" на "${newText}"`;
      } else {
        finalInstruction = editInstruction;
      }
      
      // Використовуємо простий підхід редагування
      const editedSlideHTML = await this.simpleEditService.editSlide(
        currentSlide.htmlContent || currentSlide.content,
        finalInstruction,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      console.log('✅ Simple inline edit completed, length:', editedSlideHTML.length);

      // ВАЖЛИВО: Обробляємо зображення після inline редагування
      console.log('🎨 Processing images after inline slide editing...');
      const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(editedSlideHTML);
      
      // Використовуємо HTML з обробленими зображеннями
      const finalSlideHTML = imageProcessingResult.htmlWithImages;
      
      // Логуємо результати обробки зображень
      if (imageProcessingResult.generatedImages.length > 0) {
        const successful = imageProcessingResult.generatedImages.filter(img => img.success).length;
        const failed = imageProcessingResult.generatedImages.length - successful;
        console.log(`📸 Image processing after inline edit: ${successful} successful, ${failed} failed`);
      }
      
      // Виводимо помилки якщо є
      if (imageProcessingResult.processingErrors.length > 0) {
        console.warn('⚠️ Image processing errors after inline edit:', imageProcessingResult.processingErrors);
      }

      console.log('✅ Final slide with images ready after inline edit, length:', finalSlideHTML.length);

      // Зберігаємо ID слайду який треба оновити
      const slideId = currentSlide.id;

      // Аналізуємо зміни між старим та новим слайдом
      const detectedChanges = this.simpleEditService.analyzeChanges(
        currentSlide.htmlContent || currentSlide.content,
        finalSlideHTML,
        finalInstruction
      );

      // Оновлюємо поточний слайд (ЗАМІНЮЄМО, а не створюємо новий)
      const updatedLesson = {
        ...conversationHistory.currentLesson,
        slides: conversationHistory.currentLesson.slides.map((slide, index) => 
          index === slideNumberToEdit - 1 ? {
            ...slide,
            id: slideId, // ЗБЕРІГАЄМО той же ID!
            htmlContent: finalSlideHTML,
            content: targetText && newText 
              ? `Слайд ${slideNumberToEdit}: замінено "${targetText}" на "${newText}"`
              : `Слайд ${slideNumberToEdit} відредаговано: ${editInstruction}`,
            updatedAt: new Date()
          } : slide
        )
      };

      // Оновлюємо також generatedSlides з тим же ID
      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        generatedSlides: (conversationHistory.generatedSlides || []).map(slide => 
          slide.id === slideNumberToEdit ? { 
            ...slide, 
            id: slideNumberToEdit, // Зберігаємо numberic ID
            html: finalSlideHTML 
          } : slide
        ),
        currentLesson: updatedLesson
      };

      const changeDescription = targetText && newText 
        ? `Замінено "${targetText}" на "${newText}"`
        : editInstruction;

      return {
        success: true,
        message: `🔧 **Слайд ${slideNumberToEdit} відредаговано!**

Слайд оновлено згідно з інструкцією. Слайд **замінено** в правій панелі.

📋 **Детальний звіт про редагування:**
${detectedChanges.map((change: string) => `• ${change}`).join('\n')}

🎯 **Ваша інструкція:** "${changeDescription}"

✨ **Простий підхід редагування:**
• Claude отримує весь HTML слайду
• Виконує інструкцію користувача  
• Повертає оновлений слайд`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'regenerate_slide',
            label: '🔄 Перегенерувати',
            description: `Створити новий варіант слайду ${slideNumberToEdit}`
          },
          {
            action: 'generate_next_slide',
            label: '▶️ Наступний слайд',
            description: `Генерувати слайд ${slideNumberToEdit + 1}/${conversationHistory.totalSlides}`
          }
        ],
        lesson: updatedLesson
      };
    } catch (error) {
      console.error('❌ Error simple inline editing slide:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при редагуванні слайду ${slideNumberToEdit}. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Метод для відображення невідомих інтентів на існуючі
  private tryMapUnknownIntent(intentResult: any): any | null {
    // Спочатку спробуємо прямий мапінг (швидко)
    const directMappings: { [key: string]: string } = {
      'generate_plan': 'create_lesson',
      'create_plan': 'create_lesson',
      'make_lesson': 'create_lesson',
      'edit_lesson': 'edit_plan',
      'modify_plan': 'edit_plan',
      'update_plan': 'edit_plan',
      'general_chat': 'free_chat',
      'greeting': 'free_chat'
    };

    const directMatch = directMappings[intentResult.intent];
    if (directMatch) {
      console.log(`🎯 Direct mapping: ${intentResult.intent} → ${directMatch}`);
      return {
        ...intentResult,
        intent: directMatch,
        reasoning: `Direct mapping from ${intentResult.intent} to ${directMatch}`
      };
    }

    // Якщо прямого мапінгу немає, аналізуємо схожість з доступними інтентами
    const availableIntents = [
      'create_lesson',
      'edit_plan', 
      'create_slide',
      'create_new_slide',
      'regenerate_slide',
      'edit_html_inline',
      'edit_slide',
      'improve_html',
      'free_chat',
      'help',
      'export',
      'preview'
    ];

         const bestMatch = this.findBestIntentMatch(intentResult.intent, availableIntents, intentResult.parameters);
     
     if (bestMatch) {
       console.log(`🧠 Smart mapping: ${intentResult.intent} → ${bestMatch.intent} (confidence: ${bestMatch.confidence})`);
       return {
         ...intentResult,
         intent: bestMatch.intent,
         reasoning: `Smart mapping from ${intentResult.intent} to ${bestMatch.intent} (${bestMatch.reason})`
       };
     }

    return null;
  }

  // Розумний пошук найкращого відповідника серед доступних інтентів
  private findBestIntentMatch(unknownIntent: string, availableIntents: string[], parameters: any): { intent: string; confidence: number; reason: string } | null {
    const scores: Array<{ intent: string; score: number; reason: string }> = [];

    for (const availableIntent of availableIntents) {
      let score = 0;
      let reasons: string[] = [];

      // 1. Перевіряємо схожість в назвах
      const similarity = this.calculateStringSimilarity(unknownIntent, availableIntent);
      if (similarity > 0.3) {
        score += similarity * 40;
        reasons.push(`name similarity: ${(similarity * 100).toFixed(1)}%`);
      }

      // 2. Аналізуємо ключові слова
      const unknownWords = unknownIntent.toLowerCase().split('_');
      const availableWords = availableIntent.toLowerCase().split('_');
      
      for (const word of unknownWords) {
        if (availableWords.includes(word)) {
          score += 20;
          reasons.push(`keyword match: "${word}"`);
        }
      }

             // 3. Семантичний аналіз базується на параметрах та контексті
       if (parameters) {
         // Якщо є тема або вік - схоже на створення уроку
         if ((parameters.topic || parameters.age) && availableIntent === 'create_lesson') {
           score += 30;
           reasons.push('has lesson parameters');
         }
         
         // Якщо є slideNumber - схоже на роботу зі слайдами
         if (parameters.slideNumber && availableIntent.includes('slide')) {
           score += 25;
           reasons.push('has slide number');
         }
         
         // Якщо згадується план - схоже на редагування плану
         if (unknownIntent.includes('plan') && availableIntent === 'edit_plan') {
           score += 35;
           reasons.push('plan-related');
         }
       }

       // 4. Контекстуальний аналіз - чи є поточний урок
       if (this.hasActiveLessonContext()) {
         // Якщо є активний урок і згадується слайд - це створення нового слайду
         if ((unknownIntent.includes('слайд') || unknownIntent.includes('slide')) && 
             availableIntent === 'create_new_slide') {
           score += 40;
           reasons.push('active lesson context + slide mention');
         }
         
         // Слова типу "наступний", "третій", "далі" в контексті уроку
         if ((unknownIntent.includes('наступн') || unknownIntent.includes('третій') || 
              unknownIntent.includes('далі') || unknownIntent.includes('давай') ||
              unknownIntent.includes('next') || unknownIntent.includes('third')) && 
             availableIntent === 'create_new_slide') {
           score += 35;
           reasons.push('continuation words + lesson context');
         }
       }

      // 4. Загальні шаблони
      if (unknownIntent.includes('create') || unknownIntent.includes('generate')) {
        if (availableIntent === 'create_lesson' || availableIntent === 'create_slide') {
          score += 15;
          reasons.push('creation intent');
        }
      }

      if (unknownIntent.includes('edit') || unknownIntent.includes('modify') || unknownIntent.includes('update')) {
        if (availableIntent.includes('edit') || availableIntent === 'edit_plan') {
          score += 15;
          reasons.push('modification intent');
        }
      }

      if (score > 0) {
        scores.push({
          intent: availableIntent,
          score,
          reason: reasons.join(', ')
        });
      }
    }

    // Знаходимо найкращий результат
    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length > 0 && scores[0].score >= 30) { // Мінімальний поріг
      return {
        intent: scores[0].intent,
        confidence: Math.min(scores[0].score / 100, 0.8), // Максимум 0.8 для мапінгу
        reason: scores[0].reason
      };
    }

    return null;
  }

  // Перевіряє чи є активний урок в поточному контексті
  private hasActiveLessonContext(): boolean {
    // Тут можна додати логіку перевірки глобального стану або сесії
    // Наразі повертаємо true, якщо метод викликається в контексті обробки повідомлення
    // В майбутньому можна буде додати перевірку через localStorage або стан програми
    return true; // Спрощена логіка - потребує покращення
  }

  // Простий алгоритм Левенштейна для схожості рядків
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len2][len1]) / maxLen;
  }

  // Метод для генерації fallback відповіді
  private generateFallbackResponse(intentResult: any, conversationHistory?: ConversationHistory): ChatResponse {
    const language = intentResult.language || 'uk';
    
    let message = '';
    if (language === 'uk') {
      message = `🤔 Я поки не впевнений, як саме вам допомогти з цим запитом.

**Ось що я можу зробити:**
• 📚 Створити новий урок (наприклад: "створи урок про динозаврів для дітей 6 років")
• 📝 Редагувати існуючий план уроку
• 🎨 Додати нові слайди до уроку
• ❓ Надати допомогу з командами

**Спробуйте переформулювати ваш запит більш конкретно.**`;
    } else {
      message = `🤔 I'm not sure how to help you with this request yet.

**Here's what I can do:**
• 📚 Create a new lesson (e.g., "create a lesson about dinosaurs for 6-year-olds")
• 📝 Edit existing lesson plans
• 🎨 Add new slides to lessons
• ❓ Provide help with commands

**Try rephrasing your request more specifically.**`;
    }

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

  // Функція для аналізу змін у слайді
  private analyzeSlideChanges(oldSlide: any, newSlideHTML: string, editInstruction: string): string[] {
    const changes: string[] = [];
    
    try {
      // Аналіз зображень
      const oldImages = (oldSlide.htmlContent.match(/<img[^>]*>/g) || []).length;
      const newImages = (newSlideHTML.match(/<img[^>]*>/g) || []).length;
      
      if (newImages > oldImages) {
        changes.push(`➕ Додано ${newImages - oldImages} нових зображень`);
      } else if (newImages < oldImages) {
        changes.push(`➖ Видалено ${oldImages - newImages} зображень`);
      } else if (newImages > 0 && oldImages > 0) {
        changes.push(`🔄 Оновлено ${newImages} зображень`);
      }
      
      // Аналіз тексту
      const oldTextLength = oldSlide.htmlContent.replace(/<[^>]*>/g, '').trim().length;
      const newTextLength = newSlideHTML.replace(/<[^>]*>/g, '').trim().length;
      
      if (newTextLength > oldTextLength * 1.2) {
        changes.push(`📝 Значно розширено текстовий контент (+${Math.round((newTextLength - oldTextLength) / oldTextLength * 100)}%)`);
      } else if (newTextLength < oldTextLength * 0.8) {
        changes.push(`✂️ Скорочено текстовий контент (-${Math.round((oldTextLength - newTextLength) / oldTextLength * 100)}%)`);
      } else if (Math.abs(newTextLength - oldTextLength) > 50) {
        changes.push(`📝 Оновлено текстовий контент`);
      }
      
      // Аналіз інтерактивних елементів
      const oldButtons = (oldSlide.htmlContent.match(/<button[^>]*>/g) || []).length;
      const newButtons = (newSlideHTML.match(/<button[^>]*>/g) || []).length;
      
      if (newButtons > oldButtons) {
        changes.push(`🎮 Додано ${newButtons - oldButtons} інтерактивних кнопок`);
      } else if (newButtons < oldButtons) {
        changes.push(`🎮 Видалено ${oldButtons - newButtons} інтерактивних кнопок`);
      }
      
      // Аналіз анімацій та переходів
      const hasNewAnimations = newSlideHTML.includes('animation') || newSlideHTML.includes('transition') || newSlideHTML.includes('@keyframes');
      const hadOldAnimations = oldSlide.htmlContent.includes('animation') || oldSlide.htmlContent.includes('transition') || oldSlide.htmlContent.includes('@keyframes');
      
      if (hasNewAnimations && !hadOldAnimations) {
        changes.push(`✨ Додано анімації та плавні переходи`);
      } else if (!hasNewAnimations && hadOldAnimations) {
        changes.push(`🔇 Видалено анімації`);
      } else if (hasNewAnimations && hadOldAnimations) {
        changes.push(`✨ Оновлено анімації та ефекти`);
      }
      
      // Аналіз кольорової схеми
      const oldColorMatches = oldSlide.htmlContent.match(/(background-color|color)\s*:\s*[^;]+/g) || [];
      const newColorMatches = newSlideHTML.match(/(background-color|color)\s*:\s*[^;]+/g) || [];
      
      if (newColorMatches.length > oldColorMatches.length) {
        changes.push(`🎨 Покращено кольорову схему (додано кольори)`);
      } else if (newColorMatches.length !== oldColorMatches.length) {
        changes.push(`🎨 Змінено кольорову палітру`);
      }
      
      // Аналіз структури HTML
      const oldElements = (oldSlide.htmlContent.match(/<\w+[^>]*>/g) || []).length;
      const newElements = (newSlideHTML.match(/<\w+[^>]*>/g) || []).length;
      
      if (newElements > oldElements * 1.3) {
        changes.push(`🏗️ Значно ускладнено структуру слайду`);
      } else if (newElements < oldElements * 0.7) {
        changes.push(`🧹 Спрощено структуру слайду`);
      }
      
      // Аналіз на основі інструкції користувача
      const instruction = editInstruction.toLowerCase();
      
      if (instruction.includes('картинк') || instruction.includes('зображен') || instruction.includes('фото')) {
        if (!changes.some(c => c.includes('зображень'))) {
          changes.push(`🖼️ Оновлено зображення згідно з вашою інструкцією`);
        }
      }
      
      if (instruction.includes('колір') || instruction.includes('яскрав') || instruction.includes('барв')) {
        if (!changes.some(c => c.includes('кольор'))) {
          changes.push(`🌈 Змінено кольори для більшої яскравості`);
        }
      }
      
      if (instruction.includes('текст') || instruction.includes('напис') || instruction.includes('слов')) {
        if (!changes.some(c => c.includes('текст'))) {
          changes.push(`📝 Оновлено текстовий контент`);
        }
      }
      
      if (instruction.includes('розмір') || instruction.includes('більш') || instruction.includes('менш')) {
        changes.push(`📏 Змінено розміри елементів`);
      }
      
      if (instruction.includes('анімац') || instruction.includes('рух') || instruction.includes('ефект')) {
        if (!changes.some(c => c.includes('анімації'))) {
          changes.push(`✨ Додано анімаційні ефекти`);
        }
      }
      
      // Якщо жодних змін не виявлено, додаємо загальні зміни
      if (changes.length === 0) {
        changes.push(`🔄 Повністю оновлено контент слайду`);
        changes.push(`📋 Застосовано вашу інструкцію: "${editInstruction}"`);
      }
      
    } catch (error) {
      console.warn('Error analyzing slide changes:', error);
      changes.push(`🔄 Оновлено слайд згідно з інструкцією`);
    }
    
    return changes;
  }

  private extractSlideDescription(planningResult: string, slideNumber: number): string {
    try {
      // Шукаємо слайд за номером в плані уроку
      const slidePatterns = [
        new RegExp(`##\\s*Слайд\\s+${slideNumber}[\\s\\S]*?(?=##\\s*Слайд\\s+|$)`, 'i'),
        new RegExp(`\\*\\*Слайд\\s+${slideNumber}[\\s\\S]*?(?=\\*\\*Слайд\\s+|$)`, 'i'),
        new RegExp(`${slideNumber}\\.[\\s\\S]*?(?=\\d+\\.|$)`, 'i')
      ];

      for (const pattern of slidePatterns) {
        const match = planningResult.match(pattern);
        if (match) {
          let description = match[0].trim();
          // Очищаємо від заголовків та форматування
          description = description.replace(/^##\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
          description = description.replace(/^\d+\.\s*/, '');
          
          if (description.length > 50) {
            return description;
          }
        }
      }

      // Якщо не знайшли конкретний слайд, повертаємо загальний опис
      const lines = planningResult.split('\n');
      const relevantLines = lines.slice(0, 10).join(' ');
      
      return `Створіть вступний слайд для уроку. ${relevantLines.substring(0, 200)}`;
    } catch (error) {
      console.warn('Error extracting slide description:', error);
      return `Створіть слайд ${slideNumber} для цього уроку на основі навчальної програми.`;
    }
  }
} 