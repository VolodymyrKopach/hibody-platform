import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lessonService } from '@/services/database';
import { LessonInsert, LessonFilters, LessonWithSlides } from '@/types/database';
import { CreateLessonRequest, CreateLessonResponse } from '@/types/api';
import { Lesson } from '@/types/lesson';

// Function to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user;
}

// Function to convert LessonWithSlides to Lesson (legacy format)
function convertToLegacyLesson(dbLesson: LessonWithSlides): Lesson {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    description: dbLesson.description || '',
    targetAge: dbLesson.age_group,
    subject: dbLesson.subject,
    duration: dbLesson.duration,
    slides: dbLesson.slides?.map(slide => ({
      id: slide.id,
      number: slide.slide_number,
      title: slide.title,
      description: slide.description || '',
      type: slide.type,
      icon: slide.icon,
      status: slide.status as any,
      preview: slide.preview_text || slide.description || '',
      _internal: {
        filename: `slide_${slide.slide_number}_${slide.title.toLowerCase().replace(/\s+/g, '_')}.html`,
        htmlContent: slide.html_content || '',
        dependencies: slide.dependencies || [],
        lastModified: new Date(slide.updated_at),
        version: 1
      },
      createdAt: new Date(slide.created_at),
      updatedAt: new Date(slide.updated_at)
    })) || [],
    _internal: {
      projectPath: `/projects/lesson_${dbLesson.id}`,
      files: [],
      structure: {},
      metadata: {
        lessonTitle: dbLesson.title,
        targetAge: dbLesson.age_group,
        subject: dbLesson.subject,
        duration: dbLesson.duration,
        slidesCount: dbLesson.slides?.length || 0,
        language: 'uk',
        createdBy: 'user',
        version: '1.0.0'
      },
      lastSync: new Date(dbLesson.updated_at)
    },
    createdAt: new Date(dbLesson.created_at),
    updatedAt: new Date(dbLesson.updated_at),
    status: 'planning'
  };
}

// GET /api/lessons - get user lessons
export async function GET(request: NextRequest) {
  console.log('🚀 API: GET /api/lessons called');
  
  try {
    const user = await getAuthenticatedUser(request);
    console.log('👤 API: Authenticated user:', { id: user.id, email: user.email });
    
    const url = new URL(request.url);
    console.log('🔍 API: Request URL:', url.toString());
    
    const lessonId = url.searchParams.get('id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || undefined;
    const subject = url.searchParams.get('subject') || undefined;
    const ageGroup = url.searchParams.get('ageGroup') || undefined;
    const difficulty = url.searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | undefined;
    const status = url.searchParams.get('status') as 'draft' | 'published' | 'archived' | undefined;
    const isPublic = url.searchParams.get('isPublic') === 'true' ? true : 
                    url.searchParams.get('isPublic') === 'false' ? false : undefined;
                    
    console.log('⚙️ API: Query parameters:', {
      lessonId, page, limit, search, subject, ageGroup, difficulty, status, isPublic
    });

    if (lessonId) {
      console.log('📖 API: Fetching single lesson with ID:', lessonId);
      // Get a specific lesson with slides
      const lesson = await lessonService.getLessonWithSlides(lessonId);
      if (!lesson) {
        console.log('❌ API: Lesson not found');
        return NextResponse.json({
          success: false,
          error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' }
        }, { status: 404 });
      }

      console.log('✅ API: Single lesson found:', {
        id: lesson.id,
        title: lesson.title,
        slides_count: lesson.slides?.length || 0
      });

      return NextResponse.json({
        lesson,
        success: true,
        message: 'Lesson found'
      });
    }

    // Get user lessons with filtering
    console.log('📚 API: Fetching user lessons with filters');
    const filters: LessonFilters = {
      search,
      subject,
      ageGroup,
      difficulty,
      status,
      isPublic
    };

    console.log('🔧 API: Applied filters:', filters);

    const result = await lessonService.getUserLessons(user.id, filters, {
      page,
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    console.log('📊 API: Query results:', {
      total_lessons: result.total,
      lessons_returned: result.data.length,
      page: result.page,
      total_pages: result.totalPages
    });

         // Detailed logging of each lesson
     result.data.forEach((lesson, index) => {
       console.log(`📖 API: Lesson ${index + 1}:`, {
         id: lesson.id,
         title: lesson.title,
         thumbnail_url: lesson.thumbnail_url,
         has_thumbnail: !!lesson.thumbnail_url,
         status: lesson.status,
         created_at: lesson.created_at,
         updated_at: lesson.updated_at
       });
     });

    const response = {
      lessons: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      success: true,
      message: 'Lessons loaded'
    };

    console.log('📤 API: Sending response with', result.data.length, 'lessons');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching lessons:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/lessons - create new lesson
export async function POST(request: NextRequest) {
  try {
    console.log('📝 LESSONS API: POST request received');
    const user = await getAuthenticatedUser(request);
    console.log('👤 LESSONS API: User authenticated:', { id: user.id, email: user.email });
    
    const body: CreateLessonRequest = await request.json();
    console.log('📋 LESSONS API: Request body received:', {
      title: body.title,
      description: body.description,
      subject: body.subject,
      targetAge: body.targetAge,
      duration: body.duration,
      thumbnail_url: body.thumbnail_url,
      slidesCount: body.slides?.length || 0,
      hasSlides: !!(body.slides && body.slides.length > 0)
    });
    
    if (body.slides && body.slides.length > 0) {
      console.log('🎯 LESSONS API: Slides data:', body.slides.map(slide => ({
        title: slide.title,
        type: slide.type,
        hasDescription: !!slide.description,
        hasHtmlContent: !!slide.htmlContent,
        hasContent: !!slide.content,
        descriptionLength: slide.description?.length || 0,
        htmlContentLength: slide.htmlContent?.length || 0,
        contentLength: slide.content?.length || 0
      })));
    }
    
    // Validation
    if (!body.title?.trim()) {
      console.error('❌ LESSONS API: Validation error - missing title');
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson title is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (!body.targetAge?.trim()) {
      console.error('❌ LESSONS API: Validation error - missing targetAge');
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Target age is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    console.log('✅ LESSONS API: Validation passed');

    // Check if user can create a lesson
    const canCreate = await lessonService.canCreateLesson(user.id);
    if (!canCreate) {
      console.error('❌ LESSONS API: Subscription limit reached for user:', user.id);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson limit reached for your subscription',
          code: 'SUBSCRIPTION_LIMIT_REACHED'
        }
      }, { status: 403 });
    }

    console.log('✅ LESSONS API: User can create lesson');

         // Prepare data for lesson creation
     const lessonData: LessonInsert = {
       user_id: user.id,
       title: body.title.trim(),
       description: body.description?.trim() || null,
       subject: body.subject || 'General education',
       age_group: body.targetAge,
       duration: body.duration || 45,
       difficulty: 'medium',
       status: 'draft',
       thumbnail_url: body.thumbnail_url || null,
       is_public: false,
       tags: [],
       metadata: {
         originalRequest: {
           title: body.title,
           targetAge: body.targetAge,
           subject: body.subject,
           description: body.description,
           thumbnail_url: body.thumbnail_url
         }
       }
     };

    console.log('📊 LESSONS API: Prepared lesson data:', {
      user_id: lessonData.user_id,
      title: lessonData.title,
      description: lessonData.description,
      subject: lessonData.subject,
      age_group: lessonData.age_group,
      duration: lessonData.duration,
      thumbnail_url: lessonData.thumbnail_url,
      status: lessonData.status
    });

    // Create lesson
    console.log('🔄 LESSONS API: Creating lesson in database...');
    const lesson = await lessonService.createLesson(lessonData);
    console.log('✅ LESSONS API: Lesson created with ID:', lesson.id);

    // If slides are provided, create them
    if (body.slides && body.slides.length > 0) {
      console.log('🎯 LESSONS API: Creating slides from request data...');
      const { slideService } = await import('@/services/database');
      
      for (let i = 0; i < body.slides.length; i++) {
        const slideData = body.slides[i];
        console.log(`📄 LESSONS API: Creating slide ${i + 1}/${body.slides.length}:`, {
          title: slideData.title,
          type: slideData.type,
          hasHtmlContent: !!slideData.htmlContent
        });
        
        const createdSlide = await slideService.createSlide({
          lesson_id: lesson.id,
          title: slideData.title || `Slide ${i + 1}`,
          description: slideData.description || slideData.content || null,
                     type: slideData.type === 'title' ? 'welcome' as const : 
                 slideData.type === 'interactive' ? 'activity' as const : 
                 'content' as const,
          icon: getSlideIcon(slideData.type || 'content'),
          slide_number: i + 1,
          status: 'ready',
          html_content: slideData.htmlContent || null,
          metadata: {
            originalContent: slideData.content,
            generatedFrom: 'api_request'
          }
        });
        
        console.log(`✅ LESSONS API: Slide ${i + 1} created with ID:`, createdSlide.id);
      }
      console.log('🎉 LESSONS API: All slides created successfully');
    } else {
      console.log('📝 LESSONS API: Creating default slides...');
      // Create default slides
      const { slideService } = await import('@/services/database');
      const baseSlides = [
        { title: 'Welcome', description: 'Introduction to the lesson topic', type: 'welcome', icon: '👋' },
        { title: 'Main Material', description: 'Presentation of new material', type: 'content', icon: '📚' },
        { title: 'Practical Task', description: 'Reinforcement of knowledge', type: 'activity', icon: '🎯' },
        { title: 'Summary', description: 'Generalization of learned material', type: 'summary', icon: '📝' }
      ];

      for (let i = 0; i < baseSlides.length; i++) {
        const slide = baseSlides[i];
        await slideService.createSlide({
          lesson_id: lesson.id,
          title: slide.title,
          description: slide.description,
          type: slide.type as any,
          icon: slide.icon,
          slide_number: i + 1,
          status: 'draft'
        });
      }
      console.log('✅ LESSONS API: Default slides created');
    }

    // Get the created lesson with slides
    console.log('🔄 LESSONS API: Fetching lesson with slides...');
    const lessonWithSlides = await lessonService.getLessonWithSlides(lesson.id);
    console.log('📊 LESSONS API: Lesson with slides retrieved:', {
      id: lessonWithSlides?.id,
      title: lessonWithSlides?.title,
      slidesCount: lessonWithSlides?.slides?.length || 0
    });

         const response: CreateLessonResponse = {
       lesson: convertToLegacyLesson(lessonWithSlides!),
       success: true,
       message: 'Lesson created successfully'
     };

    console.log('🎉 LESSONS API: Lesson creation completed successfully');
    console.log('📤 LESSONS API: Sending response:', {
      success: response.success,
      message: response.message,
      lessonId: response.lesson.id,
      lessonTitle: response.lesson.title,
      slidesCount: response.lesson.slides.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ LESSONS API: Error during lesson creation:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Error creating lesson',
        code: 'CREATE_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/lessons - update lesson
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson ID is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Check if lesson exists and belongs to user
    const existingLesson = await lessonService.getLessonById(body.id);
    if (!existingLesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (existingLesson.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'No rights to edit this lesson',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Update lesson
    const updatedLesson = await lessonService.updateLesson(body.id, {
      title: body.title?.trim(),
      description: body.description?.trim() || null,
      subject: body.subject,
      age_group: body.targetAge,
      duration: body.duration,
      difficulty: body.difficulty,
      status: body.status,
      is_public: body.isPublic,
      tags: body.tags
    });

    return NextResponse.json({
      lesson: updatedLesson,
      success: true,
      message: 'Lesson updated'
    });

  } catch (error) {
    console.error('Error updating lesson:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Error updating lesson',
        code: 'UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/lessons - delete lesson
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('id');

    if (!lessonId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson ID is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Check if lesson exists and belongs to user
    const existingLesson = await lessonService.getLessonById(lessonId);
    if (!existingLesson) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (existingLesson.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'No rights to delete this lesson',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Delete lesson (slides will be deleted automatically via CASCADE)
    await lessonService.deleteLesson(lessonId);

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted'
    });

  } catch (error) {
    console.error('Error deleting lesson:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Error deleting lesson',
        code: 'DELETE_ERROR'
      }
    }, { status: 500 });
  }
}

// Helper function to get slide icon
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
