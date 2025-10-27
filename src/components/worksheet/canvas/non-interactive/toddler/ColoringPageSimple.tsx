'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface ColoringItem {
  shape: 'circle' | 'square' | 'heart';
  emoji: string;
  size: number;
}

interface ColoringPageSimpleProps {
  items?: ColoringItem[];
  // TIER 1 - Core customization
  mascot?: string;
  toolEmoji?: string;
  encouragementEmojis?: string[];
  borderColor?: string;
  shapeBorderColor?: string;
  backgroundColor?: string;
  strokeColor?: string;
}

/**
 * ColoringPageSimple - Ultra-simplified coloring page for toddlers (2-3 years)
 * 
 * Key features for 2-3 years:
 * - ONLY 2 items maximum (attention span 5-8 minutes)
 * - VERY large shapes (300px+)
 * - NO text instructions, only emojis
 * - Very thick borders (8px) for easy visibility
 * - Simple shapes only (circle, square)
 * - One bright color
 */
const ColoringPageSimple: React.FC<ColoringPageSimpleProps> = ({
  items,
  mascot = '🐼',
  toolEmoji = '🖍️',
  encouragementEmojis = ['👏', '⭐', '🎉'],
  borderColor = '#FF6B9D',
  shapeBorderColor = '#FFD700',
  backgroundColor = '#FFFEF8',
  strokeColor = '#000000',
}) => {
  const defaultItems: ColoringItem[] = [
    { shape: 'circle', emoji: '🌞', size: 320 },
    { shape: 'square', emoji: '🎁', size: 300 },
  ];

  // Validate: max 2 items for toddlers, min 1
  const rawItems = items || defaultItems;
  const coloringItems = rawItems.slice(0, 2).map(item => ({
    ...item,
    size: Math.min(Math.max(item.size, 200), 400), // Clamp size 200-400
  }));

  const renderShape = (shape: string, size: number) => {
    const commonProps = {
      stroke: strokeColor,
      strokeWidth: 8, // Very thick for toddlers
      fill: 'transparent',
    };

    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            {...commonProps}
          />
        );
      case 'square':
        return (
          <rect
            x={10}
            y={10}
            width={size - 20}
            height={size - 20}
            rx={20}
            {...commonProps}
          />
        );
      case 'heart':
        const heartPath = `M ${size / 2} ${size * 0.85}
          C ${size * 0.2} ${size * 0.6}, ${size * 0.1} ${size * 0.3}, ${size / 2} ${size * 0.2}
          C ${size * 0.9} ${size * 0.3}, ${size * 0.8} ${size * 0.6}, ${size / 2} ${size * 0.85}`;
        return <path d={heartPath} {...commonProps} />;
      default:
        return null;
    }
  };

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
        background: `linear-gradient(135deg, #FFF9E6 0%, ${backgroundColor} 100%)`,
      }}
    >
      {/* Mascot - visual only, no text */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '5rem' }}>{mascot}</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>{toolEmoji}</Typography>
      </Box>

      {/* Coloring items - LARGE and SIMPLE */}
      <Box
        sx={{
          display: 'flex',
          gap: 6,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {coloringItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              flex: 1,
            }}
          >
            {/* Emoji hint - large and clear */}
            <Typography sx={{ fontSize: '5rem' }}>{item.emoji}</Typography>

            {/* Shape to color */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                p: 2,
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                border: `6px solid ${shapeBorderColor}`,
              }}
            >
              <svg
                width={item.size}
                height={item.size}
                viewBox={`0 0 ${item.size} ${item.size}`}
                style={{ display: 'block' }}
              >
                {renderShape(item.shape, item.size)}
              </svg>
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
        {encouragementEmojis.join(' ')}
      </Box>

      {/* Print instruction - for adults, small */}
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

export default ColoringPageSimple;

