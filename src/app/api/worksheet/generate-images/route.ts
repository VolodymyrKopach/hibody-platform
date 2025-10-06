import { NextRequest, NextResponse } from 'next/server';

/**
 * Batch Image Generation API for Worksheets
 * Generates multiple images in parallel on the server
 * This endpoint is secure - API key is never exposed to client
 */

interface ImageGenerationRequest {
  prompt: string;
  width: number;
  height: number;
  id?: string; // Optional identifier to match request/response
}

interface ImageGenerationResult {
  id?: string;
  success: boolean;
  image?: string; // base64
  error?: string;
  prompt?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Enhance prompt for educational content
 */
function enhanceEducationalPrompt(originalPrompt: string): string {
  const educationalModifiers = [
    'educational content',
    'child-friendly',
    'safe for children',
    'bright and engaging',
  ];
  
  const technicalModifiers = [
    'professional digital art',
    'vibrant colors',
    'sharp focus',
    'highly detailed',
  ];
  
  // Check if already has educational terms
  const hasEducationalTerms = educationalModifiers.some(term => 
    originalPrompt.toLowerCase().includes(term.toLowerCase())
  );
  
  if (hasEducationalTerms) {
    return `${originalPrompt}, ${technicalModifiers.slice(0, 2).join(', ')}`;
  }
  
  return `${originalPrompt}, ${educationalModifiers.slice(0, 2).join(', ')}, ${technicalModifiers.slice(0, 2).join(', ')}`;
}

/**
 * Generate single image via FLUX API
 */
async function generateSingleImage(
  prompt: string,
  width: number,
  height: number
): Promise<{ success: boolean; image?: string; error?: string; dimensions?: { width: number; height: number } }> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY not configured');
    }

    // Adjust dimensions for FLUX (multiples of 16)
    const adjustedWidth = Math.round(width / 16) * 16;
    const adjustedHeight = Math.round(height / 16) * 16;
    const finalWidth = Math.max(256, Math.min(2048, adjustedWidth));
    const finalHeight = Math.max(256, Math.min(2048, adjustedHeight));

    // Enhance prompt
    const enhancedPrompt = enhanceEducationalPrompt(prompt);

    console.log(`🎨 [BatchImageGen] Generating: ${prompt.substring(0, 50)}... (${finalWidth}x${finalHeight})`);

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: enhancedPrompt,
        width: finalWidth,
        height: finalHeight,
        steps: 4,
        n: 1,
        response_format: 'b64_json',
        guidance_scale: 3.5,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`FLUX API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error('No image data in response');
    }

    return {
      success: true,
      image: data.data[0].b64_json,
      dimensions: {
        width: finalWidth,
        height: finalHeight,
      },
    };
  } catch (error) {
    console.error('❌ [BatchImageGen] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate single image with retry logic
 */
async function generateWithRetry(
  prompt: string,
  width: number,
  height: number,
  maxAttempts: number = 3
): Promise<{ success: boolean; image?: string; error?: string; dimensions?: { width: number; height: number } }> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await generateSingleImage(prompt, width, height);
    
    if (result.success) {
      if (attempt > 1) {
        console.log(`✅ [BatchImageGen] Success on attempt ${attempt}/${maxAttempts}`);
      }
      return result;
    }

    lastError = result.error;
    console.warn(`⚠️ [BatchImageGen] Attempt ${attempt}/${maxAttempts} failed:`, lastError);

    // Wait before retry (except on last attempt)
    if (attempt < maxAttempts) {
      const waitTime = attempt * 1000; // 1s, 2s
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return {
    success: false,
    error: lastError || 'All retry attempts failed',
  };
}

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

    // Generate all images in parallel with retry logic
    const results = await Promise.all(
      images.map(async (img): Promise<ImageGenerationResult> => {
        const result = await generateWithRetry(
          img.prompt,
          img.width || 512,
          img.height || 512,
          3 // maxAttempts
        );

        return {
          id: img.id,
          success: result.success,
          image: result.image,
          error: result.error,
          prompt: img.prompt,
          dimensions: result.dimensions,
        };
      })
    );

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
