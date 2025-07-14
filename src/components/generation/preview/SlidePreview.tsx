import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Slide,
  IconButton,
  Chip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { PreviewSlide, PreviewElement } from '@/services/generation/PreviewGenerationService';

// === SOLID: SRP - Keyframe animations ===
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInAnimation = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const zoomAnimation = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

// === SOLID: SRP - Styled Components ===
const SlideContainer = styled(Box)<{ 
  deviceType: 'desktop' | 'tablet' | 'mobile';
  aspectRatio: string;
}>(({ theme, deviceType, aspectRatio }) => {
  const dimensions = {
    desktop: { maxWidth: '100%', width: '800px' },
    tablet: { maxWidth: '70%', width: '600px' },
    mobile: { maxWidth: '40%', width: '320px' }
  };

  return {
    position: 'relative',
    width: '100%',
    maxWidth: dimensions[deviceType].maxWidth,
    margin: '0 auto',
    aspectRatio,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      boxShadow: theme.shadows[16],
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    
    '& .slide-content': {
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: theme.spacing(2),
    },
    
    '& .slide-controls': {
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1),
      display: 'flex',
      gap: theme.spacing(0.5),
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    
    '&:hover .slide-controls': {
      opacity: 1,
    },
  };
});

const ElementContainer = styled(Box)<{
  elementPosition: { x: number; y: number; width: number; height: number };
  animationType: string;
  animationDelay: number;
  animationDuration: number;
}>(({ elementPosition, animationType, animationDelay, animationDuration }) => {
  const getAnimation = () => {
    switch (animationType) {
      case 'fadeIn': return fadeInAnimation;
      case 'slideIn': return slideInAnimation;
      case 'bounce': return bounceAnimation;
      case 'zoom': return zoomAnimation;
      default: return fadeInAnimation;
    }
  };

  return {
    position: 'absolute',
    left: `${elementPosition.x}%`,
    top: `${elementPosition.y}%`,
    width: `${elementPosition.width}%`,
    height: `${elementPosition.height}%`,
    animation: `${getAnimation()} ${animationDuration}ms ease-out ${animationDelay}ms both`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
});

const InteractiveElement = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  },
  
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

// === SOLID: ISP - Specific interface for SlidePreview ===
interface SlidePreviewProps {
  slide: PreviewSlide;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  aspectRatio?: string;
  autoPlay?: boolean;
  onElementClick?: (elementId: string, element: PreviewElement) => void;
  onSlideAction?: (action: 'play' | 'pause' | 'restart' | 'fullscreen') => void;
}

// === SOLID: SRP - Main component ===
const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  deviceType,
  aspectRatio = '16/9',
  autoPlay = true,
  onElementClick,
  onSlideAction
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [animationKey, setAnimationKey] = useState(0);
  const [clickedElements, setClickedElements] = useState<Set<string>>(new Set());

  // === SOLID: SRP - Handle play/pause ===
  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    onSlideAction?.(newIsPlaying ? 'play' : 'pause');
  }, [isPlaying, onSlideAction]);

  // === SOLID: SRP - Handle restart ===
  const handleRestart = useCallback(() => {
    setAnimationKey(prev => prev + 1);
    setClickedElements(new Set());
    setIsPlaying(true);
    onSlideAction?.('restart');
  }, [onSlideAction]);

  // === SOLID: SRP - Handle element click ===
  const handleElementClick = useCallback((elementId: string, element: PreviewElement) => {
    if (element.type === 'interactive') {
      setClickedElements(prev => new Set(prev).add(elementId));
      onElementClick?.(elementId, element);
    }
  }, [onElementClick]);

  // === SOLID: SRP - Render slide element ===
  const renderElement = (element: PreviewElement, index: number) => {
    const isInteractive = element.type === 'interactive';
    const isClicked = clickedElements.has(element.id);
    
    const elementContent = (
      <Box
        sx={{
          ...element.style,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          wordBreak: 'break-word',
          opacity: isClicked ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {element.type === 'text' ? (
          <Typography
            variant="body1"
            sx={{
              fontSize: element.style.fontSize,
              color: element.style.color,
              fontWeight: element.style.fontWeight,
              lineHeight: 1.2,
            }}
          >
            {element.content}
          </Typography>
        ) : element.type === 'image' ? (
          <Typography
            sx={{
              fontSize: element.style.fontSize || '2rem',
              lineHeight: 1,
            }}
          >
            {element.content}
          </Typography>
        ) : element.type === 'interactive' ? (
          <InteractiveElement
            sx={{
              backgroundColor: element.style.backgroundColor,
              borderRadius: element.style.borderRadius,
              width: '100%',
              height: '100%',
              opacity: isClicked ? 0.6 : 1,
            }}
          >
            <Typography
              sx={{
                fontSize: element.style.fontSize,
                color: element.style.color,
                fontWeight: element.style.fontWeight,
              }}
            >
              {isClicked ? '✅ Натиснуто!' : element.content}
            </Typography>
          </InteractiveElement>
        ) : (
          <Typography>{element.content}</Typography>
        )}
      </Box>
    );

    return (
      <ElementContainer
        key={`${element.id}-${animationKey}`}
        elementPosition={element.position}
        animationType={element.animation?.type || 'fadeIn'}
        animationDelay={isPlaying ? element.animation?.delay || 0 : 0}
        animationDuration={element.animation?.duration || 1000}
        onClick={() => handleElementClick(element.id, element)}
        sx={{
          cursor: isInteractive ? 'pointer' : 'default',
          pointerEvents: isPlaying ? 'auto' : 'none',
        }}
      >
        {elementContent}
      </ElementContainer>
    );
  };

  return (
    <SlideContainer
      deviceType={deviceType}
      aspectRatio={aspectRatio}
    >
      {/* Slide Controls */}
      <Box className="slide-controls">
        <Chip
          label={`${slide.estimatedDuration}s`}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.main,
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
        
        <IconButton
          size="small"
          onClick={handlePlayPause}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 1),
            },
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleRestart}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 1),
            },
          }}
        >
          <RotateCcw size={16} />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={() => onSlideAction?.('fullscreen')}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 1),
            },
          }}
        >
          <Maximize2 size={16} />
        </IconButton>
      </Box>

      {/* Slide Content */}
      <Box className="slide-content">
        {/* Background HTML Content */}
        {slide.htmlContent && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              opacity: 0.1,
              '& *': {
                fontSize: '12px !important',
                color: theme.palette.text.disabled,
              },
            }}
            dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
          />
        )}

        {/* Animated Elements */}
        {slide.elements.map((element, index) => renderElement(element, index))}
        
        {/* Slide Info Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: theme.spacing(1),
            left: theme.spacing(1),
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0.5, 1),
            backdropFilter: 'blur(4px)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
            }}
          >
            {slide.title} • {slide.type}
          </Typography>
        </Box>
      </Box>
    </SlideContainer>
  );
};

export default SlidePreview; 