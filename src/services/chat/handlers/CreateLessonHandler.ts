import { IIntentHandler, ChatHandlerResult, ConversationHistory } from './IIntentHandler';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';

// Single Responsibility: Обробка створення уроків
export class CreateLessonHandler implements IIntentHandler {
  
  canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
    return intent.intent === UserIntent.CREATE_LESSON && !conversationHistory;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatHandlerResult> {
    console.log('📝 Generating lesson plan...');
    
    // Simulate processing time for plan generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { topic, age } = intent.parameters;
    const planningResponse = this.generateLessonPlan(topic, age);

    const newConversationHistory: ConversationHistory = {
      step: 'planning',
      planningResult: planningResponse,
      generationMode: 'individual',
      totalSlides: 6,
      originalMessage: intent.parameters.rawMessage
    };

    return {
      success: true,
      message: planningResponse,
      conversationHistory: newConversationHistory,
      actions: [
        {
          action: 'approve_plan',
          label: '✅ Генерувати перший слайд',
          description: 'Схвалити план і почати генерацію слайдів'
        },
        {
          action: 'edit_plan',
          label: '✏️ Редагувати план',
          description: 'Внести зміни до плану уроку'
        }
      ]
    };
  }

  private generateLessonPlan(topic?: string, age?: string): string {
    const lessonTopic = topic || 'загальну тему';
    const targetAge = age || '6 років';
    
    return `# План уроку про ${lessonTopic} для дітей ${targetAge}

**Заголовок уроку:** Подорож до світу ${lessonTopic}
**Вік:** ${targetAge}  
**Тривалість:** 25-30 хвилин
**Мета уроку:** Познайомити дітей з ${lessonTopic}

## Слайд 1: Вітання та знайомство
- **Тип:** вступний
- **Зміст:** Привітання, знайомство з темою ${lessonTopic}
- **Інтерактив:** Кнопка "Почати подорож!"
- **Мета:** Зацікавити дитину темою

## Слайд 2: Основні поняття
- **Тип:** навчальний  
- **Зміст:** Базова інформація про ${lessonTopic}
- **Інтерактив:** Інтерактивні зображення
- **Мета:** Дати базові знання

## Слайд 3: Детальніше вивчаємо
- **Тип:** навчальний
- **Зміст:** Поглиблена інформація про ${lessonTopic}
- **Інтерактив:** Порівняння та взаємодія
- **Мета:** Розширити знання

## Слайд 4: Практичне застосування
- **Тип:** навчальний
- **Зміст:** Як ${lessonTopic} використовується в житті
- **Інтерактив:** Практичні завдання
- **Мета:** Показати практичне значення

## Слайд 5: Інтерактивна гра
- **Тип:** активність
- **Зміст:** Гра на закріплення знань про ${lessonTopic}
- **Інтерактив:** Інтерактивна гра з балами
- **Мета:** Закріпити знання через гру

## Слайд 6: Підсумок та нагорода
- **Тип:** заключний
- **Зміст:** Що ми дізналися про ${lessonTopic}, сертифікат
- **Інтерактив:** Фінальна анімація, сертифікат
- **Мета:** Узагальнити вивчене та винагородити дитину`;
  }
} 