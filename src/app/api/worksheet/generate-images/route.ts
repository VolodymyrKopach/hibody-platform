import { NextRequest, NextResponse } from 'next/server';
import { 
  generateImages,
  type ImageGenerationRequest,
  type ImageGenerationResult
} from '@/services/worksheet/ImageGenerationHelper';

/**
 * Batch Image Generation API for Worksheets
 * Generates multiple images in parallel on the server
 * This endpoint is secure - API key is never exposed to client
 */

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json() as { images: ImageGenerationRequest[] };

    console.log(`📋 [BatchImageGen] Received request for ${images?.length || 0} images`);

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Images array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!process.env.TOGETHER_API_KEY) {
      console.error('❌ [BatchImageGen] TOGETHER_API_KEY is missing!');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Validate each request
    for (const img of images) {
      if (!img.prompt) {
        return NextResponse.json(
          { success: false, error: 'Each image must have a prompt' },
          { status: 400 }
        );
      }
    }

    console.log(`🚀 [BatchImageGen] Starting parallel generation of ${images.length} images...`);
    const startTime = Date.now();

    // Use shared helper for generation
    const results = await generateImages(images);

    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ [BatchImageGen] Completed in ${duration}ms:`, {
      total: images.length,
      successful,
      failed,
    });

    return NextResponse.json({
      success: true,
      results,
      stats: {
        total: images.length,
        successful,
        failed,
        duration,
      },
    });

  } catch (error) {
    console.error('❌ [BatchImageGen] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
