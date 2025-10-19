'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface CardPair {
  id: string;
  imageUrl: string;
  pairId: string;
}

interface MemoryCardsProps {
  pairs: Array<{ id: string; imageUrl: string }>;
  gridSize?: '2x2' | '2x3' | '3x3';
  cardBackImage?: string;
  difficulty?: 'easy' | 'hard';
  theme?: ThemeName;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

interface FlippedCard {
  index: number;
  pairId: string;
}

const MemoryCards: React.FC<MemoryCardsProps> = ({
  pairs = [],
  gridSize = '2x2',
  cardBackImage,
  difficulty = 'easy',
  theme: themeName,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const componentTheme = useComponentTheme(themeName);
  const [cards, setCards] = useState<CardPair[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Easy mode: cards stay flipped longer
  const flipDuration = difficulty === 'easy' ? 2000 : 1000;

  // Initialize cards
  useEffect(() => {
    if (pairs.length === 0) return;

    // Create pairs of cards
    const cardPairs: CardPair[] = [];
    pairs.forEach((pair) => {
      cardPairs.push(
        { id: `${pair.id}-1`, imageUrl: pair.imageUrl, pairId: pair.id },
        { id: `${pair.id}-2`, imageUrl: pair.imageUrl, pairId: pair.id }
      );
    });

    // Shuffle cards
    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [pairs]);

  // Check if all pairs are matched
  useEffect(() => {
    if (matchedPairs.size === pairs.length && pairs.length > 0 && !isCompleted) {
      setIsCompleted(true);
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
        triggerHaptic('success');
      }, 500);
    }
  }, [matchedPairs.size, pairs.length, isCompleted]);

  const handleCardClick = (index: number) => {
    if (
      isChecking ||
      flippedIndices.includes(index) ||
      matchedPairs.has(cards[index].pairId) ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    triggerHaptic('light');
    soundService.playCorrect();

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);

      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs(prev => new Set([...prev, firstCard.pairId]));
          setFlippedIndices([]);
          setIsChecking(false);
          soundService.playCorrect();
          triggerHaptic('success');
          
          // Mini confetti
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
          });
        }, flipDuration);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
          soundService.playError();
          triggerHaptic('error');
        }, flipDuration);
      }
    }
  };

  const handleReset = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs(new Set());
    setAttempts(0);
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const getGridColumns = () => {
    switch (gridSize) {
      case '2x2':
        return 2;
      case '2x3':
        return 2;
      case '3x3':
        return 3;
      default:
        return 2;
    }
  };

  const getCardSize = () => {
    switch (gridSize) {
      case '2x2':
        return 180;
      case '2x3':
        return 140;
      case '3x3':
        return 120;
      default:
        return 150;
    }
  };

  const cardSize = getCardSize();

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 400,
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
            {isCompleted ? '🎉 You Won!' : 'Memory Game'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? `Completed in ${attempts} tries!` 
              : `Attempts: ${attempts} | Pairs found: ${matchedPairs.size}/${pairs.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Cards grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
          gap: 2,
          maxWidth: 600,
          mx: 'auto',
          justifyContent: 'center',
        }}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedPairs.has(card.pairId);
          const isMatched = matchedPairs.has(card.pairId);

          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: isFlipped ? 1 : 0.95 }}
              style={{
                cursor: isFlipped ? 'default' : 'pointer',
                perspective: 1000,
              }}
              onClick={() => handleCardClick(index)}
            >
              <Box
                sx={{
                  width: cardSize,
                  height: cardSize,
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Card back */}
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    background: cardBackImage 
                      ? `url(${cardBackImage}) center/cover` 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  {!cardBackImage && (
                    <Typography variant="h3" sx={{ color: 'white', fontSize: '48px' }}>
                      ?
                    </Typography>
                  )}
                </Paper>

                {/* Card front */}
                <Paper
                  elevation={isMatched ? 8 : 4}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: '3px solid',
                    borderColor: isMatched ? 'success.main' : 'primary.main',
                    overflow: 'hidden',
                    boxShadow: isMatched ? '0 0 20px rgba(76, 175, 80, 0.5)' : undefined,
                  }}
                >
                  <Box
                    component="img"
                    src={card.imageUrl}
                    alt="Memory card"
                    sx={{
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain',
                    }}
                  />

                  {/* Success indicator */}
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
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
                </Paper>
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Completion overlay */}
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
              zIndex: 100,
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
              <Trophy size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Well Done!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You found all {pairs.length} pairs in {attempts} tries! 🎉
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 3 }}>
                {Array.from({ length: Math.min(5, pairs.length) }).map((_, i) => (
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
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && attempts === 0 && (
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
            💡 Tap cards to flip them and find matching pairs!
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default MemoryCards;

