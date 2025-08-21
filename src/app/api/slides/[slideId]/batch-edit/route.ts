import { NextRequest, NextResponse } from 'next/server';
import { BatchSlideEditingService } from '@/services/chat/services/BatchSlideEditingService';
import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { SlideService } from '@/services/database/SlideService';

// Initialize services
const batchEditingService = new BatchSlideEditingService();
const simpleEditService = new GeminiSimpleEditService();
const slideService = new SlideService();

// POST /api/slides/[slideId]/batch-edit - Edit individual slide in batch
export async function POST(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    const { slideId } = await params;
    const body = await request.json();
    
    // Validate required fields
    const { batchId, slideIndex, editInstruction, topic, age } = body;
    
    if (!batchId || !editInstruction) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: batchId, editInstruction'
      }, { status: 400 });
    }

    console.log(`🔧 [API] Editing slide ${slideId} in batch ${batchId}`);
    console.log(`📝 [API] Instruction: "${editInstruction}"`);

    const startTime = Date.now();

    try {
      // Get slide from database
      const slide = await slideService.getSlideById(slideId);
      if (!slide) {
        return NextResponse.json({
          success: false,
          error: 'Slide not found'
        }, { status: 404 });
      }

      // Edit slide using GeminiSimpleEditService
      const editedHTML = await simpleEditService.editSlide(
        slide.html_content || '',
        editInstruction,
        topic || 'lesson',
        age || '6-8 years'
      );

      // Update slide in database
      const updatedSlide = await slideService.updateSlide(slideId, {
        html_content: editedHTML,
        updated_at: new Date()
      });

      const editingTime = Date.now() - startTime;

      // Record result in batch service
      const result = await batchEditingService.editSlideInBatch(
        slideId,
        batchId,
        slideIndex || 0
      );

      console.log(`✅ [API] Successfully edited slide ${slideId} in ${editingTime}ms`);

      return NextResponse.json({
        success: true,
        result: {
          slideId,
          slideIndex: slideIndex || 0,
          success: true,
          editingTime,
          updatedSlide: {
            id: updatedSlide.id,
            title: updatedSlide.title,
            htmlContent: updatedSlide.html_content,
            updatedAt: updatedSlide.updated_at
          }
        },
        message: `Slide ${slideIndex || slideId} edited successfully`
      });

    } catch (editError) {
      const editingTime = Date.now() - startTime;
      
      console.error(`❌ [API] Error editing slide ${slideId}:`, editError);

      // Record failure in batch service
      await batchEditingService.editSlideInBatch(slideId, batchId, slideIndex || 0);

      return NextResponse.json({
        success: false,
        result: {
          slideId,
          slideIndex: slideIndex || 0,
          success: false,
          error: editError instanceof Error ? editError.message : 'Edit failed',
          editingTime
        },
        error: `Failed to edit slide: ${editError instanceof Error ? editError.message : 'Unknown error'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error(`❌ [API] Batch slide edit error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
