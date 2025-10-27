'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Edit3, Star } from 'lucide-react';

interface TracingItem {
  type: 'number' | 'letter' | 'shape' | 'line';
  value: string | number;
  size?: number;
}

interface TracingWorksheetProps {
  items?: TracingItem[];
  title?: string;
  instruction?: string;
  showSteps?: boolean;
  difficulty?: 'easy' | 'medium';
  // TIER 1
  mascot?: string;
  borderColor?: string;
  traceColor?: string;
  backgroundColor?: string;
}

const TracingWorksheet: React.FC<TracingWorksheetProps> = ({
  items = [
    { type: 'number', value: 1, size: 200 },
    { type: 'number', value: 2, size: 200 },
    { type: 'shape', value: 'circle', size: 180 },
  ],
  title = '✏️ Обведи по пунктирній лінії',
  instruction = 'Обведи пальчиком, потім олівцем! 👆',
  showSteps = true,
  difficulty = 'easy',
  mascot = '🐼',
  borderColor = '#4CAF50',
  traceColor = '#4CAF50',
  backgroundColor = '#FFFEF8',
}) => {
  const strokeDasharray = difficulty === 'easy' ? '10 15' : '8 12';

  const renderTracingPath = (item: TracingItem) => {
    const size = item.size || 200;
    const strokeWidth = difficulty === 'easy' ? 8 : 6;

    if (item.type === 'number') {
      const paths: Record<number, string> = {
        1: `M ${size / 2},${size * 0.2} L ${size / 2},${size * 0.8}`,
        // Simplified 2 - just straight lines (easier for 3-4 years)
        2: `M ${size * 0.3},${size * 0.3} L ${size * 0.7},${size * 0.3} L ${size * 0.7},${size * 0.5} L ${size * 0.3},${size * 0.6} L ${size * 0.7},${size * 0.8}`,
        // Simplified 3 - two horizontal arcs instead of curves
        3: `M ${size * 0.3},${size * 0.3} L ${size * 0.65},${size * 0.3} L ${size * 0.65},${size * 0.5} L ${size * 0.3},${size * 0.5} M ${size * 0.3},${size * 0.5} L ${size * 0.65},${size * 0.5} L ${size * 0.65},${size * 0.75} L ${size * 0.3},${size * 0.75}`,
      };
      return paths[item.value as number] || paths[1];
    }

    if (item.type === 'shape') {
      if (item.value === 'circle') {
        return `M ${size / 2},${size * 0.2} A ${size * 0.3},${size * 0.3} 0 1,1 ${size / 2},${size * 0.21}`;
      }
      if (item.value === 'square') {
        return `M ${size * 0.25},${size * 0.25} L ${size * 0.75},${size * 0.25} L ${size * 0.75},${size * 0.75} L ${size * 0.25},${size * 0.75} Z`;
      }
    }

    return `M ${size * 0.2},${size / 2} L ${size * 0.8},${size / 2}`;
  };

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
        🐼
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Edit3 size={48} strokeWidth={3} color="#4CAF50" />
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

      {/* Steps instruction */}
      {showSteps && (
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
            <Typography sx={{ fontSize: '3rem', mb: 1 }}>👆</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
              Обведи пальчиком
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '2.5rem', color: '#4CAF50' }}>
            →
          </Box>

          <Box sx={{ textAlign: 'center' }}>
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
            <Typography sx={{ fontSize: '3rem', mb: 1 }}>✏️</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
              Обведи олівцем
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tracing items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #4CAF50',
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* Item number badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 20,
                bgcolor: '#FF6B9D',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '4px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {index + 1}
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.6rem', mb: 3, color: '#555' }}>
              {item.type === 'number' ? `Цифра ${item.value}` : 
               item.type === 'shape' && item.value === 'circle' ? 'Коло ⭕' :
               item.type === 'shape' && item.value === 'square' ? 'Квадрат ⬜' : 'Лінія'}
            </Typography>

            {/* Tracing SVG */}
            <Box
              sx={{
                width: item.size || 200,
                height: item.size || 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FAFAFA',
                borderRadius: 2,
                border: '3px dashed #C8E6C9',
              }}
            >
              <svg width={item.size || 200} height={item.size || 200}>
                <path
                  d={renderTracingPath(item)}
                  stroke="#4CAF50"
                  strokeWidth={difficulty === 'easy' ? 8 : 6}
                  strokeDasharray={strokeDasharray}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
          🌟 Молодець! Ти чудово обводиш! 🌟
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
          🖨️ Роздрукуй та обводь олівцем ✏️
        </Typography>
      </Box>
    </Paper>
  );
};

export default TracingWorksheet;

