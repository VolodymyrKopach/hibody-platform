import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

// Імпорти наших компонентів
import TemplateSlideGrid from '../slides/TemplateSlideGrid';

// Імпорти сервісів та хуків
import { TemplateAPIAdapter, TemplateGenerationCallbacks } from '@/services/templates/TemplateAPIAdapter';
import { SlideStore } from '@/stores/SlideStore';
import { SlideDialog } from '@/components/slides/SlideDialog';

// Типи
import { TemplateData } from '@/types/templates';
import { SimpleSlide, SimpleLesson, SlideGenerationProgress } from '@/types/chat';
import { GenerationStats } from '@/services/templates/TemplateAPIAdapter';

export interface Step3SlideGenerationProps {
  // Дані з попередніх етапів
  templateData: TemplateData;
  generatedPlan: string;
  
  // Навігація
  onBack?: () => void;
  onNext?: () => void;
  
  // Callbacks
  onLessonSaved?: (lesson: SimpleLesson) => void;
  onError?: (error: string) => void;
}

const Step3SlideGeneration: React.FC<Step3SlideGenerationProps> = ({
  templateData,
  generatedPlan,
  onBack,
  onNext,
  onLessonSaved,
  onError
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Стан компонента
  const [adapter, setAdapter] = useState<TemplateAPIAdapter | null>(null);
  const [slideStore, setSlideStore] = useState<SlideStore | null>(null);
  
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
  
  // UI стан
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [slideDialogIndex, setSlideDialogIndex] = useState(0);

  // Ініціалізація адаптера та store
  useEffect(() => {
    const initializeServices = () => {
      try {
        // API ключ перевіряється на сервері, тут просто логуємо
        console.log('🔑 [Step3] Using API-based generation - server will handle authentication');

        // Створюємо новий SlideStore для template flow
        const store = new SlideStore({
          logging: { enabled: true, level: 'info' },
          persistence: { enabled: false, key: 'template-generation' }
        });

        // Створюємо адаптер
        const generationAdapter = new TemplateAPIAdapter(store);

        setSlideStore(store);
        setAdapter(generationAdapter);

        console.log('✅ [Step3] Services initialized successfully');
      } catch (error) {
        console.error('❌ [Step3] Failed to initialize services:', error);
        setHasError(true);
        
        if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
          setErrorMessage('Demo mode: GEMINI_API_KEY is required for slide generation. Please add your API key to environment variables.');
        } else {
          setErrorMessage('Failed to initialize generation services');
        }
      }
    };

    initializeServices();

    // Cleanup при unmount
    return () => {
      if (adapter) {
        adapter.cleanup();
      }
    };
  }, []);

  // Автоматичний старт генерації
  useEffect(() => {
    if (adapter && !isGenerating && !isCompleted && !hasError) {
      startGeneration();
    }
  }, [adapter]);

  // Підписка на зміни в SlideStore
  useEffect(() => {
    if (!slideStore) return;

    const unsubscribe = slideStore.subscribe((state) => {
      setSlides(state.slides || []);
      setCurrentLesson(state.currentLesson);
      setIsGenerating(state.isGenerating || false);
      
      // Автоматично вибираємо перший слайд
      if ((state.slides?.length || 0) > 0 && !selectedSlideId) {
        const firstSlide = state.slides![0];
        setSelectedSlideId(firstSlide.id);
      }
    });

    return unsubscribe;
  }, [slideStore, selectedSlideId]);

  // Callbacks для генерації
  const generationCallbacks: TemplateGenerationCallbacks = {
    onSlideReady: useCallback((slide: SimpleSlide, lesson: SimpleLesson) => {
      console.log(`🎨 [Step3] Slide ready: ${slide.title}`);
    }, []),

    onProgressUpdate: useCallback((progress: SlideGenerationProgress[]) => {
      setSlideProgresses(progress);
    }, []),

    onSlideError: useCallback((error: string, slideNumber: number) => {
      console.error(`❌ [Step3] Slide ${slideNumber} failed:`, error);
      setErrorMessage(`Failed to generate slide ${slideNumber}: ${error}`);
    }, []),

    onComplete: useCallback((lesson: SimpleLesson, stats: GenerationStats) => {
      console.log('🎉 [Step3] Generation completed!', stats);
      setIsCompleted(true);
      setIsGenerating(false);
      setGenerationStats(stats);
    }, []),

    onError: useCallback((error: string) => {
      console.error('❌ [Step3] Generation failed:', error);
      setHasError(true);
      setIsGenerating(false);
      setErrorMessage(error);
      onError?.(error);
    }, [onError])
  };

  // Функції управління генерацією
  const startGeneration = useCallback(async () => {
    if (!adapter) return;

    try {
      setIsGenerating(true);
      setHasError(false);
      setErrorMessage('');
      
      console.log('🚀 [Step3] Starting slide generation...');
      
      await adapter.startTemplateGeneration(
        generatedPlan,
        templateData,
        generationCallbacks
      );
      
    } catch (error) {
      console.error('❌ [Step3] Failed to start generation:', error);
      setHasError(true);
      setIsGenerating(false);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      onError?.(message);
    }
  }, [adapter, generatedPlan, templateData, generationCallbacks, onError]);

  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    // TODO: Implement actual pause logic in adapter
    console.log('⏸️ [Step3] Generation paused');
  }, []);

  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
    // TODO: Implement actual resume logic in adapter
    console.log('▶️ [Step3] Generation resumed');
  }, []);

  const stopGeneration = useCallback(() => {
    if (adapter) {
      adapter.stopGeneration();
    }
    setIsGenerating(false);
    setIsPaused(false);
    console.log('🛑 [Step3] Generation stopped');
  }, [adapter]);

  const restartGeneration = useCallback(() => {
    if (adapter) {
      adapter.cleanup();
    }
    setSlides([]);
    setCurrentLesson(null);
    setSlideProgresses([]);
    setGenerationStats(null);
    setHasError(false);
    setErrorMessage('');
    setIsCompleted(false);
    
    // Перезапускаємо через короткий час
    setTimeout(() => {
      startGeneration();
    }, 500);
  }, [adapter, startGeneration]);

  // Обробники UI подій
  const handleSlideSelect = useCallback((slideId: string) => {
    setSelectedSlideId(slideId);
  }, []);

  const handleSlideFullscreen = useCallback((slideIndex: number) => {
    setSlideDialogIndex(slideIndex);
    setSlideDialogOpen(true);
  }, []);

  const handleSaveLesson = useCallback(() => {
    if (currentLesson) {
      onLessonSaved?.(currentLesson);
      setSuccessMessage('Lesson saved successfully!');
    }
  }, [currentLesson, onLessonSaved]);

  // Розрахунок прогресу
  const overallProgress = useMemo(() => {
    if (templateData.slideCount === 0) return 0;
    const completedSlides = slides.filter(s => s.status === 'completed').length;
    return (completedSlides / templateData.slideCount) * 100;
  }, [slides, templateData.slideCount]);

  const completedSlidesCount = useMemo(() => {
    return slides.filter(s => s.status === 'completed').length;
  }, [slides]);

  const failedSlidesCount = useMemo(() => {
    return slides.filter(s => s.status === 'draft' && !isGenerating).length;
  }, [slides, isGenerating]);

  // Розрахунок орієнтовного часу
  const estimatedTimeRemaining = useMemo(() => {
    if (!isGenerating || templateData.slideCount === 0) return undefined;
    const remainingSlides = templateData.slideCount - completedSlidesCount;
    return remainingSlides * 30; // 30 секунд на слайд
  }, [isGenerating, templateData.slideCount, completedSlidesCount]);

  return (
    <>
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
      <CardContent sx={{ p: 6 }}>


        {/* Error Alert */}
        {hasError && (
          <Alert 
            severity={errorMessage?.includes('Demo mode') ? 'warning' : 'error'} 
            sx={{ mb: 4 }} 
            onClose={() => setHasError(false)}
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {errorMessage?.includes('Demo mode') ? 'Demo Mode' : 'Error'}
            </Typography>
            <Typography variant="body2">
              {errorMessage || 'An error occurred during generation'}
            </Typography>
            {errorMessage?.includes('Demo mode') && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                To test slide generation, add your GEMINI_API_KEY to the .env.local file.
              </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{ mb: 4 }}>
          <TemplateSlideGrid
            slides={slides}
            totalSlides={templateData.slideCount}
            generationProgress={slideStore?.getState().generationProgress || new Map()}
            slideProgresses={slideProgresses}
            selectedSlideId={selectedSlideId}
            isGenerating={isGenerating}
            onSlideSelect={handleSlideSelect}
            onSlideFullscreen={handleSlideFullscreen}
            showStats={!isMobile}
            compact={isMobile}
          />
        </Box>

        {/* Simple Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{ minWidth: 120 }}
          >
            Назад
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSaveLesson}
            disabled={!isCompleted || !currentLesson}
            sx={{ minWidth: 120 }}
          >
            Зберегти
          </Button>
        </Box>
      </CardContent>
    </Card>

    {/* Slide Dialog */}
    {currentLesson && (
      <SlideDialog
        open={slideDialogOpen}
        currentLesson={currentLesson}
        currentSlideIndex={slideDialogIndex}
        onClose={() => setSlideDialogOpen(false)}
        onNextSlide={() => {
          const nextIndex = slideDialogIndex < slides.length - 1 ? slideDialogIndex + 1 : 0;
          setSlideDialogIndex(nextIndex);
        }}
        onPrevSlide={() => {
          const prevIndex = slideDialogIndex > 0 ? slideDialogIndex - 1 : slides.length - 1;
          setSlideDialogIndex(prevIndex);
        }}
      />
    )}


    </>
  );
};

export default Step3SlideGeneration;
