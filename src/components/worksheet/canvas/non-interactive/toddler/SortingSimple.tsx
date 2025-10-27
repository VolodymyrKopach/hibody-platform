'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface ColorBasket {
  color: string;
  colorName: string;
  bgColor: string;
}

interface ColorItem {
  emoji: string;
  color: string; // Match with basket color
}

interface SortingSimpleProps {
  baskets?: ColorBasket[];
  items?: ColorItem[];
  // TIER 1 - Core customization
  mascot?: string;
  borderColor?: string;
  backgroundColor?: string;
}

/**
 * SortingSimple - Ultra-simplified COLOR sorting for toddlers (2-3 years)
 * 
 * Key features for 2-3 years:
 * - Sort by COLOR (not abstract categories!)
 * - ONLY 2 baskets maximum
 * - ONLY 4-6 items total
 * - Clear visual color matching
 * - Large emojis (7rem)
 * - Visual instruction only
 */
const SortingSimple: React.FC<SortingSimpleProps> = ({
  baskets,
  items,
  mascot = '🐨',
  borderColor = '#9C27B0',
  backgroundColor = '#FFFEF8',
}) => {
  const defaultBaskets: ColorBasket[] = [
    { color: '#FF6B6B', colorName: 'ЧЕРВОНЕ', bgColor: '#FFEBEE' },
    { color: '#2196F3', colorName: 'СИНЄ', bgColor: '#E3F2FD' },
  ];

  const defaultItems: ColorItem[] = [
    { emoji: '🍎', color: '#FF6B6B' }, // Red apple
    { emoji: '🔵', color: '#2196F3' }, // Blue circle
    { emoji: '🍓', color: '#FF6B6B' }, // Red strawberry
    { emoji: '🐟', color: '#2196F3' }, // Blue fish
  ];

  const colorBaskets = baskets || defaultBaskets;
  const colorItems = items || defaultItems;

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
        background: `linear-gradient(135deg, #C8E6C9 0%, ${backgroundColor} 100%)`,
      }}
    >
      {/* Mascot + visual instruction */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 5 }}>
        <Typography sx={{ fontSize: '5rem' }}>{mascot}</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>👆</Typography>
        <Typography sx={{ fontSize: '4rem' }}>➡️</Typography>
        <Typography sx={{ fontSize: '4rem', mx: 2 }}>📦</Typography>
      </Box>

      {/* Items to sort - with cutting markers */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
          mb: 6,
          p: 4,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          border: '6px dashed #81C784',
        }}
      >
        {colorItems.map((item, index) => (
          <Box
            key={`item-${index}-${item.emoji}`}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 150,
              height: 150,
              bgcolor: '#FAFAFA',
              borderRadius: 3,
              border: `5px dashed ${item.color}`,
              fontSize: '7rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {item.emoji}
            {/* Scissors marker */}
            <Box
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                fontSize: '1.5rem',
                bgcolor: '#FFFFFF',
                borderRadius: '50%',
                width: 35,
                height: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✂️
            </Box>
          </Box>
        ))}
      </Box>

      {/* Color Baskets */}
      <Box
        sx={{
          display: 'flex',
          gap: 6,
          justifyContent: 'center',
        }}
      >
        {colorBaskets.map((basket, index) => (
          <Box
            key={`basket-${index}-${basket.color}`}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* Color label with big color square */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: basket.color,
                  borderRadius: 4,
                  border: '8px solid #FFFFFF',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                }}
              />
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: basket.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {basket.colorName}
              </Typography>
            </Box>

            {/* Empty basket for sorting */}
            <Box
              sx={{
                width: '100%',
                minHeight: 250,
                border: `8px dashed ${basket.color}`,
                borderRadius: 3,
                bgcolor: basket.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              📦
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
        🎯 👏 🌈
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
        🖨️ Роздрукуйте на A4 (альбомна орієнтація) • Виріжте картки і сортуйте
      </Typography>
    </Paper>
  );
};

export default SortingSimple;

