'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { SortAsc, Star } from 'lucide-react';

interface SortingCategory {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface SortingItem {
  emoji: string;
  label: string;
  category: string;
}

interface SortingWorksheetProps {
  categories?: SortingCategory[];
  items?: SortingItem[];
  title?: string;
  instruction?: string;
  layout?: 'draw' | 'cutout';
  // TIER 1
  mascot?: string;
  borderColor?: string;
  backgroundColor?: string;
}

const SortingWorksheet: React.FC<SortingWorksheetProps> = ({
  categories = [
    { id: 'fruits', name: 'Фрукти', color: '#FF6B9D', emoji: '🍎' },
    { id: 'vegetables', name: 'Овочі', color: '#4CAF50', emoji: '🥕' },
  ],
  items = [
    { emoji: '🍎', label: 'Яблуко', category: 'fruits' },
    { emoji: '🥕', label: 'Морква', category: 'vegetables' },
    { emoji: '🍌', label: 'Банан', category: 'fruits' },
    { emoji: '🥦', label: 'Брокколі', category: 'vegetables' },
    { emoji: '🍇', label: 'Виноград', category: 'fruits' },
    { emoji: '🌽', label: 'Кукурудза', category: 'vegetables' },
  ],
  title = '📦 Розклади по місцях',
  instruction = 'Намалюй або виріж і приклей у правильну коробку! ✂️',
  layout = 'draw',
  mascot = '🐨',
  borderColor = '#4CAF50',
  backgroundColor = '#FFFEF8',
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#E8F5E9',
        border: '4px solid #4CAF50',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #C8E6C9 0%, #E8F5E9 100%)',
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
          border: '4px solid #4CAF50',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🐰
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <SortAsc size={48} strokeWidth={3} color="#4CAF50" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#4CAF50',
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

      {/* Instructions visual */}
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
          <Typography sx={{ fontSize: '4rem', mb: 1 }}>
            {layout === 'draw' ? '✏️' : '✂️'}
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
            {layout === 'draw' ? 'Намалюй' : 'Виріж'}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center' }}>→</Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '4rem', mb: 1 }}>📦</Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
            Розклади
          </Typography>
        </Box>
      </Box>

      {/* Items to sort */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.6rem', mb: 2, textAlign: 'center' }}>
          {layout === 'cutout' ? 'Виріж ці картинки:' : 'Подивись на картинки:'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            p: 3,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            border: layout === 'cutout' ? '4px dashed #FF9800' : '4px solid #4CAF50',
          }}
        >
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#F5F5F5',
                border: layout === 'cutout' ? '3px dashed #FF9800' : '3px solid #E0E0E0',
                borderRadius: 2,
                p: 1,
              }}
            >
              {layout === 'cutout' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: -12,
                    bgcolor: '#FFE066',
                    border: '2px solid #FF9800',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                  }}
                >
                  ✂️
                </Box>
              )}
              <Typography sx={{ fontSize: '4rem' }}>{item.emoji}</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Sorting categories */}
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {categories.map((category) => (
          <Box
            key={category.id}
            sx={{
              flex: 1,
              maxWidth: 400,
              p: 4,
              bgcolor: category.color,
              border: '5px solid ' + category.color,
              borderRadius: 3,
              minHeight: 300,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                border: '3px solid rgba(0,0,0,0.1)',
              }}
            >
              <Typography sx={{ fontSize: '3rem' }}>{category.emoji}</Typography>
              <Typography variant="h5" fontWeight="900" sx={{ fontSize: '1.8rem' }}>
                {category.name}
              </Typography>
            </Box>

            {/* Empty boxes for sorting */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: '100%',
                    height: 100,
                    bgcolor: 'rgba(255,255,255,0.5)',
                    border: '3px dashed rgba(0,0,0,0.3)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '3rem', opacity: 0.3 }}>
                    {layout === 'draw' ? '✏️' : '📋'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
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
          ✨ Чудово розклав! Усе по місцях! ✨
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
          🖨️ Роздрукуй та сортуй! 📦
        </Typography>
      </Box>
    </Paper>
  );
};

export default SortingWorksheet;

