import { NextRequest, NextResponse } from 'next/server';
import { detectIntentWithAI } from '../../../utils/intentDetection';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    console.log('Received message:', message);
    
    // Використовуємо нейронну мережу для визначення наміру (БЕЗ regex!)
    const intentResult = await detectIntentWithAI(message);
    
    console.log('🎯 Intent detected:', intentResult.intent, 'confidence:', intentResult.confidence);
    
    if (intentResult.intent === 'CREATE_LESSON') {
      // FIXED: Now returns markdown plan instead of HTML slides!
      const topic = intentResult.parameters.topic || 'цікавої теми';
      const age = intentResult.parameters.age || '6 років';
      
      const mockPlanningResponse = `# План уроку про ${topic} для дітей ${age}

**Заголовок уроку:** Подорож до світу "${topic}"
**Вік:** ${age}
**Тривалість:** 25-30 хвилин
**Мета уроку:** Познайомити дітей з основними поняттями теми "${topic}"

## Слайд 1: Вітання
- **Тип:** вступний
- **Зміст:** Знайомство з темою та веселими динозаврами
- **Інтерактив:** Кнопка "Почати подорож"
- **Мета:** Зацікавити дитину темою

## Слайд 2: Базові знання
- **Тип:** навчальний  
- **Зміст:** Основна інформація про ${topic}
- **Інтерактив:** Інтерактивні зображення
- **Мета:** Дати базові знання

## Слайд 3: Поглиблення
- **Тип:** навчальний
- **Зміст:** Детальніша інформація про ${topic}
- **Інтерактив:** Порівняння та приклади
- **Мета:** Показати різноманітність

## Слайд 4: Гра "Практика"
- **Тип:** активність
- **Зміст:** Інтерактивна гра з ${topic}
- **Інтерактив:** Практичні завдання
- **Мета:** Закріпити знання

## Слайд 5: Підсумок
- **Тип:** summary
- **Зміст:** Що ми дізналися  
- **Інтерактив:** Фінальна анімація
- **Мета:** Узагальнити вивчене`;

        return NextResponse.json({
        success: true,
        message: mockPlanningResponse,
                  conversationHistory: {
            step: 'planning',
            planningResult: mockPlanningResponse,
            generationMode: 'global',
            totalSlides: 5,
            intentResult
          },
        actions: [
          {
            action: 'show_plan',
            label: 'План створено ✅',
            description: 'Створено план уроку з 5 слайдів через нейронну мережу'
          }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: `🧠 Розпізнано намір: ${intentResult.intent} з впевненістю ${Math.round(intentResult.confidence * 100)}%. 
      
Спробуйте команди на будь-якій мові:
• "Створи урок про космос для дітей 7 років"
• "Create lesson about animals for 5 year old kids"  
• "Сделай урок о растениях для детей 6 лет"
• "Faire une leçon sur les dinosaures pour enfants de 8 ans"`,
      intentResult
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message with neural network', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
