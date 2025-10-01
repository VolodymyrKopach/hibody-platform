'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  TextField,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ArrowLeft,
  Plus,
} from 'lucide-react';

import { alpha } from '@mui/material';

type Selection = 
  | { type: 'page'; data: any }
  | { type: 'element'; pageData: any; elementData: any }
  | null;

interface RightSidebarProps {
  selection: Selection;
  onSelectionChange?: (selection: Selection) => void;
  onUpdate?: (updates: any) => void;
  onDuplicate?: (pageId: string, elementId: string) => void;
  onDelete?: (pageId: string, elementId: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  selection, 
  onSelectionChange,
  onUpdate,
  onDuplicate,
  onDelete
}) => {
  const theme = useTheme();

  // Mock layers for the selected page
  const mockLayers = selection && selection.type === 'page' ? [
    { 
      id: '1', 
      name: 'Title', 
      type: 'title', 
      visible: true, 
      locked: false,
      properties: {
        text: 'Present Simple Practice',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563EB',
        align: 'center',
      }
    },
    { 
      id: '2', 
      name: 'Instructions', 
      type: 'text', 
      visible: true, 
      locked: false,
      properties: {
        text: 'Complete the exercises below...',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#64748B',
        align: 'left',
      }
    },
    { 
      id: '3', 
      name: 'Fill Exercise', 
      type: 'fill-blanks', 
      visible: true, 
      locked: false,
      properties: {
        items: 7,
        difficulty: 'medium',
      }
    },
  ] : [];

  const handleLayerSelect = (layer: any) => {
    if (selection && selection.type === 'page') {
      onSelectionChange?.({
        type: 'element',
        pageData: selection.data,
        elementData: layer,
      });
    }
  };

  // If nothing selected
  if (!selection) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        <Box sx={{ textAlign: 'center', px: 3 }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>👈</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Nothing selected
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select a page or element to edit
          </Typography>
        </Box>
      </Paper>
    );
  }

  // CASE 1: Page selected
  if (selection.type === 'page') {
    const pageData = selection.data;

    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'auto',
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Settings size={20} color={theme.palette.primary.main} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Properties
            </Typography>
          </Stack>

          {/* Selection Type Badge */}
          <Chip 
            label="📄 Page"
            size="small"
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          />

          {/* Page Info */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              mb: 3,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ fontSize: '2rem' }}>{pageData.thumbnail}</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Page {pageData.pageNumber}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {pageData.title}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* Page Settings */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Page Settings
          </Typography>

          <Stack spacing={2.5} sx={{ mb: 3 }}>
            {/* Title */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Title
              </Typography>
              <TextField
                fullWidth
                size="small"
                defaultValue={pageData.title}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            {/* Format Preset - Read Only */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Format
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontSize: '1.2rem' }}>📄</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.primary.main }}>
                      A4 Portrait
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      210 × 297 mm (794 × 1123 px)
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Position */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                Position
              </Typography>
              <Stack direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    X
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    defaultValue={Math.round(pageData.x)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Y
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    defaultValue={Math.round(pageData.y)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Layers - Click to edit */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Layers ({mockLayers.length})
            </Typography>
            <Chip label="Add Element" size="small" onClick={() => console.log('Add')} />
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Click on a layer to edit its properties
          </Typography>

          <Stack spacing={0.5} sx={{ mb: 3 }}>
            {mockLayers.map((layer) => (
              <Paper
                key={layer.id}
                elevation={0}
                onClick={() => handleLayerSelect(layer)}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </IconButton>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {layer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {layer.type}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Stack spacing={1}>
            <Button
              fullWidth
              size="small"
              startIcon={<Copy size={14} />}
              variant="outlined"
              sx={{ borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
            >
              Duplicate Page
            </Button>
            <Button
              fullWidth
              size="small"
              startIcon={<Trash2 size={14} />}
              variant="outlined"
              color="error"
              sx={{ borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
            >
              Delete Page
            </Button>
          </Stack>
        </Box>
      </Paper>
    );
  }

  // CASE 2: Element selected
  if (selection.type === 'element') {
    const { pageData, elementData } = selection;

    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'auto',
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Settings size={20} color={theme.palette.primary.main} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Properties
            </Typography>
          </Stack>

          {/* Selection Type Badge */}
          <Chip 
            label={`🎨 ${elementData.type || 'Element'}`}
            size="small"
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              background: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
            }}
          />

          {/* Element Info */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              mb: 3,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {elementData.type === 'title-block' ? 'Title Block' :
               elementData.type === 'body-text' ? 'Body Text' :
               elementData.type === 'instructions-box' ? 'Instructions Box' :
               elementData.type === 'fill-blank' ? 'Fill in Blanks' :
               elementData.type === 'multiple-choice' ? 'Multiple Choice' :
               elementData.type === 'true-false' ? 'True/False' :
               elementData.type === 'short-answer' ? 'Short Answer' :
               elementData.type === 'tip-box' ? 'Tip Box' :
               elementData.type === 'warning-box' ? 'Warning Box' :
               elementData.type === 'image-placeholder' ? 'Image' :
               elementData.name || 'Component'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              On: {pageData.title} (Page {pageData.pageNumber})
            </Typography>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* Element Properties */}
          {elementData.type === 'title-block' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Title Properties
              </Typography>

              {/* Text Content */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Text Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={elementData.properties?.text || ''}
                  onChange={(e) => onUpdate?.({ text: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* Level */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Title Level
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[
                    { label: 'Main', value: 'main', size: '28px' },
                    { label: 'Section', value: 'section', size: '20px' },
                    { label: 'Exercise', value: 'exercise', size: '16px' },
                  ].map((level) => (
                    <Button
                      key={level.value}
                      size="small"
                      onClick={() => onUpdate?.({ level: level.value })}
                      variant={elementData.properties?.level === level.value ? 'contained' : 'outlined'}
                      sx={{
                        flex: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ fontWeight: 600 }}>{level.label}</Box>
                        <Box sx={{ fontSize: '0.65rem', opacity: 0.7 }}>{level.size}</Box>
                      </Box>
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Text Align */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Alignment
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[
                    { icon: <AlignLeft size={16} />, value: 'left', label: 'Left' },
                    { icon: <AlignCenter size={16} />, value: 'center', label: 'Center' },
                    { icon: <AlignRight size={16} />, value: 'right', label: 'Right' },
                  ].map((align) => (
                    <Button
                      key={align.value}
                      size="small"
                      onClick={() => onUpdate?.({ align: align.value })}
                      variant={elementData.properties?.align === align.value ? 'contained' : 'outlined'}
                      sx={{
                        flex: 1,
                        borderRadius: '8px',
                        minWidth: 0,
                        px: 1,
                      }}
                    >
                      {align.icon}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Color */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Text Color
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    type="color"
                    value={elementData.properties?.color || '#1F2937'}
                    onChange={(e) => onUpdate?.({ color: e.target.value })}
                    sx={{
                      width: 60,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    value={elementData.properties?.color || '#1F2937'}
                    onChange={(e) => onUpdate?.({ color: e.target.value })}
                    placeholder="#1F2937"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* Quick Color Presets */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Quick Colors
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {[
                    { color: '#1F2937', label: 'Dark' },
                    { color: '#2563EB', label: 'Blue' },
                    { color: '#059669', label: 'Green' },
                    { color: '#DC2626', label: 'Red' },
                    { color: '#EA580C', label: 'Orange' },
                    { color: '#7C3AED', label: 'Purple' },
                  ].map((preset) => (
                    <Tooltip key={preset.color} title={preset.label}>
                      <IconButton
                        size="small"
                        onClick={() => onUpdate?.({ color: preset.color })}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: preset.color,
                          border: elementData.properties?.color === preset.color
                            ? `3px solid ${theme.palette.primary.main}`
                            : '2px solid transparent',
                          '&:hover': {
                            background: preset.color,
                            opacity: 0.8,
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'body-text' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Text Properties
              </Typography>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Text Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={elementData.properties?.text || ''}
                  onChange={(e) => onUpdate?.({ text: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* Variant */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Text Variant
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[
                    { label: 'Paragraph', value: 'paragraph' },
                    { label: 'Description', value: 'description' },
                    { label: 'Example', value: 'example' },
                  ].map((variant) => (
                    <Button
                      key={variant.value}
                      size="small"
                      onClick={() => onUpdate?.({ variant: variant.value })}
                      variant={elementData.properties?.variant === variant.value ? 'contained' : 'outlined'}
                      sx={{
                        flex: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      {variant.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'instructions-box' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Instructions Properties
              </Typography>

              {/* Title */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Title
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={elementData.properties?.title || ''}
                  onChange={(e) => onUpdate?.({ title: e.target.value })}
                  placeholder="Instructions"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Default: "Instructions"
                </Typography>
              </Box>

              {/* Text Content */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Text Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={elementData.properties?.text || ''}
                  onChange={(e) => onUpdate?.({ text: e.target.value })}
                  placeholder="Enter instructions here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* Type */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Instruction Type
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {[
                    { label: 'General', value: 'general', icon: '📋' },
                    { label: 'Reading', value: 'reading', icon: '📖' },
                    { label: 'Writing', value: 'writing', icon: '✏️' },
                    { label: 'Listening', value: 'listening', icon: '👂' },
                    { label: 'Speaking', value: 'speaking', icon: '🗣️' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="small"
                      onClick={() => onUpdate?.({ type: type.value })}
                      variant={elementData.properties?.type === type.value ? 'contained' : 'outlined'}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Icon (optional custom) */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Custom Icon (optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={elementData.properties?.icon || ''}
                  onChange={(e) => onUpdate?.({ icon: e.target.value })}
                  placeholder="Leave empty for default icon"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Enter emoji or leave empty to use type icon
                </Typography>
              </Box>
            </Stack>
          ) : elementData.type === 'tip-box' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tip Box Properties
              </Typography>

              {/* Title */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Title
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={elementData.properties?.title || ''}
                  onChange={(e) => onUpdate?.({ title: e.target.value })}
                  placeholder="Tip"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Default: "Tip"
                </Typography>
              </Box>

              {/* Text Content */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Tip Text
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={elementData.properties?.text || ''}
                  onChange={(e) => onUpdate?.({ text: e.target.value })}
                  placeholder="Enter helpful tip here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* Type */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Tip Type
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {[
                    { label: 'Study', value: 'study', icon: '💡' },
                    { label: 'Memory', value: 'memory', icon: '🧠' },
                    { label: 'Practice', value: 'practice', icon: '🎯' },
                    { label: 'Cultural', value: 'cultural', icon: '🌍' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="small"
                      onClick={() => onUpdate?.({ type: type.value })}
                      variant={elementData.properties?.type === type.value ? 'contained' : 'outlined'}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'warning-box' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Warning Box Properties
              </Typography>

              {/* Title */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Title
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={elementData.properties?.title || ''}
                  onChange={(e) => onUpdate?.({ title: e.target.value })}
                  placeholder="Warning"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Default: "Warning"
                </Typography>
              </Box>

              {/* Text Content */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Warning Text
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={elementData.properties?.text || ''}
                  onChange={(e) => onUpdate?.({ text: e.target.value })}
                  placeholder="Enter warning message here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* Type */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Warning Type
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {[
                    { label: 'Grammar', value: 'grammar', icon: '⚠️' },
                    { label: 'Time', value: 'time', icon: '⏰' },
                    { label: 'Difficulty', value: 'difficulty', icon: '🔥' },
                    { label: 'Common Mistake', value: 'common-mistake', icon: '❗' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="small"
                      onClick={() => onUpdate?.({ type: type.value })}
                      variant={elementData.properties?.type === type.value ? 'contained' : 'outlined'}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'fill-blank' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Fill in Blanks Properties
              </Typography>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Use ______ (6 underscores) in your sentence to create a blank
              </Typography>

              {/* Items */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Items ({elementData.properties?.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const items = elementData.properties?.items || [];
                      const newItem = {
                        number: items.length + 1,
                        text: 'New sentence with ______ blank.',
                        hint: '',
                      };
                      onUpdate?.({ items: [...items, newItem] });
                    }}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    Add Item
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(elementData.properties?.items || []).map((item: any, index: number) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        background: alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Chip
                            label={`#${item.number}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '11px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items
                                .filter((_: any, idx: number) => idx !== index)
                                .map((it: any, idx: number) => ({ ...it, number: idx + 1 }));
                              onUpdate?.({ items: updatedItems });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </IconButton>
                        </Stack>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                            Sentence
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={item.text || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === index ? { ...it, text: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter sentence with ______ for blank"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                            Hint (optional)
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.hint || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === index ? { ...it, hint: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="e.g., verb, plural"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* Word Bank */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Word Bank (optional)
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(elementData.properties?.wordBank || []).map((word: string, idx: number) => (
                      <Chip
                        key={idx}
                        label={word}
                        size="small"
                        onDelete={() => {
                          const wordBank = elementData.properties?.wordBank || [];
                          onUpdate?.({ wordBank: wordBank.filter((_: string, i: number) => i !== idx) });
                        }}
                        sx={{ fontSize: '12px' }}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Add word..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          const wordBank = elementData.properties?.wordBank || [];
                          onUpdate?.({ wordBank: [...wordBank, (e.target as HTMLInputElement).value.trim()] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Press Enter to add words
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'multiple-choice' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Multiple Choice Properties
              </Typography>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Double-click questions or options to edit them inline
              </Typography>

              {/* Questions */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Questions ({elementData.properties?.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const items = elementData.properties?.items || [];
                      const newItem = {
                        number: items.length + 1,
                        question: 'New question?',
                        options: [
                          { letter: 'a', text: 'Option A' },
                          { letter: 'b', text: 'Option B' },
                          { letter: 'c', text: 'Option C' },
                        ],
                      };
                      onUpdate?.({ items: [...items, newItem] });
                    }}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    Add Question
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(elementData.properties?.items || []).map((item: any, itemIndex: number) => (
                    <Paper
                      key={itemIndex}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        background: alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Chip
                            label={`#${item.number}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '11px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items
                                .filter((_: any, idx: number) => idx !== itemIndex)
                                .map((it: any, idx: number) => ({ ...it, number: idx + 1 }));
                              onUpdate?.({ items: updatedItems });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </IconButton>
                        </Stack>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                            Question
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={item.question || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === itemIndex ? { ...it, question: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter your question"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>

                        <Divider />

                        {/* Options */}
                        <Box>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                              Options ({item.options?.length || 0})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Plus size={10} />}
                              onClick={() => {
                                const items = elementData.properties?.items || [];
                                const options = item.options || [];
                                const letters = 'abcdefghijklmnopqrstuvwxyz';
                                const newLetter = letters[options.length] || 'x';
                                const newOption = {
                                  letter: newLetter,
                                  text: `Option ${newLetter.toUpperCase()}`,
                                };
                                const updatedItems = items.map((it: any, idx: number) =>
                                  idx === itemIndex ? { ...it, options: [...options, newOption] } : it
                                );
                                onUpdate?.({ items: updatedItems });
                              }}
                              sx={{ fontSize: '10px', textTransform: 'none', py: 0.25 }}
                            >
                              Add Option
                            </Button>
                          </Stack>

                          <Stack spacing={1}>
                            {(item.options || []).map((option: any, optIndex: number) => (
                              <Stack
                                key={optIndex}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  p: 1,
                                  borderRadius: '8px',
                                  background: '#FFFFFF',
                                }}
                              >
                                <Chip
                                  label={option.letter}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    minWidth: '28px',
                                    height: '24px',
                                  }}
                                />
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={option.text || ''}
                                  onChange={(e) => {
                                    const items = elementData.properties?.items || [];
                                    const updatedItems = items.map((it: any, idx: number) =>
                                      idx === itemIndex
                                        ? {
                                            ...it,
                                            options: it.options.map((opt: any, oidx: number) =>
                                              oidx === optIndex ? { ...opt, text: e.target.value } : opt
                                            ),
                                          }
                                        : it
                                    );
                                    onUpdate?.({ items: updatedItems });
                                  }}
                                  placeholder={`Option ${option.letter.toUpperCase()}`}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                    },
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const items = elementData.properties?.items || [];
                                    const updatedItems = items.map((it: any, idx: number) =>
                                      idx === itemIndex
                                        ? {
                                            ...it,
                                            options: it.options.filter((_: any, oidx: number) => oidx !== optIndex),
                                          }
                                        : it
                                    );
                                    onUpdate?.({ items: updatedItems });
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <Trash2 size={12} color="#EF4444" />
                                </IconButton>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'true-false' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                True/False Properties
              </Typography>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Double-click statements to edit them inline
              </Typography>

              {/* Statements */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Statements ({elementData.properties?.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const items = elementData.properties?.items || [];
                      const newItem = {
                        number: items.length + 1,
                        statement: 'New true/false statement.',
                      };
                      onUpdate?.({ items: [...items, newItem] });
                    }}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    Add Statement
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(elementData.properties?.items || []).map((item: any, itemIndex: number) => (
                    <Paper
                      key={itemIndex}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        background: alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Chip
                            label={`#${item.number}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '11px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items
                                .filter((_: any, idx: number) => idx !== itemIndex)
                                .map((it: any, idx: number) => ({ ...it, number: idx + 1 }));
                              onUpdate?.({ items: updatedItems });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </IconButton>
                        </Stack>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                            Statement
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={item.statement || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === itemIndex ? { ...it, statement: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter true or false statement"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'short-answer' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Short Answer Properties
              </Typography>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Double-click questions to edit them inline
              </Typography>

              {/* Questions */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Questions ({elementData.properties?.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const items = elementData.properties?.items || [];
                      const newItem = {
                        number: items.length + 1,
                        question: 'New question?',
                        lines: 3,
                      };
                      onUpdate?.({ items: [...items, newItem] });
                    }}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    Add Question
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(elementData.properties?.items || []).map((item: any, itemIndex: number) => (
                    <Paper
                      key={itemIndex}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        background: alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Chip
                            label={`#${item.number}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '11px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items
                                .filter((_: any, idx: number) => idx !== itemIndex)
                                .map((it: any, idx: number) => ({ ...it, number: idx + 1 }));
                              onUpdate?.({ items: updatedItems });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </IconButton>
                        </Stack>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                            Question
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={item.question || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === itemIndex ? { ...it, question: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter your question"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>

                        <Divider />

                        {/* Number of Lines */}
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Answer Lines ({item.lines || 3})
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {[1, 2, 3, 4, 5].map((lineCount) => {
                              const isActive = item.lines === lineCount;
                              return (
                                <Box
                                  key={lineCount}
                                  onClick={() => {
                                    const items = elementData.properties?.items || [];
                                    const updatedItems = items.map((it: any, idx: number) =>
                                      idx === itemIndex ? { ...it, lines: lineCount } : it
                                    );
                                    onUpdate?.({ items: updatedItems });
                                  }}
                                  sx={{
                                    flex: 1,
                                    p: 1,
                                    borderRadius: '6px',
                                    border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                                    backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': {
                                      borderColor: '#2563EB',
                                      backgroundColor: '#F9FAFB',
                                    },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '13px',
                                      fontWeight: isActive ? 600 : 500,
                                      color: isActive ? '#2563EB' : '#6B7280',
                                    }}
                                  >
                                    {lineCount}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                            Select number of writing lines for this question
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'image-placeholder' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Image Properties
              </Typography>

              {/* Image URL */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Image URL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                  value={elementData.properties?.url || ''}
                  onChange={(e) => onUpdate?.({ url: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                  Enter a direct link to an image (jpg, png, gif, svg)
                </Typography>
              </Box>

              <Divider />

              {/* Caption */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Caption
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Image description..."
                  value={elementData.properties?.caption || ''}
                  onChange={(e) => onUpdate?.({ caption: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                  💡 Tip: Double-click caption on canvas to edit it inline
                </Typography>
              </Box>

              <Divider />

              {/* Position/Alignment */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Position
                </Typography>

                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Left', value: 'left', icon: AlignLeft },
                    { label: 'Center', value: 'center', icon: AlignCenter },
                    { label: 'Right', value: 'right', icon: AlignRight },
                  ].map((position) => {
                    const isActive = (elementData.properties?.align || 'center') === position.value;
                    const Icon = position.icon;
                    return (
                      <Box
                        key={position.value}
                        onClick={() => onUpdate?.({ align: position.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          '&:hover': {
                            borderColor: '#2563EB',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Icon size={18} color={isActive ? '#2563EB' : '#6B7280'} />
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#2563EB' : '#6B7280',
                          }}
                        >
                          {position.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Size Presets */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Image Size
                </Typography>

                <Stack spacing={1}>
                  {[
                    { label: 'Small', size: '200×150', width: 200, height: 150 },
                    { label: 'Medium', size: '400×300', width: 400, height: 300 },
                    { label: 'Large', size: '600×450', width: 600, height: 450 },
                    { label: 'Full Width', size: '794×auto', width: 794, height: 400 },
                  ].map((preset) => {
                    const isActive = elementData.properties?.width === preset.width && 
                                    elementData.properties?.height === preset.height;
                    return (
                      <Box
                        key={preset.label}
                        onClick={() => onUpdate?.({ width: preset.width, height: preset.height })}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover': {
                            borderColor: '#2563EB',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 24,
                              border: '2px solid #9CA3AF',
                              borderRadius: '4px',
                              backgroundColor: isActive ? '#2563EB' : '#F3F4F6',
                              transition: 'all 0.2s',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? '#2563EB' : '#374151',
                            }}
                          >
                            {preset.label}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            color: '#9CA3AF',
                            fontFamily: 'monospace',
                          }}
                        >
                          {preset.size}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1, display: 'block' }}>
                  Current: {elementData.properties?.width || 400}×{elementData.properties?.height || 300}px
                </Typography>
              </Box>

              {/* Image Preview */}
              {elementData.properties?.url && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: '150px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F9FAFB',
                      }}
                    >
                      <Box
                        component="img"
                        src={elementData.properties.url}
                        alt="Preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = '<div style="color: #EF4444; font-size: 12px; text-align: center;">❌<br/>Invalid image URL</div>';
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </>
              )}

              {/* Quick Image Examples */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  🎨 Quick Examples
                </Typography>
                <Stack spacing={0.5}>
                  {[
                    { label: '🐱 Pexels Cat Photo', url: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400' },
                    { label: 'Placeholder 400×300', url: 'https://via.placeholder.com/400x300' },
                    { label: 'Unsplash Random', url: 'https://source.unsplash.com/random/400x300' },
                    { label: 'Picsum Random', url: 'https://picsum.photos/400/300' },
                  ].map((example) => (
                    <Box
                      key={example.label}
                      onClick={() => onUpdate?.({ url: example.url })}
                      sx={{
                        p: 1,
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#6B7280',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#2563EB',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                        },
                      }}
                    >
                      {example.label}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>🚧</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Properties Coming Soon
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Properties for <strong>{elementData.type}</strong> will be available soon
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Navigation Back */}
          <Button
            fullWidth
            size="small"
            startIcon={<ArrowLeft size={14} />}
            variant="outlined"
            onClick={() => onSelectionChange?.({ type: 'page', data: pageData })}
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              justifyContent: 'flex-start',
              mb: 1,
            }}
          >
            Back to Page
          </Button>

          {/* Actions */}
          <Stack spacing={1}>
            <Button
              fullWidth
              size="small"
              startIcon={<Copy size={14} />}
              variant="outlined"
              onClick={() => onDuplicate?.(pageData.id, elementData.id)}
              sx={{ borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
            >
              Duplicate Element (Ctrl+D)
            </Button>
            <Button
              fullWidth
              size="small"
              startIcon={<Trash2 size={14} />}
              variant="outlined"
              color="error"
              onClick={() => onDelete?.(pageData.id, elementData.id)}
              sx={{ borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
            >
              Delete Element (Del)
            </Button>
          </Stack>
        </Box>
      </Paper>
    );
  }
};

export default RightSidebar;
