'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/constants/visual-themes';

interface TableProps {
  headers: string[];
  rows: string[][];
  hasHeaders?: boolean;
  borderStyle?: 'all' | 'horizontal' | 'vertical' | 'none';
  headerBgColor?: string;
  borderColor?: string;
  cellPadding?: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  theme?: ThemeName;
  isSelected?: boolean;
  onEdit?: (properties: {
    headers?: string[];
    rows?: string[][];
    hasHeaders?: boolean;
    borderStyle?: string;
    headerBgColor?: string;
    borderColor?: string;
    cellPadding?: number;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
  }) => void;
  onFocus?: () => void;
}

const Table: React.FC<TableProps> = ({
  headers,
  rows,
  hasHeaders = true,
  borderStyle = 'all',
  headerBgColor = '#F3F4F6',
  borderColor = '#D1D5DB',
  cellPadding = 10,
  fontSize = 13,
  textAlign = 'left',
  theme: themeName,
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const componentTheme = useComponentTheme(themeName);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number; isHeader: boolean } | null>(null);
  const [localHeaders, setLocalHeaders] = useState<string[]>(headers);
  const [localRows, setLocalRows] = useState<string[][]>(rows);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
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
      
      // Guard against undefined/null
      if (text === undefined || text === null || text === 'undefined') {
        setEditingCell(null);
        return;
      }
      
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingCell(null);
      setLocalHeaders(headers);
      setLocalRows(rows);
    }
    // Tab navigation between cells
    if (e.key === 'Tab' && editingCell) {
      e.preventDefault();
      handleBlur();
      
      const { row, col, isHeader } = editingCell;
      
      if (e.shiftKey) {
        // Shift+Tab - move backwards
        if (isHeader) {
          if (col > 0) {
            setEditingCell({ row: 0, col: col - 1, isHeader: true });
          }
        } else {
          if (col > 0) {
            setEditingCell({ row, col: col - 1, isHeader: false });
          } else if (row > 0) {
            setEditingCell({ row: row - 1, col: localHeaders.length - 1, isHeader: false });
          } else if (hasHeaders) {
            setEditingCell({ row: 0, col: localHeaders.length - 1, isHeader: true });
          }
        }
      } else {
        // Tab - move forward
        if (isHeader) {
          if (col < localHeaders.length - 1) {
            setEditingCell({ row: 0, col: col + 1, isHeader: true });
          } else if (localRows.length > 0) {
            setEditingCell({ row: 0, col: 0, isHeader: false });
          }
        } else {
          if (col < localHeaders.length - 1) {
            setEditingCell({ row, col: col + 1, isHeader: false });
          } else if (row < localRows.length - 1) {
            setEditingCell({ row: row + 1, col: 0, isHeader: false });
          }
        }
      }
    }
  };

  const handleDoubleClick = (row: number, col: number, isHeader: boolean) => {
    if (onEdit) {
      setEditingCell({ row, col, isHeader });
    }
  };

  const handleSingleClick = (row: number, col: number, isHeader: boolean) => {
    if (isSelected && onEdit) {
      // Single click when table is already selected - start editing
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
          border: `1px solid ${borderColor}`,
          borderCollapse: 'collapse' as const,
        };
      case 'horizontal':
        return {
          borderTop: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderCollapse: 'collapse' as const,
        };
      case 'vertical':
        return {
          borderLeft: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          borderCollapse: 'collapse' as const,
        };
      case 'none':
        return {
          border: 'none',
          borderCollapse: 'collapse' as const,
        };
      default:
        return {
          border: `1px solid ${borderColor}`,
          borderCollapse: 'collapse' as const,
        };
    }
  };

  const getCellBorderStyle = () => {
    switch (borderStyle) {
      case 'all':
        return {
          border: `1px solid ${borderColor}`,
        };
      case 'horizontal':
        return {
          borderBottom: `1px solid ${borderColor}`,
        };
      case 'vertical':
        return {
          borderRight: `1px solid ${borderColor}`,
          borderLeft: `1px solid ${borderColor}`,
        };
      case 'none':
        return {};
      default:
        return {
          border: `1px solid ${borderColor}`,
        };
    }
  };

  return (
    <Box onClick={handleClick} sx={{ overflowX: 'auto', position: 'relative' }}>
      {/* Editing hint when table is selected */}
      {isSelected && onEdit && !editingCell && (
        <Box
          sx={{
            position: 'absolute',
            top: -32,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              borderRadius: '6px',
              backgroundColor: 'rgba(37, 99, 235, 0.9)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            💡 Click any cell to edit • Tab to navigate • Enter to save
          </Box>
        </Box>
      )}
      
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
                  onMouseEnter={() => setHoveredCol(colIndex)}
                  onMouseLeave={() => setHoveredCol(null)}
                  sx={{
                    ...getCellBorderStyle(),
                    padding: `${cellPadding}px ${cellPadding + 2}px`,
                    backgroundColor: headerBgColor,
                    fontWeight: 600,
                    fontSize: `${fontSize}px`,
                    color: '#374151',
                    textAlign: textAlign,
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
                        border: '2px solid #2563EB',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        backgroundColor: '#FFFFFF',
                        minHeight: '20px',
                      }}
                    >
                      {header}
                    </Box>
                  ) : (
                    <Typography
                      onClick={() => handleSingleClick(0, colIndex, true)}
                      onDoubleClick={() => handleDoubleClick(0, colIndex, true)}
                      sx={{
                        fontSize: `${fontSize}px`,
                        fontWeight: 600,
                        cursor: onEdit ? 'text' : 'default',
                        position: 'relative',
                        '&:hover': onEdit ? {
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          margin: '-2px -4px',
                          '&::after': isSelected ? {
                            content: '"✏️"',
                            position: 'absolute',
                            right: -2,
                            top: -2,
                            fontSize: '10px',
                            opacity: 0.6,
                          } : {},
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
            <Box 
              key={rowIndex} 
              component="tr"
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
              sx={{
                position: 'relative',
                '&:hover': isSelected ? {
                  backgroundColor: 'rgba(249, 250, 251, 0.8)',
                } : {},
              }}
            >
              {row.map((cell, colIndex) => (
                <Box
                  key={colIndex}
                  component="td"
                  sx={{
                    ...getCellBorderStyle(),
                    padding: `${cellPadding}px ${cellPadding + 2}px`,
                    fontSize: `${fontSize}px`,
                    color: '#374151',
                    verticalAlign: 'top',
                    textAlign: textAlign,
                    position: 'relative',
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
                        border: '2px solid #2563EB',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        backgroundColor: '#FFFFFF',
                        minHeight: '20px',
                      }}
                    >
                      {cell}
                    </Box>
                  ) : (
                    <Typography
                      onClick={() => handleSingleClick(rowIndex, colIndex, false)}
                      onDoubleClick={() => handleDoubleClick(rowIndex, colIndex, false)}
                      sx={{
                        fontSize: `${fontSize}px`,
                        cursor: onEdit ? 'text' : 'default',
                        minHeight: '20px',
                        position: 'relative',
                        '&:hover': onEdit ? {
                          backgroundColor: 'rgba(37, 99, 235, 0.05)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          margin: '-2px -4px',
                          '&::after': isSelected ? {
                            content: '"✏️"',
                            position: 'absolute',
                            right: -2,
                            top: -2,
                            fontSize: '10px',
                            opacity: 0.4,
                          } : {},
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

