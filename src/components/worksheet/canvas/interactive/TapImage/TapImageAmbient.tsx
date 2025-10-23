'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';
import { AgeStyleName } from '@/types/interactive-age-styles';

interface TapImageAmbientProps {
  enabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  ageStyle?: AgeStyleName;
}

const TapImageAmbient: React.FC<TapImageAmbientProps> = ({
  enabled = true,
  intensity = 'medium',
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);

  if (!enabled) return null;

  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 35;
  
  // 🎨 Playful emojis for floating particles
  const playfulEmojis = ['⭐', '✨', '💫', '🌟', '⚡', '💖', '🎈', '🎨', '🦋', '🌈', '🎪', '🎭'];
  
  // 🎨 Vibrant colors
  const vibrantColors = [
    '#FF6B9D', // Hot Pink
    '#FEC84D', // Golden Yellow
    '#4ECDC4', // Turquoise
    '#95E1D3', // Mint
    '#C7CEEA', // Lavender
    '#FFE66D', // Lemon
    '#FF6B6B', // Coral
    '#4D96FF', // Sky Blue
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {Array.from({ length: particleCount }).map((_, index) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 8 + Math.random() * 8;
        const randomSize = 0.6 + Math.random() * 0.8;
        const isEmoji = Math.random() > 0.5;
        const emoji = playfulEmojis[Math.floor(Math.random() * playfulEmojis.length)];
        const color = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];

        return (
          <motion.div
            key={index}
            initial={{
              y: '110%',
              x: `${randomX}%`,
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              y: [
'110%',
                `${80 - Math.random() * 40}%`,
                `${60 - Math.random() * 30}%`,
                `${40 - Math.random() * 20}%`,
                '-20%',
              ],
              x: [
                `${randomX}%`,
                `${randomX + (Math.random() - 0.5) * 20}%`,
                `${randomX + (Math.random() - 0.5) * 30}%`,
                `${randomX + (Math.random() - 0.5) * 20}%`,
                `${randomX + (Math.random() - 0.5) * 10}%`,
              ],
              opacity: [0, 0.8, 1, 0.8, 0],
              scale: [0, randomSize, randomSize * 1.2, randomSize, 0],
              rotate: [0, 180, 360, 540, 720],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              fontSize: `${baseStyle.typography.fontSize * (1.2 + Math.random() * 0.8)}px`,
              color: isEmoji ? 'inherit' : color,
              filter: `drop-shadow(0 2px 8px ${color}60)`,
            }}
          >
            {isEmoji ? emoji : '⬤'}
          </motion.div>
        );
      })}
    </Box>
  );
};

export default TapImageAmbient;
