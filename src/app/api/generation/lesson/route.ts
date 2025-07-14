import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Types for API requests ===
interface GenerateLessonRequest {
  ageGroupConfig: AgeGroupConfig;
  formValues: FormValues;
  metadata?: {
    title?: string;
    description?: string;
    generateSlides?: boolean;
    slideCount?: number;
  };
}

interface GenerateLessonResponse {
  success: boolean;
  lesson?: {
    id: string;
    title: string;
    description: string;
    slides: Array<{
      id: string;
      title: string;
      content: string;
      htmlContent?: string;
      type: 'welcome' | 'content' | 'activity' | 'summary';
      status: 'ready' | 'generating' | 'error';
    }>;
  };
  error?: string;
  message?: string;
}

// === SOLID: SRP - Error handling ===
class GenerationAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'GenerationAPIError';
  }
}

// === SOLID: SRP - Request validation ===
function validateRequest(body: any): GenerateLessonRequest {
  if (!body.ageGroupConfig) {
    throw new GenerationAPIError('Age group configuration is required', 400, 'MISSING_AGE_GROUP');
  }
  
  if (!body.formValues) {
    throw new GenerationAPIError('Form values are required', 400, 'MISSING_FORM_VALUES');
  }
  
  if (!body.ageGroupConfig.id) {
    throw new GenerationAPIError('Age group ID is required', 400, 'INVALID_AGE_GROUP');
  }
  
  return body as GenerateLessonRequest;
}

// === SOLID: DIP - Dependency injection setup ===
async function getGenerationServices() {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  if (!claudeApiKey) {
    throw new GenerationAPIError('Claude API key not configured', 500, 'MISSING_API_KEY');
  }
  
  const { ClaudeSonnetContentService } = await import('@/services/content/ClaudeSonnetContentService');
  const { LessonService } = await import('@/services/database/LessonService');
  
  return {
    contentService: new ClaudeSonnetContentService(claudeApiKey),
    lessonService: new LessonService()
  };
}

// === SOLID: SRP - Authentication helper ===
async function authenticate(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new GenerationAPIError('Authentication required', 401, 'UNAUTHORIZED');
  }
  
  return user;
}

// === SOLID: SRP - Main POST handler ===
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 GENERATION API: Starting lesson generation request');
    
    // === SOLID: SRP - Parse and validate request ===
    const body = await request.json();
    const validatedRequest = validateRequest(body);
    
    console.log('📋 GENERATION API: Request validated:', {
      ageGroup: validatedRequest.ageGroupConfig.id,
      formFieldsCount: Object.keys(validatedRequest.formValues).length,
      hasMetadata: !!validatedRequest.metadata
    });
    
    // === SOLID: SRP - Authenticate user ===
    const user = await authenticate(request);
    console.log('👤 GENERATION API: User authenticated:', user.id);
    
    // === SOLID: DIP - Get generation services ===
    const { contentService, lessonService } = await getGenerationServices();
    
    // === SOLID: SRP - Generate lesson ===
    console.log('🎨 GENERATION API: Generating lesson with constructor...');
    
    // Create a basic lesson using existing services
    const lessonData = {
      user_id: user.id,
      title: validatedRequest.metadata?.title || 'Урок створений конструктором',
      description: validatedRequest.metadata?.description || 'Урок створено за допомогою конструктора',
      subject: validatedRequest.formValues.subject as string || 'Загальна освіта',
      age_group: validatedRequest.ageGroupConfig.id,
      duration: parseInt(validatedRequest.formValues.duration as string) || 45,
      difficulty: 'medium' as const,
      status: 'draft' as const,
      is_public: false,
      tags: [],
      metadata: {
        generatedBy: 'constructor',
        ageGroupConfig: validatedRequest.ageGroupConfig,
        formValues: validatedRequest.formValues,
        generationTimestamp: new Date().toISOString()
      }
    };
    
    const lesson = await lessonService.createLesson(lessonData);
    
    console.log('✅ GENERATION API: Lesson generated successfully:', {
      lessonId: lesson.id,
      title: lesson.title,
      slidesCount: 0 // Will be generated later
    });
    
    // === SOLID: SRP - Format response ===
    const response: GenerateLessonResponse = {
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        slides: [] // Slides will be generated in a separate process
      },
      message: 'Урок успішно згенеровано'
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ GENERATION API: Error generating lesson:', error);
    
    // === SOLID: SRP - Error response handling ===
    if (error instanceof GenerationAPIError) {
      const response: GenerateLessonResponse = {
        success: false,
        error: error.message,
        message: error.message
      };
      
      return NextResponse.json(response, { status: error.statusCode });
    }
    
    // === SOLID: SRP - Unknown error handling ===
    const response: GenerateLessonResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Внутрішня помилка сервера'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// === SOLID: OCP - GET endpoint for getting generation capabilities ===
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    const capabilities = {
      supportedAgeGroups: ['2-3', '4-6', '7-8', '9-10'],
      maxSlides: 10,
      supportedFormats: ['html', 'interactive'],
      features: {
        aiGeneration: true,
        formPersistence: true,
        preview: true,
        validation: true
      }
    };
    
    return NextResponse.json({
      success: true,
      capabilities,
      user: {
        id: user.id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ GENERATION API: Error getting capabilities:', error);
    
    if (error instanceof GenerationAPIError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 