'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import StepProgress from './steps/StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2PlanGeneration from './steps/Step2PlanGeneration';
import Step3SlideGeneration from './steps/Step3SlideGeneration';
import { useLessonCreation } from '@/providers/LessonCreationProvider';
import { SimpleLesson } from '@/types/chat';

const TemplateGenerationPage: React.FC = () => {
  const { 
    state, 
    setCurrentStep, 
    updateTemplateData, 
    setGeneratedPlan, 
    setGeneratedLesson, 
    setError,
    clearGeneratedPlan,
    clearGeneratedLesson,
    updateSlideGenerationState,
    clearSlideGenerationState,
    markStepCompleted,
    canNavigateToStep
  } = useLessonCreation();

  const handleNext = () => {
    // Mark current step as completed before moving to next
    markStepCompleted(state.currentStep);
    
    if (state.currentStep < 3) {
      setCurrentStep((state.currentStep + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      setCurrentStep((state.currentStep - 1) as 1 | 2 | 3);
    }
  };

  const handlePlanGenerated = (plan: string) => {
    setGeneratedPlan(plan);
  };

  const handleLessonSaved = (lesson: SimpleLesson) => {
    setGeneratedLesson(lesson);
    console.log('✅ Lesson saved successfully:', lesson.title);
  };

  const handleGenerationError = (error: string) => {
    setError(error);
    console.error('❌ Generation error:', error);
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <StepProgress 
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={handleStepClick}
            canNavigateToStep={canNavigateToStep}
          />
        </Box>

        {state.currentStep === 1 && (
          <Step1BasicInfo
            data={state.templateData}
            onChange={updateTemplateData}
            onNext={handleNext}
          />
        )}

        {state.currentStep === 2 && (
          <Step2PlanGeneration
            data={state.templateData}
            generatedPlan={state.generatedPlan}
            onPlanGenerated={handlePlanGenerated}
            onNext={handleNext}
            onBack={handleBack}
            onClearPlan={clearGeneratedPlan}
            hasSlides={Boolean(
              state.generatedLesson || 
              state.slideGenerationState.slides.length > 0
            )}
          />
        )}

        {state.currentStep === 3 && state.generatedPlan && (
          <Step3SlideGeneration
            templateData={state.templateData}
            generatedPlan={state.generatedPlan}
            generatedLesson={state.generatedLesson}
            slideGenerationState={state.slideGenerationState}
            onBack={handleBack}
            onNext={handleNext}
            onLessonSaved={handleLessonSaved}
            onError={handleGenerationError}
            onClearLesson={clearGeneratedLesson}
            onUpdateGenerationState={updateSlideGenerationState}
            onClearGenerationState={clearSlideGenerationState}
          />
        )}
      </Container>
    </Box>
  );
};

export default TemplateGenerationPage;
