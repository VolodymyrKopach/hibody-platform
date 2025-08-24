/**
 * === SOLID: SRP - Optimized Single Slide Edit API ===
 * 
 * Endpoint for editing individual slides with minimal context
 * Designed for cost-efficient batch operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { getThumbnailUpdateService } from '@/services/slides/ThumbnailUpdateService';

// === SOLID: ISP - Request interface ===
interface SlideEditRequest {
  instruction: string;
  slideContent: string; // Only the HTML content of this specific slide
  topic?: string;
  age?: string;
  batchId?: string; // For tracking batch operations
  slideIndex?: number; // For progress tracking
}

// === SOLID: ISP - Response interface ===
interface SlideEditResponse {
  success: boolean;
  editedContent?: string;
  thumbnailUrl?: string;
  editingTime?: number;
  error?: string;
  slideId: string;
  batchId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  const startTime = Date.now();
  
  try {
    const { slideId } = params;
    const body: SlideEditRequest = await request.json();
    
    const {
      instruction,
      slideContent,
      topic = 'lesson',
      age = '6-8 years',
      batchId,
      slideIndex
    } = body;

    console.log(`🔧 [SLIDE EDIT API] Editing slide ${slideId}`);
    console.log(`📝 [SLIDE EDIT API] Instruction: "${instruction}"`);
    console.log(`📊 [SLIDE EDIT API] Content length: ${slideContent.length} chars`);
    if (batchId) {
      console.log(`🔄 [SLIDE EDIT API] Batch ID: ${batchId}, Index: ${slideIndex}`);
    }

    // Validate required fields
    if (!instruction || !slideContent) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: instruction and slideContent',
        slideId,
        batchId
      } as SlideEditResponse, { status: 400 });
    }

    // Initialize editing service
    const editService = new GeminiSimpleEditService();
    
    // Edit the slide with minimal context (only this slide's content)
    console.log(`🤖 [SLIDE EDIT API] Starting Gemini edit for slide ${slideId}`);
    const editedContent = await editService.editSlide(
      slideContent,
      instruction,
      topic,
      age
    );

    console.log(`✅ [SLIDE EDIT API] Edit completed for slide ${slideId}`);
    console.log(`📏 [SLIDE EDIT API] Result length: ${editedContent.length} chars`);

    // Generate thumbnail (only on client-side)
    let thumbnailUrl = '';
    if (typeof document !== 'undefined') {
      try {
        console.log(`🎨 [SLIDE EDIT API] Generating thumbnail for slide ${slideId}`);
        const thumbnailService = getThumbnailUpdateService();
        thumbnailUrl = await thumbnailService.regenerateThumbnail(
          slideId,
          editedContent,
          { forceRegenerate: true, fast: true }
        );
        console.log(`✅ [SLIDE EDIT API] Thumbnail generated for slide ${slideId}`);
      } catch (error) {
        console.error(`❌ [SLIDE EDIT API] Thumbnail generation failed for slide ${slideId}:`, error);
        // Don't fail the entire operation for thumbnail issues
      }
    } else {
      console.log(`💻 [SLIDE EDIT API] Server-side: Skipping thumbnail generation for slide ${slideId}`);
    }

    const editingTime = Date.now() - startTime;
    console.log(`⏱️ [SLIDE EDIT API] Total editing time: ${editingTime}ms`);

    const response: SlideEditResponse = {
      success: true,
      editedContent,
      thumbnailUrl,
      editingTime,
      slideId,
      batchId
    };

    return NextResponse.json(response);

  } catch (error) {
    const editingTime = Date.now() - startTime;
    console.error(`❌ [SLIDE EDIT API] Error editing slide ${params.slideId}:`, error);

    const response: SlideEditResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      editingTime,
      slideId: params.slideId
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// === SOLID: OCP - GET method for slide info (extensible) ===
export async function GET(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    const { slideId } = params;
    
    // This could be extended to return slide metadata, editing history, etc.
    return NextResponse.json({
      slideId,
      endpoint: `/api/slides/${slideId}/edit`,
      methods: ['POST'],
      description: 'Edit individual slide with optimized context'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get slide info'
    }, { status: 500 });
  }
}
