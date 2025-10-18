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
import { X, Play, Maximize2 } from 'lucide-react';
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
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '95vw',
    maxHeight: '95vh',
    width: '95vw',
    height: '95vh',
    margin: theme.spacing(2),
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
    background: theme.palette.background.paper,
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
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  overflow: 'auto',
  background: theme.palette.background.default,
  
  '&::-webkit-scrollbar': {
    width: 14,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.success.main, 0.4),
    borderRadius: 6,
    
    '&:hover': {
      background: alpha(theme.palette.success.main, 0.6),
    },
  },
}));

const InteractivePlayDialog: React.FC<InteractivePlayDialogProps> = ({
  open,
  onClose,
  pageTitle,
  pageNumber,
  background,
  elements,
}) => {
  const theme = useTheme();
  
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
    >
      <DialogHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Play size={24} fill="currentColor" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Play Mode - {pageTitle}
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
            label="⚡ Interactive"
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.success.contrastText, 0.2),
              color: theme.palette.success.contrastText,
              fontWeight: 700,
            }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'inherit', position: 'relative', zIndex: 1 }}>
          <X size={20} />
        </IconButton>
      </DialogHeader>

      <ContentContainer sx={getBackgroundStyle()}>
        <Fade in={open} timeout={500}>
          <Box>
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
                <Maximize2 size={48} color={theme.palette.text.disabled} />
                <Typography variant="h6" color="text.secondary">
                  No interactive elements on this page
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Add interactive components from the left sidebar
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {elements.map((element) => (
                  <Box key={element.id}>
                    {renderElement(element)}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Fade>
      </ContentContainer>
    </StyledDialog>
  );
};

export default InteractivePlayDialog;

