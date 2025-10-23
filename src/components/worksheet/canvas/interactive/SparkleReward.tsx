'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, keyframes } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Heart, Trophy, Zap, Gift, Medal, Crown } from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface SparkleRewardProps {
  // Тип нагороди
  type?: 'star' | 'heart' | 'trophy' | 'sparkle' | 'lightning' | 'gift' | 'medal' | 'crown';
  
  // Текст нагороди
  text?: string;
  
  // Розмір
  size?: 'small' | 'medium' | 'large' | 'huge';
  
  // Колір
  color?: string;
  
  // Інтенсивність ефектів
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  
  // Тривалість анімації (мс)
  duration?: number;
  
  // Автопоказ
  autoShow?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  
  // Звук
  soundEnabled?: boolean;
  soundType?: 'success' | 'fanfare' | 'cheer' | 'ding';
  
  // Вібрація
  hapticEnabled?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  
  // Конфеті
  confettiEnabled?: boolean;
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: () => void;
}

// Анімації
const sparkleAnimation = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.2) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.4) rotate(180deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.2) rotate(270deg);
    opacity: 0.8;
  }
`;

const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  10% {
    transform: translateY(-30px) scale(1.1);
  }
  20% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-15px) scale(1.05);
  }
  40% {
    transform: translateY(0) scale(1);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 30px 10px currentColor;
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const SparkleReward: React.FC<SparkleRewardProps> = ({
  type = 'star',
  text = 'Amazing! 🎉',
  size = 'large',
  color = '#FFD700',
  intensity = 'high',
  duration = 3000,
  autoShow = true,
  autoHide = true,
  autoHideDelay = 3000,
  soundEnabled = true,
  soundType = 'success',
  hapticEnabled = true,
  hapticIntensity = 'heavy',
  confettiEnabled = true,
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Конфігурація іконок
  const iconConfig = {
    star: { Icon: Star, defaultColor: '#FFD700', emoji: '⭐' },
    heart: { Icon: Heart, defaultColor: '#FF6B9D', emoji: '❤️' },
    trophy: { Icon: Trophy, defaultColor: '#FFA500', emoji: '🏆' },
    sparkle: { Icon: Sparkles, defaultColor: '#FF69B4', emoji: '✨' },
    lightning: { Icon: Zap, defaultColor: '#FFEB3B', emoji: '⚡' },
    gift: { Icon: Gift, defaultColor: '#4CAF50', emoji: '🎁' },
    medal: { Icon: Medal, defaultColor: '#FFD700', emoji: '🥇' },
    crown: { Icon: Crown, defaultColor: '#FFD700', emoji: '👑' },
  };

  const { Icon, defaultColor, emoji } = iconConfig[type];
  const rewardColor = color || defaultColor;

  // Конфігурація розмірів
  const sizeConfig = {
    small: {
      iconSize: 40,
      fontSize: '1.5rem',
      padding: '20px 30px',
      scale: 0.8,
    },
    medium: {
      iconSize: 60,
      fontSize: '2rem',
      padding: '30px 40px',
      scale: 1,
    },
    large: {
      iconSize: 80,
      fontSize: '2.5rem',
      padding: '40px 50px',
      scale: 1.2,
    },
    huge: {
      iconSize: 120,
      fontSize: '3.5rem',
      padding: '50px 60px',
      scale: 1.5,
    },
  };

  const sizeStyle = sizeConfig[size];

  // Конфігурація інтенсивності
  const intensityConfig = {
    low: {
      confettiCount: 30,
      confettiSpread: 50,
      particleCount: 3,
      animationDuration: '1s',
    },
    medium: {
      confettiCount: 60,
      confettiSpread: 70,
      particleCount: 5,
      animationDuration: '1.5s',
    },
    high: {
      confettiCount: 100,
      confettiSpread: 90,
      particleCount: 8,
      animationDuration: '2s',
    },
    extreme: {
      confettiCount: 200,
      confettiSpread: 120,
      particleCount: 15,
      animationDuration: '2.5s',
    },
  };

  const intensityStyle = intensityConfig[intensity];

  // Тригер ефектів
  useEffect(() => {
    if (isVisible && !hasTriggered) {
      setHasTriggered(true);

      // Звук
      if (soundEnabled) {
        soundService.play(soundType);
      }

      // Вібрація
      if (hapticEnabled) {
        triggerHaptic(hapticIntensity);
      }

      // Конфеті
      if (confettiEnabled) {
        triggerConfetti();
      }

      // Автоприховування
      if (autoHide) {
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, autoHideDelay);
      }
    }
  }, [isVisible, hasTriggered, soundEnabled, soundType, hapticEnabled, hapticIntensity, confettiEnabled, autoHide, autoHideDelay, onComplete]);

  // Конфеті ефект
  const triggerConfetti = () => {
    const count = intensityStyle.confettiCount;
    const spread = intensityStyle.confettiSpread;

    // Основний спалах
    confetti({
      particleCount: count,
      spread: spread,
      origin: { y: 0.6 },
      colors: [rewardColor, '#FFD700', '#FF69B4', '#4CAF50', '#2196F3'],
    });

    // Додаткові спалахи для high та extreme
    if (intensity === 'high' || intensity === 'extreme') {
      setTimeout(() => {
        confetti({
          particleCount: count / 2,
          angle: 60,
          spread: spread / 2,
          origin: { x: 0, y: 0.6 },
          colors: [rewardColor],
        });
        confetti({
          particleCount: count / 2,
          angle: 120,
          spread: spread / 2,
          origin: { x: 1, y: 0.6 },
          colors: [rewardColor],
        });
      }, 200);
    }

    // Зірковий дощ для extreme
    if (intensity === 'extreme') {
      const interval = setInterval(() => {
        confetti({
          particleCount: 10,
          angle: 90,
          spread: 45,
          origin: { x: Math.random(), y: 0 },
          colors: [rewardColor, '#FFD700'],
        });
      }, 100);

      setTimeout(() => clearInterval(interval), 1000);
    }
  };

  // Частинки навколо
  const renderParticles = () => {
    const particles = [];
    const count = intensityStyle.particleCount;

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const distance = 100;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;

      particles.push(
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, x, x],
            y: [0, y, y],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            position: 'absolute',
            fontSize: '1.5rem',
          }}
        >
          {emoji}
        </motion.div>
      );
    }

    return particles;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -50 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          onClick={onFocus}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: sizeStyle.padding,
              background: `linear-gradient(135deg, ${alpha(rewardColor, 0.95)} 0%, ${alpha(rewardColor, 0.85)} 100%)`,
              borderRadius: 4,
              boxShadow: `0 20px 60px ${alpha(rewardColor, 0.5)}, 
                         0 0 0 2px ${alpha('#fff', 0.3)},
                         inset 0 0 30px ${alpha('#fff', 0.2)}`,
              border: `3px solid ${alpha('#fff', 0.5)}`,
              animation: `${pulseAnimation} ${intensityStyle.animationDuration} ease-in-out`,
              cursor: onFocus ? 'pointer' : 'default',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Частинки */}
            {intensity !== 'low' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                }}
              >
                {renderParticles()}
              </Box>
            )}

            {/* Іконка */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: sizeStyle.iconSize,
                  height: sizeStyle.iconSize,
                  borderRadius: '50%',
                  backgroundColor: alpha('#fff', 0.9),
                  animation: `${glowAnimation} 2s ease-in-out infinite`,
                  color: rewardColor,
                }}
              >
                <Icon size={sizeStyle.iconSize * 0.6} strokeWidth={2.5} />
              </Box>
            </motion.div>

            {/* Текст */}
            <Typography
              variant="h4"
              sx={{
                fontSize: sizeStyle.fontSize,
                fontWeight: 900,
                color: '#fff',
                textAlign: 'center',
                textShadow: `0 2px 10px ${alpha('#000', 0.3)}, 
                            0 0 20px ${alpha(rewardColor, 0.5)}`,
                letterSpacing: '1px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {text}
            </Typography>

            {/* Додаткові зірочки по кутах */}
            {intensity !== 'low' && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    animation: `${sparkleAnimation} 2s ease-in-out infinite`,
                    color: '#FFD700',
                  }}
                >
                  <Sparkles size={24} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    animation: `${sparkleAnimation} 2s ease-in-out infinite 0.5s`,
                    color: '#FFD700',
                  }}
                >
                  <Sparkles size={24} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    left: -10,
                    animation: `${sparkleAnimation} 2s ease-in-out infinite 1s`,
                    color: '#FFD700',
                  }}
                >
                  <Sparkles size={24} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    animation: `${sparkleAnimation} 2s ease-in-out infinite 1.5s`,
                    color: '#FFD700',
                  }}
                >
                  <Sparkles size={24} />
                </Box>
              </>
            )}

            {/* Rays background */}
            {intensity === 'extreme' && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: -50,
                  background: `radial-gradient(circle, ${alpha(rewardColor, 0.3)} 0%, transparent 70%)`,
                  animation: `${sparkleAnimation} 3s linear infinite`,
                  zIndex: 0,
                }}
              />
            )}
          </Box>

          {/* Backdrop overlay */}
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              backgroundColor: alpha('#000', 0.5),
              backdropFilter: 'blur(5px)',
              zIndex: -1,
            }}
            onClick={() => setIsVisible(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SparkleReward;

