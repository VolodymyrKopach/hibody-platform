'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Check, X } from 'lucide-react';

interface TrueFalseItem {
  number: number;
  statement: string;
}

interface TrueFalseProps {
  items: TrueFalseItem[];
  isSelected?: boolean;
  onEdit?: (properties: { items: TrueFalseItem[] }) => void;
  onFocus?: () => void;
}

const TrueFalse: React.FC<TrueFalseProps> = ({ 
  items,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [editingStatement, setEditingStatement] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<TrueFalseItem[]>(items);
  const statementRef = useRef<HTMLDivElement>(null);

  // Sync with external changes
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Focus when editing starts
  useEffect(() => {
    if (editingStatement !== null && statementRef.current) {
      statementRef.current.focus();
      // Select all text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(statementRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingStatement]);

  const handleStatementBlur = (itemNumber: number) => {
    const text = statementRef.current?.textContent || '';
    
    // Захист від undefined/null
    if (text === undefined || text === null || text === 'undefined') {
      console.warn('⚠️ [TrueFalse handleStatementBlur] Received undefined/null text, skipping update');
      setEditingStatement(null);
      return;
    }
    
    if (text.trim() && onEdit) {
      const updatedItems = localItems.map(item =>
        item.number === itemNumber ? { ...item, statement: text.trim() } : item
      );
      setLocalItems(updatedItems);
      onEdit({ items: updatedItems });
    }
    setEditingStatement(null);
  };

  const handleStatementKeyDown = (e: React.KeyboardEvent, itemNumber: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStatementBlur(itemNumber);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingStatement(null);
      setLocalItems(items); // Reset
    }
  };

  const handleStatementDoubleClick = (itemNumber: number) => {
    if (isSelected && onEdit) {
      setEditingStatement(itemNumber);
    }
  };

  const handleStatementClick = (itemNumber: number) => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <Box>
      <Stack spacing={2.5}>
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

              {/* Statement */}
              <Box sx={{ flex: 1 }}>
                {editingStatement === item.number ? (
                  <Box
                    ref={statementRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleStatementBlur(item.number)}
                    onKeyDown={(e) => handleStatementKeyDown(e, item.number)}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      border: '1px solid #2563EB',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      mb: 1,
                    }}
                  >
                    {item.statement}
                  </Box>
                ) : (
                  <Typography
                    onClick={() => handleStatementClick(item.number)}
                    onDoubleClick={() => handleStatementDoubleClick(item.number)}
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      mb: 1,
                      cursor: isSelected && onEdit ? 'text' : 'default',
                      '&:hover': isSelected && onEdit ? {
                        backgroundColor: '#F9FAFB',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '-4px -8px 4px -8px',
                      } : {},
                    }}
                  >
                    {item.statement}
                  </Typography>
                )}

                {/* True/False Options */}
                <Stack direction="row" spacing={2} sx={{ ml: 0 }}>
                  {/* True Option */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        border: '2px solid #10B981',
                        backgroundColor: '#F0FDF4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} color="#10B981" strokeWidth={3} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: '#10B981',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      True
                    </Typography>
                  </Stack>

                  {/* False Option */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        border: '2px solid #EF4444',
                        backgroundColor: '#FEF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <X size={12} color="#EF4444" strokeWidth={3} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: '#EF4444',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      False
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default TrueFalse;

