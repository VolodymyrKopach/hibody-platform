import { NextRequest, NextResponse } from 'next/server';
import { SlideGenerationService } from '@/services/chat/services/SlideGenerationService';
import { SlideDescription, SimpleLesson, SimpleSlide, SlideGenerationProgress } from '@/types/chat';
import { sendProgressUpdate, sendCompletion } from '../progress/route';
import { getThumbnailService } from '@/services/thumbnails/PuppeteerThumbnailService';

export async function POST(request: NextRequest) {
  try {
    const { slideDescriptions, lesson, topic, age, sessionId, planText } = await request.json();

    console.log('🎨 SEQUENTIAL API: Starting content-driven slide generation...');
    console.log('📋 SEQUENTIAL API: Request details:', {
      slideCount: slideDescriptions?.length || 0,
      lesson: lesson?.title || 'Unknown',
      topic,
      age,
      sessionId,
      hasPlanText: !!planText
    });

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
          age || '6-8 years'
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
          age || '6-8 years'
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

      // Generate thumbnails for all slides
      console.log('🖼️ SEQUENTIAL API: Generating thumbnails for all slides...');
      const thumbnailService = getThumbnailService();
      
      const slidesWithThumbnails = await Promise.all(
        generatedSlides.map(async (slide) => {
          try {
            const thumbnailResult = await thumbnailService.generateThumbnail(
              slide.htmlContent,
              {
                width: 1600,
                height: 1200,
                quality: 90,
                format: 'png',
                background: '#ffffff'
              }
            );

            if (thumbnailResult.success) {
              console.log(`✅ SEQUENTIAL API: Thumbnail generated for slide ${slide.id}`);
              return {
                ...slide,
                thumbnail: thumbnailResult.thumbnail,
                thumbnailMetadata: thumbnailResult.metadata
              };
            } else {
              console.warn(`⚠️ SEQUENTIAL API: Thumbnail generation failed for slide ${slide.id}:`, thumbnailResult.error);
              return slide;
            }
          } catch (error) {
            console.error(`❌ SEQUENTIAL API: Error generating thumbnail for slide ${slide.id}:`, error);
            return slide;
          }
        })
      );

      console.log(`✅ SEQUENTIAL API: Thumbnail generation completed for ${slidesWithThumbnails.length} slides`);

      // Send completion notification
      if (sessionId) {
        sendCompletion(sessionId, {
          lesson: {
            ...lesson,
            slides: slidesWithThumbnails,
            updatedAt: new Date()
          },
          message: `Successfully generated ${generatedSlides.length} slides from lesson content!`
        });
      }

      return NextResponse.json({
        success: true,
        lesson: {
          ...lesson,
          slides: slidesWithThumbnails,
          updatedAt: new Date()
        },
        message: `Successfully generated ${generatedSlides.length} slides using content-driven approach!`,
        generationStats: {
          totalSlides: generatedSlides.length,
          completedSlides: generatedSlides.length,
          approach: planText ? 'content-driven' : 'adaptive'
        }
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