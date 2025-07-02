import { IIntentDetectionService } from '../intent/IIntentDetectionService';
import { IntentDetectionServiceFactory } from '../intent/IntentDetectionServiceFactory';
import { IIntentHandler, ChatHandlerResult, ConversationHistory } from './handlers/IIntentHandler';
import { CreateLessonHandler } from './handlers/CreateLessonHandler';
import { EditPlanHandler } from './handlers/EditPlanHandler';
import { HelpHandler } from './handlers/HelpHandler';
import { FallbackHandler } from './handlers/FallbackHandler';

// Single Responsibility: Координує роботу чату через dependency injection
export class ChatService {
  private intentDetectionService: IIntentDetectionService;
  private handlers: IIntentHandler[];

  constructor() {
    // Dependency Inversion: залежимо від абстракцій, не від конкретних класів
    this.intentDetectionService = IntentDetectionServiceFactory.createService();
    
    // Open/Closed: легко додавати нові обробники без зміни існуючого коду
    this.handlers = [
      new CreateLessonHandler(),
      new EditPlanHandler(),
      new HelpHandler(),
      new FallbackHandler() // Завжди останній
    ];
  }

  async processMessage(
    message: string, 
    conversationHistory?: ConversationHistory,
    action?: string
  ): Promise<ChatHandlerResult> {
    try {
      // Спочатку визначаємо намір користувача
      const intentResult = await this.intentDetectionService.detectIntent(message);
      
      console.log(`🎯 [INTENT DETECTED] ${intentResult.intent} (confidence: ${intentResult.confidence})`);
      console.log(`📝 [PARAMETERS]`, intentResult.parameters);
      
      // Обробляємо спеціальні дії (approve_plan, edit_plan тощо)
      if (action) {
        return await this.handleAction(action, conversationHistory, intentResult);
      }
      
      // Знаходимо відповідний обробник
      const handler = this.findHandler(intentResult, conversationHistory);
      
      if (!handler) {
        throw new Error(`No handler found for intent: ${intentResult.intent}`);
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
    return this.handlers.find(handler => 
      handler.canHandle(intentResult, conversationHistory)
    );
  }

  private async handleAction(
    action: string, 
    conversationHistory?: ConversationHistory,
    intentResult?: any
  ): Promise<ChatHandlerResult> {
    switch (action) {
      case 'approve_plan':
        return await this.handleApprovePlan(conversationHistory);
      
      case 'edit_plan':
        return await this.handleEditPlanAction(conversationHistory);
        
      case 'help':
        const helpHandler = new HelpHandler();
        return await helpHandler.handle(intentResult || { intent: 'help', language: 'uk' });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async handleApprovePlan(conversationHistory?: ConversationHistory): Promise<ChatHandlerResult> {
    if (!conversationHistory?.planningResult) {
      throw new Error('No plan to approve');
    }

    console.log('🎨 Generating first slide HTML...');
    console.log('⚙️  Processing animations and styling...');
    
    // Simulate slide generation time
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockSlideHTML = this.generateMockSlide();

    const newConversationHistory: ConversationHistory = {
      ...conversationHistory,
      step: 'slide_generation',
      currentSlideIndex: 1,
      generatedSlides: [{ id: 1, html: mockSlideHTML }]
    };

    return {
      success: true,
      message: `✅ **Перший слайд готовий!** (1/${conversationHistory.totalSlides})

Слайд згенеровано та доданий до правої панелі. 

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
      ]
    };
  }

  private async handleEditPlanAction(conversationHistory?: ConversationHistory): Promise<ChatHandlerResult> {
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

  private generateMockSlide(): string {
    return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Слайд 1 - Вітання</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', cursive;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }
        .slide-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            animation: slideIn 1s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        .start-button {
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.2em;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .start-button:hover {
            transform: scale(1.1);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="slide-container">
        <h1>🎉 Вітаємо в світі навчання! 🎉</h1>
        <p style="font-size: 1.3em; color: #34495e;">Готові почати захоплюючу подорож?</p>
        <!-- generate image: Happy cartoon children with books and educational symbols [400:300] -->
        <button class="start-button" onclick="startJourney()">
            🚀 Почати подорож!
        </button>
    </div>
    
    <script>
        function startJourney() {
            alert('Подорож почалася! 🎊');
        }
    </script>
</body>
</html>`;
  }
} 