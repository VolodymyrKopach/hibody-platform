'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { RichTextEditor } from '../shared/RichTextEditor';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface WarningBoxProps {
  text: string;
  title?: string;
  type?: 'grammar' | 'time' | 'difficulty' | 'common-mistake';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
  theme?: ThemeName;
}

const WarningBox: React.FC<WarningBoxProps> = ({ 
  text,
  title = 'Warning',
  type = 'grammar',
  isSelected = false,
  onEdit,
  onFocus,
  theme: themeName,
}) => {
  const muiTheme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Apply component theme
  const componentTheme = useComponentTheme(themeName);

  const getIcon = () => {
    switch (type) {
      case 'time': return '⏰';
      case 'difficulty': return '🔥';
      case 'common-mistake': return '❗';
      default: return '⚠️';
    }
  };

  const handleChange = (html: string) => {
    // Guard against undefined/null
    if (html === undefined || html === null || html === 'undefined') {
      return;
    }
    
    onEdit?.(html);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && isSelected) {
      setIsEditing(true);
      onFocus?.();
    } else if (!isSelected) {
      onFocus?.();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onFocus?.();
  };

  return (
    <Box
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      sx={{
        p: `${componentTheme.spacing?.md || 16}px`,
        borderRadius: `${componentTheme.borderRadius?.md || 8}px`,
        background: alpha(componentTheme.colors?.warning || '#EA580C', 0.05),
        borderLeft: `4px solid ${componentTheme.colors?.warning || '#EA580C'}`,
        cursor: onEdit ? 'pointer' : 'default',
        transition: `all ${componentTheme.animations?.duration.fast || 200}ms`,
        position: 'relative',
        '&:hover': onEdit ? {
          boxShadow: `0 0 0 2px ${alpha(componentTheme.colors?.warning || '#EA580C', 0.2)}`,
        } : {},
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem', flexShrink: 0, mt: 0.5 }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: `${componentTheme.typography?.fontSize.small || 13}px`,
              fontWeight: componentTheme.typography?.fontWeight.medium || 600,
              color: componentTheme.colors?.warning || '#EA580C',
              mb: 0.5,
              fontFamily: componentTheme.typography?.fontFamily || 'Inter, sans-serif',
            }}
          >
            {title}
          </Typography>
          {isEditing ? (
            <RichTextEditor
              content={text}
              onChange={handleChange}
              onFinishEditing={handleFinishEditing}
              isEditing={true}
              minHeight="40px"
              fontSize="13px"
              placeholder="Enter warning..."
            />
          ) : (
            <Box
              sx={{
                fontSize: `${componentTheme.typography?.fontSize.small || 13}px`,
                color: componentTheme.colors?.text.primary || '#374151',
                lineHeight: componentTheme.typography?.lineHeight || 1.5,
                fontFamily: componentTheme.typography?.fontFamily || 'Inter, sans-serif',
                minHeight: '20px',
                cursor: isSelected ? 'text' : 'inherit',
                '& p': {
                  margin: 0,
                  marginBottom: '0.5em',
                  '&:last-child': {
                    marginBottom: 0,
                  },
                },
                '& ul, & ol': {
                  paddingLeft: '1.5em',
                  marginTop: '0.5em',
                  marginBottom: '0.5em',
                },
                '& li': {
                  marginBottom: '0.25em',
                },
                '& strong, & b': {
                  fontWeight: 700,
                },
                '& em, & i': {
                  fontStyle: 'italic',
                },
                '& u': {
                  textDecoration: 'underline',
                },
                '& *:not([style*="color"])': {
                  color: '#374151',
                },
              }}
              dangerouslySetInnerHTML={{ __html: text || '<p style="color: #9CA3AF;">Click to edit warning</p>' }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default WarningBox;

