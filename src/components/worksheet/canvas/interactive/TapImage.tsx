'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { hapticService } from '@/utils/interactive/haptics';
import { bounceAnimation, pulseAnimation } from '@/utils/interactive/animations';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';
import { AgeStyleName } from '@/types/interactive-age-styles';

interface TapImageProps {
  imageUrl: string;
  soundEffect?: 'animal' | 'action' | 'praise' | 'custom';
  customSound?: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'bounce' | 'scale' | 'shake' | 'spin';
  showHint?: boolean;
  align?: 'left' | 'center' | 'right';
  ageGroup?: string;
  ageStyle?: AgeStyleName;
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
  ageGroup,
  ageStyle: ageStyleProp,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const muiTheme = useTheme();
  
  // Use enhanced age style with all features
  const enhancedStyle = useEnhancedAgeStyle(ageStyleProp, ageGroup);
  const { baseStyle, feedbackPattern, motivationSystem, colorPsychology } = enhancedStyle;
  
  const [tapCount, setTapCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Track age style changes for transition animation
  const [prevAgeStyle, setPrevAgeStyle] = useState(baseStyle.id);
  
  useEffect(() => {
    if (prevAgeStyle !== baseStyle.id) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
        setPrevAgeStyle(baseStyle.id);
      }, 300);
    }
  }, [baseStyle.id, prevAgeStyle]);

  // Size mapping - адаптується під age style
  const getSizeForAgeStyle = () => {
    const baseSize = baseStyle.sizes.element;
    
    return {
      small: baseSize * 0.8,
      medium: baseSize,
      large: baseSize * 1.3,
    };
  };

  const sizeMap = getSizeForAgeStyle();
  const imageSize = sizeMap[size];
  
  // Border radius від age style
  const getBorderRadius = () => {
    return `${baseStyle.borders.radius}px`;
  };
  
  // Чи показувати анімації
  const shouldShowAnimations = baseStyle.animations.enabled;

  /**
   * Handle tap/click with enhanced feedback
   */
  const handleTap = async () => {
    const feedback = feedbackPattern.onSuccess;
    
    // Increment tap count
    setTapCount((prev) => prev + 1);

    // Haptic feedback
    if (feedback.haptic) {
      hapticService.lightTap();
    }

    // Play sound based on age style
    if (feedback.sound && feedback.sound !== 'none') {
      try {
        if (customSound) {
          await soundService.play('custom');
        } else {
          switch (feedback.sound) {
            case 'cheerful':
              await soundService.playRandomPraise();
              break;
            case 'bell':
            case 'chime':
              await soundService.play('success');
              break;
            default:
              await soundService.play('tap');
          }
        }
      } catch (error) {
        console.error('[TapImage] Sound error:', error);
      }
    }

    // Show success message for younger ages
    if (feedback.message && motivationSystem.encouragementMessages.length > 0) {
      const message = enhancedStyle.getEncouragementMessage();
      setSuccessMessage(message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), feedback.duration);
    }

    // Show confetti/particles based on age style
    if (shouldShowAnimations && feedback.particles) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), feedback.duration);
    }
  };

  /**
   * Enhanced Confetti component with age-based particles
   */
  const Confetti = () => {
    const particleConfig = enhancedStyle.getParticleConfig();
    const particles = Array.from({ length: particleConfig.count });

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
              duration: (particleConfig.duration / 1000) + Math.random() * 0.4,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: baseStyle.sizes.gap / 2 + Math.random() * 4,
              height: baseStyle.sizes.gap / 2 + Math.random() * 4,
              borderRadius: baseStyle.borders.radius > 10 ? '50%' : '2px',
              backgroundColor: particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)],
            }}
          />
        ))}
      </Box>
    );
  };

  /**
   * Animated hand hint (for youngest ages)
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

  /**
   * Success message overlay
   */
  const SuccessMessage = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: alpha(colorPsychology.success, 0.95),
        color: '#FFFFFF',
        padding: `${baseStyle.sizes.padding}px ${baseStyle.sizes.padding * 1.5}px`,
        borderRadius: getBorderRadius(),
        fontSize: `${baseStyle.typography.fontSize}px`,
        fontWeight: baseStyle.typography.fontWeight,
        boxShadow: `0 ${baseStyle.sizes.gap / 2}px ${baseStyle.sizes.gap}px rgba(0,0,0,0.2)`,
        zIndex: 20,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {successMessage}
    </motion.div>
  );

  /**
   * Reward badge (stars/emojis)
   */
  const RewardBadge = () => {
    const reward = enhancedStyle.getRewardEmoji('task');
    if (!reward || tapCount === 0) return null;
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: baseStyle.animations.duration / 1000,
          type: 'spring',
          stiffness: 200,
        }}
        style={{
          position: 'absolute',
          top: baseStyle.sizes.padding,
          right: baseStyle.sizes.padding,
          background: colorPsychology.success,
          color: '#FFFFFF',
          borderRadius: baseStyle.borders.radius > 10 ? '50%' : `${baseStyle.borders.radius}px`,
          width: baseStyle.sizes.icon,
          height: baseStyle.sizes.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: baseStyle.typography.fontWeight,
          fontSize: `${baseStyle.typography.fontSize * 0.8}px`,
          boxShadow: `0 ${baseStyle.sizes.gap / 4}px ${baseStyle.sizes.gap / 2}px rgba(0,0,0,0.2)`,
        }}
      >
        {tapCount}
      </motion.div>
    );
  };

  return (
    <Box
      component={motion.div}
      initial={false}
      animate={{
        scale: isTransitioning ? 0.95 : 1,
        opacity: isTransitioning ? 0.7 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: baseStyle.sizes.gap / 8,
        p: baseStyle.sizes.padding / 8,
        borderRadius: getBorderRadius(),
        border: isSelected
          ? `${baseStyle.borders.width}px solid ${colorPsychology.primary}`
          : `${baseStyle.borders.width}px solid transparent`,
        background: isSelected
          ? alpha(colorPsychology.primary, 0.08)
          : 'transparent',
        transition: `all ${baseStyle.animations.duration}ms ${baseStyle.animations.easing}`,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onFocus}
    >
      {/* Age style indicator (only when selected) */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -baseStyle.sizes.padding,
            left: baseStyle.sizes.padding,
            background: colorPsychology.primary,
            color: '#FFFFFF',
            px: 1.5,
            py: 0.5,
            borderRadius: `${baseStyle.borders.radius / 2}px`,
            fontSize: `${baseStyle.typography.fontSize * 0.6}px`,
            fontWeight: baseStyle.typography.fontWeight,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            boxShadow: `0 2px 8px ${alpha(colorPsychology.primary, 0.3)}`,
            zIndex: 1,
          }}
        >
          <Sparkles size={12} />
          {baseStyle.name.split('(')[0].trim()}
        </Box>
      )}

      {/* Image Container */}
      <motion.div
        variants={bounceAnimation}
        initial="initial"
        whileTap={shouldShowAnimations ? "tap" : undefined}
        style={{
          position: 'relative',
        }}
      >
        <Box
          component={motion.div}
          onClick={handleTap}
          whileHover={shouldShowAnimations ? { scale: 1.05 } : undefined}
          sx={{
            width: imageSize,
            height: imageSize,
            borderRadius: getBorderRadius(),
            overflow: 'hidden',
            boxShadow: `0 ${baseStyle.sizes.gap / 4}px ${baseStyle.sizes.gap / 2}px rgba(0,0,0,0.1)`,
            border: `${baseStyle.borders.width}px ${baseStyle.borders.style} ${baseStyle.colors.border}`,
            position: 'relative',
            transition: `all ${baseStyle.animations.duration}ms ${baseStyle.animations.easing}`,
            '&:hover': shouldShowAnimations ? {
              boxShadow: `0 ${baseStyle.sizes.gap / 2}px ${baseStyle.sizes.gap}px rgba(0,0,0,0.15)`,
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

          {/* Reward Badge */}
          {shouldShowAnimations && <RewardBadge />}
          
          {/* Success Message Overlay */}
          <AnimatePresence>
            {showSuccessMessage && <SuccessMessage />}
          </AnimatePresence>
        </Box>

        {/* Animated hand hint - тільки для малюків */}
        {showHint && shouldShowAnimations && baseStyle.interaction.showHandCursor && <HandHint />}

        {/* Confetti/Particles */}
        <AnimatePresence>
          {showConfetti && feedbackPattern.onSuccess.particles && <Confetti />}
        </AnimatePresence>
      </motion.div>

      {/* Caption */}
      {caption && baseStyle.typography.showLabels && (
        <Typography
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          sx={{
            fontWeight: baseStyle.typography.fontWeight,
            fontSize: baseStyle.typography.fontSize,
            lineHeight: baseStyle.typography.lineHeight,
            letterSpacing: `${baseStyle.typography.letterSpacing}px`,
            color: baseStyle.colors.text,
            textAlign: 'center',
            transition: `all ${baseStyle.animations.duration}ms`,
            maxWidth: imageSize,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
            fontSize: baseStyle.typography.fontSize * 0.7,
            color: colorPsychology.primary,
            fontWeight: baseStyle.typography.fontWeight,
            transition: `all ${baseStyle.animations.duration}ms`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          ⚡ Interactive Component
        </Typography>
      )}
    </Box>
  );
};

export default TapImage;
