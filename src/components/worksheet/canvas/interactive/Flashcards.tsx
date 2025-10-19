'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface FlashcardData {
  front: {
    text?: string;
    imageUrl?: string;
  };
  back: {
    text?: string;
    imageUrl?: string;
  };
}

interface FlashcardsProps {
  cards: FlashcardData[];
  cardSize?: 'small' | 'medium' | 'large';
  autoFlip?: boolean;
  showNavigation?: boolean;
  flipDirection?: 'horizontal' | 'vertical';
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({
  cards = [],
  cardSize = 'medium',
  autoFlip = false,
  showNavigation = true,
  flipDirection = 'horizontal',
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  // Size mapping based on age and preference
  const sizeMap = {
    small: { width: 300, height: 200 },
    medium: { width: 450, height: 300 },
    large: { width: 600, height: 400 },
  };

  const cardDimensions = sizeMap[cardSize];

  // Auto-flip functionality
  useEffect(() => {
    if (!autoFlip) return;

    const timer = setTimeout(() => {
      setIsFlipped(true);
      setTimeout(() => {
        setIsFlipped(false);
      }, 3000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, autoFlip]);

  // Check if all cards completed
  useEffect(() => {
    if (completedCards.size === cards.length && cards.length > 0) {
      setShowCelebration(true);
      soundService.playSuccess();
      triggerHaptic('success');
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [completedCards.size, cards.length]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    triggerHaptic('light');
    soundService.play('tap');

    // Mark card as completed when flipped to back
    if (!isFlipped && !completedCards.has(currentIndex)) {
      setCompletedCards(prev => new Set([...prev, currentIndex]));
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      triggerHaptic('light');
      soundService.play('tap');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      triggerHaptic('light');
      soundService.play('tap');
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
    triggerHaptic('light');
  };

  const handleSpeak = (text?: string) => {
    if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      triggerHaptic('light');
    }
  };

  if (cards.length === 0) {
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
          Add flashcards to get started!
        </Typography>
      </Box>
    );
  }

  const currentCard = cards[currentIndex];
  const rotateAxis = flipDirection === 'horizontal' ? 'Y' : 'X';

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
            Flashcards
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Card {currentIndex + 1} of {cards.length} • {completedCards.size} viewed
          </Typography>
        </Box>

        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={24} />
        </IconButton>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            width: '100%',
            height: 8,
            backgroundColor: 'grey.300',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCards.size / cards.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
            }}
          />
        </Box>
      </Box>

      {/* Card container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Previous button */}
        {showNavigation && (
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="large"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <ChevronLeft size={32} />
          </IconButton>
        )}

        {/* Flashcard */}
        <Box
          sx={{
            perspective: 1500,
            width: cardDimensions.width,
            height: cardDimensions.height,
          }}
        >
          <motion.div
            onClick={handleFlip}
            animate={{
              [`rotate${rotateAxis}`]: isFlipped ? 180 : 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              cursor: 'pointer',
            }}
          >
            {/* Front side */}
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 4,
                overflow: 'hidden',
              }}
            >
              {currentCard.front.imageUrl && (
                <Box
                  component="img"
                  src={currentCard.front.imageUrl}
                  alt="Flashcard front"
                  sx={{
                    maxWidth: '80%',
                    maxHeight: '60%',
                    objectFit: 'contain',
                    mb: 2,
                    borderRadius: 2,
                  }}
                />
              )}
              {currentCard.front.text && (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography
                    variant={cardSize === 'small' ? 'h5' : cardSize === 'medium' ? 'h4' : 'h3'}
                    fontWeight={700}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {currentCard.front.text}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.front.text);
                    }}
                    sx={{ mt: 2, color: 'white' }}
                  >
                    <Volume2 size={28} />
                  </IconButton>
                </Box>
              )}

              {/* Flip hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                  position: 'absolute',
                  bottom: 20,
                  fontSize: '14px',
                  opacity: 0.7,
                }}
              >
                👆 Tap to flip
              </motion.div>
            </Paper>

            {/* Back side */}
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: `rotate${rotateAxis}(180deg)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                p: 4,
                overflow: 'hidden',
              }}
            >
              {currentCard.back.imageUrl && (
                <Box
                  component="img"
                  src={currentCard.back.imageUrl}
                  alt="Flashcard back"
                  sx={{
                    maxWidth: '80%',
                    maxHeight: '60%',
                    objectFit: 'contain',
                    mb: 2,
                    borderRadius: 2,
                  }}
                />
              )}
              {currentCard.back.text && (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography
                    variant={cardSize === 'small' ? 'h5' : cardSize === 'medium' ? 'h4' : 'h3'}
                    fontWeight={700}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {currentCard.back.text}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.back.text);
                    }}
                    sx={{ mt: 2, color: 'white' }}
                  >
                    <Volume2 size={28} />
                  </IconButton>
                </Box>
              )}

              {/* Success checkmark */}
              {completedCards.has(currentIndex) && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Typography sx={{ fontSize: '28px' }}>✓</Typography>
                  </Box>
                </motion.div>
              )}
            </Paper>
          </motion.div>
        </Box>

        {/* Next button */}
        {showNavigation && (
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            size="large"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <ChevronRight size={32} />
          </IconButton>
        )}
      </Box>

      {/* Card indicator dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        {cards.map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsFlipped(false);
            }}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? 'primary.main' : 'grey.400',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: index === currentIndex ? 'scale(1.3)' : 'scale(1)',
              border: completedCards.has(index) ? '2px solid' : 'none',
              borderColor: 'success.main',
              '&:hover': {
                transform: 'scale(1.5)',
              },
            }}
          />
        ))}
      </Box>

      {/* Completion celebration */}
      <AnimatePresence>
        {showCelebration && (
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
              <Typography variant="h4" fontWeight={800}>
                Great Job! 🎉
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You've reviewed all {cards.length} flashcards!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Flashcards;

