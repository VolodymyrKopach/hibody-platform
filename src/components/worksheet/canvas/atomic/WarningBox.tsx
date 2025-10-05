'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { RichTextEditor } from '../shared/RichTextEditor';

interface WarningBoxProps {
  text: string;
  title?: string;
  type?: 'grammar' | 'time' | 'difficulty' | 'common-mistake';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
}

const WarningBox: React.FC<WarningBoxProps> = ({ 
  text,
  title = 'Warning',
  type = 'grammar',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'time': return '⏰';
      case 'difficulty': return '🔥';
      case 'common-mistake': return '❗';
      default: return '⚠️';
    }
  };

  const handleChange = (html: string) => {
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
        p: 2,
        borderRadius: '8px',
        background: '#FFF7ED',
        borderLeft: '4px solid #EA580C',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': onEdit ? {
          boxShadow: `0 0 0 2px ${alpha('#EA580C', 0.2)}`,
        } : {},
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem', flexShrink: 0, mt: 0.5 }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#EA580C',
              mb: 0.5,
              fontFamily: 'Inter, sans-serif',
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
                fontSize: '13px',
                color: '#374151',
                lineHeight: 1.5,
                fontFamily: 'Inter, sans-serif',
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

