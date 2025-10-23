'use client';

import React from 'react';
import { Box, IconButton, alpha, keyframes } from '@mui/material';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractivePlayButtonProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'top-right' | 'bottom-right';
}

// Pulse animation
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
`;

const InteractivePlayButton: React.FC<InteractivePlayButtonProps> = ({
  onClick,
  size = 'medium',
  position = 'center',
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      buttonSize: 48,
      iconSize: 24,
      overlayOpacity: 0.3,
    },
    medium: {
      buttonSize: 64,
      iconSize: 32,
      overlayOpacity: 0.4,
    },
    large: {
      buttonSize: 80,
      iconSize: 40,
      overlayOpacity: 0.5,
    },
  };

  const config = sizeConfig[size];

  // Position configurations
  const positionStyles = {
    center: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    'top-right': {
      position: 'absolute' as const,
      top: 8,
      right: 8,
    },
    'bottom-right': {
      position: 'absolute' as const,
      bottom: 8,
      right: 8,
    },
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <>
      {/* Overlay */}
      {position === 'center' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: alpha('#000', config.overlayOpacity),
            backdropFilter: 'blur(2px)',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Play button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        style={{
          ...positionStyles[position],
          zIndex: 11,
        }}
      >
        <IconButton
          onClick={handleClick}
          sx={{
            width: config.buttonSize,
            height: config.buttonSize,
            backgroundColor: '#2196F3',
            color: 'white',
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
            boxShadow: `0 4px 20px ${alpha('#2196F3', 0.4)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#1976D2',
              transform: 'scale(1.1)',
              boxShadow: `0 6px 30px ${alpha('#2196F3', 0.6)}`,
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <Play size={config.iconSize} fill="white" />
        </IconButton>

        {/* Hint text for center position */}
        {position === 'center' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: alpha('#000', 0.8),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: `0 4px 12px ${alpha('#000', 0.3)}`,
              }}
            >
              Click to preview interactive mode
            </Box>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default InteractivePlayButton;

