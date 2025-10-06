'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface NumberedListItem {
  id: string;
  text: string;
}

interface NumberedListProps {
  items: NumberedListItem[];
  style?: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
  isSelected?: boolean;
  onEdit?: (properties: { items?: NumberedListItem[]; style?: string }) => void;
  onFocus?: () => void;
}

const NumberedList: React.FC<NumberedListProps> = ({
  items,
  style = 'decimal',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<NumberedListItem[]>(items);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (editingItemId !== null && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingItemId]);

  const handleBlur = (itemId: string) => {
    const text = textRef.current?.textContent || '';
    
    // Захист від undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      console.warn('⚠️ [NumberedList handleBlur] Received undefined/null text, skipping update');
      setEditingItemId(null);
      return;
    }
    
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.id === itemId ? { ...item, text: text.trim() } : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingItemId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur(itemId);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingItemId(null);
      setLocalItems(items); // Reset
    }
  };

  const handleDoubleClick = (itemId: string) => {
    if (isSelected && onEdit) {
      setEditingItemId(itemId);
    }
  };

  const handleClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const getNumberLabel = (index: number): string => {
    const num = index + 1;
    switch (style) {
      case 'lower-alpha':
        return String.fromCharCode(96 + num); // a, b, c...
      case 'upper-alpha':
        return String.fromCharCode(64 + num); // A, B, C...
      case 'lower-roman':
        return toRoman(num).toLowerCase(); // i, ii, iii...
      case 'upper-roman':
        return toRoman(num); // I, II, III...
      case 'decimal':
      default:
        return num.toString(); // 1, 2, 3...
    }
  };

  const toRoman = (num: number): string => {
    const romanNumerals: [number, string][] = [
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ];
    let result = '';
    for (const [value, numeral] of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  return (
    <Box onClick={handleClick}>
      <Stack spacing={1}>
        {localItems.map((item, index) => (
          <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#2563EB',
                fontFamily: 'Inter, sans-serif',
                minWidth: '24px',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              {getNumberLabel(index)}.
            </Typography>
            {editingItemId === item.id ? (
              <Box
                ref={textRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={() => handleBlur(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                  flex: 1,
                  outline: 'none',
                  border: '1px solid #2563EB',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {item.text}
              </Box>
            ) : (
              <Typography
                onClick={() => handleClick()}
                onDoubleClick={() => handleDoubleClick(item.id)}
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                  flex: 1,
                  cursor: isSelected && onEdit ? 'text' : 'default',
                  lineHeight: 1.6,
                  '&:hover': isSelected && onEdit ? {
                    backgroundColor: '#F9FAFB',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    margin: '-4px -8px',
                  } : {},
                }}
              >
                {item.text}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default NumberedList;

