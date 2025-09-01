/**
 * === SOLID: SRP - Optimized Batch Edit Hook ===
 * 
 * React hook for managing optimized batch slide editing with progress
 */

import { useState, useCallback, useRef } from 'react';
import { SimpleSlide } from '@/types/chat';
import { 
  OptimizedBatchEditService, 
  BatchEditProgress, 
  BatchEditPlan,
  SlideEditResult 
} from '@/services/slides/OptimizedBatchEditService';

export interface UseOptimizedBatchEditReturn {
  // State
  isEditing: boolean;
  progress: BatchEditProgress | null;
  
  // Actions
  startBatchEdit: (
    batchPlan: BatchEditPlan,
    slides: SimpleSlide[],
    options?: BatchEditOptions
  ) => Promise<BatchEditProgress>;
  
  // Utilities
  getBatchId: () => string | null;
  getResults: () => SlideEditResult[];
  getErrors: () => any[];
}

export interface BatchEditOptions {
  topic?: string;
  age?: string;
  onProgress?: (progress: BatchEditProgress) => void;
  onComplete?: (results: SlideEditResult[]) => void;
  onError?: (errors: any[]) => void;
}

/**
 * Hook for optimized batch slide editing
 */
export const useOptimizedBatchEdit = (): UseOptimizedBatchEditReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState<BatchEditProgress | null>(null);
  const serviceRef = useRef<OptimizedBatchEditService | null>(null);

  // Start batch editing process
  const startBatchEdit = useCallback(async (
    batchPlan: BatchEditPlan,
    slides: SimpleSlide[],
    options: BatchEditOptions = {}
  ): Promise<BatchEditProgress> => {
    if (isEditing) {
      throw new Error('Batch editing is already in progress');
    }

    const {
      topic = 'lesson',
      age = '6-8 years',
      onProgress,
      onComplete,
      onError
    } = options;

    console.log(`🚀 [BATCH EDIT HOOK] Starting batch edit`);
    console.log(`📋 [BATCH EDIT HOOK] Plan:`, batchPlan);
    console.log(`📊 [BATCH EDIT HOOK] Slides count: ${slides.length}`);

    try {
      setIsEditing(true);
      setProgress(null);

      // Create new service instance
      serviceRef.current = new OptimizedBatchEditService();
      
      // Execute batch edit with progress tracking (always parallel)
      const finalProgress = await serviceRef.current.executeBatchEdit(
        batchPlan,
        slides,
        {
          topic,
          age,
          onProgress: (progressUpdate) => {
            setProgress(progressUpdate);
            onProgress?.(progressUpdate);
          }
        }
      );

      console.log(`✅ [BATCH EDIT HOOK] Batch edit completed`);
      console.log(`📊 [BATCH EDIT HOOK] Results: ${finalProgress.results.length} success, ${finalProgress.errors.length} errors`);

      // Notify completion
      if (finalProgress.results.length > 0) {
        onComplete?.(finalProgress.results);
      }
      
      if (finalProgress.errors.length > 0) {
        onError?.(finalProgress.errors);
      }

      return finalProgress;

    } catch (error) {
      console.error(`❌ [BATCH EDIT HOOK] Batch edit failed:`, error);
      
      onError?.([{
        slideId: 'batch',
        error: error instanceof Error ? error.message : 'Unknown error',
        instruction: 'batch edit',
        editingTime: 0
      }]);
      
      throw error;
    } finally {
      setIsEditing(false);
    }
  }, [isEditing]);

  // Get current batch ID
  const getBatchId = useCallback((): string | null => {
    return serviceRef.current?.getBatchId() || null;
  }, []);

  // Get successful results
  const getResults = useCallback((): SlideEditResult[] => {
    return progress?.results || [];
  }, [progress]);

  // Get errors
  const getErrors = useCallback((): any[] => {
    return progress?.errors || [];
  }, [progress]);

  return {
    // State
    isEditing,
    progress,
    
    // Actions
    startBatchEdit,
    
    // Utilities
    getBatchId,
    getResults,
    getErrors
  };
};

/**
 * Helper hook for handling batch edit responses from chat
 */
export const useBatchEditFromChat = () => {
  const batchEdit = useOptimizedBatchEdit();

  const handleChatBatchEdit = useCallback(async (
    chatResponse: any, // ChatResponse with enhancedBatchEdit
    slides: SimpleSlide[],
    options: BatchEditOptions = {}
  ) => {
    if (!chatResponse.enhancedBatchEdit) {
      throw new Error('No batch edit plan found in chat response');
    }

    const { batchEditPlan } = chatResponse.enhancedBatchEdit;
    
    console.log(`🎯 [BATCH EDIT FROM CHAT] Processing chat batch edit`);
    console.log(`📋 [BATCH EDIT FROM CHAT] Plan:`, batchEditPlan);

    return await batchEdit.startBatchEdit(batchEditPlan, slides, options);
  }, [batchEdit]);

  return {
    ...batchEdit,
    handleChatBatchEdit
  };
};
