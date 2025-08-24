import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TemplateGenerationAdapter, 
  TemplateGenerationCallbacks,
  TemplateGenerationResult,
  TemplateGenerationState
} from '@/services/templates/TemplateGenerationAdapter';
import { SlideStore } from '@/stores/SlideStore';
import { TemplateData } from '@/types/templates';
import { SimpleSlide, SimpleLesson, SlideGenerationProgress } from '@/types/chat';
import { GenerationStats } from '@/services/chat/ParallelSlideGenerationService';

/**
 * Хук для управління генерацією слайдів в template flow
 * Інкапсулює всю логіку роботи з TemplateGenerationAdapter та SlideStore
 */
export const useTemplateSlideGeneration = (
  templateData: TemplateData,
  generatedPlan: string
) => {
  // Refs для сервісів
  const adapterRef = useRef<TemplateGenerationAdapter | null>(null);
  const slideStoreRef = useRef<SlideStore | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Стан генерації
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Дані слайдів
  const [slides, setSlides] = useState<SimpleSlide[]>([]);
  const [currentLesson, setCurrentLesson] = useState<SimpleLesson | null>(null);
  const [slideProgresses, setSlideProgresses] = useState<SlideGenerationProgress[]>([]);
  const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null);

  // Стан UI
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  // Ініціалізація сервісів
  const initializeServices = useCallback(() => {
    try {
      // Створюємо SlideStore
      const slideStore = new SlideStore({
        logging: { enabled: true, level: 'info' },
        persistence: { enabled: false, key: `template-${Date.now()}` }
      });

      // Створюємо адаптер
      const adapter = new TemplateGenerationAdapter(slideStore);

      slideStoreRef.current = slideStore;
      adapterRef.current = adapter;

      // Підписуємося на зміни в store
      const unsubscribe = slideStore.subscribe((state) => {
        setSlides(state.slides || []);
        setCurrentLesson(state.currentLesson);
        setIsGenerating(state.isGenerating || false);

        // Автоматично вибираємо перший слайд
        if ((state.slides?.length || 0) > 0 && !selectedSlideId) {
          setSelectedSlideId(state.slides![0].id);
        }
      });

      unsubscribeRef.current = unsubscribe;

      console.log('✅ [useTemplateSlideGeneration] Services initialized');
      return true;
    } catch (error) {
      console.error('❌ [useTemplateSlideGeneration] Failed to initialize:', error);
      setHasError(true);
      setErrorMessage('Failed to initialize generation services');
      return false;
    }
  }, [selectedSlideId]);

  // Очищення ресурсів
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (adapterRef.current) {
      adapterRef.current.cleanup();
      adapterRef.current = null;
    }

    slideStoreRef.current = null;
  }, []);

  // Ініціалізація при mount
  useEffect(() => {
    initializeServices();
    return cleanup;
  }, [initializeServices, cleanup]);

  // Додавання нотифікації
  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Автоматично видаляємо через 5 секунд
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Callbacks для генерації
  const generationCallbacks: TemplateGenerationCallbacks = {
    onSlideReady: useCallback((slide: SimpleSlide, lesson: SimpleLesson) => {
      console.log(`🎨 [Hook] Slide ready: ${slide.title}`);
      addNotification('success', `Slide "${slide.title}" generated successfully!`);
    }, [addNotification]),

    onProgressUpdate: useCallback((progress: SlideGenerationProgress[]) => {
      setSlideProgresses(progress);
    }, []),

    onSlideError: useCallback((error: string, slideNumber: number) => {
      console.error(`❌ [Hook] Slide ${slideNumber} failed:`, error);
      addNotification('error', `Failed to generate slide ${slideNumber}: ${error}`);
    }, [addNotification]),

    onComplete: useCallback((lesson: SimpleLesson, stats: GenerationStats) => {
      console.log('🎉 [Hook] Generation completed!', stats);
      setIsCompleted(true);
      setIsGenerating(false);
      setGenerationStats(stats);
      addNotification('success', `All ${stats.completedSlides} slides generated successfully!`);
    }, [addNotification]),

    onError: useCallback((error: string) => {
      console.error('❌ [Hook] Generation failed:', error);
      setHasError(true);
      setIsGenerating(false);
      setErrorMessage(error);
      addNotification('error', `Generation failed: ${error}`);
    }, [addNotification])
  };

  // Функції управління генерацією
  const startGeneration = useCallback(async (): Promise<TemplateGenerationResult> => {
    if (!adapterRef.current) {
      const error = 'Adapter not initialized';
      setHasError(true);
      setErrorMessage(error);
      return { success: false, error };
    }

    try {
      setIsGenerating(true);
      setHasError(false);
      setErrorMessage('');
      setIsCompleted(false);

      console.log('🚀 [Hook] Starting generation...');
      addNotification('info', 'Starting slide generation...');

      const result = await adapterRef.current.startTemplateGeneration(
        generatedPlan,
        templateData,
        generationCallbacks
      );

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHasError(true);
      setIsGenerating(false);
      setErrorMessage(message);
      addNotification('error', `Failed to start generation: ${message}`);
      
      return { success: false, error: message };
    }
  }, [generatedPlan, templateData, generationCallbacks, addNotification]);

  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    addNotification('info', 'Generation paused');
    console.log('⏸️ [Hook] Generation paused');
  }, [addNotification]);

  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
    addNotification('info', 'Generation resumed');
    console.log('▶️ [Hook] Generation resumed');
  }, [addNotification]);

  const stopGeneration = useCallback(() => {
    if (adapterRef.current) {
      adapterRef.current.stopGeneration();
    }
    setIsGenerating(false);
    setIsPaused(false);
    addNotification('info', 'Generation stopped');
    console.log('🛑 [Hook] Generation stopped');
  }, [addNotification]);

  const restartGeneration = useCallback(async () => {
    console.log('🔄 [Hook] Restarting generation...');
    
    // Очищуємо поточний стан
    if (adapterRef.current) {
      adapterRef.current.cleanup();
    }
    
    // Скидаємо стан
    setSlides([]);
    setCurrentLesson(null);
    setSlideProgresses([]);
    setGenerationStats(null);
    setHasError(false);
    setErrorMessage('');
    setIsCompleted(false);
    setSelectedSlideId('');

    // Реініціалізуємо сервіси
    const initialized = initializeServices();
    if (!initialized) {
      return { success: false, error: 'Failed to reinitialize services' };
    }

    // Чекаємо трохи і запускаємо генерацію
    await new Promise(resolve => setTimeout(resolve, 500));
    return startGeneration();
  }, [initializeServices, startGeneration]);

  // Функції для роботи зі слайдами
  const selectSlide = useCallback((slideId: string) => {
    setSelectedSlideId(slideId);
  }, []);

  const getSlideIndex = useCallback((slideId: string): number => {
    return slides.findIndex(s => s.id === slideId);
  }, [slides]);

  const getSlideById = useCallback((slideId: string): SimpleSlide | undefined => {
    return slides.find(s => s.id === slideId);
  }, [slides]);

  // Функції для нотифікацій
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Отримання поточного стану
  const getGenerationState = useCallback((): TemplateGenerationState | null => {
    if (!adapterRef.current) return null;
    return adapterRef.current.getGenerationState();
  }, []);

  // Розрахункові значення
  const completedSlidesCount = slides.filter(s => s.status === 'completed').length;
  const failedSlidesCount = slides.filter(s => s.status === 'draft' && !isGenerating).length;
  const overallProgress = templateData.slideCount > 0 
    ? (completedSlidesCount / templateData.slideCount) * 100 
    : 0;

  const estimatedTimeRemaining = isGenerating && templateData.slideCount > 0
    ? (templateData.slideCount - completedSlidesCount) * 30 // 30 секунд на слайд
    : undefined;

  return {
    // Стан генерації
    isGenerating,
    isPaused,
    isCompleted,
    hasError,
    errorMessage,

    // Дані слайдів
    slides,
    currentLesson,
    slideProgresses,
    generationStats,

    // UI стан
    selectedSlideId,
    notifications,

    // Розрахункові значення
    completedSlidesCount,
    failedSlidesCount,
    overallProgress,
    estimatedTimeRemaining,

    // Функції управління генерацією
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    stopGeneration,
    restartGeneration,

    // Функції для роботи зі слайдами
    selectSlide,
    getSlideIndex,
    getSlideById,

    // Функції для нотифікацій
    removeNotification,
    clearAllNotifications,

    // Утилітарні функції
    getGenerationState,
    cleanup
  };
};

export default useTemplateSlideGeneration;
