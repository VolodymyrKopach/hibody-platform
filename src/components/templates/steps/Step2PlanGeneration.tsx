import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { 
  AutoStories as PlanIcon,
  ArrowForward as NextIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown';
import { StructuredLessonPlan } from '@/components/templates/lesson-plan';
import { lessonPlanService, LessonPlanServiceError } from '@/services/templates/LessonPlanService';
import { TemplateData, GenerationState } from '@/types/templates';

interface Step2Props {
  data: TemplateData;
  generatedPlan: string | null;
  onPlanGenerated: (plan: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2PlanGeneration: React.FC<Step2Props> = ({ 
  data, 
  generatedPlan, 
  onPlanGenerated, 
  onNext, 
  onBack 
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const hasInitialized = useRef(false);

  // Auto-generate plan when component mounts if no plan exists
  useEffect(() => {
    if (!generatedPlan && generationState === 'idle' && !hasInitialized.current) {
      hasInitialized.current = true;
      handleGeneratePlan();
    }
  }, [generatedPlan, generationState]);

  // Simulate progress during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (generationState === 'generating') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationState]);

  const handleGeneratePlan = async () => {
    try {
      setGenerationState('generating');
      setError(null);
      setProgress(0);

      const request = {
        ageGroup: data.ageGroup,
        topic: data.topic,
        slideCount: data.slideCount,
        additionalInfo: data.additionalInfo || undefined,
        language: 'en'
      };

      // Validate request
      const validation = lessonPlanService.validateRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const plan = await lessonPlanService.generateLessonPlan(request);
      
      setProgress(100);
      setGenerationState('success');
      onPlanGenerated(plan);

    } catch (error) {
      console.error('Error generating lesson plan:', error);
      setGenerationState('error');
      
      if (error instanceof LessonPlanServiceError) {
        setError(error.getUserMessage());
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleRetry = () => {
    setGenerationState('idle');
    setError(null);
    hasInitialized.current = false; // Reset the flag for retry
    handleGeneratePlan();
  };

  const renderGeneratingState = () => (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 6, textAlign: 'center' }}>
        <PlanIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 3 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t('createLesson.step2.generating.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {t('createLesson.step2.generating.description')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Math.round(progress)}% {t('createLesson.step2.generating.progress')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Chip 
            label={`${t('createLesson.step2.ageGroup')}: ${data.ageGroup}`} 
            variant="outlined" 
          />
          <Chip 
            label={`${t('createLesson.step2.topic')}: ${data.topic}`} 
            variant="outlined" 
          />
          <Chip 
            label={`${t('createLesson.step2.slides')}: ${data.slideCount}`} 
            variant="outlined" 
          />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderErrorState = () => (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 6 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry} startIcon={<RefreshIcon />}>
              {t('createLesson.step2.error.retry')}
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            {t('createLesson.step2.error.title')}
          </Typography>
          <Typography variant="body2">
            {error || t('createLesson.step2.error.generic')}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{ minWidth: 120 }}
          >
            {t('createLesson.step2.back')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ minWidth: 120 }}
          >
            {t('createLesson.step2.error.retry')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSuccessState = () => (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {t('createLesson.step2.success.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('createLesson.step2.success.description')}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Plan Content */}
        <Box sx={{ 
          maxHeight: 800, 
          overflow: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 2,
          backgroundColor: theme.palette.background.default
        }}>
          {generatedPlan && (
            <StructuredLessonPlan markdown={generatedPlan} />
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{ minWidth: 120 }}
          >
            {t('createLesson.step2.back')}
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ minWidth: 140 }}
            >
              {t('createLesson.step2.regenerate')}
            </Button>
            
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={onNext}
              sx={{ 
                minWidth: 160,
                fontWeight: 600
              }}
            >
              {t('createLesson.step2.next')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Render based on current state
  if (generationState === 'generating') {
    return renderGeneratingState();
  }

  if (generationState === 'error') {
    return renderErrorState();
  }

  if (generationState === 'success' && generatedPlan) {
    return renderSuccessState();
  }

  // Fallback - should not happen
  return renderGeneratingState();
};

export default Step2PlanGeneration;
