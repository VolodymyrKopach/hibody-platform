'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LessonCreationContextValue,
  LessonCreationState,
  TemplateData,
  GeneratedPlanResponse,
  LessonCreationStep,
  PlanComment,
  PlanEditingState,
  PlanChanges,
  SlideComment,
  SlideEditingState,
  SlideEditingProgress
} from '@/types/templates';
import { SimpleLesson } from '@/types/chat';
import { planEditingService } from '@/services/templates/PlanEditingService';
import { getLocalThumbnailStorage } from '@/services/slides/LocalThumbnailService';

const LessonCreationContext = createContext<LessonCreationContextValue | null>(null);

const initialTemplateData: TemplateData = {
  ageGroup: '',
  topic: '',
  slideCount: 4,
  additionalInfo: ''
};

const initialSlideGenerationState = {
  isGenerating: false,
  isCompleted: false,
  hasError: false,
  errorMessage: '',
  slides: [],
  currentLesson: null,
  slideProgresses: []
};

const initialPlanEditingState: PlanEditingState = {
  isEditingMode: false,
  selectedSection: null,
  pendingComments: [],
  isProcessingComments: false,
  lastEditTimestamp: null,
  editHistory: []
};

const initialSlideEditingState: SlideEditingState = {
  isEditingMode: false,
  selectedSlideId: null,
  pendingComments: [],
  isProcessingComments: false,
  editingProgress: [],
  slideChanges: null
};

const initialState: LessonCreationState = {
  currentStep: 1,
  completedSteps: new Set([1]), // Step 1 is always accessible
  templateData: initialTemplateData,
  generatedPlan: null,
  generatedLesson: null,
  isLoading: false,
  error: null,
  planEditingState: initialPlanEditingState,
  planChanges: null,
  slideEditingState: initialSlideEditingState,
  slideGenerationState: initialSlideGenerationState
};

interface LessonCreationProviderProps {
  children: React.ReactNode;
}

export const LessonCreationProvider: React.FC<LessonCreationProviderProps> = ({ children }) => {
  const [state, setState] = useState<LessonCreationState>(initialState);
  const { i18n } = useTranslation();

  const setCurrentStep = useCallback((step: LessonCreationStep) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const updateTemplateData = useCallback((data: Partial<TemplateData>) => {
    setState(prev => ({
      ...prev,
      templateData: { ...prev.templateData, ...data }
    }));
  }, []);

  const setGeneratedPlan = useCallback((plan: GeneratedPlanResponse) => {
    setState(prev => ({
      ...prev,
      generatedPlan: plan,
      completedSteps: new Set([...prev.completedSteps, 2]) // Plan generated, step 2 completed
    }));
  }, []);

  const setGeneratedLesson = useCallback((lesson: SimpleLesson) => {
    setState(prev => ({
      ...prev,
      generatedLesson: lesson,
      completedSteps: new Set([...prev.completedSteps, 3]) // Lesson completed
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearGeneratedPlan = useCallback(() => {
    setState(prev => ({
      ...prev,
      generatedPlan: null,
      // Also clear slides and lesson when regenerating plan
      generatedLesson: null,
      slideGenerationState: initialSlideGenerationState,
      // Remove step 3 from completed steps since slides are cleared
      completedSteps: new Set([...prev.completedSteps].filter(step => step !== 3))
    }));
  }, []);

  const clearGeneratedLesson = useCallback(() => {
    setState(prev => ({ ...prev, generatedLesson: null }));
  }, []);

  const updateSlideGenerationState = useCallback((newState: Partial<LessonCreationState['slideGenerationState']>) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        slideGenerationState: {
          ...prev.slideGenerationState,
          ...newState
        }
      };

      // Add step 3 to completed steps if slides are generated or generation is in progress
      if (newState.isGenerating || (newState.slides && newState.slides.length > 0) || newState.currentLesson) {
        updatedState.completedSteps = new Set([...prev.completedSteps, 3]);
      }

      return updatedState;
    });
  }, []);

  const clearSlideGenerationState = useCallback(() => {
    setState(prev => ({
      ...prev,
      slideGenerationState: initialSlideGenerationState,
      // Remove step 3 from completed steps when clearing slide generation state
      completedSteps: new Set([...prev.completedSteps].filter(step => step !== 3))
    }));
  }, []);

  const markStepCompleted = useCallback((step: LessonCreationStep) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, step])
    }));
  }, []);

  const canNavigateToStep = useCallback((step: LessonCreationStep) => {
    switch (step) {
      case 1:
        return true; // Always can go to step 1
      case 2:
        // Can go to step 2 if step 1 has basic data
        return Boolean(state.templateData.ageGroup && state.templateData.topic);
      case 3:
        // Can go to step 3 if plan is generated (slides are optional)
        return Boolean(state.generatedPlan);
      default:
        return false;
    }
  }, [
    state.templateData.ageGroup,
    state.templateData.topic,
    state.generatedPlan
  ]);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // === Plan Editing Methods ===

  const enterEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        isEditingMode: true
      }
    }));
  }, []);

  const exitEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        isEditingMode: false,
        selectedSection: null
      }
    }));
  }, []);

  const addComment = useCallback((comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    const newComment = planEditingService.createComment(
      comment.sectionType,
      comment.comment,
      comment.sectionId,
      comment.priority
    );

    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        pendingComments: [...prev.planEditingState.pendingComments, newComment]
      }
    }));
  }, []);

  const removeComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        pendingComments: prev.planEditingState.pendingComments.filter(c => c.id !== commentId)
      }
    }));
  }, []);

  const updateComment = useCallback((commentId: string, updates: Partial<PlanComment>) => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        pendingComments: prev.planEditingState.pendingComments.map(comment =>
          comment.id === commentId ? { ...comment, ...updates } : comment
        )
      }
    }));
  }, []);

  const clearAllComments = useCallback(() => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        pendingComments: []
      }
    }));
  }, []);

  const processComments = useCallback(async () => {
    const { generatedPlan, planEditingState, templateData } = state;

    // Validate plan (can be string or object)
    if (!generatedPlan || planEditingState.pendingComments.length === 0) {
      return;
    }

    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        isProcessingComments: true
      }
    }));

    try {
      const result = await planEditingService.processComments(
        generatedPlan?.plan, // Pass plan object directly
        planEditingState.pendingComments,
        {
          ageGroup: templateData.ageGroup,
          topic: templateData.topic,
          slideCount: templateData.slideCount
        }
      );

      const { editedPlan, planChanges } = result;

      // Service now returns object directly, no conversion needed

      // Create history entry
      const historyEntry = {
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        originalPlan: generatedPlan,
        editedPlan: {
          success: true,
          plan: editedPlan
        },
        appliedComments: [...planEditingState.pendingComments],
        success: true
      };

      setState(prev => ({
        ...prev,
        generatedPlan: {
          success: true,
          plan: editedPlan
        }, // Store as GeneratedPlanResponse object
        planChanges: planChanges || null, // Store plan changes
        planEditingState: {
          ...initialPlanEditingState,
          editHistory: [...prev.planEditingState.editHistory, historyEntry],
          lastEditTimestamp: new Date()
        }
      }));

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to process comments';

      // Create failed history entry
      const historyEntry = {
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        originalPlan: generatedPlan,
        editedPlan: generatedPlan, // Keep original on failure
        appliedComments: [...planEditingState.pendingComments],
        success: false,
        error: errorMessage
      };

      setState(prev => ({
        ...prev,
        error: errorMessage,
        planEditingState: {
          ...prev.planEditingState,
          isProcessingComments: false,
          editHistory: [...prev.planEditingState.editHistory, historyEntry]
        }
      }));
    }
  }, [state]);

  const updatePlanEditingState = useCallback((newState: Partial<PlanEditingState>) => {
    setState(prev => ({
      ...prev,
      planEditingState: {
        ...prev.planEditingState,
        ...newState
      }
    }));
  }, []);

  // === Plan Changes Methods ===

  const setPlanChanges = useCallback((changes: PlanChanges | null) => {
    setState(prev => ({
      ...prev,
      planChanges: changes
    }));
  }, []);

  const clearPlanChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      planChanges: null
    }));
  }, []);

  // === Slide Editing Methods ===

  const enterSlideEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        isEditingMode: true
      }
    }));
  }, []);

  const exitSlideEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        isEditingMode: false,
        selectedSlideId: null
      }
    }));
  }, []);

  const addSlideComment = useCallback((comment: Omit<SlideComment, 'id' | 'timestamp'>) => {
    const newComment: SlideComment = {
      ...comment,
      id: `slide_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setState(prev => {
      const newPendingComments = [...prev.slideEditingState.pendingComments, newComment];

      return {
        ...prev,
        slideEditingState: {
          ...prev.slideEditingState,
          pendingComments: newPendingComments
        }
      };
    });
  }, []);

  const removeSlideComment = useCallback((commentId: string) => {
    setState(prev => {
      const filteredComments = prev.slideEditingState.pendingComments.filter(c => c.id !== commentId);

      return {
        ...prev,
        slideEditingState: {
          ...prev.slideEditingState,
          pendingComments: filteredComments
        }
      };
    });
  }, []);

  const clearAllSlideComments = useCallback(() => {
    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        pendingComments: []
      }
    }));
  }, []);

  const processSlideComments = useCallback(async (onComplete?: () => void) => {
    const { slideEditingState, slideGenerationState } = state;

    if (slideEditingState.pendingComments.length === 0) {
      return;
    }

    // Групуємо коментарі по слайдах
    const commentsBySlide = slideEditingState.pendingComments.reduce((acc, comment) => {
      if (!acc[comment.slideId]) {
        acc[comment.slideId] = [];
      }
      acc[comment.slideId].push(comment);
      return acc;
    }, {} as Record<string, SlideComment[]>);

    const slidesToEdit = Object.keys(commentsBySlide);

    // Ініціалізуємо прогрес
    const initialProgress: SlideEditingProgress[] = slidesToEdit.map(slideId => ({
      slideId,
      status: 'pending',
      progress: 0
    }));



    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        isProcessingComments: true,
        editingProgress: initialProgress
      }
    }));

    try {
      // Обробляємо слайди паралельно для кращої швидкості
      const editPromises = slidesToEdit.map(async (slideId) => {
        const slideComments = commentsBySlide[slideId];
        const slide = slideGenerationState.slides.find(s => s.id === slideId);

        if (!slide) {
          return { slideId, success: false, error: 'Slide not found' };
        }

        // Оновлюємо статус на "processing" і запускаємо симуляцію прогресу
        setState(prev => ({
          ...prev,
          slideEditingState: {
            ...prev.slideEditingState,
            editingProgress: prev.slideEditingState.editingProgress.map(p =>
              p.slideId === slideId
                ? { ...p, status: 'processing', progress: 0, currentOperation: 'Starting edit...' }
                : p
            )
          }
        }));

        // Progress simulation (0% → 90% over ~36 seconds, slowed down by 2x)
        const progressInterval = setInterval(() => {
          setState(prev => ({
            ...prev,
            slideEditingState: {
              ...prev.slideEditingState,
              editingProgress: prev.slideEditingState.editingProgress.map(p => {
                if (p.slideId === slideId && p.status === 'processing' && p.progress < 90) {
                  const increment = Math.random() * 8 + 2; // 2-10% per step
                  const newProgress = Math.min(90, p.progress + increment);

                  let currentOperation = 'Processing...';
                  if (newProgress < 30) currentOperation = 'Analyzing comments...';
                  else if (newProgress < 60) currentOperation = 'Applying changes...';
                  else if (newProgress < 90) currentOperation = 'Finalizing edits...';
                  else currentOperation = 'Waiting for completion...';

                  return { ...p, progress: newProgress, currentOperation };
                }
                return p;
              })
            }
          }));
        }, 2000); // Update every 2 seconds (slowed down by 2x)

        try {
          // Викликаємо API для редагування слайду
          const apiPayload = {
            slide,
            comments: slideComments,
            context: {
              ageGroup: state.templateData.ageGroup,
              topic: state.templateData.topic
            },
            language: i18n.language === 'uk' ? 'uk' : 'en'
          };

          const response = await fetch('/api/slides/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to edit slide');
          }

          const { editedSlide, slideChanges } = result;

          // Регенеруємо превью для оновленого слайду
          if (editedSlide.htmlContent) {
            try {
              const thumbnailStorage = getLocalThumbnailStorage();

              // Видаляємо старе превью з кешу
              thumbnailStorage.delete(slideId);

              // Генеруємо нове превью асинхронно
              thumbnailStorage.generateThumbnail(slideId, editedSlide.htmlContent, {
                quality: 0.85,
                background: '#ffffff',
                compress: true,
                embedFonts: false,
                fast: true
              }).then(() => {
                // Тригеримо подію для оновлення превью в UI
                window.dispatchEvent(new CustomEvent('thumbnailRegenerated', {
                  detail: { slideId, editedSlide }
                }));
              }).catch(() => {
                // Silent error handling for thumbnail regeneration
              });

            } catch (thumbnailError) {
              // Silent error handling for thumbnail start
            }
          }

          // Зупиняємо симуляцію прогресу
          clearInterval(progressInterval);

          // Оновлюємо слайд та прогрес
          setState(prev => {
            const updatedSlides = prev.slideGenerationState.slides.map(s =>
              s.id === slideId ? editedSlide : s
            );

            // Тригеримо подію для синхронізації з SlideStore
            window.dispatchEvent(new CustomEvent('slideEdited', {
              detail: {
                slideId,
                editedSlide,
                updatedSlides
              }
            }));

            // Оновлюємо currentLesson з новими слайдами
            const updatedLesson = prev.slideGenerationState.currentLesson ? {
              ...prev.slideGenerationState.currentLesson,
              slides: updatedSlides
            } : null;

            return {
              ...prev,
              slideGenerationState: {
                ...prev.slideGenerationState,
                slides: updatedSlides,
                currentLesson: updatedLesson,
                // Додаємо timestamp для форсування оновлення
                lastEditTimestamp: new Date().toISOString()
              },
              slideEditingState: {
                ...prev.slideEditingState,
                editingProgress: prev.slideEditingState.editingProgress.map(p =>
                  p.slideId === slideId
                    ? { ...p, status: 'completed', progress: 100, currentOperation: 'Completed!' }
                    : p
                ),
                slideChanges: {
                  ...prev.slideEditingState.slideChanges,
                  [slideId]: slideChanges
                }
              }
            };
          });

          return { slideId, success: true, editedSlide, slideChanges };

        } catch (error) {
          // Зупиняємо симуляцію прогресу при помилці
          clearInterval(progressInterval);

          const errorMessage = error instanceof Error ? error.message : String(error);

          // Показуємо помилку користувачу через snackbar
          window.dispatchEvent(new CustomEvent('slideEditError', {
            detail: {
              slideId,
              slideTitle: slide?.title,
              error: errorMessage,
              isRetryable: errorMessage.includes('overloaded') || errorMessage.includes('503')
            }
          }));

          // Оновлюємо статус на "error"
          setState(prev => ({
            ...prev,
            slideEditingState: {
              ...prev.slideEditingState,
              editingProgress: prev.slideEditingState.editingProgress.map(p =>
                p.slideId === slideId
                  ? { ...p, status: 'error', progress: 0, currentOperation: 'Error occurred' }
                  : p
              )
            }
          }));

          return { slideId, success: false, error: errorMessage };
        }
      });

      // Чекаємо завершення всіх паралельних запитів
      const results = await Promise.allSettled(editPromises);

      // Завершуємо процес

      setState(prev => ({
        ...prev,
        slideEditingState: {
          ...prev.slideEditingState,
          isProcessingComments: false,
          pendingComments: [], // Очищаємо коментарі після обробки
          isEditingMode: false
        }
      }));

      // UI will update automatically when state changes - no forced refresh needed

      // Викликаємо callback після завершення
      if (typeof onComplete === 'function') {
        onComplete();
      }

    } catch (error) {

      setState(prev => ({
        ...prev,
        slideEditingState: {
          ...prev.slideEditingState,
          isProcessingComments: false
        }
      }));
    }
  }, [state]);

  const updateSlideEditingState = useCallback((newState: Partial<SlideEditingState>) => {
    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        ...newState
      }
    }));
  }, []);

  const contextValue: LessonCreationContextValue = {
    state,
    setCurrentStep,
    updateTemplateData,
    setGeneratedPlan,
    setGeneratedLesson,
    setLoading,
    setError,
    clearGeneratedPlan,
    clearGeneratedLesson,
    resetState,
    // Plan editing methods
    enterEditMode,
    exitEditMode,
    addComment,
    removeComment,
    updateComment,
    clearAllComments,
    processComments,
    updatePlanEditingState,
    // Slide editing methods
    enterSlideEditMode,
    exitSlideEditMode,
    addSlideComment,
    removeSlideComment,
    clearAllSlideComments,
    processSlideComments,
    updateSlideEditingState,
    // Slide generation state management
    updateSlideGenerationState,
    clearSlideGenerationState,
    // Step completion management
    markStepCompleted,
    canNavigateToStep,
    // Plan changes management
    setPlanChanges,
    clearPlanChanges
  };

  return (
    <LessonCreationContext.Provider value={contextValue}>
      {children}
    </LessonCreationContext.Provider>
  );
};

export const useLessonCreation = (): LessonCreationContextValue => {
  const context = useContext(LessonCreationContext);
  if (!context) {
    throw new Error('useLessonCreation must be used within a LessonCreationProvider');
  }
  return context;
};
