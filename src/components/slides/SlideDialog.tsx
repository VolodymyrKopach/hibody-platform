import React, { useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react';
import { SimpleLesson } from '@/types/chat';

interface SlideDialogProps {
  open: boolean;
  currentLesson: SimpleLesson | null;
  currentSlideIndex: number;
  onClose: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}

// Компонент контенту слайду (оптимізований)
const SlideContent = React.memo(({ htmlContent }: { htmlContent: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Debug logging to see what content we're receiving
  useEffect(() => {
    console.log('🔍 SlideContent received htmlContent:', {
      content: htmlContent,
      length: htmlContent?.length,
      isValidHTML: htmlContent?.includes('<html') || htmlContent?.includes('<!DOCTYPE'),
      preview: htmlContent?.substring(0, 200) + '...',
      isDefaultMessage: htmlContent?.includes('Слайд генерується'),
    });
  }, [htmlContent]);
  
  useEffect(() => {
    if (iframeRef.current) {
      console.log('🎯 Setting iframe srcdoc to:', htmlContent?.substring(0, 100) + '...');
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'white',
      }}
    />
  );
});

SlideContent.displayName = 'SlideContent';

// Мемоізований заголовок діалогу
const SlideDialogHeader = React.memo(({ 
  title, 
  currentIndex, 
  totalSlides, 
  hasNext, 
  hasPrev,
  isFullscreen,
  onClose,
  onNextSlide,
  onPrevSlide,
  onToggleFullscreen
}: {
  title: string;
  currentIndex: number;
  totalSlides: number;
  hasNext: boolean;
  hasPrev: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onToggleFullscreen: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: isFullscreen 
          ? 'transparent'
          : alpha(theme.palette.background.paper, 0.95),
        backdropFilter: isFullscreen ? 'none' : 'blur(10px)',
        borderBottom: isFullscreen 
          ? 'none' 
          : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: isFullscreen ? 1 : 2,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isFullscreen ? 0 : 1,
        transition: 'opacity 0.3s ease, background 0.3s ease',
        '&:hover': isFullscreen ? {
          opacity: 1,
        } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: isFullscreen ? '#ffffff' : 'inherit'
          }}
        >
          {title}
        </Typography>
        <Chip
          label={`${currentIndex + 1} з ${totalSlides}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            ...(isFullscreen && {
              backgroundColor: alpha('#ffffff', 0.2),
              color: '#ffffff',
              borderColor: alpha('#ffffff', 0.3)
            })
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 2,
            color: isFullscreen ? alpha('#ffffff', 0.7) : 'text.secondary'
          }}
        >
          ← → для навігації • F11 режим презентації • Esc для закриття
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Попередній слайд">
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

        <Tooltip title="Наступний слайд">
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

        <Tooltip title={isFullscreen ? "Вийти з режиму презентації" : "Режим презентації"}>
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

        <Tooltip title="Закрити">
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
      sx={{
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          '& .MuiBackdrop-root': {
            backgroundColor: '#000000',
          }
        }),
        '& .MuiDialog-paper': isFullscreen ? {
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          margin: 0,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: '#000000',
        } : {
          width: '95vw',
          height: '95vh',
          maxWidth: 'none',
          margin: '2.5vh auto',
          borderRadius: '16px',
          overflow: 'hidden',
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', height: '100%' }}>
        <SlideDialogHeader
          title={currentSlide.title}
          currentIndex={currentSlideIndex}
          totalSlides={currentLesson.slides.length}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isFullscreen={isFullscreen}
          onClose={onClose}
          onNextSlide={onNextSlide}
          onPrevSlide={onPrevSlide}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Контент слайду */}
        <Box sx={{ width: '100%', height: '100%', pt: '80px', position: 'relative' }}>
          <SlideContent htmlContent={currentSlide.htmlContent} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SlideDialog; 