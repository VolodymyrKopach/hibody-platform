'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Volume2, PlayCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface SoundItem {
  id: string;
  imageUrl: string;
  soundText: string; // Text to speak or sound description
  soundUrl?: string; // Optional audio file URL
  label?: string;
}

interface SoundMatcherProps {
  items: SoundItem[];
  mode?: 'identify' | 'match';
  autoPlayFirst?: boolean;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const SoundMatcher: React.FC<SoundMatcherProps> = ({
  items = [],
  mode = 'identify',
  autoPlayFirst = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const currentItem = items[currentItemIndex];

  // Auto-play sound when item changes
  React.useEffect(() => {
    if (currentItem && autoPlayFirst && !isCompleted) {
      const timer = setTimeout(() => {
        playSound(currentItem);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, currentItem, autoPlayFirst, isCompleted]);

  const playSound = (item: SoundItem) => {
    setPlayingSound(item.id);
    
    if (item.soundUrl) {
      // Play audio file (if provided)
      const audio = new Audio(item.soundUrl);
      audio.play();
      audio.onended = () => setPlayingSound(null);
    } else {
      // Use text-to-speech
      soundService.speak(item.soundText);
      setTimeout(() => setPlayingSound(null), 2000);
    }
    
    triggerHaptic('light');
  };

  const handleItemClick = (itemId: string) => {
    if (selectedItem || isCompleted) return;

    setSelectedItem(itemId);
    triggerHaptic('light');

    const isCorrect = itemId === currentItem.id;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      soundService.playCorrect();
      triggerHaptic('success');

      // Play the sound again as confirmation
      const item = items.find(i => i.id === itemId);
      if (item) {
        setTimeout(() => playSound(item), 500);
      }

      // Mini confetti
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });

      // Move to next item or complete
      setTimeout(() => {
        if (currentItemIndex < items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
          setSelectedItem(null);
        } else {
          // All sounds matched!
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
        setSelectedItem(null);
      }, 1500);
    }
  };

  const handleReset = () => {
    setCurrentItemIndex(0);
    setSelectedItem(null);
    setCorrectCount(0);
    setIsCompleted(false);
    setPlayingSound(null);
    triggerHaptic('light');
  };

  const handlePlayCurrentSound = () => {
    if (currentItem) {
      playSound(currentItem);
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
            {isCompleted ? '🎵 All Sounds Matched!' : 'Listen and Find!'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? `You matched ${correctCount} out of ${items.length} sounds!` 
              : `Sound ${currentItemIndex + 1} of ${items.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Sound player */}
      {!isCompleted && currentItem && (
        <Paper
          elevation={4}
          sx={{
            width: 280,
            height: 180,
            mx: 'auto',
            mb: 4,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.50',
            border: '4px solid',
            borderColor: 'primary.main',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={handlePlayCurrentSound}
        >
          {/* Play icon */}
          <motion.div
            animate={playingSound === currentItem.id ? {
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            } : {}}
            transition={{
              duration: 1,
              repeat: playingSound === currentItem.id ? Infinity : 0,
            }}
          >
            <Volume2 size={80} color="#3B82F6" />
          </motion.div>

          <Typography variant="h6" fontWeight={700} sx={{ mt: 2, color: 'primary.main' }}>
            🎧 Listen to the sound
          </Typography>

          {/* Play button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePlayCurrentSound();
            }}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <PlayCircle size={32} />
          </IconButton>
        </Paper>
      )}

      {/* Item options */}
      {!isCompleted && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Which one makes this sound?
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
            {items.map((item) => {
              const isSelectedItem = selectedItem === item.id;
              const isCorrect = isSelectedItem && item.id === currentItem.id;
              const isWrong = isSelectedItem && item.id !== currentItem.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: isSelectedItem ? 1 : 1.05 }}
                  whileTap={{ scale: isSelectedItem ? 1 : 0.95 }}
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    cursor: isSelectedItem ? 'default' : 'pointer',
                  }}
                >
                  <Paper
                    elevation={isSelectedItem ? 8 : 4}
                    sx={{
                      width: 160,
                      height: 160,
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
                    {/* Image */}
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.label}
                      sx={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                      }}
                    />

                    {/* Label */}
                    {item.label && (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          mt: 1,
                          textAlign: 'center',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.label}
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

                    {/* Play button for each item */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound(item);
                      }}
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      }}
                    >
                      <Volume2 size={16} />
                    </IconButton>
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
          {items.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: index < currentItemIndex 
                  ? 'success.main' 
                  : index === currentItemIndex 
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
                Amazing Ears! 🎵
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You matched all the sounds!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && !selectedItem && (
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
            💡 Click the speaker to hear the sound again
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SoundMatcher;

