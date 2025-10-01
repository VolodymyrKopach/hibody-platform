'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface ShortAnswerItem {
  number: number;
  question: string;
  lines: number;
}

interface ShortAnswerProps {
  items: ShortAnswerItem[];
  isSelected?: boolean;
  onEdit?: (properties: { items: ShortAnswerItem[] }) => void;
  onFocus?: () => void;
}

const ShortAnswer: React.FC<ShortAnswerProps> = ({ 
  items,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<ShortAnswerItem[]>(items);
  const questionRef = useRef<HTMLDivElement>(null);

  // Sync with external changes
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Focus when editing starts
  useEffect(() => {
    if (editingQuestion !== null && questionRef.current) {
      questionRef.current.focus();
      // Select all text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(questionRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingQuestion]);

  const handleQuestionBlur = (itemNumber: number) => {
    const text = questionRef.current?.textContent || '';
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.number === itemNumber ? { ...item, question: text.trim() } : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingQuestion(null);
  };

  const handleQuestionKeyDown = (e: React.KeyboardEvent, itemNumber: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuestionBlur(itemNumber);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingQuestion(null);
      setLocalItems(items); // Reset
    }
  };

  const handleQuestionDoubleClick = (itemNumber: number) => {
    if (isSelected && onEdit) {
      setEditingQuestion(itemNumber);
    }
  };

  const handleQuestionClick = (itemNumber: number) => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {localItems.map((item) => (
          <Box key={item.number}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
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
                  mt: 0.25,
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                  {item.number}
                </Typography>
              </Box>

              {/* Question and Answer Lines */}
              <Box sx={{ flex: 1 }}>
                {editingQuestion === item.number ? (
                  <Box
                    ref={questionRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleQuestionBlur(item.number)}
                    onKeyDown={(e) => handleQuestionKeyDown(e, item.number)}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      mb: 1.5,
                    }}
                  >
                    {item.question}
                  </Box>
                ) : (
                  <Typography
                    onClick={() => handleQuestionClick(item.number)}
                    onDoubleClick={() => handleQuestionDoubleClick(item.number)}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      mb: 1.5,
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#F9FAFB',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '-4px -8px 12px -8px',
                      } : {},
                    }}
                  >
                    {item.question}
                  </Typography>
                )}

                {/* Answer Lines */}
                <Stack spacing={1.5}>
                  {Array.from({ length: item.lines || 3 }).map((_, lineIndex) => (
                    <Box
                      key={lineIndex}
                      sx={{
                        width: '100%',
                        height: '1px',
                        borderBottom: '2px solid #D1D5DB',
                        position: 'relative',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ShortAnswer;

