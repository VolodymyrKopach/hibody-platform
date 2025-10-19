'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, Lightbulb, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface WordBuilderProps {
  targetWord: string;
  shuffledLetters?: string[];
  showHints?: boolean;
  mode?: 'drag-drop' | 'buttons' | 'keyboard';
  imageHint?: string;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const WordBuilder: React.FC<WordBuilderProps> = ({
  targetWord = '',
  shuffledLetters,
  showHints = true,
  mode = 'buttons',
  imageHint,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);

  // Initialize letters
  useEffect(() => {
    if (targetWord) {
      const letters = shuffledLetters || targetWord.toUpperCase().split('');
      // Shuffle letters
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setAvailableLetters(shuffled);
      setCurrentWord([]);
      setIsCorrect(false);
    }
  }, [targetWord, shuffledLetters]);

  // Check if word is correct
  useEffect(() => {
    if (currentWord.length === targetWord.length) {
      const builtWord = currentWord.join('');
      const isMatch = builtWord.toUpperCase() === targetWord.toUpperCase();
      
      if (isMatch) {
        setIsCorrect(true);
        soundService.playSuccess();
        triggerHaptic('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setShakeWrong(true);
        soundService.playError();
        triggerHaptic('error');
        setAttempts(prev => prev + 1);
        setTimeout(() => {
          setShakeWrong(false);
          // Auto-reset incorrect word after a delay
          setTimeout(() => {
            resetWord();
          }, 1000);
        }, 600);
      }
    }
  }, [currentWord, targetWord]);

  const addLetter = (letter: string, index: number) => {
    setCurrentWord([...currentWord, letter]);
    setAvailableLetters(prev => prev.filter((_, i) => i !== index));
    triggerHaptic('light');
    soundService.play('tap');
  };

  const removeLetter = (index: number) => {
    const letter = currentWord[index];
    setCurrentWord(prev => prev.filter((_, i) => i !== index));
    setAvailableLetters(prev => [...prev, letter]);
    triggerHaptic('light');
    soundService.play('tap');
  };

  const resetWord = () => {
    const letters = shuffledLetters || targetWord.toUpperCase().split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setCurrentWord([]);
    setIsCorrect(false);
    setShowHint(false);
    triggerHaptic('light');
  };

  const handleHint = () => {
    setShowHint(!showHint);
    triggerHaptic('light');
    soundService.play('tap');
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(targetWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
      triggerHaptic('light');
    }
  };

  if (!targetWord) {
    return (
      <Box
        onClick={onFocus}
        sx={{
          p: 4,
          textAlign: 'center',
          border: isSelected ? '2px solid' : '2px dashed',
          borderColor: isSelected ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          backgroundColor: 'grey.50',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Add a target word to get started!
        </Typography>
      </Box>
    );
  }

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
            Build the Word
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCorrect ? '✓ Correct!' : `Attempts: ${attempts}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {showHints && (
            <IconButton onClick={handleHint} color="warning" size="large">
              <Lightbulb size={24} />
            </IconButton>
          )}
          <IconButton onClick={handleSpeak} color="info" size="large">
            <Volume2 size={24} />
          </IconButton>
          <IconButton onClick={resetWord} color="primary" size="large">
            <RotateCcw size={24} />
          </IconButton>
        </Box>
      </Box>

      {/* Image hint */}
      {imageHint && (
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: 200,
              height: 200,
              borderRadius: 3,
              overflow: 'hidden',
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            <Box
              component="img"
              src={imageHint}
              alt="Word hint"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Text hint */}
      <AnimatePresence>
        {showHint && showHints && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Paper
              elevation={2}
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: 'warning.light',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" textAlign="center" fontWeight={600}>
                💡 First letter is: <strong>{targetWord[0].toUpperCase()}</strong>
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current word area */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
          Your word:
        </Typography>
        <motion.div
          animate={shakeWrong ? {
            x: [-10, 10, -10, 10, 0],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={4}
            sx={{
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 2,
              borderRadius: 3,
              border: '3px solid',
              borderColor: isCorrect ? 'success.main' : shakeWrong ? 'error.main' : 'primary.main',
              backgroundColor: isCorrect ? alpha('#4CAF50', 0.1) : 'white',
              flexWrap: 'wrap',
            }}
          >
            {currentWord.length === 0 ? (
              <Typography variant="h6" color="text.secondary">
                Tap letters below...
              </Typography>
            ) : (
              currentWord.map((letter, index) => (
                <motion.div
                  key={`${letter}-${index}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Paper
                    elevation={6}
                    onClick={() => !isCorrect && removeLetter(index)}
                    sx={{
                      width: 70,
                      height: 70,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isCorrect ? 'default' : 'pointer',
                      borderRadius: 2,
                      backgroundColor: isCorrect ? 'success.main' : 'primary.main',
                      color: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: isCorrect ? 'none' : 'scale(1.1)',
                        backgroundColor: isCorrect ? 'success.main' : 'primary.dark',
                      },
                    }}
                  >
                    <Typography variant="h3" fontWeight={800}>
                      {letter}
                    </Typography>
                  </Paper>
                </motion.div>
              ))
            )}
          </Paper>
        </motion.div>
      </Box>

      {/* Available letters */}
      {!isCorrect && (
        <Box>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
            Available letters:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {availableLetters.map((letter, index) => (
              <motion.div
                key={`${letter}-${index}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Paper
                  elevation={4}
                  onClick={() => addLetter(letter, index)}
                  sx={{
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: 2,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                      boxShadow: 6,
                    },
                  }}
                >
                  <Typography variant="h3" fontWeight={800}>
                    {letter}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Success message */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <Sparkles size={32} fill="#FCD34D" color="#FCD34D" />
                  </motion.div>
                ))}
              </Box>
              <Typography variant="h3" fontWeight={800}>
                Perfect! 🎉
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                You spelled <strong>{targetWord.toUpperCase()}</strong> correctly!
              </Typography>
              <Button
                variant="contained"
                onClick={resetWord}
                sx={{
                  mt: 3,
                  backgroundColor: 'white',
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Try Again
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text */}
      {!isCorrect && attempts === 0 && (
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
            💡 Tap the letters to build the word. Tap letters in your word to remove them!
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default WordBuilder;

