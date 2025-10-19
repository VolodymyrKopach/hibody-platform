'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/constants/visual-themes';

interface MatchPair {
  number: number;
  left: string;
  right: string;
}

interface MatchPairsProps {
  items: MatchPair[];
  theme?: ThemeName;
  isSelected?: boolean;
  onEdit?: (properties: { items: MatchPair[] }) => void;
  onFocus?: () => void;
}

const MatchPairs: React.FC<MatchPairsProps> = ({ 
  items,
  theme: themeName,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const componentTheme = useComponentTheme(themeName);
  const [editingItem, setEditingItem] = useState<{ number: number; side: 'left' | 'right' } | null>(null);
  const [localItems, setLocalItems] = useState<MatchPair[]>(items);
  const editRef = useRef<HTMLDivElement>(null);

  // Sync with external changes
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Focus when editing starts
  useEffect(() => {
    if (editingItem && editRef.current) {
      editRef.current.focus();
      // Select all text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingItem]);

  const handleBlur = (itemNumber: number, side: 'left' | 'right') => {
    const text = editRef.current?.textContent || '';
    
    // Guard against undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      setEditingItem(null);
      return;
    }
    
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.number === itemNumber 
          ? { ...item, [side]: text.trim() } 
          : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingItem(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemNumber: number, side: 'left' | 'right') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur(itemNumber, side);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingItem(null);
      setLocalItems(items); // Reset
    }
  };

  const handleDoubleClick = (itemNumber: number, side: 'left' | 'right') => {
    if (isSelected && onEdit) {
      setEditingItem({ number: itemNumber, side });
    }
  };

  const handleClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        {localItems.map((item) => (
          <Box key={item.number}>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Number Badge */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: componentTheme.colors.background,
                  border: `2px solid ${componentTheme.colors.accent || componentTheme.colors.primary || '#2563EB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: componentTheme.animations.quick,
                }}
              >
                <Typography sx={{ 
                  fontSize: componentTheme.typography.small, 
                  fontWeight: 600, 
                  color: componentTheme.colors.accent || componentTheme.colors.primary || '#2563EB',
                  fontFamily: componentTheme.typography.fontFamily,
                }}>
                  {item.number}
                </Typography>
              </Box>

              {/* Left Item */}
              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  backgroundColor: componentTheme.colors.background,
                  border: '1px solid #E5E7EB',
                  borderRadius: componentTheme.spacing.borderRadius,
                  transition: componentTheme.animations.quick,
                }}
              >
                {editingItem?.number === item.number && editingItem?.side === 'left' ? (
                  <Box
                    ref={editRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(item.number, 'left')}
                    onKeyDown={(e) => handleKeyDown(e, item.number, 'left')}
                    sx={{
                      fontSize: componentTheme.typography.body,
                      color: componentTheme.colors.text,
                      fontFamily: componentTheme.typography.fontFamily,
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: componentTheme.spacing.borderRadius,
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      transition: componentTheme.animations.quick,
                    }}
                  >
                    {item.left}
                  </Box>
                ) : (
                  <Typography
                    onClick={handleClick}
                    onDoubleClick={() => handleDoubleClick(item.number, 'left')}
                    sx={{
                      fontSize: componentTheme.typography.body,
                      color: componentTheme.colors.text,
                      fontFamily: componentTheme.typography.fontFamily,
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      transition: componentTheme.animations.quick,
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#FFFFFF',
                        borderRadius: componentTheme.spacing.borderRadius,
                        padding: '4px 8px',
                        margin: '-4px -8px',
                      } : {},
                    }}
                  >
                    {item.left}
                  </Typography>
                )}
              </Box>

              {/* Connection Line */}
              <Box
                sx={{
                  width: 40,
                  height: 2,
                  backgroundColor: '#CBD5E1',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#CBD5E1',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#CBD5E1',
                  },
                }}
              />

              {/* Right Item */}
              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  backgroundColor: componentTheme.colors.background,
                  border: '1px solid #E5E7EB',
                  borderRadius: componentTheme.spacing.borderRadius,
                  transition: componentTheme.animations.quick,
                }}
              >
                {editingItem?.number === item.number && editingItem?.side === 'right' ? (
                  <Box
                    ref={editRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(item.number, 'right')}
                    onKeyDown={(e) => handleKeyDown(e, item.number, 'right')}
                    sx={{
                      fontSize: componentTheme.typography.body,
                      color: componentTheme.colors.text,
                      fontFamily: componentTheme.typography.fontFamily,
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: componentTheme.spacing.borderRadius,
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      transition: componentTheme.animations.quick,
                    }}
                  >
                    {item.right}
                  </Box>
                ) : (
                  <Typography
                    onClick={handleClick}
                    onDoubleClick={() => handleDoubleClick(item.number, 'right')}
                    sx={{
                      fontSize: componentTheme.typography.body,
                      color: componentTheme.colors.text,
                      fontFamily: componentTheme.typography.fontFamily,
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      transition: componentTheme.animations.quick,
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#FFFFFF',
                        borderRadius: componentTheme.spacing.borderRadius,
                        padding: '4px 8px',
                        margin: '-4px -8px',
                      } : {},
                    }}
                  >
                    {item.right}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default MatchPairs;

