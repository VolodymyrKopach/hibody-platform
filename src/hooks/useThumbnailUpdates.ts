/**
 * === SOLID: SRP - Thumbnail Updates Hook ===
 * 
 * Hook for managing thumbnail updates in UI components
 */

import { useState, useCallback, useEffect } from 'react';
import { getThumbnailUpdateService } from '@/services/slides/ThumbnailUpdateService';
import { SimpleSlide } from '@/types/chat';

export interface ThumbnailUpdateState {
  updatingThumbnails: Set<string>;
  thumbnailUrls: Record<string, string>;
  lastUpdated: Record<string, Date>;
}

export interface UseThumbnailUpdatesReturn {
  // State
  updatingThumbnails: Set<string>;
  thumbnailUrls: Record<string, string>;
  
  // Actions
  regenerateThumbnail: (slideId: string, htmlContent: string) => Promise<string>;
  regenerateMultipleThumbnails: (slides: Array<{ id: string; htmlContent: string }>) => Promise<void>;
  getThumbnailUrl: (slideId: string) => string | null;
  invalidateThumbnail: (slideId: string) => void;
  
  // Utilities
  isUpdating: (slideId: string) => boolean;
  getLastUpdated: (slideId: string) => Date | null;
}

/**
 * Hook for managing thumbnail updates
 */
export const useThumbnailUpdates = (): UseThumbnailUpdatesReturn => {
  const [state, setState] = useState<ThumbnailUpdateState>({
    updatingThumbnails: new Set(),
    thumbnailUrls: {},
    lastUpdated: {}
  });

  const thumbnailService = getThumbnailUpdateService();

  // Regenerate single thumbnail
  const regenerateThumbnail = useCallback(async (slideId: string, htmlContent: string): Promise<string> => {
    console.log(`🔄 [THUMBNAIL HOOK] Starting regeneration for slide ${slideId}`);
    
    // Mark as updating
    setState(prev => ({
      ...prev,
      updatingThumbnails: new Set(prev.updatingThumbnails).add(slideId)
    }));

    try {
      const thumbnailUrl = await thumbnailService.regenerateThumbnail(slideId, htmlContent, {
        forceRegenerate: true,
        fast: true
      });

      // Update state with new thumbnail
      setState(prev => ({
        ...prev,
        updatingThumbnails: new Set([...prev.updatingThumbnails].filter(id => id !== slideId)),
        thumbnailUrls: {
          ...prev.thumbnailUrls,
          [slideId]: thumbnailUrl
        },
        lastUpdated: {
          ...prev.lastUpdated,
          [slideId]: new Date()
        }
      }));

      console.log(`✅ [THUMBNAIL HOOK] Regenerated thumbnail for slide ${slideId}`);
      return thumbnailUrl;

    } catch (error) {
      console.error(`❌ [THUMBNAIL HOOK] Failed to regenerate thumbnail for slide ${slideId}:`, error);
      
      // Remove from updating set even on error
      setState(prev => ({
        ...prev,
        updatingThumbnails: new Set([...prev.updatingThumbnails].filter(id => id !== slideId))
      }));
      
      throw error;
    }
  }, [thumbnailService]);

  // Regenerate multiple thumbnails
  const regenerateMultipleThumbnails = useCallback(async (
    slides: Array<{ id: string; htmlContent: string }>
  ): Promise<void> => {
    console.log(`🔄 [THUMBNAIL HOOK] Starting batch regeneration for ${slides.length} slides`);
    
    const slideIds = slides.map(slide => slide.id);
    
    // Mark all as updating
    setState(prev => ({
      ...prev,
      updatingThumbnails: new Set([...prev.updatingThumbnails, ...slideIds])
    }));

    try {
      const results = await thumbnailService.regenerateMultipleThumbnails(slides);
      
      // Update state with all results
      setState(prev => {
        const newUpdatingThumbnails = new Set(prev.updatingThumbnails);
        const newThumbnailUrls = { ...prev.thumbnailUrls };
        const newLastUpdated = { ...prev.lastUpdated };
        
        slideIds.forEach(slideId => {
          newUpdatingThumbnails.delete(slideId);
          if (results[slideId]) {
            newThumbnailUrls[slideId] = results[slideId];
            newLastUpdated[slideId] = new Date();
          }
        });
        
        return {
          ...prev,
          updatingThumbnails: newUpdatingThumbnails,
          thumbnailUrls: newThumbnailUrls,
          lastUpdated: newLastUpdated
        };
      });

      const successful = Object.values(results).filter(url => url).length;
      console.log(`📊 [THUMBNAIL HOOK] Batch regeneration complete: ${successful}/${slides.length} successful`);

    } catch (error) {
      console.error(`❌ [THUMBNAIL HOOK] Batch regeneration failed:`, error);
      
      // Remove all from updating set on error
      setState(prev => ({
        ...prev,
        updatingThumbnails: new Set([...prev.updatingThumbnails].filter(id => !slideIds.includes(id)))
      }));
      
      throw error;
    }
  }, [thumbnailService]);

  // Get thumbnail URL from cache
  const getThumbnailUrl = useCallback((slideId: string): string | null => {
    // First check our hook state, then fall back to service
    return state.thumbnailUrls[slideId] || thumbnailService.getThumbnailUrl(slideId);
  }, [state.thumbnailUrls, thumbnailService]);

  // Invalidate thumbnail
  const invalidateThumbnail = useCallback((slideId: string): void => {
    console.log(`🗑️ [THUMBNAIL HOOK] Invalidating thumbnail for slide ${slideId}`);
    
    thumbnailService.invalidateThumbnail(slideId);
    
    setState(prev => {
      const newThumbnailUrls = { ...prev.thumbnailUrls };
      const newLastUpdated = { ...prev.lastUpdated };
      delete newThumbnailUrls[slideId];
      delete newLastUpdated[slideId];
      
      return {
        ...prev,
        thumbnailUrls: newThumbnailUrls,
        lastUpdated: newLastUpdated
      };
    });
  }, [thumbnailService]);

  // Check if thumbnail is updating
  const isUpdating = useCallback((slideId: string): boolean => {
    return state.updatingThumbnails.has(slideId);
  }, [state.updatingThumbnails]);

  // Get last updated time
  const getLastUpdated = useCallback((slideId: string): Date | null => {
    return state.lastUpdated[slideId] || null;
  }, [state.lastUpdated]);

  // Load initial thumbnails from service cache
  useEffect(() => {
    const stats = thumbnailService.getCacheStats();
    console.log(`📊 [THUMBNAIL HOOK] Initialized with ${stats.totalThumbnails} cached thumbnails (${stats.cacheSize})`);
  }, [thumbnailService]);

  return {
    // State
    updatingThumbnails: state.updatingThumbnails,
    thumbnailUrls: state.thumbnailUrls,
    
    // Actions
    regenerateThumbnail,
    regenerateMultipleThumbnails,
    getThumbnailUrl,
    invalidateThumbnail,
    
    // Utilities
    isUpdating,
    getLastUpdated
  };
};

/**
 * Helper hook for batch slide editing thumbnail updates
 */
export const useBatchThumbnailUpdates = () => {
  const thumbnailUpdates = useThumbnailUpdates();

  const handleBatchEditComplete = useCallback(async (
    editedSlides: Array<{ id: string; htmlContent: string }>
  ) => {
    if (editedSlides.length === 0) return;

    console.log(`🎨 [BATCH THUMBNAIL] Updating thumbnails for ${editedSlides.length} edited slides`);
    
    try {
      await thumbnailUpdates.regenerateMultipleThumbnails(editedSlides);
      console.log(`✅ [BATCH THUMBNAIL] All thumbnails updated successfully`);
    } catch (error) {
      console.error(`❌ [BATCH THUMBNAIL] Failed to update some thumbnails:`, error);
    }
  }, [thumbnailUpdates]);

  return {
    ...thumbnailUpdates,
    handleBatchEditComplete
  };
};
