'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface BulletListItem {
  id: string;
  text: string;
}

interface BulletListProps {
  items: BulletListItem[];
  style?: 'dot' | 'circle' | 'square';
  isSelected?: boolean;
  onEdit?: (properties: { items?: BulletListItem[]; style?: string }) => void;
  onFocus?: () => void;
}

const BulletList: React.FC<BulletListProps> = ({
  items,
  style = 'dot',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<BulletListItem[]>(items);
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

  const getBulletStyle = () => {
    switch (style) {
      case 'circle':
        return {
          width: 6,
          height: 6,
          borderRadius: '50%',
          border: '2px solid #374151',
          backgroundColor: 'transparent',
        };
      case 'square':
        return {
          width: 6,
          height: 6,
          borderRadius: '1px',
          backgroundColor: '#374151',
        };
      case 'dot':
      default:
        return {
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#374151',
        };
    }
  };

  return (
    <Box onClick={handleClick}>
      <Stack spacing={1}>
        {localItems.map((item) => (
          <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                ...getBulletStyle(),
                flexShrink: 0,
                mt: 0.75,
              }}
            />
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

export default BulletList;

