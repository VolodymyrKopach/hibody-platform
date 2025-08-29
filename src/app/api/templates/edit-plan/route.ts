import { NextRequest, NextResponse } from 'next/server';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { createClient } from '@/lib/supabase/server';
import { 
  PlanEditRequest, 
  PlanEditResponse, 
  PlanEditResponseWithChanges,
  CommentSectionType,
  PlanChanges,
  PlanChangeItem
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

// Build AI prompt for generating changes description
function buildChangesAnalysisPrompt(originalPlan: string, editedPlan: string, comments: PlanEditRequest['comments'], language: 'uk' | 'en'): string {
  const isUkrainian = language === 'uk';
  
  const systemPrompt = isUkrainian ? `
Ти експерт з аналізу змін у планах уроків. Твоє завдання - проаналізувати оригінальний та відредагований план і створити структурований опис внесених змін.

ВАЖЛИВІ ПРАВИЛА:
1. Порівняй оригінальний та відредагований план
2. Визнач які саме зміни були внесені в кожній секції
3. Створи короткий (1-2 речення) та детальний опис для кожної зміни
4. Класифікуй зміни за типами: modified, added, removed, restructured
5. Відповідай ТІЛЬКИ валідним JSON без додаткових пояснень

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "summary": {
    "totalChanges": число_змін,
    "sectionsModified": кількість_секцій
  },
  "changes": [
    {
      "section": "назва_секції",
      "sectionType": "objectives|activities|materials|assessment|homework|slides|games|recommendations|general",
      "shortDescription": "Короткий опис зміни (1-2 речення)",
      "detailedDescription": "Детальний опис зміни з конкретними прикладами",
      "changeType": "modified|added|removed|restructured"
    }
  ]
}` : `
You are an expert in analyzing lesson plan changes. Your task is to analyze the original and edited plan and create a structured description of the changes made.

IMPORTANT RULES:
1. Compare the original and edited plan
2. Identify exactly what changes were made in each section
3. Create short (1-2 sentences) and detailed descriptions for each change
4. Classify changes by type: modified, added, removed, restructured
5. Respond with ONLY valid JSON without additional explanations

RESPONSE FORMAT (JSON):
{
  "summary": {
    "totalChanges": number_of_changes,
    "sectionsModified": number_of_sections
  },
  "changes": [
    {
      "section": "section_name",
      "sectionType": "objectives|activities|materials|assessment|homework|slides|games|recommendations|general",
      "shortDescription": "Short change description (1-2 sentences)",
      "detailedDescription": "Detailed change description with specific examples",
      "changeType": "modified|added|removed|restructured"
    }
  ]
}`;

  const commentsContext = isUkrainian ?
    `КОМЕНТАРІ КОРИСТУВАЧА (для контексту):
${comments.map((comment, index) => `${index + 1}. ${comment.section}: ${comment.instruction}`).join('\n')}` :
    `USER COMMENTS (for context):
${comments.map((comment, index) => `${index + 1}. ${comment.section}: ${comment.instruction}`).join('\n')}`;

  return `${systemPrompt}

${commentsContext}

ОРИГІНАЛЬНИЙ ПЛАН:
${originalPlan}

ВІДРЕДАГОВАНИЙ ПЛАН:
${editedPlan}

JSON ВІДПОВІДЬ:`;
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

      // Generate structured changes description using AI
      let planChanges: PlanChanges | undefined;
      
      try {
        console.log(`🔍 PLAN EDIT API: Analyzing changes [${requestId}]`);
        
        const changesPrompt = buildChangesAnalysisPrompt(
          body.originalPlan, 
          response, 
          body.comments, 
          body.language
        );
        
        const changesResponse = await contentService.generateContent(changesPrompt, {
          temperature: 0.1, // Very low temperature for consistent JSON
          maxTokens: 2000,
          model: 'gemini-2.5-flash'
        });

        if (changesResponse && changesResponse.trim()) {
          try {
            // Clean the response to ensure it's valid JSON
            const cleanedResponse = changesResponse.trim()
              .replace(/^```json\s*/, '')
              .replace(/\s*```$/, '')
              .replace(/^```\s*/, '')
              .replace(/\s*```$/, '');
            
            planChanges = JSON.parse(cleanedResponse) as PlanChanges;
            
            console.log(`✅ PLAN EDIT API: Changes analyzed successfully [${requestId}]`, {
              totalChanges: planChanges.summary.totalChanges,
              sectionsModified: planChanges.summary.sectionsModified
            });
          } catch (parseError) {
            console.warn(`⚠️ PLAN EDIT API: Failed to parse changes JSON [${requestId}]:`, parseError);
            // Fall back to basic changes detection
            planChanges = undefined;
          }
        }
      } catch (changesError) {
        console.warn(`⚠️ PLAN EDIT API: Failed to analyze changes [${requestId}]:`, changesError);
        // Continue without changes analysis
      }

      // Analyze applied changes (basic detection for backward compatibility)
      const appliedChanges = body.comments.map(comment => ({
        sectionType: comment.section,
        sectionId: comment.sectionId,
        changeDescription: `Applied: ${comment.instruction.substring(0, 50)}...`,
        success: true
      }));

      const editResponse: PlanEditResponseWithChanges = {
        success: true,
        editedPlan: response,
        appliedChanges,
        changes: planChanges,
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
