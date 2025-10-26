'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { hapticService } from '@/utils/interactive/haptics';
import { speakForAge, stopSpeaking, isSpeechSupported } from '@/utils/interactive/textToSpeech';
import { useEnhancedAgeStyle } from '@/hooks/useEnhancedAgeStyle';
import TapImageCard from './TapImageCard';
import TapImageReward from './TapImageReward';
import TapImageProgress from './TapImageProgress';
import TapImageMascot from './TapImageMascot';
import TapImageHint from './TapImageHint';
import TapImageCelebration from './TapImageCelebration';
import TapImageTutorial from './TapImageTutorial';
import { TapImageProps, TapImageMode, GameState, TapImageItem } from './types';

const TapImage: React.FC<TapImageProps> = ({
  mode = 'simple',
  imageUrl,
  images: imagesProp,
  targetCount = 5,
  sequence,
  correctAnswer,
  memoryTime = 3000,
  caption,
  prompt,
  size = 'large',
  showProgress = true,
  showStars = true,
  level = 1,
  showMascot = true,
  showHints = true,
  hintDelay = 5000,
  showTutorial: showTutorialProp = true,
  enableVoice: enableVoiceInitial = false,
  voiceLanguage = 'uk-UA',
  speakPrompt: speakPromptProp,
  speakFeedback: speakFeedbackProp,
  ageGroup,
  ageStyle: ageStyleProp,
  isSelected = false,
  onEdit,
  onFocus,
  onComplete,
  onLevelUp,
  onCorrectTap,
  onWrongTap,
  onProgress,
}) => {
  const enhancedStyle = useEnhancedAgeStyle(ageStyleProp || 'toddler', ageGroup);
  const { baseStyle, feedbackPattern, colorPsychology, motivationSystem } = enhancedStyle;

  // Convert legacy imageUrl to images array
  const images: TapImageItem[] = imagesProp || (imageUrl ? [{
    id: '1',
    url: imageUrl,
    label: caption || '',
  }] : []);

  // Size mapping
  const getSizeValue = () => {
    const sizes = {
      small: baseStyle.sizes.element * 1.2,
      medium: baseStyle.sizes.element * 1.5,
      large: baseStyle.sizes.element * 1.8,
    };
    return sizes[size];
  };

  const imageSize = getSizeValue();

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    mode,
    currentProgress: 0,
    targetProgress: mode === 'simple' ? targetCount : images.length,
    stars: 0,
    targetStars: targetCount,
    sequenceProgress: [],
    isCompleted: false,
    wrongAttempts: 0,
  });

  const [showHint, setShowHint] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [mascotEmotion, setMascotEmotion] = useState<'idle' | 'happy' | 'encouraging' | 'celebrating'>('idle');
  const [mascotMessage, setMascotMessage] = useState('');
  const [correctImageId, setCorrectImageId] = useState<string | null>(null);
  const [memoryImageId, setMemoryImageId] = useState<string | null>(null);
  const [showMemoryImage, setShowMemoryImage] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(enableVoiceInitial);

  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);

  // Voice helper function with debounce and cleanup
  const speak = useCallback(async (text: string, forceSpeak: boolean = false) => {
    // Check if voice is enabled (or forced for confirmation)
    if (!forceSpeak && !voiceEnabled) return;
    if (!isSpeechSupported()) return;
    
    // Debounce: don't speak if last speech was less than 500ms ago
    const now = Date.now();
    if (!forceSpeak && now - lastSpeakTimeRef.current < 500) {
      return;
    }
    
    // Stop any ongoing speech before starting new one
    if (isSpeakingRef.current) {
      stopSpeaking();
    }
    
    try {
      isSpeakingRef.current = true;
      lastSpeakTimeRef.current = now;
      
      // Remove emojis from text before speaking
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
      
      // Map age style to supported voice styles
      const voiceAgeStyle: 'toddler' | 'preschool' | 'elementary' = 
        ageStyleProp === 'preschool' ? 'preschool' :
        ageStyleProp === 'elementary' ? 'elementary' :
        'toddler'; // Default for toddler, middle, teen
      
      await speakForAge(textWithoutEmojis, voiceAgeStyle, voiceLanguage);
      
      isSpeakingRef.current = false;
    } catch (error) {
      console.warn('[TapImage] Voice error:', error);
      isSpeakingRef.current = false;
    }
  }, [voiceEnabled, voiceLanguage, ageStyleProp]);

  // Prompt speaking disabled - only feedback is voiced
  // useEffect(() => {
  //   if (prompt && speakPromptProp !== false && voiceEnabled) {
  //     const timer = setTimeout(() => {
  //       speak(prompt);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [prompt, speakPromptProp, voiceEnabled, speak]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      isSpeakingRef.current = false;
    };
  }, []);

  // Stop speaking when voice is disabled
  useEffect(() => {
    if (!voiceEnabled && isSpeakingRef.current) {
      stopSpeaking();
      isSpeakingRef.current = false;
    }
  }, [voiceEnabled]);

  // Show tutorial on first load (only in play mode, not in editor)
  useEffect(() => {
    if (showTutorialProp && !isSelected && !tutorialCompleted && images.length > 0) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTutorialProp, isSelected, tutorialCompleted, images.length]);

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setTutorialCompleted(true);
  }, []);

  // Initialize game based on mode
  useEffect(() => {
    if (mode === 'memory' && images.length > 0) {
      // Pick random image to remember
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setMemoryImageId(randomImage.id);
      setShowMemoryImage(true);

      // Memory mode instructions speaking disabled - only feedback is voiced
      // if (speakPromptProp !== false && voiceEnabled) {
      //   setTimeout(() => {
      //     speak('Запам\'ятай цю картинку!');
      //   }, 500);
      // }

      // Hide after memoryTime
      setTimeout(() => {
        setShowMemoryImage(false);
        
        // Memory mode instructions speaking disabled - only feedback is voiced
        // if (speakPromptProp !== false && voiceEnabled) {
        //   setTimeout(() => {
        //     speak('Знайди картинку, яку ти запам\'ятав!');
        //   }, 300);
        // }
      }, memoryTime);
    }
  }, [mode, images, memoryTime, speakPromptProp, voiceEnabled, speak]);

  // Start hint timer on inactivity
  const startHintTimer = useCallback(() => {
    if (!showHints || gameState.isCompleted) return;

    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    hintTimerRef.current = setTimeout(() => {
      setShowHint(true);
      setMascotEmotion('encouraging');
      const hintMessage = enhancedStyle.getEncouragementMessage() || 'Спробуй тапнути!';
      setMascotMessage(hintMessage);
      
      // Hint speaking disabled - only feedback is voiced
      // if (speakFeedbackProp !== false && voiceEnabled) {
      //   speak(hintMessage);
      // }
    }, hintDelay);
  }, [showHints, gameState.isCompleted, hintDelay, enhancedStyle, speakFeedbackProp, voiceEnabled, speak]);

  // Start hint timer only once on mount
  useEffect(() => {
    // Only start if hints are enabled and game not completed
    if (showHints && !gameState.isCompleted) {
      startHintTimer();
    }
    
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Run only once on mount

  // Handle simple mode tap
  const handleSimpleTap = useCallback(async () => {
    const newStars = gameState.stars + 1;
    const isComplete = newStars >= targetCount;

    setGameState(prev => ({
      ...prev,
      stars: newStars,
      currentProgress: newStars,
      isCompleted: isComplete,
    }));

    // Feedback
    hapticService.lightTap();

    // Update mascot
    if (isComplete) {
      const message = 'Молодець! Ти зібрав усі зірки!';
      setMascotEmotion('celebrating');
      setMascotMessage(message + ' 🎉');
      setCelebrationMessage('Чудова робота!');
      setShowCelebration(true);
      
      if (speakFeedbackProp !== false) {
        speak(message);
      }
      
      onComplete?.();
    } else {
      const message = enhancedStyle.getEncouragementMessage() || 'Супер! Продовжуй!';
      setMascotEmotion('happy');
      setMascotMessage(message);
      
      if (speakFeedbackProp !== false && newStars % 2 === 0) {
        // Speak every 2nd star to not overwhelm
        speak(message);
      }
      
      setTimeout(() => setMascotEmotion('idle'), 2000);
    }

    onProgress?.(newStars);
    startHintTimer();
  }, [gameState.stars, targetCount, enhancedStyle, onComplete, onProgress, startHintTimer, speakFeedbackProp, voiceEnabled, speak]);

  // Handle find mode tap
  const handleFindTap = useCallback(async (imageId: string) => {
    const isCorrect = imageId === correctAnswer;

    if (isCorrect) {
      setCorrectImageId(imageId);
      setGameState(prev => ({
        ...prev,
        stars: prev.stars + 1,
        currentProgress: prev.currentProgress + 1,
        isCompleted: true,
      }));

      hapticService.lightTap();

      const successMessage = 'Правильно! Ти знайшов!';
      setMascotEmotion('celebrating');
      setMascotMessage(successMessage + ' 🎉');
      setCelebrationMessage('Молодець!');
      setShowCelebration(true);

      if (speakFeedbackProp !== false) {
        speak(successMessage);
      }

      onCorrectTap?.(imageId);
      onComplete?.();
    } else {
      setGameState(prev => ({
        ...prev,
        wrongAttempts: prev.wrongAttempts + 1,
      }));

      const errorMessage = 'Спробуй ще раз! Ти можеш!';
      setMascotEmotion('encouraging');
      setMascotMessage(errorMessage + ' 💪');
      
      if (speakFeedbackProp !== false) {
        speak(errorMessage);
      }
      
      setTimeout(() => setMascotEmotion('idle'), 2000);

      onWrongTap?.(imageId);
    }

    startHintTimer();
  }, [correctAnswer, onCorrectTap, onWrongTap, onComplete, startHintTimer, speakFeedbackProp, voiceEnabled, speak]);

  // Handle sequence mode tap
  const handleSequenceTap = useCallback(async (imageId: string) => {
    if (!sequence) return;

    const expectedNextId = sequence[gameState.sequenceProgress.length];
    const isCorrect = imageId === expectedNextId;

    if (isCorrect) {
      const newSequenceProgress = [...gameState.sequenceProgress, imageId];
      const isComplete = newSequenceProgress.length === sequence.length;

      setGameState(prev => ({
        ...prev,
        sequenceProgress: newSequenceProgress,
        currentProgress: newSequenceProgress.length,
        stars: isComplete ? prev.stars + 1 : prev.stars,
        isCompleted: isComplete,
      }));

      hapticService.lightTap();

      if (isComplete) {
        const successMessage = 'Ура! Ти зробив усе правильно!';
        setMascotEmotion('celebrating');
        setMascotMessage(successMessage + ' 🌟');
        setCelebrationMessage('Чудова послідовність!');
        setShowCelebration(true);
        
        if (speakFeedbackProp !== false) {
          speak(successMessage);
        }
        
        onComplete?.();
      } else {
        const continueMessage = 'Добре! Тепни наступну!';
        setMascotEmotion('happy');
        setMascotMessage(continueMessage + ' 👍');
        
        if (speakFeedbackProp !== false) {
          speak(continueMessage);
        }
        
        setTimeout(() => setMascotEmotion('idle'), 1500);
      }

      onProgress?.(newSequenceProgress.length);
      onCorrectTap?.(imageId);
    } else {
      const resetMessage = 'Ой! Спробуй знову з початку!';
      setMascotEmotion('encouraging');
      setMascotMessage(resetMessage + ' 🔄');
      
      if (speakFeedbackProp !== false) {
        speak(resetMessage);
      }
      
      // Reset sequence
      setGameState(prev => ({
        ...prev,
        sequenceProgress: [],
        currentProgress: 0,
        wrongAttempts: prev.wrongAttempts + 1,
      }));

      onWrongTap?.(imageId);
      setTimeout(() => setMascotEmotion('idle'), 2000);
    }

    startHintTimer();
  }, [sequence, gameState.sequenceProgress, onComplete, onProgress, onCorrectTap, onWrongTap, startHintTimer, speakFeedbackProp, voiceEnabled, speak]);

  // Handle memory mode tap
  const handleMemoryTap = useCallback(async (imageId: string) => {
    if (!memoryImageId) return;

    const isCorrect = imageId === memoryImageId;

    if (isCorrect) {
      setCorrectImageId(imageId);
      setGameState(prev => ({
        ...prev,
        stars: prev.stars + 1,
        currentProgress: prev.currentProgress + 1,
        isCompleted: true,
      }));

      hapticService.lightTap();

      const memoryMessage = 'Чудова пам\'ять! Ти запам\'ятав!';
      setMascotEmotion('celebrating');
      setMascotMessage(memoryMessage + ' 🧠');
      setCelebrationMessage('Супер пам\'ять!');
      setShowCelebration(true);

      if (speakFeedbackProp !== false) {
        speak(memoryMessage);
      }

      onCorrectTap?.(imageId);
      onComplete?.();
    } else {
      setGameState(prev => ({
        ...prev,
        wrongAttempts: prev.wrongAttempts + 1,
      }));

      const retryMessage = 'Спробуй ще раз!';
      setMascotEmotion('encouraging');
      setMascotMessage(retryMessage + ' 🤔');
      
      if (speakFeedbackProp !== false) {
        speak(retryMessage);
      }
      
      setTimeout(() => setMascotEmotion('idle'), 2000);

      onWrongTap?.(imageId);
    }

    startHintTimer();
  }, [memoryImageId, onCorrectTap, onWrongTap, onComplete, startHintTimer, speakFeedbackProp, voiceEnabled, speak]);

  // Main tap handler
  const handleTap = useCallback((imageId: string) => {
    setShowHint(false);

    switch (mode) {
      case 'simple':
        handleSimpleTap();
        break;
      case 'find':
        handleFindTap(imageId);
        break;
      case 'sequence':
        handleSequenceTap(imageId);
        break;
      case 'memory':
        if (!showMemoryImage) {
          handleMemoryTap(imageId);
        }
        break;
    }
  }, [mode, handleSimpleTap, handleFindTap, handleSequenceTap, handleMemoryTap, showMemoryImage]);

  // Render images based on mode
  const renderImages = () => {
    if (mode === 'simple' && images.length > 0) {
      // Single image for simple mode
      const image = images[0];
      return (
        <Box sx={{ position: 'relative' }}>
          <TapImageCard
            image={image}
            size={imageSize}
            isActive={!gameState.isCompleted}
            showPulse={!gameState.isCompleted}
            ageStyle={ageStyleProp || 'toddler'}
            onTap={() => handleTap(image.id)}
          />
          {showHint && <TapImageHint show type="hand" />}
        </Box>
      );
    }

    if (mode === 'find') {
      // Multiple images for find mode
      return (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: images.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            // 🎯 Enhanced spacing for better breathing room
            gap: baseStyle.sizes.gap * 2,
            padding: baseStyle.sizes.padding * 1.5,
            justifyItems: 'center',
          }}
        >
          {images.map((image, index) => (
            <Box key={image.id} sx={{ position: 'relative' }}>
              <TapImageCard
                image={image}
                size={imageSize * 0.85}
                isCorrect={correctImageId === image.id}
                isActive={!gameState.isCompleted}
                showGlow={showHint && image.id === correctAnswer}
                ageStyle={ageStyleProp || 'toddler'}
                onTap={handleTap}
              />
              {showHint && image.id === correctAnswer && (
                <TapImageHint show type="glow" />
              )}
            </Box>
          ))}
        </Box>
      );
    }

    if (mode === 'sequence' && sequence) {
      // Images with sequence numbers
      return (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: images.length <= 3 ? `repeat(${images.length}, 1fr)` : 'repeat(2, 1fr)',
            // 🎯 Enhanced spacing for better breathing room
            gap: baseStyle.sizes.gap * 2,
            padding: baseStyle.sizes.padding * 1.5,
            justifyItems: 'center',
          }}
        >
          {images.map((image, index) => {
            const sequenceIndex = sequence.indexOf(image.id);
            const isCompleted = gameState.sequenceProgress.includes(image.id);
            const isNext = sequence[gameState.sequenceProgress.length] === image.id;

            return (
              <Box key={image.id} sx={{ position: 'relative' }}>
                <TapImageCard
                  image={image}
                  size={imageSize * 0.8}
                  sequenceNumber={sequenceIndex + 1}
                  isCompleted={isCompleted}
                  isActive={!gameState.isCompleted}
                  showGlow={showHint && isNext}
                  showPulse={isNext}
                  ageStyle={ageStyleProp || 'toddler'}
                  onTap={handleTap}
                />
                {showHint && isNext && <TapImageHint show type="arrow" />}
              </Box>
            );
          })}
        </Box>
      );
    }

    if (mode === 'memory') {
      if (showMemoryImage && memoryImageId) {
        // Show the image to remember
        const imageToShow = images.find(img => img.id === memoryImageId);
        if (imageToShow) {
          return (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: baseStyle.typography.fontSize * 1.2,
                  fontWeight: 700,
                  color: colorPsychology.primary,
                  mb: baseStyle.sizes.gap / 2,
                }}
              >
                Запам'ятай цю картинку!
              </Typography>
              <TapImageCard
                image={imageToShow}
                size={imageSize}
                isActive={false}
                disabled
                ageStyle={ageStyleProp || 'toddler'}
                onTap={() => {}}
              />
            </Box>
          );
        }
      }

      // Show all images to choose from
      return (
        <Box>
          <Typography
            sx={{
              fontSize: baseStyle.typography.fontSize * 1.1,
              fontWeight: 700,
              color: colorPsychology.primary,
              mb: baseStyle.sizes.gap,
              textAlign: 'center',
            }}
          >
            Знайди картинку, яку ти запам'ятав!
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              // 🎯 Enhanced spacing for better breathing room
              gap: baseStyle.sizes.gap * 2,
              padding: baseStyle.sizes.padding * 1.5,
              justifyItems: 'center',
            }}
          >
            {images.map((image) => (
              <Box key={image.id} sx={{ position: 'relative' }}>
                <TapImageCard
                  image={image}
                  size={imageSize * 0.8}
                  isCorrect={correctImageId === image.id}
                  isActive={!gameState.isCompleted}
                  ageStyle={ageStyleProp || 'toddler'}
                  onTap={handleTap}
                />
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    return null;
  };

  // 🎨 Playful gradient backgrounds
  const playfulGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Sunset
  ];
  
  const randomGradient = playfulGradients[Math.floor(Math.random() * playfulGradients.length)];

  return (
    <Box
      component={motion.div}
      initial={false}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1000,
        mx: 'auto',
        gap: baseStyle.sizes.gap * 0.5, // Компактніше
        p: baseStyle.sizes.padding * 1.5, // Менше padding
        borderRadius: `${baseStyle.borders.radius * 3}px`,
        // 🌈 Playful gradient background
        background: isSelected
          ? `linear-gradient(135deg, ${alpha(colorPsychology.primary, 0.15)}, ${alpha(colorPsychology.secondary, 0.15)})`
          : ageStyleProp === 'toddler'
          ? 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)'
          : `linear-gradient(135deg, 
              ${alpha('#FFF5F7', 0.8)} 0%, 
              ${alpha('#E0F2FE', 0.8)} 50%, 
              ${alpha('#F0FDF4', 0.8)} 100%)`,
        border: isSelected
          ? `6px solid ${colorPsychology.primary}`
          : '6px solid white',
        boxShadow: isSelected
          ? `0 16px 48px ${alpha(colorPsychology.primary, 0.3)}, 0 0 0 8px ${alpha(colorPsychology.primary, 0.1)}`
          : '0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
        transition: `all ${baseStyle.animations.duration}ms ${baseStyle.animations.easing}`,
        overflow: 'hidden', // ← КЛЮЧОВЕ: обмежуємо ambient particles межами компонента
        // Dotted playful pattern
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: `${baseStyle.borders.radius * 3}px`,
          background: `radial-gradient(circle at 20% 50%, ${alpha('#FFE4E6', 0.6)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 50%, ${alpha('#DBEAFE', 0.6)} 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
      onClick={onFocus}
    >
      {/* Audio toggle button (play mode only) */}
      {!isSelected && (
        <Box sx={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: isSpeechSupported() ? 1.1 : 1 }}
            whileTap={{ scale: isSpeechSupported() ? 0.9 : 1 }}
            onClick={(e) => {
              e.stopPropagation();
              
              // Check if speech is supported
              if (!isSpeechSupported()) {
                return;
              }
              
              const newVoiceState = !voiceEnabled;
              setVoiceEnabled(newVoiceState);
              
              if (!newVoiceState) {
                // Stop any ongoing speech when disabling
                stopSpeaking();
              }
            }}
            style={{
              position: 'absolute',
              top: baseStyle.sizes.padding,
              right: baseStyle.sizes.padding,
              width: baseStyle.sizes.icon * 1.5,
              height: baseStyle.sizes.icon * 1.5,
              borderRadius: '50%',
              border: `${baseStyle.borders.width}px solid ${
                isSpeechSupported() ? colorPsychology.primary : '#9CA3AF'
              }`,
              background: !isSpeechSupported()
                ? 'rgba(156, 163, 175, 0.3)'
                : voiceEnabled 
                  ? `linear-gradient(135deg, ${colorPsychology.primary}, ${colorPsychology.secondary})` 
                  : 'rgba(255, 255, 255, 0.9)',
              cursor: isSpeechSupported() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: baseStyle.typography.fontSize * 1.2,
              boxShadow: `0 4px 12px ${alpha(
                isSpeechSupported() ? colorPsychology.primary : '#9CA3AF', 
                0.3
              )}`,
              zIndex: 10,
              transition: `all ${baseStyle.animations.duration}ms ${baseStyle.animations.easing}`,
              opacity: isSpeechSupported() ? 1 : 0.5,
            }}
            title={
              !isSpeechSupported() 
                ? 'Озвучка недоступна (потрібен HTTPS або localhost)' 
                : voiceEnabled 
                  ? 'Вимкнути озвучку' 
                  : 'Увімкнути озвучку'
            }
          >
            <motion.span
              animate={{
                scale: voiceEnabled && isSpeechSupported() ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: voiceEnabled && isSpeechSupported() ? Infinity : 0,
                repeatDelay: 1,
              }}
            >
              {!isSpeechSupported() ? '🚫' : voiceEnabled ? '🔊' : '🔇'}
            </motion.span>
          </motion.button>
        </Box>
      )}

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

      {/* Mascot */}
      {showMascot && (
        <TapImageMascot
          emotion={mascotEmotion}
          message={mascotMessage}
          animate
          ageStyle={ageStyleProp || 'toddler'}
        />
      )}

      {/* Prompt */}
      {prompt && (
        <Typography
          sx={{
            fontSize: baseStyle.typography.fontSize * 1.2,
            fontWeight: 700,
            color: colorPsychology.primary,
            textAlign: 'center',
            mb: baseStyle.sizes.gap / 2,
          }}
        >
          {prompt}
        </Typography>
      )}

      {/* Stars (for simple mode) */}
      {showStars && mode === 'simple' && (
        <TapImageReward
          stars={gameState.stars}
          maxStars={gameState.targetStars}
          animate
          ageStyle={ageStyleProp || 'toddler'}
        />
      )}

      {/* Images */}
      {renderImages()}

      {/* Progress bar */}
      {showProgress && mode !== 'simple' && (
        <TapImageProgress
          current={gameState.currentProgress}
          total={gameState.targetProgress}
          showLabel
          ageStyle={ageStyleProp || 'toddler'}
        />
      )}

      {/* Celebration overlay */}
      <TapImageCelebration
        show={showCelebration}
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)}
        ageStyle={ageStyleProp || 'toddler'}
      />

      {/* Tutorial overlay */}
      <TapImageTutorial
        mode={mode}
        show={showTutorial}
        onComplete={handleTutorialComplete}
        enableVoice={voiceEnabled}
        voiceLanguage={voiceLanguage}
        ageStyle={ageStyleProp || 'toddler'}
      />

      {/* Edit mode indicator */}
      {isSelected && (
        <Typography
          variant="caption"
          sx={{
            fontSize: baseStyle.typography.fontSize * 0.7,
            color: colorPsychology.primary,
            fontWeight: baseStyle.typography.fontWeight,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 1,
          }}
        >
          ⚡ Interactive TapImage ({mode} mode)
        </Typography>
      )}
    </Box>
  );
};

export default TapImage;
