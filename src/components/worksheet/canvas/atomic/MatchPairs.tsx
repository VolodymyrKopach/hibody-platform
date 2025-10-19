'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface MatchPair {
  number: number;
  left: string;
  right: string;
}

interface MatchPairsProps {
  items: MatchPair[];
  isSelected?: boolean;
  onEdit?: (properties: { items: MatchPair[] }) => void;
  onFocus?: () => void;
}

const MatchPairs: React.FC<MatchPairsProps> = ({ 
  items,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
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
    
    // Protection from undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      console.warn('⚠️ [MatchPairs handleBlur] Received undefined/null text, skipping update');
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
                  background: '#EFF6FF',
                  border: '2px solid #2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                  {item.number}
                </Typography>
              </Box>

              {/* Left Item */}
              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
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
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {item.left}
                  </Box>
                ) : (
                  <Typography
                    onClick={handleClick}
                    onDoubleClick={() => handleDoubleClick(item.number, 'left')}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#FFFFFF',
                        borderRadius: '4px',
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
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
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
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {item.right}
                  </Box>
                ) : (
                  <Typography
                    onClick={handleClick}
                    onDoubleClick={() => handleDoubleClick(item.number, 'right')}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#FFFFFF',
                        borderRadius: '4px',
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

