'use client';

import React, { useState } from 'react';
import { Container, Box, CircularProgress, Stack, Typography, alpha, useTheme } from '@mui/material';
import Step1WorksheetParameters from './Step1WorksheetParameters';
import Step3CanvasEditor from './Step3CanvasEditor';

type WorksheetStep = 'parameters' | 'generating' | 'canvas';

const WorksheetEditor: React.FC = () => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState<WorksheetStep>('parameters');
  const [parameters, setParameters] = useState<any>(null);

  const handleGenerateWorksheet = (params: any) => {
    console.log('Generating worksheet with params:', params);
    setParameters(params);
    setCurrentStep('generating');
    
    // Simulate AI generation
    setTimeout(() => {
      setCurrentStep('canvas');
    }, 2000);
  };

  const handleBackToParameters = () => {
    setCurrentStep('parameters');
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      {currentStep === 'parameters' && (
        <Container maxWidth="xl">
          <Step1WorksheetParameters onGenerate={handleGenerateWorksheet} />
        </Container>
      )}
      
      {currentStep === 'generating' && (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
          }}
        >
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} thickness={4} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                ✨ Generating Worksheet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creating {parameters?.numberOfPages || 3} pages with AI...
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {currentStep === 'canvas' && (
        <Step3CanvasEditor
          parameters={parameters}
          onBack={handleBackToParameters}
        />
      )}
    </Box>
  );
};

export default WorksheetEditor;
