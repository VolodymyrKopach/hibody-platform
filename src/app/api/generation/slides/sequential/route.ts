import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/chat/ChatService';
import { SlideDescription, SimpleLesson, SimpleSlide, SlideGenerationProgress } from '@/types/chat';
import { sendProgressUpdate, sendCompletion } from '../progress/route';

export async function POST(request: NextRequest) {
  try {
    const { slideDescriptions, lesson, topic, age, sessionId } = await request.json();

    console.log('🎨 SEQUENTIAL API: Starting sequential slide generation...');
    console.log('📋 SEQUENTIAL API: Request details:', {
      slideCount: slideDescriptions?.length || 0,
      lesson: lesson?.title || 'Unknown',
      topic,
      age,
      sessionId
    });

    if (!slideDescriptions || !Array.isArray(slideDescriptions)) {
      return NextResponse.json(
        { error: 'slideDescriptions array is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Initialize the chat service for sequential generation
    const chatService = new ChatService();

    // Prepare lesson object
    const lessonObject: SimpleLesson = {
      id: lesson?.id || `lesson_${Date.now()}`,
      title: lesson?.title || 'Generated Lesson',
      description: lesson?.description || `Lesson about ${topic}`,
      subject: 'General',
      ageGroup: age || '8-9 років',
      duration: 30,
      slides: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'ai-chat'
    };

    // Track progress state
    let currentProgress: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
      slideNumber: desc.slideNumber,
      title: desc.title,
      status: 'pending',
      progress: 0
    }));

    // Generate slides with progress tracking
    const result = await chatService.generateAllSlides(
      slideDescriptions,
      topic || 'загальна тема',
      age || '8-9 років',
      (progress: SlideGenerationProgress[]) => {
        // Update progress state
        currentProgress = progress;
        console.log('📊 SEQUENTIAL API: Progress update:', progress);
        
        // Send progress update via SSE if sessionId provided
        if (sessionId) {
          sendProgressUpdate(sessionId, {
            progress: progress,
            lesson: lessonObject,
            currentSlide: progress.find(p => p.status === 'generating'),
            totalSlides: slideDescriptions.length,
            completedSlides: progress.filter(p => p.status === 'completed').length
          });
        }
      },
      (slide: SimpleSlide, allSlides: SimpleSlide[]) => {
        // === ДОДАЄМО СЛАЙД ДО УРОКУ ВІДРАЗУ ===
        lessonObject.slides = [...allSlides];
        lessonObject.updatedAt = new Date();
        
        console.log(`✅ SEQUENTIAL API: Slide "${slide.title}" ready, total slides now: ${lessonObject.slides.length}`);
        
        // === ВІДПРАВЛЯЄМО ОНОВЛЕНИЙ УРОК ЧЕРЕЗ SSE ===
        if (sessionId) {
          sendProgressUpdate(sessionId, {
            progress: currentProgress,
            lesson: lessonObject,
            currentSlide: currentProgress.find(p => p.status === 'generating'),
            totalSlides: slideDescriptions.length,
            completedSlides: lessonObject.slides.length,
            newSlide: slide  // Додаємо інформацію про новий слайд
          });
        }
      }
    );

    // Final update - ensure all slides are in lesson
    lessonObject.slides = result.slides;
    lessonObject.updatedAt = new Date();

    console.log('✅ SEQUENTIAL API: Generation completed successfully');
    console.log(`📊 SEQUENTIAL API: ${result.completedSlides}/${result.totalSlides} slides generated`);

    // Send completion message via SSE
    if (sessionId) {
      sendCompletion(sessionId, {
        lesson: lessonObject,
        statistics: {
          totalSlides: result.totalSlides,
          completedSlides: result.completedSlides,
          failedSlides: result.failedSlides,
          generationTime: result.generationTime
        },
        finalProgress: currentProgress
      });
    }

    return NextResponse.json({
      success: true,
      lesson: lessonObject,
      message: `Generated ${result.completedSlides} slides sequentially`,
      finalProgress: currentProgress,
      statistics: {
        totalSlides: result.totalSlides,
        completedSlides: result.completedSlides,
        failedSlides: result.failedSlides,
        generationTime: result.generationTime,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ SEQUENTIAL API: Error during sequential generation:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate slides sequentially',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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