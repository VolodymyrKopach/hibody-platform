'use client';

import React, { useState } from 'react';
import { Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RichTextEditor } from '../shared/RichTextEditor';

interface BodyTextProps {
  text: string;
  variant?: 'paragraph' | 'description' | 'example';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
}

const BodyText: React.FC<BodyTextProps> = ({ 
  text, 
  variant = 'paragraph',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const getStyles = () => {
    switch (variant) {
      case 'description':
        return { fontSize: '13px', color: '#6B7280' };
      case 'example':
        return { fontSize: '13px', color: '#4B5563' };
      default:
        return { fontSize: '14px', color: '#374151' };
    }
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

  const handleChange = (html: string) => {
    onEdit?.(html);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const styles = getStyles();

  return (
    <Box 
      sx={{
        position: 'relative',
        cursor: isSelected && !isEditing ? 'text' : 'inherit',
        transition: 'all 0.2s',
        borderRadius: '4px',
        '&:hover': isSelected && !isEditing ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
        } : {},
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <RichTextEditor
          content={text}
          onChange={handleChange}
          onFinishEditing={handleFinishEditing}
          isEditing={true}
          minHeight="60px"
          fontSize={styles.fontSize}
          placeholder="Start typing... Use toolbar for formatting"
        />
      ) : (
        <Box
          sx={{
            fontSize: styles.fontSize,
            // Don't set color here - let inline styles from HTML take precedence
            fontStyle: variant === 'example' ? 'italic' : 'normal',
            lineHeight: 1.6,
            fontFamily: 'Inter, sans-serif',
            padding: '8px 12px',
            minHeight: '40px',
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
            // Fallback color only if no inline styles present
            '& *:not([style*="color"])': {
              color: styles.color,
            },
          }}
          dangerouslySetInnerHTML={{ __html: text || '<p style="color: #9CA3AF;">Click to edit text</p>' }}
        />
      )}
    </Box>
  );
};

export default BodyText;

