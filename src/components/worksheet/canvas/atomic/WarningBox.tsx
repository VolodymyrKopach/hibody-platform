'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';

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
  const [localText, setLocalText] = useState(text);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const getIcon = () => {
    switch (type) {
      case 'time': return '⏰';
      case 'difficulty': return '🔥';
      case 'common-mistake': return '❗';
      default: return '⚠️';
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
        <Typography sx={{ fontSize: '1.2rem', flexShrink: 0 }}>{getIcon()}</Typography>
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
              outline: isEditing ? '2px solid #EA580C' : 'none',
              borderRadius: isEditing ? '4px' : '0',
              padding: isEditing ? '4px' : '0',
              background: isEditing ? 'white' : 'transparent',
              minHeight: '20px',
              '&:focus': {
                outline: '2px solid #EA580C',
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

export default WarningBox;

