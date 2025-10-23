'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { TapImageMascotProps } from './types';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';

const TapImageMascot: React.FC<TapImageMascotProps> = ({
  emotion = 'idle',
  message,
  animate: animateProp = true,
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);

  // 🎭 Bigger, more expressive emoji mascots
  const getMascotCharacter = () => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'celebrating':
        return '🥳';
      case 'encouraging':
        return '🤗';
      case 'idle':
      default:
        return '🦊';
    }
  };

  // 🌟 Emotion-based glow colors
  const getGlowColor = () => {
    switch (emotion) {
      case 'happy':
        return '#FEC84D';
      case 'celebrating':
        return '#FF6B9D';
      case 'encouraging':
        return '#4ECDC4';
      default:
        return colorPsychology?.primary || '#FF6B9D';
    }
  };

  // 🎪 Enhanced bouncy animations
  const mascotVariants = {
    idle: {
      y: [0, -12, 0],
      rotate: [0, -5, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    happy: {
      scale: [1, 1.3, 1.1, 1.2, 1],
      rotate: [0, -15, 15, -10, 10, 0],
      y: [0, -25, -15, -20, 0],
      transition: {
        duration: 1,
        repeat: 3,
        ease: 'easeOut',
      },
    },
    encouraging: {
      y: [0, -20, 0, -15, 0],
      x: [-8, 8, -8, 8, 0],
      scale: [1, 1.15, 1, 1.1, 1],
      transition: {
        duration: 0.8,
        repeat: 5,
        ease: 'easeInOut',
      },
    },
    celebrating: {
      rotate: [0, -25, 25, -20, 20, -15, 15, 0],
      scale: [1, 1.5, 1.3, 1.4, 1.2, 1.3, 1.1, 1],
      y: [0, -30, 0, -35, 0, -25, 0, 0],
      transition: {
        duration: 2,
        ease: 'easeOut',
      },
    },
  };

  const glowColor = getGlowColor();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1, // Компактніше між mascot та speech bubble
        zIndex: 10,
      }}
    >
      {/* 🎪 Big mascot character */}
      <motion.div
        variants={mascotVariants}
        initial="idle"
        animate={animateProp ? emotion : 'idle'}
        style={{
          fontSize: baseStyle.sizes.icon * 4, // 4x bigger!
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          filter: `drop-shadow(0 8px 24px ${glowColor}80)`,
        }}
      >
        {/* 🌟 Pulsing glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
        
        {getMascotCharacter()}
        
        {/* ✨ Sparkles around mascot for celebrating */}
        {emotion === 'celebrating' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{
                  position: 'absolute',
                  fontSize: baseStyle.sizes.icon,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </motion.div>

      {/* 💬 Big speech bubble */}
      {message && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -20 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            background: 'white',
            padding: `${baseStyle.sizes.padding * 1.5}px ${baseStyle.sizes.padding * 2}px`,
            borderRadius: baseStyle.borders.radius * 2,
            boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 0 6px ${glowColor}40`,
            position: 'relative',
            maxWidth: 280,
            border: `4px solid ${glowColor}`,
          }}
        >
          {/* Triangle pointer */}
          <Box
            sx={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderBottom: `16px solid ${glowColor}`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '12px solid white',
            }}
          />
          
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              fontSize: baseStyle.typography.fontSize * 1.3,
              fontWeight: 800,
              color: baseStyle.colors.text,
              textAlign: 'center',
              lineHeight: 1.4,
              textShadow: `2px 2px 0 ${glowColor}20`,
            }}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </Box>
  );
};

export default TapImageMascot;
