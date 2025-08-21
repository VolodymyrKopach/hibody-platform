/**
 * === SOLID: SRP - Thumbnail Update Service ===
 * 
 * Service responsible for regenerating thumbnails when slides are edited
 */

import { SimpleSlide } from '@/types/chat';
import { LocalThumbnailStorage, getLocalThumbnailStorage } from './LocalThumbnailService';
import { generateSlideThumbnail, SlidePreviewOptions } from '@/utils/slidePreview';

// === SOLID: ISP - Interface for thumbnail updates ===
export interface IThumbnailUpdateService {
  regenerateThumbnail(slideId: string, htmlContent: string, options?: ThumbnailUpdateOptions): Promise<string>;
  regenerateMultipleThumbnails(slides: Array<{ id: string; htmlContent: string }>): Promise<Record<string, string>>;
  invalidateThumbnail(slideId: string): void;
  getThumbnailUrl(slideId: string): string | null;
}

export interface ThumbnailUpdateOptions {
  quality?: number;
  background?: string;
  fast?: boolean;
  forceRegenerate?: boolean;
}

// === SOLID: SRP - Thumbnail Update Service Implementation ===
export class ThumbnailUpdateService implements IThumbnailUpdateService {
  private localThumbnailStorage: LocalThumbnailStorage;
  private regenerationQueue = new Set<string>();

  constructor() {
    this.localThumbnailStorage = getLocalThumbnailStorage();
  }

  /**
   * Regenerate thumbnail for a single slide
   */
  async regenerateThumbnail(
    slideId: string, 
    htmlContent: string, 
    options: ThumbnailUpdateOptions = {}
  ): Promise<string> {
    console.log(`🔄 [THUMBNAIL UPDATE] Regenerating thumbnail for slide ${slideId}`);

    // Check if we're running on server-side
    if (typeof document === 'undefined') {
      console.log(`⚠️ [THUMBNAIL UPDATE] Server-side thumbnail generation not supported, skipping for slide ${slideId}`);
      // Return empty string for server-side to avoid breaking the editing flow
      return '';
    }

    // Prevent duplicate regeneration
    if (this.regenerationQueue.has(slideId)) {
      console.log(`⏳ [THUMBNAIL UPDATE] Slide ${slideId} already in regeneration queue`);
      // Wait for existing regeneration to complete
      while (this.regenerationQueue.has(slideId)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.getThumbnailUrl(slideId) || '';
    }

    this.regenerationQueue.add(slideId);

    try {
      // Force invalidate existing thumbnail if requested
      if (options.forceRegenerate) {
        this.invalidateThumbnail(slideId);
      }

      // Prepare generation options
      const generationOptions: SlidePreviewOptions = {
        quality: options.quality || 0.85,
        background: options.background || '#ffffff',
        compress: true,
        embedFonts: false,
        fast: options.fast !== false, // Default to fast
      };

      console.log(`🎨 [THUMBNAIL UPDATE] Generating new thumbnail for slide ${slideId}`);
      
      // Generate new thumbnail
      const thumbnailUrl = await this.localThumbnailStorage.generateThumbnail(
        slideId, 
        htmlContent, 
        generationOptions
      );

      console.log(`✅ [THUMBNAIL UPDATE] Successfully regenerated thumbnail for slide ${slideId}`);
      return thumbnailUrl;

    } catch (error) {
      console.error(`❌ [THUMBNAIL UPDATE] Failed to regenerate thumbnail for slide ${slideId}:`, error);
      throw error;
    } finally {
      this.regenerationQueue.delete(slideId);
    }
  }

  /**
   * Regenerate thumbnails for multiple slides in parallel
   */
  async regenerateMultipleThumbnails(
    slides: Array<{ id: string; htmlContent: string }>
  ): Promise<Record<string, string>> {
    console.log(`🔄 [THUMBNAIL UPDATE] Regenerating thumbnails for ${slides.length} slides`);

    // Check if we're running on server-side
    if (typeof document === 'undefined') {
      console.log(`⚠️ [THUMBNAIL UPDATE] Server-side batch thumbnail generation not supported, skipping ${slides.length} slides`);
      // Return empty results for server-side
      const results: Record<string, string> = {};
      slides.forEach(slide => {
        results[slide.id] = '';
      });
      return results;
    }

    const results: Record<string, string> = {};
    const promises = slides.map(async (slide) => {
      try {
        const thumbnailUrl = await this.regenerateThumbnail(slide.id, slide.htmlContent, {
          forceRegenerate: true,
          fast: true
        });
        results[slide.id] = thumbnailUrl;
        return { slideId: slide.id, success: true, thumbnailUrl };
      } catch (error) {
        console.error(`❌ [THUMBNAIL UPDATE] Failed to regenerate thumbnail for slide ${slide.id}:`, error);
        results[slide.id] = '';
        return { slideId: slide.id, success: false, error };
      }
    });

    const outcomes = await Promise.allSettled(promises);
    const successful = outcomes.filter(outcome => 
      outcome.status === 'fulfilled' && outcome.value.success
    ).length;

    console.log(`📊 [THUMBNAIL UPDATE] Batch regeneration complete: ${successful}/${slides.length} successful`);
    return results;
  }

  /**
   * Invalidate (remove) thumbnail from cache
   */
  invalidateThumbnail(slideId: string): void {
    console.log(`🗑️ [THUMBNAIL UPDATE] Invalidating thumbnail for slide ${slideId}`);
    this.localThumbnailStorage.delete(slideId);
  }

  /**
   * Get current thumbnail URL from cache
   */
  getThumbnailUrl(slideId: string): string | null {
    return this.localThumbnailStorage.get(slideId);
  }

  /**
   * Check if thumbnail exists in cache
   */
  hasThumbnail(slideId: string): boolean {
    return this.localThumbnailStorage.has(slideId);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalThumbnails: number; cacheSize: string } {
    const stats = this.localThumbnailStorage.getStats();
    return {
      totalThumbnails: stats.totalThumbnails,
      cacheSize: `${Math.round(stats.totalSizeBytes / 1024)}KB`
    };
  }
}

// === SOLID: DIP - Factory for service creation ===
let thumbnailUpdateServiceInstance: ThumbnailUpdateService | null = null;

export function getThumbnailUpdateService(): ThumbnailUpdateService {
  if (!thumbnailUpdateServiceInstance) {
    thumbnailUpdateServiceInstance = new ThumbnailUpdateService();
  }
  return thumbnailUpdateServiceInstance;
}

// === SOLID: SRP - Utility functions ===

/**
 * Helper function to regenerate thumbnail for a slide after editing
 */
export async function regenerateSlideThumbail(slide: SimpleSlide): Promise<string> {
  const service = getThumbnailUpdateService();
  return await service.regenerateThumbnail(slide.id, slide.htmlContent || '', {
    forceRegenerate: true,
    fast: true
  });
}

/**
 * Helper function to batch regenerate thumbnails after batch editing
 */
export async function regenerateBatchThumbnails(slides: SimpleSlide[]): Promise<Record<string, string>> {
  const service = getThumbnailUpdateService();
  const slideData = slides.map(slide => ({
    id: slide.id,
    htmlContent: slide.htmlContent || ''
  }));
  
  return await service.regenerateMultipleThumbnails(slideData);
}
