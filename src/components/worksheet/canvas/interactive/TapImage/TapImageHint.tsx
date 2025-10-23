'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { TapImageHintProps } from './types';

const TapImageHint: React.FC<TapImageHintProps> = ({
  show,
  type,
  position,
}) => {
  if (!show) return null;

  const handVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      y: [0, -15, 0],
      transition: {
        scale: { duration: 0.3 },
        y: {
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const arrowVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: [-20, -10, -20],
      transition: {
        opacity: { duration: 0.3 },
        y: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  };

  if (type === 'hand') {
    return (
      <motion.div
        variants={handVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'absolute',
          bottom: -60,
          right: -60,
          fontSize: '4rem',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          pointerEvents: 'none',
          zIndex: 100,
          ...(position && {
            left: position.x,
            top: position.y,
            bottom: 'auto',
            right: 'auto',
          }),
        }}
      >
        👆
      </motion.div>
    );
  }

  if (type === 'glow') {
    return (
      <motion.div
        variants={glowVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'absolute',
          top: -12,
          left: -12,
          right: -12,
          bottom: -12,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
          borderRadius: 32,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    );
  }

  if (type === 'arrow') {
    return (
      <motion.div
        variants={arrowVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '3rem',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        ⬇️
      </motion.div>
    );
  }

  return null;
};

export default TapImageHint;

