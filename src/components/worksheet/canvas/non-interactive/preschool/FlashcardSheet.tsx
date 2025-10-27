'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LayoutGrid, Star } from 'lucide-react';

interface FlashcardItem {
  word: string;
  emoji?: string;
  translation?: string;
}

interface FlashcardSheetProps {
  cards?: FlashcardItem[];
  title?: string;
  instruction?: string;
  columns?: number;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  cardBorderColor?: string;
  backgroundColor?: string;
}

const FlashcardSheet: React.FC<FlashcardSheetProps> = ({
  cards: rawCards = [
    { word: 'Червоний', emoji: '🔴', translation: 'Red' },
    { word: 'Синій', emoji: '🔵', translation: 'Blue' },
    { word: 'Жовтий', emoji: '🟡', translation: 'Yellow' },
    { word: 'Зелений', emoji: '🟢', translation: 'Green' },
    { word: 'Помаранчевий', emoji: '🟠', translation: 'Orange' },
    { word: 'Фіолетовий', emoji: '🟣', translation: 'Purple' },
  ],
  title = '🎴 Картки для вивчення',
  instruction = 'Виріж та грайся з картками! 🎉',
  columns = 2,
  mascot = '🦁',
  borderColor = '#9C27B0',
  cardBorderColor = '#9C27B0',
  backgroundColor = '#FFFEF8',
}) => {
  // Validate: max 9 cards (3x3 grid)
  const cards = rawCards.slice(0, 9);
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#F3E5F5',
        border: '4px solid #9C27B0',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 100%)',
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
          border: '4px solid #9C27B0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🐰
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <LayoutGrid size={48} strokeWidth={3} color="#9C27B0" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#9C27B0',
              textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            }}
          >
            {title}
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

      {/* Visual instruction */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
          p: 2,
          bgcolor: '#FFF9E6',
          borderRadius: 3,
          border: '3px solid #FFB84D',
        }}
      >
        <Typography sx={{ fontSize: '3rem' }}>✂️</Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
          Виріж кожну картку
        </Typography>
        <Typography sx={{ fontSize: '3rem' }}>🎴</Typography>
      </Box>

      {/* Cards grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 3,
          mb: 4,
        }}
      >
        {cards.map((card, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              border: '5px dashed #9C27B0',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 220,
              gap: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            {/* Corner scissors indicators */}
            <Box
              sx={{
                position: 'absolute',
                top: -18,
                left: -18,
                bgcolor: '#FFE066',
                border: '3px solid #9C27B0',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              ✂️
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -18,
                right: -18,
                bgcolor: '#FFE066',
                border: '3px solid #9C27B0',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              ✂️
            </Box>

            {/* Card number badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: '#FF6B9D',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '3px solid #FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {index + 1}
            </Box>

            {/* Card content */}
            {card.emoji && (
              <Typography sx={{ fontSize: '6rem', mb: 1 }}>
                {card.emoji}
              </Typography>
            )}
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                fontSize: '2.2rem',
                textAlign: 'center',
                wordBreak: 'break-word',
                color: '#9C27B0',
              }}
            >
              {card.word}
            </Typography>
            {card.translation && (
              <Box
                sx={{
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  bgcolor: '#F3E5F5',
                  borderRadius: 2,
                  border: '2px solid #E1BEE7',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.1rem',
                    color: '#7B1FA2',
                    fontWeight: 'bold',
                  }}
                >
                  {card.translation}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Fun game ideas with pictograms */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          mb: 4,
          p: 3,
          bgcolor: '#E8F5E9',
          borderRadius: 3,
          border: '3px solid #4CAF50',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>👀</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Дивись і вчи
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🗣️</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Називай слова
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎮</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Грай і вигравай
          </Typography>
        </Box>
      </Box>

      {/* Encouragement message */}
      <Box
        sx={{
          mb: 3,
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
          🌟 Супер! Ти швидко все запам'ятаєш! 🌟
        </Typography>
      </Box>

      {/* Print instruction */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#FFF9E6',
          borderRadius: 2,
          textAlign: 'center',
          border: '3px solid #FFB84D',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.3rem', color: '#666', fontWeight: 'bold' }}>
          🖨️ Роздрукуй на щільному папері 🎴
        </Typography>
      </Box>
    </Paper>
  );
};

export default FlashcardSheet;

