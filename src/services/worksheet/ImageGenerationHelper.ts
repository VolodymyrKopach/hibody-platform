/**
 * Server-side helper for image generation
 * Shared between API endpoints to avoid circular fetch calls
 */

/**
 * Image generation request
 */
export interface ImageGenerationRequest {
  id?: string;
  prompt: string;
  width: number;
  height: number;
}

/**
 * Image generation result
 */
export interface ImageGenerationResult {
  id?: string;
  success: boolean;
  image?: string; // base64
  error?: string;
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

    console.log(`🎨 [ImageGenHelper] Generating: ${prompt.substring(0, 50)}... (${finalWidth}x${finalHeight})`);

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
    console.error('❌ [ImageGenHelper] Error:', error);
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
        console.log(`✅ [ImageGenHelper] Success on attempt ${attempt}/${maxAttempts}`);
      }
      return result;
    }

    lastError = result.error;
    console.warn(`⚠️ [ImageGenHelper] Attempt ${attempt}/${maxAttempts} failed:`, lastError);

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

/**
 * Generate multiple images in parallel
 */
export async function generateImages(
  requests: ImageGenerationRequest[]
): Promise<ImageGenerationResult[]> {
  if (requests.length === 0) {
    return [];
  }

  console.log(`🚀 [ImageGenHelper] Generating ${requests.length} images in parallel...`);
  const startTime = Date.now();

  // Generate all images in parallel with retry logic
  const results = await Promise.all(
    requests.map(async (req): Promise<ImageGenerationResult> => {
      const result = await generateWithRetry(
        req.prompt,
        req.width || 512,
        req.height || 512,
        3 // maxAttempts
      );

      return {
        id: req.id,
        success: result.success,
        image: result.image,
        error: result.error,
        dimensions: result.dimensions,
      };
    })
  );

  const duration = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ [ImageGenHelper] Completed in ${duration}ms: ${successful} success, ${failed} failed`);

  return results;
}

/**
 * Generate single image (convenience method)
 */
export async function generateSingleImageHelper(
  prompt: string,
  width: number = 512,
  height: number = 512
): Promise<ImageGenerationResult> {
  const results = await generateImages([{ prompt, width, height }]);
  return results[0];
}

