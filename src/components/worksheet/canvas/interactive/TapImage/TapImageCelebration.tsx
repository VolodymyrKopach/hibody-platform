'use client';

import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TapImageCelebrationProps } from './types';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';

const TapImageCelebration: React.FC<TapImageCelebrationProps> = ({
  show,
  message = 'Amazing! You did it!',
  onComplete,
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000); // 5 seconds of celebration!
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // 🎨 Party colors
  const partyColors = ['#FF6B9D', '#FEC84D', '#4ECDC4', '#C7CEEA', '#FF6B6B', '#51CF66'];
  const balloonEmojis = ['🎈', '🎉', '🎊', '✨', '⭐', '💫', '🌟'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            background: `linear-gradient(135deg, 
              rgba(255, 107, 157, 0.95) 0%,
              rgba(254, 200, 77, 0.95) 25%,
              rgba(78, 205, 196, 0.95) 50%,
              rgba(199, 206, 234, 0.95) 75%,
              rgba(255, 107, 107, 0.95) 100%)`,
            backgroundSize: '400% 400%',
            animation: 'gradient 3s ease infinite',
          }}
        >
          <style>
            {`
              @keyframes gradient {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}
          </style>

          {/* 🎊 Confetti explosion */}
          {Array.from({ length: 100 }).map((_, i) => {
            const randomColor = partyColors[Math.floor(Math.random() * partyColors.length)];
            const randomX = (Math.random() - 0.5) * 200;
            const randomY = -100 - Math.random() * 100;
            const randomRotate = Math.random() * 720;
            const randomDelay = Math.random() * 0.5;

            return (
              <motion.div
                key={`confetti-${i}`}
                initial={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: randomX,
                  y: randomY,
                  rotate: randomRotate,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: randomDelay,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  background: randomColor,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  left: '50%',
                  top: '50%',
                }}
              />
            );
          })}

          {/* 🎈 Rising balloons */}
          {Array.from({ length: 20 }).map((_, i) => {
            const randomX = Math.random() * 100;
            const emoji = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
            const randomDelay = Math.random() * 2;

            return (
              <motion.div
                key={`balloon-${i}`}
                initial={{
                  x: `${randomX}vw`,
                  y: '110vh',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: [`${randomX}vw`, `${randomX + (Math.random() - 0.5) * 20}vw`],
                  y: [
'110vh', '-20vh'],
                  scale: [0, 1.5, 1.8, 2],
                  rotate: [0, (Math.random() - 0.5) * 90],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  delay: randomDelay,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  fontSize: 48,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                }}
              >
                {emoji}
              </motion.div>
            );
          })}

          {/* 🏆 Center content */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              zIndex: 10,
            }}
          >
            {/* Giant trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.5, 1.2, 1.3, 1.2],
                rotate: [- 180, 0],
              }}
              transition={{
                duration: 1,
                ease: 'easeOut',
              }}
              style={{
                fontSize: 120,
                filter: 'drop-shadow(0 8px 32px rgba(255, 215, 0, 0.8))',
              }}
            >
              <motion.span
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🏆
              </motion.span>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Typography
                sx={{
                  fontSize: baseStyle.typography.fontSize * 3,
                  fontWeight: 900,
                  color: 'white',
                  textAlign: 'center',
                  textShadow: '4px 4px 0 rgba(0,0,0,0.3), -2px -2px 0 rgba(255,255,255,0.3)',
                  letterSpacing: 2,
                  lineHeight: 1.3,
                  maxWidth: 500,
                }}
              >
                {message}
              </Typography>
            </motion.div>

            {/* Dancing stars */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {Array.from({ length: 7 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, y: 50 }}
                  animate={{
                    scale: [0, 1.5, 1.2, 1.4, 1.2],
                    y: [50, 0, -10, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    delay: 0.8 + index * 0.1,
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                  style={{
                    fontSize: 56,
                    filter: 'drop-shadow(0 4px 16px rgba(255, 215, 0, 0.8))',
                  }}
                >
                  <motion.span
                    animate={{
                      rotate: [0, -15, 15, -15, 15, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut',
                    }}
                  >
                    ⭐
                  </motion.span>
                </motion.div>
              ))}
            </Box>

            {/* Fun emojis */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
              }}
            >
              {['🎊', '🥳', '🎉', '😊', '👏'].map((emoji, index) => (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0, y: 50 }}
                  animate={{
                    scale: [0, 1.8, 1.5],
                    y: [50, -10, 0],
                    rotate: [0, (index % 2 === 0 ? -20 : 20), 0],
                  }}
                  transition={{
                    delay: 1.5 + index * 0.15,
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  style={{
                    fontSize: 52,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                  }}
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut',
                    }}
                  >
                    {emoji}
                  </motion.span>
                </motion.div>
              ))}
            </Box>

            {/* Sparkle burst */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              const distance = 150;

              return (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.cos(angle * Math.PI / 180) * distance,
                    y: Math.sin(angle * Math.PI / 180) * distance,
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3,
                    repeat: 2,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: 32,
                  }}
                >
                  ✨
                </motion.div>
              );
            })}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TapImageCelebration;
