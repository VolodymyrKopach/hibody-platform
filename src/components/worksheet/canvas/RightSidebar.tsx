'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  Tabs,
  Tab,
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
  Palette,
  Droplet,
  Check,
  X,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Upload,
  Image as ImageIcon,
  Trash,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { alpha } from '@mui/material';
import { 
  BACKGROUND_PRESETS, 
  GRADIENT_PRESETS, 
  PATTERN_PRESETS, 
  TEMPLATE_PRESETS 
} from '@/constants/backgroundPresets';
import { RichTextEditor } from './shared/RichTextEditor';
import { WorksheetEdit, WorksheetEditContext } from '@/types/worksheet-generation';
import AIAssistantPanel from './ai/AIAssistantPanel';
import ManualPropertyEditor from '../properties/ManualPropertyEditor';
import { 
  isInteractiveComponent,
  getComponentPropertySchema,
} from '@/constants/interactive-properties-schema';
import { ThemeName } from '@/types/themes';
import { getDefaultThemeForAge } from '@/constants/visual-themes';
import { VisualChipSelector, ChipOption } from '../properties/VisualChipSelector';
import { AgeStyleName } from '@/types/interactive-age-styles';
import { getAllAgeStyles, AGE_STYLE_LABELS } from '@/constants/interactive-age-styles';

interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: string;
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
  gradient?: {
    from: string;
    to: string;
    colors?: string[]; // For multi-color gradients (2-4 colors)
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number; // Custom scale multiplier (0.5 - 2.0)
    opacity?: number; // Pattern opacity (0-100)
  };
  opacity?: number;
}

type Selection = 
  | { type: 'page'; data: any }
  | { type: 'element'; pageData: any; elementData: any }
  | null;

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selection: Selection;
  onSelectionChange?: (selection: Selection) => void;
  onUpdate?: (updates: any) => void;
  onDuplicate?: (pageId: string, elementId: string) => void;
  onDelete?: (pageId: string, elementId: string) => void;
  onPageBackgroundUpdate?: (pageId: string, background: PageBackground) => void;
  onImageUpload?: (pageId: string, file: File) => Promise<void>;
  // AI Editing props
  parameters?: any;
  onAIEdit?: (instruction: string) => Promise<void>;
  editHistory?: WorksheetEdit[];
  isAIEditing?: boolean;
  editError?: string | null;
  onClearEditError?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  isOpen,
  onToggle,
  selection, 
  onSelectionChange,
  onUpdate,
  onDuplicate,
  onDelete,
  onPageBackgroundUpdate,
  onImageUpload,
  // AI Editing props
  parameters,
  onAIEdit,
  editHistory = [],
  isAIEditing = false,
  editError = null,
  onClearEditError
}) => {
  const theme = useTheme();
  const sidebarWidth = isOpen ? 320 : 72;
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [patternBgColor, setPatternBgColor] = useState('#FFFFFF');
  const [patternFgColor, setPatternFgColor] = useState('#E5E7EB');
  const [patternScale, setPatternScale] = useState(1);
  const [patternOpacity, setPatternOpacity] = useState(100);
  
  // Gradient builder state
  const [gradientColors, setGradientColors] = useState<string[]>(['#667eea', '#764ba2']);
  const [gradientDirection, setGradientDirection] = useState<'to-right' | 'to-left' | 'to-bottom' | 'to-top' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left'>('to-right');
  
  // Image background state
  const [imageSize, setImageSize] = useState<'cover' | 'contain' | 'repeat' | 'auto'>('cover');
  const [imagePosition, setImagePosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [imageOpacity, setImageOpacity] = useState(100);
  
  // Background tab state
  const [backgroundTab, setBackgroundTab] = useState<'colors' | 'gradients' | 'patterns' | 'templates'>('colors');
  
  // Main sidebar tab state  
  const [mainTab, setMainTab] = useState<'properties' | 'ai'>('properties');

  // Update local color state when selection changes
  React.useEffect(() => {
    if (selection?.type === 'page') {
      const bg = selection.data.background;
      
      if (bg?.color) {
        setCustomColor(bg.color);
      }
      
      if (bg?.type === 'pattern' && bg.pattern) {
        setPatternBgColor(bg.pattern.backgroundColor);
        setPatternFgColor(bg.pattern.patternColor);
        setPatternScale(bg.pattern.scale || 1);
        setPatternOpacity(bg.pattern.opacity || 100);
      }
      
      if (bg?.type === 'gradient' && bg.gradient) {
        // Support multi-color gradients
        const colors = bg.gradient.colors || [bg.gradient.from, bg.gradient.to];
        setGradientColors(colors);
        setGradientDirection(bg.gradient.direction);
      }
      
      if (bg?.type === 'image' && bg.image) {
        setImageSize(bg.image.size);
        setImagePosition(bg.image.position);
        setImageOpacity(bg.image.opacity || 100);
      }
    }
  }, [selection]);

  // Auto-set theme based on component age or fallback to worksheet age
  React.useEffect(() => {
    if (selection?.type === 'element') {
      const elementData = selection.elementData;
      
      // Use component-specific age or fallback to worksheet age
      const ageToUse = elementData.properties?.componentAge || parameters?.ageGroup;
      
      if (ageToUse) {
        // Only auto-set theme if it's not already set or if age changed
        const autoTheme = getDefaultThemeForAge(ageToUse, elementData.type);
        
        // Update theme if it's different from current
        if (autoTheme !== elementData.properties?.theme) {
          onUpdate?.({ theme: autoTheme });
        }
      }
    }
  }, [selection, parameters?.ageGroup, onUpdate]);

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
          width: sidebarWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'hidden',
        }}
      >
        {/* Header with Toggle Button */}
        <Box
          sx={{
            p: isOpen ? 2 : 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
          }}
        >
          {isOpen && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              Properties
            </Typography>
          )}
          
          <Tooltip title={isOpen ? "Collapse panel" : "Expand panel"} placement="left">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isOpen ? <ChevronRight size={20} /> : <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: isOpen ? 3 : 1 }}>
          {isOpen ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>👈</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Nothing selected
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select a page or element to edit
              </Typography>
            </Box>
          ) : (
            <Settings size={20} color={theme.palette.text.disabled} />
          )}
        </Box>
      </Paper>
    );
  }

  // CASE 1: Page selected
  if (selection.type === 'page') {
    const pageData = selection.data;

    // Build context for AI Assistant
    const aiContext: WorksheetEditContext | undefined = parameters ? {
      topic: parameters.topic || 'General',
      ageGroup: parameters.level || parameters.ageGroup || 'general',
      difficulty: parameters.difficulty || 'medium',
      language: parameters.language || 'en',
    } : undefined;

    return (
      <Paper
        elevation={0}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'hidden',
        }}
      >
        {/* Header with Toggle Button */}
        <Box
          sx={{
            p: isOpen ? 2 : 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
          }}
        >
          {isOpen && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              Page Properties
            </Typography>
          )}
          
          <Tooltip title={isOpen ? "Collapse panel" : "Expand panel"} placement="left">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isOpen ? <ChevronRight size={20} /> : <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {isOpen ? (
          <>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, px: 2 }}>
              <Tabs
                value={mainTab}
                onChange={(e, newValue) => setMainTab(newValue)}
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    fontWeight: 600,
                  },
                }}
              >
                <Tab 
                  value="properties" 
                  label="Properties" 
                  icon={<Palette size={16} />}
                  iconPosition="start"
                />
                <Tab 
                  value="ai" 
                  label="AI Assistant" 
                  icon={<Sparkles size={16} />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </>
        ) : (
          // Collapsed mode - Single settings icon
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={24} color={theme.palette.text.secondary} />
          </Box>
        )}

        {/* Tab Content - Only show when expanded */}
        {isOpen && (
          <>
            {mainTab === 'properties' ? (
              <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>

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

            {/* Background */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Palette size={16} color={theme.palette.text.secondary} />
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  Background
                </Typography>
              </Stack>
              
              {/* Tabs for background options */}
              <Tabs 
                value={backgroundTab} 
                onChange={(e, newValue) => setBackgroundTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  mb: 2,
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 0.75,
                    px: 1.5,
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab value="colors" label="Colors" />
                <Tab value="gradients" label="Gradients" />
                <Tab value="patterns" label="Patterns" />
                <Tab value="templates" label="Templates" />
              </Tabs>
              
              <Divider sx={{ mb: 2 }} />
              
              {/* Content based on selected tab */}
              <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
                {backgroundTab === 'colors' && (
                  <Stack spacing={1.5}>
                    {/* Color Presets */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {BACKGROUND_PRESETS.map((preset) => (
                        <Tooltip key={preset.color} title={preset.name} placement="top">
                          <Box
                            onClick={() => {
                              if (onPageBackgroundUpdate && pageData) {
                                onPageBackgroundUpdate(pageData.id, {
                                  type: 'solid',
                                  color: preset.color,
                                  opacity: 100,
                                });
                              }
                            }}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              backgroundColor: preset.color,
                              border: `2px solid ${
                                pageData?.background?.color === preset.color
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.divider, 0.2)
                              }`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                              },
                            }}
                          >
                            {preset.icon}
                          </Box>
                        </Tooltip>
                      ))}
                    </Stack>

                    {/* Custom Color Input */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                        Custom Color
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        onBlur={() => {
                          if (onPageBackgroundUpdate && pageData) {
                            onPageBackgroundUpdate(pageData.id, {
                              type: 'solid',
                              color: customColor,
                              opacity: 100,
                            });
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: 40,
                          },
                          '& input[type="color"]': {
                            cursor: 'pointer',
                            height: 30,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                )}

                {backgroundTab === 'gradients' && (
                  <Stack spacing={1.5}>
                    {GRADIENT_PRESETS.map((gradient, index) => {
                      const colors = gradient.colors || [gradient.from, gradient.to];
                      const cssDirection = gradient.direction.replace(/-/g, ' ');
                      const gradientStyle = `linear-gradient(${cssDirection}, ${colors.join(', ')})`;
                      const isCurrentBackground = pageData?.background?.type === 'gradient' && 
                        pageData?.background?.gradient?.from === gradient.from &&
                        pageData?.background?.gradient?.to === gradient.to;
                      
                      return (
                        <Tooltip key={index} title={gradient.name} placement="left">
                          <Box
                            onClick={() => {
                              if (onPageBackgroundUpdate && pageData) {
                                onPageBackgroundUpdate(pageData.id, {
                                  type: 'gradient',
                                  gradient: {
                                    from: gradient.from,
                                    to: gradient.to,
                                    colors: gradient.colors,
                                    direction: gradient.direction,
                                  },
                                  opacity: 100,
                                });
                              }
                            }}
                            sx={{
                              width: '100%',
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              border: isCurrentBackground 
                                ? `2px solid ${theme.palette.primary.main}`
                                : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              transition: 'all 0.2s',
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              },
                            }}
                          >
                            {/* Gradient Preview */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1,
                                background: gradientStyle,
                                flexShrink: 0,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                              }}
                            />
                            
                            {/* Name */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <span>{gradient.icon}</span>
                                <span>{gradient.name}</span>
                              </Typography>
                            </Box>
                            
                            {/* Check Icon */}
                            {isCurrentBackground && (
                              <Box
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Check size={14} />
                              </Box>
                            )}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                )}

                {backgroundTab === 'patterns' && (
                  <Stack spacing={1.5}>
                    {PATTERN_PRESETS.map((pattern) => {
                      const previewStyle = {
                        background: pattern.backgroundColor,
                        backgroundImage: pattern.css,
                        backgroundSize: pattern.backgroundSize,
                        backgroundPosition: pattern.backgroundPosition || '0 0',
                      };
                      
                      return (
                        <Tooltip key={pattern.pattern} title={pattern.name} placement="left">
                          <Paper
                            elevation={0}
                            onClick={() => {
                              if (onPageBackgroundUpdate && pageData) {
                                onPageBackgroundUpdate(pageData.id, {
                                  type: 'pattern',
                                  pattern: {
                                    name: pattern.pattern,
                                    backgroundColor: pattern.backgroundColor,
                                    patternColor: pattern.patternColor,
                                    css: pattern.css,
                                    backgroundSize: pattern.backgroundSize,
                                    backgroundPosition: pattern.backgroundPosition,
                                    scale: 1,
                                    opacity: 100,
                                  },
                                  opacity: 100,
                                });
                              }
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              backgroundColor: theme.palette.background.paper,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              },
                            }}
                          >
                            {/* Preview */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1,
                                ...previewStyle,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                                flexShrink: 0,
                              }}
                            />
                            
                            {/* Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <span>{pattern.icon}</span>
                                <span>{pattern.name}</span>
                              </Typography>
                            </Box>
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                )}

                {backgroundTab === 'templates' && (
                  <Stack spacing={1.5}>
                    {TEMPLATE_PRESETS.map((template) => {
                      // Generate preview style
                      const getPreviewStyle = () => {
                        const bg = template.background;
                        if (bg.type === 'solid') {
                          return { background: bg.color };
                        } else if (bg.type === 'gradient' && bg.gradient) {
                          const colors = bg.gradient.colors || [bg.gradient.from, bg.gradient.to];
                          const cssDirection = bg.gradient.direction.replace(/-/g, ' ');
                          return { background: `linear-gradient(${cssDirection}, ${colors.join(', ')})` };
                        } else if (bg.type === 'pattern' && bg.pattern) {
                          return {
                            background: bg.pattern.backgroundColor,
                            backgroundImage: bg.pattern.css,
                            backgroundSize: bg.pattern.backgroundSize,
                            backgroundPosition: bg.pattern.backgroundPosition || '0 0',
                          };
                        }
                        return { background: 'white' };
                      };

                      return (
                        <Tooltip key={template.name} title={template.description} placement="left">
                          <Paper
                            elevation={0}
                            onClick={() => {
                              if (onPageBackgroundUpdate && pageData) {
                                onPageBackgroundUpdate(pageData.id, {
                                  ...template.background,
                                  opacity: 100,
                                });
                              }
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              backgroundColor: theme.palette.background.paper,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              },
                            }}
                          >
                            {/* Preview */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1,
                                ...getPreviewStyle(),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                                flexShrink: 0,
                              }}
                            />
                            
                            {/* Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  mb: 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <span>{template.icon}</span>
                                <span>{template.name}</span>
                              </Typography>
                              <Chip 
                                label={template.category}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </Box>
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Gradient Builder */}
            {pageData.background?.type === 'gradient' && pageData.background.gradient && (
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Custom Gradient Builder
                </Typography>
                
                <Stack spacing={2.5}>
                  {/* Live Preview */}
                  <Paper
                    elevation={0}
                    sx={{
                      height: 80,
                      borderRadius: 2,
                      background: `linear-gradient(${gradientDirection.replace(/-/g, ' ')}, ${gradientColors.join(', ')})`,
                      border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  />

                  {/* Color Stops */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Gradient Colors ({gradientColors.length})
                      </Typography>
                      {gradientColors.length < 4 && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setGradientColors([...gradientColors, '#FF6B6B']);
                          }}
                          sx={{ width: 24, height: 24 }}
                        >
                          <Plus size={14} />
                        </IconButton>
                      )}
                    </Stack>
                    
                    <Stack spacing={1}>
                      {gradientColors.map((color, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="center">
                          <TextField
                            size="small"
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            sx={{
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                height: 36,
                              },
                              '& input[type="color"]': {
                                cursor: 'pointer',
                                height: 26,
                              },
                            }}
                          />
                          <TextField
                            size="small"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            sx={{
                              width: 90,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                height: 36,
                                fontSize: '0.75rem',
                              },
                            }}
                          />
                          {gradientColors.length > 2 && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setGradientColors(gradientColors.filter((_, i) => i !== index));
                              }}
                              sx={{ width: 28, height: 28 }}
                            >
                              <X size={14} />
                            </IconButton>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  {/* Direction Selector */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1, display: 'block' }}>
                      Direction
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {[
                        { value: 'to-right', icon: <ArrowRight size={14} />, label: 'Right' },
                        { value: 'to-left', icon: <ArrowLeft size={14} />, label: 'Left' },
                        { value: 'to-bottom', icon: <ArrowDown size={14} />, label: 'Down' },
                        { value: 'to-top', icon: <ArrowLeft size={14} style={{ transform: 'rotate(90deg)' }} />, label: 'Up' },
                        { value: 'to-bottom-right', icon: <ArrowDownRight size={14} />, label: '↘' },
                        { value: 'to-bottom-left', icon: <ArrowDownRight size={14} style={{ transform: 'scaleX(-1)' }} />, label: '↙' },
                        { value: 'to-top-right', icon: <ArrowUpRight size={14} />, label: '↗' },
                        { value: 'to-top-left', icon: <ArrowUpRight size={14} style={{ transform: 'scaleX(-1)' }} />, label: '↖' },
                      ].map((dir) => (
                        <Tooltip key={dir.value} title={dir.label}>
                          <IconButton
                            size="small"
                            onClick={() => setGradientDirection(dir.value as any)}
                            sx={{
                              width: 36,
                              height: 36,
                              border: `2px solid ${
                                gradientDirection === dir.value
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.divider, 0.2)
                              }`,
                              backgroundColor: gradientDirection === dir.value
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'transparent',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            {dir.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Stack>
                  </Box>

                  {/* Apply Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      if (onPageBackgroundUpdate && gradientColors.length >= 2) {
                        onPageBackgroundUpdate(pageData.id, {
                          type: 'gradient',
                          gradient: {
                            from: gradientColors[0],
                            to: gradientColors[gradientColors.length - 1],
                            colors: gradientColors, // Include all colors for multi-color support
                            direction: gradientDirection,
                          },
                          opacity: 100,
                        });
                      }
                    }}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      py: 1,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Apply Custom Gradient
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Pattern Customization Controls */}
            {pageData.background?.type === 'pattern' && pageData.background.pattern && (
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Pattern Customization
                </Typography>
                
                <Stack spacing={2}>
                  {/* Background Color */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                      Background Color
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="color"
                      value={patternBgColor}
                      onChange={(e) => {
                        setPatternBgColor(e.target.value);
                      }}
                      onBlur={() => {
                        if (onPageBackgroundUpdate && pageData.background?.pattern) {
                          onPageBackgroundUpdate(pageData.id, {
                            type: 'pattern',
                            pattern: {
                              ...pageData.background.pattern,
                              backgroundColor: patternBgColor,
                            },
                            opacity: 100,
                          });
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          height: 40,
                        },
                        '& input[type="color"]': {
                          cursor: 'pointer',
                          height: 30,
                        },
                      }}
                    />
                  </Box>

                  {/* Pattern Color */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                      Pattern Color
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="color"
                      value={patternFgColor}
                      onChange={(e) => {
                        setPatternFgColor(e.target.value);
                      }}
                      onBlur={() => {
                        if (onPageBackgroundUpdate && pageData.background?.pattern) {
                          onPageBackgroundUpdate(pageData.id, {
                            type: 'pattern',
                            pattern: {
                              ...pageData.background.pattern,
                              patternColor: patternFgColor,
                            },
                            opacity: 100,
                          });
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          height: 40,
                        },
                        '& input[type="color"]': {
                          cursor: 'pointer',
                          height: 30,
                        },
                      }}
                    />
                  </Box>

                  {/* Pattern Scale */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Pattern Size
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        {Math.round(patternScale * 100)}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={patternScale}
                      onChange={(e, newValue) => {
                        setPatternScale(newValue as number);
                      }}
                      onChangeCommitted={(e, newValue) => {
                        if (onPageBackgroundUpdate && pageData.background?.pattern) {
                          onPageBackgroundUpdate(pageData.id, {
                            type: 'pattern',
                            pattern: {
                              ...pageData.background.pattern,
                              scale: newValue as number,
                            },
                            opacity: 100,
                          });
                        }
                      }}
                      min={0.5}
                      max={2}
                      step={0.1}
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>

                  {/* Pattern Opacity */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Pattern Opacity
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        {patternOpacity}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={patternOpacity}
                      onChange={(e, newValue) => {
                        setPatternOpacity(newValue as number);
                      }}
                      onChangeCommitted={(e, newValue) => {
                        if (onPageBackgroundUpdate && pageData.background?.pattern) {
                          onPageBackgroundUpdate(pageData.id, {
                            type: 'pattern',
                            pattern: {
                              ...pageData.background.pattern,
                              opacity: newValue as number,
                            },
                            opacity: 100,
                          });
                        }
                      }}
                      min={0}
                      max={100}
                      step={5}
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>

                  {/* Reset Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (onPageBackgroundUpdate && pageData?.background?.pattern) {
                        const originalPattern = pageData.background.pattern;
                        setPatternScale(1);
                        setPatternOpacity(100);
                        onPageBackgroundUpdate(pageData.id, {
                          type: 'pattern',
                          pattern: {
                            ...originalPattern,
                            scale: 1,
                            opacity: 100,
                          },
                          opacity: 100,
                        });
                      }
                    }}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                    }}
                  >
                    Reset Pattern Settings
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Image Upload & Customization */}
            <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <ImageIcon size={16} color={theme.palette.text.secondary} />
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  Custom Image Background
                </Typography>
              </Stack>

              {!pageData.background || pageData.background.type !== 'image' ? (
                // Upload Button
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<Upload size={16} />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderStyle: 'dashed',
                    py: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && onImageUpload) {
                        await onImageUpload(pageData.id, file);
                      }
                    }}
                  />
                </Button>
              ) : (
                // Image Controls
                <Stack spacing={2}>
                  {/* Preview */}
                  <Paper
                    elevation={0}
                    sx={{
                      height: 120,
                      borderRadius: 2,
                      backgroundImage: `url(${pageData.background.image?.url})`,
                      backgroundSize: imageSize,
                      backgroundPosition: imagePosition,
                      backgroundRepeat: imageSize === 'repeat' ? 'repeat' : 'no-repeat',
                      opacity: imageOpacity / 100,
                      border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  />

                  {/* Size Control */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1, display: 'block' }}>
                      Image Size
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {['cover', 'contain', 'repeat', 'auto'].map((size) => (
                        <Button
                          key={size}
                          size="small"
                          variant={imageSize === size ? 'contained' : 'outlined'}
                          onClick={() => {
                            setImageSize(size as any);
                            if (onPageBackgroundUpdate && pageData.background?.image) {
                              onPageBackgroundUpdate(pageData.id, {
                                type: 'image',
                                image: {
                                  ...pageData.background.image,
                                  size: size as any,
                                },
                                opacity: 100,
                              });
                            }
                          }}
                          sx={{
                            flex: 1,
                            textTransform: 'capitalize',
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            minWidth: 0,
                            px: 1,
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  {/* Position Control */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1, display: 'block' }}>
                      Position
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {['center', 'top', 'bottom', 'left', 'right'].map((pos) => (
                        <Button
                          key={pos}
                          size="small"
                          variant={imagePosition === pos ? 'contained' : 'outlined'}
                          onClick={() => {
                            setImagePosition(pos as any);
                            if (onPageBackgroundUpdate && pageData.background?.image) {
                              onPageBackgroundUpdate(pageData.id, {
                                type: 'image',
                                image: {
                                  ...pageData.background.image,
                                  position: pos as any,
                                },
                                opacity: 100,
                              });
                            }
                          }}
                          sx={{
                            flex: 1,
                            textTransform: 'capitalize',
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            minWidth: 0,
                            px: 0.5,
                          }}
                        >
                          {pos}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  {/* Opacity */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Opacity
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        {imageOpacity}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={imageOpacity}
                      onChange={(e, newValue) => {
                        setImageOpacity(newValue as number);
                      }}
                      onChangeCommitted={(e, newValue) => {
                        if (onPageBackgroundUpdate && pageData.background?.image) {
                          onPageBackgroundUpdate(pageData.id, {
                            type: 'image',
                            image: {
                              ...pageData.background.image,
                              opacity: newValue as number,
                            },
                            opacity: 100,
                          });
                        }
                      }}
                      min={0}
                      max={100}
                      step={5}
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>

                  {/* Remove Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Trash size={14} />}
                    onClick={() => {
                      if (onPageBackgroundUpdate && pageData) {
                        onPageBackgroundUpdate(pageData.id, {
                          type: 'solid',
                          color: '#FFFFFF',
                          opacity: 100,
                        });
                      }
                    }}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                    }}
                  >
                    Remove Image
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>

          </Box>
        ) : (
          <Box sx={{ flex: 1, p: 2, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* AI Assistant Panel */}
            {aiContext && onAIEdit ? (
              <AIAssistantPanel
                selection={selection}
                context={aiContext}
                onEdit={onAIEdit}
                editHistory={editHistory}
                isEditing={isAIEditing}
                error={editError}
                onClearError={onClearEditError}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  AI Assistant не доступний. Переконайтесь що worksheet згенерований з параметрами.
                </Typography>
              </Box>
            )}
          </Box>
        )}
          </>
        )}
      </Paper>
    );
  }

  // CASE 2: Element selected
  if (selection.type === 'element') {
    const { pageData, elementData } = selection;

    // Build context for AI Assistant
    const aiContext: WorksheetEditContext | undefined = parameters ? {
      topic: parameters.topic || 'General',
      ageGroup: parameters.level || parameters.ageGroup || 'general',
      difficulty: parameters.difficulty || 'medium',
      language: parameters.language || 'en',
    } : undefined;

    return (
      <Paper
        elevation={0}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          height: '100%',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'hidden',
        }}
      >
        {/* Header with Toggle Button */}
        <Box
          sx={{
            p: isOpen ? 2 : 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
          }}
        >
          {isOpen && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              Element Properties
            </Typography>
          )}
          
          <Tooltip title={isOpen ? "Collapse panel" : "Expand panel"} placement="left">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isOpen ? <ChevronRight size={20} /> : <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {isOpen ? (
          <>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, px: 2 }}>
              <Tabs
                value={mainTab}
                onChange={(e, newValue) => setMainTab(newValue)}
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    fontWeight: 600,
                  },
                }}
              >
                <Tab 
                  value="properties" 
                  label="Properties" 
                  icon={<Settings size={16} />}
                  iconPosition="start"
                />
                <Tab 
                  value="ai" 
                  label="AI Assistant" 
                  icon={<Sparkles size={16} />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </>
        ) : (
          // Collapsed mode - Single settings icon
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={24} color={theme.palette.text.secondary} />
          </Box>
        )}

        {/* Tab Content - Only show when expanded */}
        {isOpen && (
          <>
            {mainTab === 'properties' ? (
              <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          

          {/* Check if interactive component - use Manual Property Editor */}
          {/* Exception: tap-image uses custom UI below */}
          {isInteractiveComponent(elementData.type) && elementData.type !== 'tap-image' ? (
            (() => {
              const schema = getComponentPropertySchema(elementData.type);
              return schema ? (
                <ManualPropertyEditor
                  schema={schema}
                  properties={elementData.properties}
                  onChange={(newProperties) => {
                    onUpdate?.(newProperties);
                  }}
                />
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
              );
            })()
          ) : elementData.type === 'title-block' ? (
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
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Text Content
                </Typography>
                <Box sx={{
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }}>
                  <RichTextEditor
                    content={(() => {
                      const text = elementData.properties?.text ?? '<p></p>';
                      return text;
                    })()}
                    onChange={(html) => {
                      // Санітизація та валідація HTML
                      if (!html || html === 'undefined' || html === 'null') {
                        onUpdate?.({ text: '<p></p>' });
                        return;
                      }
                      
                      onUpdate?.({ text: html });
                    }}
                    onFinishEditing={() => {
                      // onFinishEditing callback
                    }} 
                    isEditing={true}
                    showToolbar={true}
                    hideBorder={true}
                    minHeight="100px"
                    fontSize="14px"
                    placeholder="Enter text content..."
                  />
                </Box>
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
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Text Content
                </Typography>
                <Box sx={{
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }}>
                  <RichTextEditor
                    content={(() => {
                      const text = elementData.properties?.text ?? '<p></p>';
                      console.log('🔵 [InstructionsBox] Initial content:', {
                        raw: elementData.properties?.text,
                        type: typeof elementData.properties?.text,
                        isUndefined: elementData.properties?.text === undefined,
                        isNull: elementData.properties?.text === null,
                        final: text
                      });
                      return text;
                    })()}
                    onChange={(html) => {
                      console.log('🟢 [InstructionsBox] onChange called:', {
                        received: html,
                        type: typeof html,
                        isUndefined: html === undefined,
                        isStringUndefined: html === 'undefined',
                        length: html?.length
                      });
                      
                      // Санітизація та валідація HTML
                      if (!html || html === 'undefined' || html === 'null') {
                        console.log('⚠️ [InstructionsBox] Invalid value detected, setting default');
                        onUpdate?.({ text: '<p></p>' });
                        return;
                      }
                      
                      console.log('✅ [InstructionsBox] Updating with:', html);
                      console.log('🔼 [InstructionsBox] Calling onUpdate callback');
                      onUpdate?.({ text: html });
                      console.log('✔️ [InstructionsBox] onUpdate callback completed');
                    }}
                    onFinishEditing={() => {
                      console.log('🔴 [InstructionsBox] onFinishEditing called');
                    }}
                    isEditing={true}
                    showToolbar={true}
                    hideBorder={true}
                    minHeight="100px"
                    fontSize="13px"
                    placeholder="Enter instructions here..."
                  />
                </Box>
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
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Tip Text
                </Typography>
                <Box sx={{
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }}>
                  <RichTextEditor
                    content={(() => {
                      const text = elementData.properties?.text ?? '<p></p>';
                      console.log('🔵 [TipBox] Initial content:', {
                        raw: elementData.properties?.text,
                        type: typeof elementData.properties?.text,
                        isUndefined: elementData.properties?.text === undefined,
                        isNull: elementData.properties?.text === null,
                        final: text
                      });
                      return text;
                    })()}
                    onChange={(html) => {
                      console.log('🟢 [TipBox] onChange called:', {
                        received: html,
                        type: typeof html,
                        isUndefined: html === undefined,
                        isStringUndefined: html === 'undefined',
                        length: html?.length
                      });
                      
                      // Санітизація та валідація HTML
                      if (!html || html === 'undefined' || html === 'null') {
                        console.log('⚠️ [TipBox] Invalid value detected, setting default');
                        onUpdate?.({ text: '<p></p>' });
                        return;
                      }
                      
                      console.log('✅ [TipBox] Updating with:', html);
                      console.log('🔼 [TipBox] Calling onUpdate callback');
                      onUpdate?.({ text: html });
                      console.log('✔️ [TipBox] onUpdate callback completed');
                    }}
                    onFinishEditing={() => {
                      console.log('🔴 [TipBox] onFinishEditing called');
                    }}
                    isEditing={true}
                    showToolbar={true}
                    hideBorder={true}
                    minHeight="80px"
                    fontSize="13px"
                    placeholder="Enter helpful tip here..."
                  />
                </Box>
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
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Warning Text
                </Typography>
                <Box sx={{
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }}>
                  <RichTextEditor
                    content={(() => {
                      const text = elementData.properties?.text ?? '<p></p>';
                      console.log('🔵 [WarningBox] Initial content:', {
                        raw: elementData.properties?.text,
                        type: typeof elementData.properties?.text,
                        isUndefined: elementData.properties?.text === undefined,
                        isNull: elementData.properties?.text === null,
                        final: text
                      });
                      return text;
                    })()}
                    onChange={(html) => {
                      console.log('🟢 [WarningBox] onChange called:', {
                        received: html,
                        type: typeof html,
                        isUndefined: html === undefined,
                        isStringUndefined: html === 'undefined',
                        length: html?.length
                      });
                      
                      // Санітизація та валідація HTML
                      if (!html || html === 'undefined' || html === 'null') {
                        console.log('⚠️ [WarningBox] Invalid value detected, setting default');
                        onUpdate?.({ text: '<p></p>' });
                        return;
                      }
                      
                      console.log('✅ [WarningBox] Updating with:', html);
                      console.log('🔼 [WarningBox] Calling onUpdate callback');
                      onUpdate?.({ text: html });
                      console.log('✔️ [WarningBox] onUpdate callback completed');
                    }}
                    onFinishEditing={() => {
                      console.log('🔴 [WarningBox] onFinishEditing called');
                    }}
                    isEditing={true}
                    showToolbar={true}
                    hideBorder={true}
                    minHeight="80px"
                    fontSize="13px"
                    placeholder="Enter warning message here..."
                  />
                </Box>
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
          ) : elementData.type === 'match-pairs' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Match Pairs Properties
              </Typography>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Double-click items to edit left and right columns inline
              </Typography>

              {/* Pairs */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Pairs ({elementData.properties?.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const items = elementData.properties?.items || [];
                      const newItem = {
                        number: items.length + 1,
                        left: 'Left item',
                        right: 'Right match',
                      };
                      onUpdate?.({ items: [...items, newItem] });
                    }}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    Add Pair
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
                            Left Column
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.left || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === itemIndex ? { ...it, left: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter left item"
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
                            Right Column
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.right || ''}
                            onChange={(e) => {
                              const items = elementData.properties?.items || [];
                              const updatedItems = items.map((it: any, idx: number) =>
                                idx === itemIndex ? { ...it, right: e.target.value } : it
                              );
                              onUpdate?.({ items: updatedItems });
                            }}
                            placeholder="Enter right match"
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
          ) : elementData.type === 'divider' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Divider Properties
              </Typography>

              {/* Style */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Line Style
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'Solid', value: 'solid', preview: '━━━━━━━' },
                    { label: 'Dashed', value: 'dashed', preview: '╌╌╌╌╌╌╌' },
                    { label: 'Dotted', value: 'dotted', preview: '┈┈┈┈┈┈┈' },
                    { label: 'Double', value: 'double', preview: '═══════' },
                  ].map((style) => {
                    const isActive = (elementData.properties?.style || 'solid') === style.value;
                    return (
                      <Box
                        key={style.value}
                        onClick={() => onUpdate?.({ style: style.value })}
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
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#2563EB' : '#374151',
                          }}
                        >
                          {style.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '16px',
                            color: isActive ? '#2563EB' : '#9CA3AF',
                            fontFamily: 'monospace',
                            letterSpacing: '-2px',
                          }}
                        >
                          {style.preview}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Thickness */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Thickness
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[1, 2, 3, 4].map((thickness) => {
                    const isActive = (elementData.properties?.thickness || 1) === thickness;
                    return (
                      <Box
                        key={thickness}
                        onClick={() => onUpdate?.({ thickness })}
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
                        <Box
                          sx={{
                            width: '100%',
                            height: `${thickness}px`,
                            backgroundColor: isActive ? '#2563EB' : '#9CA3AF',
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#2563EB' : '#6B7280',
                          }}
                        >
                          {thickness}px
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Color */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Color
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[
                    { label: 'Light Gray', value: '#D1D5DB' },
                    { label: 'Gray', value: '#9CA3AF' },
                    { label: 'Dark Gray', value: '#6B7280' },
                    { label: 'Black', value: '#000000' },
                    { label: 'Blue', value: '#2563EB' },
                    { label: 'Red', value: '#EF4444' },
                    { label: 'Green', value: '#10B981' },
                    { label: 'Yellow', value: '#F59E0B' },
                  ].map((color) => {
                    const isActive = (elementData.properties?.color || '#D1D5DB') === color.value;
                    return (
                      <Box
                        key={color.value}
                        onClick={() => onUpdate?.({ color: color.value })}
                        sx={{
                          width: 'calc(50% - 4px)',
                          p: 1,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&:hover': {
                            borderColor: '#2563EB',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '4px',
                            backgroundColor: color.value,
                            border: '1px solid #E5E7EB',
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#2563EB' : '#6B7280',
                          }}
                        >
                          {color.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Spacing */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Spacing
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Small', value: 'small' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Large', value: 'large' },
                  ].map((spacing) => {
                    const isActive = (elementData.properties?.spacing || 'medium') === spacing.value;
                    return (
                      <Box
                        key={spacing.value}
                        onClick={() => onUpdate?.({ spacing: spacing.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
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
                          {spacing.label}
                        </Typography>
                      </Box>
                    );
                  })}
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
          ) : elementData.type === 'bullet-list' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Bullet List Properties
              </Typography>

              {/* List Style */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Bullet Style
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Dot', value: 'dot', icon: '●' },
                    { label: 'Circle', value: 'circle', icon: '○' },
                    { label: 'Square', value: 'square', icon: '■' },
                  ].map((style) => {
                    const isActive = (elementData.properties?.style || 'dot') === style.value;
                    return (
                      <Box
                        key={style.value}
                        onClick={() => onUpdate?.({ style: style.value })}
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
                        <Typography
                          sx={{
                            fontSize: '18px',
                            color: isActive ? '#2563EB' : '#6B7280',
                          }}
                        >
                          {style.icon}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#2563EB' : '#6B7280',
                          }}
                        >
                          {style.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* List Items */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    List Items
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const currentItems = elementData.properties?.items || [];
                      const newId = (Math.max(0, ...currentItems.map((item: any) => parseInt(item.id))) + 1).toString();
                      onUpdate?.({
                        items: [
                          ...currentItems,
                          { id: newId, text: 'New list item' },
                        ],
                      });
                    }}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      px: 1,
                      py: 0.5,
                      minHeight: 0,
                      borderRadius: '6px',
                    }}
                  >
                    Add Item
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  {(elementData.properties?.items || []).map((item: any, index: number) => (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: '#D1D5DB',
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>
                            Item {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentItems = elementData.properties?.items || [];
                              onUpdate?.({
                                items: currentItems.filter((_: any, i: number) => i !== index),
                              });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Stack>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={item.text}
                          onChange={(e) => {
                            const currentItems = [...(elementData.properties?.items || [])];
                            currentItems[index] = { ...item, text: e.target.value };
                            onUpdate?.({ items: currentItems });
                          }}
                          placeholder="Enter list item text..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              fontSize: '0.8125rem',
                            },
                          }}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                {(elementData.properties?.items || []).length === 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center', py: 2 }}
                  >
                    No items yet. Click "Add Item" to start.
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : elementData.type === 'numbered-list' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Numbered List Properties
              </Typography>

              {/* List Style */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Number Style
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'Numbers', value: 'decimal', example: '1, 2, 3' },
                    { label: 'Lowercase Letters', value: 'lower-alpha', example: 'a, b, c' },
                    { label: 'Uppercase Letters', value: 'upper-alpha', example: 'A, B, C' },
                    { label: 'Lowercase Roman', value: 'lower-roman', example: 'i, ii, iii' },
                    { label: 'Uppercase Roman', value: 'upper-roman', example: 'I, II, III' },
                  ].map((style) => {
                    const isActive = (elementData.properties?.style || 'decimal') === style.value;
                    return (
                      <Box
                        key={style.value}
                        onClick={() => onUpdate?.({ style: style.value })}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#2563EB',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? '#2563EB' : '#374151',
                            }}
                          >
                            {style.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '11px',
                              color: isActive ? '#2563EB' : '#9CA3AF',
                              fontFamily: 'monospace',
                            }}
                          >
                            {style.example}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* List Items */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    List Items
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={12} />}
                    onClick={() => {
                      const currentItems = elementData.properties?.items || [];
                      const newId = (Math.max(0, ...currentItems.map((item: any) => parseInt(item.id))) + 1).toString();
                      onUpdate?.({
                        items: [
                          ...currentItems,
                          { id: newId, text: 'New list item' },
                        ],
                      });
                    }}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      px: 1,
                      py: 0.5,
                      minHeight: 0,
                      borderRadius: '6px',
                    }}
                  >
                    Add Item
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  {(elementData.properties?.items || []).map((item: any, index: number) => (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: '#D1D5DB',
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>
                            Item {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentItems = elementData.properties?.items || [];
                              onUpdate?.({
                                items: currentItems.filter((_: any, i: number) => i !== index),
                              });
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Stack>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={item.text}
                          onChange={(e) => {
                            const currentItems = [...(elementData.properties?.items || [])];
                            currentItems[index] = { ...item, text: e.target.value };
                            onUpdate?.({ items: currentItems });
                          }}
                          placeholder="Enter list item text..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              fontSize: '0.8125rem',
                            },
                          }}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                {(elementData.properties?.items || []).length === 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center', py: 2 }}
                  >
                    No items yet. Click "Add Item" to start.
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : elementData.type === 'table' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Table Properties
              </Typography>

              {/* Table Structure */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Table Structure
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<Plus size={14} />}
                      onClick={() => {
                        const currentRows = elementData.properties?.rows || [];
                        const colCount = (elementData.properties?.headers || []).length;
                        const newRow = Array(colCount).fill('New cell');
                        onUpdate?.({ rows: [...currentRows, newRow] });
                      }}
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Add Row
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<Plus size={14} />}
                      onClick={() => {
                        const currentHeaders = elementData.properties?.headers || [];
                        const currentRows = elementData.properties?.rows || [];
                        const newColIndex = currentHeaders.length + 1;
                        onUpdate?.({
                          headers: [...currentHeaders, `Column ${newColIndex}`],
                          rows: currentRows.map(row => [...row, 'New cell']),
                        });
                      }}
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Add Column
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => {
                        const currentRows = elementData.properties?.rows || [];
                        if (currentRows.length > 1) {
                          onUpdate?.({ rows: currentRows.slice(0, -1) });
                        }
                      }}
                      disabled={(elementData.properties?.rows || []).length <= 1}
                      variant="outlined"
                      color="error"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Remove Row
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => {
                        const currentHeaders = elementData.properties?.headers || [];
                        const currentRows = elementData.properties?.rows || [];
                        if (currentHeaders.length > 1) {
                          onUpdate?.({
                            headers: currentHeaders.slice(0, -1),
                            rows: currentRows.map(row => row.slice(0, -1)),
                          });
                        }
                      }}
                      disabled={(elementData.properties?.headers || []).length <= 1}
                      variant="outlined"
                      color="error"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Remove Column
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Show Headers Toggle */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Show Headers
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      onUpdate?.({ hasHeaders: !(elementData.properties?.hasHeaders ?? true) });
                    }}
                    variant={elementData.properties?.hasHeaders ?? true ? 'contained' : 'outlined'}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 60,
                      borderRadius: '8px',
                    }}
                  >
                    {elementData.properties?.hasHeaders ?? true ? 'ON' : 'OFF'}
                  </Button>
                </Stack>
              </Box>

              {/* Border Style */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Border Style
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'All Borders', value: 'all', desc: 'Full grid' },
                    { label: 'Horizontal Only', value: 'horizontal', desc: 'Rows only' },
                    { label: 'Vertical Only', value: 'vertical', desc: 'Columns only' },
                    { label: 'No Borders', value: 'none', desc: 'Clean look' },
                  ].map((style) => {
                    const isActive = (elementData.properties?.borderStyle || 'all') === style.value;
                    return (
                      <Box
                        key={style.value}
                        onClick={() => onUpdate?.({ borderStyle: style.value })}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#2563EB',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#2563EB' : '#374151',
                              }}
                            >
                              {style.label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '11px',
                                color: isActive ? '#2563EB' : '#9CA3AF',
                              }}
                            >
                              {style.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Text Alignment */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Text Alignment
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Left', value: 'left', icon: <AlignLeft size={16} /> },
                    { label: 'Center', value: 'center', icon: <AlignCenter size={16} /> },
                    { label: 'Right', value: 'right', icon: <AlignRight size={16} /> },
                  ].map((align) => {
                    const isActive = (elementData.properties?.textAlign || 'left') === align.value;
                    return (
                      <Button
                        key={align.value}
                        onClick={() => onUpdate?.({ textAlign: align.value })}
                        variant={isActive ? 'contained' : 'outlined'}
                        size="small"
                        sx={{
                          flex: 1,
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          minWidth: 0,
                          px: 1,
                        }}
                      >
                        {align.icon}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              {/* Colors */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Colors
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#6B7280', mb: 0.5, display: 'block' }}>
                      Header Background
                    </Typography>
                    <TextField
                      type="color"
                      size="small"
                      value={elementData.properties?.headerBgColor || '#F3F4F6'}
                      onChange={(e) => onUpdate?.({ headerBgColor: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          height: 36,
                        },
                      }}
                      fullWidth
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#6B7280', mb: 0.5, display: 'block' }}>
                      Border Color
                    </Typography>
                    <TextField
                      type="color"
                      size="small"
                      value={elementData.properties?.borderColor || '#D1D5DB'}
                      onChange={(e) => onUpdate?.({ borderColor: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          height: 36,
                        },
                      }}
                      fullWidth
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Typography */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Typography
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#6B7280', mb: 1, display: 'block' }}>
                      Font Size: {elementData.properties?.fontSize || 13}px
                    </Typography>
                    <Slider
                      value={elementData.properties?.fontSize || 13}
                      onChange={(_, value) => onUpdate?.({ fontSize: value as number })}
                      min={10}
                      max={20}
                      step={1}
                      marks
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#6B7280', mb: 1, display: 'block' }}>
                      Cell Padding: {elementData.properties?.cellPadding || 10}px
                    </Typography>
                    <Slider
                      value={elementData.properties?.cellPadding || 10}
                      onChange={(_, value) => onUpdate?.({ cellPadding: value as number })}
                      min={4}
                      max={20}
                      step={2}
                      marks
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Table Info */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontSize: '11px', color: '#6B7280' }}>
                    Dimensions
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    {(elementData.properties?.headers || []).length} columns × {(elementData.properties?.rows || []).length} rows
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.5 }}>
                    Double-click any cell to edit its content
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          ) : elementData.type === 'tap-image' ? (
            (() => {
              const schema = getComponentPropertySchema(elementData.type);
              const allStyles = getAllAgeStyles();
              const suitableStyles = schema?.suitableAgeStyles
                ? allStyles.filter(style => schema.suitableAgeStyles?.includes(style.id))
                : allStyles;
              
              return (
                <Stack spacing={2.5}>
                  {/* Age Style Selector */}
                  <VisualChipSelector
                    label="Age Style"
                    icon={<Sparkles size={14} />}
                    options={suitableStyles.map((style): ChipOption<AgeStyleName> => ({
                      value: style.id,
                      label: AGE_STYLE_LABELS[style.id],
                      emoji: style.emoji,
                      color: style.color,
                      tooltip: {
                        title: style.name,
                        description: style.description,
                        details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
                      },
                    }))}
                    value={elementData.properties?.ageStyle as AgeStyleName}
                    onChange={(ageStyle) => {
                      onUpdate?.({ ageStyle });
                    }}
                    colorMode="multi"
                  />

              <Divider />

              {/* ====== POSITION/ALIGNMENT ====== */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.75rem' }}>
                  📍 Position
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
                          p: 1.25,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#F5F3FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          '&:hover': {
                            borderColor: '#8B5CF6',
                            backgroundColor: alpha('#F5F3FF', 0.5),
                          },
                        }}
                      >
                        <Icon size={16} color={isActive ? '#8B5CF6' : '#6B7280'} />
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#8B5CF6' : '#6B7280',
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

              {/* ====== MAIN SECTION: IMAGE ====== */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `2px solid ${alpha('#8B5CF6', 0.2)}`,
                  backgroundColor: alpha('#F5F3FF', 0.3),
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1.5, display: 'block', fontSize: '0.8rem' }}>
                  📸 Image
                </Typography>

                {/* Image Preview */}
                {elementData.properties?.imageUrl ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: 160,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      mb: 1.5,
                      position: 'relative',
                      backgroundColor: '#F3F4F6',
                      border: '2px dashed #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      component="img"
                      src={elementData.properties.imageUrl}
                      alt="Preview"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Action buttons overlay */}
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        component="label"
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          py: 0.5,
                          px: 1.25,
                          borderRadius: '6px',
                          minWidth: 'auto',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                          },
                        }}
                      >
                        Change
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // TODO: Handle file upload
                              console.log('File selected:', file);
                            }
                          }}
                        />
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Sparkles size={14} />}
                        onClick={() => setMainTab('ai')}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          py: 0.5,
                          px: 1.25,
                          borderRadius: '6px',
                          minWidth: 'auto',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          },
                        }}
                      >
                        AI
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Stack spacing={1.5} sx={{ mb: 1.5 }}>
                    {/* Upload from device */}
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<Upload size={18} />}
                      sx={{
                        py: 2.5,
                        borderRadius: '10px',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: '#8B5CF6',
                        color: '#8B5CF6',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderStyle: 'dashed',
                          backgroundColor: alpha('#8B5CF6', 0.05),
                          borderColor: '#7C3AED',
                        },
                      }}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // TODO: Handle file upload
                            console.log('File selected:', file);
                          }
                        }}
                      />
                    </Button>

                    {/* Generate with AI */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Sparkles size={18} />}
                      onClick={() => setMainTab('ai')}
                      sx={{
                        py: 2.5,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Generate with AI
                    </Button>
                  </Stack>
                )}

                {/* URL Input - compact */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Or paste image URL..."
                  value={elementData.properties?.imageUrl || ''}
                  onChange={(e) => onUpdate?.({ imageUrl: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Paper>

              {/* ====== MAIN SECTION: CAPTION ====== */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block', fontSize: '0.75rem' }}>
                  💬 Caption
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Tap me!"
                  value={elementData.properties?.caption || ''}
                  onChange={(e) => onUpdate?.({ caption: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              {/* ====== MAIN SECTION: QUICK STYLE PRESETS ====== */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.75rem' }}>
                  ✨ Quick Style
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    {
                      label: 'Simple',
                      value: 'simple',
                      icon: '⚪',
                      config: { animation: 'bounce', soundEffect: 'praise', showHint: true, size: 'medium' },
                      tooltip: {
                        title: 'Simple Style',
                        desc: 'Basic, neutral interaction',
                        details: [
                          '⬆️ Bounce animation',
                          '🎉 Praise sound',
                          '📏 Medium size',
                          '👆 Hint visible'
                        ]
                      }
                    },
                    {
                      label: 'Fun',
                      value: 'fun',
                      icon: '🎉',
                      config: { animation: 'spin', soundEffect: 'animal', showHint: true, size: 'large' },
                      tooltip: {
                        title: 'Fun Style',
                        desc: 'Energetic & playful',
                        details: [
                          '🔄 Spin animation',
                          '🐾 Animal sound',
                          '📏 Large size',
                          '👆 Hint visible'
                        ]
                      }
                    },
                    {
                      label: 'Calm',
                      value: 'calm',
                      icon: '🌸',
                      config: { animation: 'scale', soundEffect: 'praise', showHint: false, size: 'medium' },
                      tooltip: {
                        title: 'Calm Style',
                        desc: 'Gentle & focused',
                        details: [
                          '🔍 Scale animation',
                          '🎉 Praise sound',
                          '📏 Medium size',
                          '✋ No hint (less distraction)'
                        ]
                      }
                    },
                  ].map((preset) => {
                    const isActive =
                      elementData.properties?.animation === preset.config.animation &&
                      elementData.properties?.soundEffect === preset.config.soundEffect;

                    return (
                      <Tooltip
                        key={preset.value}
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                              {preset.tooltip.title}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', mb: 0.75, color: 'rgba(255,255,255,0.8)' }}>
                              {preset.tooltip.desc}
                            </Typography>
                            {preset.tooltip.details.map((detail, idx) => (
                              <Typography key={idx} variant="caption" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.6 }}>
                                {detail}
                              </Typography>
                            ))}
                          </Box>
                        }
                        placement="top"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: alpha('#1F2937', 0.95),
                              backdropFilter: 'blur(8px)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              maxWidth: 200,
                            },
                          },
                          arrow: {
                            sx: {
                              color: alpha('#1F2937', 0.95),
                            },
                          },
                        }}
                      >
                        <Box
                          onClick={() => onUpdate?.(preset.config)}
                          sx={{
                            flex: 1,
                            p: 1.5,
                            borderRadius: '10px',
                            border: isActive ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                            backgroundColor: isActive ? '#F5F3FF' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            '&:hover': {
                              borderColor: '#8B5CF6',
                              backgroundColor: alpha('#F5F3FF', 0.5),
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Typography sx={{ fontSize: '20px', mb: 0.5 }}>{preset.icon}</Typography>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? '#8B5CF6' : '#6B7280',
                            }}
                          >
                            {preset.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.7rem',
                    display: 'block',
                    mt: 0.75,
                    fontStyle: 'italic'
                  }}
                >
                  Hover to see details
                </Typography>
              </Box>
            </Stack>
          );
        })()
          ) : elementData.type === 'color-matcher' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Color Matcher Properties
              </Typography>

              {/* Age Style Selector */}
              <VisualChipSelector
                label="Age Style"
                icon={<Sparkles size={14} />}
                options={getAllAgeStyles().map((style): ChipOption<AgeStyleName> => ({
                  value: style.id,
                  label: AGE_STYLE_LABELS[style.id],
                  emoji: style.emoji,
                  color: style.color,
                  tooltip: {
                    title: style.name,
                    description: style.description,
                    details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
                  },
                }))}
                value={elementData.properties?.ageStyle as AgeStyleName}
                onChange={(ageStyle) => {
                  onUpdate?.({ ageStyle });
                }}
                colorMode="multi"
              />

              <Divider />

              {/* Mode */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Game Mode
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Single', value: 'single', desc: 'Find one at a time' },
                    { label: 'Multiple', value: 'multiple', desc: 'Tap all colors' },
                  ].map((mode) => {
                    const isActive = (elementData.properties?.mode || 'single') === mode.value;
                    return (
                      <Box
                        key={mode.value}
                        onClick={() => onUpdate?.({ mode: mode.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#FEF3C7' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#F59E0B',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#F59E0B' : '#374151',
                            mb: 0.5,
                          }}
                        >
                          {mode.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '10px',
                            color: isActive ? '#D97706' : '#9CA3AF',
                          }}
                        >
                          {mode.desc}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Show Names */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.showNames ?? true}
                      onChange={(e) => onUpdate?.({ showNames: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#F59E0B',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#F59E0B',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      Show color names
                    </Typography>
                  }
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.autoVoice ?? true}
                      onChange={(e) => onUpdate?.({ autoVoice: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#F59E0B',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#F59E0B',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      🔊 Auto voice prompts
                    </Typography>
                  }
                />
              </Box>

              <Divider />

              {/* Colors List */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Colors ({(elementData.properties?.colors || []).length})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                  Currently using default colors. Colors management coming soon.
                </Typography>
              </Box>
            </Stack>
          ) : elementData.type === 'simple-counter' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Counter Properties
              </Typography>

              {/* Age Style Selector */}
              <VisualChipSelector
                label="Age Style"
                icon={<Sparkles size={14} />}
                options={getAllAgeStyles().map((style): ChipOption<AgeStyleName> => ({
                  value: style.id,
                  label: AGE_STYLE_LABELS[style.id],
                  emoji: style.emoji,
                  color: style.color,
                  tooltip: {
                    title: style.name,
                    description: style.description,
                    details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
                  },
                }))}
                value={elementData.properties?.ageStyle as AgeStyleName}
                onChange={(ageStyle) => {
                  onUpdate?.({ ageStyle });
                }}
                colorMode="multi"
              />

              <Divider />

              {/* Voice & Celebration */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.voiceEnabled ?? true}
                      onChange={(e) => onUpdate?.({ voiceEnabled: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10B981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      🔊 Voice counting
                    </Typography>
                  }
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.celebrationAtEnd ?? true}
                      onChange={(e) => onUpdate?.({ celebrationAtEnd: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10B981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      🎉 Celebration at end
                    </Typography>
                  }
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.showProgress ?? true}
                      onChange={(e) => onUpdate?.({ showProgress: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10B981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      Show progress indicator
                    </Typography>
                  }
                />
              </Box>

              <Divider />

              {/* Objects */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Objects ({(elementData.properties?.objects || []).length})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                  Currently using default objects. Objects management coming soon.
                </Typography>
              </Box>
            </Stack>
          ) : elementData.type === 'simple-drag-drop' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Drag & Drop Properties
              </Typography>

              {/* Age Style Selector */}
              <VisualChipSelector
                label="Age Style"
                icon={<Sparkles size={14} />}
                options={getAllAgeStyles().map((style): ChipOption<AgeStyleName> => ({
                  value: style.id,
                  label: AGE_STYLE_LABELS[style.id],
                  emoji: style.emoji,
                  color: style.color,
                  tooltip: {
                    title: style.name,
                    description: style.description,
                    details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
                  },
                }))}
                value={elementData.properties?.ageStyle as AgeStyleName}
                onChange={(ageStyle) => {
                  onUpdate?.({ ageStyle });
                }}
                colorMode="multi"
              />

              <Divider />

              {/* Layout */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Layout
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                    { label: 'Grid', value: 'grid' },
                  ].map((layout) => {
                    const isActive = (elementData.properties?.layout || 'horizontal') === layout.value;
                    return (
                      <Box
                        key={layout.value}
                        onClick={() => onUpdate?.({ layout: layout.value })}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #EC4899' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#FCE7F3' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#EC4899',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#EC4899' : '#374151',
                          }}
                        >
                          {layout.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Difficulty */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Difficulty
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Easy', value: 'easy', desc: 'With hints' },
                    { label: 'Medium', value: 'medium', desc: 'No hints' },
                  ].map((diff) => {
                    const isActive = (elementData.properties?.difficulty || 'easy') === diff.value;
                    return (
                      <Box
                        key={diff.value}
                        onClick={() => onUpdate?.({ difficulty: diff.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #EC4899' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#FCE7F3' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#EC4899',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#EC4899' : '#374151',
                            mb: 0.5,
                          }}
                        >
                          {diff.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '10px',
                            color: isActive ? '#DB2777' : '#9CA3AF',
                          }}
                        >
                          {diff.desc}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Items */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Items ({(elementData.properties?.items || []).length}) & Targets ({(elementData.properties?.targets || []).length})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                  Items management coming soon. Edit via AI Assistant for now.
                </Typography>
              </Box>
            </Stack>
          ) : elementData.type === 'simple-puzzle' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Puzzle Properties
              </Typography>

              {/* Image URL */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Puzzle Image URL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                  value={elementData.properties?.imageUrl || ''}
                  onChange={(e) => onUpdate?.({ imageUrl: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Pieces */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Number of Pieces
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: '4 pieces', value: 4 },
                    { label: '9 pieces', value: 9 },
                    { label: '16 pieces', value: 16 },
                  ].map((option) => {
                    const isActive = (elementData.properties?.pieces || 4) === option.value;
                    return (
                      <Box
                        key={option.value}
                        onClick={() => onUpdate?.({ pieces: option.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #EC4899' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#FCE7F3' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          '&:hover': {
                            borderColor: '#EC4899',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#EC4899' : '#6B7280',
                          }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Difficulty */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  Difficulty
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { label: 'Easy', value: 'easy' },
                    { label: 'Hard', value: 'hard' },
                  ].map((diff) => {
                    const isActive = (elementData.properties?.difficulty || 'easy') === diff.value;
                    return (
                      <Box
                        key={diff.value}
                        onClick={() => onUpdate?.({ difficulty: diff.value })}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '8px',
                          border: isActive ? '2px solid #EC4899' : '1px solid #E5E7EB',
                          backgroundColor: isActive ? '#FCE7F3' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          '&:hover': {
                            borderColor: '#EC4899',
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#EC4899' : '#6B7280',
                          }}
                        >
                          {diff.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Show Outline */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.showOutline ?? true}
                      onChange={(e) => onUpdate?.({ showOutline: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#EC4899',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#EC4899',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      Show outline guide
                    </Typography>
                  }
                />
              </Box>
            </Stack>
          ) : elementData.type === 'voice-recorder' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Voice Recorder Properties
              </Typography>

              {/* Age Style Selector */}
              <VisualChipSelector
                label="Age Style"
                icon={<Sparkles size={14} />}
                options={getAllAgeStyles().map((style): ChipOption<AgeStyleName> => ({
                  value: style.id,
                  label: AGE_STYLE_LABELS[style.id],
                  emoji: style.emoji,
                  color: style.color,
                  tooltip: {
                    title: style.name,
                    description: style.description,
                    details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
                  },
                }))}
                value={elementData.properties?.ageStyle as AgeStyleName}
                onChange={(ageStyle) => {
                  onUpdate?.({ ageStyle });
                }}
                colorMode="multi"
              />

              <Divider />

              {/* Prompt */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Recording Prompt
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Tell me about your day!"
                  value={elementData.properties?.prompt || ''}
                  onChange={(e) => onUpdate?.({ prompt: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Max Duration */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Max Duration: {elementData.properties?.maxDuration || 30} seconds
                </Typography>
                <Slider
                  value={elementData.properties?.maxDuration || 30}
                  onChange={(_, value) => onUpdate?.({ maxDuration: value as number })}
                  min={10}
                  max={60}
                  step={5}
                  marks={[
                    { value: 10, label: '10s' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '60s' },
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      color: '#EF4444',
                    },
                    '& .MuiSlider-track': {
                      color: '#EF4444',
                    },
                    '& .MuiSlider-rail': {
                      color: '#E5E7EB',
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Options */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.showPlayback ?? true}
                      onChange={(e) => onUpdate?.({ showPlayback: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#EF4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#EF4444',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      🔊 Show playback button
                    </Typography>
                  }
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={elementData.properties?.autoPlay ?? false}
                      onChange={(e) => onUpdate?.({ autoPlay: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#EF4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#EF4444',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      ▶️ Auto-play after recording
                    </Typography>
                  }
                />
              </Box>
            </Stack>
          ) : elementData.type === 'reward-collector' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ Star Rewards Properties
              </Typography>

              {/* Reward Title */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Reward Title
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Great Job!"
                  value={elementData.properties?.rewardTitle || ''}
                  onChange={(e) => onUpdate?.({ rewardTitle: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Reward Emoji */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Reward Emoji
                </Typography>
                <TextField
                  fullWidth
                  placeholder="🎁"
                  value={elementData.properties?.rewardEmoji || ''}
                  onChange={(e) => onUpdate?.({ rewardEmoji: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '1.5rem',
                    },
                  }}
                  inputProps={{ maxLength: 2 }}
                />
              </Box>

              <Divider />

              {/* Stars Per Task */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Stars Per Task: {elementData.properties?.starsPerTask || 1} ⭐
                </Typography>
                <Slider
                  value={elementData.properties?.starsPerTask || 1}
                  onChange={(_, value) => onUpdate?.({ starsPerTask: value as number })}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      color: '#FBBF24',
                    },
                    '& .MuiSlider-track': {
                      color: '#FBBF24',
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Tasks */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Tasks ({(elementData.properties?.tasks || []).length})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                  Tasks management coming soon. Edit via AI Assistant for now.
                </Typography>
              </Box>
            </Stack>
          ) : elementData.type === 'memory-cards' || elementData.type === 'sorting-game' || 
               elementData.type === 'sequence-builder' || elementData.type === 'shape-tracer' || 
               elementData.type === 'emotion-recognizer' || elementData.type === 'sound-matcher' || 
               elementData.type === 'pattern-builder' || elementData.type === 'cause-effect' ? (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ⚡ {elementData.type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Properties
              </Typography>

              {/* Common difficulty setting for most interactive components */}
              {(elementData.type === 'memory-cards' || elementData.type === 'sequence-builder' || 
                elementData.type === 'shape-tracer' || elementData.type === 'pattern-builder') && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Difficulty
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: 'Easy', value: 'easy' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Hard', value: 'hard' },
                      ].map((diff) => {
                        const isActive = (elementData.properties?.difficulty || 'easy') === diff.value;
                        return (
                          <Box
                            key={diff.value}
                            onClick={() => onUpdate?.({ difficulty: diff.value })}
                            sx={{
                              flex: 1,
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #6366F1' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#EEF2FF' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              '&:hover': {
                                borderColor: '#6366F1',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#6366F1' : '#6B7280',
                              }}
                            >
                              {diff.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Memory Cards specific */}
              {elementData.type === 'memory-cards' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Grid Size
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: '2×2', value: '2x2' },
                        { label: '2×3', value: '2x3' },
                        { label: '3×4', value: '3x4' },
                      ].map((size) => {
                        const isActive = (elementData.properties?.gridSize || '2x2') === size.value;
                        return (
                          <Box
                            key={size.value}
                            onClick={() => onUpdate?.({ gridSize: size.value })}
                            sx={{
                              flex: 1,
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #6366F1' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#EEF2FF' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              '&:hover': {
                                borderColor: '#6366F1',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#6366F1' : '#6B7280',
                              }}
                            >
                              {size.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Sorting Game specific */}
              {elementData.type === 'sorting-game' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Sort By
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { label: 'Type/Category', value: 'type' },
                        { label: 'Size', value: 'size' },
                        { label: 'Color', value: 'color' },
                      ].map((sort) => {
                        const isActive = (elementData.properties?.sortBy || 'type') === sort.value;
                        return (
                          <Box
                            key={sort.value}
                            onClick={() => onUpdate?.({ sortBy: sort.value })}
                            sx={{
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #14B8A6' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#CCFBF1' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#14B8A6',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#14B8A6' : '#374151',
                              }}
                            >
                              {sort.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Layout
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: 'Horizontal', value: 'horizontal' },
                        { label: 'Vertical', value: 'vertical' },
                      ].map((layout) => {
                        const isActive = (elementData.properties?.layout || 'horizontal') === layout.value;
                        return (
                          <Box
                            key={layout.value}
                            onClick={() => onUpdate?.({ layout: layout.value })}
                            sx={{
                              flex: 1,
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #14B8A6' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#CCFBF1' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              '&:hover': {
                                borderColor: '#14B8A6',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#14B8A6' : '#6B7280',
                              }}
                            >
                              {layout.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Sequence Builder specific */}
              {elementData.type === 'sequence-builder' && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={elementData.properties?.showNumbers ?? true}
                          onChange={(e) => onUpdate?.({ showNumbers: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#A855F7',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#A855F7',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          Show numbers
                        </Typography>
                      }
                    />
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Instruction
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Put the pictures in the right order!"
                      value={elementData.properties?.instruction || ''}
                      onChange={(e) => onUpdate?.({ instruction: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Emotion Recognizer / Sound Matcher - Mode */}
              {(elementData.type === 'emotion-recognizer' || elementData.type === 'sound-matcher') && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Mode
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: 'Identify', value: 'identify' },
                        { label: 'Match', value: 'match' },
                      ].map((mode) => {
                        const isActive = (elementData.properties?.mode || 'identify') === mode.value;
                        return (
                          <Box
                            key={mode.value}
                            onClick={() => onUpdate?.({ mode: mode.value })}
                            sx={{
                              flex: 1,
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #F97316' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#FFEDD5' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              '&:hover': {
                                borderColor: '#F97316',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#F97316' : '#6B7280',
                              }}
                            >
                              {mode.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Voice-enabled components */}
              {(elementData.type === 'emotion-recognizer' || elementData.type === 'cause-effect') && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={elementData.properties?.voiceEnabled ?? true}
                          onChange={(e) => onUpdate?.({ voiceEnabled: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F97316',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F97316',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          🔊 Voice enabled
                        </Typography>
                      }
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Emotion Recognizer specific */}
              {elementData.type === 'emotion-recognizer' && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={elementData.properties?.showDescriptions ?? true}
                          onChange={(e) => onUpdate?.({ showDescriptions: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F97316',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F97316',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          Show descriptions
                        </Typography>
                      }
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Sound Matcher specific */}
              {elementData.type === 'sound-matcher' && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={elementData.properties?.autoPlayFirst ?? true}
                          onChange={(e) => onUpdate?.({ autoPlayFirst: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#8B5CF6',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#8B5CF6',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          ▶️ Auto-play first sound
                        </Typography>
                      }
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Cause Effect specific */}
              {elementData.type === 'cause-effect' && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={elementData.properties?.showText ?? true}
                          onChange={(e) => onUpdate?.({ showText: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F59E0B',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F59E0B',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          Show text labels
                        </Typography>
                      }
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Pattern Builder specific */}
              {elementData.type === 'pattern-builder' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      Pattern Type
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: 'Color', value: 'color' },
                        { label: 'Shape', value: 'shape' },
                        { label: 'Size', value: 'size' },
                      ].map((type) => {
                        const isActive = (elementData.properties?.patternType || 'color') === type.value;
                        return (
                          <Box
                            key={type.value}
                            onClick={() => onUpdate?.({ patternType: type.value })}
                            sx={{
                              flex: 1,
                              p: 1.5,
                              borderRadius: '8px',
                              border: isActive ? '2px solid #14B8A6' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#CCFBF1' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              '&:hover': {
                                borderColor: '#14B8A6',
                                backgroundColor: '#F9FAFB',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#14B8A6' : '#6B7280',
                              }}
                            >
                              {type.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Repetitions: {elementData.properties?.repetitions || 2}
                    </Typography>
                    <Slider
                      value={elementData.properties?.repetitions || 2}
                      onChange={(_, value) => onUpdate?.({ repetitions: value as number })}
                      min={2}
                      max={5}
                      step={1}
                      marks
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                          color: '#14B8A6',
                        },
                        '& .MuiSlider-track': {
                          color: '#14B8A6',
                        },
                      }}
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Shape Tracer specific */}
              {elementData.type === 'shape-tracer' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Shape Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Square"
                      value={elementData.properties?.shapeName || ''}
                      onChange={(e) => onUpdate?.({ shapeName: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Stroke Width: {elementData.properties?.strokeWidth || 8}px
                    </Typography>
                    <Slider
                      value={elementData.properties?.strokeWidth || 8}
                      onChange={(_, value) => onUpdate?.({ strokeWidth: value as number })}
                      min={4}
                      max={16}
                      step={2}
                      marks
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                          color: '#EF4444',
                        },
                        '& .MuiSlider-track': {
                          color: '#EF4444',
                        },
                      }}
                    />
                  </Box>
                  <Divider />
                </>
              )}

              {/* Data info for components with arrays */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  {elementData.type === 'memory-cards' && `Pairs: ${(elementData.properties?.pairs || []).length}`}
                  {elementData.type === 'sorting-game' && `Items: ${(elementData.properties?.items || []).length}, Categories: ${(elementData.properties?.categories || []).length}`}
                  {elementData.type === 'sequence-builder' && `Steps: ${(elementData.properties?.steps || []).length}`}
                  {elementData.type === 'emotion-recognizer' && `Emotions: ${(elementData.properties?.emotions || []).length}`}
                  {elementData.type === 'sound-matcher' && `Items: ${(elementData.properties?.items || []).length}`}
                  {elementData.type === 'pattern-builder' && `Pattern items: ${(elementData.properties?.pattern || []).length}`}
                  {elementData.type === 'cause-effect' && `Pairs: ${(elementData.properties?.pairs || []).length}`}
                  {elementData.type === 'shape-tracer' && 'Shape path configured'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                  Content management coming soon. Edit via AI Assistant for now.
                </Typography>
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

          </Box>
        ) : (
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* AI Assistant Panel - Universal for all component types */}
            {aiContext && onAIEdit ? (
              <AIAssistantPanel
                selection={selection}
                context={aiContext}
                onEdit={onAIEdit}
                editHistory={editHistory}
                isEditing={isAIEditing}
                error={editError}
                onClearError={onClearEditError}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  AI Assistant не доступний. Переконайтесь що worksheet згенерований з параметрами.
                </Typography>
              </Box>
            )}
          </Box>
        )}
          </>
        )}
      </Paper>
    );
  }
};

export default RightSidebar;
