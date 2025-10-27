'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Navigation, Star } from 'lucide-react';

interface MazeProps {
  startEmoji?: string;
  endEmoji?: string;
  difficulty?: 'easy' | 'medium';
  title?: string;
  instruction?: string;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  pathColor?: string;
  guideLineColor?: string;
  backgroundColor?: string;
}

const SimpleMaze: React.FC<MazeProps> = ({
  startEmoji = '🐭',
  endEmoji = '🧀',
  difficulty = 'easy',
  title = '🧀 Допоможи знайти скарб',
  instruction = 'Намалюй шлях олівцем від старту до фінішу! 🖍️',
  mascot = '🗺️',
  borderColor = '#FFC107',
  pathColor = '#E0E0E0',
  guideLineColor = '#FFC107',
  backgroundColor = '#FFFEF8',
}) => {
  const pathWidth = difficulty === 'easy' ? 80 : 60;

  // Start and End positions (center of emoji boxes)
  // Start box: top 80, left 50, size 80x80 → center at (90, 120)
  // End box: bottom 80, right 50, size 80x80 → on 600x600 canvas: (550-40, 520-40) = (510, 480)
  const startX = 90;
  const startY = 120;
  const endX = 510;
  const endY = 480;

  // Simple maze path - connects start to end
  const mazePath = difficulty === 'easy'
    ? `M ${startX},${startY} L ${startX},250 L 300,250 L 300,350 L ${endX},350 L ${endX},${endY}`
    : `M ${startX},${startY} L ${startX},200 L 200,200 L 200,300 L 350,300 L 350,200 L 450,200 L 450,350 L ${endX},350 L ${endX},${endY}`;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#FFF8E1',
        border: '4px solid #FFC107',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFECB3 0%, #FFF8E1 100%)',
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
          border: '4px solid #FFC107',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🦁
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Navigation size={48} strokeWidth={3} color="#FFC107" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#FFC107',
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

      {/* Instructions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
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
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
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
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>👆</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
            Веди пальцем
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center' }}>→</Typography>

        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
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
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>✏️</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
            Малюй олівцем
          </Typography>
        </Box>
      </Box>

      {/* Maze */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 4,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          border: '4px solid #FFC107',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', width: 600, height: 600 }}>
          {/* Start */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              left: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                border: '5px solid #2E7D32',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {startEmoji}
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>
              Старт 👇
            </Typography>
          </Box>

          {/* Maze path (visual guide) */}
          <svg width="600" height="600" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            {/* Background path (for visual) */}
            <path
              d={mazePath}
              stroke="#E0E0E0"
              strokeWidth={pathWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dotted center line to guide */}
            <path
              d={mazePath}
              stroke="#FFC107"
              strokeWidth={4}
              strokeDasharray="10 10"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
            />
          </svg>

          {/* End */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              zIndex: 10,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#FF6B9D' }}>
              Фініш 👇
            </Typography>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#FF6B9D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                border: '5px solid #C2185B',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {endEmoji}
            </Box>
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
          🎯 Ти знайшов дорогу! Чудово! 🎯
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
          🖨️ Роздрукуй та знайди шлях! 🗺️
        </Typography>
      </Box>
    </Paper>
  );
};

export default SimpleMaze;

