import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { slideService, lessonService } from '@/services/database';
import { SlideInsert, SlideUpdate } from '@/types/database';
import { 
  CreateSlideRequest, 
  CreateSlideResponse,
  UpdateSlideRequest,
  UpdateSlideResponse,
  DeleteSlideRequest,
  DeleteSlideResponse
} from '@/types/api';
import { LessonSlide } from '@/types/lesson';

// Функція для отримання користувача з аутентифікації
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Користувач не аутентифікований');
  }
  
  return user;
}

// Функція для конвертації слайду з БД в legacy формат
function convertToLegacySlide(dbSlide: any): LessonSlide {
  return {
    id: dbSlide.id,
    number: dbSlide.slide_number,
    title: dbSlide.title,
    description: dbSlide.description || '',
    type: dbSlide.type,
    icon: dbSlide.icon,
    status: dbSlide.status as any,
    preview: dbSlide.preview_text || dbSlide.description || '',

    _internal: {
      filename: `slide_${dbSlide.slide_number}_${dbSlide.title.toLowerCase().replace(/\s+/g, '_')}.html`,
      htmlContent: dbSlide.html_content || '',
      dependencies: dbSlide.dependencies || [],
      lastModified: new Date(dbSlide.updated_at),
      version: 1
    },
    createdAt: new Date(dbSlide.created_at),
    updatedAt: new Date(dbSlide.updated_at)
  };
}

// GET /api/lessons/[lessonId]/slides - отримати слайди уроку
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { lessonId } = await params;
    
    // Перевіряємо, чи існує урок і чи має користувач доступ
    const lesson = await lessonService.getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Перевіряємо права доступу (власник або публічний урок)
    if (lesson.user_id !== user.id && !(lesson.is_public && lesson.status === 'published')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Немає доступу до цього уроку',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Отримуємо слайди
    const slides = await slideService.getLessonSlides(lessonId);
    const legacySlides = slides.map(convertToLegacySlide);

    return NextResponse.json({
      slides: legacySlides,
      total: legacySlides.length,
      lessonTitle: lesson.title,
      success: true,
      message: 'Слайди завантажено'
    });

  } catch (error) {
    console.error('Помилка при отриманні слайдів:', error);
    
    if (error instanceof Error && error.message.includes('аутентифікований')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Необхідна аутентифікація',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

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
    const user = await getAuthenticatedUser(request);
    const { lessonId } = await params;
    const body: CreateSlideRequest = await request.json();
    
    // Перевіряємо, чи існує урок і чи належить він користувачу
    const lesson = await lessonService.getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (lesson.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Немає прав для редагування цього уроку',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
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

    // Отримуємо поточні слайди для визначення позиції
    const currentSlides = await slideService.getLessonSlides(lessonId);
    let slideNumber = body.position !== undefined 
      ? body.position 
      : currentSlides.length + 1;

    // Якщо вставляємо слайд в середину, оновлюємо номери існуючих слайдів
    if (body.position !== undefined && body.position <= currentSlides.length) {
      for (const slide of currentSlides) {
        if (slide.slide_number >= body.position) {
          await slideService.updateSlide(slide.id, {
            slide_number: slide.slide_number + 1
          });
        }
      }
    }

    // Створюємо новий слайд
    const slideData: SlideInsert = {
      lesson_id: lessonId,
      title: body.slide.title.trim(),
      description: body.slide.description?.trim() || null,
      type: body.slide.type || 'content',
      icon: body.slide.icon || '📄',
      slide_number: slideNumber,
      status: 'draft',
      preview_text: body.slide.description?.trim() || 'Попередній перегляд недоступний',
      html_content: body.generateContent ? generateBasicHTML(body.slide) : null,
      metadata: {
        generatedContent: body.generateContent || false,
        originalRequest: body.slide
      }
    };

    const newSlide = await slideService.createSlide(slideData);
    const legacySlide = convertToLegacySlide(newSlide);

    const response: CreateSlideResponse = {
      slide: legacySlide,
      htmlFile: legacySlide._internal.filename,
      preview: legacySlide.preview,
      success: true,
      message: 'Слайд створено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при створенні слайду:', error);
    
    if (error instanceof Error && error.message.includes('аутентифікований')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Необхідна аутентифікація',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

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
    const user = await getAuthenticatedUser(request);
    const { lessonId } = await params;
    const body: UpdateSlideRequest = await request.json();
    
    // Перевіряємо, чи існує урок і чи належить він користувачу
    const lesson = await lessonService.getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (lesson.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Немає прав для редагування цього уроку',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Перевіряємо, чи існує слайд
    const currentSlide = await slideService.getSlideById(body.slideId);
    if (!currentSlide || currentSlide.lesson_id !== lessonId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Слайд не знайдено',
          code: 'SLIDE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Підготовка даних для оновлення
    const updateData: SlideUpdate = {};
    
    if (body.updates.title !== undefined) {
      updateData.title = body.updates.title;
    }
    if (body.updates.description !== undefined) {
      updateData.description = body.updates.description;
    }
    if (body.updates.type !== undefined) {
      updateData.type = body.updates.type;
    }
    if (body.updates.icon !== undefined) {
      updateData.icon = body.updates.icon;
    }
    if (body.updates.status !== undefined) {
      updateData.status = body.updates.status as any;
    }
    if (body.updates._internal?.htmlContent !== undefined) {
      updateData.html_content = body.updates._internal.htmlContent;
    }

    // Оновлюємо слайд
    const updatedSlide = await slideService.updateSlide(body.slideId, updateData);
    const legacySlide = convertToLegacySlide(updatedSlide);

    const response: UpdateSlideResponse = {
      slide: legacySlide,
      updatedFiles: [legacySlide._internal.filename],
      preview: legacySlide.preview,
      success: true,
      message: 'Слайд оновлено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при оновленні слайду:', error);
    
    if (error instanceof Error && error.message.includes('аутентифікований')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Необхідна аутентифікація',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

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
    const user = await getAuthenticatedUser(request);
    const { lessonId } = await params;
    const url = new URL(request.url);
    const slideId = url.searchParams.get('slideId');

    if (!slideId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'ID слайду обов\'язковий',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Перевіряємо, чи існує урок і чи належить він користувачу
    const lesson = await lessonService.getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Урок не знайдено',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (lesson.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Немає прав для редагування цього уроку',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Перевіряємо, чи існує слайд
    const slideToDelete = await slideService.getSlideById(slideId);
    if (!slideToDelete || slideToDelete.lesson_id !== lessonId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Слайд не знайдено',
          code: 'SLIDE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Видаляємо слайд
    await slideService.deleteSlide(slideId);

    // Оновлюємо номери слайдів, які йдуть після видаленого
    const remainingSlides = await slideService.getLessonSlides(lessonId);
    for (const slide of remainingSlides) {
      if (slide.slide_number > slideToDelete.slide_number) {
        await slideService.updateSlide(slide.id, {
          slide_number: slide.slide_number - 1
        });
      }
    }

    const response: DeleteSlideResponse = {
      deletedSlideId: slideId,
      success: true,
      message: 'Слайд видалено'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Помилка при видаленні слайду:', error);
    
    if (error instanceof Error && error.message.includes('аутентифікований')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Необхідна аутентифікація',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .slide-container {
            background: white;
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            max-width: 800px;
            text-align: center;
        }
        .slide-icon {
            font-size: 4rem;
            margin-bottom: 30px;
        }
        .slide-title {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 30px;
            font-weight: 600;
        }
        .slide-content {
            font-size: 1.2rem;
            color: #666;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="slide-container">
        <div class="slide-icon">${slide.icon || '📄'}</div>
        <h1 class="slide-title">${slide.title || 'Заголовок слайду'}</h1>
        <div class="slide-content">
            <p>${slide.description || 'Тут буде контент слайду...'}</p>
        </div>
    </div>
</body>
</html>`;
}
