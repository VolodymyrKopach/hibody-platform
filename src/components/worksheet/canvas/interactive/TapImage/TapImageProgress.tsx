'use client';

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TapImageProgressProps } from './types';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';

const TapImageProgress: React.FC<TapImageProgressProps> = ({
  current,
  total,
  showLabel = true,
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);
  
  // Safe fallback values
  const safeColors = {
    primary: colorPsychology?.primary || '#FF6B6B',
    secondary: colorPsychology?.secondary || '#4ECDC4',
    success: colorPsychology?.success || '#51CF66',
    text: colorPsychology?.text || '#212529',
  };

  const percentage = Math.min((current / total) * 100, 100);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: Math.min(total * 50 + 40, 400),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75, // Компактніше між іконками та label
      }}
    >
      {/* 🎯 Visual progress with individual icons */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current - 1;
          
          return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isCompleted ? 1 : 1,
                opacity: 1,
              }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isCompleted
                    ? `linear-gradient(135deg, ${safeColors.success}, ${safeColors.primary})`
                    : alpha(safeColors.text, 0.08),
                  border: `3px solid ${isCompleted ? safeColors.success : alpha(safeColors.text, 0.15)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  position: 'relative',
                  boxShadow: isCompleted 
                    ? `0 4px 16px ${alpha(safeColors.success, 0.4)}`
                    : 'none',
                  transition: `all ${baseStyle.animations.duration}ms ${baseStyle.animations.easing}`,
                }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="star"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      ⭐
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: alpha(safeColors.text, 0.2),
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulse animation for current item */}
                {isCurrent && (
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: '50%',
                      border: `3px solid ${safeColors.primary}`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Label with percentage */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Typography
            sx={{
              fontSize: baseStyle.typography.fontSize * 1.1,
              fontWeight: 700,
              color: safeColors.primary,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${safeColors.primary}, ${safeColors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {current} з {total} ✨
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default TapImageProgress;

