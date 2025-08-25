import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Fade,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SimpleSlide } from '@/types/chat';

export interface GenerationPreviewAreaProps {
  // Дані слайдів
  slides: SimpleSlide[];
  currentSlideIndex: number;
  
  // UI стан
  isGenerating?: boolean;
  showPlaceholder?: boolean;
  
  // Callbacks
  onSlideChange?: (index: number) => void;
  onFullscreen?: (slideIndex: number) => void;
  onDownload?: (slide: SimpleSlide) => void;
  onShare?: (slide: SimpleSlide) => void;
  
  // Опції відображення
  showNavigation?: boolean;
  showControls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

// Компонент для відображення контенту слайду
const SlideContent = React.memo(({ 
  slide, 
  aspectRatio = '16:9' 
}: { 
  slide: SimpleSlide; 
  aspectRatio?: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (iframeRef.current && slide.htmlContent) {
      setIsLoading(true);
      iframeRef.current.srcdoc = slide.htmlContent;
      
      // Симулюємо завантаження
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [slide.htmlContent]);

  const getAspectRatio = () => {
    switch (aspectRatio) {
      case '4:3': return '4/3';
      case '1:1': return '1/1';
      default: return '16/9';
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      aspectRatio: getAspectRatio(),
      backgroundColor: '#f5f5f5',
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid #e0e0e0'
    }}>
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 2
        }}>
          <CircularProgress size={40} />
        </Box>
      )}
      
      <iframe
        ref={iframeRef}
        srcDoc={slide.htmlContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'white',
        }}
        title={slide.title}
      />
    </Box>
  );
});

SlideContent.displayName = 'SlideContent';

const GenerationPreviewArea: React.FC<GenerationPreviewAreaProps> = ({
  slides,
  currentSlideIndex,
  isGenerating = false,
  showPlaceholder = true,
  onSlideChange,
  onFullscreen,
  onDownload,
  onShare,
  showNavigation = true,
  showControls = true,
  aspectRatio = '16:9'
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [previewVisible, setPreviewVisible] = useState(true);

  // Поточний слайд
  const currentSlide = slides[currentSlideIndex];
  const hasSlides = slides.length > 0;
  const canNavigate = hasSlides && slides.length > 1;

  // Навігація
  const handlePrevSlide = () => {
    if (canNavigate && onSlideChange) {
      const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1;
      onSlideChange(newIndex);
    }
  };

  const handleNextSlide = () => {
    if (canNavigate && onSlideChange) {
      const newIndex = currentSlideIndex < slides.length - 1 ? currentSlideIndex + 1 : 0;
      onSlideChange(newIndex);
    }
  };

  // Клавіатурна навігація
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      } else if (event.key === 'f' || event.key === 'F') {
        if (currentSlide && onFullscreen) {
          onFullscreen(currentSlideIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, currentSlide, onFullscreen]);

  // Placeholder для відсутніх слайдів
  const renderPlaceholder = () => (
    <Box sx={{
      width: '100%',
      aspectRatio: aspectRatio === '4:3' ? '4/3' : aspectRatio === '1:1' ? '1/1' : '16/9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: alpha(theme.palette.grey[100], 0.5),
      borderRadius: 2,
      border: `2px dashed ${alpha(theme.palette.grey[400], 0.5)}`,
      textAlign: 'center',
      p: 4
    }}>
      <Typography sx={{ 
        fontSize: '48px', 
        mb: 2, 
        opacity: 0.6
      }}>
        🎨
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {isGenerating ? t('createLesson.step3.preview.generatingSlides') : t('createLesson.step3.preview.noSlidesAvailable')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {isGenerating 
          ? t('createLesson.step3.preview.slidesWillAppear')
          : t('createLesson.step3.preview.startGeneration')
        }
      </Typography>
      
      {isGenerating && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('createLesson.step3.preview.title')}
          </Typography>
          
          {currentSlide && (
            <Chip
              label={`${currentSlideIndex + 1} of ${slides.length}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Header Controls */}
        {showControls && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={previewVisible ? t('createLesson.step3.preview.hidePreview') : t('createLesson.step3.preview.showPreview')}>
              <IconButton
                size="small"
                onClick={() => setPreviewVisible(!previewVisible)}
              >
                {previewVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            </Tooltip>
            
            {currentSlide && (
              <>
                <Tooltip title={t('createLesson.step3.preview.refresh')}>
                  <IconButton
                    size="small"
                    onClick={() => window.location.reload()}
                  >
                    <RotateCcw size={16} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t('createLesson.step3.preview.fullscreen')}>
                  <IconButton
                    size="small"
                    onClick={() => onFullscreen?.(currentSlideIndex)}
                  >
                    <Maximize2 size={16} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Preview Content */}
      <Box sx={{ 
        flex: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <Fade in={previewVisible} timeout={300}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Slide Title */}
            {currentSlide && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {currentSlide.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={currentSlide.type || t('createLesson.step3.slideCard.content')}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      textTransform: 'capitalize'
                    }}
                  />
                  
                  <Chip
                    label={currentSlide.status}
                    size="small"
                    color={currentSlide.status === 'completed' ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
            )}

            {/* Slide Content */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentSlide && currentSlide.htmlContent ? (
                <SlideContent slide={currentSlide} aspectRatio={aspectRatio} />
              ) : showPlaceholder ? (
                renderPlaceholder()
              ) : null}
            </Box>

            {/* Navigation */}
            {showNavigation && canNavigate && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                mt: 2
              }}>
                <IconButton
                  onClick={handlePrevSlide}
                  disabled={!canNavigate}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <Typography variant="body2" color="text.secondary">
                  {currentSlideIndex + 1} / {slides.length}
                </Typography>

                <IconButton
                  onClick={handleNextSlide}
                  disabled={!canNavigate}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            )}
          </Box>
        </Fade>

        {/* Action Buttons */}
        {currentSlide && showControls && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 2,
            justifyContent: 'center'
          }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download size={16} />}
              onClick={() => onDownload?.(currentSlide)}
            >
              {t('createLesson.step3.preview.download')}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<Share2 size={16} />}
              onClick={() => onShare?.(currentSlide)}
            >
              {t('createLesson.step3.preview.share')}
            </Button>
          </Box>
        )}
      </Box>

      {/* Keyboard Shortcuts Info */}
      {canNavigate && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: alpha(theme.palette.grey[50], 0.5),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
            {t('createLesson.step3.preview.keyboardShortcuts')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GenerationPreviewArea;
