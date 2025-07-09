'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Tooltip,
  Paper,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react';
import { SimpleLesson } from '@/types/chat';
import { useTranslation } from 'react-i18next';

interface SlideDialogProps {
  open: boolean;
  currentLesson: SimpleLesson | null;
  currentSlideIndex: number;
  onClose: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}

interface SlideDialogHeaderProps {
  currentLesson: SimpleLesson;
  currentSlideIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  isFullscreen: boolean;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

const SlideDialogHeader = React.memo<SlideDialogHeaderProps>(({
  currentLesson,
  currentSlideIndex,
  hasNext,
  hasPrev,
  isFullscreen,
  onNextSlide,
  onPrevSlide,
  onToggleFullscreen,
  onClose
}) => {
  const { t } = useTranslation(['slides', 'common']);
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isFullscreen 
          ? 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.primary.dark, 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: isFullscreen ? 'none' : `1px solid ${alpha('#ffffff', 0.2)}`,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Ліва частина - інформація про урок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: isFullscreen ? '#ffffff' : '#ffffff',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {currentLesson.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isFullscreen ? alpha('#ffffff', 0.8) : alpha('#ffffff', 0.9),
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {currentLesson.slides[currentSlideIndex]?.title} • {currentSlideIndex + 1} / {currentLesson.slides.length}
            </Typography>
          </Box>
        </Box>

        {/* Права частина - кнопки управління */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('slides:navigation.previousSlide')}>
            <IconButton
              onClick={onPrevSlide}
              disabled={!hasPrev}
              sx={{
                backgroundColor: isFullscreen 
                  ? alpha('#ffffff', 0.2)
                  : alpha(theme.palette.primary.main, 0.1),
                color: isFullscreen ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: isFullscreen
                    ? alpha('#ffffff', 0.3)
                    : alpha(theme.palette.primary.main, 0.2),
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.5),
                }
              }}
            >
              <ChevronLeft size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('slides:navigation.nextSlide')}>
            <IconButton
              onClick={onNextSlide}
              disabled={!hasNext}
              sx={{
                backgroundColor: isFullscreen 
                  ? alpha('#ffffff', 0.2)
                  : alpha(theme.palette.primary.main, 0.1),
                color: isFullscreen ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: isFullscreen
                    ? alpha('#ffffff', 0.3)
                    : alpha(theme.palette.primary.main, 0.2),
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.5),
                }
              }}
            >
              <ChevronRight size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? t('slides:navigation.exitPresentation') : t('slides:navigation.presentationMode')}>
            <IconButton
              onClick={onToggleFullscreen}
              sx={{
                backgroundColor: isFullscreen 
                  ? alpha('#ffffff', 0.2)
                  : alpha(theme.palette.secondary.main, 0.1),
                color: isFullscreen ? '#ffffff' : theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: isFullscreen
                    ? alpha('#ffffff', 0.3)
                    : alpha(theme.palette.secondary.main, 0.2),
                }
              }}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('slides:navigation.close')}>
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: isFullscreen 
                  ? alpha('#ffffff', 0.2)
                  : alpha(theme.palette.error.main, 0.1),
                color: isFullscreen ? '#ffffff' : theme.palette.error.main,
                '&:hover': {
                  backgroundColor: isFullscreen
                    ? alpha('#ffffff', 0.3)
                    : alpha(theme.palette.error.main, 0.2),
                }
              }}
            >
              <X size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
});

SlideDialogHeader.displayName = 'SlideDialogHeader';

const SlideDialog: React.FC<SlideDialogProps> = ({
  open,
  currentLesson,
  currentSlideIndex,
  onClose,
  onNextSlide,
  onPrevSlide
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleToggleFullscreen = React.useCallback(async () => {
    try {
      if (!isFullscreen) {
        // Входимо в повноекранний режим браузера
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Виходимо з повноекранного режиму
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [isFullscreen]);

  // Скидаємо fullscreen при закритті діалогу
  useEffect(() => {
    if (!open && isFullscreen) {
      // Виходимо з повноекранного режиму браузера
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [open, isFullscreen]);

  // Відстежуємо зміни повноекранного режиму браузера
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Обробка клавіш для навігації (переносимо перед ранні return)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open && currentLesson && currentLesson.slides[currentSlideIndex]) {
        const hasNext = currentSlideIndex < currentLesson.slides.length - 1;
        const hasPrev = currentSlideIndex > 0;
        
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (hasPrev) onPrevSlide();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (hasNext) onNextSlide();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        } else if (event.key === 'F11') {
          event.preventDefault();
          handleToggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentLesson, currentSlideIndex, onNextSlide, onPrevSlide, onClose, handleToggleFullscreen]);

  if (!currentLesson || !open) return null;

  const currentSlide = currentLesson.slides[currentSlideIndex];
  if (!currentSlide) return null;
  
  const hasNext = currentSlideIndex < currentLesson.slides.length - 1;
  const hasPrev = currentSlideIndex > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          m: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          borderRadius: 0,
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'stretch',
          justifyContent: 'stretch',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header з навігацією */}
        <SlideDialogHeader
          currentLesson={currentLesson}
          currentSlideIndex={currentSlideIndex}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isFullscreen={isFullscreen}
          onNextSlide={onNextSlide}
          onPrevSlide={onPrevSlide}
          onToggleFullscreen={handleToggleFullscreen}
          onClose={onClose}
        />

        {/* Область контенту слайду */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isFullscreen ? 4 : 3,
            pt: isFullscreen ? 8 : 6, // Додаємо padding-top для header
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              height: '100%',
              maxWidth: '1200px',
              maxHeight: '800px',
              borderRadius: isFullscreen ? '0px' : '20px',
              overflow: 'hidden',
              bgcolor: '#ffffff',
              position: 'relative',
              aspectRatio: '4/3', // Фіксоване співвідношення сторін
            }}
          >
            {/* Контент слайду */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                '& > *': {
                  width: '100%',
                  height: '100%',
                },
                '& iframe, & img, & video': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: currentSlide.htmlContent || `
                  <div style="
                    padding: 40px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  ">
                    <h1 style="margin: 0 0 20px 0; color: #1976d2; font-size: 2.5rem;">
                      ${currentSlide.title}
                    </h1>
                    <p style="margin: 0; color: #666; font-size: 1.25rem; line-height: 1.6;">
                      ${currentSlide.content || 'Контент слайду недоступний'}
                    </p>
                  </div>
                `
              }}
            />
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export { SlideDialog }; 