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
  Button,
  Snackbar
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { 
  Slideshow as SlidesIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// Імпорти наших компонентів
import TemplateSlideGrid from '../slides/TemplateSlideGrid';
import SlideEditingExpandablePanel from '../slides/SlideEditingExpandablePanel';
import SimplifiedSaveLessonDialog from '@/components/dialogs/SimplifiedSaveLessonDialog';

// Імпорти сервісів та хуків
import { TemplateAPIAdapter, TemplateGenerationCallbacks } from '@/services/templates/TemplateAPIAdapter';
import { SlideStore } from '@/stores/SlideStore';
import { SlideDialog } from '@/components/slides/SlideDialog';
import { getLocalThumbnailStorage } from '@/services/slides/LocalThumbnailService';

// Типи
import { TemplateData } from '@/types/templates';
import { SimpleSlide, SimpleLesson, SlideGenerationProgress, LessonSaveData } from '@/types/chat';
import { GenerationStats } from '@/services/templates/TemplateAPIAdapter';
import { useLessonCreation } from '@/providers/LessonCreationProvider';

export interface Step3SlideGenerationProps {
  // Дані з попередніх етапів
  templateData: TemplateData;
  generatedPlan: string;
  generatedLesson?: SimpleLesson | null;
  slideGenerationState: {
    isGenerating: boolean;
    isCompleted: boolean;
    hasError: boolean;
    errorMessage: string;
    slides: SimpleSlide[];
    currentLesson: SimpleLesson | null;
    slideProgresses: SlideGenerationProgress[];
  };
  
  // Навігація
  onBack?: () => void;
  onNext?: () => void;
  
  // Callbacks
  onLessonSaved?: (lesson: SimpleLesson) => void;
  onError?: (error: string) => void;
  onClearLesson?: () => void;
  onUpdateGenerationState?: (state: Partial<Step3SlideGenerationProps['slideGenerationState']>) => void;
  onClearGenerationState?: () => void;
}

const Step3SlideGeneration: React.FC<Step3SlideGenerationProps> = ({
  templateData,
  generatedPlan,
  generatedLesson,
  slideGenerationState,
  onBack,
  onNext,
  onLessonSaved,
  onError,
  onClearLesson,
  onUpdateGenerationState,
  onClearGenerationState
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['common', 'lessons']);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Отримуємо методи для роботи з коментарями до слайдів
  const {
    state: { slideEditingState },
    addSlideComment,
    removeSlideComment,
    clearAllSlideComments,
    processSlideComments
  } = useLessonCreation();

  // Обгортаємо addSlideComment щоб ховати результати при додаванні коментарів
  const handleAddSlideComment = useCallback((comment: Parameters<typeof addSlideComment>[0]) => {
    addSlideComment(comment);
    // Ховаємо результати коли додається новий коментар
    setShowEditingResults(false);
  }, [addSlideComment]);

  // Обгортаємо removeSlideComment щоб показувати результати при видаленні коментарів
  const handleRemoveSlideComment = useCallback((commentId: string) => {
    removeSlideComment(commentId);
    // Показуємо результати знову якщо є результати і немає коментарів
    if (slideEditingState.slideChanges && Object.keys(slideEditingState.slideChanges).length > 0) {
      // Перевіряємо чи залишилися коментарі після видалення
      const remainingComments = slideEditingState.pendingComments.filter(c => c.id !== commentId);
      if (remainingComments.length === 0) {
        setShowEditingResults(true);
      }
    }
  }, [removeSlideComment, slideEditingState.slideChanges, slideEditingState.pendingComments]);

  // Обгортаємо clearAllSlideComments щоб показувати результати при очищенні всіх коментарів
  const handleClearAllSlideComments = useCallback(() => {
    clearAllSlideComments();
    // Показуємо результати знову якщо є результати
    if (slideEditingState.slideChanges && Object.keys(slideEditingState.slideChanges).length > 0) {
      setShowEditingResults(true);
    }
  }, [clearAllSlideComments, slideEditingState.slideChanges]);

  // Стан компонента
  const [adapter, setAdapter] = useState<TemplateAPIAdapter | null>(null);
  const [slideStore, setSlideStore] = useState<SlideStore | null>(null);
  
  // Сервіс для роботи з превью (використовуємо глобальний екземпляр)
  const thumbnailStorage = useMemo(() => getLocalThumbnailStorage(), []);
  
  // Локальний стан (тільки для UI та сервісів)
  const [isPaused, setIsPaused] = useState(false);
  const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null);
  
  // Стан збереження уроку
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  
  // Стан діалогу збереження (спрощений підхід)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [lessonSaveData, setLessonSaveData] = useState<LessonSaveData | null>(null);
  
  // Стан для закриття результатів редагування
  const [showEditingResults, setShowEditingResults] = useState(true);
  
  // Використовуємо глобальний стан генерації
  const {
    isGenerating,
    isCompleted,
    hasError,
    errorMessage,
    slides,
    currentLesson,
    slideProgresses
  } = slideGenerationState;
  
  // UI стан
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [slideDialogIndex, setSlideDialogIndex] = useState(0);

  // Функція для підготовки даних для збереження
  const prepareLessonSaveData = useCallback((): LessonSaveData | null => {
    if (!currentLesson || !slides || slides.length === 0) {
      return null;
    }

    // Отримуємо всі превью з LocalThumbnailStorage
    const allPreviews = thumbnailStorage.getAll();
    
    // Збираємо превью для слайдів
    const slidePreviews: Record<string, string> = {};
    
    slides.forEach(slide => {
      // Спочатку перевіряємо LocalThumbnailStorage
      if (allPreviews[slide.id]) {
        slidePreviews[slide.id] = allPreviews[slide.id];
      } 
      // Потім перевіряємо previewUrl або thumbnailUrl
      else if (slide.previewUrl) {
        slidePreviews[slide.id] = slide.previewUrl;
      } else if (slide.thumbnailUrl) {
        slidePreviews[slide.id] = slide.thumbnailUrl;
      }
    });

    // Створюємо об'єкт з усіма даними для збереження
    const saveData: LessonSaveData = {
      title: currentLesson.title || `${templateData.topic} - ${templateData.ageGroup}`,
      description: currentLesson.description || `Interactive lesson about ${templateData.topic} designed for ${templateData.ageGroup}`,
      subject: templateData.topic,
      ageGroup: templateData.ageGroup,
      duration: currentLesson.duration || 45,
      slides: slides,
      slidePreviews: slidePreviews,
      selectedPreviewId: null,
      previewUrl: null
    };

    return saveData;
  }, [currentLesson, slides, templateData, thumbnailStorage]);

  // Ініціалізація адаптера та store
  useEffect(() => {
    const initializeServices = () => {
      try {
        // API ключ перевіряється на сервері

        // Створюємо новий SlideStore для template flow
        const store = new SlideStore({
          logging: { enabled: true, level: 'info' },
          persistence: { enabled: false, key: 'template-generation' }
        });

        // Створюємо адаптер
        const generationAdapter = new TemplateAPIAdapter(store);

        setSlideStore(store);
        setAdapter(generationAdapter);


      } catch (error) {
        
        const errorMsg = error instanceof Error && error.message.includes('GEMINI_API_KEY')
          ? t('createLesson.step3.errors.demoMode')
          : t('createLesson.step3.errors.initializationFailed');
          
        onUpdateGenerationState?.({
          hasError: true,
          errorMessage: errorMsg
        });
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

  // Ініціалізація стану на основі існуючого уроку та глобального стану генерації
  useEffect(() => {
    if (generatedLesson && !isGenerating) {
      // Урок вже існує і генерація не йде, показуємо готовий урок
      onUpdateGenerationState?.({
        currentLesson: generatedLesson,
        slides: generatedLesson.slides || [],
        isCompleted: true,
        isGenerating: false,
        hasError: false,
        errorMessage: ''
      });

    } else if (!generatedLesson && !isGenerating && !isCompleted && !hasError) {
      // Уроку немає і генерація не йде, скидаємо до початкового стану
      onUpdateGenerationState?.({
        currentLesson: null,
        slides: [],
        isCompleted: false,
        isGenerating: false,
        hasError: false,
        errorMessage: ''
      });
    }
    // Якщо генерація йде (isGenerating: true), не змінюємо стан - продовжуємо генерацію
  }, [generatedLesson, onUpdateGenerationState]);



  // Підписка на зміни в SlideStore та синхронізація з глобальним станом
  useEffect(() => {
    if (!slideStore) return;

    const unsubscribe = slideStore.subscribe((state) => {
      // ТІЛЬКИ оновлюємо стан генерації, НЕ слайди (щоб не перезаписати відредаговані)
      onUpdateGenerationState?.({
        currentLesson: state.currentLesson,
        isGenerating: state.isGenerating || false
        // НЕ оновлюємо slides тут - це робить LessonCreationProvider
      });
      
      // Автоматично вибираємо перший слайд
      if ((state.slides?.length || 0) > 0 && !selectedSlideId) {
        const firstSlide = state.slides![0];
        setSelectedSlideId(firstSlide.id);
      }
    });

    return unsubscribe;
  }, [slideStore, selectedSlideId, onUpdateGenerationState]);

  // Слухаємо події редагування слайдів та синхронізуємо SlideStore
  useEffect(() => {
    const handleSlideEdited = (event: CustomEvent) => {
      const { slideId, editedSlide, updatedSlides } = event.detail;
      
      if (slideStore) {
        // Оновлюємо відредагований слайд в SlideStore
        slideStore.actions.updateSlide(slideId, editedSlide);

        // Примусово тригеримо оновлення превью через невелику затримку
        setTimeout(() => {
          // Тригеримо подію для TemplateSlideGrid
          window.dispatchEvent(new CustomEvent('forcePreviewRefresh', {
            detail: { slideId, editedSlide }
          }));
        }, 500);
      }
    };

    const handleSlideEditError = (event: CustomEvent) => {
      const { slideId, slideTitle, error, isRetryable } = event.detail;
      


      // Show error message to user
      const errorMessage = isRetryable 
        ? `AI service is temporarily overloaded. Please try again in a few minutes.`
        : `Failed to edit slide "${slideTitle}": ${error}`;
        
      onError?.(errorMessage);
    };

    window.addEventListener('slideEdited', handleSlideEdited as EventListener);
    window.addEventListener('slideEditError', handleSlideEditError as EventListener);
    
    return () => {
      window.removeEventListener('slideEdited', handleSlideEdited as EventListener);
      window.removeEventListener('slideEditError', handleSlideEditError as EventListener);
    };
  }, [slideStore, onError]);

  // Видалено старий useEffect для оновлення превью - тепер це робиться в prepareLessonSaveData

  // Callbacks для генерації
  const generationCallbacks: TemplateGenerationCallbacks = {
    onSlideReady: useCallback((slide: SimpleSlide, lesson: SimpleLesson) => {

    }, []),

    onProgressUpdate: useCallback((progress: SlideGenerationProgress[]) => {
      onUpdateGenerationState?.({ slideProgresses: progress });
    }, [onUpdateGenerationState]),

    onSlideError: useCallback((error: string, slideNumber: number) => {

      const errorMsg = t('createLesson.step3.errors.slideGenerationFailed', { slideNumber, error });
      onUpdateGenerationState?.({ errorMessage: errorMsg });
    }, [onUpdateGenerationState, t]),

    onComplete: useCallback((lesson: SimpleLesson, stats: GenerationStats) => {

      onUpdateGenerationState?.({
        isCompleted: true,
        isGenerating: false,
        currentLesson: lesson
      });
      setGenerationStats(stats);
      
      // Автоматично зберігаємо урок при завершенні генерації
      onLessonSaved?.(lesson);
    }, [onUpdateGenerationState, onLessonSaved]),

    onError: useCallback((error: string) => {

      onUpdateGenerationState?.({
        hasError: true,
        isGenerating: false,
        errorMessage: error
      });
      onError?.(error);
    }, [onError, onUpdateGenerationState])
  };

  // Функції управління генерацією
  const startGeneration = useCallback(async () => {
    if (!adapter) return;

    try {
      onUpdateGenerationState?.({
        isGenerating: true,
        hasError: false,
        errorMessage: '',
        isCompleted: false
      });
      

      
      await adapter.startTemplateGeneration(
        generatedPlan,
        templateData,
        generationCallbacks
      );
      
    } catch (error) {
      const message = error instanceof Error ? error.message : t('createLesson.step3.errors.unknown');
      onUpdateGenerationState?.({
        hasError: true,
        isGenerating: false,
        errorMessage: message
      });
      onError?.(message);
    }
  }, [adapter, generatedPlan, templateData, generationCallbacks, onError, onUpdateGenerationState, t]);

  // Автоматичне відновлення генерації при поверненні на крок 3
  useEffect(() => {
    if (adapter && isGenerating && !currentLesson && !hasError) {
      // Якщо генерація була в процесі, але адаптер не активний, відновлюємо генерацію

      startGeneration();
    }
  }, [adapter, isGenerating, currentLesson, hasError, startGeneration]);

  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    // TODO: Implement actual pause logic in adapter

  }, []);

  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
    // TODO: Implement actual resume logic in adapter

  }, []);

  const stopGeneration = useCallback(() => {
    if (adapter) {
      adapter.stopGeneration();
    }
    onUpdateGenerationState?.({
      isGenerating: false
    });
    setIsPaused(false);

  }, [adapter, onUpdateGenerationState]);

  const restartGeneration = useCallback(() => {
    onClearLesson?.(); // Очищаємо урок в глобальному стані
    onClearGenerationState?.(); // Очищаємо стан генерації
    
    if (adapter) {
      adapter.cleanup();
    }
    setGenerationStats(null);
    
    // Перезапускаємо через короткий час
    setTimeout(() => {
      startGeneration();
    }, 500);
  }, [adapter, startGeneration, onClearLesson, onClearGenerationState]);

  // Обробники UI подій
  const handleSlideSelect = useCallback((slideId: string) => {
    setSelectedSlideId(slideId);
  }, []);

  const handleSlideFullscreen = useCallback((slideIndex: number) => {
    setSlideDialogIndex(slideIndex);
    setSlideDialogOpen(true);
  }, []);

  // === ФУНКЦІЇ ДІАЛОГУ ЗБЕРЕЖЕННЯ (СПРОЩЕНИЙ ПІДХІД) ===

  const openSaveDialog = useCallback(() => {
    // Підготовуємо всі дані для збереження
    const saveData = prepareLessonSaveData();
    
    if (!saveData) {
      return;
    }

    setLessonSaveData(saveData);
    setSaveDialogOpen(true);
  }, [prepareLessonSaveData]);

  const closeSaveDialog = useCallback(() => {
    setSaveDialogOpen(false);
    setLessonSaveData(null);
  }, []);

  const handleSaveLesson = useCallback(() => {
    openSaveDialog();
  }, [openSaveDialog]);

  const handleSaveSuccess = useCallback((savedLesson: any) => {
    setSaveSuccess(true);
    setShowSuccessSnackbar(true);
    onLessonSaved?.(savedLesson);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  }, [onLessonSaved]);

  const handleSaveError = useCallback((error: string) => {
    setSaveError(error);
    onError?.(error);
  }, [onError]);

  const handleCloseSuccessSnackbar = useCallback(() => {
    setShowSuccessSnackbar(false);
  }, []);

  // Обробник відкриття результатів редагування
  const handleShowResults = useCallback(() => {
    setShowEditingResults(true);
  }, []);

  // Обробник закриття результатів
  const handleCloseResults = useCallback(() => {
    setShowEditingResults(false);
  }, []);

  // Автоматично показуємо результати коли з'являються нові зміни
  useEffect(() => {
    if (slideEditingState.slideChanges && Object.keys(slideEditingState.slideChanges).length > 0) {
      // Показуємо результати тільки якщо немає pending коментарів
      if (slideEditingState.pendingComments.length === 0) {
        setShowEditingResults(true);
      }
    }
  }, [slideEditingState.slideChanges, slideEditingState.pendingComments.length]);

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

  // Idle стан - коли уроку немає і генерація не йде
  const renderIdleState = () => (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 6, textAlign: 'center' }}>
        <SlidesIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 3 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t('createLesson.step3.idle.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {t('createLesson.step3.idle.description')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Chip 
            label={`${templateData.slideCount} ${t('createLesson.step3.slides')}`}
            variant="outlined" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={templateData.ageGroup}
            variant="outlined" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={templateData.topic}
            variant="outlined" 
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{ minWidth: 120 }}
          >
            {t('createLesson.step3.back')}
          </Button>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<SlidesIcon />}
            onClick={startGeneration}
            disabled={!adapter}
            sx={{ 
              minWidth: 200,
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('createLesson.step3.generateSlides')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Completed стан - коли урок готовий
  const renderCompletedState = () => (
    <Card 
      elevation={2}
      sx={{ 
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 6 }}>
        {/* Slide Editing Panel */}
        <SlideEditingExpandablePanel
          slides={slides}
          comments={slideEditingState.pendingComments}
          editingProgress={slideEditingState.editingProgress}
          isProcessingComments={slideEditingState.isProcessingComments}
          slideChanges={showEditingResults ? slideEditingState.slideChanges : null}
          onRemoveComment={handleRemoveSlideComment}
          onClearAllComments={handleClearAllSlideComments}
          onStartEditing={() => processSlideComments(handleShowResults)}
          onCloseResults={handleCloseResults}
        />

        {/* Slide Grid */}
        <Box sx={{ mb: 4 }}>
          <TemplateSlideGrid
            slides={slides}
            totalSlides={templateData.slideCount}
            generationProgress={slideStore?.getState().generationProgress || new Map()}
            slideProgresses={slideProgresses}
            selectedSlideId={selectedSlideId}
            isGenerating={false}
            onSlideSelect={handleSlideSelect}
            onSlideFullscreen={handleSlideFullscreen}
            showStats={!isMobile}
            compact={isMobile}
            showCommentButtons={true}
            slideComments={slideEditingState.pendingComments}
            onAddSlideComment={handleAddSlideComment}
          />
        </Box>

        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          pt: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{ minWidth: 120 }}
          >
            {t('createLesson.step3.back')}
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={restartGeneration}
              sx={{ minWidth: 140 }}
            >
              {t('createLesson.step3.regenerate')}
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSaveLesson}
              disabled={!currentLesson || isSavingLesson}
              sx={{ minWidth: 120 }}
            >
              {isSavingLesson ? t('common:buttons.saving') : t('createLesson.step3.saveLesson')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Показуємо відповідний стан
  if (!generatedLesson && !isGenerating && !hasError) {
    return renderIdleState();
  }

  if (isCompleted && currentLesson) {
    return (
      <>
        {renderCompletedState()}
        
        {/* Slide Dialog */}
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

        {/* Simplified Save Lesson Dialog */}
        <SimplifiedSaveLessonDialog
          open={saveDialogOpen}
          lessonData={lessonSaveData}
          onClose={closeSaveDialog}
          onSuccess={handleSaveSuccess}
          onError={handleSaveError}
        />

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessSnackbar}
          autoHideDuration={8000}
          onClose={handleCloseSuccessSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2, mr: 2 }}
        >
          <Alert 
            onClose={handleCloseSuccessSnackbar} 
            severity="success"
            icon={false}
            sx={{ 
              minWidth: '350px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& .MuiAlert-icon': {
                color: 'white',
              },
              '& .MuiAlert-action': {
                color: 'white',
              },
              '& .MuiAlert-action .MuiIconButton-root': {
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
            }}
          >
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <SchoolIcon sx={{ fontSize: '1.2rem' }} />
              {t('lessons:saveDialog.successMessage')}
            </Typography>
          </Alert>
        </Snackbar>
      </>
    );
  }

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
            onClose={() => onUpdateGenerationState?.({ hasError: false })}
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {errorMessage?.includes('Demo mode') ? t('createLesson.step3.errors.demoModeTitle') : t('createLesson.step3.errors.errorTitle')}
            </Typography>
            <Typography variant="body2">
              {errorMessage || t('createLesson.step3.errors.genericError')}
            </Typography>
            {errorMessage?.includes('Demo mode') && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {t('createLesson.step3.errors.demoModeHint')}
              </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* Save Success Alert */}
        {saveSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 4 }}
            onClose={() => setSaveSuccess(false)}
          >
            <Typography variant="subtitle2" gutterBottom>
              {t('createLesson.step3.saveSuccess.title')}
            </Typography>
            <Typography variant="body2">
              {t('createLesson.step3.saveSuccess.description')}
            </Typography>
          </Alert>
        )}

        {/* Save Error Alert */}
        {saveError && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            onClose={() => setSaveError(null)}
          >
            <Typography variant="subtitle2" gutterBottom>
              {t('createLesson.step3.saveError.title')}
            </Typography>
            <Typography variant="body2">
              {saveError}
            </Typography>
          </Alert>
        )}

        {/* Slide Editing Panel */}
        <SlideEditingExpandablePanel
          slides={slides}
          comments={slideEditingState.pendingComments}
          editingProgress={slideEditingState.editingProgress}
          isProcessingComments={slideEditingState.isProcessingComments}
          slideChanges={showEditingResults ? slideEditingState.slideChanges : null}
          onRemoveComment={handleRemoveSlideComment}
          onClearAllComments={handleClearAllSlideComments}
          onStartEditing={() => processSlideComments(handleShowResults)}
          onCloseResults={handleCloseResults}
        />

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
            showCommentButtons={isCompleted && !isGenerating}
            slideComments={slideEditingState.pendingComments}
            onAddSlideComment={handleAddSlideComment}
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
            {t('createLesson.step3.back')}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSaveLesson}
            disabled={!isCompleted || !currentLesson || isSavingLesson}
            sx={{ minWidth: 120 }}
          >
            {isSavingLesson ? t('common:buttons.saving') : t('createLesson.step3.saveLesson')}
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

    {/* Simplified Save Lesson Dialog */}
    <SimplifiedSaveLessonDialog
      open={saveDialogOpen}
      lessonData={lessonSaveData}
      onClose={closeSaveDialog}
      onSuccess={handleSaveSuccess}
      onError={handleSaveError}
    />

    {/* Success Snackbar */}
    <Snackbar
      open={showSuccessSnackbar}
      autoHideDuration={8000}
      onClose={handleCloseSuccessSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 2, mr: 2 }}
    >
      <Alert 
        onClose={handleCloseSuccessSnackbar} 
        severity="success"
        icon={false}
        sx={{ 
          minWidth: '350px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '& .MuiAlert-icon': {
            color: 'white',
          },
          '& .MuiAlert-action': {
            color: 'white',
          },
          '& .MuiAlert-action .MuiIconButton-root': {
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SchoolIcon sx={{ fontSize: '1.2rem' }} />
          {t('lessons:saveDialog.successMessage')}
        </Typography>
      </Alert>
    </Snackbar>

    </>
  );
};

export default Step3SlideGeneration;
