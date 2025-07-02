import { NextRequest, NextResponse } from 'next/server';
import { Lesson, LessonSlide } from '../../../types/lesson';
import { CreateLessonRequest, CreateLessonResponse } from '../../../types/api';

// Тимчасове сховище уроків (в продакшні буде база даних)
let lessons: Map<string, Lesson> = new Map();
let slideCounter = 0;

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createInitialSlides(lessonData: CreateLessonRequest): LessonSlide[] {
  const baseSlides: Partial<LessonSlide>[] = [
    {
      number: 1,
      title: 'Вітання',
      description: 'Знайомство з темою уроку',
      type: 'welcome',
      icon: '👋'
    },
    {
      number: 2,
      title: 'Основний матеріал',
      description: 'Подача нового матеріалу',
      type: 'content',
      icon: '📚'
    },
    {
      number: 3,
      title: 'Практичне завдання',
      description: 'Закріплення знань',
      type: 'activity',
      icon: '🎯'
    },
    {
      number: 4,
      title: 'Підсумок',
      description: 'Узагальнення вивченого',
      type: 'summary',
      icon: '📝'
    }
  ];

  // Якщо користувач передав власні слайди
  if (lessonData.initialSlides && lessonData.initialSlides.length > 0) {
    return lessonData.initialSlides.map((slide, index) => ({
      id: generateId(),
      number: index + 1,
      title: slide.title || `Слайд ${index + 1}`,
      description: slide.description || 'Опис слайду',
      type: slide.type || 'content',
      icon: slide.icon || '📄',
      status: 'draft' as const,
      preview: slide.description || 'Попередній перегляд недоступний',
      _internal: {
        filename: `slide_${index + 1}_${(slide.title || 'slide').toLowerCase().replace(/\s+/g, '_')}.html`,
        htmlContent: '',
        dependencies: [],
        lastModified: new Date(),
        version: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  // Створюємо базові слайди
  return baseSlides.map(slide => ({
    id: generateId(),
    number: slide.number!,
    title: slide.title!,
    description: slide.description!,
    type: slide.type!,
    icon: slide.icon!,
    status: 'draft' as const,
    preview: slide.description!,
    _internal: {
      filename: `slide_${slide.number}_${slide.title!.toLowerCase().replace(/\s+/g, '_')}.html`,
      htmlContent: '',
      dependencies: [],
      lastModified: new Date(),
      version: 1
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

// GET /api/lessons - отримати всі уроки
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('id');

    if (lessonId) {
      // Отримати конкретний урок
      const lesson = lessons.get(lessonId);
      if (!lesson) {
        return NextResponse.json({
          success: false,
          error: { message: 'Урок не знайдено', code: 'LESSON_NOT_FOUND' }
        }, { status: 404 });
      }

      return NextResponse.json({
        lesson,
        success: true,
        message: 'Урок знайдено'
      });
    }

    // Отримати всі уроки
    const allLessons = Array.from(lessons.values());
    return NextResponse.json({
      lessons: allLessons,
      total: allLessons.length,
      success: true,
      message: 'Уроки завантажено'
    });

  } catch (error) {
    console.error('Помилка при отриманні уроків:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Внутрішня помилка сервера',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/lessons - створити новий урок
export async function POST(request: NextRequest) {
  try {
    const body: CreateLessonRequest = await request.json();
    
    // Валідація
    if (!body.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Назва уроку обов\'язкова',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (!body.targetAge?.trim()) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Цільовий вік обов\'язковий',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    const lessonId = generateId();
    const now = new Date();
    
    // Створюємо слайди з переданих даних або базові слайди
    let slides: LessonSlide[] = [];
    
    if (body.slides && body.slides.length > 0) {
      // Конвертуємо передані слайди в формат LessonSlide
      slides = body.slides.map((slideData, index) => ({
        id: generateId(),
        number: index + 1,
        title: slideData.title || `Слайд ${index + 1}`,
        description: slideData.content || slideData.description || 'Опис слайду',
        type: (slideData.type as any) || 'content',
        icon: getSlideIcon((slideData.type as any) || 'content'),
        status: 'ready' as const,
        preview: slideData.content || slideData.description || 'Попередній перегляд',
        _internal: {
          filename: `slide_${index + 1}_${(slideData.title || 'slide').toLowerCase().replace(/\s+/g, '_')}.html`,
          htmlContent: slideData.htmlContent || '',
          dependencies: [],
          lastModified: now,
          version: 1
        },
        createdAt: now,
        updatedAt: now
      }));
    } else {
      slides = createInitialSlides(body);
    }

    // Функція для отримання іконки слайду
    function getSlideIcon(type: string): string {
      switch (type) {
        case 'welcome': return '👋';
        case 'content': return '📚';
        case 'activity': return '🎯';
        case 'game': return '🎮';
        case 'summary': return '📝';
        case 'title': return '📋';
        case 'interactive': return '🎮';
        default: return '📄';
      }
    }

    const lesson: Lesson = {
      id: lessonId,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      targetAge: body.targetAge.trim(),
      subject: body.subject?.trim() || '',
      duration: body.duration || 30,
      slides,
      _internal: {
        projectPath: `/projects/lesson_${lessonId}`,
        files: [],
        structure: {},
        metadata: {
          lessonTitle: body.title.trim(),
          targetAge: body.targetAge.trim(),
          subject: body.subject?.trim() || '',
          duration: body.duration || 30,
          slidesCount: slides.length,
          language: 'uk',
          createdBy: 'user',
          version: '1.0.0'
        },
        lastSync: now
      },
      createdAt: now,
      updatedAt: now,
      status: 'planning'
    };

    lessons.set(lessonId, lesson);

    const response: CreateLessonResponse = {
      lesson,
      success: true,
      message: 'Урок успішно створено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при створенні уроку:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при створенні уроку',
        code: 'CREATE_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/lessons - оновити урок
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, updates } = body;

    if (!lessonId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'ID уроку обов\'язковий',
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

    // Оновлюємо урок
    const updatedLesson: Lesson = {
      ...lesson,
      ...updates,
      id: lessonId, // Захищаємо від зміни ID
      updatedAt: new Date()
    };

    lessons.set(lessonId, updatedLesson);

    return NextResponse.json({
      lesson: updatedLesson,
      success: true,
      message: 'Урок оновлено'
    });

  } catch (error) {
    console.error('Помилка при оновленні уроку:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при оновленні уроку',
        code: 'UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/lessons - видалити урок
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('id');

    if (!lessonId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'ID уроку обов\'язковий',
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

    lessons.delete(lessonId);

    return NextResponse.json({
      deletedLessonId: lessonId,
      success: true,
      message: 'Урок видалено'
    });

  } catch (error) {
    console.error('Помилка при видаленні уроку:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Помилка при видаленні уроку',
        code: 'DELETE_ERROR'
      }
    }, { status: 500 });
  }
}
