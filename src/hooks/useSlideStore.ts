import { useEffect, useState, useCallback, useMemo } from 'react';
import { SlideState, SlideActions, ISlideStore } from '@/types/store';
import { slideStore } from '@/stores/SlideStore';
import { SimpleLesson, SimpleSlide } from '@/types/chat';

// === SOLID: ISP - Базовий hook для підписки на повний стан ===
export const useSlideStore = (store: ISlideStore = slideStore): [SlideState, SlideActions] => {
  const [state, setState] = useState<SlideState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  return [state, store.actions];
};

// === SOLID: ISP - Hook для конкретних частин стану (мемоізація) ===
export const useSlideStoreSelector = <T>(
  selector: (state: SlideState) => T,
  store: ISlideStore = slideStore
): T => {
  const [state, setState] = useState<SlideState>(store.getState());
  
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  return useMemo(() => selector(state), [selector, state]);
};

// === SOLID: SRP - Hook для управління уроками ===
export const useLessonManagement = (store: ISlideStore = slideStore) => {
  const currentLesson = useSlideStoreSelector(state => state.currentLesson, store);
  const slides = useSlideStoreSelector(state => state.slides, store);
  const actions = store.actions;

  const setLesson = useCallback((lesson: SimpleLesson | null) => {
    actions.setCurrentLesson(lesson);
  }, [actions]);

  const updateLesson = useCallback((updates: Partial<SimpleLesson>) => {
    actions.updateLesson(updates);
  }, [actions]);

  const addSlide = useCallback((slide: SimpleSlide) => {
    actions.addSlide(slide);
  }, [actions]);

  const addSlides = useCallback((slides: SimpleSlide[]) => {
    actions.addSlides(slides);
  }, [actions]);

  const updateSlide = useCallback((slideId: string, updates: Partial<SimpleSlide>) => {
    actions.updateSlide(slideId, updates);
  }, [actions]);

  const removeSlide = useCallback((slideId: string) => {
    actions.removeSlide(slideId);
  }, [actions]);

  return {
    // State
    currentLesson,
    slides,
    
    // Actions
    setLesson,
    updateLesson,
    addSlide,
    addSlides,
    updateSlide,
    removeSlide,
    
    // Computed
    slideCount: slides.length,
    hasSlides: slides.length > 0,
    lessonDuration: currentLesson?.duration || 0
  };
};

// === SOLID: SRP - Hook для управління вибором слайдів ===
export const useSlideSelection = (store: ISlideStore = slideStore) => {
  const selectedSlides = useSlideStoreSelector(state => state.selectedSlides, store);
  const slides = useSlideStoreSelector(state => state.slides, store);
  const actions = store.actions;

  const toggleSelection = useCallback((slideId: string) => {
    actions.toggleSlideSelection(slideId);
  }, [actions]);

  const selectAll = useCallback(() => {
    actions.selectAllSlides();
  }, [actions]);

  const deselectAll = useCallback(() => {
    actions.deselectAllSlides();
  }, [actions]);

  const setSelection = useCallback((slideIds: string[]) => {
    actions.setSelectedSlides(slideIds);
  }, [actions]);

  const selectedSlidesArray = useMemo(() => 
    slides.filter(slide => selectedSlides.has(slide.id)),
    [slides, selectedSlides]
  );

  return {
    // State
    selectedSlides,
    selectedSlidesArray,
    
    // Actions
    toggleSelection,
    selectAll,
    deselectAll,
    setSelection,
    
    // Computed
    selectedCount: selectedSlides.size,
    hasSelection: selectedSlides.size > 0,
    isAllSelected: selectedSlides.size === slides.length && slides.length > 0,
    canSelectAll: slides.length > 0 && selectedSlides.size < slides.length
  };
};

// === SOLID: SRP - Hook для управління превью ===
export const useSlidePreviews = (store: ISlideStore = slideStore) => {
  const slidePreviews = useSlideStoreSelector(state => state.slidePreviews, store);
  const previewsUpdating = useSlideStoreSelector(state => state.previewsUpdating, store);
  const actions = store.actions;

  const setPreview = useCallback((slideId: string, previewUrl: string) => {
    actions.setSlidePreview(slideId, previewUrl);
  }, [actions]);

  const setUpdating = useCallback((slideId: string, updating: boolean) => {
    actions.setPreviewUpdating(slideId, updating);
  }, [actions]);

  const clearPreviews = useCallback(() => {
    actions.clearPreviews();
  }, [actions]);

  const hasPreview = useCallback((slideId: string) => {
    return !!slidePreviews[slideId];
  }, [slidePreviews]);

  const isUpdating = useCallback((slideId: string) => {
    return previewsUpdating.has(slideId);
  }, [previewsUpdating]);

  return {
    // State
    slidePreviews,
    previewsUpdating,
    
    // Actions
    setPreview,
    setUpdating,
    clearPreviews,
    
    // Computed
    hasPreview,
    isUpdating,
    previewCount: Object.keys(slidePreviews).length,
    updatingCount: previewsUpdating.size
  };
};

// === SOLID: SRP - Hook для управління UI станом ===
export const useSlideUI = (store: ISlideStore = slideStore) => {
  const slidePanelOpen = useSlideStoreSelector(state => state.slidePanelOpen, store);
  const slideDialogOpen = useSlideStoreSelector(state => state.slideDialogOpen, store);
  const currentSlideIndex = useSlideStoreSelector(state => state.currentSlideIndex, store);
  const isSavingLesson = useSlideStoreSelector(state => state.isSavingLesson, store);
  const slides = useSlideStoreSelector(state => state.slides, store);
  const actions = store.actions;

  const togglePanel = useCallback(() => {
    actions.toggleSlidePanelOpen();
  }, [actions]);

  const setPanel = useCallback((open: boolean) => {
    actions.setSlidePanelOpen(open);
  }, [actions]);

  const setDialog = useCallback((open: boolean) => {
    actions.setSlideDialogOpen(open);
  }, [actions]);

  const setSlideIndex = useCallback((index: number) => {
    actions.setCurrentSlideIndex(index);
  }, [actions]);

  const setSaving = useCallback((saving: boolean) => {
    actions.setSavingLesson(saving);
  }, [actions]);

  const navigateToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setSlideIndex(index);
      setDialog(true);
    }
  }, [slides.length, setSlideIndex, setDialog]);

  const nextSlide = useCallback(() => {
    const nextIndex = currentSlideIndex < slides.length - 1 ? currentSlideIndex + 1 : 0;
    setSlideIndex(nextIndex);
  }, [currentSlideIndex, slides.length, setSlideIndex]);

  const prevSlide = useCallback(() => {
    const prevIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1;
    setSlideIndex(prevIndex);
  }, [currentSlideIndex, slides.length, setSlideIndex]);

  return {
    // State
    slidePanelOpen,
    slideDialogOpen,
    currentSlideIndex,
    isSavingLesson,
    
    // Actions
    togglePanel,
    setPanel,
    setDialog,
    setSlideIndex,
    setSaving,
    navigateToSlide,
    nextSlide,
    prevSlide,
    
    // Computed
    currentSlide: slides[currentSlideIndex] || null,
    hasNext: currentSlideIndex < slides.length - 1,
    hasPrev: currentSlideIndex > 0,
    canNavigate: slides.length > 1
  };
};

// === SOLID: SRP - Hook для управління генерацією ===
export const useSlideGeneration = (store: ISlideStore = slideStore) => {
  const isGenerating = useSlideStoreSelector(state => state.isGenerating, store);
  const generationProgress = useSlideStoreSelector(state => state.generationProgress, store);
  const actions = store.actions;

  const setGenerating = useCallback((generating: boolean) => {
    actions.setGenerating(generating);
  }, [actions]);

  const setProgress = useCallback((slideId: string, progress: number) => {
    actions.setSlideGenerationProgress(slideId, progress);
  }, [actions]);

  const getProgress = useCallback((slideId: string) => {
    return generationProgress.get(slideId) || 0;
  }, [generationProgress]);

  const averageProgress = useMemo(() => {
    if (generationProgress.size === 0) return 0;
    const total = Array.from(generationProgress.values()).reduce((sum, progress) => sum + progress, 0);
    return Math.round(total / generationProgress.size);
  }, [generationProgress]);

  return {
    // State
    isGenerating,
    generationProgress,
    
    // Actions
    setGenerating,
    setProgress,
    
    // Computed
    getProgress,
    averageProgress,
    slidesInProgress: generationProgress.size,
    hasActiveGeneration: isGenerating || generationProgress.size > 0
  };
};

// === SOLID: OCP - Композитний hook для повного управління слайдами ===
export const useSlideManagementStore = (store: ISlideStore = slideStore) => {
  const lessons = useLessonManagement(store);
  const selection = useSlideSelection(store);
  const previews = useSlidePreviews(store);
  const ui = useSlideUI(store);
  const generation = useSlideGeneration(store);

  return {
    lessons,
    selection,
    previews,
    ui,
    generation,
    
    // Global actions
    reset: useCallback(() => {
      store.actions.reset();
    }, [store])
  };
};

// === SOLID: LSP - Hook з автоматичним менеджментом превью ===
export const useAutoSlidePreview = (
  previewService: { generatePreview: (slideId: string, htmlContent: string) => Promise<string> },
  store: ISlideStore = slideStore
) => {
  const { slides } = useLessonManagement(store);
  const { setPreview, setUpdating, hasPreview } = useSlidePreviews(store);

  const generatePreviewForSlide = useCallback(async (slide: SimpleSlide) => {
    if (!slide.htmlContent || hasPreview(slide.id)) return;

    try {
      setUpdating(slide.id, true);
      const previewUrl = await previewService.generatePreview(slide.id, slide.htmlContent);
      setPreview(slide.id, previewUrl);
    } catch (error) {
      console.error(`Failed to generate preview for slide ${slide.id}:`, error);
    } finally {
      setUpdating(slide.id, false);
    }
  }, [previewService, hasPreview, setPreview, setUpdating]);

  // Автоматично генеруємо превью для нових слайдів
  useEffect(() => {
    slides.forEach(slide => {
      if (slide.htmlContent && !hasPreview(slide.id)) {
        generatePreviewForSlide(slide);
      }
    });
  }, [slides, generatePreviewForSlide, hasPreview]);

  return {
    generatePreviewForSlide
  };
}; 