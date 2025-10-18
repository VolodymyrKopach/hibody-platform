'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface CausePair {
  id: string;
  cause: {
    imageUrl?: string;
    emoji?: string;
    text: string;
  };
  effect: {
    imageUrl?: string;
    emoji?: string;
    text: string;
  };
}

interface CauseEffectGameProps {
  pairs: CausePair[];
  showText?: boolean;
  voiceEnabled?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const CauseEffectGame: React.FC<CauseEffectGameProps> = ({
  pairs = [],
  showText = true,
  voiceEnabled = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentPair = pairs[currentPairIndex];
  
  // Shuffle effects for current question
  const [effectOptions] = useState(() => {
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    return shuffled.map(p => p.effect);
  });

  // Auto-play cause description
  React.useEffect(() => {
    if (currentPair && voiceEnabled && !isCompleted) {
      const timer = setTimeout(() => {
        soundService.speak(`What happens when ${currentPair.cause.text}?`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPairIndex, voiceEnabled, currentPair, isCompleted]);

  const handleEffectClick = (effectId: string) => {
    if (selectedEffect || isCompleted) return;

    setSelectedEffect(effectId);
    triggerHaptic('light');

    const selectedPair = pairs.find(p => p.effect === effectOptions.find(e => {
      const pairEffect = pairs.find(pair => pair.id === effectId);
      return pairEffect?.effect === e;
    }));

    const isCorrect = effectId === currentPair.id;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      soundService.playCorrect();
      triggerHaptic('success');

      if (voiceEnabled) {
        soundService.speak(`Yes! ${currentPair.cause.text} causes ${currentPair.effect.text}!`);
      }

      // Mini confetti
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });

      // Move to next pair or complete
      setTimeout(() => {
        if (currentPairIndex < pairs.length - 1) {
          setCurrentPairIndex(prev => prev + 1);
          setSelectedEffect(null);
        } else {
          // All pairs matched!
          setIsCompleted(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
        }
      }, 2500);
    } else {
      soundService.playError();
      triggerHaptic('error');

      // Reset selection after delay
      setTimeout(() => {
        setSelectedEffect(null);
      }, 1500);
    }
  };

  const handleReset = () => {
    setCurrentPairIndex(0);
    setSelectedEffect(null);
    setCorrectCount(0);
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const renderItem = (item: { imageUrl?: string; emoji?: string; text: string }, type: 'cause' | 'effect') => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Image or Emoji */}
        <Box
          sx={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            backgroundColor: type === 'cause' ? 'primary.50' : 'success.50',
            border: '3px solid',
            borderColor: type === 'cause' ? 'primary.main' : 'success.main',
          }}
        >
          {item.emoji ? (
            <Typography sx={{ fontSize: '72px' }}>
              {item.emoji}
            </Typography>
          ) : item.imageUrl ? (
            <Box
              component="img"
              src={item.imageUrl}
              alt={item.text}
              sx={{
                width: '90%',
                height: '90%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography variant="h4" fontWeight={700}>
              ?
            </Typography>
          )}
        </Box>

        {/* Text */}
        {showText && (
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              textAlign: 'center',
              maxWidth: 120,
            }}
          >
            {item.text}
          </Typography>
        )}
      </Box>
    );
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
            {isCompleted ? '🎯 All Matched!' : 'Cause and Effect'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? `You matched ${correctCount} out of ${pairs.length} pairs!` 
              : `Pair ${currentPairIndex + 1} of ${pairs.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Current cause display */}
      {!isCompleted && currentPair && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            What happens because of this?
          </Typography>
          
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mx: 'auto',
              mb: 4,
              maxWidth: 200,
              borderRadius: 3,
              border: '4px solid',
              borderColor: 'primary.main',
              backgroundColor: 'white',
            }}
          >
            {renderItem(currentPair.cause, 'cause')}
          </Paper>

          {/* Arrow indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <motion.div
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ArrowRight size={48} color="#3B82F6" />
            </motion.div>
          </Box>

          {/* Effect options */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Choose what happens:
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
            {pairs.map((pair) => {
              const isSelectedEffect = selectedEffect === pair.id;
              const isCorrect = isSelectedEffect && pair.id === currentPair.id;
              const isWrong = isSelectedEffect && pair.id !== currentPair.id;

              return (
                <motion.div
                  key={pair.id}
                  whileHover={{ scale: isSelectedEffect ? 1 : 1.05 }}
                  whileTap={{ scale: isSelectedEffect ? 1 : 0.95 }}
                  onClick={() => handleEffectClick(pair.id)}
                  style={{
                    cursor: isSelectedEffect ? 'default' : 'pointer',
                  }}
                >
                  <Paper
                    elevation={isSelectedEffect ? 8 : 4}
                    sx={{
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
                    {renderItem(pair.effect, 'effect')}

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
          {pairs.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: index < currentPairIndex 
                  ? 'success.main' 
                  : index === currentPairIndex 
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
                Brilliant! 🎯
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You understand cause and effect!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && !selectedEffect && (
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
            💡 Think about what happens next!
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default CauseEffectGame;

