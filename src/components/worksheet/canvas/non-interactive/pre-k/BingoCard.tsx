'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Grid3x3, Star } from 'lucide-react';

interface BingoItem {
  emoji: string;
  word: string;
  category?: string;
}

interface BingoCardProps {
  items?: BingoItem[];
  gridSize?: 3 | 4;
  title?: string;
  instruction?: string;
  showWords?: boolean;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  cellBorderColor?: string;
  freeSpaceText?: string;
  backgroundColor?: string;
}

const FREE_CATEGORY = 'free';

const BingoCard: React.FC<BingoCardProps> = ({
  items = [
    { emoji: '🍎', word: 'Яблуко', category: 'fruit' },
    { emoji: '🐕', word: 'Собака', category: 'animal' },
    { emoji: '⭐', word: 'Зірка', category: 'object' },
    { emoji: '🌸', word: 'Квітка', category: 'nature' },
    { emoji: '🌈', word: 'Веселка', category: 'nature' },
    { emoji: '🏠', word: 'Будинок', category: 'object' },
    { emoji: '🔵', word: 'Коло', category: 'shape' },
    { emoji: '🦋', word: 'Метелик', category: 'animal' },
  ],
  gridSize = 3,
  title = '🎉 БІНГО',
  instruction = 'Граємо разом! 🎊',
  showWords = true,
  mascot = '🎉',
  borderColor = '#9C27B0',
  cellBorderColor = '#9C27B0',
  freeSpaceText = 'ВІЛЬНО!',
  backgroundColor = '#FFFEF8',
}) => {
  // Validate gridSize
  const validGridSize = gridSize === 3 || gridSize === 4 ? gridSize : 3;
  const gridCells = validGridSize * validGridSize;
  const centerIndex = validGridSize === 3 ? 4 : 7; // For 3x3: center is 4, for 4x4: use 7
  
  // Shuffle and select items - useMemo to prevent re-shuffling on every render
  const selectedItems = React.useMemo(() => {
    if (items.length < gridCells - 1) {
      console.warn(`BingoCard: Need at least ${gridCells - 1} items for ${validGridSize}x${validGridSize} grid`);
      // Duplicate items if not enough
      const duplicated = [...items];
      while (duplicated.length < gridCells - 1) {
        duplicated.push(...items);
      }
      return duplicated
        .sort(() => Math.random() - 0.5)
        .slice(0, gridCells - 1);
    }
    
    return [...items]
      .sort(() => Math.random() - 0.5)
      .slice(0, gridCells - 1);
  }, []); // Empty deps - only shuffle once on mount

  // Insert FREE space in the middle
  const gridItems = React.useMemo(() => [
    ...selectedItems.slice(0, centerIndex),
    { emoji: '⭐', word: 'ВІЛЬНО', category: FREE_CATEGORY },
    ...selectedItems.slice(centerIndex),
  ], [selectedItems, centerIndex]);
  
  const winCount = validGridSize;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#FFF3E0',
        border: '4px solid #FF6B9D',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFE0B2 0%, #FFF3E0 50%, #E1BEE7 100%)',
        position: 'relative',
      }}
    >
      {/* Friendly mascot helper */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 20,
          bgcolor: '#FFE066',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          border: '4px solid #FF6B9D',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🎊
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Grid3x3 size={48} strokeWidth={3} color="#FF6B9D" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '3rem',
              color: '#FF6B9D',
              background: 'linear-gradient(90deg, #FF6B9D, #FFC107, #4CAF50, #2196F3, #9C27B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '@media print': {
                color: '#FF6B9D',
                background: 'none',
                WebkitTextFillColor: 'inherit',
              },
            }}
          >
            {title}!
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontSize: '1.5rem',
            color: '#555',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Star size={24} fill="#FFD700" color="#FFD700" />
          {instruction}
          <Star size={24} fill="#FFD700" color="#FFD700" />
        </Typography>
      </Box>

      {/* How to play */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: 4,
          p: 3,
          bgcolor: '#FFF9E6',
          borderRadius: 3,
          border: '3px solid #FFB84D',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#FF6B9D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            1
          </Box>
          <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>👂</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            Слухай слова
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            2
          </Box>
          <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>👀</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            Знайди картинку
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#2196F3',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            3
          </Box>
          <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>✔️</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            Постав наліпку
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#FF9800',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            4
          </Box>
          <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>🎊</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            {winCount} в ряд = БІНГО!
          </Typography>
        </Box>
      </Box>

      {/* Bingo grid */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'inline-block',
            p: 4,
            bgcolor: '#FFFFFF',
            border: '6px solid #FF6B9D',
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${validGridSize}, 1fr)`,
              gap: 2,
            }}
          >
            {gridItems.map((item, index) => {
              const isFree = item.category === FREE_CATEGORY;
              const cellSize = validGridSize === 3 ? 150 : 120;

              return (
                <Box
                  key={`bingo-cell-${index}-${item.emoji}-${item.word}`}
                  sx={{
                    width: cellSize,
                    height: cellSize,
                    border: '4px solid #FF6B9D',
                    borderRadius: 2,
                    bgcolor: isFree ? '#FFD700' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    p: 1,
                  }}
                >
                  {isFree ? (
                    <>
                      <Typography sx={{ fontSize: '3rem' }}>⭐</Typography>
                      <Typography
                        variant="h5"
                        fontWeight="900"
                        sx={{ fontSize: '1.5rem', color: '#FF6B9D' }}
                      >
                        {item.word}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: '4rem' }}>{item.emoji}</Typography>
                      {showWords && (
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{
                            fontSize: '1rem',
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.word}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Rules */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#E8F5E9',
          borderRadius: 2,
          border: '3px solid #4CAF50',
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2 }}>
          🎯 Як виграти:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 3 }}>
          <Typography component="li" sx={{ fontSize: '1.1rem', mb: 1 }}>
            Збери <strong>{winCount} в ряд</strong> по горизонталі →
          </Typography>
          <Typography component="li" sx={{ fontSize: '1.1rem', mb: 1 }}>
            Збери <strong>{winCount} в ряд</strong> по вертикалі ↓
          </Typography>
          <Typography component="li" sx={{ fontSize: '1.1rem' }}>
            Збери <strong>{winCount} в ряд</strong> по діагоналі ↘
          </Typography>
        </Box>
      </Box>

      {/* Encouragement message */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#E8F5E9',
          borderRadius: 3,
          textAlign: 'center',
          border: '3px solid #4CAF50',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: '1.8rem', color: '#2E7D32' }}
        >
          🏆 Веселої гри разом! 🏆
        </Typography>
      </Box>

      {/* Print instruction */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: '#FFF9E6',
          borderRadius: 2,
          textAlign: 'center',
          border: '3px solid #FFB84D',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.3rem', color: '#666', fontWeight: 'bold' }}>
          🖨️ Роздрукуй кілька копій для всієї групи! 🎉
        </Typography>
      </Box>
    </Paper>
  );
};

export default BingoCard;

