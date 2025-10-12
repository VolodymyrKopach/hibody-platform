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
  Stack,
  Collapse,
  Fab,
  Tooltip,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { 
  AutoStories as PlanIcon,
  ArrowForward as NextIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown';
import { StructuredLessonPlan } from '@/components/templates/lesson-plan';
import { RegenerationConfirmDialog } from '@/components/dialogs';
import { PaywallModal } from '@/components/dialogs/PaywallModal';
import { CommentDialog } from '@/components/templates/plan-editing';
// Updated to include planChanges prop
import { StandardCommentButton } from '@/components/ui';
import { lessonPlanService, LessonPlanServiceError } from '@/services/templates/LessonPlanService';
import { TemplateData, GeneratedPlanResponse, GenerationState, PlanComment } from '@/types/templates';
import { useLessonCreation } from '@/providers/LessonCreationProvider';
import { useGenerationLimit } from '@/hooks/useGenerationLimit';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Step2Props {
  data: TemplateData;
  generatedPlan: GeneratedPlanResponse | null;
  onPlanGenerated: (plan: GeneratedPlanResponse) => void;
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
  
  // Get editing state and methods from provider
  const {
    state,
    enterEditMode,
    exitEditMode,
    addComment,
    removeComment,
    clearAllComments,
    processComments
  } = useLessonCreation();
  
  const { planEditingState } = state;
  
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showCommentResults, setShowCommentResults] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const hasInitialized = useRef(false);
  
  // Generation limit hook
  const { count, canGenerate, incrementCount, isPro, isLoading: isLoadingLimit } = useGenerationLimit();
  
  // Analytics
  const { trackGenerateLesson, trackPaywallOpened, trackUpgradeClicked } = useAnalytics();

  const handleGeneratePlan = useCallback(async () => {
    // Check if user can generate
    if (!canGenerate && !isPro) {
      trackPaywallOpened(count, 'limit_reached');
      setShowPaywall(true);
      return;
    }

    // Track generation attempt
    trackGenerateLesson(count + 1, isPro);

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

      const response = await lessonPlanService.generateLessonPlan(request);
      
      
      setProgress(100);
      setGenerationState('success');
      onPlanGenerated(response);

      // Increment generation count after successful generation
      try {
        await incrementCount();
        
        // Show paywall after 3rd generation
        if (count + 1 >= 3 && !isPro) {
          trackPaywallOpened(count + 1, 'limit_reached');
          setShowPaywall(true);
        }
      } catch (countError) {
        console.error('Failed to increment count:', countError);
        // Don't block the user experience if count fails
      }

    } catch (error) {
      console.error('Error generating lesson plan:', error);
      setGenerationState('error');
      setError(error instanceof LessonPlanServiceError ? error.message : 'Failed to generate lesson plan');
    }
  }, [data.ageGroup, data.topic, data.slideCount, data.additionalInfo, onPlanGenerated, canGenerate, isPro, incrementCount, count, trackGenerateLesson, trackPaywallOpened]);

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
      }, 2000); // Slowed down by 2x: from 1000ms to 2000ms
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
    setShowCommentResults(false); // Reset comment results view
    hasInitialized.current = false;
    // Exit edit mode if active
    if (planEditingState.isEditingMode) {
      exitEditMode();
    }
    // handleGeneratePlan will be called automatically after plan is cleared
    setTimeout(() => handleGeneratePlan(), 100);
  };

  // Handle entering edit mode
  const handleEnterEditMode = useCallback(() => {
    enterEditMode();
  }, [enterEditMode]);

  // Handle exiting edit mode
  const handleExitEditMode = useCallback(() => {
    exitEditMode();
  }, [exitEditMode]);

  // Handle adding comment
  const handleAddComment = useCallback((comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    addComment(comment);
  }, [addComment]);

  // Handle processing comments
  const handleProcessComments = useCallback(async () => {
    try {
      await processComments();
      // Plan will be updated automatically through provider
      exitEditMode();
      
      // Встановлюємо showCommentResults в true після успішної обробки
      setShowCommentResults(true);
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Error processing comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to process comments');
    }
  }, [processComments, exitEditMode, generatedPlan, planEditingState.pendingComments]);

  // Handle adding more comments (return to editing mode)
  const handleAddMoreComments = useCallback(() => {
    // CommentPanel тепер сам керує відображенням, просто входимо в режим редагування
    enterEditMode();
  }, [enterEditMode]);

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
    <>
        <Card elevation={2} sx={{ borderRadius: 3, position: 'relative' }}>
          <CardContent sx={{ p: 6 }}>


            {/* Plan Content */}
            {generatedPlan && (
              <StructuredLessonPlan 
                markdown={generatedPlan.plan}
                isEditingMode={planEditingState.isEditingMode}
                onAddComment={handleAddComment}
                pendingComments={planEditingState.pendingComments}
                onEnterEditMode={handleEnterEditMode}
                onExitEditMode={handleExitEditMode}
                planChanges={state.planChanges}
                showCommentResults={showCommentResults}
                onProcessComments={handleProcessComments}
                onRemoveComment={removeComment}
                onClearAllComments={clearAllComments}
                onAddMoreComments={handleAddMoreComments}
                isProcessingComments={planEditingState.isProcessingComments}
              />
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
              disabled={planEditingState.isProcessingComments}
            >
              {t('createLesson.step2.back')}
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                disabled={planEditingState.isProcessingComments}
              >
                {t('createLesson.step2.regenerate')}
              </Button>
              
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                onClick={onNext}
                disabled={planEditingState.isProcessingComments}
              >
                {t('createLesson.step2.next')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>



      {/* Comment Dialog */}
      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleAddComment}
        title={t('planEditing.addCommentToplan')}
      />
    </>
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
            startIcon={<PlanIcon />}
            onClick={handleGeneratePlan}
            disabled={isLoadingLimit}
          >
            {t('createLesson.step2.generatePlan')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const handleUpgrade = () => {
    // Track upgrade click
    trackUpgradeClicked('paywall');
    
    // Navigate to payment page (will be implemented with WayForPay)
    window.location.href = '/payment';
  };

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
        
        <PaywallModal
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
          generationCount={count}
        />
        
        <Snackbar
          open={showSuccessSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSuccessSnackbar(false)}
          message={t('planChanges.snackbarSuccess', { 
            count: state.planChanges?.summary.totalChanges || 0 
          })}
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
      
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
        generationCount={count}
      />
      
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        message={t('planChanges.snackbarSuccess', { 
          count: state.planChanges?.summary.totalChanges || 0 
        })}
      />
    </>
  );
};

export default Step2PlanGeneration;
