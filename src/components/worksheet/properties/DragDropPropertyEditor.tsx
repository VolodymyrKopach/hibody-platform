'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField,
  Tooltip,
  useTheme,
  FormLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Slider,
  Collapse,
  Popover,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  MoveRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  LayoutGrid,
  Columns,
  Rows,
  GraduationCap,
  Target,
  Grid3x3,
  MoreVertical,
  Wand2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { VisualChipSelector, ChipOption } from './VisualChipSelector';
import ColorPickerButton from './shared/ColorPickerButton';
import EmptyStateCard from './shared/EmptyStateCard';
import DraggableListItem from './shared/DraggableListItem';
import { DragDropAgeStyleName } from '@/types/drag-drop-styles';
import { getAllDragDropStyles } from '@/constants/drag-drop-age-styles';

interface DraggableItem {
  id: string;
  imageUrl: string;
  correctTarget: string;
  label?: string;
}

interface DropTarget {
  id: string;
  label: string;
  backgroundColor?: string;
}

interface DragDropProperties {
  ageStyle?: DragDropAgeStyleName;
  items: DraggableItem[];
  targets: DropTarget[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  difficulty?: 'easy' | 'medium';
  snapDistance?: number;
}

interface DragDropPropertyEditorProps {
  properties: DragDropProperties;
  onChange: (newProperties: DragDropProperties) => void;
  onSwitchToAI?: (prompt?: string) => void;
}

const DragDropPropertyEditor: React.FC<DragDropPropertyEditorProps> = ({
  properties,
  onChange,
  onSwitchToAI,
}) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [helpAnchorEl, setHelpAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [itemMenuAnchor, setItemMenuAnchor] = useState<{ element: HTMLElement; itemId: string } | null>(null);
  const [targetMenuAnchor, setTargetMenuAnchor] = useState<{ element: HTMLElement; targetId: string } | null>(null);
  const [aiHintAnchor, setAiHintAnchor] = useState<HTMLButtonElement | null>(null);

  // Initialize with defaults
  const items = properties.items || [];
  const targets = properties.targets || [];
  const ageStyle = properties.ageStyle || 'elementary';
  const layout = properties.layout || 'horizontal';
  const difficulty = properties.difficulty || 'easy';
  const snapDistance = properties.snapDistance || 80;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-generate unique ID
  const generateId = (prefix: string) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`;
  };

  // Handle drag end for targets
  const handleTargetDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = targets.findIndex((t) => t.id === active.id);
      const newIndex = targets.findIndex((t) => t.id === over.id);

      onChange({
        ...properties,
        targets: arrayMove(targets, oldIndex, newIndex),
      });
    }
  };

  // Handle drag end for items
  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      onChange({
        ...properties,
        items: arrayMove(items, oldIndex, newIndex),
      });
    }
  };

  // Add new target
  const handleAddTarget = () => {
    const newTarget: DropTarget = {
      id: generateId('target'),
      label: `Category ${targets.length + 1}`,
      backgroundColor: theme.palette.mode === 'light' ? '#F0F4FF' : '#1A2332',
    };

    onChange({
      ...properties,
      targets: [...targets, newTarget],
    });
  };

  // Add new draggable item
  const handleAddItem = () => {
    if (targets.length === 0) {
      return;
    }

    const newItem: DraggableItem = {
      id: generateId('item'),
      imageUrl: '',
      correctTarget: targets[0].id,
      label: '',
    };

    onChange({
      ...properties,
      items: [...items, newItem],
    });

    // Auto-expand the new item
    setExpandedItems(new Set([...expandedItems, newItem.id]));
  };

  // Update target
  const handleUpdateTarget = (id: string, updates: Partial<DropTarget>) => {
    const updatedTargets = targets.map((target) =>
      target.id === id ? { ...target, ...updates } : target
    );

    onChange({
      ...properties,
      targets: updatedTargets,
    });
  };

  // Delete target
  const handleDeleteTarget = (id: string) => {
    const updatedTargets = targets.filter((t) => t.id !== id);

    // Update items that pointed to this target
    const updatedItems = items.map((item) => {
      if (item.correctTarget === id) {
        return { ...item, correctTarget: updatedTargets[0]?.id || '' };
      }
      return item;
    });

    onChange({
      ...properties,
      targets: updatedTargets,
      items: updatedItems,
    });
  };

  // Duplicate target
  const handleDuplicateTarget = (id: string) => {
    const targetToDuplicate = targets.find((t) => t.id === id);
    if (!targetToDuplicate) return;

    const newTarget: DropTarget = {
      ...targetToDuplicate,
      id: generateId('target'),
      label: `${targetToDuplicate.label} (Copy)`,
    };

    onChange({
      ...properties,
      targets: [...targets, newTarget],
    });
  };

  // Update item
  const handleUpdateItem = (id: string, updates: Partial<DraggableItem>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );

    onChange({
      ...properties,
      items: updatedItems,
    });
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    onChange({
      ...properties,
      items: updatedItems,
    });

    // Remove from expanded set
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(id);
    setExpandedItems(newExpanded);
  };

  // Duplicate item
  const handleDuplicateItem = (id: string) => {
    const itemToDuplicate = items.find((item) => item.id === id);
    if (!itemToDuplicate) return;

    const newItem: DraggableItem = {
      ...itemToDuplicate,
      id: generateId('item'),
      label: itemToDuplicate.label ? `${itemToDuplicate.label} (Copy)` : '',
    };

    onChange({
      ...properties,
      items: [...items, newItem],
    });
  };

  // Toggle item expansion
  const toggleItemExpansion = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Create example activity
  const handleCreateExample = () => {
    const exampleTargets = [
      { id: generateId('target'), label: 'Meow 🐱', backgroundColor: '#FFF9E6' },
      { id: generateId('target'), label: 'Woof 🐶', backgroundColor: '#E6F4FF' },
    ];
    const exampleItems = [
      {
        id: generateId('item'),
        imageUrl:
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200',
        correctTarget: exampleTargets[0].id,
        label: 'Cat',
      },
      {
        id: generateId('item'),
        imageUrl:
          'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
        correctTarget: exampleTargets[1].id,
        label: 'Dog',
      },
    ];
    onChange({
      ...properties,
      targets: exampleTargets,
      items: exampleItems,
    });
  };

  // Age Style Options
  const allStyles = getAllDragDropStyles();
  const ageStyleOptions: ChipOption<DragDropAgeStyleName>[] = allStyles.map((style) => {
    const ageMatch = style.name.match(/\(([^)]+)\)/);
    const ageLabel = ageMatch ? ageMatch[1] : style.name;

    return {
      value: style.id,
      label: ageLabel,
      emoji: '',
      color: style.colors.itemBorder,
      tooltip: {
        title: style.name,
        description: style.description,
        details: `Item: ${style.elementSize.item}px • Target: ${style.elementSize.target}px • Snap: ${style.interaction.snapDistance}px`,
      },
    };
  });

  // Get connected items count for a target
  const getConnectedItemsCount = (targetId: string) => {
    return items.filter((item) => item.correctTarget === targetId).length;
  };

  // Check if item is complete (has image URL)
  const isItemComplete = (item: DraggableItem) => {
    return item.imageUrl.trim() !== '';
  };

  return (
    <Stack spacing={3}>
      {/* Age Style Selector */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <VisualChipSelector
            label="Age Style"
            icon={<Sparkles size={14} />}
            options={ageStyleOptions}
            value={ageStyle}
            onChange={(newStyle) => onChange({ ...properties, ageStyle: newStyle })}
            colorMode="multi"
          />
        </CardContent>
      </Card>

      {/* Quick Help Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="text"
          size="small"
          startIcon={<HelpCircle size={16} />}
          onClick={(e) => setHelpAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          Need help?
        </Button>
        <Popover
          open={Boolean(helpAnchorEl)}
          anchorEl={helpAnchorEl}
          onClose={() => setHelpAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: { p: 2, maxWidth: 320 },
            },
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              How to Create Drag & Drop Activity
            </Typography>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                1. Create categories
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Add zones where students will drop items (e.g., "Animals", "Plants")
              </Typography>

              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                2. Add images
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Upload or link images that students will drag
              </Typography>

              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                3. Assign targets
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Specify which category each image belongs to
              </Typography>
            </Box>
            {items.length === 0 && targets.length === 0 && (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  handleCreateExample();
                  setHelpAnchorEl(null);
                }}
                sx={{ textTransform: 'none' }}
              >
                Create Example Activity
              </Button>
            )}
          </Stack>
        </Popover>
      </Box>

      {/* Categories Section */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Categories
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Create drop zones where students will place items
              </Typography>
            </Box>
            <Tooltip title="Add Category">
              <span>
                <IconButton
                  onClick={handleAddTarget}
                  size="small"
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Plus size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {targets.length === 0 ? (
            <EmptyStateCard
              icon={Target}
              title="No categories yet"
              description="Click the + button above to create your first drop zone"
              variant="default"
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTargetDragEnd}>
              <SortableContext items={targets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <Stack spacing={1}>
                  {targets.map((target) => (
                    <DraggableListItem key={target.id} id={target.id}>
                      <Box sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <TextField
                          value={target.label}
                          onChange={(e) => handleUpdateTarget(target.id, { label: e.target.value })}
                          placeholder="Category name..."
                          size="small"
                          fullWidth
                          sx={{ flex: 1 }}
                        />

                        <ColorPickerButton
                          value={target.backgroundColor || '#F0F4FF'}
                          onChange={(color) => handleUpdateTarget(target.id, { backgroundColor: color })}
                          size="small"
                          label="Pick category color"
                        />

                        <Badge badgeContent={getConnectedItemsCount(target.id)} color="success" showZero={false}>
                          <Chip
                            label={`${getConnectedItemsCount(target.id)} items`}
                            size="small"
                            sx={{ minWidth: 70 }}
                          />
                        </Badge>

                        <Tooltip title="More actions">
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => setTargetMenuAnchor({ element: e.currentTarget, targetId: target.id })}
                            >
                              <MoreVertical size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </DraggableListItem>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Images
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add images that students will drag to categories
              </Typography>
            </Box>
            <Tooltip title="Add Image">
              <span>
                <IconButton
                  onClick={handleAddItem}
                  disabled={targets.length === 0}
                  size="small"
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-disabled': {
                      borderColor: theme.palette.action.disabled,
                      color: theme.palette.action.disabled,
                    },
                  }}
                >
                  <Plus size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {targets.length === 0 ? (
            <EmptyStateCard
              icon={AlertCircle}
              title="Create categories first"
              description="You need at least one category before adding images"
              variant="warning"
            />
          ) : items.length === 0 ? (
            <EmptyStateCard
              icon={ImageIcon}
              title="No images yet"
              description="Click the + button above to create your first draggable item"
              variant="default"
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <Stack spacing={1}>
                  {items.map((item) => {
                    const isExpanded = expandedItems.has(item.id);
                    const targetObj = targets.find((t) => t.id === item.correctTarget);
                    const isComplete = isItemComplete(item);

                    return (
                      <DraggableListItem key={item.id} id={item.id}>
                        <Box>
                          {/* Main Content - Always Visible */}
                          <Box sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              {/* Top Row: Thumbnail and Actions */}
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                {/* Thumbnail Preview */}
                                <Box sx={{ position: 'relative' }}>
                                  {item.imageUrl ? (
                                    <Box
                                      component="img"
                                      src={item.imageUrl}
                                      alt={item.label || 'Item'}
                                      sx={{
                                        width: 120,
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: `2px solid ${theme.palette.divider}`,
                                      }}
                                      onError={(e: any) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 2,
                                        border: `2px dashed ${theme.palette.divider}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: theme.palette.action.hover,
                                      }}
                                    >
                                      <ImageIcon size={40} color={theme.palette.text.disabled} />
                                    </Box>
                                  )}
                                  {/* Status Badge */}
                                  <Tooltip title={isComplete ? 'Complete' : 'Missing image URL'}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: isComplete
                                          ? theme.palette.success.main
                                          : theme.palette.warning.main,
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        boxShadow: theme.shadows[2],
                                      }}
                                    />
                                  </Tooltip>
                                </Box>

                                {/* Content Column */}
                                <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                  {/* Label */}
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                      Label
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                      {item.label || 'Untitled Image'}
                                    </Typography>
                                  </Box>

                                  {/* Target Assignment */}
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                      Drag to
                                    </Typography>
                                    <Select
                                      value={item.correctTarget}
                                      onChange={(e) => handleUpdateItem(item.id, { correctTarget: e.target.value })}
                                      size="small"
                                      fullWidth
                                      sx={{
                                        '& .MuiSelect-select': {
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                        },
                                      }}
                                    >
                                      {targets.map((target) => (
                                        <MenuItem key={target.id} value={target.id}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                              sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 0.5,
                                                backgroundColor: target.backgroundColor || '#F0F4FF',
                                                border: `1px solid ${theme.palette.divider}`,
                                              }}
                                            />
                                            <Typography variant="body2" fontWeight={500}>
                                              {target.label}
                                            </Typography>
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </Box>
                                </Stack>

                                {/* Action Buttons Column */}
                                <Box 
                                  sx={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 120,
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Tooltip title="More actions" placement="left">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => setItemMenuAnchor({ element: e.currentTarget, itemId: item.id })}
                                      sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                      }}
                                    >
                                      <MoreVertical size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit details" placement="left">
                                    <IconButton
                                      size="small"
                                      onClick={() => toggleItemExpansion(item.id)}
                                      color={isExpanded ? 'primary' : 'default'}
                                      sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                      }}
                                    >
                                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Expanded Details */}
                          <Collapse in={isExpanded}>
                            <Box
                              sx={{
                                px: 2,
                                pb: 2,
                                borderTop: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.action.hover,
                              }}
                            >
                              <Stack spacing={2}>
                                {/* Image URL */}
                                <Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <FormLabel sx={{ fontSize: '0.75rem' }}>
                                      Image URL
                                    </FormLabel>
                                    <Button
                                      size="small"
                                      variant="text"
                                      startIcon={<Wand2 size={14} />}
                                      onClick={(e) => {
                                        if (onSwitchToAI) {
                                          const itemIndex = items.findIndex(i => i.id === item.id) + 1;
                                          const targetObj = targets.find(t => t.id === item.correctTarget);
                                          const itemLabel = item.label || 'Unnamed';
                                          const targetLabel = targetObj?.label || 'Unknown';
                                          const contextInfo = JSON.stringify({
                                            itemId: `image-${itemIndex}`,
                                            itemLabel,
                                            targetLabel,
                                          });
                                          onSwitchToAI(contextInfo);
                                        } else {
                                          setAiHintAnchor(e.currentTarget);
                                        }
                                      }}
                                      sx={{
                                        textTransform: 'none',
                                        fontSize: '0.7rem',
                                        py: 0.25,
                                        px: 1,
                                        minHeight: 0,
                                        color: 'primary.main',
                                      }}
                                    >
                                      Generate with AI
                                    </Button>
                                  </Box>
                                  <TextField
                                    value={item.imageUrl}
                                    onChange={(e) => handleUpdateItem(item.id, { imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                      startAdornment: <LinkIcon size={14} style={{ marginRight: 6 }} />,
                                    }}
                                  />
                                </Box>

                                {/* Label */}
                                <Box>
                                  <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                                    Label (Optional)
                                  </FormLabel>
                                  <TextField
                                    value={item.label || ''}
                                    onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                                    placeholder="e.g., Cat, Dog, Apple..."
                                    size="small"
                                    fullWidth
                                  />
                                </Box>
                              </Stack>
                            </Box>
                          </Collapse>
                        </Box>
                      </DraggableListItem>
                    );
                  })}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Target Actions Menu */}
      <Menu
        anchorEl={targetMenuAnchor?.element}
        open={Boolean(targetMenuAnchor)}
        onClose={() => setTargetMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            if (targetMenuAnchor) {
              handleDuplicateTarget(targetMenuAnchor.targetId);
              setTargetMenuAnchor(null);
            }
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (targetMenuAnchor) {
              const target = targets.find(t => t.id === targetMenuAnchor.targetId);
              const canDelete = !(targets.length === 1 && items.length > 0);
              if (canDelete) {
                handleDeleteTarget(targetMenuAnchor.targetId);
              }
              setTargetMenuAnchor(null);
            }
          }}
          disabled={targets.length === 1 && items.length > 0}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* AI Generation Hint Popover */}
      <Popover
        open={Boolean(aiHintAnchor)}
        anchorEl={aiHintAnchor}
        onClose={() => setAiHintAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: { 
              p: 2, 
              maxWidth: 320,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
              border: `1px solid ${theme.palette.primary.main}40`,
            },
          },
        }}
      >
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
              }}
            >
              <Sparkles size={20} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              AI Image Generation
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            To generate an image with AI:
          </Typography>
          
          <Stack spacing={0.5} sx={{ pl: 1 }}>
            <Typography variant="caption" sx={{ display: 'flex', gap: 0.5 }}>
              <span style={{ fontWeight: 600 }}>1.</span> Switch to <strong>AI Assistant</strong> tab
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', gap: 0.5 }}>
              <span style={{ fontWeight: 600 }}>2.</span> Request: <em>"Generate an image of [your subject]"</em>
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', gap: 0.5 }}>
              <span style={{ fontWeight: 600 }}>3.</span> Copy the generated image URL
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', gap: 0.5 }}>
              <span style={{ fontWeight: 600 }}>4.</span> Paste it in the Image URL field
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => setAiHintAnchor(null)}
            sx={{ textTransform: 'none', mt: 0.5 }}
          >
            Got it!
          </Button>
        </Stack>
      </Popover>

      {/* Item Actions Menu */}
      <Menu
        anchorEl={itemMenuAnchor?.element}
        open={Boolean(itemMenuAnchor)}
        onClose={() => setItemMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            if (itemMenuAnchor) {
              handleDuplicateItem(itemMenuAnchor.itemId);
              setItemMenuAnchor(null);
            }
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (itemMenuAnchor) {
              handleDeleteItem(itemMenuAnchor.itemId);
              setItemMenuAnchor(null);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Settings Section */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Button
            variant="text"
            size="small"
            startIcon={<Sparkles size={16} />}
            endIcon={showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            onClick={() => setShowSettings(!showSettings)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              mb: showSettings ? 2 : 0,
            }}
          >
            Advanced Settings
          </Button>

          <Collapse in={showSettings}>
            <Stack spacing={3}>
              {/* Layout */}
              <Box>
                <FormLabel sx={{ fontSize: '0.75rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LayoutGrid size={14} />
                  Layout
                </FormLabel>
                <ToggleButtonGroup
                  value={layout}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      onChange({ ...properties, layout: value });
                    }
                  }}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="horizontal" aria-label="Horizontal">
                    <Tooltip title="Horizontal row" arrow>
                      <span>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Columns size={16} />
                          <Typography variant="caption">Row</Typography>
                        </Box>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="vertical" aria-label="Vertical">
                    <Tooltip title="Vertical column" arrow>
                      <span>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rows size={16} />
                          <Typography variant="caption">Column</Typography>
                        </Box>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="grid" aria-label="Grid">
                    <Tooltip title="Grid layout" arrow>
                      <span>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Grid3x3 size={16} />
                          <Typography variant="caption">Grid</Typography>
                        </Box>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Difficulty */}
              <Box>
                <FormLabel sx={{ fontSize: '0.75rem', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GraduationCap size={14} />
                  Difficulty Level
                </FormLabel>
                <Tooltip 
                  title="Display colored zones and helper text for easier gameplay" 
                  arrow
                  placement="top"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={difficulty === 'easy'}
                        onChange={(e) => {
                          onChange({ ...properties, difficulty: e.target.checked ? 'easy' : 'medium' });
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        Show visual hints
                      </Typography>
                    }
                  />
                </Tooltip>
              </Box>

              {/* Snap Distance */}
              <Box>
                <FormLabel sx={{ fontSize: '0.75rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Target size={14} />
                  Snap Distance
                  <Tooltip title="How close the item needs to be to snap to the category">
                    <span style={{ display: 'inline-flex', cursor: 'help' }}>
                      <HelpCircle size={12} />
                    </span>
                  </Tooltip>
                </FormLabel>
                <ToggleButtonGroup
                  value={snapDistance}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      onChange({ ...properties, snapDistance: value });
                    }
                  }}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value={50} aria-label="Precise">
                    <Tooltip title="Requires precise placement (50px) - for older students" arrow>
                      <span>
                        <Typography variant="caption" fontWeight={600}>
                          🎯 Precise
                        </Typography>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={80} aria-label="Normal">
                    <Tooltip title="Normal snapping (80px) - recommended for most activities" arrow>
                      <span>
                        <Typography variant="caption" fontWeight={600}>
                          👍 Normal
                        </Typography>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={120} aria-label="Relaxed">
                    <Tooltip title="Relaxed snapping (120px) - easier for younger kids" arrow>
                      <span>
                        <Typography variant="caption" fontWeight={600}>
                          😊 Relaxed
                        </Typography>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={200} aria-label="Very Easy">
                    <Tooltip title="Very easy snapping (200px) - best for youngest learners" arrow>
                      <span>
                        <Typography variant="caption" fontWeight={600}>
                          🤗 Easy
                        </Typography>
                      </span>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </Collapse>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DragDropPropertyEditor;
