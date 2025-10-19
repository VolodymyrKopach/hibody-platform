'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface TitleBlockProps {
  text: string;
  level?: 'main' | 'section' | 'exercise';
  align?: 'left' | 'center' | 'right';
  color?: string;
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
  theme?: ThemeName;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ 
  text, 
  level = 'main',
  align = 'center',
  color,
  isSelected = false,
  onEdit,
  onFocus,
  theme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isInitialEditRef = useRef(true);
  
  // Apply theme
  const componentTheme = useComponentTheme(theme);

  const getFontSize = () => {
    if (componentTheme.typography) {
      switch (level) {
        case 'main': return `${componentTheme.typography.fontSize.xlarge}px`;
        case 'section': return `${componentTheme.typography.fontSize.large}px`;
        case 'exercise': return `${componentTheme.typography.fontSize.medium}px`;
        default: return `${componentTheme.typography.fontSize.large}px`;
      }
    }
    // Fallback
    switch (level) {
      case 'main': return '28px';
      case 'section': return '20px';
      case 'exercise': return '16px';
      default: return '20px';
    }
  };

  const getFontWeight = () => {
    if (componentTheme.typography) {
      return level === 'exercise' 
        ? componentTheme.typography.fontWeight.medium
        : componentTheme.typography.fontWeight.bold;
    }
    return level === 'exercise' ? 600 : 700;
  };
  
  const getColor = () => {
    if (color) return color;
    return componentTheme.colors?.primary || '#1F2937';
  };
  
  const getFontFamily = () => {
    return componentTheme.typography?.fontFamily || 'Inter, sans-serif';
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
      
      // Guard against undefined/null
      if (newText === undefined || newText === null || newText === 'undefined') {
        return;
      }
      
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
            color: getColor(),
            fontFamily: getFontFamily(),
            outline: 'none',
            borderRadius: `${componentTheme.borderRadius?.sm || 4}px`,
            background: alpha(componentTheme.colors?.primary || '#2563EB', 0.05),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            transition: `all ${componentTheme.animations?.duration.fast || 200}ms`,
            '&:focus': {
              background: alpha(componentTheme.colors?.primary || '#2563EB', 0.08),
            },
          }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            textAlign: align,
            color: getColor(),
            fontFamily: getFontFamily(),
            lineHeight: componentTheme.typography?.lineHeight || 1.5,
            transition: `all ${componentTheme.animations?.duration.fast || 200}ms`,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default TitleBlock;

