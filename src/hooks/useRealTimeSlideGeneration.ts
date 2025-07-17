import { useState, useCallback } from 'react';
import { SimpleSlide, SimpleLesson, SlideGenerationProgress } from '@/types/chat';
import { GenerationStats } from '@/services/chat/ParallelSlideGenerationService';

export interface RealTimeGenerationState {
  isGenerating: boolean;
  currentLesson: SimpleLesson | null;
  progressData: SlideGenerationProgress[];
  completedSlides: number;
  totalSlides: number;
  errors: string[];
  stats: GenerationStats | null;
}

export interface RealTimeGenerationActions {
  startGeneration: (lesson: SimpleLesson, totalSlides: number) => void;
  onSlideReady: (slide: SimpleSlide, lesson: SimpleLesson) => void;
  onProgressUpdate: (progress: SlideGenerationProgress[]) => void;
  onError: (error: string, slideNumber: number) => void;
  onComplete: (lesson: SimpleLesson, stats: GenerationStats) => void;
  reset: () => void;
}

export const useRealTimeSlideGeneration = (
  onLessonUpdate?: (lesson: SimpleLesson) => void
): [RealTimeGenerationState, RealTimeGenerationActions] => {
  
  const [state, setState] = useState<RealTimeGenerationState>({
    isGenerating: false,
    currentLesson: null,
    progressData: [],
    completedSlides: 0,
    totalSlides: 0,
    errors: [],
    stats: null
  });

  const startGeneration = useCallback((lesson: SimpleLesson, totalSlides: number) => {
    console.log('🎬 [UI] Starting real-time generation tracking');
    setState(prevState => ({
      ...prevState,
      isGenerating: true,
      currentLesson: lesson,
      totalSlides,
      completedSlides: 0,
      errors: [],
      stats: null
    }));
  }, []);

  const onSlideReady = useCallback((slide: SimpleSlide, lesson: SimpleLesson) => {
    console.log(`🎨 [UI] Slide ready: "${slide.title}" - updating UI immediately`);
    
    setState(prevState => ({
      ...prevState,
      currentLesson: lesson,
      completedSlides: lesson.slides.length
    }));

    // Оновлюємо урок в батьківському компоненті ВІДРАЗУ
    if (onLessonUpdate) {
      onLessonUpdate(lesson);
    }
  }, [onLessonUpdate]);

  const onProgressUpdate = useCallback((progress: SlideGenerationProgress[]) => {
    setState(prevState => ({
      ...prevState,
      progressData: progress
    }));
  }, []);

  const onError = useCallback((error: string, slideNumber: number) => {
    console.error(`❌ [UI] Slide ${slideNumber} generation error:`, error);
    setState(prevState => ({
      ...prevState,
      errors: [...prevState.errors, `Slide ${slideNumber}: ${error}`]
    }));
  }, []);

  const onComplete = useCallback((lesson: SimpleLesson, stats: GenerationStats) => {
    console.log('🎉 [UI] Generation completed:', stats);
    setState(prevState => ({
      ...prevState,
      isGenerating: false,
      currentLesson: lesson,
      stats,
      completedSlides: lesson.slides.length
    }));

    // Фінальне оновлення уроку
    if (onLessonUpdate) {
      onLessonUpdate(lesson);
    }
  }, [onLessonUpdate]);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      currentLesson: null,
      progressData: [],
      completedSlides: 0,
      totalSlides: 0,
      errors: [],
      stats: null
    });
  }, []);

  const actions: RealTimeGenerationActions = {
    startGeneration,
    onSlideReady,
    onProgressUpdate,
    onError,
    onComplete,
    reset
  };

  return [state, actions];
}; 