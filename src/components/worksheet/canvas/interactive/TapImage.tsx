'use client';

import React, { useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '@/services/interactive/SoundService';
import { hapticService } from '@/utils/interactive/haptics';
import { bounceAnimation, pulseAnimation, celebrationAnimation } from '@/utils/interactive/animations';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface TapImageProps {
  imageUrl: string;
  soundEffect?: 'animal' | 'action' | 'praise' | 'custom';
  customSound?: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'bounce' | 'scale' | 'shake' | 'spin';
  showHint?: boolean;
  align?: 'left' | 'center' | 'right';
  theme?: ThemeName;
  ageGroup?: string;
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
  theme: themeName,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const muiTheme = useTheme();
  const componentTheme = useComponentTheme(themeName);
  const [tapCount, setTapCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Size mapping - адаптується під тему
  const getSizeForTheme = () => {
    // Базові розміри
    const baseSizes = {
      small: 200,
      medium: 350,
      large: 500,
    };
    
    // Для малюків - більші елементи
    if (componentTheme.animations.complexity === 'very-high') {
      return {
        small: 250,
        medium: 400,
        large: 550,
      };
    }
    
    // Для підлітків/дорослих - менші, компактніші
    if (componentTheme.animations.complexity === 'low' || componentTheme.animations.complexity === 'minimal') {
      return {
        small: 150,
        medium: 280,
        large: 420,
      };
    }
    
    return baseSizes;
  };

  const sizeMap = getSizeForTheme();
  const imageSize = sizeMap[size];
  
  // Стиль рамки залежить від теми
  const getBorderRadius = () => {
    if (componentTheme.ui.buttonStyle === 'pill') {
      return `${componentTheme.borderRadius.xl}px`;
    }
    if (componentTheme.ui.buttonStyle === 'rounded') {
      return `${componentTheme.borderRadius.md}px`;
    }
    return `${componentTheme.borderRadius.sm}px`; // square
  };
  
  // Чи показувати анімації залежить від складності теми
  const shouldShowAnimations = componentTheme.animations.complexity !== 'minimal' && componentTheme.animations.complexity !== 'low';

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
   * Confetti component - адаптується під тему
   */
  const Confetti = () => {
    // Кольори з теми
    const colors = [
      componentTheme.colors.primary,
      componentTheme.colors.secondary,
      componentTheme.colors.accent,
      componentTheme.colors.success,
      componentTheme.colors.warning,
    ];
    
    // Кількість частинок залежить від складності анімацій
    const particleCount = componentTheme.animations.complexity === 'very-high' ? 30 : 
                         componentTheme.animations.complexity === 'high' ? 20 : 10;
    const particles = Array.from({ length: particleCount });

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
              duration: (componentTheme.animations.duration.slow / 1000) + Math.random() * 0.4,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: componentTheme.spacing.xs + Math.random() * 4,
              height: componentTheme.spacing.xs + Math.random() * 4,
              borderRadius: componentTheme.ui.buttonStyle === 'square' ? '2px' : '50%',
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
        gap: componentTheme.spacing.md / 8, // Convert to MUI spacing units
        p: componentTheme.spacing.md / 8,
        borderRadius: getBorderRadius(),
        border: isSelected
          ? `3px solid ${componentTheme.colors.primary}`
          : `3px solid transparent`,
        background: isSelected
          ? alpha(componentTheme.colors.primary, 0.08)
          : 'transparent',
        transition: `all ${componentTheme.animations.duration.normal}ms`,
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
            borderRadius: getBorderRadius(),
            overflow: 'hidden',
            boxShadow: componentTheme.ui.cardElevation === 'high' 
              ? componentTheme.shadows.lg 
              : componentTheme.ui.cardElevation === 'medium'
                ? componentTheme.shadows.md
                : componentTheme.shadows.sm,
            border: `${componentTheme.spacing.xs / 2}px solid ${componentTheme.colors.surface}`,
            position: 'relative',
            transition: `all ${componentTheme.animations.duration.normal}ms`,
            '&:hover': componentTheme.animations.enableHover ? {
              boxShadow: componentTheme.shadows.xl,
              transform: 'scale(1.02)',
            } : {},
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

          {/* Tap count badge - тільки якщо тема підтримує анімації */}
          {tapCount > 0 && shouldShowAnimations && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: componentTheme.animations.duration.fast / 1000 }}
              style={{
                position: 'absolute',
                top: componentTheme.spacing.md,
                right: componentTheme.spacing.md,
                background: componentTheme.colors.success,
                color: componentTheme.colors.surface,
                borderRadius: componentTheme.ui.buttonStyle === 'pill' ? '50%' : `${componentTheme.borderRadius.md}px`,
                width: componentTheme.spacing.xl,
                height: componentTheme.spacing.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: componentTheme.typography.fontWeight.bold,
                fontSize: `${componentTheme.typography.fontSize.medium}px`,
                fontFamily: componentTheme.typography.fontFamily,
                boxShadow: componentTheme.shadows.md,
              }}
            >
              {tapCount}
            </motion.div>
          )}
        </Box>

        {/* Animated hand hint - тільки для малюків */}
        {showHint && shouldShowAnimations && componentTheme.animations.complexity === 'very-high' && <HandHint />}

        {/* Confetti - тільки якщо тема підтримує particles */}
        <AnimatePresence>
          {showConfetti && componentTheme.animations.enableParticles && <Confetti />}
        </AnimatePresence>
      </motion.div>

      {/* Caption */}
      {caption && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: componentTheme.typography.title,
            fontFamily: componentTheme.typography.fontFamily,
            color: componentTheme.colors.text,
            textAlign: 'center',
            transition: componentTheme.animations.quick,
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
            fontSize: componentTheme.typography.small,
            fontFamily: componentTheme.typography.fontFamily,
            color: muiTheme.palette.primary.main,
            fontWeight: 600,
            transition: componentTheme.animations.quick,
          }}
        >
          ⚡ Interactive Component
        </Typography>
      )}
    </Box>
  );
};

export default TapImage;

