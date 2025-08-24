import { NextRequest, NextResponse } from 'next/server';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { createClient } from '@/lib/supabase/server';

interface LessonPlanRequest {
  ageGroup: string;
  topic: string;
  slideCount: number;
  additionalInfo?: string;
  language?: string;
}

interface LessonPlanResponse {
  success: boolean;
  plan?: any; // Changed from string to any to support JSON object
  error?: {
    message: string;
    code: string;
  };
}

// Authenticate user helper
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  try {
    console.log(`📝 LESSON PLAN API: POST request received [${requestId}]`);
    
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    console.log(`👤 LESSON PLAN API: User authenticated [${requestId}]:`, { id: user.id, email: user.email });
    
    // Parse request body
    const body: LessonPlanRequest = await request.json();
    console.log(`📋 LESSON PLAN API: Request body received [${requestId}]:`, {
      ageGroup: body.ageGroup,
      topic: body.topic,
      slideCount: body.slideCount,
      hasAdditionalInfo: !!body.additionalInfo,
      additionalInfoLength: body.additionalInfo?.length || 0,
      language: body.language || 'en'
    });
    
    // Validation
    if (!body.ageGroup?.trim()) {
      console.error('❌ LESSON PLAN API: Validation error - missing ageGroup');
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Age group is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (!body.topic?.trim()) {
      console.error('❌ LESSON PLAN API: Validation error - missing topic');
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Topic is required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (!body.slideCount || body.slideCount < 1 || body.slideCount > 20) {
      console.error('❌ LESSON PLAN API: Validation error - invalid slideCount');
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Slide count must be between 1 and 20',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Build conversation context from form data
    let conversationContext = `User wants to create a lesson with the following parameters:
- Age Group: ${body.ageGroup}
- Topic: ${body.topic}
- Number of slides: ${body.slideCount}`;

    if (body.additionalInfo?.trim()) {
      conversationContext += `
- Additional requirements: ${body.additionalInfo}`;
    }

    // Generate lesson plan using existing GeminiContentService
    console.log(`🎯 LESSON PLAN API: Starting lesson plan generation [${requestId}]`);
    const contentService = new GeminiContentService();
    
    const generatedPlanJSON = await contentService.generateLessonPlanJSON(
      body.topic,
      body.ageGroup,
      body.language || 'en',
      conversationContext,
      body.slideCount
    );

    console.log(`✅ LESSON PLAN API: Lesson plan generated successfully [${requestId}]`);
    console.log(`📏 LESSON PLAN API: Generated plan length [${requestId}]:`, generatedPlanJSON.length);

    // Parse JSON string to object
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(generatedPlanJSON);
      console.log(`✅ LESSON PLAN API: JSON parsed successfully [${requestId}]`);
      console.log(`📋 LESSON PLAN API: Plan contains ${parsedPlan.slides?.length || 0} slides [${requestId}]`);
    } catch (parseError) {
      console.error(`❌ LESSON PLAN API: Failed to parse JSON [${requestId}]:`, parseError);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Generated lesson plan is not valid JSON',
          code: 'PARSE_ERROR'
        }
      }, { status: 500 });
    }

    const response: LessonPlanResponse = {
      success: true,
      plan: parsedPlan // Now returning parsed object instead of string
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ LESSON PLAN API: Error generating lesson plan:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_ERROR'
          }
        }, { status: 401 });
      }
      
      if (error.message.includes('GEMINI_API_KEY')) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'AI service configuration error',
            code: 'CONFIG_ERROR'
          }
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to generate lesson plan. Please try again.',
        code: 'GENERATION_ERROR'
      }
    }, { status: 500 });
  }
}
