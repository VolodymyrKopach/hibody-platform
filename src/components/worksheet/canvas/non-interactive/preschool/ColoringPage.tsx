'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Palette, Star } from 'lucide-react';

interface ColoringItem {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'flower' | 'apple' | 'sun' | 
         'moon' | 'cloud' | 'tree' | 'house' | 'balloon' | 'car' | 'fish' | 'butterfly' | 'custom';
  label: string;
  color: string;
  colorEmoji: string;
  colorHex?: string;
  size?: number;
  customSvg?: string;
}

interface ColoringPageProps {
  items?: ColoringItem[];
  title?: string;
  instruction?: string;
  // TIER 1 - Core customization
  mascot?: string;
  borderColor?: string;
  stepNumberColor?: string;
  backgroundColor?: string;
}

const ColoringPage: React.FC<ColoringPageProps> = ({
  items: rawItems = [
    { shape: 'apple', label: 'Розфарбуй яблуко', color: 'Червоним', colorEmoji: '🔴', size: 220 },
    { shape: 'sun', label: 'Розфарбуй сонечко', color: 'Жовтим', colorEmoji: '🟡', size: 200 },
    { shape: 'heart', label: 'Розфарбуй серце', color: 'Рожевим', colorEmoji: '🩷', size: 200 },
  ],
  title = '🎨 Розмальовка',
  instruction = 'Розфарбуй картинки кольоровими олівцями! 🖍️',
  mascot = '🐻',
  borderColor = '#FF6B9D',
  stepNumberColor = '#FF6B9D',
  backgroundColor = '#FFFFFF',
}) => {
  // Validate: max 3 items for 3-4 years, clamp size
  const items = rawItems.slice(0, 3).map(item => ({
    ...item,
    size: Math.min(Math.max(item.size || 200, 150), 300),
  }));
  const renderShape = (shape: string, size: number) => {
    const commonProps = {
      stroke: '#000000',
      strokeWidth: 5,
      fill: 'transparent',
    };

    switch (shape) {
      case 'circle':
        return (
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 5} {...commonProps} />
        );
      case 'square':
        return (
          <rect x="5" y="5" width={size - 10} height={size - 10} {...commonProps} />
        );
      case 'triangle':
        return (
          <polygon
            points={`${size / 2},10 ${size - 10},${size - 10} 10,${size - 10}`}
            {...commonProps}
          />
        );
      case 'star':
        return (
          <path
            d={`M${size / 2},10 L${size / 2 + 10},${size / 2 - 5} L${size - 10},${size / 2} L${
              size / 2 + 10
            },${size / 2 + 10} L${size / 2},${size - 10} L${size / 2 - 10},${size / 2 + 10} L10,${
              size / 2
            } L${size / 2 - 10},${size / 2 - 5} Z`}
            {...commonProps}
          />
        );
      case 'heart':
        return (
          <path
            d={`M${size / 2},${size - 10} C${size / 2},${size - 10} 10,${size / 2} 10,${
              size / 3
            } C10,15 ${size / 4},10 ${size / 2},${size / 4} C${size * 0.75},10 ${size - 10},15 ${
              size - 10
            },${size / 3} C${size - 10},${size / 2} ${size / 2},${size - 10} ${size / 2},${
              size - 10
            } Z`}
            {...commonProps}
          />
        );
      case 'flower':
        return (
          <g>
            <circle cx={size / 2} cy={size / 2} r={15} {...commonProps} />
            <circle cx={size / 2} cy={size / 2 - 25} r={18} {...commonProps} />
            <circle cx={size / 2 + 22} cy={size / 2 - 12} r={18} {...commonProps} />
            <circle cx={size / 2 + 22} cy={size / 2 + 12} r={18} {...commonProps} />
            <circle cx={size / 2} cy={size / 2 + 25} r={18} {...commonProps} />
            <circle cx={size / 2 - 22} cy={size / 2 + 12} r={18} {...commonProps} />
            <circle cx={size / 2 - 22} cy={size / 2 - 12} r={18} {...commonProps} />
          </g>
        );
      case 'apple':
        return (
          <g>
            <ellipse cx={size / 2} cy={size / 2 + 10} rx={35} ry={40} {...commonProps} />
            <path
              d={`M${size / 2 - 5},${size / 2 - 25} Q${size / 2 - 5},${size / 2 - 40} ${
                size / 2
              },${size / 2 - 35}`}
              {...commonProps}
              fill="transparent"
            />
            <ellipse
              cx={size / 2 + 10}
              cy={size / 2 - 35}
              rx={12}
              ry={8}
              {...commonProps}
            />
          </g>
        );
      case 'sun':
        return (
          <g>
            <circle cx={size / 2} cy={size / 2} r={25} {...commonProps} />
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const x1 = size / 2 + Math.cos(angle) * 30;
              const y1 = size / 2 + Math.sin(angle) * 30;
              const x2 = size / 2 + Math.cos(angle) * 45;
              const y2 = size / 2 + Math.sin(angle) * 45;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#000000"
                  strokeWidth={3}
                />
              );
            })}
          </g>
        );
      case 'moon':
        return (
          <path
            d={`M${size / 2 + 15},${size / 2 - 40} A40,40 0 1,0 ${size / 2 + 15},${size / 2 + 40} A30,30 0 1,1 ${size / 2 + 15},${size / 2 - 40}`}
            {...commonProps}
          />
        );
      case 'cloud':
        return (
          <g>
            <ellipse cx={size / 2} cy={size / 2} rx={40} ry={25} {...commonProps} />
            <ellipse cx={size / 2 - 25} cy={size / 2 - 5} rx={25} ry={20} {...commonProps} />
            <ellipse cx={size / 2 + 25} cy={size / 2 - 5} rx={25} ry={20} {...commonProps} />
          </g>
        );
      case 'tree':
        return (
          <g>
            {/* Trunk */}
            <rect x={size / 2 - 10} y={size / 2 + 10} width={20} height={30} {...commonProps} />
            {/* Crown - triangle */}
            <polygon
              points={`${size / 2},${size / 2 - 30} ${size / 2 - 40},${size / 2 + 15} ${size / 2 + 40},${size / 2 + 15}`}
              {...commonProps}
            />
          </g>
        );
      case 'house':
        return (
          <g>
            {/* Base */}
            <rect x={size / 2 - 35} y={size / 2 - 10} width={70} height={50} {...commonProps} />
            {/* Roof */}
            <polygon
              points={`${size / 2},${size / 2 - 40} ${size / 2 - 45},${size / 2 - 10} ${size / 2 + 45},${size / 2 - 10}`}
              {...commonProps}
            />
            {/* Door */}
            <rect x={size / 2 - 10} y={size / 2 + 10} width={20} height={30} {...commonProps} />
          </g>
        );
      case 'balloon':
        return (
          <g>
            {/* Balloon */}
            <ellipse cx={size / 2} cy={size / 2 - 10} rx={30} ry={40} {...commonProps} />
            {/* String */}
            <line
              x1={size / 2}
              y1={size / 2 + 30}
              x2={size / 2}
              y2={size / 2 + 60}
              stroke="#000000"
              strokeWidth={2}
            />
          </g>
        );
      case 'car':
        return (
          <g>
            {/* Body */}
            <rect x={size / 2 - 40} y={size / 2} width={80} height={25} {...commonProps} />
            {/* Top */}
            <rect x={size / 2 - 20} y={size / 2 - 20} width={40} height={20} {...commonProps} />
            {/* Wheels */}
            <circle cx={size / 2 - 25} cy={size / 2 + 30} r={10} {...commonProps} />
            <circle cx={size / 2 + 25} cy={size / 2 + 30} r={10} {...commonProps} />
          </g>
        );
      case 'fish':
        return (
          <g>
            {/* Body */}
            <ellipse cx={size / 2} cy={size / 2} rx={35} ry={25} {...commonProps} />
            {/* Tail */}
            <polygon
              points={`${size / 2 + 35},${size / 2} ${size / 2 + 55},${size / 2 - 20} ${size / 2 + 55},${size / 2 + 20}`}
              {...commonProps}
            />
            {/* Eye */}
            <circle cx={size / 2 - 15} cy={size / 2 - 5} r={5} {...commonProps} />
          </g>
        );
      case 'butterfly':
        return (
          <g>
            {/* Body */}
            <ellipse cx={size / 2} cy={size / 2} rx={5} ry={30} {...commonProps} />
            {/* Upper wings */}
            <ellipse cx={size / 2 - 18} cy={size / 2 - 15} rx={20} ry={25} {...commonProps} />
            <ellipse cx={size / 2 + 18} cy={size / 2 - 15} rx={20} ry={25} {...commonProps} />
            {/* Lower wings */}
            <ellipse cx={size / 2 - 15} cy={size / 2 + 15} rx={15} ry={20} {...commonProps} />
            <ellipse cx={size / 2 + 15} cy={size / 2 + 15} rx={15} ry={20} {...commonProps} />
          </g>
        );
      default:
        return <circle cx={size / 2} cy={size / 2} r={size / 2 - 5} {...commonProps} />;
    }
  };

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
        background: `linear-gradient(135deg, #FFF9E6 0%, ${backgroundColor} 100%)`,
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
          <Palette size={48} strokeWidth={3} color="#FF6B9D" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#FF6B9D',
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

      {/* Coloring Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              p: 3,
              border: '4px dashed #FFB84D',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* Step number */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 20,
                bgcolor: stepNumberColor,
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

            {/* Shape to color */}
            <Box
              sx={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FFFFFF',
                border: '4px solid #000000',
                borderRadius: 2,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {item.shape === 'custom' && item.customSvg ? (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    '& svg': {
                      width: '100%',
                      height: '100%',
                      display: 'block',
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: item.customSvg }}
                />
              ) : (
                <svg 
                  width={200} 
                  height={200}
                  viewBox="0 0 200 200"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {renderShape(item.shape, 200)}
                </svg>
              )}
            </Box>

            {/* Arrow pointing to color */}
            <Box
              sx={{
                fontSize: '3rem',
                color: '#FFB84D',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              →
            </Box>

            {/* Label with color indicator */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight="900"
                sx={{
                  fontSize: '2rem',
                  color: '#333',
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: '#FFF9E6',
                  borderRadius: 2,
                  border: '3px solid #FFB84D',
                }}
              >
                <Typography sx={{ fontSize: '3.5rem' }}>{item.colorEmoji}</Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: '1.8rem', color: '#FF6B9D' }}
                >
                  {item.color}
                </Typography>
              </Box>
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
          sx={{ fontSize: '1.8rem', color: '#2E7D32', mb: 1 }}
        >
          🌟 Молодець! Ти чудово розфарбовуєш! 🌟
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
          🖨️ Роздрукуй та розфарбуй олівцями 🖍️
        </Typography>
      </Box>
    </Paper>
  );
};

export default ColoringPage;

