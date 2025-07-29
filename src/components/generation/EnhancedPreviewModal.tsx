import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  X, 
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AgeGroupConfig, FormValues } from '@/types/generation';
import { useEnhancedPreview } from '@/hooks/useEnhancedPreview';
import EnhancedSlidePreview from './preview/SlidePreview';
import PreviewNavigation from './preview/PreviewNavigation';

// === SOLID: SRP - Styled Components ===
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '95vw',
    width: '100%',
    maxHeight: '95vh',
    overflow: 'hidden',
    boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  },
}));

const AnimatedDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 3),
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
    transform: 'translateX(-100%)',
    animation: 'shimmer 3s infinite',
  },
  
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

const ContentContainer = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflow: 'hidden',
  
  '&::-webkit-scrollbar': {
    width: 6,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 3,
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 400,
  gap: theme.spacing(3),
  padding: theme.spacing(4),
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minHeight: 500,
}));

// === SOLID: ISP - Specific interface for EnhancedPreviewModal ===
interface EnhancedPreviewModalProps {
  open: boolean;
  ageGroupConfig: AgeGroupConfig;
  formValues: FormValues;
  onClose: () => void;
  onGenerateLesson?: () => void;
}

// === SOLID: SRP - Main component ===
const EnhancedPreviewModal: React.FC<EnhancedPreviewModalProps> = ({
  open,
  ageGroupConfig,
  formValues,
  onClose,
  onGenerateLesson
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  // === SOLID: DIP - Use enhanced preview hook ===
  const {
    state,
    currentSlide,
    hasSlides,
    generatePreview,
    navigateToSlide,
    setDeviceType,
    togglePlayback,
    restartPreview,
    handleElementClick,
    clearError
  } = useEnhancedPreview();

  // === SOLID: SRP - Generate preview when modal opens ===
  useEffect(() => {
    if (open && !state.data && !state.isLoading) {
      generatePreview(ageGroupConfig, formValues);
    }
  }, [open, ageGroupConfig, formValues, state.data, state.isLoading, generatePreview]);

  // === SOLID: SRP - Handle slide actions ===
  const handleSlideAction = useCallback((action: 'play' | 'pause' | 'restart' | 'fullscreen') => {
    switch (action) {
      case 'play':
      case 'pause':
        togglePlayback();
        break;
      case 'restart':
        restartPreview();
        break;
      case 'fullscreen':
        // TODO: Implement fullscreen functionality
        console.log('Fullscreen functionality coming soon!');
        break;
    }
  }, [togglePlayback, restartPreview]);

  // === SOLID: SRP - Handle close with cleanup ===
  const handleClose = useCallback(() => {
    clearError();
    onClose();
  }, [clearError, onClose]);

  // === SOLID: SRP - Render loading state ===
  const renderLoading = () => (
    <Fade in={state.isLoading} timeout={300}>
      <LoadingContainer>
        <Zoom in={state.isLoading} timeout={500}>
          <Box sx={{ position: 'relative' }}>
            <Loader2 size={48} className="animate-spin" color={theme.palette.primary.main} />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 60,
                height: 60,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </Box>
        </Zoom>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
          {t('generation:preview.generating', 'Генерація превью...')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
          {t('generation:preview.generatingDesc', 'Підготовка інтерактивного превью з реальним контентом для вашої вікової групи')}
        </Typography>
      </LoadingContainer>
    </Fade>
  );

  // === SOLID: SRP - Render error state ===
  const renderError = () => (
    <Fade in={!!state.error} timeout={300}>
      <LoadingContainer>
        <Alert 
          severity="error" 
          icon={<AlertCircle size={20} />}
          sx={{ maxWidth: 500 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('generation:preview.error', 'Помилка генерації превью')}
          </Typography>
          <Typography variant="body2">
            {state.error}
          </Typography>
        </Alert>
        
        <Button
          variant="outlined"
          onClick={() => generatePreview(ageGroupConfig, formValues)}
          sx={{ mt: 2 }}
        >
          {t('common:retry', 'Спробувати ще раз')}
        </Button>
      </LoadingContainer>
    </Fade>
  );

  // === SOLID: SRP - Render preview content ===
  const renderPreviewContent = () => {
    if (!state.data || !hasSlides) return null;

    return (
      <Fade in={!state.isLoading && !!state.data} timeout={500}>
        <SlideContainer>
          {/* Navigation Controls */}
          <PreviewNavigation
            slides={state.data.slides}
            currentSlideIndex={state.currentSlideIndex}
            deviceType={state.deviceType}
            isPlaying={state.isPlaying}
            totalProgress={state.totalProgress}
            onSlideChange={navigateToSlide}
            onDeviceChange={setDeviceType}
            onPlayPause={togglePlayback}
            onRestart={restartPreview}
          />

          {/* Current Slide Preview */}
          {currentSlide && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <EnhancedSlidePreview
                slide={currentSlide}
                deviceType={state.deviceType}
                aspectRatio={state.settings.aspectRatio}
                autoPlay={state.isPlaying}
                onElementClick={handleElementClick}
                onSlideAction={handleSlideAction}
              />
            </Box>
          )}

          {/* Preview Statistics */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              borderRadius: theme.spacing(1),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('generation:preview.metadata', 'Генерація')}: {state.data.metadata.assistantProvider} • 
              {Math.round(state.data.metadata.generationTime)}мс
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {t('generation:preview.totalDuration', 'Загальна тривалість')}: {state.data.characteristics.estimatedDuration}
            </Typography>
          </Box>
        </SlideContainer>
      </Fade>
    );
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      TransitionComponent={Zoom}
      TransitionProps={{
        timeout: {
          enter: 400,
          exit: 300,
        },
      }}
    >
      {/* Header */}
      <AnimatedDialogTitle>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Sparkles size={24} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('generation:preview.title', 'Інтерактивний превью')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {ageGroupConfig.name}
            </Typography>
          </Box>
          
          <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
            <X size={20} />
          </IconButton>
        </Box>
      </AnimatedDialogTitle>

      {/* Content */}
      <ContentContainer>
        {state.isLoading && renderLoading()}
        {state.error && !state.isLoading && renderError()}
        {!state.isLoading && !state.error && state.data && renderPreviewContent()}
      </ContentContainer>

      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          {t('common:close', 'Закрити')}
        </Button>
        
        {hasSlides && onGenerateLesson && (
          <Button
            onClick={onGenerateLesson}
            variant="contained"
            startIcon={<Sparkles size={18} />}
          >
            {t('generation:actions.generateLesson', 'Генерувати урок')}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default EnhancedPreviewModal; 