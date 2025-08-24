'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import StepProgress from './steps/StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2PlanGeneration from './steps/Step2PlanGeneration';
import { TemplateData, GeneratedPlan } from '@/types/templates';

const TemplateGenerationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState<TemplateData>({
    ageGroup: '',
    topic: '',
    slideCount: 4,
    additionalInfo: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

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

        {currentStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <h2>🚧 Етап 3: Генерація</h2>
            <p>В розробці...</p>
            <button onClick={handleBack}>← Назад</button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TemplateGenerationPage;
