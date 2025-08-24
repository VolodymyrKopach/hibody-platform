import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StepProgressProps {
  currentStep: number;
}

const steps = [
  { label: 'Базова інформація', description: 'Вік, тема, кількість слайдів' },
  { label: 'Перегляд плану', description: 'Перегляд та налаштування плану' },
  { label: 'Генерація', description: 'Створення слайдів' }
];

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper activeStep={currentStep - 1} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography 
                variant="h6" 
                color={currentStep > index ? 'primary' : 'text.secondary'}
                sx={{ fontWeight: currentStep > index ? 600 : 400 }}
              >
                {step.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepProgress;
