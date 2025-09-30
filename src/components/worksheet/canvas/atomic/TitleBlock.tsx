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
  const [editValue, setEditValue] = useState(text);
  const editRef = useRef<HTMLDivElement>(null);

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

  // Sync internal state with prop
  useEffect(() => {
    setEditValue(text);
  }, [text]);

  // Focus on edit start
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

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
      const newText = editRef.current.innerText.trim();
      if (newText !== text && newText !== '') {
        onEdit?.(newText);
      } else if (newText === '') {
        // Don't allow empty title, reset
        setEditValue(text);
        if (editRef.current) {
          editRef.current.innerText = text;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      editRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Cancel editing
      if (editRef.current) {
        editRef.current.innerText = text;
      }
      setEditValue(text);
      setIsEditing(false);
    }
  };

  const handleInput = () => {
    if (editRef.current) {
      setEditValue(editRef.current.innerText);
    }
  };

  return (
    <Box 
      sx={{ 
        mb: level === 'main' ? 3 : 2,
        position: 'relative',
        cursor: isSelected && !isEditing ? 'text' : 'inherit',
        '&:hover': isSelected && !isEditing ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            border: `2px dashed ${alpha('#2563EB', 0.3)}`,
            borderRadius: '4px',
            pointerEvents: 'none',
          }
        } : {},
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <Typography
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          sx={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            textAlign: align,
            color: color,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            padding: '4px 8px',
            margin: '-4px -8px',
            borderRadius: '4px',
            background: alpha('#2563EB', 0.05),
            border: `2px solid #2563EB`,
            '&:focus': {
              background: alpha('#2563EB', 0.08),
            },
          }}
        >
          {editValue}
        </Typography>
      ) : (
        <Typography
          sx={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            textAlign: align,
            color: color,
            fontFamily: 'Inter, sans-serif',
            padding: '4px 8px',
            margin: '-4px -8px',
            borderRadius: '4px',
            transition: 'background 0.2s',
            '&:hover': isSelected ? {
              background: alpha('#2563EB', 0.03),
            } : {},
          }}
        >
          {text || 'Click to edit title'}
        </Typography>
      )}
    </Box>
  );
};

export default TitleBlock;

