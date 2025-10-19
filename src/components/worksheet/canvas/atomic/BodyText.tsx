'use client';

import React, { useState } from 'react';
import { Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RichTextEditor } from '../shared/RichTextEditor';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface BodyTextProps {
  text: string;
  variant?: 'paragraph' | 'description' | 'example';
  isSelected?: boolean;
  onEdit?: (newText: string) => void;
  onFocus?: () => void;
  theme?: ThemeName;
}

const BodyText: React.FC<BodyTextProps> = ({ 
  text, 
  variant = 'paragraph',
  isSelected = false,
  onEdit,
  onFocus,
  theme: themeName,
}) => {
  const muiTheme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Apply component theme
  const componentTheme = useComponentTheme(themeName);

  const getStyles = () => {
    const baseSize = componentTheme.typography?.fontSize.small || 14;
    const textColor = componentTheme.colors?.text.primary || '#374151';
    const secondaryColor = componentTheme.colors?.text.secondary || '#6B7280';
    
    switch (variant) {
      case 'description':
        return { fontSize: `${baseSize}px`, color: secondaryColor };
      case 'example':
        return { fontSize: `${baseSize}px`, color: textColor };
      default:
        return { fontSize: `${baseSize + 1}px`, color: textColor };
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
    // Guard against undefined/null
    if (html === undefined || html === null || html === 'undefined') {
      return;
    }
    
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
        transition: `all ${componentTheme.animations?.duration.fast || 200}ms`,
        borderRadius: `${componentTheme.borderRadius?.sm || 4}px`,
        '&:hover': isSelected && !isEditing ? {
          backgroundColor: alpha(componentTheme.colors?.primary || muiTheme.palette.primary.main, 0.03),
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
            lineHeight: componentTheme.typography?.lineHeight || 1.6,
            fontFamily: componentTheme.typography?.fontFamily || 'Inter, sans-serif',
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

