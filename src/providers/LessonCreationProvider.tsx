'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  LessonCreationContextValue, 
  LessonCreationState, 
  TemplateData, 
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

  const setCurrentStep = useCallback((step: LessonCreationStep) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const updateTemplateData = useCallback((data: Partial<TemplateData>) => {
    setState(prev => ({ 
      ...prev, 
      templateData: { ...prev.templateData, ...data }
    }));
  }, []);

  const setGeneratedPlan = useCallback((plan: string) => {
    console.log('🔄 PROVIDER: Setting generated plan', {
      planType: typeof plan,
      planLength: plan?.length || 0,
      isString: typeof plan === 'string',
      planPreview: typeof plan === 'string' ? plan.substring(0, 100) + '...' : plan
    });
    
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
      if (newState.isGenerating || newState.slides?.length > 0 || newState.currentLesson) {
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
    
    console.log('🔄 PROVIDER: Processing comments', {
      hasGeneratedPlan: !!generatedPlan,
      planType: typeof generatedPlan,
      planLength: generatedPlan?.length || 0,
      commentsCount: planEditingState.pendingComments.length
    });
    
    // Validate plan (can be string or object)
    if (!generatedPlan) {
      console.error('❌ PROVIDER: Cannot process comments - no plan available');
      return;
    }
    
    if (planEditingState.pendingComments.length === 0) {
      console.warn('⚠️ PROVIDER: No comments to process');
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
        generatedPlan, // Pass plan directly (string or object)
        planEditingState.pendingComments,
        {
          ageGroup: templateData.ageGroup,
          topic: templateData.topic,
          slideCount: templateData.slideCount
        }
      );

      const { editedPlan, planChanges } = result;

      // Service now returns object directly, no conversion needed
      console.log('✅ PROVIDER: Received edited plan', {
        editedPlanType: typeof editedPlan,
        isObject: typeof editedPlan === 'object',
        hasChanges: !!planChanges,
        changesCount: planChanges?.summary.totalChanges || 0
      });

      // Create history entry
      const historyEntry = {
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        originalPlan: generatedPlan,
        editedPlan,
        appliedComments: [...planEditingState.pendingComments],
        success: true
      };

      setState(prev => ({
        ...prev,
        generatedPlan: editedPlan, // Use edited plan directly
        planChanges, // Store plan changes
        planEditingState: {
          ...initialPlanEditingState,
          editHistory: [...prev.planEditingState.editHistory, historyEntry],
          lastEditTimestamp: new Date()
        }
      }));

    } catch (error) {
      console.error('❌ PROVIDER: Error processing comments:', error);
      
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

    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        pendingComments: [...prev.slideEditingState.pendingComments, newComment]
      }
    }));
  }, []);

  const removeSlideComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      slideEditingState: {
        ...prev.slideEditingState,
        pendingComments: prev.slideEditingState.pendingComments.filter(c => c.id !== commentId)
      }
    }));
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
      console.warn('No slide comments to process');
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
      // Обробляємо слайди послідовно
      for (let i = 0; i < slidesToEdit.length; i++) {
        const slideId = slidesToEdit[i];
        const slideComments = commentsBySlide[slideId];
        const slide = slideGenerationState.slides.find(s => s.id === slideId);
        
        if (!slide) continue;

        // Оновлюємо статус на "processing"
        setState(prev => ({
          ...prev,
          slideEditingState: {
            ...prev.slideEditingState,
            editingProgress: prev.slideEditingState.editingProgress.map(p =>
              p.slideId === slideId 
                ? { ...p, status: 'processing', currentOperation: 'Analyzing comments...' }
                : p
            )
          }
        }));

        try {
          // Викликаємо API для редагування слайду
          const response = await fetch('/api/slides/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slide,
              comments: slideComments,
              context: {
                ageGroup: state.templateData.ageGroup,
                topic: state.templateData.topic
              }
            })
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to edit slide');
          }

          const { editedSlide, slideChanges } = result;

          // Оновлюємо слайд та прогрес
          setState(prev => ({
            ...prev,
            slideGenerationState: {
              ...prev.slideGenerationState,
              slides: prev.slideGenerationState.slides.map(s =>
                s.id === slideId ? editedSlide : s
              )
            },
            slideEditingState: {
              ...prev.slideEditingState,
              editingProgress: prev.slideEditingState.editingProgress.map(p =>
                p.slideId === slideId 
                  ? { ...p, status: 'completed', progress: 100 }
                  : p
              ),
              slideChanges: {
                ...prev.slideEditingState.slideChanges,
                [slideId]: slideChanges
              }
            }
          }));

        } catch (error) {
          console.error(`Failed to edit slide ${slideId}:`, error);
          
          // Оновлюємо статус на "error"
          setState(prev => ({
            ...prev,
            slideEditingState: {
              ...prev.slideEditingState,
              editingProgress: prev.slideEditingState.editingProgress.map(p =>
                p.slideId === slideId 
                  ? { ...p, status: 'error', progress: 0 }
                  : p
              )
            }
          }));
        }
      }

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

      // Викликаємо callback після завершення
      if (typeof onComplete === 'function') {
        onComplete();
      }

    } catch (error) {
      console.error('Error processing slide comments:', error);
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
