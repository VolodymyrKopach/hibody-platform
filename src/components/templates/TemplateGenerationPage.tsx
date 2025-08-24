'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import StepProgress from './steps/StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';

interface TemplateData {
  ageGroup: string;
  topic: string;
  slideCount: number;
  additionalInfo: string;
}

interface GeneratedPlan {
  slides: SlideDescription[];
  totalDuration: string;
  difficulty: string;
}

interface SlideDescription {
  title: string;
  description: string;
  type: 'introduction' | 'content' | 'activity' | 'summary';
  estimatedDuration: number;
  hasInteraction: boolean;
  keyPoints: string[];
  customInstructions?: string;
}

const TemplateGenerationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState<TemplateData>({
    ageGroup: '',
    topic: '',
    slideCount: 4,
    additionalInfo: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <h2>🚧 Етап 2: Перегляд плану</h2>
          <p>В розробці...</p>
          <button onClick={handleBack}>← Назад</button>
          <button onClick={handleNext}>Далі →</button>
        </Box>
      )}

      {currentStep === 3 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <h2>🚧 Етап 3: Генерація</h2>
          <p>В розробці...</p>
          <button onClick={handleBack}>← Назад</button>
        </Box>
      )}
    </Container>
  );
};

export default TemplateGenerationPage;
