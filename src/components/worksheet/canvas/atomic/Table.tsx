'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface TableProps {
  headers: string[];
  rows: string[][];
  hasHeaders?: boolean;
  borderStyle?: 'all' | 'horizontal' | 'none';
  isSelected?: boolean;
  onEdit?: (properties: {
    headers?: string[];
    rows?: string[][];
    hasHeaders?: boolean;
    borderStyle?: string;
  }) => void;
  onFocus?: () => void;
}

const Table: React.FC<TableProps> = ({
  headers,
  rows,
  hasHeaders = true,
  borderStyle = 'all',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number; isHeader: boolean } | null>(null);
  const [localHeaders, setLocalHeaders] = useState<string[]>(headers);
  const [localRows, setLocalRows] = useState<string[][]>(rows);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalHeaders(headers);
    setLocalRows(rows);
  }, [headers, rows]);

  useEffect(() => {
    if (editingCell !== null && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingCell]);

  const handleBlur = () => {
    if (editingCell && textRef.current && onEdit) {
      const text = textRef.current.textContent || '';
      if (editingCell.isHeader) {
        const updatedHeaders = [...localHeaders];
        updatedHeaders[editingCell.col] = text;
        setLocalHeaders(updatedHeaders);
        onEdit({ headers: updatedHeaders });
      } else {
        const updatedRows = [...localRows];
        updatedRows[editingCell.row][editingCell.col] = text;
        setLocalRows(updatedRows);
        onEdit({ rows: updatedRows });
      }
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingCell(null);
      setLocalHeaders(headers);
      setLocalRows(rows);
    }
  };

  const handleDoubleClick = (row: number, col: number, isHeader: boolean) => {
    if (isSelected && onEdit) {
      setEditingCell({ row, col, isHeader });
    }
  };

  const handleClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const getBorderStyle = () => {
    switch (borderStyle) {
      case 'all':
        return {
          border: '1px solid #D1D5DB',
          borderCollapse: 'collapse' as const,
        };
      case 'horizontal':
        return {
          borderTop: '1px solid #D1D5DB',
          borderBottom: '1px solid #D1D5DB',
          borderCollapse: 'collapse' as const,
        };
      case 'none':
        return {
          border: 'none',
          borderCollapse: 'collapse' as const,
        };
      default:
        return {
          border: '1px solid #D1D5DB',
          borderCollapse: 'collapse' as const,
        };
    }
  };

  const getCellBorderStyle = () => {
    switch (borderStyle) {
      case 'all':
        return {
          border: '1px solid #D1D5DB',
        };
      case 'horizontal':
        return {
          borderBottom: '1px solid #D1D5DB',
        };
      case 'none':
        return {};
      default:
        return {
          border: '1px solid #D1D5DB',
        };
    }
  };

  return (
    <Box onClick={handleClick} sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          ...getBorderStyle(),
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {hasHeaders && (
          <Box component="thead">
            <Box component="tr">
              {localHeaders.map((header, colIndex) => (
                <Box
                  key={colIndex}
                  component="th"
                  sx={{
                    ...getCellBorderStyle(),
                    padding: '10px 12px',
                    backgroundColor: '#F3F4F6',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  {editingCell?.isHeader && editingCell.col === colIndex ? (
                    <Box
                      ref={textRef}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      sx={{
                        outline: 'none',
                        border: '1px solid #2563EB',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {header}
                    </Box>
                  ) : (
                    <Typography
                      onDoubleClick={() => handleDoubleClick(0, colIndex, true)}
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: isSelected && onEdit ? 'text' : 'default',
                        '&:hover': isSelected && onEdit ? {
                          backgroundColor: '#E5E7EB',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          margin: '-2px -4px',
                        } : {},
                      }}
                    >
                      {header}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        <Box component="tbody">
          {localRows.map((row, rowIndex) => (
            <Box key={rowIndex} component="tr">
              {row.map((cell, colIndex) => (
                <Box
                  key={colIndex}
                  component="td"
                  sx={{
                    ...getCellBorderStyle(),
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#374151',
                    verticalAlign: 'top',
                  }}
                >
                  {editingCell && !editingCell.isHeader && editingCell.row === rowIndex && editingCell.col === colIndex ? (
                    <Box
                      ref={textRef}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      sx={{
                        outline: 'none',
                        border: '1px solid #2563EB',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        backgroundColor: '#FFFFFF',
                        minHeight: '20px',
                      }}
                    >
                      {cell}
                    </Box>
                  ) : (
                    <Typography
                      onDoubleClick={() => handleDoubleClick(rowIndex, colIndex, false)}
                      sx={{
                        fontSize: '13px',
                        cursor: isSelected && onEdit ? 'text' : 'default',
                        minHeight: '20px',
                        '&:hover': isSelected && onEdit ? {
                          backgroundColor: '#F9FAFB',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          margin: '-2px -4px',
                        } : {},
                      }}
                    >
                      {cell || '\u00A0'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Table;

