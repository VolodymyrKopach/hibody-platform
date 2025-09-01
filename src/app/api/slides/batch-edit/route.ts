import { NextRequest, NextResponse } from 'next/server';
import { OptimizedBatchEditService } from '@/services/slides/OptimizedBatchEditService';
import { BatchEditPlan } from '@/types/chat';

// Note: Using OptimizedBatchEditService instead of deprecated BatchSlideEditingService

// POST /api/slides/batch-edit - Start batch editing operation
// NOTE: This API is deprecated - use OptimizedBatchEditService directly in frontend
export async function POST(request: NextRequest) {
  try {
    console.warn('⚠️ /api/slides/batch-edit is deprecated - use OptimizedBatchEditService directly');
    
    const body = await request.json();
    
    // Validate required fields
    const { lessonId, slideNumbers, editInstruction, sessionId, topic, age } = body;
    
    if (!lessonId || !slideNumbers || !editInstruction) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: lessonId, slideNumbers, editInstruction'
      }, { status: 400 });
    }

    if (!Array.isArray(slideNumbers) || slideNumbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'slideNumbers must be a non-empty array'
      }, { status: 400 });
    }

    // Prepare batch edit parameters
    const params: BatchEditParams = {
      lessonId,
      slideNumbers,
      editInstruction,
      sessionId: sessionId || `session_${Date.now()}`,
      topic: topic || 'lesson',
      age: age || '6-8 years'
    };

    console.log(`🚀 [API] Starting batch edit for lesson ${lessonId}`);
    console.log(`📝 [API] Slides: ${slideNumbers.join(', ')}`);
    console.log(`🔧 [API] Instruction: "${editInstruction}"`);

    // Start batch editing
    const session = await batchEditingService.startBatchEdit(params);

    return NextResponse.json({
      success: true,
      batchId: session.batchId,
      progressEndpoint: `/api/slides/batch-edit/${session.batchId}/progress`,
      estimatedTime: session.totalSlides * 30, // 30 seconds per slide
      message: `Started batch editing of ${slideNumbers.length} slides`,
      session: {
        batchId: session.batchId,
        totalSlides: session.totalSlides,
        status: session.status,
        createdAt: session.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [API] Batch edit start error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
