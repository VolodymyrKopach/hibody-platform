import { NextRequest, NextResponse } from 'next/server';
import { slideUtils } from '../../../../../utils/slideUtils';
import { 
  ProcessSlideCommandRequest,
  ProcessSlideCommandResponse
} from '../../../../../types/api';
import { LessonSlide, SlideAction, LessonChatMessage, SlideCommand, SlideResponse } from '../../../../../types/lesson';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Тимчасове сховище (в продакшні буде база даних)
let lessons: Map<string, any> = new Map();
let chatSessions: Map<string, any> = new Map();

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Парсинг природних команд для слайдів ЧЕРЕЗ НЕЙРОННУ МЕРЕЖУ
async function parseSlideCommand(message: string, currentSlide?: LessonSlide): Promise<SlideCommand> {
  // ВСЕ через нейронну мережу - НІЯКИХ regex patterns!
  return await slideUtils.parseCommand(message, currentSlide);
}

// Системний промпт для slide-oriented AI
const SLIDE_SYSTEM_PROMPT = `Ти - помічник вчителя, який працює з слайдами уроку в стилі PowerPoint.

ТВОЯ РОБОТА:
1. Розуміти природні команди про слайди ("покращ слайд 2", "зроби слона більшим")
2. Генерувати зміни для конкретних слайдів
3. Створювати нові слайди за запитом
4. Підтримувати цілісність всього уроку

ФОРМАТ ВІДПОВІДІ:
{
  "message": "Дружнє пояснення що ти зробив",
  "actions": [
    {
      "type": "update_slide",
      "slideId": "slide_2",
      "changes": {
        "title": "Нова назва",
        "description": "Новий опис",
        "content": "Оновлений HTML контент"
      },
      "reason": "Пояснення чому ця зміна потрібна"
    }
  ],
  "updatedSlides": [/* масив оновлених слайдів */],
  "suggestions": ["Додаткові ідеї для покращення"]
}

ПРИНЦИПИ:
- Зберігай стиль і тему уроку
- Роби зміни точно за інструкцією
- Пропонуй покращення, але не нав'язуй
- Думай про дітей та їх сприйняття`;

// POST /api/lessons/[lessonId]/chat - обробити команду
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { message, currentLesson, selectedSlideId } = await request.json();
    const lessonId = params.lessonId;

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Парсимо команду
    const currentSlide = currentLesson?.slides.find((s: LessonSlide) => s.id === selectedSlideId);
    const command = await parseSlideCommand(message, currentSlide);

    // Формуємо контекст для AI
    const lessonContext = currentLesson ? `
ПОТОЧНИЙ УРОК: "${currentLesson.title}"
Цільова аудиторія: ${currentLesson.targetAge}
Предмет: ${currentLesson.subject}
Тривалість: ${currentLesson.duration} хв

СЛАЙДИ В УРОЦІ:
${currentLesson.slides.map((s: LessonSlide, i: number) => 
  `${i + 1}. ${s.title} (${s.type}) - ${s.status}`
).join('\n')}

ОБРАНИЙ СЛАЙД: ${currentSlide ? `${currentSlide.title} (ID: ${currentSlide.id})` : 'Не обрано'}
` : 'Урок ще не створено';

    const userPrompt = `
КОМАНДА КОРИСТУВАЧА: "${message}"

РОЗПІЗНАНА КОМАНДА:
- Тип: ${command.type}
- Слайд: ${command.slideNumber || 'не вказано'}
- Інструкція: ${command.instruction}

КОНТЕКСТ УРОКУ:
${lessonContext}

Обробити команду та дати відповідь у форматі JSON.`;

    // Викликаємо Gemini API
    const client = new GoogleGenAI({});
    const fullPrompt = `${SLIDE_SYSTEM_PROMPT}\n\n${userPrompt}`;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster generation
        },
        temperature: 0.7
      }
    });

    const aiResponse = response.text;
    if (!aiResponse) {
      throw new Error('No content in Gemini response');
    }

    // Спробуємо парсити JSON відповідь
    let slideResponse: SlideResponse;
    try {
      slideResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // Якщо не JSON, створюємо базову відповідь
      slideResponse = {
        message: aiResponse,
        actions: [],
        updatedSlides: [],
        suggestions: [],
      };
    }

    return NextResponse.json({
      success: true,
      command,
      response: slideResponse,
      lessonId,
    });

  } catch (error) {
    console.error('Slide chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process slide command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Обробка команди редагування слайду
async function processEditSlideCommand(
  lesson: any, 
  command: any, 
  request: ProcessSlideCommandRequest
): Promise<ProcessSlideCommandResponse> {
  try {
    // Знаходимо цільовий слайд
    let targetSlide: LessonSlide | undefined;
    
    if (command.slideNumber) {
      targetSlide = lesson.slides?.find((s: LessonSlide) => s.number === command.slideNumber);
    } else if (command.slideId) {
      targetSlide = lesson.slides?.find((s: LessonSlide) => s.id === command.slideId);
    } else if (request.currentSlideId) {
      targetSlide = lesson.slides?.find((s: LessonSlide) => s.id === request.currentSlideId);
    }

    if (!targetSlide) {
      return {
        message: 'Не вдалося знайти слайд для редагування',
        command,
        actions: [],
        updatedSlides: [],
        chatMessage: {} as any,
        success: false
      };
    }

    // Генеруємо AI промпт для редагування
    const aiPrompt = generateEditSlidePrompt(targetSlide, command, lesson);
    const aiResponse = await callGeminiAPI(aiPrompt, request.model, request.temperature);
    
    if (!aiResponse.success) {
      throw new Error(aiResponse.error);
    }

    // Парсимо відповідь AI та оновлюємо слайд
    const updatedSlide = await parseAIResponseAndUpdateSlide(
      targetSlide, 
      aiResponse.content || '', 
      command
    );

    // Оновлюємо урок
    const slideIndex = lesson.slides.findIndex((s: LessonSlide) => s.id === targetSlide.id);
    lesson.slides[slideIndex] = updatedSlide;
    lesson.updatedAt = new Date();
    lessons.set(lesson.id, lesson);

    const action: SlideAction = {
      type: 'update_slide',
      slideId: targetSlide.id,
      changes: { /* зміни */ },
      reason: command.instruction
    };

    return {
      message: `Слайд ${targetSlide.number} "${targetSlide.title}" оновлено`,
      command,
      actions: [action],
      updatedSlides: [updatedSlide],
      preview: [{
        slideId: updatedSlide.id,
        preview: updatedSlide.preview,
        changes: command.instruction
      }],
              suggestions: [],
      chatMessage: {} as any,
      success: true
    };

  } catch (error) {
    console.error('Помилка при редагуванні слайду:', error);
    return {
      message: 'Помилка при редагуванні слайду',
      command,
      actions: [],
      updatedSlides: [],
      chatMessage: {} as any,
      success: false
    };
  }
}

// Обробка команди створення слайду
async function processCreateSlideCommand(
  lesson: any, 
  command: any, 
  request: ProcessSlideCommandRequest
): Promise<ProcessSlideCommandResponse> {
  try {
    const slideNumber = lesson.slides?.length + 1 || 1;
    const slideId = generateId();
    const now = new Date();

    // Генеруємо AI промпт для створення слайду
    const aiPrompt = generateCreateSlidePrompt(command, lesson);
    const aiResponse = await callGeminiAPI(aiPrompt, request.model, request.temperature);
    
    if (!aiResponse.success) {
      throw new Error(aiResponse.error);
    }

    // Створюємо новий слайд на основі AI відповіді
    const newSlide = await parseAIResponseAndCreateSlide(
      slideId,
      slideNumber,
      aiResponse.content || '',
      command
    );

    // Додаємо до уроку
    if (!lesson.slides) lesson.slides = [];
    lesson.slides.push(newSlide);
    lesson.updatedAt = now;
    lessons.set(lesson.id, lesson);

    const action: SlideAction = {
      type: 'create_slide',
      slideId: newSlide.id,
      changes: newSlide,
      reason: command.instruction
    };

    return {
      message: `Створено новий слайд ${newSlide.number} "${newSlide.title}"`,
      command,
      actions: [action],
      updatedSlides: [newSlide],
      preview: [{
        slideId: newSlide.id,
        preview: newSlide.preview,
        changes: 'Новий слайд створено'
      }],
      suggestions: [
        'Покращити слайд',
        'Додати анімацію',
        'Створити наступний слайд'
      ],
      chatMessage: {} as any,
      success: true
    };

  } catch (error) {
    console.error('Помилка при створенні слайду:', error);
    return {
      message: 'Помилка при створенні слайду',
      command,
      actions: [],
      updatedSlides: [],
      chatMessage: {} as any,
      success: false
    };
  }
}

// Обробка команди покращення слайду
async function processImproveSlideCommand(
  lesson: any, 
  command: any, 
  request: ProcessSlideCommandRequest
): Promise<ProcessSlideCommandResponse> {
  // Аналогічно до edit, але з фокусом на автоматичне покращення
  return processEditSlideCommand(lesson, {
    ...command,
    instruction: `Автоматично покращ слайд: ${command.instruction}`
  }, request);
}

// Обробка команди видалення слайду
async function processDeleteSlideCommand(
  lesson: any, 
  command: any, 
  request: ProcessSlideCommandRequest
): Promise<ProcessSlideCommandResponse> {
  try {
    const targetSlide = lesson.slides?.find((s: LessonSlide) => 
      s.number === command.slideNumber || s.id === command.slideId
    );

    if (!targetSlide) {
      return {
        message: 'Слайд для видалення не знайдено',
        command,
        actions: [],
        updatedSlides: [],
        chatMessage: {} as any,
        success: false
      };
    }

    // Видаляємо слайд
    lesson.slides = lesson.slides.filter((s: LessonSlide) => s.id !== targetSlide.id);
    
    // Оновлюємо номери
    lesson.slides.forEach((slide: LessonSlide, index: number) => {
      slide.number = index + 1;
    });

    lesson.updatedAt = new Date();
    lessons.set(lesson.id, lesson);

    const action: SlideAction = {
      type: 'delete_slide',
      slideId: targetSlide.id,
      changes: null,
      reason: command.instruction
    };

    return {
      message: `Слайд ${targetSlide.number} "${targetSlide.title}" видалено`,
      command,
      actions: [action],
      updatedSlides: lesson.slides,
      chatMessage: {} as any,
      success: true
    };

  } catch (error) {
    console.error('Помилка при видаленні слайду:', error);
    return {
      message: 'Помилка при видаленні слайду',
      command,
      actions: [],
      updatedSlides: [],
      chatMessage: {} as any,
      success: false
    };
  }
}

// Обробка загальних команд
async function processGeneralCommand(
  lesson: any, 
  command: any, 
  request: ProcessSlideCommandRequest
): Promise<ProcessSlideCommandResponse> {
  return {
    message: `Отримано команду: "${command.instruction}". Для кращої обробки вкажіть конкретний слайд.`,
    command,
    actions: [],
    updatedSlides: [],
    suggestions: [
      'Зроби слайд 1 більшим',
      'Створи новий слайд',
      'Покращ весь урок'
    ],
    chatMessage: {} as any,
    success: true
  };
}

// Генерація AI промптів
function generateEditSlidePrompt(slide: LessonSlide, command: any, lesson: any): string {
      const context = `Slide context: ${slide.title} in lesson "${lesson.title}"`;
  
  return `Ти - AI асистент для створення навчальних матеріалів. 

${context}

ЗАВДАННЯ: ${command.instruction}

Поточний HTML слайду:
${slide._internal?.htmlContent || 'HTML ще не створено'}

Внеси зміни згідно з завданням, зберігаючи якість та функціональність слайду.

ВИМОГИ ДО ОНОВЛЕНОГО СЛАЙДУ:
- Responsive дизайн
- Інтерактивні елементи зручні для використання
- Контент розміщений оптимально для читання

ФОРМАТ ВІДПОВІДІ:
{
  "html": "повний HTML код слайду",
  "title": "оновлена назва слайду",
  "description": "оновлений опис",
  "changes": "опис внесених змін",
  "preview": "короткий текстовий превью"
}`;
}

function generateCreateSlidePrompt(command: any, lesson: any): string {
  return `Ти - AI асистент для створення навчальних матеріалів.

УРОК: "${lesson.title}"
ЦІЛЬОВА АУДИТОРІЯ: ${lesson.targetAge}
ПРЕДМЕТ: ${lesson.subject}

ЗАВДАННЯ: ${command.instruction}

Створи новий слайд для цього уроку з урахуванням потреб дітей.

ВИМОГИ ДО СЛАЙДУ:
- Responsive дизайн
- Інтерактивні елементи зручні для використання
- Контент розміщений оптимально для читання

ФОРМАТ ВІДПОВІДІ:
{
  "html": "повний HTML код слайду",
  "title": "назва слайду",
  "description": "опис слайду", 
  "type": "welcome|content|activity|game|summary",
  "icon": "емодзі",
  "preview": "короткий текстовий превью"
}`;
}

// Виклик Gemini API
async function callGeminiAPI(
  prompt: string, 
  model: string = 'gemini-2.5-flash',
  temperature: number = 0.7
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    if (!GEMINI_API_KEY) {
      return { success: false, error: 'Gemini API key не налаштований' };
    }

    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = new GoogleGenAI({});

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster generation
        },
        temperature
      }
    });

    const content = response.text;
    if (!content) {
      return { success: false, error: 'No content in Gemini response' };
    }

    return { success: true, content };

  } catch (error) {
    console.error('Gemini API error:', error);
    return { success: false, error: 'Помилка виклику Gemini API' };
  }
}

// Парсинг AI відповіді та оновлення слайду
async function parseAIResponseAndUpdateSlide(
  slide: LessonSlide, 
  aiContent: string, 
  command: any
): Promise<LessonSlide> {
  try {
    // Пробуємо спарсити JSON відповідь
    const match = aiContent.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      
      return {
        ...slide,
        title: parsed.title || slide.title,
        description: parsed.description || slide.description,
        preview: parsed.preview || parsed.description || slide.preview,
        _internal: {
          ...slide._internal,
          htmlContent: parsed.html || slide._internal?.htmlContent || '',
          lastModified: new Date(),
          version: (slide._internal?.version || 0) + 1
        },
        updatedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Помилка парсингу AI відповіді:', error);
  }

  // Fallback: просте оновлення на основі команди
  return {
    ...slide,
    description: `${slide.description} (оновлено: ${command.instruction})`,
    updatedAt: new Date(),
    _internal: {
      ...slide._internal,
      lastModified: new Date(),
      version: (slide._internal?.version || 0) + 1
    }
  };
}

// Створення нового слайду з AI відповіді
async function parseAIResponseAndCreateSlide(
  slideId: string,
  slideNumber: number,
  aiContent: string,
  command: any
): Promise<LessonSlide> {
  const now = new Date();
  
  try {
    // Пробуємо спарсити JSON відповідь
    const match = aiContent.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      
      return {
        id: slideId,
        number: slideNumber,
        title: parsed.title || 'Новий слайд',
        description: parsed.description || 'Опис слайду',
        type: parsed.type || 'content',
        icon: parsed.icon || '📄',
        status: 'ready',
        preview: parsed.preview || parsed.description,
        _internal: {
          filename: `slide_${slideNumber}_${(parsed.title || 'slide').toLowerCase().replace(/\s+/g, '_')}.html`,
          htmlContent: parsed.html || '',
          dependencies: [],
          lastModified: now,
          version: 1
        },
        createdAt: now,
        updatedAt: now
      };
    }
  } catch (error) {
    console.error('Помилка створення слайду з AI:', error);
  }

  // Fallback: базовий слайд
  return {
    id: slideId,
    number: slideNumber,
    title: 'Новий слайд',
    description: command.instruction || 'Створено новий слайд',
    type: 'content',
    icon: '📄',
    status: 'draft',
    preview: command.instruction || 'Новий слайд',
    _internal: {
      filename: `slide_${slideNumber}_new_slide.html`,
      htmlContent: '',
      dependencies: [],
      lastModified: now,
      version: 1
    },
    createdAt: now,
    updatedAt: now
  };
}
