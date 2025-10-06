/**
 * SERVER-SIDE Image Generation Service for Worksheets
 * Generates images via secure API endpoint
 * Uses batch processing for optimal performance
 * 
 * ✅ SECURE: API key never exposed to client
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

interface BatchImageRequest {
  prompt: string;
  width: number;
  height: number;
  id?: string;
}

interface BatchImageResult {
  id?: string;
  success: boolean;
  image?: string;
  error?: string;
  prompt?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export class WorksheetImageGenerationService {
  constructor(apiKey?: string) {
    // API key parameter kept for backwards compatibility but not used
    // All generation now happens server-side via API endpoint
  }

  /**
   * Generate images for entire worksheet using batch API
   */
  async generateImagesForWorksheet(
    worksheet: ParsedWorksheet,
    onProgress?: (progress: ImageGenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    console.log('🎨 [WorksheetImageGen] Starting image generation for worksheet');
    
    const startTime = Date.now();
    const errors: string[] = [];

    // Collect all image requests from all pages
    const imageRequests: (BatchImageRequest & { pageIndex: number; elementIndex: number })[] = [];
    
    worksheet.pages.forEach((page, pageIndex) => {
      page.elements.forEach((element, elementIndex) => {
        if (element.type === 'image-placeholder' && element.properties?.imagePrompt) {
          imageRequests.push({
            id: `${pageIndex}-${elementIndex}`,
            prompt: element.properties.imagePrompt,
            width: element.properties.width || 512,
            height: element.properties.height || 512,
            pageIndex,
            elementIndex,
          });
        }
      });
    });

    const totalImages = imageRequests.length;
    console.log(`📊 [WorksheetImageGen] Found ${totalImages} images to generate`);

    if (totalImages === 0) {
      return {
        success: true,
        worksheet,
        stats: { totalImages: 0, generated: 0, failed: 0, duration: 0 },
        errors: [],
      };
    }

    // Report initial progress
    onProgress?.({
      total: totalImages,
      completed: 0,
      current: 'Starting batch generation...',
      errors: [],
    });

    try {
      // Call batch API endpoint
      console.log('🚀 [WorksheetImageGen] Calling batch API endpoint...');
      const response = await fetch('/api/worksheet/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imageRequests.map(req => ({
            id: req.id,
            prompt: req.prompt,
            width: req.width,
            height: req.height,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        results: BatchImageResult[];
        stats: { total: number; successful: number; failed: number; duration: number };
      };

      console.log('✅ [WorksheetImageGen] Batch generation completed:', data.stats);

      // Map results back to worksheet pages
      const updatedPages: ParsedPage[] = worksheet.pages.map(page => ({
        ...page,
        elements: [...page.elements],
      }));

      let generated = 0;
      let failed = 0;

      data.results.forEach((result, index) => {
        const request = imageRequests[index];
        const page = updatedPages[request.pageIndex];
        const element = page.elements[request.elementIndex];

        if (result.success && result.image) {
          // Update element with generated image
          page.elements[request.elementIndex] = {
            ...element,
            properties: {
              ...element.properties,
              url: `data:image/png;base64,${result.image}`,
            },
          };
          generated++;
        } else {
          // Keep placeholder, log error
          const errorMsg = result.error || 'Unknown error';
          errors.push(`${element.properties?.caption || 'Image'}: ${errorMsg}`);
          failed++;
        }

        // Report progress
        onProgress?.({
          total: totalImages,
          completed: generated + failed,
          current: element.properties?.caption || `Image ${generated + failed}/${totalImages}`,
          errors,
        });
      });

      const duration = Date.now() - startTime;

      console.log(`✅ [WorksheetImageGen] Final results:`, {
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

    } catch (error) {
      console.error('❌ [WorksheetImageGen] Batch generation failed:', error);
      
      return {
        success: false,
        worksheet,
        stats: {
          totalImages,
          generated: 0,
          failed: totalImages,
          duration: Date.now() - startTime,
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * PUBLIC: Generate single image via API
   * For cases when you need to generate just one image
   */
  async generateSingleImage(
    prompt: string,
    width: number,
    height: number
  ): Promise<string> {
    console.log('🎨 [WorksheetImageGen] Generating single image via API');

    try {
      const response = await fetch('/api/worksheet/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [{
            prompt,
            width,
            height,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        results: BatchImageResult[];
      };

      if (!data.success || !data.results || data.results.length === 0) {
        throw new Error('No results from API');
      }

      const result = data.results[0];
      
      if (!result.success || !result.image) {
        throw new Error(result.error || 'Generation failed');
      }

      return `data:image/png;base64,${result.image}`;
    } catch (error) {
      console.error('❌ [WorksheetImageGen] Single image generation failed:', error);
      throw error;
    }
  }
}

// Singleton instance (можна створити з API key)
export const worksheetImageGenerationService = new WorksheetImageGenerationService();
