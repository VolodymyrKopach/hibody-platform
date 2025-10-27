'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Shapes, Star } from 'lucide-react';

type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'rectangle';

interface ShapeTask {
  type: 'find' | 'color' | 'cutout' | 'match';
  shapes: Array<{
    shape: ShapeType;
    color?: string;
    size?: number;
  }>;
  instruction: string;
}

interface ShapesTemplateProps {
  tasks?: ShapeTask[];
  title?: string;
  instruction?: string;
  includeColorKey?: boolean;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  shapeColor?: string;
  backgroundColor?: string;
}

const ShapesTemplate: React.FC<ShapesTemplateProps> = ({
  tasks = [
    {
      type: 'find',
      shapes: [
        { shape: 'circle', size: 80 },
        { shape: 'square', size: 80 },
        { shape: 'circle', size: 80 },
        { shape: 'triangle', size: 80 },
        { shape: 'circle', size: 80 },
      ],
      instruction: 'Обведи усі кола:',
    },
    {
      type: 'color',
      shapes: [
        { shape: 'circle', color: 'Червоний', size: 100 },
        { shape: 'square', color: 'Синій', size: 100 },
        { shape: 'triangle', color: 'Жовтий', size: 100 },
      ],
      instruction: 'Розфарбуй за підказками:',
    },
  ],
  title = '⭐ Форми та фігури',
  instruction = 'Вивчай форми та виконуй завдання! 🔷',
  includeColorKey = true,
  mascot = '🦊',
  borderColor = '#FF9800',
  shapeColor = '#FF9800',
  backgroundColor = '#FFFEF8',
}) => {
  const renderShape = (shape: ShapeType, size: number) => {
    const strokeWidth = 5;
    const commonProps = {
      stroke: '#000000',
      strokeWidth,
      fill: 'transparent',
    };

    switch (shape) {
      case 'circle':
        return <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} {...commonProps} />;
      case 'square':
        return <rect x="10" y="10" width={size - 20} height={size - 20} {...commonProps} />;
      case 'triangle':
        return (
          <polygon
            points={`${size / 2},15 ${size - 15},${size - 15} 15,${size - 15}`}
            {...commonProps}
          />
        );
      case 'star':
        const cx = size / 2;
        const cy = size / 2;
        const outerRadius = size / 2 - 10;
        const innerRadius = outerRadius / 2.5;
        const points = Array.from({ length: 10 }).map((_, i) => {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
        });
        return <polygon points={points.join(' ')} {...commonProps} />;
      case 'heart':
        return (
          <path
            d={`M${size / 2},${size - 10} C${size / 2},${size - 10} 10,${size / 2} 10,${size / 3} C10,15 ${size / 4},10 ${size / 2},${size / 4} C${size * 0.75},10 ${size - 10},15 ${size - 10},${size / 3} C${size - 10},${size / 2} ${size / 2},${size - 10} ${size / 2},${size - 10} Z`}
            {...commonProps}
          />
        );
      case 'rectangle':
        return (
          <rect x="10" y={size / 4} width={size - 20} height={size / 2} {...commonProps} />
        );
      default:
        return null;
    }
  };

  const getShapeEmoji = (shape: ShapeType): string => {
    const emojis: Record<ShapeType, string> = {
      circle: '⭕',
      square: '⬜',
      triangle: '🔺',
      star: '⭐',
      heart: '❤️',
      rectangle: '▭',
    };
    return emojis[shape] || '⭕';
  };

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
        🦊
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Shapes size={48} strokeWidth={3} color="#FF9800" />
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

      {/* Color key if needed */}
      {includeColorKey && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mb: 4,
            p: 3,
            bgcolor: '#FFF9E6',
            borderRadius: 3,
            border: '3px solid #FFB84D',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '3rem' }}>🔴</Box>
            <Typography variant="h6" fontWeight="bold">Червоний</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '3rem' }}>🔵</Box>
            <Typography variant="h6" fontWeight="bold">Синій</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '3rem' }}>🟡</Box>
            <Typography variant="h6" fontWeight="bold">Жовтий</Typography>
          </Box>
        </Box>
      )}

      {/* Shape tasks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.map((task, taskIndex) => (
          <Box
            key={taskIndex}
            sx={{
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #FF9800',
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* Task number badge */}
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
              {taskIndex + 1}
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.6rem', mb: 3, textAlign: 'center' }}>
              {task.instruction}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 3,
                p: 3,
                bgcolor: '#FFF9E6',
                borderRadius: 2,
                border: '3px dashed #FFB84D',
              }}
            >
              {task.shapes.map((shapeItem, shapeIndex) => (
                <Box
                  key={shapeIndex}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: shapeItem.size || 100,
                      height: shapeItem.size || 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      border: task.type === 'find' ? '3px dashed #FF9800' : '3px solid #FF9800',
                    }}
                  >
                    <svg 
                      width={shapeItem.size || 100} 
                      height={shapeItem.size || 100}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {renderShape(shapeItem.shape, 100)}
                    </svg>
                  </Box>
                  {task.type === 'color' && shapeItem.color && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        bgcolor: '#FFE0B2',
                        borderRadius: 1,
                        border: '2px solid #FF9800',
                      }}
                    >
                      <Typography sx={{ fontSize: '1.5rem' }}>
                        {getShapeEmoji(shapeItem.shape)}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem' }}>→</Typography>
                      <Typography fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                        {shapeItem.color}
                      </Typography>
                    </Box>
                  )}
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
          🏆 Ти майстер форм! Чудова робота! 🏆
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
          🖨️ Роздрукуй та працюй з формами! 🔷
        </Typography>
      </Box>
    </Paper>
  );
};

export default ShapesTemplate;

