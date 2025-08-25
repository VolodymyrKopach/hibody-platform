'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  LessonCreationContextValue, 
  LessonCreationState, 
  TemplateData, 
  LessonCreationStep 
} from '@/types/templates';
import { SimpleLesson } from '@/types/chat';

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

const initialState: LessonCreationState = {
  currentStep: 1,
  completedSteps: new Set([1]), // Step 1 is always accessible
  templateData: initialTemplateData,
  generatedPlan: null,
  generatedLesson: null,
  isLoading: false,
  error: null,
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
    updateSlideGenerationState,
    clearSlideGenerationState,
    markStepCompleted,
    canNavigateToStep
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
