'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';

interface InstructionsBoxProps {
  text: string;
  title?: string;
  icon?: string;
  type?: 'reading' | 'writing' | 'listening' | 'speaking' | 'general';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
}

const InstructionsBox: React.FC<InstructionsBoxProps> = ({ 
  text,
  title = 'Instructions',
  icon,
  type = 'general',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'reading': return '📖';
      case 'writing': return '✏️';
      case 'listening': return '👂';
      case 'speaking': return '🗣️';
      default: return '📋';
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit && localText !== text) {
      onEdit(localText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalText(text);
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    if (onEdit) {
      setIsEditing(true);
      onFocus?.();
    }
  };

  const handleClick = () => {
    onFocus?.();
  };

  return (
    <Box
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: '8px',
        background: '#EFF6FF',
        borderLeft: '4px solid #2563EB',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': onEdit ? {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        } : {},
      }}
    >
      {isSelected && !isEditing && onEdit && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography sx={{ fontSize: '10px', fontWeight: 600, color: theme.palette.primary.main }}>
            Double-click to edit
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem', flexShrink: 0 }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#2563EB',
              mb: 0.5,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {title}
          </Typography>
          <Box
            ref={textRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={(e) => setLocalText(e.currentTarget.textContent || '')}
            sx={{
              fontSize: '13px',
              color: '#374151',
              lineHeight: 1.5,
              fontFamily: 'Inter, sans-serif',
              outline: isEditing ? `2px solid ${theme.palette.primary.main}` : 'none',
              borderRadius: isEditing ? '4px' : '0',
              padding: isEditing ? '4px' : '0',
              background: isEditing ? 'white' : 'transparent',
              minHeight: '20px',
              '&:focus': {
                outline: `2px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            {localText}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default InstructionsBox;

