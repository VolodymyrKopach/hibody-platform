'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, Play, Maximize2, ZoomIn, ZoomOut, Minimize2, Fullscreen } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
import TapImage from './interactive/TapImage';
import SimpleDragAndDrop from './interactive/SimpleDragAndDrop';
import ColorMatcher from './interactive/ColorMatcher';
import SimpleCounter from './interactive/SimpleCounter';
import MemoryCards from './interactive/MemoryCards';
import SortingGame from './interactive/SortingGame';
import SequenceBuilder from './interactive/SequenceBuilder';
import ShapeTracer from './interactive/ShapeTracer';
import EmotionRecognizer from './interactive/EmotionRecognizer';
import SoundMatcher from './interactive/SoundMatcher';
import SimplePuzzle from './interactive/SimplePuzzle';
import PatternBuilder from './interactive/PatternBuilder';
import CauseEffectGame from './interactive/CauseEffectGame';
import RewardCollector from './interactive/RewardCollector';
import VoiceRecorder from './interactive/VoiceRecorder';

// Page dimensions constants (matching Step3CanvasEditor)
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const INTERACTIVE_WIDTH = 1200;
const INTERACTIVE_MIN_HEIGHT = 800;

interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: string;
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
  gradient?: {
    from: string;
    to: string;
    colors?: string[];
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number;
    opacity?: number;
  };
  opacity?: number;
}

interface InteractivePlayDialogProps {
  open: boolean;
  onClose: () => void;
  pageTitle: string;
  pageNumber: number;
  background?: PageBackground;
  elements: CanvasElement[];
  pageType?: 'pdf' | 'interactive'; // Determines page dimensions
  pageWidth?: number; // Custom width (optional)
  pageHeight?: number; // Custom height (optional)
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '100vw',
    maxHeight: '100vh',
    width: '100vw',
    height: '100vh',
    margin: 0,
    borderRadius: 0,
    overflow: 'hidden',
    boxShadow: 'none',
    background: 'transparent', // Transparent - page background will fill it
  },
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  color: theme.palette.success.contrastText,
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  background: 'transparent', // No background - page background fills this
}));

const InteractivePlayDialog: React.FC<InteractivePlayDialogProps> = ({
  open,
  onClose,
  pageTitle,
  pageNumber,
  background,
  elements,
  pageType = 'interactive',
  pageWidth: customWidth,
  pageHeight: customHeight,
}) => {
  const theme = useTheme();
  const [zoom, setZoom] = React.useState(1);
  
  // Calculate page dimensions
  const pageWidth = customWidth || (pageType === 'pdf' ? A4_WIDTH : INTERACTIVE_WIDTH);
  const pageHeight = customHeight || (pageType === 'pdf' ? A4_HEIGHT : INTERACTIVE_MIN_HEIGHT);
  
  // Calculate optimal zoom to fit screen
  const calculateFitZoom = () => {
    const headerHeight = 64; // Approximate header height
    const padding = 80; // Padding around page
    const availableWidth = window.innerWidth - padding;
    const availableHeight = window.innerHeight - headerHeight - padding;
    
    const widthZoom = availableWidth / pageWidth;
    const heightZoom = availableHeight / pageHeight;
    
    return Math.min(widthZoom, heightZoom, 1); // Max 100%
  };
  
  // Set initial zoom to fit
  React.useEffect(() => {
    if (open) {
      setZoom(calculateFitZoom());
    }
  }, [open, pageWidth, pageHeight]);
  
  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleZoomReset = () => setZoom(1);
  const handleZoomFit = () => setZoom(calculateFitZoom());
  
  // Generate background CSS based on type
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { background: theme.palette.background.default };

    const opacity = background.opacity ? background.opacity / 100 : 1;

    switch (background.type) {
      case 'solid':
        return {
          background: background.color || theme.palette.background.default,
        };
      
      case 'gradient':
        if (background.gradient) {
          const { from, to, colors, direction } = background.gradient;
          const gradientColors = colors && colors.length >= 2 ? colors : [from, to];
          const cssDirection = direction.replace(/-/g, ' ');
          const gradientCss = `linear-gradient(${cssDirection}, ${gradientColors.join(', ')})`;
          
          return {
            background: gradientCss,
          };
        }
        return { background: theme.palette.background.default };
      
      case 'pattern':
        if (background.pattern) {
          const scale = background.pattern.scale || 1;
          const patternOpacity = background.pattern.opacity !== undefined ? background.pattern.opacity / 100 : 1;
          
          let scaledSize = background.pattern.backgroundSize;
          if (background.pattern.backgroundSize !== 'auto') {
            scaledSize = background.pattern.backgroundSize.replace(/(\d+)px/g, (match, p1) => {
              return `${Math.round(parseInt(p1) * scale)}px`;
            });
          }
          
          let customCss = background.pattern.css
            .replace(/#E5E7EB/g, background.pattern.patternColor)
            .replace(/#DBEAFE/g, background.pattern.patternColor)
            .replace(/#F3F4F6/g, background.pattern.patternColor)
            .replace(/#FDE68A/g, background.pattern.patternColor)
            .replace(/#D1D5DB/g, background.pattern.patternColor);
          
          if (patternOpacity < 1) {
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const patternColorRgba = hexToRgba(background.pattern.patternColor, patternOpacity);
            customCss = customCss.replace(
              new RegExp(background.pattern.patternColor, 'g'),
              patternColorRgba
            );
          }
          
          return {
            background: background.pattern.backgroundColor,
            backgroundImage: customCss,
            backgroundSize: scaledSize,
            backgroundPosition: background.pattern.backgroundPosition || '0 0',
          };
        }
        return { background: theme.palette.background.default };
      
      case 'image':
        if (background.image) {
          const imageOpacity = background.image.opacity !== undefined ? background.image.opacity / 100 : 1;
          
          return {
            backgroundImage: `url(${background.image.url})`,
            backgroundSize: background.image.size,
            backgroundPosition: background.image.position,
            backgroundRepeat: background.image.size === 'repeat' ? 'repeat' : 'no-repeat',
            opacity: imageOpacity,
          };
        }
        return { background: theme.palette.background.default };
      
      default:
        return { background: theme.palette.background.default };
    }
  };

  // Render element based on type (Play Mode - interactive only)
  const renderElement = (element: CanvasElement) => {
    // Dummy handlers for play mode (no editing)
    const dummyEdit = () => {};
    const dummyFocus = () => {};

    switch (element.type) {
      case 'tap-image':
        return (
          <TapImage
            imageUrl={element.properties.imageUrl || '/placeholder-image.png'}
            soundEffect={element.properties.soundEffect}
            customSound={element.properties.customSound}
            caption={element.properties.caption}
            size={element.properties.size || 'medium'}
            animation={element.properties.animation || 'bounce'}
            showHint={element.properties.showHint}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'simple-drag-drop':
        return (
          <SimpleDragAndDrop
            items={element.properties.items || []}
            targets={element.properties.targets || []}
            layout={element.properties.layout || 'horizontal'}
            difficulty={element.properties.difficulty || 'easy'}
            snapDistance={element.properties.snapDistance || 80}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'color-matcher':
        return (
          <ColorMatcher
            colors={element.properties.colors || []}
            mode={element.properties.mode || 'single'}
            showNames={element.properties.showNames ?? true}
            autoVoice={element.properties.autoVoice ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'simple-counter':
        return (
          <SimpleCounter
            objects={element.properties.objects || []}
            voiceEnabled={element.properties.voiceEnabled ?? true}
            celebrationAtEnd={element.properties.celebrationAtEnd ?? true}
            showProgress={element.properties.showProgress ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'memory-cards':
        return (
          <MemoryCards
            pairs={element.properties.pairs || []}
            gridSize={element.properties.gridSize || '2x2'}
            cardBackImage={element.properties.cardBackImage}
            difficulty={element.properties.difficulty || 'easy'}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'sorting-game':
        return (
          <SortingGame
            items={element.properties.items || []}
            categories={element.properties.categories || []}
            sortBy={element.properties.sortBy || 'type'}
            layout={element.properties.layout || 'horizontal'}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'sequence-builder':
        return (
          <SequenceBuilder
            steps={element.properties.steps || []}
            showNumbers={element.properties.showNumbers ?? true}
            difficulty={element.properties.difficulty || 'easy'}
            instruction={element.properties.instruction}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'shape-tracer':
        return (
          <ShapeTracer
            shapePath={element.properties.shapePath || 'M 50,50 L 150,50 L 150,150 L 50,150 Z'}
            shapeName={element.properties.shapeName || 'Shape'}
            difficulty={element.properties.difficulty || 'easy'}
            strokeWidth={element.properties.strokeWidth || 8}
            guideColor={element.properties.guideColor || '#3B82F6'}
            traceColor={element.properties.traceColor || '#10B981'}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'emotion-recognizer':
        return (
          <EmotionRecognizer
            emotions={element.properties.emotions || []}
            mode={element.properties.mode || 'identify'}
            showDescriptions={element.properties.showDescriptions ?? true}
            voiceEnabled={element.properties.voiceEnabled ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'sound-matcher':
        return (
          <SoundMatcher
            items={element.properties.items || []}
            mode={element.properties.mode || 'identify'}
            autoPlayFirst={element.properties.autoPlayFirst ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'simple-puzzle':
        return (
          <SimplePuzzle
            imageUrl={element.properties.imageUrl || ''}
            pieces={element.properties.pieces || 4}
            difficulty={element.properties.difficulty || 'easy'}
            showOutline={element.properties.showOutline ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'pattern-builder':
        return (
          <PatternBuilder
            pattern={element.properties.pattern || []}
            patternType={element.properties.patternType || 'color'}
            difficulty={element.properties.difficulty || 'easy'}
            repetitions={element.properties.repetitions || 2}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'cause-effect':
        return (
          <CauseEffectGame
            pairs={element.properties.pairs || []}
            showText={element.properties.showText ?? true}
            voiceEnabled={element.properties.voiceEnabled ?? true}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'reward-collector':
        return (
          <RewardCollector
            tasks={element.properties.tasks || []}
            rewardTitle={element.properties.rewardTitle || 'Great Job!'}
            rewardEmoji={element.properties.rewardEmoji || '🎁'}
            starsPerTask={element.properties.starsPerTask || 1}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      case 'voice-recorder':
        return (
          <VoiceRecorder
            prompt={element.properties.prompt || 'Record your voice!'}
            maxDuration={element.properties.maxDuration || 30}
            showPlayback={element.properties.showPlayback ?? true}
            autoPlay={element.properties.autoPlay ?? false}
            isSelected={false}
            onEdit={dummyEdit}
            onFocus={dummyFocus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      TransitionComponent={Zoom}
      TransitionProps={{
        timeout: {
          enter: 400,
          exit: 300,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            background: 'transparent', // No backdrop - page background is visible
          },
        },
      }}
    >
      <DialogHeader>
        {/* Left section - Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Play size={24} fill="currentColor" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
          <Chip
            label={`Page ${pageNumber}`}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.success.contrastText, 0.2),
              color: theme.palette.success.contrastText,
              fontWeight: 500,
            }}
          />
          <Chip
            label={pageType === 'pdf' ? '📄 PDF' : '⚡ Interactive'}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.success.contrastText, 0.2),
              color: theme.palette.success.contrastText,
              fontWeight: 700,
            }}
          />
        </Box>
        
        {/* Center section - Zoom controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          backgroundColor: alpha(theme.palette.common.black, 0.3),
          borderRadius: 2,
          padding: '4px 8px',
        }}>
          <IconButton 
            size="small" 
            onClick={handleZoomOut}
            sx={{ 
              color: 'inherit',
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) },
            }}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </IconButton>
          
          <Typography 
            variant="body2" 
            sx={{ 
              minWidth: 60,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {Math.round(zoom * 100)}%
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={handleZoomIn}
            sx={{ 
              color: 'inherit',
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) },
            }}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </IconButton>
          
          <Box sx={{ width: 1, height: 20, backgroundColor: alpha(theme.palette.common.white, 0.3), mx: 0.5 }} />
          
          <IconButton 
            size="small" 
            onClick={handleZoomReset}
            sx={{ 
              color: 'inherit',
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) },
            }}
            title="100%"
          >
            <Minimize2 size={18} />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={handleZoomFit}
            sx={{ 
              color: 'inherit',
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) },
            }}
            title="Fit to Screen"
          >
            <Fullscreen size={18} />
          </IconButton>
        </Box>
        
        {/* Right section - Close */}
        <IconButton onClick={onClose} sx={{ color: 'inherit', position: 'relative', zIndex: 1 }}>
          <X size={20} />
        </IconButton>
      </DialogHeader>

      <ContentContainer>
        {/* Page Background fills entire dialog */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            ...getBackgroundStyle(), // Page background = Dialog background
          }}
        />
        
        {/* Page Content Layer - Scrollable and Zoomable */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 4,
            '&::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.divider, 0.1),
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.divider, 0.3),
              borderRadius: 5,
              '&:hover': {
                background: alpha(theme.palette.divider, 0.5),
              },
            },
          }}
        >
          <Fade in={open} timeout={500}>
            <Box
              sx={{
                maxWidth: pageWidth,
                width: pageWidth,
                minHeight: `calc(100vh - ${64 + 32}px)`, // Full height minus header and padding
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease',
                padding: pageType === 'pdf' ? 6 : 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {elements.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    }}
                  >
                    <Maximize2 size={48} color={theme.palette.text.disabled} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No interactive elements on this page
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 400 }}>
                    Add interactive components to see them here
                  </Typography>
                </Box>
              ) : (
                <>
                  {elements.map((element, index) => (
                    <Box 
                      key={element.id}
                      sx={{
                        animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                        '@keyframes fadeInUp': {
                          '0%': {
                            opacity: 0,
                            transform: 'translateY(20px)',
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                    >
                      {renderElement(element)}
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </Fade>
        </Box>
      </ContentContainer>
    </StyledDialog>
  );
};

export default InteractivePlayDialog;

