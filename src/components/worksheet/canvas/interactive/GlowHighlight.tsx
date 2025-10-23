'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, keyframes } from '@mui/material';
import { Sparkles } from 'lucide-react';

interface GlowHighlightProps {
  // Контент який підсвічувати
  children: React.ReactNode;
  
  // Чи активний ефект
  isActive?: boolean;
  
  // Колір підсвічування
  glowColor?: string;
  
  // Інтенсивність
  intensity?: 'low' | 'medium' | 'high';
  
  // Тривалість анімації (мс)
  duration?: number;
  
  // Автовимкнення після N мілісекунд
  autoOff?: number;
  
  // Тип анімації
  animationType?: 'pulse' | 'glow' | 'border' | 'shake';
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onHighlightEnd?: () => void;
}

// Анімації
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px 5px currentColor;
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow: 0 0 25px 10px currentColor, inset 0 0 20px 5px currentColor;
  }
`;

const borderAnimation = keyframes`
  0%, 100% {
    border-color: currentColor;
    border-width: 2px;
  }
  50% {
    border-color: currentColor;
    border-width: 4px;
  }
`;

const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

const GlowHighlight: React.FC<GlowHighlightProps> = ({
  children,
  isActive = false,
  glowColor = '#3B82F6',
  intensity = 'medium',
  duration = 2000,
  autoOff,
  animationType = 'pulse',
  isSelected,
  onEdit,
  onFocus,
  onHighlightEnd,
}) => {
  const [active, setActive] = useState(isActive);
  const [showSparkles, setShowSparkles] = useState(false);

  // Автовимкнення
  useEffect(() => {
    if (isActive && autoOff) {
      const timer = setTimeout(() => {
        setActive(false);
        onHighlightEnd?.();
      }, autoOff);
      return () => clearTimeout(timer);
    }
  }, [isActive, autoOff, onHighlightEnd]);

  // Синхронізація з props
  useEffect(() => {
    setActive(isActive);
    if (isActive) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), duration);
    }
  }, [isActive, duration]);

  // Інтенсивність
  const intensityConfig = {
    low: {
      blur: 5,
      spread: 5,
      opacity: 0.3,
    },
    medium: {
      blur: 15,
      spread: 10,
      opacity: 0.5,
    },
    high: {
      blur: 25,
      spread: 15,
      opacity: 0.7,
    },
  };

  const config = intensityConfig[intensity];

  // Вибір анімації
  const getAnimation = () => {
    switch (animationType) {
      case 'pulse':
        return pulseAnimation;
      case 'glow':
        return glowAnimation;
      case 'border':
        return borderAnimation;
      case 'shake':
        return shakeAnimation;
      default:
        return pulseAnimation;
    }
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: isSelected ? '2px solid' : active ? '2px solid' : '2px solid transparent',
          borderColor: isSelected ? 'primary.main' : glowColor,
          animation: active ? `${getAnimation()} ${duration}ms ease-in-out infinite` : 'none',
          color: glowColor,
          transition: 'all 0.3s ease',
          '&::before': active && animationType === 'glow' ? {
            content: '""',
            position: 'absolute',
            inset: -10,
            background: `radial-gradient(circle, ${alpha(glowColor, config.opacity)} 0%, transparent 70%)`,
            borderRadius: 3,
            zIndex: -1,
            filter: `blur(${config.blur}px)`,
            animation: `${glowAnimation} ${duration}ms ease-in-out infinite`,
          } : {},
        }}
      >
        {children}

        {/* Sparkles effect */}
        {active && showSparkles && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                animation: `${pulseAnimation} 1s ease-in-out infinite`,
                color: glowColor,
              }}
            >
              <Sparkles size={24} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                left: -10,
                animation: `${pulseAnimation} 1s ease-in-out infinite 0.5s`,
                color: glowColor,
              }}
            >
              <Sparkles size={20} />
            </Box>
          </>
        )}
      </Box>

      {/* Підказка */}
      {active && (
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: alpha(glowColor, 0.9),
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(glowColor, 0.4)}`,
            animation: `${pulseAnimation} ${duration}ms ease-in-out infinite`,
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          ✨ Look here!
        </Box>
      )}
    </Box>
  );
};

export default GlowHighlight;

