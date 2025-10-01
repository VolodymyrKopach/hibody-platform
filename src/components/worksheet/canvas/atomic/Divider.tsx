'use client';

import React from 'react';
import { Box } from '@mui/material';

interface DividerProps {
  style?: 'solid' | 'dashed' | 'dotted' | 'double';
  thickness?: number;
  color?: string;
  spacing?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  onEdit?: (properties: { style?: string; thickness?: number; color?: string; spacing?: string }) => void;
  onFocus?: () => void;
}

const Divider: React.FC<DividerProps> = ({ 
  style = 'solid',
  thickness = 1,
  color = '#D1D5DB',
  spacing = 'medium',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const getSpacingValue = () => {
    switch (spacing) {
      case 'small':
        return { my: 1 };
      case 'large':
        return { my: 4 };
      case 'medium':
      default:
        return { my: 2 };
    }
  };

  const getBorderStyle = () => {
    switch (style) {
      case 'dashed':
        return 'dashed';
      case 'dotted':
        return 'dotted';
      case 'double':
        return 'double';
      case 'solid':
      default:
        return 'solid';
    }
  };

  return (
    <Box
      onClick={() => onFocus?.()}
      sx={{
        ...getSpacingValue(),
        width: '100%',
        cursor: isSelected && onEdit ? 'pointer' : 'default',
        position: 'relative',
        '&:hover': isSelected && onEdit ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            border: `2px solid ${isSelected ? '#2563EB' : 'rgba(37, 99, 235, 0.3)'}`,
            borderRadius: '4px',
            pointerEvents: 'none',
          },
        } : {},
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 0,
          borderTop: `${thickness}px ${getBorderStyle()} ${color}`,
        }}
      />
    </Box>
  );
};

export default Divider;

