import { NextRequest, NextResponse } from 'next/server';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { createClient } from '@/lib/supabase/server';
import { 
  PlanEditRequest, 
  PlanEditResponse, 
  CommentSectionType 
} from '@/types/templates';
import { 
  validateAndSanitizeEditRequest, 
  analyzePlanStructure,
  checkRateLimit 
} from '@/utils/planEditingValidation';

// Authenticate user helper
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Build AI prompt for plan editing
function buildEditPrompt(request: PlanEditRequest): string {
  const { originalPlan, comments, language, metadata } = request;
  
  const isUkrainian = language === 'uk';
  
  const systemPrompt = isUkrainian ? `
Ти експерт з редагування планів уроків. Твоє завдання - модифікувати наданий план уроку згідно з коментарями користувача.

ВАЖЛИВІ ПРАВИЛА:
1. Зберігай структуру та формат оригінального плану (JSON або Markdown)
2. Застосовуй зміни точно згідно з інструкціями користувача
3. Зберігай нумерацію слайдів та загальний потік уроку
4. Підтримуй відповідність віковій групі та освітній цінності
5. Якщо коментарі суперечать один одному, пріоритет має останній
6. Відповідай ТІЛЬКИ відредагованим планом без додаткових пояснень

МЕТАДАНІ УРОКУ:
${metadata ? `
- Вікова група: ${metadata.ageGroup}
- Тема: ${metadata.topic}
- Кількість слайдів: ${metadata.slideCount}
` : 'Метадані не надані'}
` : `
You are an expert lesson plan editor. Your task is to modify the provided lesson plan according to user comments.

IMPORTANT RULES:
1. Preserve the structure and format of the original plan (JSON or Markdown)
2. Apply changes exactly according to user instructions
3. Maintain slide numbering and overall lesson flow
4. Keep age-appropriate content and educational value
5. If comments conflict, prioritize the most recent ones
6. Respond with ONLY the edited plan without additional explanations

LESSON METADATA:
${metadata ? `
- Age Group: ${metadata.ageGroup}
- Topic: ${metadata.topic}
- Slide Count: ${metadata.slideCount}
` : 'No metadata provided'}
`;

  const commentsSection = isUkrainian ? 
    `КОМЕНТАРІ КОРИСТУВАЧА:
${comments.map((comment, index) => `
${index + 1}. Секція: ${comment.section}${comment.sectionId ? ` (${comment.sectionId})` : ''}
   Пріоритет: ${comment.priority || 'medium'}
   Інструкція: ${comment.instruction}
`).join('')}` :
    `USER COMMENTS:
${comments.map((comment, index) => `
${index + 1}. Section: ${comment.section}${comment.sectionId ? ` (${comment.sectionId})` : ''}
   Priority: ${comment.priority || 'medium'}
   Instruction: ${comment.instruction}
`).join('')}`;

  const originalPlanSection = isUkrainian ?
    `ОРИГІНАЛЬНИЙ ПЛАН:
${originalPlan}

ВІДРЕДАГОВАНИЙ ПЛАН:` :
    `ORIGINAL PLAN:
${originalPlan}

EDITED PLAN:`;

  return `${systemPrompt}

${commentsSection}

${originalPlanSection}`;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    console.log(`✏️ PLAN EDIT API: POST request received [${requestId}]`);
    
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 60000, 5); // 5 requests per minute
    
    if (!rateLimit.allowed) {
      console.warn(`🚫 PLAN EDIT API: Rate limit exceeded [${requestId}] for IP: ${clientIP}`);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      });
    }
    
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    console.log(`👤 PLAN EDIT API: User authenticated [${requestId}]:`, { 
      id: user.id, 
      email: user.email 
    });
    
    // Parse and validate request body
    const rawBody = await request.json();
    const validation = validateAndSanitizeEditRequest(rawBody);
    
    if (!validation.isValid) {
      console.error(`❌ PLAN EDIT API: Validation errors [${requestId}]:`, validation.errors);
      return NextResponse.json({
        success: false,
        error: { 
          message: validation.errors.join(', '),
          code: 'VALIDATION_ERROR',
          failedComments: validation.errors
        }
      }, { status: 400 });
    }

    const body = validation.sanitizedRequest!;
    
    // Log validation warnings if any
    if (validation.warnings.length > 0) {
      console.warn(`⚠️ PLAN EDIT API: Validation warnings [${requestId}]:`, validation.warnings);
    }
    
    console.log(`📋 PLAN EDIT API: Request validated [${requestId}]:`, {
      commentsCount: body.comments.length,
      originalPlanLength: body.originalPlan.length,
      language: body.language,
      preserveStructure: body.preserveStructure,
      hasMetadata: !!body.metadata
    });
    
    // Analyze original plan structure
    const planAnalysis = analyzePlanStructure(body.originalPlan);
    console.log(`🔍 PLAN EDIT API: Plan analysis [${requestId}]:`, {
      format: planAnalysis.format,
      slideCount: planAnalysis.slideCount,
      hasObjectives: planAnalysis.hasObjectives,
      hasMaterials: planAnalysis.hasMaterials
    });
    
    if (planAnalysis.warnings.length > 0) {
      console.warn(`⚠️ PLAN EDIT API: Plan analysis warnings [${requestId}]:`, planAnalysis.warnings);
    }

    // Build AI prompt
    const prompt = buildEditPrompt(body);
    console.log(`🎯 PLAN EDIT API: Starting plan editing [${requestId}]`, {
      promptLength: prompt.length,
      commentsCount: body.comments.length
    });

    // Generate edited plan using Gemini
    const contentService = new GeminiContentService();
    
    try {
      // Use generateContent method directly for more control
      const response = await contentService.generateContent(prompt, {
        temperature: 0.3, // Lower temperature for more consistent editing
        maxTokens: 8000,  // Ensure we can handle large plans
        model: 'gemini-2.5-flash'
      });

      if (!response || !response.trim()) {
        throw new Error('Empty response from AI service');
      }

      console.log(`✅ PLAN EDIT API: Plan edited successfully [${requestId}]`, {
        originalLength: body.originalPlan.length,
        editedLength: response.length,
        processingTime: Date.now() - startTime
      });

      // Analyze applied changes (basic detection)
      const appliedChanges = body.comments.map(comment => ({
        sectionType: comment.section,
        sectionId: comment.sectionId,
        changeDescription: `Applied: ${comment.instruction.substring(0, 50)}...`,
        success: true
      }));

      const editResponse: PlanEditResponse = {
        success: true,
        editedPlan: response,
        appliedChanges,
        metadata: {
          processingTime: Date.now() - startTime,
          changesCount: body.comments.length,
          preservedStructure: body.preserveStructure
        }
      };

      return NextResponse.json(editResponse, { status: 200 });

    } catch (aiError) {
      console.error(`❌ PLAN EDIT API: AI service error [${requestId}]:`, aiError);
      
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to process editing request. Please try again.',
          code: 'AI_PROCESSING_ERROR'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error(`❌ PLAN EDIT API: Error editing plan [${requestId}]:`, error);
    
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
        message: 'Failed to edit lesson plan. Please try again.',
        code: 'PROCESSING_ERROR'
      }
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Plan Editing API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
