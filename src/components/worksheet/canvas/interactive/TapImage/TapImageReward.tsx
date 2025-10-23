'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TapImageRewardProps } from './types';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';

const TapImageReward: React.FC<TapImageRewardProps> = ({
  stars,
  maxStars,
  animate = true,
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);

  const starSize = baseStyle.sizes.icon * 0.8;

  const starVariants = {
    empty: {
      scale: 0.8,
      opacity: 0.3,
    },
    filled: {
      scale: 1,
      opacity: 1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        scale: { type: 'spring', stiffness: 300, damping: 10 },
        rotate: { duration: 0.5 },
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        sx={{
          display: 'flex',
          gap: baseStyle.sizes.gap / 4,
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${baseStyle.sizes.padding / 2}px ${baseStyle.sizes.padding}px`,
          background: `linear-gradient(135deg, ${colorPsychology.primary}20, ${colorPsychology.secondary}20)`,
          borderRadius: `${baseStyle.borders.radius}px`,
          border: `${baseStyle.borders.width}px solid ${colorPsychology.primary}40`,
          boxShadow: `0 4px 12px ${colorPsychology.primary}20`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {Array.from({ length: maxStars }).map((_, index) => {
            const isFilled = index < stars;
            const isNewStar = index === stars - 1 && animate;

            return (
              <motion.div
                key={index}
                variants={starVariants}
                initial={isFilled ? 'empty' : 'empty'}
                animate={isFilled ? 'filled' : 'empty'}
                style={{
                  fontSize: starSize,
                  lineHeight: 1,
                  filter: isFilled
                    ? `drop-shadow(0 2px 6px ${colorPsychology.success}80)`
                    : 'none',
                }}
              >
                {isFilled ? '⭐' : '☆'}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Sparkle effect when getting a new star */}
        {animate && stars > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [0, 1.5, 0], rotate: 180 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              fontSize: starSize * 1.5,
              pointerEvents: 'none',
            }}
          >
            ✨
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default TapImageReward;

