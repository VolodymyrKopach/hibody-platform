'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Image as ImageIcon,
  Lightbulb,
  Heading1,
  AlignLeft,
  ClipboardList,
  PenLine,
  CircleDot,
  CheckCheck,
  MessageSquareText,
  Minus,
  AlertTriangle,
  List,
  ListOrdered,
  Table as TableIcon,
  ChevronLeft,
} from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onComponentDragStart?: (component: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isOpen,
  onToggle,
  onComponentDragStart 
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Components Library Data - IDs match CanvasElement types
  const componentCategories = [
    {
      name: 'Text & Structure',
      items: [
        { 
          id: 'title-block', 
          name: 'Title', 
          icon: Heading1, 
          color: '#2563EB',
          description: 'Large heading' 
        },
        { 
          id: 'body-text', 
          name: 'Body Text', 
          icon: AlignLeft, 
          color: '#6366F1',
          description: 'Paragraph text' 
        },
        { 
          id: 'bullet-list', 
          name: 'Bullet List', 
          icon: List, 
          color: '#4F46E5',
          description: 'Bulleted list' 
        },
        { 
          id: 'numbered-list', 
          name: 'Numbered List', 
          icon: ListOrdered, 
          color: '#5B21B6',
          description: 'Numbered list' 
        },
        { 
          id: 'instructions-box', 
          name: 'Instructions', 
          icon: ClipboardList, 
          color: '#3B82F6',
          description: 'Step-by-step guide' 
        },
      ],
    },
    {
      name: 'Exercises',
      items: [
        { 
          id: 'fill-blank', 
          name: 'Fill in Blanks', 
          icon: PenLine, 
          color: '#10B981',
          description: 'Complete sentences' 
        },
        { 
          id: 'multiple-choice', 
          name: 'Multiple Choice', 
          icon: CircleDot, 
          color: '#14B8A6',
          description: 'Choose answer' 
        },
        { 
          id: 'true-false', 
          name: 'True/False', 
          icon: CheckCheck, 
          color: '#06B6D4',
          description: 'True or false' 
        },
        { 
          id: 'short-answer', 
          name: 'Short Answer', 
          icon: MessageSquareText, 
          color: '#0EA5E9',
          description: 'Written response' 
        },
      ],
    },
    {
      name: 'Media',
      items: [
        { 
          id: 'image-placeholder', 
          name: 'Image', 
          icon: ImageIcon, 
          color: '#F59E0B',
          description: 'Add picture' 
        },
      ],
    },
    {
      name: 'Layout',
      items: [
        { 
          id: 'table', 
          name: 'Table', 
          icon: TableIcon, 
          color: '#7C3AED',
          description: 'Data table' 
        },
        { 
          id: 'divider', 
          name: 'Divider', 
          icon: Minus, 
          color: '#8B5CF6',
          description: 'Horizontal line' 
        },
      ],
    },
    {
      name: 'Boxes',
      items: [
        { 
          id: 'warning-box', 
          name: 'Warning', 
          icon: AlertTriangle, 
          color: '#EF4444',
          description: 'Important note' 
        },
        { 
          id: 'tip-box', 
          name: 'Tip', 
          icon: Lightbulb, 
          color: '#F59E0B',
          description: 'Helpful hint' 
        },
      ],
    },
  ];

  const sidebarWidth = isOpen ? 280 : 72;

  return (
    <Paper
      elevation={0}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        height: '100%',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: 'rgba(255, 255, 255, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
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
              Components
            </Typography>
          )}
          
          <Tooltip title={isOpen ? "Collapse panel" : "Expand panel"} placement="right">
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
              {isOpen ? <ChevronLeft size={20} /> : <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />}
            </IconButton>
          </Tooltip>
        </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: isOpen ? 2 : 1 }}>
        {/* Search - Only show when expanded */}
        {isOpen && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.875rem',
              },
            }}
          />
        )}

        {/* Component Categories */}
        {isOpen ? (
          // Expanded view - Full cards with names
          <Stack spacing={2.5}>
            {componentCategories
              .map((category) => ({
                ...category,
                items: category.items.filter((item) =>
                  searchQuery
                    ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.description.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                ),
              }))
              .filter((category) => category.items.length > 0)
              .map((category) => (
                <Box key={category.name}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Stack spacing={0.75}>
                    {category.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Paper
                          key={item.id}
                          elevation={0}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('componentType', item.id);
                            e.dataTransfer.effectAllowed = 'copy';
                            onComponentDragStart?.(item.id);
                          }}
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            cursor: 'grab',
                            transition: 'all 0.2s',
                            background: 'transparent',
                            '&:hover': {
                              borderColor: item.color,
                              background: alpha(item.color, 0.04),
                              transform: 'translateX(4px)',
                              boxShadow: `0 2px 8px ${alpha(item.color, 0.12)}`,
                            },
                            '&:active': {
                              cursor: 'grabbing',
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                background: alpha(item.color, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                '.MuiPaper-root:hover &': {
                                  background: alpha(item.color, 0.15),
                                },
                              }}
                            >
                              <IconComponent size={16} color={item.color} strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  fontSize: '0.8125rem',
                                  lineHeight: 1.3,
                                  mb: 0.25,
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontSize: '0.7rem',
                                  lineHeight: 1.2,
                                  display: 'block',
                                }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
          </Stack>
        ) : (
          // Collapsed view - Only icons
          <Stack spacing={1}>
            {componentCategories.flatMap((category) => 
              category.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Tooltip key={item.id} title={item.name} placement="right">
                    <Paper
                      elevation={0}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('componentType', item.id);
                        e.dataTransfer.effectAllowed = 'copy';
                        onComponentDragStart?.(item.id);
                      }}
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        cursor: 'grab',
                        transition: 'all 0.2s',
                        background: alpha(item.color, 0.05),
                        '&:hover': {
                          borderColor: item.color,
                          background: alpha(item.color, 0.15),
                          transform: 'scale(1.05)',
                          boxShadow: `0 2px 8px ${alpha(item.color, 0.2)}`,
                        },
                        '&:active': {
                          cursor: 'grabbing',
                          transform: 'scale(0.95)',
                        },
                      }}
                    >
                      <IconComponent size={20} color={item.color} strokeWidth={2.5} />
                    </Paper>
                  </Tooltip>
                );
              })
            )}
          </Stack>
        )}
      </Box>
      </Paper>
  );
};

export default LeftSidebar;
