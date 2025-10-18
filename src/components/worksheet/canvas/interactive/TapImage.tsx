'use client';

import React, { useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '@/services/interactive/SoundService';
import { hapticService } from '@/utils/interactive/haptics';
import { bounceAnimation, pulseAnimation, celebrationAnimation } from '@/utils/interactive/animations';

interface TapImageProps {
  imageUrl: string;
  soundEffect?: 'animal' | 'action' | 'praise' | 'custom';
  customSound?: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'bounce' | 'scale' | 'shake' | 'spin';
  showHint?: boolean;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const TapImage: React.FC<TapImageProps> = ({
  imageUrl,
  soundEffect = 'praise',
  customSound,
  caption,
  size = 'medium',
  animation = 'bounce',
  showHint = false,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [tapCount, setTapCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Size mapping
  const sizeMap = {
    small: 200,
    medium: 350,
    large: 500,
  };

  const imageSize = sizeMap[size];

  /**
   * Handle tap/click
   */
  const handleTap = async () => {
    // Increment tap count
    setTapCount((prev) => prev + 1);

    // Haptic feedback
    hapticService.lightTap();

    // Play sound
    try {
      if (customSound) {
        await soundService.play('custom');
      } else {
        switch (soundEffect) {
          case 'animal':
            await soundService.play('animal-cat');
            break;
          case 'praise':
            await soundService.playRandomPraise();
            break;
          default:
            await soundService.play('tap');
        }
      }
    } catch (error) {
      console.error('[TapImage] Sound error:', error);
    }

    // Show confetti on every 3rd tap
    if ((tapCount + 1) % 3 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  /**
   * Confetti component
   */
  const Confetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const particles = Array.from({ length: 20 });

    return (
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {particles.map((_, index) => (
          <motion.div
            key={index}
            initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
            animate={{
              y: Math.random() * 200 - 100,
              x: Math.random() * 200 - 100,
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            }}
          />
        ))}
      </Box>
    );
  };

  /**
   * Animated hand hint
   */
  const HandHint = () => (
    <motion.div
      variants={pulseAnimation}
      initial="initial"
      animate="pulse"
      style={{
        position: 'absolute',
        bottom: -40,
        right: -40,
        fontSize: '3rem',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      👆
    </motion.div>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '20px',
        border: isSelected
          ? `3px solid ${theme.palette.primary.main}`
          : `3px solid transparent`,
        background: isSelected
          ? alpha(theme.palette.primary.main, 0.05)
          : 'transparent',
        transition: 'all 0.2s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onFocus}
    >
      {/* Image Container */}
      <motion.div
        variants={bounceAnimation}
        initial="initial"
        whileTap="tap"
        style={{
          position: 'relative',
        }}
      >
        <Box
          component={motion.div}
          onClick={handleTap}
          sx={{
            width: imageSize,
            height: imageSize,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            border: `4px solid ${theme.palette.background.paper}`,
            position: 'relative',
            '&:hover': {
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
            },
          }}
        >
          {/* Image */}
          <Box
            component="img"
            src={imageUrl || '/placeholder-image.png'}
            alt={caption || 'Tap me!'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Tap count badge */}
          {tapCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: theme.palette.success.main,
                color: 'white',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {tapCount}
            </motion.div>
          )}
        </Box>

        {/* Animated hand hint */}
        {showHint && <HandHint />}

        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && <Confetti />}
        </AnimatePresence>
      </motion.div>

      {/* Caption */}
      {caption && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: 'center',
          }}
        >
          {caption}
        </Typography>
      )}

      {/* Edit mode indicator */}
      {isSelected && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}
        >
          ⚡ Interactive Component
        </Typography>
      )}
    </Box>
  );
};

export default TapImage;

