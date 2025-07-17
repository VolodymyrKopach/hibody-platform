import { ParallelSlideGenerationService, ParallelGenerationCallbacks } from './ParallelSlideGenerationService';
import { SlideDescription, SimpleLesson, SlideGenerationProgress, SimpleSlide } from '@/types/chat';
import { ConversationHistory, ChatResponse } from './types';
import { GeminiContentService } from '@/services/content/GeminiContentService';

export class ChatServiceParallelAdapter {
  private parallelService: ParallelSlideGenerationService;
  private contentService: GeminiContentService;

  constructor() {
    this.parallelService = new ParallelSlideGenerationService();
    this.contentService = new GeminiContentService();
  }

  /**
   * Схвалення плану з ПАРАЛЕЛЬНОЮ генерацією слайдів
   */
  async handleApprovePlanParallel(
    conversationHistory: ConversationHistory,
    callbacks?: ParallelGenerationCallbacks
  ): Promise<ChatResponse> {
    if (!conversationHistory?.planningResult) {
      throw new Error('No plan to approve');
    }

    console.log('🎨 Starting PARALLEL slide generation...');
    
    try {
      // === КРОК 1: Витягуємо всі описи слайдів з плану ===
      const slideDescriptions = this.extractAllSlideDescriptions(conversationHistory.planningResult);
      console.log(`📄 Extracted ${slideDescriptions.length} slide descriptions from plan`);

      // === КРОК 2: Ініціалізуємо урок ===
      const lesson: SimpleLesson = {
        id: `lesson_${Date.now()}`,
        title: conversationHistory.lessonTopic || 'Новий урок',
        description: `Урок про ${conversationHistory.lessonTopic} для дітей ${conversationHistory.lessonAge}`,
        subject: 'Загальне навчання',
        ageGroup: conversationHistory.lessonAge || '8-9 років',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'ai-chat',
        slides: []
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

      // === КРОК 4: Запускаємо ПАРАЛЕЛЬНУ генерацію ===
      if (callbacks) {
        // Фонова генерація з callbacks
        this.parallelService.generateAllSlidesParallel(
          slideDescriptions,
          conversationHistory.lessonTopic || 'урок',
          conversationHistory.lessonAge || '6-8 років',
          lesson,
          callbacks
        ).catch(error => {
          console.error('❌ Parallel generation error:', error);
          callbacks.onError('Generation failed', 0);
        });
      }

      // === КРОК 5: Повертаємо початкове повідомлення ===
      const initialMessage = `🎨 **Розпочинаємо ПАРАЛЕЛЬНУ генерацію всіх слайдів!**

📊 **План генерації:**
${slideDescriptions.map(desc => `${desc.slideNumber}. ${desc.title} (${desc.type})`).join('\n')}

⚡ **Переваги паралельної генерації:**
• Всі ${slideDescriptions.length} слайди генеруються одночасно
• Слайди з'являтимуться в правій панелі по мірі готовності
• Значно швидше ніж послідовна генерація

🎯 **Очікуваний час:** ${Math.ceil(slideDescriptions.length * 15 / 4)} секунд (замість ${slideDescriptions.length * 30})`;

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
      console.error('❌ Error in parallel approval:', error);
      
      return {
        success: false,
        message: `😔 Виникла помилка при започаткуванні паралельної генерації.

**Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Витягує всі описи слайдів з плану (спрощена версія)
   */
  private extractAllSlideDescriptions(planningResult: string): SlideDescription[] {
    console.log('📄 Extracting all slide descriptions from plan...');
    
    const slides: SlideDescription[] = [];
    
    // Паттерни для розпізнавання слайдів
    const patterns = [
      /###\s*Слайд\s+(\d+):\s*([^\n]+)/gi,
      /Слайд\s*(\d+)[\.:]?\s*([^\n]+)/gi,
      /(\d+)\.\s*([^\n]+)/gi
    ];

    let found = false;
    
    for (const pattern of patterns) {
      const matches = Array.from(planningResult.matchAll(pattern));
      
      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} slides using pattern: ${pattern.source}`);
        
        matches.forEach(match => {
          const slideNumber = parseInt(match[1]);
          const title = match[2].trim();
          
          if (slideNumber && title && slideNumber <= 10) {
            slides.push({
              slideNumber,
              title,
              description: `Створіть слайд "${title}" для уроку`,
              type: slideNumber === 1 ? 'welcome' : 
                    slideNumber === matches.length ? 'summary' : 'content'
            });
          }
        });
        
        found = true;
        break;
      }
    }

    // Fallback до стандартної структури
    if (!found || slides.length === 0) {
      console.log('🔄 Using fallback slide structure');
      
      const defaultSlides = [
        { title: 'Вступ', type: 'welcome' as const },
        { title: 'Основна частина', type: 'content' as const },
        { title: 'Практичне завдання', type: 'content' as const },
        { title: 'Підсумки', type: 'summary' as const }
      ];

      defaultSlides.forEach((slide, index) => {
        slides.push({
          slideNumber: index + 1,
          title: slide.title,
          description: `Створіть слайд "${slide.title}" для уроку`,
          type: slide.type
        });
      });
    }

    // Сортуємо за номером слайду
    slides.sort((a, b) => a.slideNumber - b.slideNumber);
    
    console.log('📋 Extracted slides:', slides.map(s => `${s.slideNumber}. ${s.title}`));
    
    return slides;
  }
} 