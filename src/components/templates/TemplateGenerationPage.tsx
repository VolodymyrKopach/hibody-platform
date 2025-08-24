'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import StepProgress from './steps/StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2PlanGeneration from './steps/Step2PlanGeneration';
import Step3SlideGeneration from './steps/Step3SlideGeneration';
import { TemplateData, GeneratedPlan } from '@/types/templates';
import { SimpleLesson } from '@/types/chat';

const TemplateGenerationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState<TemplateData>({
    ageGroup: '',
    topic: '',
    slideCount: 4,
    additionalInfo: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<SimpleLesson | null>(null);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    console.error('❌ Generation error:', error);
    // Можна додати toast notification або інший UI feedback
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <StepProgress currentStep={currentStep} />
        </Box>

        {currentStep === 1 && (
          <Step1BasicInfo
            data={templateData}
            onChange={setTemplateData}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2PlanGeneration
            data={templateData}
            generatedPlan={generatedPlan}
            onPlanGenerated={handlePlanGenerated}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && generatedPlan && (
          <Step3SlideGeneration
            templateData={templateData}
            generatedPlan={generatedPlan}
            onBack={handleBack}
            onNext={handleNext}
            onLessonSaved={handleLessonSaved}
            onError={handleGenerationError}
          />
        )}
      </Container>
    </Box>
  );
};

export default TemplateGenerationPage;
