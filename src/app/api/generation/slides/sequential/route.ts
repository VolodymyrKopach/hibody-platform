import { NextRequest, NextResponse } from 'next/server';
import { SlideGenerationService } from '@/services/chat/services/SlideGenerationService';
import { SlideDescription, SimpleLesson, SimpleSlide, SlideGenerationProgress } from '@/types/chat';
import { sendProgressUpdate, sendCompletion } from '../progress/route';
import { TemporaryImageInfo } from '@/services/images/TemporaryImageService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { slideDescriptions, lesson, topic, age, sessionId, planText, tempStorageOptions } = await request.json();

    // Initialize temporary storage configuration
    const tempSessionId = tempStorageOptions?.sessionId || `seq_${sessionId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get authenticated Supabase client for temporary storage
    const supabase = await createClient();

    console.log('🎨 SEQUENTIAL API: Starting content-driven slide generation...');
    console.log('📋 SEQUENTIAL API: Request details:', {
      slideCount: slideDescriptions?.length || 0,
      lesson: lesson?.title || 'Unknown',
      topic,
      age,
      sessionId,
      hasPlanText: !!planText,
      tempSessionId,
      tempStorageEnabled: tempStorageOptions?.useTemporaryStorage ?? true
    });

    // Temporary storage is always enabled in production
    console.log('🔄 Using temporary storage for slide generation');

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Create slide generation service
    const slideGenerationService = new SlideGenerationService();
    
    // Progress tracking state
    let currentProgress: SlideGenerationProgress[] = [];
    let generatedSlides: SimpleSlide[] = [];

    try {
      // Use content-driven generation if plan text is available
      if (planText && typeof planText === 'string') {
        console.log('🎯 SEQUENTIAL API: Using content-driven generation from lesson plan');
        
        generatedSlides = await slideGenerationService.generateSlidesFromPlan(
          planText,
          topic || 'general topic',
          age || '6-8 years',
          {
            sessionId: tempSessionId,
            useTemporaryStorage: tempStorageOptions?.useTemporaryStorage ?? true
          }
        );

        // Create progress updates for the generated slides
        currentProgress = generatedSlides.map((slide, index) => ({
          slideNumber: index + 1,
          title: slide.title,
          status: 'completed' as const,
          progress: 100,
          htmlContent: slide.htmlContent
        }));

      } else if (slideDescriptions && Array.isArray(slideDescriptions)) {
        console.log('🔄 SEQUENTIAL API: Falling back to adaptive generation from descriptions');
        
        // Fallback: Generate adaptive slides from descriptions
        const contentText = slideDescriptions.map(desc => 
          `${desc.title}: ${desc.description}`
        ).join('\n\n');
        
        generatedSlides = await slideGenerationService.generateAdaptiveSlides(
          contentText,
          slideDescriptions.length,
          topic || 'general topic',
          age || '6-8 years',
          {
            sessionId: tempSessionId,
            useTemporaryStorage: tempStorageOptions?.useTemporaryStorage ?? true
          }
        );

        currentProgress = generatedSlides.map((slide, index) => ({
          slideNumber: index + 1,
          title: slide.title,
          status: 'completed' as const,
          progress: 100,
          htmlContent: slide.htmlContent
        }));

      } else {
        return NextResponse.json(
          { error: 'Either planText or slideDescriptions array is required' },
          { status: 400 }
        );
      }

      // Send progress updates via SSE
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          progress: currentProgress,
          completed: generatedSlides.length,
          total: generatedSlides.length
        });
      }

      console.log(`✅ SEQUENTIAL API: Successfully generated ${generatedSlides.length} slides`);

      // Images are now processed within GeminiContentService.generateSlideContent()
      // No need for additional processing here
      console.log('✅ SEQUENTIAL API: Slides generated with images already processed');

      const finalLesson = {
        ...lesson,
        slides: generatedSlides,
        tempSessionId,
        updatedAt: new Date()
      };

      // Send completion notification
      if (sessionId) {
        sendCompletion(sessionId, {
          lesson: finalLesson,
          message: `Successfully generated ${generatedSlides.length} slides with temporary storage!`
        });
      }

      return NextResponse.json({
        success: true,
        lesson: finalLesson,
        message: `Successfully generated ${generatedSlides.length} slides using content-driven approach!`,
        generationStats: {
          totalSlides: generatedSlides.length,
          completedSlides: generatedSlides.length,
          approach: planText ? 'content-driven' : 'adaptive',
          tempStorageUsed: tempStorageOptions?.useTemporaryStorage ?? true
        },
        tempSessionId
      });

    } catch (generationError) {
      console.error('❌ SEQUENTIAL API: Error during generation:', generationError);
      
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          progress: currentProgress.map(p => ({ ...p, status: 'error' as const })),
          error: 'Generation failed'
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to generate slides',
        details: generationError instanceof Error ? generationError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ SEQUENTIAL API: Request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Invalid request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

// Optional: GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'Sequential Slide Generation API',
    status: 'available',
    features: ['sequential-generation', 'rate-limited', 'stable-ordering', 'progress-tracking']
  });
} 