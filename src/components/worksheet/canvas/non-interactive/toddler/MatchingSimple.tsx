'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface MatchPair {
  emoji: string;
  size: number;
}

interface MatchingSimpleProps {
  pairs?: MatchPair[];
  // TIER 1 - Core customization
  mascot?: string;
  borderColor?: string;
  boxColor?: string;
  backgroundColor?: string;
}

/**
 * MatchingSimple - Ultra-simplified matching for toddlers (2-3 years)
 * 
 * Key features for 2-3 years:
 * - ONLY 2 pairs maximum
 * - Identical matching (same emoji) - no complex associations
 * - VERY large emojis (7rem)
 * - Visual instruction (arrow) only
 * - Wide drawing space
 */
const MatchingSimple: React.FC<MatchingSimpleProps> = ({
  pairs,
  mascot = '🧸',
  borderColor = '#4CAF50',
  boxColor = '#4CAF50',
  backgroundColor = '#FFFEF8',
}) => {
  const defaultPairs: MatchPair[] = [
    { emoji: '🐱', size: 7 },
    { emoji: '🌺', size: 7 },
  ];

  // Validate: max 2 pairs for toddlers, min 1
  const matchPairs = (pairs || defaultPairs).slice(0, 2).map(pair => ({
    ...pair,
    size: Math.min(Math.max(pair.size, 5), 10), // Clamp emoji size 5-10rem
  }));

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
        background: `linear-gradient(135deg, #E1F5FE 0%, ${backgroundColor} 100%)`,
      }}
    >
      {/* Mascot + visual instruction */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '5rem' }}>{mascot}</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>👆</Typography>
        <Typography sx={{ fontSize: '4rem' }}>➡️</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>✏️</Typography>
        <Typography sx={{ fontSize: '4rem' }}>➡️</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>👆</Typography>
      </Box>

      {/* Matching area */}
      <Box
        sx={{
          position: 'relative',
          minHeight: 500,
          border: '8px dashed #FFB84D',
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          p: 6,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        }}
      >
        {matchPairs.map((pair, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: index < matchPairs.length - 1 ? 8 : 0,
            }}
          >
            {/* Left emoji */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 200,
                height: 200,
                bgcolor: '#E3F2FD',
                borderRadius: 4,
                border: `6px solid ${boxColor}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Typography sx={{ fontSize: `${pair.size}rem` }}>
                {pair.emoji}
              </Typography>
            </Box>

            {/* Very wide drawing space */}
            <Box
              sx={{
                flex: 1,
                mx: 6,
                height: 200,
                border: '4px dotted #90CAF9',
                borderRadius: 2,
                bgcolor: '#FAFAFA',
              }}
            />

            {/* Right emoji (same as left) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 200,
                height: 200,
                bgcolor: '#E8F5E9',
                borderRadius: 4,
                border: `6px solid ${boxColor}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Typography sx={{ fontSize: `${pair.size}rem` }}>
                {pair.emoji}
              </Typography>
            </Box>
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
        💪 🎨 ✨
      </Box>

      {/* Print instruction */}
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
        🖨️ Роздрукуйте на A4 (альбомна орієнтація)
      </Typography>
    </Paper>
  );
};

export default MatchingSimple;

