'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Slide,
  Paper,
  alpha,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractivePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  elementType?: string;
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
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  // Reset component
  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Component type display names
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
          width: isFullscreen ? '100%' : '90vw',
          height: isFullscreen ? '100%' : '90vh',
          maxWidth: isFullscreen ? '100%' : '1400px',
          maxHeight: isFullscreen ? '100%' : '900px',
          borderRadius: isFullscreen ? 0 : 3,
          overflow: 'hidden',
          backgroundColor: alpha('#f5f5f5', 0.98),
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
            }}
          >
            {componentTitle}
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: alpha('#2196F3', 0.1),
              border: '1px solid',
              borderColor: alpha('#2196F3', 0.3),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#2196F3',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              INTERACTIVE MODE
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Reset button */}
          <IconButton
            onClick={handleReset}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#FF9800', 0.1),
                color: '#FF9800',
              },
            }}
            title="Reset component"
          >
            <RotateCcw size={20} />
          </IconButton>

          {/* Fullscreen toggle */}
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#2196F3', 0.1),
                color: '#2196F3',
              },
            }}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </IconButton>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#f44336', 0.1),
                color: '#f44336',
              },
            }}
            title="Close preview"
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha('#f5f5f5', 0.5),
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(45deg, ${alpha('#000', 0.02)} 25%, transparent 25%),
              linear-gradient(-45deg, ${alpha('#000', 0.02)} 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, ${alpha('#000', 0.02)} 75%),
              linear-gradient(-45deg, transparent 75%, ${alpha('#000', 0.02)} 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            pointerEvents: 'none',
          }}
        />

        {/* Component container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                maxWidth: '800px',
                minHeight: '400px',
                p: 4,
                borderRadius: 3,
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 20px 60px ${alpha('#000', 0.15)}`,
              }}
            >
              {/* Interactive component */}
              {children}
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Instructions overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: alpha('#000', 0.7),
            backdropFilter: 'blur(10px)',
            zIndex: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            💡 Interact with the component • Press{' '}
            <Box
              component="kbd"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                backgroundColor: alpha('#fff', 0.2),
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              ESC
            </Box>{' '}
            to close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InteractivePreviewDialog;

