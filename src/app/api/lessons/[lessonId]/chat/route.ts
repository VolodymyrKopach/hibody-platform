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

// System prompt for slide-oriented AI
const SLIDE_SYSTEM_PROMPT = `You are a teacher's assistant who works with lesson slides in PowerPoint style.

YOUR JOB:
1. Understand natural commands about slides ("improve slide 2", "make the elephant bigger")
2. Generate changes for specific slides
3. Create new slides on request
4. Maintain integrity of the entire lesson

RESPONSE FORMAT:
{
  "message": "Friendly explanation of what you did",
  "actions": [
    {
      "type": "update_slide",
      "slideId": "slide_2",
      "changes": {
        "title": "New title",
        "description": "New description",
        "content": "Updated HTML content"
      },
      "reason": "Explanation why this change is needed"
    }
  ],
  "updatedSlides": [/* array of updated slides */],
  "suggestions": ["Additional improvement ideas"]
}

PRINCIPLES:
- Preserve lesson style and theme
- Make changes exactly as instructed
- Suggest improvements but don't impose
- Think about children and their perception`;

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
CURRENT LESSON: "${currentLesson.title}"
Target audience: ${currentLesson.targetAge}
Subject: ${currentLesson.subject}
Duration: ${currentLesson.duration} mins

SLIDES IN THE LESSON:
${currentLesson.slides.map((s: LessonSlide, i: number) => 
  `${i + 1}. ${s.title} (${s.type}) - ${s.status}`
).join('\n')}

SELECTED SLIDE: ${currentSlide ? `${currentSlide.title} (ID: ${currentSlide.id})` : 'Not selected'}
` : 'Lesson not created yet';

    const userPrompt = `
USER COMMAND: "${message}"

RECOGNIZED COMMAND:
- Type: ${command.type}
- Slide: ${command.slideNumber || 'not specified'}
- Instruction: ${command.instruction}

LESSON CONTEXT:
${lessonContext}

Process the command and provide a response in JSON format.`;

    // Викликаємо Gemini API
    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
        message: 'Could not find slide to edit',
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
      message: `Slide ${targetSlide.number} "${targetSlide.title}" updated`,
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
    console.error('Error editing slide:', error);
    return {
      message: 'Error editing slide',
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
      message: `Created new slide ${newSlide.number} "${newSlide.title}"`,
      command,
      actions: [action],
      updatedSlides: [newSlide],
      preview: [{
        slideId: newSlide.id,
        preview: newSlide.preview,
        changes: 'New slide created'
      }],
      suggestions: [
        'Improve slide',
        'Add animation',
        'Create next slide'
      ],
      chatMessage: {} as any,
      success: true
    };

  } catch (error) {
    console.error('Error creating slide:', error);
    return {
      message: 'Error creating slide',
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
    instruction: `Automatically improve slide: ${command.instruction}`
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
        message: 'Slide to delete not found',
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
      message: `Slide ${targetSlide.number} "${targetSlide.title}" deleted`,
      command,
      actions: [action],
      updatedSlides: lesson.slides,
      chatMessage: {} as any,
      success: true
    };

  } catch (error) {
    console.error('Error deleting slide:', error);
    return {
      message: 'Error deleting slide',
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
    message: `Received command: "${command.instruction}". For better processing, please specify a specific slide.`,
    command,
    actions: [],
    updatedSlides: [],
    suggestions: [
      'Make slide 1 bigger',
      'Create new slide',
      'Improve entire lesson'
    ],
    chatMessage: {} as any,
    success: true
  };
}

// Генерація AI промптів
function generateEditSlidePrompt(slide: LessonSlide, command: any, lesson: any): string {
      const context = `Slide context: ${slide.title} in lesson "${lesson.title}"`;
  
  return `You are an AI assistant for creating educational materials. 

${context}

TASK: ${command.instruction}

Current HTML slide:
${slide._internal?.htmlContent || 'HTML not created yet'}

Make changes according to the task, preserving quality and functionality of the slide.

REQUIREMENTS FOR THE UPDATED SLIDE:
- Responsive design
- Interactive elements easy to use
- Content placed optimally for reading

RESPONSE FORMAT:
{
  "html": "full HTML code of the slide",
  "title": "updated slide title",
  "description": "updated description",
  "changes": "description of changes made",
  "preview": "short text preview"
}`;
}

function generateCreateSlidePrompt(command: any, lesson: any): string {
  return `You are an AI assistant for creating educational materials.

LESSON: "${lesson.title}"
TARGET AUDIENCE: ${lesson.targetAge}
SUBJECT: ${lesson.subject}

TASK: ${command.instruction}

Create a new slide for this lesson considering the needs of children.

REQUIREMENTS FOR THE SLIDE:
- Responsive design
- Interactive elements easy to use
- Content placed optimally for reading

RESPONSE FORMAT:
{
  "html": "full HTML code of the slide",
  "title": "slide title",
  "description": "slide description", 
  "type": "welcome|content|activity|game|summary",
  "icon": "emoji",
  "preview": "short text preview"
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
      return { success: false, error: 'Gemini API key not configured' };
    }

    // Pass the API key explicitly to the Google GenAI client
    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
    return { success: false, error: 'Error calling Gemini API' };
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
    console.error('Error parsing AI response:', error);
  }

  // Fallback: просте оновлення на основі команди
  return {
    ...slide,
    description: `${slide.description} (updated: ${command.instruction})`,
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
        title: parsed.title || 'New slide',
        description: parsed.description || 'Slide description',
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
    console.error('Error creating slide from AI:', error);
  }

  // Fallback: базовий слайд
  return {
    id: slideId,
    number: slideNumber,
    title: 'New slide',
    description: command.instruction || 'New slide created',
    type: 'content',
    icon: '📄',
    status: 'draft',
    preview: command.instruction || 'New slide',
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
