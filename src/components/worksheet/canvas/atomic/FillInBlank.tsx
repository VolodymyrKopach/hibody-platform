'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack, IconButton, TextField, Button, alpha, useTheme } from '@mui/material';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface FillInBlankItem {
  number: number;
  text: string;
  hint?: string;
}

interface FillInBlankProps {
  items: FillInBlankItem[];
  wordBank?: string[];
  isSelected?: boolean;
  onEdit?: (items: FillInBlankItem[], wordBank?: string[]) => void;
  onFocus?: () => void;
}

const FillInBlank: React.FC<FillInBlankProps> = ({ 
  items, 
  wordBank,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const theme = useTheme();
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<FillInBlankItem[]>(items);
  const [localWordBank, setLocalWordBank] = useState<string[]>(wordBank || []);
  const [newWord, setNewWord] = useState('');

  const handleAddItem = () => {
    const newItem: FillInBlankItem = {
      number: localItems.length + 1,
      text: 'New sentence with ______ blank.',
      hint: '',
    };
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    if (onEdit) {
      onEdit(updatedItems, localWordBank);
    }
  };

  const handleRemoveItem = (number: number) => {
    const updatedItems = localItems
      .filter(item => item.number !== number)
      .map((item, idx) => ({ ...item, number: idx + 1 })); // Renumber
    setLocalItems(updatedItems);
    if (onEdit) {
      onEdit(updatedItems, localWordBank);
    }
  };

  const handleItemTextChange = (number: number, newText: string) => {
    const updatedItems = localItems.map(item =>
      item.number === number ? { ...item, text: newText } : item
    );
    setLocalItems(updatedItems);
    if (onEdit) {
      onEdit(updatedItems, localWordBank);
    }
  };

  const handleItemHintChange = (number: number, newHint: string) => {
    const updatedItems = localItems.map(item =>
      item.number === number ? { ...item, hint: newHint } : item
    );
    setLocalItems(updatedItems);
    if (onEdit) {
      onEdit(updatedItems, localWordBank);
    }
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      const updatedWordBank = [...localWordBank, newWord.trim()];
      setLocalWordBank(updatedWordBank);
      setNewWord('');
      if (onEdit) {
        onEdit(localItems, updatedWordBank);
      }
    }
  };

  const handleRemoveWord = (index: number) => {
    const updatedWordBank = localWordBank.filter((_, idx) => idx !== index);
    setLocalWordBank(updatedWordBank);
    if (onEdit) {
      onEdit(localItems, updatedWordBank);
    }
  };

  const handleClick = () => {
    onFocus?.();
  };

  // Sync with props when they change
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  React.useEffect(() => {
    setLocalWordBank(wordBank || []);
  }, [wordBank]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onEdit ? {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: '8px',
        } : {},
      }}
    >
      {isSelected && onEdit && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${theme.palette.primary.main}`,
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: '10px', fontWeight: 600, color: theme.palette.primary.main }}>
            Edit in Properties →
          </Typography>
        </Box>
      )}

      {/* Word Bank */}
      {(localWordBank.length > 0 || isSelected) && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '8px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#059669',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              📚 Word Bank
            </Typography>
            {isSelected && onEdit && (
              <Typography sx={{ fontSize: '10px', color: '#059669', fontStyle: 'italic' }}>
                Click words to remove
              </Typography>
            )}
          </Stack>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: isSelected && onEdit ? 1 : 0 }}>
            {localWordBank.map((word, idx) => (
              <Box
                key={idx}
                onClick={(e) => {
                  if (isSelected && onEdit) {
                    e.stopPropagation();
                    handleRemoveWord(idx);
                  }
                }}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  background: 'white',
                  border: '1px solid #A7F3D0',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  cursor: isSelected && onEdit ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': isSelected && onEdit ? {
                    background: '#FEE2E2',
                    border: '1px solid #EF4444',
                    transform: 'scale(0.95)',
                  } : {},
                }}
              >
                {word}
              </Box>
            ))}
          </Stack>

          {isSelected && onEdit && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                placeholder="Add word..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '12px',
                    background: 'white',
                  },
                }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddWord();
                }}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  fontSize: '11px',
                  textTransform: 'none',
                }}
              >
                Add
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {/* Items */}
      <Stack spacing={2}>
        {localItems.map((item) => (
          <Stack key={item.number} direction="row" spacing={1} alignItems="flex-start">
            {isSelected && onEdit && (
              <IconButton
                size="small"
                sx={{ p: 0.5, mt: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item.number);
                }}
              >
                <Trash2 size={14} color="#EF4444" />
              </IconButton>
            )}
            
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
            
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                  mb: 0.5,
                }}
              >
                {item.text.split('______').map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: '100px',
                          borderBottom: '2px solid #374151',
                          mx: 0.5,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
                {item.hint && (
                  <Typography
                    component="span"
                    sx={{ fontSize: '12px', color: '#6B7280', ml: 0.5 }}
                  >
                    ({item.hint})
                  </Typography>
                )}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      {/* Add Item Button */}
      {isSelected && onEdit && (
        <Button
          fullWidth
          size="small"
          startIcon={<Plus size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleAddItem();
          }}
          sx={{
            mt: 2,
            borderRadius: '8px',
            textTransform: 'none',
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            color: theme.palette.primary.main,
            '&:hover': {
              border: `2px dashed ${theme.palette.primary.main}`,
              background: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          Add Item
        </Button>
      )}
    </Box>
  );
};

export default FillInBlank;
