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
  Slider,
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
  onDelete?: (pageId: string, elementId: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  selection, 
  onSelectionChange,
  onUpdate,
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
              sx={{ borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start' }}
            >
              Duplicate Element
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
