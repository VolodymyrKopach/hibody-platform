/**
 * CLIENT-SIDE Image Generation Service for Worksheets
 * Generates images directly from browser using Together AI API
 * 
 * ⚠️ WARNING: This exposes API key to client. Use only for internal tools.
 */

import { ParsedWorksheet, ParsedPage } from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';

export interface ImageGenerationProgress {
  total: number;
  completed: number;
  current?: string; // Current image being generated
  errors: string[];
}

export interface ImageGenerationResult {
  success: boolean;
  worksheet: ParsedWorksheet;
  stats: {
    totalImages: number;
    generated: number;
    failed: number;
    duration: number; // ms
  };
  errors: string[];
}

export class WorksheetImageGenerationService {
  private togetherApiKey: string | null = null;
  
  constructor(apiKey?: string) {
    // API key може бути переданий напряму або взятий з env
    this.togetherApiKey = apiKey || process.env.NEXT_PUBLIC_TOGETHER_API_KEY || null;
  }

  /**
   * Generate images for entire worksheet
   */
  async generateImagesForWorksheet(
    worksheet: ParsedWorksheet,
    onProgress?: (progress: ImageGenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    console.log('🎨 [WorksheetImageGen] Starting image generation for worksheet');
    
    const startTime = Date.now();
    const errors: string[] = [];
    let totalImages = 0;
    let generated = 0;
    let failed = 0;

    // Count total images needed
    worksheet.pages.forEach(page => {
      page.elements.forEach(element => {
        if (element.type === 'image-placeholder' && element.properties?.imagePrompt) {
          totalImages++;
        }
      });
    });

    console.log(`📊 [WorksheetImageGen] Found ${totalImages} images to generate`);

    if (totalImages === 0) {
      return {
        success: true,
        worksheet,
        stats: { totalImages: 0, generated: 0, failed: 0, duration: 0 },
        errors: [],
      };
    }

    // Process each page
    const updatedPages: ParsedPage[] = [];
    
    for (const page of worksheet.pages) {
      const updatedElements = await this.generateImagesForElements(
        page.elements,
        {
          onProgress: (current) => {
            onProgress?.({
              total: totalImages,
              completed: generated + failed,
              current,
              errors,
            });
          },
          onSuccess: () => generated++,
          onError: (error) => {
            failed++;
            errors.push(error);
          },
        }
      );

      updatedPages.push({
        ...page,
        elements: updatedElements,
      });
    }

    const duration = Date.now() - startTime;

    console.log(`✅ [WorksheetImageGen] Completed:`, {
      totalImages,
      generated,
      failed,
      duration: `${duration}ms`,
    });

    return {
      success: failed === 0,
      worksheet: {
        ...worksheet,
        pages: updatedPages,
      },
      stats: {
        totalImages,
        generated,
        failed,
        duration,
      },
      errors,
    };
  }

  /**
   * Generate images for array of elements
   */
  private async generateImagesForElements(
    elements: CanvasElement[],
    callbacks: {
      onProgress?: (current: string) => void;
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<CanvasElement[]> {
    const updatedElements: CanvasElement[] = [];

    for (const element of elements) {
      if (element.type === 'image-placeholder' && element.properties?.imagePrompt) {
        callbacks.onProgress?.(element.properties.caption || 'Generating image...');

        try {
          // Try to generate with retries (3 attempts total)
          const imageUrl = await this.generateSingleImageWithRetry(
            element.properties.imagePrompt,
            element.properties.width || 400,
            element.properties.height || 300,
            3 // maxAttempts
          );

          updatedElements.push({
            ...element,
            properties: {
              ...element.properties,
              url: imageUrl, // Replace with generated image
            },
          });

          callbacks.onSuccess?.();
        } catch (error) {
          console.error('❌ [WorksheetImageGen] Failed to generate image after retries:', error);
          callbacks.onError?.(
            `Failed to generate: ${element.properties.caption || 'image'}`
          );

          // Keep element without image
          updatedElements.push(element);
        }
      } else {
        updatedElements.push(element);
      }
    }

    return updatedElements;
  }

  /**
   * Generate single image with retry logic
   */
  private async generateSingleImageWithRetry(
    prompt: string,
    width: number,
    height: number,
    maxAttempts: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 [WorksheetImageGen] Attempt ${attempt}/${maxAttempts} for image generation`);
        
        const imageUrl = await this.generateSingleImage(prompt, width, height);
        
        if (attempt > 1) {
          console.log(`✅ [WorksheetImageGen] Successfully generated on attempt ${attempt}`);
        }
        
        return imageUrl;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ [WorksheetImageGen] Attempt ${attempt}/${maxAttempts} failed:`, error);

        // Don't wait after the last attempt
        if (attempt < maxAttempts) {
          const waitTime = attempt * 1000; // 1s, 2s between retries
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All attempts failed
    throw new Error(`Failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generate single image via Flux API (CLIENT-SIDE)
   */
  private async generateSingleImage(
    prompt: string,
    width: number,
    height: number
  ): Promise<string> {
    if (!this.togetherApiKey) {
      throw new Error('Together API key not configured');
    }

    console.log('🎨 [TogetherAPI] Generating image:', {
      prompt: prompt.substring(0, 50) + '...',
      dimensions: `${width}x${height}`,
    });

    // Adjust dimensions for Flux (multiples of 16)
    const adjustedWidth = Math.round(width / 16) * 16;
    const adjustedHeight = Math.round(height / 16) * 16;
    const finalWidth = Math.max(256, Math.min(2048, adjustedWidth));
    const finalHeight = Math.max(256, Math.min(2048, adjustedHeight));

    // Enhance prompt for educational content
    const enhancedPrompt = this.enhanceEducationalPrompt(prompt);

    try {
      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.togetherApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'black-forest-labs/FLUX.1-schnell',
          prompt: enhancedPrompt,
          width: finalWidth,
          height: finalHeight,
          steps: 4, // Fast generation
          n: 1,
          response_format: 'b64_json',
          guidance_scale: 3.5,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Flux API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error('No image data in Flux response');
      }

      // Convert base64 to data URL
      const imageDataUrl = `data:image/png;base64,${data.data[0].b64_json}`;

      console.log('✅ [FluxAPI] Image generated successfully');

      return imageDataUrl;
    } catch (error) {
      console.error('❌ [FluxAPI] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Enhance prompt for educational content
   */
  private enhanceEducationalPrompt(prompt: string): string {
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
    const hasEducational = educationalModifiers.some(term =>
      prompt.toLowerCase().includes(term.toLowerCase())
    );

    if (hasEducational) {
      return `${prompt}, ${technicalModifiers.slice(0, 2).join(', ')}`;
    }

    return `${prompt}, ${educationalModifiers.slice(0, 2).join(', ')}, ${technicalModifiers.slice(0, 2).join(', ')}`;
  }
}

// Singleton instance (можна створити з API key)
export const worksheetImageGenerationService = new WorksheetImageGenerationService();
