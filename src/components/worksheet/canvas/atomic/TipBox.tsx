'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { RichTextEditor } from '../shared/RichTextEditor';

interface TipBoxProps {
  text: string;
  title?: string;
  type?: 'study' | 'memory' | 'practice' | 'cultural';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
}

const TipBox: React.FC<TipBoxProps> = ({ 
  text,
  title = 'Tip',
  type = 'study',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'memory': return '🧠';
      case 'practice': return '🎯';
      case 'cultural': return '🌍';
      default: return '💡';
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
        background: '#F0F4FF',
        borderLeft: '4px solid #667EEA',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': onEdit ? {
          boxShadow: `0 0 0 2px ${alpha('#667EEA', 0.2)}`,
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
              color: '#667EEA',
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
              placeholder="Enter tip..."
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
              dangerouslySetInnerHTML={{ __html: text || '<p style="color: #9CA3AF;">Click to edit tip</p>' }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default TipBox;

