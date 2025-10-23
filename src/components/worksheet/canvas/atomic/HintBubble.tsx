'use client';

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { Lightbulb, AlertCircle, Info, Sparkles } from 'lucide-react';

interface HintBubbleProps {
  // Текст підказки
  text: string;
  
  // Тип підказки
  type?: 'tip' | 'warning' | 'info' | 'success';
  
  // Іконка
  icon?: 'lightbulb' | 'alert' | 'info' | 'sparkles' | 'none';
  
  // Розмір
  size?: 'small' | 'medium' | 'large';
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const HintBubble: React.FC<HintBubbleProps> = ({
  text = '💡 This is a helpful hint!',
  type = 'tip',
  icon = 'lightbulb',
  size = 'medium',
  isSelected,
  onEdit,
  onFocus,
}) => {
  // Конфігурація за типом
  const typeConfig = {
    tip: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
      textColor: '#92400E',
      iconColor: '#F59E0B',
    },
    warning: {
      backgroundColor: '#FEE2E2',
      borderColor: '#EF4444',
      textColor: '#991B1B',
      iconColor: '#EF4444',
    },
    info: {
      backgroundColor: '#DBEAFE',
      borderColor: '#3B82F6',
      textColor: '#1E40AF',
      iconColor: '#3B82F6',
    },
    success: {
      backgroundColor: '#D1FAE5',
      borderColor: '#10B981',
      textColor: '#065F46',
      iconColor: '#10B981',
    },
  };

  const config = typeConfig[type];

  // Вибір іконки
  const renderIcon = () => {
    if (icon === 'none') return null;

    const iconSize = size === 'small' ? 18 : size === 'medium' ? 22 : 26;
    const IconComponent = 
      icon === 'lightbulb' ? Lightbulb :
      icon === 'alert' ? AlertCircle :
      icon === 'info' ? Info :
      icon === 'sparkles' ? Sparkles :
      Lightbulb;

    return <IconComponent size={iconSize} color={config.iconColor} strokeWidth={2.5} />;
  };

  // Розміри
  const sizeConfig = {
    small: {
      padding: '8px 12px',
      fontSize: '0.875rem',
      borderRadius: '8px',
      borderWidth: '2px',
    },
    medium: {
      padding: '12px 16px',
      fontSize: '1rem',
      borderRadius: '12px',
      borderWidth: '2px',
    },
    large: {
      padding: '16px 20px',
      fontSize: '1.125rem',
      borderRadius: '16px',
      borderWidth: '3px',
    },
  };

  const sizeStyle = sizeConfig[size];

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: icon === 'none' ? 0 : 2,
          p: sizeStyle.padding,
          backgroundColor: config.backgroundColor,
          border: isSelected 
            ? `${sizeStyle.borderWidth} solid` 
            : `${sizeStyle.borderWidth} solid ${config.borderColor}`,
          borderColor: isSelected ? 'primary.main' : config.borderColor,
          borderRadius: sizeStyle.borderRadius,
          position: 'relative',
          '&::before': icon !== 'none' ? {
            content: '""',
            position: 'absolute',
            left: 20,
            top: -8,
            width: 16,
            height: 16,
            backgroundColor: config.backgroundColor,
            border: `${sizeStyle.borderWidth} solid ${config.borderColor}`,
            borderRight: 'none',
            borderBottom: 'none',
            transform: 'rotate(45deg)',
          } : {},
        }}
      >
        {/* Іконка */}
        {icon !== 'none' && (
          <Box
            sx={{
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            {renderIcon()}
          </Box>
        )}

        {/* Текст */}
        <Typography
          sx={{
            color: config.textColor,
            fontSize: sizeStyle.fontSize,
            lineHeight: 1.6,
            fontWeight: 500,
            flex: 1,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

export default HintBubble;

