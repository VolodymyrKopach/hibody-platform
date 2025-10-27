'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface Flashcard {
  emoji: string;
  word?: string; // Optional - only for adults
}

interface FlashcardSheetSimpleProps {
  cards?: Flashcard[];
  showWords?: boolean;
  // TIER 1 - Core customization
  mascot?: string;
  borderColor?: string;
  cardBorderColor?: string;
  backgroundColor?: string;
}

/**
 * FlashcardSheetSimple - Ultra-simplified flashcards for toddlers (2-3 years)
 * 
 * Key features for 2-3 years:
 * - ONLY 4 cards maximum (cognitive load limit)
 * - VERY large emojis (8rem)
 * - NO words for children (optional for adults)
 * - One item per card
 * - Simple, familiar objects only
 */
const FlashcardSheetSimple: React.FC<FlashcardSheetSimpleProps> = ({
  cards,
  showWords = false,
  mascot = '🦁',
  borderColor = '#FF6B9D',
  cardBorderColor = '#FF6B9D',
  backgroundColor = '#FFFEF8',
}) => {
  const defaultCards: Flashcard[] = [
    { emoji: '🍎', word: 'Яблуко' },
    { emoji: '🐶', word: 'Собака' },
    { emoji: '⚽', word: "М'яч" },
    { emoji: '🌸', word: 'Квітка' },
  ];

  // Validate: max 4 cards for 2x2 grid, min 1
  const flashcards = (cards || defaultCards).slice(0, 4);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 6,
        bgcolor: backgroundColor,
        border: `8px solid ${borderColor}`,
        borderRadius: 4,
        background: `linear-gradient(135deg, #E1BEE7 0%, ${backgroundColor} 100%)`,
      }}
    >
      {/* Mascot - visual only */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '5rem' }}>{mascot}</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>📇</Typography>
      </Box>

      {/* Flashcards grid - 2x2, very large */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 5,
        }}
      >
        {flashcards.map((card, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              border: `6px dashed ${cardBorderColor}`,
              borderRadius: 4,
              bgcolor: '#FFFFFF',
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 280,
              gap: 2,
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            }}
          >
            {/* Scissors icon for cutting */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: '2rem',
                bgcolor: '#FFFFFF',
                borderRadius: '50%',
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              ✂️
            </Box>

            {/* Very large emoji - main focus */}
            <Typography sx={{ fontSize: '8rem', lineHeight: 1 }}>
              {card.emoji}
            </Typography>

            {/* Optional word - small, for adults only */}
            {showWords && card.word && (
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                  fontSize: '1.8rem',
                  textAlign: 'center',
                  color: '#9C27B0',
                  mt: 2,
                }}
              >
                {card.word}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Encouragement - emoji only */}
      <Box
        sx={{
          mt: 5,
          textAlign: 'center',
          fontSize: '4rem',
        }}
      >
        🌟 👍 💖
      </Box>

      {/* Print instruction - for adults */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 3,
          color: '#999',
          fontSize: '0.9rem',
        }}
      >
        🖨️ Роздрукуйте та виріжте картки • A4 (альбомна орієнтація)
      </Typography>
    </Paper>
  );
};

export default FlashcardSheetSimple;

