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
import { type SimpleSlide, type SlideDescription, type SlideGenerationProgress, type BulkSlideGenerationResult, type SimpleLesson } from '@/types/chat';
import { type SlideImageInfo } from '@/types/lesson';
import { type ProcessedSlideData, extractImagePrompts, processSlideWithImages } from '@/utils/slideImageProcessor';
import { GeminiIntentService, EnhancedIntentDetectionResult } from '../intent/GeminiIntentService';

// Single Responsibility: Координує роботу чату через dependency injection
export class ChatService {
  private intentDetectionService: IIntentDetectionService;
  private handlers: IIntentHandler[];
  private contentService: GeminiContentService;
  private simpleEditService: GeminiSimpleEditService;

  constructor() {
    // Тепер використовує GeminiIntentService через фабрику
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
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found in environment variables (GEMINI_API_KEY)');
    }
    this.contentService = new GeminiContentService();
    this.simpleEditService = new GeminiSimpleEditService();
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
      
      // Обробка створення слайдів - тепер це додавання нового слайду до існуючого уроку
      if (intentResult.intent === 'create_slide') {
        console.log('🎨 Handling CREATE_SLIDE intent');
        
        // Якщо є контекст уроку - це додатковий слайд
        if (conversationHistory?.currentLesson) {
          console.log('📚 Existing lesson found, creating additional slide');
          return await this.handleCreateAdditionalSlide(conversationHistory, intentResult);
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
        // DEPRECATED: тепер слайди генеруються всі відразу
        return {
          success: false,
          message: '🤔 Слайди тепер генеруються всі відразу після схвалення плану уроку.\n\nЯкщо ви хочете додати новий слайд до існуючого уроку, скажіть: "Додай слайд про [тема]"',
          conversationHistory,
          error: 'generate_next_slide deprecated - use bulk generation'
        };

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

    console.log('🎨 Starting bulk slide generation using Gemini 2.5 Flash...');
    console.log('📋 Lesson plan:', conversationHistory.planningResult.substring(0, 200) + '...');
    
    try {
      // === КРОК 1: Витягуємо всі описи слайдів з плану ===
      const slideDescriptions = this.extractAllSlideDescriptions(conversationHistory.planningResult);
      console.log(`📄 Extracted ${slideDescriptions.length} slide descriptions from plan`);

      // === КРОК 2: Ініціалізуємо урок ===
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
        slides: [] // Поки що пустий масив, слайди додаються в процесі генерації
      };

      // === КРОК 3: Ініціалізуємо стан прогресу ===
      const initialProgress: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
        slideNumber: desc.slideNumber,
        title: desc.title,
        status: 'pending',
        progress: 0
      }));

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        step: 'bulk_generation',
        slideDescriptions,
        slideGenerationProgress: initialProgress,
        bulkGenerationStartTime: new Date(),
        isGeneratingAllSlides: true,
        currentLesson: lesson
      };

      // === КРОК 4: Повертаємо початкове повідомлення про початок генерації ===
      const initialMessage = `🎨 **Розпочинаємо генерацію всіх слайдів!**

📊 **План генерації:**
${slideDescriptions.map(desc => `${desc.slideNumber}. ${desc.title}`).join('\n')}

⏳ **Прогрес:** Генерується ${slideDescriptions.length} слайд(ів)...

Це може зайняти кілька хвилин. Слайди з'являтимуться в правій панелі по мірі готовності.`;

      // === КРОК 5: Запускаємо асинхронну генерацію слайдів ===
      this.generateAllSlidesAsync(
        slideDescriptions,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років',
        lesson,
        conversationHistory,
        (slide) => {
          // Слайд вже додано до уроку в generateAllSlidesAsync
          console.log(`✅ Slide "${slide.title}" ready and added to lesson`);
          
          // TODO: Тут можна додати real-time оновлення через WebSocket
          console.log('📊 Current lesson slides count:', lesson.slides.length);
        }
      );

      return {
        success: true,
        message: initialMessage,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'cancel_generation',
            label: '⏹️ Скасувати генерацію',
            description: 'Зупинити процес генерації слайдів'
          }
        ],
        lesson: lesson
      };

    } catch (error) {
      console.error('❌ Error starting bulk slide generation:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при підготовці до генерації слайдів. Спробуйте ще раз.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === АСИНХРОННА ГЕНЕРАЦІЯ ВСІХ СЛАЙДІВ (НЕ БЛОКУЄ UI) ===
  private async generateAllSlidesAsync(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    lesson: SimpleLesson,
    conversationHistory?: ConversationHistory,
    onSlideReady?: (slide: SimpleSlide) => void
  ): Promise<void> {
    try {
      console.log('🚀 Starting SEQUENTIAL slide generation...');
      
      // Генеруємо всі слайди ПОСЛІДОВНО
      const result = await this.generateAllSlides(
        slideDescriptions,
        lessonTopic,
        lessonAge,
        (progress) => {
          // Логіка для прогресу
          console.log('📊 Sequential generation progress:', progress);
        }
      );

      // Додаємо всі згенеровані слайди до уроку
      for (const slide of result.slides) {
        lesson.slides.push(slide);
        lesson.updatedAt = new Date();
        
        console.log(`✅ Slide "${slide.title}" ready and added to lesson`);
        
        // Викликаємо callback для оновлення UI для кожного слайду
        if (onSlideReady) {
          onSlideReady(slide);
        }
      }

      console.log(`🎉 SEQUENTIAL generation completed! ${result.completedSlides}/${result.totalSlides} slides generated`);
      
      if (result.failedSlides > 0) {
        console.warn(`⚠️ ${result.failedSlides} slides failed to generate`);
      }
      
    } catch (error) {
      console.error('❌ Error in sequential slide generation:', error);
      // TODO: Повідомити користувача про помилку через UI
    }
  }

  // === ДОДАВАННЯ ОКРЕМОГО СЛАЙДУ ДО ІСНУЮЧОГО УРОКУ ===
  private async handleCreateAdditionalSlide(
    conversationHistory?: ConversationHistory,
    intentResult?: any
  ): Promise<ChatResponse> {
    if (!conversationHistory?.currentLesson) {
      throw new Error('No lesson context for additional slide creation');
    }

    const currentLesson = conversationHistory.currentLesson;
    const nextSlideNumber = currentLesson.slides.length + 1;
    
    console.log(`📄 Creating additional slide ${nextSlideNumber} for lesson "${currentLesson.title}"`);
    
    try {
      // Витягуємо описи з параметрів інтенту або створюємо базовий
      const slideTitle = intentResult?.parameters?.slideTitle || `Додатковий слайд ${nextSlideNumber}`;
      const slideDescription = intentResult?.parameters?.slideDescription || 
        `Додатковий навчальний матеріал для уроку про ${conversationHistory.lessonTopic}`;

      // Генеруємо HTML контент слайду
      const slideHTML = await this.contentService.generateSlideContent(
        slideDescription,
        conversationHistory.lessonTopic || 'урок',
        conversationHistory.lessonAge || '6-8 років'
      );

      // Створюємо новий слайд
      const newSlide: SimpleSlide = {
        id: `slide_${Date.now()}_additional`,
        title: slideTitle,
        content: slideDescription,
        htmlContent: slideHTML,
        type: 'content',
        status: 'completed'
      };

      // Додаємо до уроку
      const updatedLesson = {
        ...currentLesson,
        slides: [...currentLesson.slides, newSlide],
        updatedAt: new Date()
      };

      const newConversationHistory: ConversationHistory = {
        ...conversationHistory,
        currentLesson: updatedLesson
      };

      return {
        success: true,
        message: `✅ **Новий слайд додано!**

Слайд "${slideTitle}" успішно створено та додано до уроку. Тепер у вашому уроці ${updatedLesson.slides.length} слайд(ів).

🎯 **Що далі?**
• Переглянути новий слайд у правій панелі
• Додати ще один слайд
• Зберегти урок`,
        conversationHistory: newConversationHistory,
        actions: [
          {
            action: 'create_slide',
            label: '➕ Додати ще слайд',
            description: 'Створити ще один слайд для цього уроку'
          },
          {
            action: 'save_lesson',
            label: '💾 Зберегти урок',
            description: 'Зберегти урок до особистої бібліотеки'
          }
        ],
        lesson: updatedLesson
      };

    } catch (error) {
      console.error('❌ Error creating additional slide:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при створенні нового слайду. Спробуйте ще раз.

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

    console.log(`🎨 Generating slide ${nextSlideNumber} using Gemini 2.5 Flash...`);
    
    try {
      // Витягуємо опис слайду з навчальної програми
      const slideDescription = this.extractSlideDescription(
        conversationHistory.planningResult || '', 
        nextSlideNumber
      );
      
      console.log('📝 Slide description:', slideDescription.substring(0, 100) + '...');

      // Генеруємо HTML слайд через Gemini 2.5 Flash
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

Слайд згенеровано за допомогою ШІ на основі навчальної програми та додано до правої панелі.

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
      console.error('❌ Error generating next slide with Gemini 2.5 Flash:', error);
      
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
      return {
        success: false,
        message: `❌ **Помилка регенерації**

Не знайдено урок для регенерації слайдів. 

🔍 **Можливі причини:**
• Урок ще не створений
• Слайди ще не згенеровані
• Контекст розмови втрачено

💡 **Рішення:**
• Спочатку створіть урок: "Створи урок про [тема] для дітей [вік] років"
• Дочекайтеся завершення генерації слайдів
• Потім спробуйте регенерувати слайди`,
        conversationHistory,
        error: 'No lesson context for slide regeneration'
      };
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
    
    console.log(`🔄 Regenerating slide ${slideNumberToRegenerate} using Gemini 2.5 Flash...`);
    
    try {
      // Витягуємо опис слайду з навчальної програми
      const slideDescription = this.extractSlideDescription(
        conversationHistory.planningResult || '', 
        slideNumberToRegenerate
      );
      
      console.log('📝 Slide description for regeneration:', slideDescription.substring(0, 100) + '...');

      // Генеруємо новий HTML слайд через Gemini 2.5 Flash
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

Новий варіант слайду створено за допомогою ШІ на основі навчальної програми та **замінено** попередній слайд в правій панелі.

📋 **Детальний звіт про зміни:**
${detectedChanges.map((change: string) => `• ${change}`).join('\n')}

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
      console.error('❌ Error regenerating slide with Gemini 2.5 Flash:', error);
      
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
      return {
        success: false,
        message: `❌ **Помилка редагування**

Не знайдено урок для редагування слайдів. 

🔍 **Можливі причини:**
• Урок ще не створений
• Слайди ще не згенеровані
• Контекст розмови втрачено

💡 **Рішення:**
• Спочатку створіть урок: "Створи урок про [тема] для дітей [вік] років"
• Дочекайтеся завершення генерації слайдів
• Потім спробуйте редагувати слайди`,
        conversationHistory,
        error: 'No lesson context for slide editing'
      };
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
      
      // Використовуємо простий підхід - надсилаємо HTML до Gemini 2.5 Flash
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
      const analysisResult = this.simpleEditService.analyzeChanges(
        currentSlide.htmlContent || currentSlide.content,
        finalSlideHTML,
        editInstruction
      );
      const detectedChanges = analysisResult.detectedChanges;

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
      return {
        success: false,
        message: `❌ **Помилка покращення**

Не знайдено урок для покращення слайдів. 

🔍 **Можливі причини:**
• Урок ще не створений
• Слайди ще не згенеровані
• Контекст розмови втрачено

💡 **Рішення:**
• Спочатку створіть урок: "Створи урок про [тема] для дітей [вік] років"
• Дочекайтеся завершення генерації слайдів
• Потім спробуйте покращити слайди`,
        conversationHistory,
        error: 'No lesson context for slide improvement'
      };
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
    
    console.log(`🎨 Improving slide ${slideNumberToImprove} using Gemini 2.5 Flash...`);
    
    try {
      // Отримуємо поточний слайд
      const currentSlide = conversationHistory.currentLesson.slides[slideNumberToImprove - 1];
      const improvementInstruction = intentResult?.parameters?.rawMessage || 'Зробити слайд яскравішим та інтерактивнішим';
      
      // Генеруємо покращений HTML слайд через Gemini 2.5 Flash
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
      console.error('❌ Error improving slide with Gemini 2.5 Flash:', error);
      
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
      return {
        success: false,
        message: `❌ **Помилка редагування**

Не знайдено урок для редагування слайдів. 

🔍 **Можливі причини:**
• Урок ще не створений
• Слайди ще не згенеровані
• Контекст розмови втрачено

💡 **Рішення:**
• Спочатку створіть урок: "Створи урок про [тема] для дітей [вік] років"
• Дочекайтеся завершення генерації слайдів
• Потім спробуйте редагувати слайди`,
        conversationHistory,
        error: 'No lesson context for inline slide editing'
      };
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
      const analysisResult = this.simpleEditService.analyzeChanges(
        currentSlide.htmlContent || currentSlide.content,
        finalSlideHTML,
        finalInstruction
      );
      const detectedChanges = analysisResult.detectedChanges;

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

  // === НОВА ФУНКЦІЯ ДЛЯ МАСОВОЇ ГЕНЕРАЦІЇ СЛАЙДІВ ===
  private extractAllSlideDescriptions(planningResult: string): SlideDescription[] {
    console.log('🔍 Extracting all slide descriptions from lesson plan...');
    
    try {
      const slideDescriptions: SlideDescription[] = [];
      
      // Шукаємо всі слайди в плані одразу
      const slidePatterns = [
        /###\s*Слайд\s+(\d+):\s*([^\n]+)[^#]*?(?=###\s*Слайд\s+|\s*##|\s*$)/gi, // ### Слайд 1: Назва (новий формат)
        /##\s*Слайд\s+(\d+)[^#]*?(?=##\s*Слайд\s+|\s*$)/gi, // ## Слайд 1, ## Слайд 2, тощо
        /\*\*Слайд\s+(\d+)[^*]*?(?=\*\*Слайд\s+|\s*$)/gi, // **Слайд 1**, **Слайд 2**, тощо
        /(\d+)\.\s*[^0-9]*?(?=\d+\.\s*|\s*$)/gi // 1. Текст, 2. Текст, тощо
      ];

      // Пробуємо кожен паттерн
      for (const pattern of slidePatterns) {
        const matches = [...planningResult.matchAll(pattern)];
        
        if (matches.length > 0) {
          console.log(`📄 Found ${matches.length} slides using pattern:`, pattern.source);
          
          for (const match of matches) {
            const slideNumber = parseInt(match[1]);
            if (slideNumber && !slideDescriptions.find(s => s.slideNumber === slideNumber)) {
              let description = match[0].trim();
              let title = `Слайд ${slideNumber}`;
              
              // Перевіряємо чи це новий формат з заголовком після двокрапки
              if (match[2]) {
                // Новий формат: ### Слайд 1: Заголовок
                title = match[2].trim();
                description = description
                  .replace(/^###\s*Слайд\s+\d+:\s*[^\n]+/i, '')
                  .trim();
              } else {
                // Старий формат - очищаємо від заголовків та форматування
                description = description
                  .replace(/^##\s*Слайд\s+\d+[:\s]*/i, '')
                  .replace(/^\*\*Слайд\s+\d+[:\s]*/i, '')
                  .replace(/^\d+\.\s*/, '')
                  .replace(/\*\*$/, '')
                  .trim();

                // Витягуємо заголовок слайду (перший рядок)
                const lines = description.split('\n').filter(line => line.trim());
                title = lines[0]?.replace(/^\*\*/, '').replace(/\*\*$/, '').trim() || `Слайд ${slideNumber}`;
              }
              
              // Визначаємо тип слайду на основі заголовка та контенту
              const type = this.determineSlideType(title, description, slideNumber);
              
              if (description.length > 20) {
                slideDescriptions.push({
                  slideNumber,
                  title,
                  description,
                  type
                });
              }
            }
          }
          
          // Якщо знайшли слайди цим паттерном, не пробуємо інші
          if (slideDescriptions.length > 0) break;
        }
      }

      // Якщо не знайшли структурованих слайдів, створюємо базові на основі плану
      if (slideDescriptions.length === 0) {
        console.log('📄 No structured slides found, creating default structure...');
        
        const defaultSlides = this.createDefaultSlideStructure(planningResult);
        slideDescriptions.push(...defaultSlides);
      }

      // Сортуємо за номером слайду
      slideDescriptions.sort((a, b) => a.slideNumber - b.slideNumber);
      
      console.log(`✅ Extracted ${slideDescriptions.length} slide descriptions:`, 
        slideDescriptions.map(s => `${s.slideNumber}. ${s.title}`));
      
      return slideDescriptions;
      
    } catch (error) {
      console.error('❌ Error extracting all slide descriptions:', error);
      
      // Fallback: створюємо мінімальну структуру
      return this.createDefaultSlideStructure(planningResult);
    }
  }

  // Допоміжна функція для визначення типу слайду
  private determineSlideType(title: string, description: string, slideNumber: number): 'welcome' | 'content' | 'activity' | 'summary' {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Перший слайд зазвичай вітальний
    if (slideNumber === 1 || titleLower.includes('вітання') || titleLower.includes('знайомство') || titleLower.includes('вступ')) {
      return 'welcome';
    }
    
    // Активності
    if (titleLower.includes('завдання') || titleLower.includes('гра') || titleLower.includes('практика') || 
        descLower.includes('активність') || descLower.includes('вправа')) {
      return 'activity';
    }
    
    // Підсумок
    if (titleLower.includes('підсумок') || titleLower.includes('висновок') || titleLower.includes('результат')) {
      return 'summary';
    }
    
    // За замовчуванням - контент
    return 'content';
  }

     // Створення базової структури слайдів
  private createDefaultSlideStructure(planningResult: string): SlideDescription[] {
    const lines = planningResult.split('\n').filter(line => line.trim());
    const firstLines = lines.slice(0, 5).join(' ').substring(0, 300);
    
    return [
      {
        slideNumber: 1,
        title: 'Вітання та знайомство з темою',
        description: `Вступний слайд для знайомства з темою уроку. ${firstLines}`,
        type: 'welcome'
      },
      {
        slideNumber: 2,
        title: 'Основний матеріал',
        description: `Подача основного навчального матеріалу. ${firstLines}`,
        type: 'content'
      },
      {
        slideNumber: 3,
        title: 'Практичне завдання',
        description: `Інтерактивне завдання для закріплення знань. ${firstLines}`,
        type: 'activity'
      },
      {
        slideNumber: 4,
        title: 'Підсумок уроку',
        description: `Узагальнення вивченого матеріалу та висновки. ${firstLines}`,
        type: 'summary'
      }
    ];
  }

  // === ФУНКЦІЯ ДЛЯ МАСОВОЇ ГЕНЕРАЦІЇ ВСІХ СЛАЙДІВ ===
  public async generateAllSlides(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    progressCallback?: (progress: SlideGenerationProgress[]) => void
  ): Promise<BulkSlideGenerationResult> {
    const startTime = Date.now();
    console.log(`🎨 Starting bulk generation of ${slideDescriptions.length} slides...`);
    
    const slides: SimpleSlide[] = [];
    const errors: string[] = [];
    const progressState: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
      slideNumber: desc.slideNumber,
      title: desc.title,
      status: 'pending',
      progress: 0
    }));

    // Викликаємо callback для початкового стану прогресу
    if (progressCallback) {
      progressCallback([...progressState]);
    }

    // Генеруємо слайди послідовно з невеликими затримками для уникнення rate limiting
    for (let i = 0; i < slideDescriptions.length; i++) {
      const slideDesc = slideDescriptions[i];
      
      try {
        console.log(`📄 [${i + 1}/${slideDescriptions.length}] Generating slide: "${slideDesc.title}"`);
        
        // Оновлюємо прогрес - слайд генерується
        progressState[i].status = 'generating';
        progressState[i].progress = 25;
        if (progressCallback) {
          progressCallback([...progressState]);
        }

        // Генеруємо HTML контент слайду
        const slideHTML = await this.contentService.generateSlideContent(
          slideDesc.description,
          lessonTopic,
          lessonAge
        );

        // Оновлюємо прогрес - HTML згенеровано
        progressState[i].progress = 75;
        if (progressCallback) {
          progressCallback([...progressState]);
        }

        // Створюємо об'єкт слайду
        const slide: SimpleSlide = {
          id: `slide_${Date.now()}_${slideDesc.slideNumber}`,
          title: slideDesc.title,
          content: slideDesc.description,
          htmlContent: slideHTML,
          type: this.mapSlideTypeToSimple(slideDesc.type),
          status: 'completed'
        };

        slides.push(slide);

        // Оновлюємо прогрес - слайд завершено
        progressState[i].status = 'completed';
        progressState[i].progress = 100;
        progressState[i].htmlContent = slideHTML;
        if (progressCallback) {
          progressCallback([...progressState]);
        }

        console.log(`✅ [${i + 1}/${slideDescriptions.length}] Slide "${slideDesc.title}" generated successfully`);

        // Затримка між генерацією слайдів (1.5 секунди для уникнення rate limiting)
        if (i < slideDescriptions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (error) {
        console.error(`❌ [${i + 1}/${slideDescriptions.length}] Failed to generate slide "${slideDesc.title}":`, error);
        
        // Оновлюємо прогрес - помилка
        progressState[i].status = 'error';
        progressState[i].error = error instanceof Error ? error.message : 'Unknown error';
        if (progressCallback) {
          progressCallback([...progressState]);
        }

        // Створюємо fallback слайд
        const fallbackSlide: SimpleSlide = {
          id: `slide_${Date.now()}_${slideDesc.slideNumber}_fallback`,
          title: slideDesc.title,
          content: slideDesc.description,
          htmlContent: `<div style="text-align: center; padding: 40px;">
            <h2>${slideDesc.title}</h2>
            <p>Цей слайд буде згенеровано пізніше.</p>
            <p><small>Опис: ${slideDesc.description.substring(0, 100)}...</small></p>
          </div>`,
          type: this.mapSlideTypeToSimple(slideDesc.type),
          status: 'draft'
        };

        slides.push(fallbackSlide);
        errors.push(`Slide ${slideDesc.slideNumber} "${slideDesc.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const generationTime = Date.now() - startTime;
    const completedSlides = slides.filter(s => s.status === 'completed').length;
    const failedSlides = errors.length;

    console.log(`🎉 Bulk slide generation completed in ${generationTime}ms:`);
    console.log(`   ✅ Completed: ${completedSlides}/${slideDescriptions.length}`);
    console.log(`   ❌ Failed: ${failedSlides}/${slideDescriptions.length}`);

    return {
      totalSlides: slideDescriptions.length,
      completedSlides,
      failedSlides,
      slides,
      errors,
      generationTime
    };
  }

  // Допоміжна функція для перетворення типу слайду
  private mapSlideTypeToSimple(type: 'welcome' | 'content' | 'activity' | 'summary'): 'title' | 'content' | 'interactive' | 'summary' {
    switch (type) {
      case 'welcome': return 'title';
      case 'activity': return 'interactive';
      case 'summary': return 'summary';
      default: return 'content';
    }
  }

  // === ПОВНІСТЮ ПАРАЛЕЛЬНА ГЕНЕРАЦІЯ ВСІХ СЛАЙДІВ ===
  private async generateAllSlidesParallel(
    slideDescriptions: SlideDescription[],
    lessonTopic: string,
    lessonAge: string,
    onSlideReady: (slide: SimpleSlide, progressUpdate: SlideGenerationProgress[]) => void
  ): Promise<BulkSlideGenerationResult> {
    console.log(`🚀 Starting PARALLEL generation of ${slideDescriptions.length} slides...`);

    const startTime = Date.now();
    const progressState: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
      slideNumber: desc.slideNumber,
      title: desc.title,
      status: 'pending',
      progress: 0
    }));

    const slides: SimpleSlide[] = [];
    let completedSlides = 0;

    // Створюємо всі промиси відразу (ПАРАЛЕЛЬНО)
    const slidePromises = slideDescriptions.map(async (slideDesc, index) => {
      try {
        console.log(`📄 [PARALLEL] Starting slide: "${slideDesc.title}"`);
        
        // Оновлюємо прогрес - слайд генерується
        progressState[index].status = 'generating';
        progressState[index].progress = 25;

        // Генеруємо HTML контент слайду
        const slideHTML = await this.contentService.generateSlideContent(
          slideDesc.description,
          lessonTopic,
          lessonAge
        );

        // Оновлюємо прогрес - HTML згенеровано
        progressState[index].progress = 75;

        // Створюємо об'єкт слайду
        const slide: SimpleSlide = {
          id: `slide_${Date.now()}_${slideDesc.slideNumber}_${Math.random().toString(36).substr(2, 9)}`,
          title: slideDesc.title,
          content: slideDesc.description,
          htmlContent: slideHTML,
          type: this.mapSlideTypeToSimple(slideDesc.type),
          status: 'completed'
        };

        // Оновлюємо прогрес - слайд завершено
        progressState[index].status = 'completed';
        progressState[index].progress = 100;
        progressState[index].htmlContent = slideHTML;
        
        completedSlides++;
        console.log(`✅ [PARALLEL] Slide "${slideDesc.title}" completed (${completedSlides}/${slideDescriptions.length})`);

        // Викликаємо callback для відображення слайду відразу
        onSlideReady(slide, [...progressState]);

        return slide;

      } catch (error) {
        console.error(`❌ [PARALLEL] Error generating slide "${slideDesc.title}":`, error);
        
        progressState[index].status = 'error';
        progressState[index].progress = 0;
        progressState[index].error = error instanceof Error ? error.message : 'Unknown error';
        
        return null;
      }
    });

    // Чекаємо завершення всіх слайдів
    const results = await Promise.all(slidePromises);
    
    // Фільтруємо успішні слайди
    results.forEach(slide => {
      if (slide) {
        slides.push(slide);
      }
    });

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    console.log(`🎉 PARALLEL generation completed in ${totalTime}s: ${slides.length}/${slideDescriptions.length} slides generated`);

    return {
      slides,
      totalSlides: slideDescriptions.length,
      completedSlides: slides.length,
      failedSlides: slideDescriptions.length - slides.length,
      generationTime: totalTime * 1000, // конвертуємо в мілісекунди
      errors: progressState.filter(p => p.status === 'error').map(p => p.error || 'Unknown error')
    };
  }

  // === СТАРА ПОСЛІДОВНА ГЕНЕРАЦІЯ (DEPRECATED) ===
} 