'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

// Page dimensions constants (matching worksheet pages)
const A4_WIDTH = 794;
const INTERACTIVE_WIDTH = 1200;

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
    colors?: string[]; // For multi-color gradients (2-4 colors)
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number; // Custom scale multiplier (0.5 - 2.0)
    opacity?: number; // Pattern opacity (0-100)
  };
  opacity?: number;
}

interface InteractivePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  elementType?: string;
  pageType?: 'pdf' | 'interactive'; // Page type determines width
  pageWidth?: number; // Custom width (optional)
  background?: PageBackground; // Page background
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const InteractivePreviewDialog: React.FC<InteractivePreviewDialogProps> = ({
  open,
  onClose,
  title = 'Interactive Preview',
  children,
  elementType,
  pageType = 'interactive',
  pageWidth: customWidth,
  background,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const theme = useTheme();
  
  // Calculate page width
  const pageWidth = customWidth || (pageType === 'pdf' ? A4_WIDTH : INTERACTIVE_WIDTH);

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
          
          // Support multi-color gradients
          const gradientColors = colors && colors.length >= 2 ? colors : [from, to];
          
          // Convert direction format: 'to-bottom-right' -> 'to bottom right'
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
          
          // Parse backgroundSize and apply scale
          let scaledSize = background.pattern.backgroundSize;
          if (background.pattern.backgroundSize !== 'auto') {
            // Extract numeric values and scale them
            scaledSize = background.pattern.backgroundSize.replace(/(\d+)px/g, (match, p1) => {
              return `${Math.round(parseInt(p1) * scale)}px`;
            });
          }
          
          // Replace colors in CSS with custom colors and apply opacity
          let customCss = background.pattern.css
            .replace(/#E5E7EB/g, background.pattern.patternColor)
            .replace(/#DBEAFE/g, background.pattern.patternColor)
            .replace(/#F3F4F6/g, background.pattern.patternColor)
            .replace(/#FDE68A/g, background.pattern.patternColor)
            .replace(/#D1D5DB/g, background.pattern.patternColor);
          
          // Add opacity to pattern color if not full opacity
          if (patternOpacity < 1) {
            // Convert hex to rgba with opacity
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

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const displayNames: Record<string, string> = {
    'tap-image': '🖼️ Tap Image',
    'simple-drag-and-drop': '🎯 Drag & Drop',
    'color-matcher': '🎨 Color Matcher',
    'memory-cards': '🃏 Memory Cards',
    'sorting-game': '📦 Sorting Game',
    'sequence-builder': '🔢 Sequence Builder',
    'shape-tracer': '✏️ Shape Tracer',
    'emotion-recognizer': '😊 Emotion Recognizer',
    'scene-explorer': '🔍 Scene Explorer',
    'progress-tracker': '📊 Progress Tracker',
    'magnetic-playground': '🧲 Magnetic Playground',
    'coloring-canvas': '🎨 Coloring Canvas',
    'sticker-scene': '🎭 Sticker Scene',
    'glow-highlight': '✨ Glow Highlight',
    'animated-mascot': '🐰 Animated Mascot',
    'sparkle-reward': '🎉 Sparkle Reward',
    'simple-counter': '🔢 Simple Counter',
    'interactive-page': '📄 Interactive Page',
  };

  const componentTitle = elementType ? (displayNames[elementType] || title) : title;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={false}
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          width: isFullscreen ? '100%' : '95vw',
          height: isFullscreen ? '100%' : '95vh',
          maxWidth: isFullscreen ? '100%' : '100vw',
          maxHeight: isFullscreen ? '100%' : '100vh',
          borderRadius: isFullscreen ? 0 : 0,
          overflow: 'hidden',
          background: 'transparent',
          boxShadow: 'none',
          margin: 0,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            background: alpha('#000', 0.5),
          },
        },
      }}
    >
      {/* Floating Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          padding: '8px 16px',
          boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
        }}
      >
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {componentTitle}
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              PREVIEW
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={handleReset}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
              },
            }}
            title="Reset"
          >
            <RotateCcw size={18} />
          </IconButton>

          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
            }}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </IconButton>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
            title="Close"
          >
            <X size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Content - Centered with page width */}
      <DialogContent
        sx={{
          p: 0,
          height: '100%',
          overflow: 'auto',
          background: 'transparent',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 10, // Space for floating header
          pb: 8,  // Space for floating instructions
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.divider, 0.05),
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.divider, 0.2),
            borderRadius: 5,
            '&:hover': {
              background: alpha(theme.palette.divider, 0.3),
            },
          },
        }}
      >
        {/* Background Layer - Fullscreen */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            ...getBackgroundStyle(),
          }}
        />

        {/* Page container with fixed width */}
        <Box
          key={key}
          sx={{
            width: pageWidth,
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            py: 4,
            px: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </Box>
      </DialogContent>

      {/* Floating Instructions */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          background: alpha('#000', 0.7),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          💡 Press{' '}
          <Box
            component="kbd"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: alpha('#fff', 0.2),
              fontFamily: 'monospace',
              fontSize: '0.7rem',
            }}
          >
            ESC
          </Box>{' '}
          to close
        </Typography>
      </Box>
    </Dialog>
  );
};

export default InteractivePreviewDialog;
