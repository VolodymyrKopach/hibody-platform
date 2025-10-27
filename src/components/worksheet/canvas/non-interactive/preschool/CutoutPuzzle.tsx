'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Scissors, Star } from 'lucide-react';

interface CutoutPuzzleProps {
  pieces?: number;
  image?: {
    url?: string;
    emoji?: string;
    label: string;
  };
  title?: string;
  instruction?: string;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  pieceNumberColor?: string;
  backgroundColor?: string;
}

const CutoutPuzzle: React.FC<CutoutPuzzleProps> = ({
  pieces: rawPieces = 4,
  image = {
    emoji: '🐶',
    label: 'Собачка',
  },
  title = '✂️ Пазл для вирізання',
  instruction = 'Виріж і склади картинку! 🧩',
  mascot = '🐼',
  borderColor = '#FF9800',
  pieceNumberColor = '#FF6B9D',
  backgroundColor = '#FFFEF8',
}) => {
  // Validate: only 2 or 4 pieces allowed for 3-4 years
  const pieces = rawPieces === 2 ? 2 : 4;
  const gridSize = pieces === 2 ? { rows: 1, cols: 2 } : { rows: 2, cols: 2 };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#FFF3E0',
        border: '4px solid #FF9800',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFE0B2 0%, #FFF3E0 100%)',
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
          border: '4px solid #FF9800',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🦁
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Scissors size={48} strokeWidth={3} color="#FF9800" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#FF9800',
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

      {/* Step-by-step visual instructions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          mb: 4,
          p: 3,
          bgcolor: '#FFF9E6',
          borderRadius: 3,
          border: '3px solid #FFB84D',
        }}
      >
        {/* Step 1 */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#FF6B9D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '4px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            1
          </Box>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>✂️</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Виріж
          </Typography>
        </Box>

        {/* Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '2.5rem', color: '#FF9800' }}>
          →
        </Box>

        {/* Step 2 */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#FF6B9D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '4px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            2
          </Box>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🔀</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Перемішай
          </Typography>
        </Box>

        {/* Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '2.5rem', color: '#FF9800' }}>
          →
        </Box>

        {/* Step 3 */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#FF6B9D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
              border: '4px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            3
          </Box>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🧩</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Склади
          </Typography>
        </Box>
      </Box>

      {/* Reference image */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, fontSize: '1.6rem', color: '#555' }}>
          Готова картинка: 👇
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 180,
            height: 180,
            bgcolor: '#FFFFFF',
            border: '5px solid #4CAF50',
            borderRadius: 3,
            fontSize: '6rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {image.emoji || '🖼️'}
        </Box>
        <Typography variant="h4" fontWeight="900" sx={{ mt: 2, fontSize: '2rem', color: '#4CAF50' }}>
          {image.label}
        </Typography>
      </Box>

      {/* Puzzle grid with cut lines */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'inline-block',
            border: '5px solid #FF9800',
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            p: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: '#FFF9E6',
              borderRadius: 2,
              border: '3px solid #FFB84D',
            }}
          >
            <Typography sx={{ fontSize: '2.5rem' }}>✂️</Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
              Виріж по пунктирних лініях
            </Typography>
            <Typography sx={{ fontSize: '2.5rem' }}>✂️</Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
              gap: 0,
              width: 480,
              height: pieces === 2 ? 240 : 480,
            }}
          >
            {Array.from({ length: pieces }).map((_, index) => {
              const row = Math.floor(index / gridSize.cols);
              const col = index % gridSize.cols;
              const isLastCol = col === gridSize.cols - 1;
              const isLastRow = row === gridSize.rows - 1;

              return (
                <Box
                  key={`puzzle-piece-${index}`}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#FFFEF8',
                    borderRight: isLastCol ? 'none' : '4px dashed #FF9800',
                    borderBottom: isLastRow ? 'none' : '4px dashed #FF9800',
                    gap: 1,
                  }}
                >
                  {/* Scissors indicators on corners */}
                  {!isLastCol && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: -15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.5rem',
                        bgcolor: '#FFFFFF',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #FF9800',
                      }}
                    >
                      ✂️
                    </Box>
                  )}
                  {!isLastRow && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '1.5rem',
                        bgcolor: '#FFFFFF',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #FF9800',
                      }}
                    >
                      ✂️
                    </Box>
                  )}

                  {/* Piece number badge */}
                  <Box
                    sx={{
                      bgcolor: '#FF6B9D',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: 50,
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: '900',
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                      mt: 2,
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* Small preview emoji */}
                  <Typography sx={{ fontSize: pieces === 2 ? '4rem' : '3rem', opacity: 0.5 }}>
                    {image.emoji || '🖼️'}
                  </Typography>

                  {/* Label */}
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      fontSize: '1rem',
                      color: '#666',
                      textAlign: 'center',
                      mb: 1,
                    }}
                  >
                    ЧАСТИНА {index + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Encouragement message */}
      <Box
        sx={{
          mt: 4,
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
          🌟 Чудова робота! Ти справжній майстер пазлів! 🌟
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
          🖨️ Роздрукуй на щільному папері ✂️
        </Typography>
      </Box>
    </Paper>
  );
};

export default CutoutPuzzle;

