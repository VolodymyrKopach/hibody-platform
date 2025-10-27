'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { GitBranch, Star } from 'lucide-react';

interface MatchPair {
  leftItem: {
    label: string;
    emoji?: string;
  };
  rightItem: {
    label: string;
    emoji?: string;
  };
}

interface LineMatchingProps {
  pairs?: MatchPair[];
  title?: string;
  instruction?: string;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  dotColor?: string;
  backgroundColor?: string;
}

const LineMatching: React.FC<LineMatchingProps> = ({
  pairs: rawPairs = [
    {
      leftItem: { label: 'Собака', emoji: '🐕' },
      rightItem: { label: 'Гав-гав!', emoji: '💬' },
    },
    {
      leftItem: { label: 'Кіт', emoji: '🐱' },
      rightItem: { label: 'Мяу!', emoji: '💬' },
    },
    {
      leftItem: { label: 'Пташка', emoji: '🐦' },
      rightItem: { label: 'Чирик!', emoji: '💬' },
    },
  ],
  title = "🔗 З'єднай лініями",
  instruction = "Намалюй лінію від тваринки до її звуку! 🖍️",
  mascot = '🦁',
  borderColor = '#4CAF50',
  dotColor = '#FF6B9D',
  backgroundColor = '#F0F8FF',
}) => {
  // Validate: max 3 pairs for 3-4 years
  const pairs = rawPairs.slice(0, 3);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: backgroundColor,
        border: `4px solid ${borderColor}`,
        borderRadius: 4,
        background: `linear-gradient(135deg, #E1F5FE 0%, ${backgroundColor} 100%)`,
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
          border: `4px solid ${borderColor}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {mascot}
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <GitBranch size={48} strokeWidth={3} color="#4FC3F7" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#4FC3F7',
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

      {/* Visual instruction with pictogram */}
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
        <Typography sx={{ fontSize: '3rem' }}>👉</Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
          Малюй лінії олівцем
        </Typography>
        <Typography sx={{ fontSize: '3rem' }}>🖍️</Typography>
      </Box>

      {/* Matching area */}
      <Box
        sx={{
          position: 'relative',
          minHeight: 450,
          border: '5px dashed #FFB84D',
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          p: 5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {/* Left column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pairs.map((pair, index) => (
              <Box
                key={`left-${index}`}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                  bgcolor: '#E1F5FE',
                  border: '5px solid #4FC3F7',
                  borderRadius: 3,
                  minHeight: 100,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                }}
              >
                {/* Circle dot for drawing */}
                <Box
                  sx={{
                    position: 'absolute',
                    right: -15,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: '#FF6B9D',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                />
                {pair.leftItem.emoji && (
                  <Typography sx={{ fontSize: '5rem' }}>
                    {pair.leftItem.emoji}
                  </Typography>
                )}
                <Typography variant="h5" fontWeight="900" sx={{ fontSize: '2.2rem' }}>
                  {pair.leftItem.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Center drawing space with visual cues */}
          <Box
            sx={{
              width: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Big pencil icon in center */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem',
                opacity: 0.3,
              }}
            >
              ✏️
            </Box>
            {pairs.map((_, index) => (
              <Box
                key={`guide-${index}`}
                sx={{
                  width: '100%',
                  height: 3,
                  borderTop: '4px dotted #CCCCCC',
                  position: 'relative',
                }}
              >
                {/* Arrow hint */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '1.5rem',
                    opacity: 0.4,
                  }}
                >
                  →
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Right column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pairs.map((pair, index) => (
              <Box
                key={`right-${index}`}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                  bgcolor: '#FFF9C4',
                  border: '5px solid #FFB84D',
                  borderRadius: 3,
                  minHeight: 100,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                }}
              >
                {/* Circle dot for drawing */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -15,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: '#FF6B9D',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                />
                {pair.rightItem.emoji && (
                  <Typography sx={{ fontSize: '5rem' }}>
                    {pair.rightItem.emoji}
                  </Typography>
                )}
                <Typography variant="h5" fontWeight="900" sx={{ fontSize: '2.2rem' }}>
                  {pair.rightItem.label}
                </Typography>
              </Box>
            ))}
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
          🌟 Супер! Ти знаєш усі звуки! 🌟
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
          🖨️ Роздрукуй та з'єднай лініями 🖍️
        </Typography>
      </Box>
    </Paper>
  );
};

export default LineMatching;

