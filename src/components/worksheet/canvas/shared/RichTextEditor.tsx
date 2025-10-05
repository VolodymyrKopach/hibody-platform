'use client';

import React, { useRef, useCallback, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Box, Stack, IconButton, Divider, alpha, Tooltip } from '@mui/material';
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

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  isEditing?: boolean;
  minHeight?: string;
  fontSize?: string;
  showToolbar?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = '',
  isEditing = false,
  minHeight = '40px',
  fontSize = '14px',
  showToolbar = true,
}) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLElement>(null);
  const htmlRef = useRef<string>(content);
  const [textColor, setTextColor] = useState('#374151');
  const [highlightColor, setHighlightColor] = useState('#FFEB3B');

  // Format command handler
  const applyFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Trigger onChange after format
    if (contentRef.current) {
      const newHtml = contentRef.current.innerHTML;
      htmlRef.current = newHtml;
      onChange?.(newHtml);
    }
  }, [onChange]);

  // Handle content change
  const handleChange = useCallback((evt: any) => {
    const newHtml = evt.target.value;
    htmlRef.current = newHtml;
    onChange?.(newHtml);
  }, [onChange]);

  // Check if format is active
  const isFormatActive = (format: string): boolean => {
    return document.queryCommandState(format);
  };

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
      <Tooltip title="Text Color">
        <Box
          component="label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative',
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <FormatColorText fontSize="small" sx={{ color: textColor }} />
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              const color = e.target.value;
              setTextColor(color);
              applyFormat('foreColor', color);
            }}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
          />
        </Box>
      </Tooltip>

      {/* Highlight Color */}
      <Tooltip title="Highlight">
        <Box
          component="label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative',
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <HighlightIcon fontSize="small" sx={{ color: highlightColor }} />
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => {
              const color = e.target.value;
              setHighlightColor(color);
              applyFormat('backColor', color);
            }}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
          />
        </Box>
      </Tooltip>

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
    <Box
      sx={{
        border: isEditing ? '2px solid' : 'none',
        borderColor: isEditing ? theme.palette.primary.main : 'transparent',
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
        }}
      >
        <ContentEditable
          innerRef={contentRef}
          html={htmlRef.current}
          disabled={!isEditing}
          onChange={handleChange}
          tagName="div"
          style={{
            outline: 'none',
            minHeight: minHeight,
          }}
        />
      </Box>
    </Box>
  );
};

