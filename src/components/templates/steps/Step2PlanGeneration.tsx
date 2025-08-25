import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { RegenerationConfirmDialog } from '@/components/dialogs';
import { lessonPlanService, LessonPlanServiceError } from '@/services/templates/LessonPlanService';
import { TemplateData, GenerationState } from '@/types/templates';

interface Step2Props {
  data: TemplateData;
  generatedPlan: string | null;
  onPlanGenerated: (plan: string) => void;
  onNext: () => void;
  onBack: () => void;
  onClearPlan: () => void;
  hasSlides?: boolean;
}

const Step2PlanGeneration: React.FC<Step2Props> = ({ 
  data, 
  generatedPlan, 
  onPlanGenerated, 
  onNext, 
  onBack,
  onClearPlan,
  hasSlides = false
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('common');
  
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const hasInitialized = useRef(false);

  const handleGeneratePlan = useCallback(async () => {
    try {
      setGenerationState('generating');
      setError(null);
      setProgress(0);

      const request = {
        ageGroup: data.ageGroup,
        topic: data.topic,
        slideCount: data.slideCount,
        additionalInfo: data.additionalInfo || undefined,
        language: i18n.language === 'uk' ? 'uk' : 'en'
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
      setError(error instanceof LessonPlanServiceError ? error.message : 'Failed to generate lesson plan');
    }
  }, [data.ageGroup, data.topic, data.slideCount, data.additionalInfo, onPlanGenerated]);

  // Set initial state based on existing plan
  useEffect(() => {
    if (generatedPlan) {
      // Plan already exists, show success state
      setGenerationState('success');
      setError(null);
      setProgress(100);
      hasInitialized.current = true;
    } else {
      // No plan exists, reset to idle state
      hasInitialized.current = false;
      setGenerationState('idle');
      setError(null);
      setProgress(0);
    }
  }, [generatedPlan]);

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



  const handleRetry = () => {
    if (hasSlides) {
      // Show confirmation dialog if slides exist
      setShowRegenerateDialog(true);
    } else {
      // Directly regenerate if no slides
      performRegeneration();
    }
  };

  const performRegeneration = () => {
    onClearPlan(); // Clear the existing plan and slides
    setGenerationState('idle');
    setError(null);
    hasInitialized.current = false;
    // handleGeneratePlan will be called automatically after plan is cleared
    setTimeout(() => handleGeneratePlan(), 100);
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


        {/* Plan Content */}
        {generatedPlan && (
          <StructuredLessonPlan markdown={generatedPlan} />
        )}

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
              size="large"
              endIcon={<NextIcon />}
              onClick={onNext}
              sx={{ 
                minWidth: 160,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {t('createLesson.step2.next')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderIdleState = () => (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 6, textAlign: 'center' }}>
        <PlanIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 3 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t('createLesson.step2.idle.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {t('createLesson.step2.idle.description')}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            size="large"
            startIcon={<PlanIcon />}
            onClick={handleGeneratePlan}
            sx={{ 
              minWidth: 200,
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('createLesson.step2.generatePlan')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Render based on current state
  if (generationState === 'idle') {
    return renderIdleState();
  }

  if (generationState === 'generating') {
    return renderGeneratingState();
  }

  if (generationState === 'error') {
    return renderErrorState();
  }

  if (generationState === 'success' && generatedPlan) {
    return (
      <>
        {renderSuccessState()}
        
        <RegenerationConfirmDialog
          open={showRegenerateDialog}
          onClose={() => setShowRegenerateDialog(false)}
          onConfirm={performRegeneration}
          type="plan"
          hasSlides={hasSlides}
        />
      </>
    );
  }

  // Fallback
  return (
    <>
      {renderIdleState()}
      
      <RegenerationConfirmDialog
        open={showRegenerateDialog}
        onClose={() => setShowRegenerateDialog(false)}
        onConfirm={performRegeneration}
        type="plan"
        hasSlides={hasSlides}
      />
    </>
  );
};

export default Step2PlanGeneration;
