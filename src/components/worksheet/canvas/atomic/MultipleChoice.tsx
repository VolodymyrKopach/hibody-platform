'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface MultipleChoiceOption {
  letter: string;
  text: string;
}

interface MultipleChoiceItem {
  number: number;
  question: string;
  options: MultipleChoiceOption[];
}

interface MultipleChoiceProps {
  items: MultipleChoiceItem[];
  isSelected?: boolean;
  onEdit?: (properties: { items: MultipleChoiceItem[] }) => void;
  onFocus?: () => void;
  theme?: ThemeName;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ 
  items,
  isSelected = false,
  onEdit,
  onFocus,
  theme,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingOption, setEditingOption] = useState<{ itemNumber: number; letter: string } | null>(null);
  const [localItems, setLocalItems] = useState<MultipleChoiceItem[]>(items);
  const questionRef = useRef<HTMLDivElement>(null);
  const optionRef = useRef<HTMLDivElement>(null);
  
  // Apply component theme
  const componentTheme = useComponentTheme(theme);

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

  useEffect(() => {
    if (editingOption && optionRef.current) {
      optionRef.current.focus();
      // Select all text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(optionRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingOption]);

  const handleQuestionBlur = (itemNumber: number) => {
    const text = questionRef.current?.textContent || '';
    
    // Guard against undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      setEditingQuestion(null);
      return;
    }
    
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.number === itemNumber ? { ...item, question: text.trim() } : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingQuestion(null);
  };

  const handleOptionBlur = (itemNumber: number, letter: string) => {
    const text = optionRef.current?.textContent || '';
    
    // Guard against undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      setEditingOption(null);
      return;
    }
    
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.number === itemNumber
          ? {
              ...item,
              options: item.options.map(opt =>
                opt.letter === letter ? { ...opt, text: text.trim() } : opt
              ),
            }
          : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingOption(null);
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

  const handleOptionKeyDown = (e: React.KeyboardEvent, itemNumber: number, letter: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleOptionBlur(itemNumber, letter);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingOption(null);
      setLocalItems(items); // Reset
    }
  };

  const handleQuestionDoubleClick = (itemNumber: number) => {
    if (isSelected && onEdit) {
      setEditingQuestion(itemNumber);
    }
  };

  const handleOptionDoubleClick = (itemNumber: number, letter: string) => {
    if (isSelected && onEdit) {
      setEditingOption({ itemNumber, letter });
    }
  };

  const handleQuestionClick = (itemNumber: number) => {
    if (onFocus) {
      onFocus();
    }
    if (isSelected && editingQuestion === null) {
      // Single click when selected but not editing
    }
  };

  const handleOptionClick = (itemNumber: number, letter: string) => {
    if (onFocus) {
      onFocus();
    }
  };
  return (
    <Box>
      <Stack spacing={3}>
        {localItems.map((item) => (
          <Box key={item.number}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `${componentTheme.colors?.primary || '#2563EB'}15`,
                  border: `2px solid ${componentTheme.colors?.primary || '#2563EB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Typography sx={{ 
                  fontSize: `${componentTheme.typography?.fontSize.small || 12}px`, 
                  fontWeight: componentTheme.typography?.fontWeight.medium || 600, 
                  color: componentTheme.colors?.primary || '#2563EB' 
                }}>
                  {item.number}
                </Typography>
              </Box>
              
              {editingQuestion === item.number ? (
                <Box
                  ref={questionRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleQuestionBlur(item.number)}
                  onKeyDown={(e) => handleQuestionKeyDown(e, item.number)}
                  sx={{
                    fontSize: `${componentTheme.typography?.fontSize.medium || 14}px`,
                    color: componentTheme.colors?.text.primary || '#374151',
                    fontFamily: componentTheme.typography?.fontFamily || 'Inter, sans-serif',
                    flex: 1,
                    outline: 'none',
                    border: `1px solid ${componentTheme.colors?.primary || '#2563EB'}`,
                    borderRadius: `${componentTheme.borderRadius?.sm || 4}px`,
                    padding: '4px 8px',
                    backgroundColor: '#FFFFFF',
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
                    flex: 1,
                    cursor: isSelected && onEdit ? 'text' : 'default',
                    '&:hover': isSelected && onEdit ? {
                      backgroundColor: '#F9FAFB',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '-4px -8px',
                    } : {},
                  }}
                >
                  {item.question}
                </Typography>
              )}
            </Stack>

            <Stack spacing={0.75} sx={{ ml: 4 }}>
              {item.options.map((option) => (
                <Stack key={option.letter} direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid #6B7280',
                      flexShrink: 0,
                    }}
                  />
                  
                  {editingOption?.itemNumber === item.number && editingOption?.letter === option.letter ? (
                    <Box
                      sx={{
                        fontSize: '13px',
                        color: '#374151',
                        fontFamily: 'Inter, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                        {option.letter})
                      </Box>
                      <Box
                        ref={optionRef}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={() => handleOptionBlur(item.number, option.letter)}
                        onKeyDown={(e) => handleOptionKeyDown(e, item.number, option.letter)}
                        sx={{
                          outline: 'none',
                          border: '1px solid #2563EB',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          backgroundColor: '#FFFFFF',
                          minWidth: '100px',
                        }}
                      >
                        {option.text}
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      onClick={() => handleOptionClick(item.number, option.letter)}
                      onDoubleClick={() => handleOptionDoubleClick(item.number, option.letter)}
                      sx={{
                        fontSize: '13px',
                        color: '#374151',
                        fontFamily: 'Inter, sans-serif',
                        cursor: isSelected && onEdit ? 'text' : 'default',
                        '&:hover': isSelected && onEdit ? {
                          backgroundColor: '#F9FAFB',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          margin: '-2px -6px',
                        } : {},
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                        {option.letter})
                      </Box>
                      {option.text}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default MultipleChoice;

