'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';
import { TapImageMode } from './types';
import { speakForAge } from '@/utils/interactive/textToSpeech';

interface TapImageTutorialProps {
  mode: TapImageMode;
  show: boolean;
  onComplete: () => void;
  enableVoice?: boolean;
  voiceLanguage?: 'uk-UA' | 'en-US' | 'ru-RU';
  ageStyle?: string;
}

interface TutorialStep {
  mascot: string;
  message: string;
  highlight?: 'image' | 'stars' | 'progress';
  duration: number;
}

const TapImageTutorial: React.FC<TapImageTutorialProps> = ({
  mode,
  show,
  onComplete,
  enableVoice = false,
  voiceLanguage = 'uk-UA',
  ageStyle = 'toddler',
}) => {
  const { baseStyle, colorPsychology } = useEnhancedAgeStyle(ageStyle as any);
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial steps based on mode
  const steps: Record<TapImageMode, TutorialStep[]> = {
    simple: [
      { mascot: '👋', message: 'Привіт! Я допоможу тобі!', duration: 2000 },
      { mascot: '👆', message: 'Тапни пальчиком на картинку!', highlight: 'image', duration: 3000 },
      { mascot: '⭐', message: 'Збери всі зірочки!', highlight: 'stars', duration: 2500 },
    ],
    find: [
      { mascot: '👋', message: 'Привіт! Давай пограємо!', duration: 2000 },
      { mascot: '🔍', message: 'Знайди правильну картинку!', highlight: 'image', duration: 3000 },
      { mascot: '👆', message: 'Тапни на неї пальчиком!', duration: 2500 },
    ],
    sequence: [
      { mascot: '👋', message: 'Привіт! Це цікава гра!', duration: 2000 },
      { mascot: '🔢', message: 'Тапай картинки по порядку!', highlight: 'image', duration: 3000 },
      { mascot: '1️⃣', message: 'Спочатку 1, потім 2, потім 3!', duration: 3000 },
    ],
    memory: [
      { mascot: '👋', message: 'Привіт! Перевіримо твою пам\'ять!', duration: 2000 },
      { mascot: '👀', message: 'Запам\'ятай цю картинку!', highlight: 'image', duration: 3000 },
      { mascot: '🤔', message: 'А тепер знайди її!', duration: 2500 },
    ],
  };

  const currentSteps = steps[mode] || steps.simple;
  const currentStepData = currentSteps[currentStep];

  useEffect(() => {
    if (!show) {
      setCurrentStep(0);
      return;
    }

    // Speak the message
    if (enableVoice && currentStepData) {
      speakForAge(currentStepData.message, ageStyle as any, voiceLanguage).catch(() => {});
    }

    // Auto-advance to next step
    if (currentStep < currentSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, currentStepData?.duration || 2500);
      return () => clearTimeout(timer);
    } else {
      // Complete tutorial after last step
      const timer = setTimeout(() => {
        onComplete();
      }, currentStepData?.duration || 2500);
      return () => clearTimeout(timer);
    }
  }, [show, currentStep, currentSteps, enableVoice, voiceLanguage, ageStyle, onComplete, currentStepData]);

  if (!show || !currentStepData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
      >
        {/* Spotlight effect on highlighted element */}
        {currentStepData.highlight && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Mascot */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            y: [0, -10, 0],
          }}
          transition={{
            scale: { type: 'spring', stiffness: 200 },
            rotate: { duration: 0.5 },
            y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            fontSize: baseStyle.sizes.icon * 3,
            marginBottom: baseStyle.sizes.gap * 2,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
          }}
        >
          {currentStepData.mascot}
        </motion.div>

        {/* Message bubble */}
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colorPsychology.primary}, ${colorPsychology.secondary})`,
              padding: `${baseStyle.sizes.padding * 2}px ${baseStyle.sizes.padding * 3}px`,
              borderRadius: `${baseStyle.borders.radius * 2}px`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              border: `${baseStyle.borders.width * 2}px solid #FFFFFF`,
              maxWidth: 400,
              position: 'relative',
            }}
          >
            {/* Speech bubble tail */}
            <Box
              sx={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderBottom: `15px solid ${colorPsychology.primary}`,
              }}
            />

            <Typography
              sx={{
                fontSize: baseStyle.typography.fontSize * 1.5,
                fontWeight: 700,
                color: '#FFFFFF',
                textAlign: 'center',
                lineHeight: 1.6,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {currentStepData.message}
            </Typography>
          </Box>
        </motion.div>

        {/* Animated hand pointing */}
        {currentStepData.highlight === 'image' && (
          <motion.div
            animate={{
              y: [0, 15, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              bottom: '30%',
              fontSize: '4rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}
          >
            👇
          </motion.div>
        )}

        {/* Progress dots */}
        <Box
          sx={{
            position: 'absolute',
            bottom: baseStyle.sizes.padding * 3,
            display: 'flex',
            gap: baseStyle.sizes.gap / 4,
          }}
        >
          {currentSteps.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentStep ? 1.5 : 1,
                opacity: index === currentStep ? 1 : 0.5,
              }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </Box>

        {/* Skip button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onComplete}
          style={{
            position: 'absolute',
            top: baseStyle.sizes.padding * 2,
            right: baseStyle.sizes.padding * 2,
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid #FFFFFF',
            borderRadius: baseStyle.borders.radius,
            padding: `${baseStyle.sizes.padding / 2}px ${baseStyle.sizes.padding}px`,
            color: '#FFFFFF',
            fontSize: baseStyle.typography.fontSize,
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          Пропустити ⏭️
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default TapImageTutorial;

