'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, alpha, keyframes } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedMascotProps {
  // Тип персонажа (емодзі)
  character?: string;
  
  // Розмір
  size?: 'small' | 'medium' | 'large';
  
  // Емоція/стан
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging' | 'surprised';
  
  // Повідомлення
  message?: string;
  
  // Показувати повідомлення
  showMessage?: boolean;
  
  // Позиція
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  
  // Анімація появи
  entrance?: 'bounce' | 'slide' | 'fade' | 'zoom';
  
  // Автоматичні жести
  autoGesture?: boolean;
  gestureInterval?: number; // мс
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onClick?: () => void;
}

// Анімації
const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const waveAnimation = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
`;

const heartbeatAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.05);
  }
`;

const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  character = '🐰',
  size = 'medium',
  emotion = 'happy',
  message,
  showMessage = false,
  position = 'bottom-right',
  entrance = 'bounce',
  autoGesture = true,
  gestureInterval = 3000,
  isSelected,
  onEdit,
  onFocus,
  onClick,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [displayMessage, setDisplayMessage] = useState(showMessage);
  const [gesture, setGesture] = useState<string | null>(null);

  // Мапа емоцій на емодзі
  const emotionCharacters = {
    happy: '😊',
    excited: '🎉',
    thinking: '🤔',
    celebrating: '🎊',
    encouraging: '💪',
    surprised: '😮',
  };

  // Повідомлення за емоцією
  const emotionMessages = {
    happy: "Great job! Keep going! 🌟",
    excited: "Wow! You're doing amazing! 🚀",
    thinking: "Hmm... Let me help you think! 💭",
    celebrating: "Yay! You did it! 🎉",
    encouraging: "You can do it! I believe in you! 💖",
    surprised: "Oh wow! That's interesting! ✨",
  };

  // Розміри
  const sizeConfig = {
    small: {
      width: 60,
      height: 60,
      fontSize: '2rem',
      messageFont: '0.75rem',
    },
    medium: {
      width: 100,
      height: 100,
      fontSize: '3.5rem',
      messageFont: '0.875rem',
    },
    large: {
      width: 140,
      height: 140,
      fontSize: '5rem',
      messageFont: '1rem',
    },
  };

  const sizeStyle = sizeConfig[size];

  // Позиції
  const positionConfig = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  const positionStyle = positionConfig[position];

  // Автоматичні жести
  useEffect(() => {
    if (!autoGesture) return;

    const interval = setInterval(() => {
      const gestures = ['wave', 'bounce', 'heartbeat'];
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      setGesture(randomGesture);
      
      setTimeout(() => setGesture(null), 1000);
    }, gestureInterval);

    return () => clearInterval(interval);
  }, [autoGesture, gestureInterval]);

  // Entrance анімація
  const entranceVariants = {
    bounce: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 15 } },
    },
    slide: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    },
    fade: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    },
    zoom: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 10 } },
    },
  };

  const variant = entranceVariants[entrance];

  // Обробка кліку
  const handleClick = () => {
    setDisplayMessage(!displayMessage);
    onClick?.();
    onFocus?.();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        ...positionStyle,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={variant.initial}
          animate={variant.animate}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Персонаж */}
          <Box
            onClick={handleClick}
            sx={{
              position: 'relative',
              width: sizeStyle.width,
              height: sizeStyle.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: sizeStyle.fontSize,
              cursor: 'pointer',
              animation: gesture === 'bounce' ? `${bounceAnimation} 1s ease-in-out` :
                        gesture === 'wave' ? `${waveAnimation} 1s ease-in-out` :
                        gesture === 'heartbeat' ? `${heartbeatAnimation} 1s ease-in-out` :
                        'none',
              filter: isSelected ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))' : 'none',
              transition: 'filter 0.3s',
              '&:hover': {
                transform: 'scale(1.1)',
                filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
              },
            }}
          >
            {character}
            
            {/* Індикатор емоції */}
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                fontSize: '1.5rem',
              }}
            >
              {emotionCharacters[currentEmotion]}
            </Box>
          </Box>

          {/* Повідомлення */}
          <AnimatePresence>
            {(displayMessage || showMessage) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    bottom: position.includes('bottom') ? sizeStyle.height + 10 : undefined,
                    top: position.includes('top') ? sizeStyle.height + 10 : undefined,
                    left: position.includes('left') ? 0 : undefined,
                    right: position.includes('right') ? 0 : undefined,
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha('#FFFFFF', 0.95),
                    border: '2px solid #FFD700',
                    maxWidth: 200,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      [position.includes('bottom') ? 'top' : 'bottom']: -8,
                      [position.includes('left') ? 'left' : 'right']: 20,
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      [position.includes('bottom') ? 'borderBottom' : 'borderTop']: '8px solid #FFD700',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: sizeStyle.messageFont,
                      fontWeight: 600,
                      color: '#2D3748',
                      lineHeight: 1.5,
                    }}
                  >
                    {message || emotionMessages[currentEmotion]}
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default AnimatedMascot;

