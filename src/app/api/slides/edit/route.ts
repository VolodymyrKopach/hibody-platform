import { NextRequest, NextResponse } from 'next/server';
import { SlideEditRequest, SlideEditResponse, SlideComment } from '@/types/templates';
import { SimpleSlide } from '@/types/chat';
import { GeminiSlideEditingService } from '@/services/slides/GeminiSlideEditingService';
import { createClient } from '@/lib/supabase/server';

/**
 * Real AI service for slide editing using Gemini 2.5 Flash
 */
async function editSlideWithAI(
  slide: SimpleSlide, 
  comments: SlideComment[], 
  context: { ageGroup: string; topic: string },
  language?: string
): Promise<{ editedSlide: SimpleSlide; slideChanges: any }> {

  // Create server Supabase client for authentication
  const supabase = await createClient();

  // Initialize Gemini slide editing service with authenticated client
  const geminiService = new GeminiSlideEditingService(supabase);
  
  // Call real AI service
  const result = await geminiService.editSlide(slide, comments, {
    ageGroup: context.ageGroup,
    topic: context.topic
  }, language || 'en');

  return {
    editedSlide: result.editedSlide,
    slideChanges: result.slideChanges
  };
}



export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {


    const body = await request.json() as SlideEditRequest;
    

    
    // Валідація запиту
    if (!body.slide) {
      return NextResponse.json(
        { success: false, error: { message: 'Slide data is required', code: 'MISSING_SLIDE' } },
        { status: 400 }
      );
    }

    if (!body.comments || body.comments.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'At least one comment is required', code: 'MISSING_COMMENTS' } },
        { status: 400 }
      );
    }

    if (!body.context || !body.context.ageGroup || !body.context.topic) {
      return NextResponse.json(
        { success: false, error: { message: 'Context (ageGroup and topic) is required', code: 'MISSING_CONTEXT' } },
        { status: 400 }
      );
    }


    
    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'AI service not configured. Please check server configuration.',
          code: 'AI_SERVICE_NOT_CONFIGURED'
        }
      }, { status: 503 });
    }
    
    // Обробляємо редагування слайду
    const result = await editSlideWithAI(body.slide, body.comments, body.context, body.language);
    
    const processingTime = Date.now() - startTime;
    

    
    const response: SlideEditResponse = {
      success: true,
      editedSlide: result.editedSlide,
      slideChanges: result.slideChanges
    };



    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    

    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    let errorCode = 'PROCESSING_ERROR';
    let statusCode = 500;

    // Categorize different types of errors
    if (errorMessage.includes('GEMINI_API_KEY')) {
      errorCode = 'AI_SERVICE_NOT_CONFIGURED';
      statusCode = 503;
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      errorCode = 'AI_SERVICE_QUOTA_EXCEEDED';
      statusCode = 429;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      errorCode = 'AI_SERVICE_TIMEOUT';
      statusCode = 504;
    } else if (errorMessage.includes('Invalid JSON') || errorMessage.includes('parse')) {
      errorCode = 'AI_RESPONSE_PARSE_ERROR';
      statusCode = 502;
    }
    
    const response: SlideEditResponse = {
      success: false,
      error: {
        message: getUserFriendlyErrorMessage(errorCode, errorMessage),
        code: errorCode
      }
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * Convert technical error messages to user-friendly ones
 */
function getUserFriendlyErrorMessage(errorCode: string, originalMessage: string): string {
  switch (errorCode) {
    case 'AI_SERVICE_NOT_CONFIGURED':
      return 'AI service is not properly configured. Please contact support.';
    case 'AI_SERVICE_QUOTA_EXCEEDED':
      return 'AI service is temporarily overloaded. Please try again in a few minutes.';
    case 'AI_SERVICE_TIMEOUT':
      return 'AI service is taking too long to respond. Please try again.';
    case 'AI_RESPONSE_PARSE_ERROR':
      return 'AI service returned an invalid response. Please try again.';
    default:
      return `Unable to process slide editing: ${originalMessage}`;
  }
}
