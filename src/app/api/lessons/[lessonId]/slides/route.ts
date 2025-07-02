import { NextRequest, NextResponse } from 'next/server';
import { LessonSlide } from '../../../../../types/lesson';
import { 
  CreateSlideRequest, 
  CreateSlideResponse,
  UpdateSlideRequest,
  UpdateSlideResponse,
  DeleteSlideRequest,
  DeleteSlideResponse
} from '../../../../../types/api';

// Імпортуємо уроки з основного API (в продакшні це буде база даних)
// Тимчасово дублюємо сховище
let lessons: Map<string, any> = new Map();

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// GET /api/lessons/[lessonId]/slides - отримати слайди уроку
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = await params;
    
    const lesson = lessons.get(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      slides: lesson.slides || [],
      total: lesson.slides?.length || 0,
      lessonTitle: lesson.title,
      success: true,
      message: 'Слайди завантажено'
    });

  } catch (error) {
    console.error('Помилка при отриманні слайдів:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Внутрішня помилка сервера',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/lessons/[lessonId]/slides - створити новий слайд
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = await params;
    const body: CreateSlideRequest = await request.json();
    
    const lesson = lessons.get(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Валідація
    if (!body.slide.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Назва слайду обов\'язкова',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    const slideId = generateId();
    const now = new Date();
    
    // Визначаємо позицію нового слайду
    const currentSlides = lesson.slides || [];
    const slideNumber = body.position !== undefined 
      ? body.position 
      : currentSlides.length + 1;

    // Оновлюємо номери існуючих слайдів якщо потрібно
    if (body.position !== undefined && body.position <= currentSlides.length) {
      currentSlides.forEach(slide => {
        if (slide.number >= body.position) {
          slide.number += 1;
        }
      });
    }

    const newSlide: LessonSlide = {
      id: slideId,
      number: slideNumber,
      title: body.slide.title.trim(),
      description: body.slide.description?.trim() || '',
      type: body.slide.type || 'content',
      icon: body.slide.icon || '📄',
      status: 'draft',
      preview: body.slide.description?.trim() || 'Попередній перегляд недоступний',
      _internal: {
        filename: `slide_${slideNumber}_${body.slide.title.toLowerCase().replace(/\s+/g, '_')}.html`,
        htmlContent: body.generateContent ? generateBasicHTML(body.slide) : '',
        dependencies: [],
        lastModified: now,
        version: 1
      },
      createdAt: now,
      updatedAt: now
    };

    // Додаємо новий слайд до уроку
    const updatedSlides = [...currentSlides, newSlide].sort((a, b) => a.number - b.number);
    lesson.slides = updatedSlides;
    lesson.updatedAt = now;
    
    lessons.set(lessonId, lesson);

    const response: CreateSlideResponse = {
      slide: newSlide,
      htmlFile: newSlide._internal.filename,
      preview: newSlide.preview,
      success: true,
      message: 'Слайд створено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при створенні слайду:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при створенні слайду',
        code: 'CREATE_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/lessons/[lessonId]/slides - оновити слайд
export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = await params;
    const body: UpdateSlideRequest = await request.json();
    
    const lesson = lessons.get(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const slideIndex = lesson.slides?.findIndex(s => s.id === body.slideId);
    if (slideIndex === -1 || slideIndex === undefined) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Слайд не знайдено',
          code: 'SLIDE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const currentSlide = lesson.slides[slideIndex];
    const now = new Date();

    // Оновлюємо слайд
    const updatedSlide: LessonSlide = {
      ...currentSlide,
      ...body.updates,
      id: body.slideId, // Захищаємо від зміни ID
      updatedAt: now,
      _internal: {
        ...currentSlide._internal,
        ...body.updates._internal,
        lastModified: now,
        version: currentSlide._internal.version + 1
      }
    };

    // Якщо потрібно регенерувати файли
    if (body.regenerateFiles) {
      updatedSlide._internal.htmlContent = generateBasicHTML(updatedSlide);
      updatedSlide.preview = updatedSlide.description;
    }

    lesson.slides[slideIndex] = updatedSlide;
    lesson.updatedAt = now;
    lessons.set(lessonId, lesson);

    const response: UpdateSlideResponse = {
      slide: updatedSlide,
      updatedFiles: [updatedSlide._internal.filename],
      preview: updatedSlide.preview,
      success: true,
      message: 'Слайд оновлено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при оновленні слайду:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при оновленні слайду',
        code: 'UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/lessons/[lessonId]/slides - видалити слайд
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = params.lessonId;
    const url = new URL(request.url);
    const slideId = url.searchParams.get('slideId');
    const deleteFiles = url.searchParams.get('deleteFiles') === 'true';

    if (!slideId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'ID слайду обов\'язковий',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }
    
    const lesson = lessons.get(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const slideIndex = lesson.slides?.findIndex(s => s.id === slideId);
    if (slideIndex === -1 || slideIndex === undefined) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Слайд не знайдено',
          code: 'SLIDE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const deletedSlide = lesson.slides[slideIndex];
    const deletedFiles = deleteFiles ? [deletedSlide._internal.filename] : [];

    // Видаляємо слайд
    lesson.slides.splice(slideIndex, 1);

    // Оновлюємо номери решти слайдів
    lesson.slides.forEach((slide, index) => {
      slide.number = index + 1;
    });

    lesson.updatedAt = new Date();
    lessons.set(lessonId, lesson);

    const response: DeleteSlideResponse = {
      deletedSlideId: slideId,
      deletedFiles,
      success: true,
      message: 'Слайд видалено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при видаленні слайду:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при видаленні слайду',
        code: 'DELETE_ERROR'
      }
    }, { status: 500 });
  }
}

// Допоміжна функція для генерації базового HTML
function generateBasicHTML(slide: Partial<LessonSlide>): string {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slide.title || 'Слайд'}</title>
  <style>
    body {
      font-family: 'Comic Sans MS', cursive, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .slide-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      max-width: 800px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 3em;
      margin: 0 0 20px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    p {
      font-size: 1.5em;
      line-height: 1.6;
      margin: 20px 0;
    }
    .icon {
      font-size: 4em;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="slide-container">
    <div class="icon">${slide.icon || '📄'}</div>
    <h1>${slide.title || 'Заголовок слайду'}</h1>
    <p>${slide.description || 'Опис слайду'}</p>
  </div>
</body>
</html>`;
}
