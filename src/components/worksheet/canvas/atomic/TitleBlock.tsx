'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';

interface TitleBlockProps {
  text: string;
  level?: 'main' | 'section' | 'exercise';
  align?: 'left' | 'center' | 'right';
  color?: string;
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ 
  text, 
  level = 'main',
  align = 'center',
  color = '#1F2937',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isInitialEditRef = useRef(true);

  const getFontSize = () => {
    switch (level) {
      case 'main': return '28px';
      case 'section': return '20px';
      case 'exercise': return '16px';
      default: return '20px';
    }
  };

  const getFontWeight = () => {
    return level === 'exercise' ? 600 : 700;
  };

  // Focus on edit start - only set content once
  useEffect(() => {
    if (isEditing && editRef.current) {
      // Set the text content only on initial edit
      editRef.current.textContent = text;
      
      // Focus and select all
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      isInitialEditRef.current = false;
    } else if (!isEditing) {
      isInitialEditRef.current = true;
    }
  }, [isEditing, text]);

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

  const handleBlur = () => {
    setIsEditing(false);
    if (editRef.current) {
      const newText = editRef.current.textContent?.trim() || '';
      if (newText !== text && newText !== '') {
        onEdit?.(newText);
      }
      // If empty, just exit - the text prop will be displayed
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      editRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Cancel editing - reset to original text
      if (editRef.current) {
        editRef.current.textContent = text;
      }
      setIsEditing(false);
    }
  };

  return (
    <Box 
      sx={{ 
        mb: level === 'main' ? 3 : 2,
        position: 'relative',
        cursor: isSelected && !isEditing ? 'text' : 'inherit',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <Box
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          sx={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            textAlign: align,
            color: color,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            borderRadius: '4px',
            background: alpha('#2563EB', 0.05),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            '&:focus': {
              background: alpha('#2563EB', 0.08),
            },
          }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            textAlign: align,
            color: color,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {text || 'Click to edit title'}
        </Typography>
      )}
    </Box>
  );
};

export default TitleBlock;

