'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface Emotion {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  description?: string;
}

interface EmotionRecognizerProps {
  emotions: Emotion[];
  mode?: 'match' | 'identify';
  showDescriptions?: boolean;
  voiceEnabled?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const EmotionRecognizer: React.FC<EmotionRecognizerProps> = ({
  emotions = [],
  mode = 'identify',
  showDescriptions = true,
  voiceEnabled = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentEmotion = emotions[currentEmotionIndex];
  const isMatchMode = mode === 'match';

  // Auto-play emotion name on change
  useEffect(() => {
    if (currentEmotion && voiceEnabled && !isCompleted && !isMatchMode) {
      const timer = setTimeout(() => {
        soundService.speak(`What emotion is this?`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentEmotionIndex, voiceEnabled, currentEmotion, isCompleted, isMatchMode]);

  const handleEmotionClick = (emotionId: string) => {
    if (selectedEmotion || isCompleted) return;

    setSelectedEmotion(emotionId);
    triggerHaptic('light');

    const isCorrect = emotionId === currentEmotion.id;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      soundService.playCorrect();
      triggerHaptic('success');

      if (voiceEnabled) {
        soundService.speak(`Yes! ${currentEmotion.name}!`);
      }

      // Mini confetti
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });

      // Move to next emotion or complete
      setTimeout(() => {
        if (currentEmotionIndex < emotions.length - 1) {
          setCurrentEmotionIndex(prev => prev + 1);
          setSelectedEmotion(null);
        } else {
          // All emotions recognized!
          setIsCompleted(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
        }
      }, 2000);
    } else {
      soundService.playError();
      triggerHaptic('error');

      // Reset selection after delay
      setTimeout(() => {
        setSelectedEmotion(null);
      }, 1500);
    }
  };

  const handleReset = () => {
    setCurrentEmotionIndex(0);
    setSelectedEmotion(null);
    setCorrectCount(0);
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const handlePlayVoice = () => {
    if (currentEmotion) {
      soundService.speak(currentEmotion.name);
      triggerHaptic('light');
    }
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 500,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            {isCompleted ? '🎉 All Emotions Found!' : 'How does this person feel?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? `You got ${correctCount} out of ${emotions.length} right!` 
              : `Emotion ${currentEmotionIndex + 1} of ${emotions.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Main emotion display */}
      {!isCompleted && currentEmotion && (
        <Paper
          elevation={4}
          sx={{
            width: 300,
            height: 300,
            mx: 'auto',
            mb: 4,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            border: '4px solid',
            borderColor: 'primary.main',
            position: 'relative',
          }}
        >
          {/* Emotion image or emoji */}
          {currentEmotion.imageUrl ? (
            <Box
              component="img"
              src={currentEmotion.imageUrl}
              alt={currentEmotion.name}
              sx={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography sx={{ fontSize: '180px', lineHeight: 1 }}>
              {currentEmotion.emoji}
            </Typography>
          )}

          {/* Voice button */}
          {voiceEnabled && (
            <IconButton
              onClick={handlePlayVoice}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <Volume2 size={24} />
            </IconButton>
          )}
        </Paper>
      )}

      {/* Emotion options */}
      {!isCompleted && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Choose the emotion:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            {emotions.map((emotion) => {
              const isSelected = selectedEmotion === emotion.id;
              const isCorrect = isSelected && emotion.id === currentEmotion.id;
              const isWrong = isSelected && emotion.id !== currentEmotion.id;

              return (
                <motion.div
                  key={emotion.id}
                  whileHover={{ scale: isSelected ? 1 : 1.05 }}
                  whileTap={{ scale: isSelected ? 1 : 0.95 }}
                  onClick={() => handleEmotionClick(emotion.id)}
                  style={{
                    cursor: isSelected ? 'default' : 'pointer',
                  }}
                >
                  <Paper
                    elevation={isSelected ? 8 : 4}
                    sx={{
                      width: 150,
                      height: 150,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      borderRadius: 3,
                      border: '3px solid',
                      borderColor: isCorrect 
                        ? 'success.main' 
                        : isWrong 
                        ? 'error.main' 
                        : 'grey.300',
                      backgroundColor: isCorrect 
                        ? 'success.50' 
                        : isWrong 
                        ? 'error.50' 
                        : 'white',
                      transition: 'all 0.3s',
                      position: 'relative',
                    }}
                  >
                    {/* Emoji */}
                    <Typography sx={{ fontSize: '72px', lineHeight: 1, mb: 1 }}>
                      {emotion.emoji}
                    </Typography>

                    {/* Label */}
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{
                        textAlign: 'center',
                        textTransform: 'capitalize',
                      }}
                    >
                      {emotion.name}
                    </Typography>

                    {/* Description (if enabled) */}
                    {showDescriptions && emotion.description && !isSelected && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          textAlign: 'center',
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        {emotion.description}
                      </Typography>
                    )}

                    {/* Success checkmark */}
                    {isCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ color: 'white', fontSize: '24px' }}>✓</Typography>
                        </Box>
                      </motion.div>
                    )}

                    {/* Error X */}
                    {isWrong && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ color: 'white', fontSize: '24px' }}>✗</Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Paper>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Progress indicator */}
      {!isCompleted && (
        <Box sx={{ mt: 4, display: 'flex', gap: 1, justifyContent: 'center' }}>
          {emotions.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: index < currentEmotionIndex 
                  ? 'success.main' 
                  : index === currentEmotionIndex 
                  ? 'primary.main' 
                  : 'grey.300',
              }}
            />
          ))}
        </Box>
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Sparkles size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Wonderful! 🎭
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You know all the emotions!
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                {emotions.slice(0, 5).map((emotion, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <Typography sx={{ fontSize: '32px' }}>{emotion.emoji}</Typography>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && !selectedEmotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            💡 Look at the face and choose how the person feels
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default EmotionRecognizer;

