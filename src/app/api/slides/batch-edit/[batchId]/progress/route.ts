import { NextRequest, NextResponse } from 'next/server';
import { BatchSlideEditingService } from '@/services/chat/services/BatchSlideEditingService';

// Initialize batch editing service (in production, this would be a singleton)
const batchEditingService = new BatchSlideEditingService();

// GET /api/slides/batch-edit/[batchId]/progress - Get batch editing progress
export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = await params;
    
    if (!batchId) {
      return NextResponse.json({
        success: false,
        error: 'Batch ID is required'
      }, { status: 400 });
    }

    console.log(`📊 [API] Getting progress for batch ${batchId}`);

    // Get batch progress
    const progress = await batchEditingService.getBatchProgress(batchId);

    return NextResponse.json({
      success: true,
      progress: {
        batchId: progress.batchId,
        completed: progress.completed,
        total: progress.total,
        currentSlide: progress.currentSlide,
        status: progress.status,
        estimatedTimeRemaining: progress.estimatedTimeRemaining,
        results: progress.results || []
      }
    });

  } catch (error) {
    console.error(`❌ [API] Progress fetch error for batch:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'Batch not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE /api/slides/batch-edit/[batchId]/progress - Cancel batch editing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = await params;
    
    if (!batchId) {
      return NextResponse.json({
        success: false,
        error: 'Batch ID is required'
      }, { status: 400 });
    }

    console.log(`🛑 [API] Cancelling batch ${batchId}`);

    // Cancel batch editing
    const cancelled = await batchEditingService.cancelBatchEdit(batchId);

    if (!cancelled) {
      return NextResponse.json({
        success: false,
        error: 'Batch not found or already completed'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Batch ${batchId} cancelled successfully`
    });

  } catch (error) {
    console.error(`❌ [API] Batch cancel error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
