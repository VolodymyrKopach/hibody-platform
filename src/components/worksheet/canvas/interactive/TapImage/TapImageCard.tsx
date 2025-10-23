'use client';

import React, { useState, useCallback } from 'react';
import { Box, Typography, Skeleton, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TapImageCardProps } from './types';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';

const TapImageCard: React.FC<TapImageCardProps> = ({
  image,
  size,
  isCorrect = false,
  isActive = true,
  isCompleted = false,
  sequenceNumber,
  showGlow = false,
  showPulse = false,
  disabled = false,
  ageStyle = 'toddler',
  onTap,
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);
  
  // Safe fallback values
  const safeColors = {
    primary: colorPsychology?.primary || '#FF6B9D',
    secondary: colorPsychology?.secondary || '#FEC84D',
    success: colorPsychology?.success || '#51CF66',
    background: colorPsychology?.background || '#F0F9FF',
    text: colorPsychology?.text || '#2D3748',
  };
  
  // 🎨 Playful color palette
  const playfulColors = [
    '#FF6B9D', // Pink
    '#FEC84D', // Yellow
    '#4ECDC4', // Turquoise
    '#95E1D3', // Mint
    '#C7CEEA', // Lavender
  ];
  
  const cardColor = playfulColors[Math.floor(Math.random() * playfulColors.length)];
  
  // Loading & interaction states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled && isActive && !isPressed) {
      setIsPressed(true);
      setShowSparkles(true);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      
      setTimeout(() => setIsPressed(false), 200);
      setTimeout(() => setShowSparkles(false), 1000);
      setTimeout(() => onTap(image.id), 80);
    }
  }, [disabled, isActive, isPressed, onTap, image.id]);

  // 🎪 Bouncy animation variants
  const bubbleVariants = {
    idle: {
      scale: 1,
      y: 0,
      rotate: 0,
    },
    float: {
      y: [-8, 8],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    },
    hover: {
      scale: 1.08,
      y: -8,
      rotate: [0, -3, 3, 0],
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    pressed: {
      scale: 0.92,
      y: 4,
    },
    pop: {
      scale: [1, 1.3, 0.9, 1.1, 1],
      rotate: [0, -15, 15, -8, 8, 0],
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  // 🌟 Sparkle effect positions
  const sparklePositions = [
    { top: '10%', left: '10%', delay: 0 },
    { top: '10%', right: '10%', delay: 0.1 },
    { bottom: '10%', left: '10%', delay: 0.2 },
    { bottom: '10%', right: '10%', delay: 0.3 },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1, // Компактніше між картинкою та label
      }}
    >
      {/* 🎪 Sequence number badge - playful style */}
      {sequenceNumber !== undefined && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: -16,
            left: -16,
            background: `linear-gradient(135deg, ${safeColors.primary}, ${safeColors.secondary})`,
            color: '#FFFFFF',
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 28,
            boxShadow: `0 6px 20px ${alpha(safeColors.primary, 0.5)}, 0 0 0 6px white, 0 0 0 8px ${alpha(safeColors.primary, 0.3)}`,
            zIndex: 20,
            border: '4px solid white',
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {sequenceNumber}
          </motion.span>
        </motion.div>
      )}

      {/* 🌟 Sparkles on tap */}
      <AnimatePresence>
        {showSparkles && sparklePositions.map((pos, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
              y: [0, -30],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: pos.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              ...pos,
              fontSize: 24,
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 🎈 Glow ring effect */}
      {(showGlow || isCorrect) && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle, ${alpha(isCorrect ? safeColors.success : safeColors.primary, 0.4)} 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* 🎪 Main bubble card */}
      <motion.div
        variants={bubbleVariants}
        initial="idle"
        animate={
          isPressed
            ? 'pressed'
            : isCorrect
            ? 'pop'
            : showPulse && !isCompleted
            ? 'float'
            : 'idle'
        }
        whileHover={!disabled && isActive ? 'hover' : undefined}
        onClick={handleClick}
        style={{
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          pointerEvents: disabled ? 'none' : 'auto',
          minWidth: Math.max(size, 88),
          minHeight: Math.max(size, 88),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: isCompleted ? 'grayscale(0.3)' : 'none',
        }}
      >
        {/* 🎨 Bubble container with gradient border */}
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%', // Full circle!
            overflow: 'hidden',
            border: `8px solid`,
            borderColor: 'white',
            boxShadow: isCorrect
              ? `0 12px 32px ${alpha(safeColors.success, 0.6)}, 0 0 0 4px ${safeColors.success}, 0 0 0 12px ${alpha(safeColors.success, 0.2)}, inset 0 4px 12px ${alpha(safeColors.success, 0.3)}`
              : showGlow
              ? `0 12px 32px ${alpha(safeColors.primary, 0.5)}, 0 0 0 4px ${safeColors.primary}, 0 0 0 12px ${alpha(safeColors.primary, 0.2)}`
              : `0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)`,
            position: 'relative',
            background: `linear-gradient(135deg, white 0%, ${alpha(cardColor, 0.1)} 100%)`,
            transition: 'all 0.3s ease',
          }}
        >
          {/* 🔥 Loading skeleton with playful colors */}
          {!imageLoaded && !imageError && (
            <Skeleton
              variant="circular"
              width="100%"
              height="100%"
              animation="wave"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bgcolor: alpha(cardColor, 0.2),
                '&::after': {
                  background: `linear-gradient(90deg, transparent, ${alpha(cardColor, 0.4)}, transparent)`,
                },
              }}
            />
          )}

          {/* 🖼️ Image */}
          <Box
            component="img"
            src={image.url || '/placeholder-image.png'}
            alt={image.label}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease',
              display: imageError ? 'none' : 'block',
            }}
          />

          {/* 🖼️ Error fallback with cute emoji */}
          {imageError && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(cardColor, 0.2)}, ${alpha(cardColor, 0.4)})`,
                fontSize: size * 0.4,
              }}
            >
              🎨
            </Box>
          )}

          {/* ✅ Success overlay with celebration */}
          {isCorrect && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle, ${alpha(safeColors.success, 0.8)} 0%, ${alpha(safeColors.success, 0.4)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.5,
              }}
            >
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                }}
              >
                ⭐
              </motion.span>
            </motion.div>
          )}

          {/* ✓ Completed checkmark badge */}
          {isCompleted && !isCorrect && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: `linear-gradient(135deg, ${safeColors.success}, #38B2AC)`,
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 900,
                border: '3px solid white',
                boxShadow: `0 4px 12px ${alpha(safeColors.success, 0.5)}`,
              }}
            >
              ✓
            </motion.div>
          )}
        </Box>
      </motion.div>

      {/* 🏷️ Label with playful style */}
      {image.label && baseStyle.typography.showLabels && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: baseStyle.typography.fontSize * 1.1,
              color: safeColors.text,
              textAlign: 'center',
              maxWidth: size,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textShadow: `2px 2px 0px ${alpha(cardColor, 0.2)}`,
              letterSpacing: '0.5px',
            }}
          >
            {image.label}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default TapImageCard;
