'use client';

import React, { useRef, useCallback, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Box, Stack, IconButton, Divider, alpha, Tooltip, ClickAwayListener } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatColorText,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Highlight as HighlightIcon,
} from '@mui/icons-material';
import { ColorPicker } from './ColorPicker';

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  onFinishEditing?: () => void;
  placeholder?: string;
  isEditing?: boolean;
  minHeight?: string;
  fontSize?: string;
  showToolbar?: boolean;
  hideBorder?: boolean; // Приховати border (для Properties Panel)
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onFinishEditing,
  isEditing = false,
  minHeight = '40px',
  fontSize = '14px',
  showToolbar = true,
  hideBorder = false,
}) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLElement | null>(null);
  const htmlRef = useRef<string>(content);
  const savedSelectionRef = useRef<Range | null>(null);
  const [textColor, setTextColor] = useState('#374151');
  const [highlightColor, setHighlightColor] = useState('#FFEB3B');

  // Sync htmlRef with content prop - критично для оновлення з зовні
  React.useEffect(() => {
    console.log('📝 [RichTextEditor] Content prop changed:', {
      newContent: content,
      type: typeof content,
      isUndefined: content === undefined,
      isNull: content === null,
      isStringUndefined: content === 'undefined',
      previousValue: htmlRef.current
    });
    
    // Завжди синхронізуємо з content prop, навіть під час редагування
    if (content !== undefined && content !== null && content !== 'undefined') {
      htmlRef.current = content;
    }
  }, [content]);

  // Save current selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore saved selection
  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  }, []);

  // Apply color using direct DOM manipulation (more reliable than execCommand)
  const applyColorFormat = useCallback((type: 'color' | 'backgroundColor', color: string) => {
    // First, restore the saved selection
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No text selected

    // Get selected content
    const selectedContent = range.extractContents();
    
    // Create a span with the color style
    const span = document.createElement('span');
    span.style[type] = color;
    span.appendChild(selectedContent);
    
    // Insert the styled span
    range.insertNode(span);
    
    // Update selection to the new span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);
    
    // Save the new selection
    savedSelectionRef.current = newRange.cloneRange();
    
    // Trigger onChange
    if (contentRef.current) {
      const newHtml = contentRef.current.innerHTML;
      
      // Захист від undefined
      if (newHtml === undefined || newHtml === null) {
        console.warn('⚠️ [RichTextEditor] applyColorFormat got undefined/null innerHTML, skipping update');
        return;
      }
      
      htmlRef.current = newHtml;
      onChange?.(newHtml);
    }
  }, [onChange, restoreSelection]);

  // Format command handler for other formats (bold, italic, etc.)
  const applyFormat = useCallback((command: string, value?: string) => {
    // For color commands, use our custom implementation
    if (command === 'foreColor') {
      applyColorFormat('color', value || '#000000');
      return;
    }
    if (command === 'backColor') {
      applyColorFormat('backgroundColor', value || 'transparent');
      return;
    }

    // For other commands, use execCommand
    document.execCommand(command, false, value);
    setTimeout(() => {
      if (contentRef.current) {
        const newHtml = contentRef.current.innerHTML;
        
        // Захист від undefined
        if (newHtml === undefined || newHtml === null) {
          console.warn('⚠️ [RichTextEditor] applyFormat got undefined/null innerHTML, skipping update');
          return;
        }
        
        htmlRef.current = newHtml;
        onChange?.(newHtml);
      }
    }, 0);
  }, [onChange, applyColorFormat]);

  // Handle content change
  const handleChange = useCallback((evt: any) => {
    // react-contenteditable передає об'єкт з evt.target.value
    const newHtml = evt?.target?.value ?? contentRef.current?.innerHTML;
    
    console.log('✏️ [RichTextEditor] Content changed:', {
      newHtml,
      type: typeof newHtml,
      length: newHtml?.length,
      previousValue: htmlRef.current,
      eventType: evt?.type,
      hasValue: evt?.target?.value !== undefined
    });
    
    // Захист від undefined - використовуємо попереднє значення
    if (newHtml === undefined || newHtml === null || newHtml === 'undefined') {
      console.warn('⚠️ [RichTextEditor] handleChange received undefined/null, keeping previous value:', htmlRef.current);
      // Не оновлюємо нічого, просто ігноруємо цей виклик
      return;
    }
    
    // Оновлюємо тільки якщо значення змінилося
    if (newHtml !== htmlRef.current) {
      htmlRef.current = newHtml;
      onChange?.(newHtml);
    }
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((evt: React.KeyboardEvent) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      onFinishEditing?.();
    }
  }, [onFinishEditing]);

  // Handle click away - close editor when clicking outside
  const handleClickAway = useCallback((event: MouseEvent | TouchEvent) => {
    // Check if click was on color picker popover or any MUI Popover
    const target = event.target as HTMLElement;
    if (
      target.closest('[data-color-picker-popover]') ||
      target.closest('.MuiPopover-root') ||
      target.closest('[role="presentation"]')
    ) {
      return; // Don't close if clicking on popover/modal
    }
    
    if (isEditing) {
      // Перед закриттям переконаємось, що останні зміни збережені
      if (contentRef.current) {
        const finalHtml = contentRef.current.innerHTML;
        
        console.log('👋 [RichTextEditor] Click away detected, saving final content:', {
          finalHtml,
          currentHtmlRef: htmlRef.current,
          areEqual: finalHtml === htmlRef.current
        });
        
        // Якщо є нові зміни, що не були збережені через onChange
        if (finalHtml && finalHtml !== htmlRef.current && finalHtml !== 'undefined') {
          htmlRef.current = finalHtml;
          onChange?.(finalHtml);
        }
      }
      
      onFinishEditing?.();
    }
  }, [isEditing, onFinishEditing, onChange]);

  const Toolbar = () => (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        p: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: alpha(theme.palette.grey[100], 0.8),
        borderRadius: '4px 4px 0 0',
        flexWrap: 'wrap',
        gap: 0.5,
      }}
    >
      {/* Text Formatting */}
      <Tooltip title="Bold (Ctrl+B)">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('bold');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Italic (Ctrl+I)">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('italic');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Underline (Ctrl+U)">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('underline');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Text Color */}
      <Box onMouseDown={(e) => {
        // Save selection before opening color picker
        e.preventDefault();
        saveSelection();
      }}>
        <ColorPicker
          value={textColor}
          onChange={(color) => {
            setTextColor(color);
            applyFormat('foreColor', color);
          }}
          icon={<FormatColorText fontSize="small" />}
          label="Text Color"
          colorType="text"
        />
      </Box>

      {/* Highlight Color */}
      <Box onMouseDown={(e) => {
        // Save selection before opening color picker
        e.preventDefault();
        saveSelection();
      }}>
        <ColorPicker
          value={highlightColor}
          onChange={(color) => {
            setHighlightColor(color);
            applyFormat('backColor', color);
          }}
          icon={<HighlightIcon fontSize="small" />}
          label="Highlight Color"
          colorType="highlight"
        />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Lists */}
      <Tooltip title="Bullet List">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertUnorderedList');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Numbered List">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertOrderedList');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Text Alignment */}
      <Tooltip title="Align Left">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyLeft');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatAlignLeft fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Center">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyCenter');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatAlignCenter fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Right">
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyRight');
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <FormatAlignRight fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <ClickAwayListener 
      onClickAway={handleClickAway}
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
    >
      <Box
        data-rich-text-editor
        sx={{
          border: hideBorder ? 'none' : (isEditing ? '2px solid' : 'none'),
          borderColor: hideBorder ? 'transparent' : (isEditing ? theme.palette.primary.main : 'transparent'),
          borderRadius: '4px',
          transition: 'all 0.2s',
        }}
      >
        {isEditing && showToolbar && <Toolbar />}

        <Box
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontSize: fontSize,
            color: theme.palette.text.primary,
            lineHeight: 1.6,
            padding: '8px 12px',
            minHeight: minHeight,
            outline: 'none',
            '& p': {
              margin: 0,
              marginBottom: '0.5em',
              '&:last-child': {
                marginBottom: 0,
              },
            },
            '& ul, & ol': {
              paddingLeft: '1.5em',
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            '& li': {
              marginBottom: '0.25em',
            },
            '& strong, & b': {
              fontWeight: 700,
            },
            '& em, & i': {
              fontStyle: 'italic',
            },
            '& u': {
              textDecoration: 'underline',
            },
            // Support inline color styles
            '& span[style*="color"]': {
              // Preserve inline color styles
            },
            '& span[style*="background-color"]': {
              // Preserve inline background-color styles
            },
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ContentEditable
            innerRef={contentRef as any}
            html={htmlRef.current}
            disabled={!isEditing}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            tagName="div"
            style={{
              outline: 'none',
              minHeight: minHeight,
            }}
          />
        </Box>
      </Box>
    </ClickAwayListener>
  );
};

