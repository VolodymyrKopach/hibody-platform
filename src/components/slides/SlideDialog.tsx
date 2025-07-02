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
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
    console.log('SlideContent received htmlContent:', {
      content: htmlContent,
      length: htmlContent?.length,
      isValidHTML: htmlContent?.includes('<html') || htmlContent?.includes('<!DOCTYPE'),
      preview: htmlContent?.substring(0, 200) + '...'
    });
  }, [htmlContent]);
  
  useEffect(() => {
    if (iframeRef.current) {
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
  onClose,
  onNextSlide,
  onPrevSlide
}: {
  title: string;
  currentIndex: number;
  totalSlides: number;
  hasNext: boolean;
  hasPrev: boolean;
  onClose: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 2,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Chip
          label={`${currentIndex + 1} з ${totalSlides}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          ← → для навігації • Esc для закриття
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Попередній слайд">
          <IconButton
            onClick={onPrevSlide}
            disabled={!hasPrev}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
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
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              '&:disabled': {
                backgroundColor: alpha(theme.palette.grey[300], 0.5),
              }
            }}
          >
            <ChevronRight size={20} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Закрити">
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.2),
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
  if (!currentLesson || !open) return null;

  const currentSlide = currentLesson.slides[currentSlideIndex];
  if (!currentSlide) return null;
  
  const hasNext = currentSlideIndex < currentLesson.slides.length - 1;
  const hasPrev = currentSlideIndex > 0;

  // Обробка клавіш для навігації
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (hasPrev) onPrevSlide();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (hasNext) onNextSlide();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasNext, hasPrev, onNextSlide, onPrevSlide, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
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
          onClose={onClose}
          onNextSlide={onNextSlide}
          onPrevSlide={onPrevSlide}
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