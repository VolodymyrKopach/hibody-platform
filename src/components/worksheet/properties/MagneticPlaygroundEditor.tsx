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
  Select,
  MenuItem,
  Card,
  CardContent,
  Slider,
  Collapse,
  Chip,
  Divider,
  Alert,
  FormLabel,
  alpha,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  Magnet,
  HelpCircle,
  Target,
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
import DraggableListItem from './shared/DraggableListItem';
import EmptyStateCard from './shared/EmptyStateCard';
import ColorPickerButton from './shared/ColorPickerButton';

interface ToddlerDragItem {
  id: string;
  imageUrl: string;
  correctTarget: string;
  label?: string;
  size?: 'large' | 'extra-large';
}

interface ToddlerDropTarget {
  id: string;
  label: string;
  backgroundColor?: string;
  imageUrl?: string;
  size?: 'large' | 'extra-large';
  magneticZone?: number;
}

interface MagneticPlaygroundProperties {
  magneticStrength?: number;
  animalHelper?: 'bunny' | 'cat' | 'dog' | 'bear';
  autoComplete?: boolean;
  celebrationLevel?: 'high' | 'maximum';
  items: ToddlerDragItem[];
  targets: ToddlerDropTarget[];
}

interface MagneticPlaygroundEditorProps {
  properties: MagneticPlaygroundProperties;
  onChange: (newProperties: MagneticPlaygroundProperties) => void;
  onSwitchToAI?: (prompt?: string) => void;
}

const MagneticPlaygroundEditor: React.FC<MagneticPlaygroundEditorProps> = ({
  properties,
  onChange,
  onSwitchToAI,
}) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(true);

  // Initialize with defaults
  const items = properties.items || [];
  const targets = properties.targets || [];
  const magneticStrength = properties.magneticStrength || 100;
  const animalHelper = properties.animalHelper || 'bunny';
  const autoComplete = properties.autoComplete !== false;
  const celebrationLevel = properties.celebrationLevel || 'high';

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

  // Handle drag end for targets
  const handleTargetDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = targets.findIndex((target) => target.id === active.id);
      const newIndex = targets.findIndex((target) => target.id === over.id);
      onChange({
        ...properties,
        targets: arrayMove(targets, oldIndex, newIndex),
      });
    }
  };

  // Add new item
  const handleAddItem = () => {
    const newItem: ToddlerDragItem = {
      id: generateId('item'),
      imageUrl: '',
      correctTarget: targets[0]?.id || '',
      label: '',
      size: 'large',
    };
    onChange({
      ...properties,
      items: [...items, newItem],
    });
    setExpandedItems(new Set([...expandedItems, newItem.id]));
  };

  // Add new target
  const handleAddTarget = () => {
    const newTarget: ToddlerDropTarget = {
      id: generateId('target'),
      label: '',
      backgroundColor: '#FFF9E6',
      size: 'large',
      magneticZone: 40,
    };
    onChange({
      ...properties,
      targets: [...targets, newTarget],
    });
    setExpandedTargets(new Set([...expandedTargets, newTarget.id]));
  };

  // Update item
  const handleUpdateItem = (itemId: string, updates: Partial<ToddlerDragItem>) => {
    onChange({
      ...properties,
      items: items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  // Update target
  const handleUpdateTarget = (targetId: string, updates: Partial<ToddlerDropTarget>) => {
    onChange({
      ...properties,
      targets: targets.map((target) =>
        target.id === targetId ? { ...target, ...updates } : target
      ),
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    onChange({
      ...properties,
      items: items.filter((item) => item.id !== itemId),
    });
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(itemId);
    setExpandedItems(newExpanded);
  };

  // Delete target
  const handleDeleteTarget = (targetId: string) => {
    onChange({
      ...properties,
      targets: targets.filter((target) => target.id !== targetId),
      items: items.map((item) =>
        item.correctTarget === targetId
          ? { ...item, correctTarget: '' }
          : item
      ),
    });
    const newExpanded = new Set(expandedTargets);
    newExpanded.delete(targetId);
    setExpandedTargets(newExpanded);
  };

  // Toggle expand
  const toggleExpandItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleExpandTarget = (targetId: string) => {
    const newExpanded = new Set(expandedTargets);
    if (newExpanded.has(targetId)) {
      newExpanded.delete(targetId);
    } else {
      newExpanded.add(targetId);
    }
    setExpandedTargets(newExpanded);
  };

  // Update main settings
  const handleSettingChange = (key: keyof MagneticPlaygroundProperties, value: any) => {
    onChange({
      ...properties,
      [key]: value,
    });
  };

  // Animal helper options
  const animalHelpers = [
    { value: 'bunny', label: '🐰 Bunny', emoji: '🐰' },
    { value: 'cat', label: '🐱 Cat', emoji: '🐱' },
    { value: 'dog', label: '🐕 Dog', emoji: '🐕' },
    { value: 'bear', label: '🐻 Bear', emoji: '🐻' },
  ];

  return (
    <Stack spacing={3}>
      {/* Header with AI Switch */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Magnet size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
            Magnetic Playground
          </Typography>
        </Box>
        {onSwitchToAI && (
          <Tooltip title="Switch to AI Assistant">
            <IconButton
              size="small"
              onClick={() => onSwitchToAI()}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Wand2 size={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Settings Section */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: '12px',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            onClick={() => setShowSettings(!showSettings)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              mb: showSettings ? 2 : 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              ⚙️ Settings
            </Typography>
            <IconButton size="small">
              {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>

          <Collapse in={showSettings}>
            <Stack spacing={2.5}>
              {/* Animal Helper */}
              <Box>
                <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.875rem' }}>
                  Animal Helper
                  <Tooltip title="Choose a friendly animal to encourage kids">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <HelpCircle size={14} />
                    </IconButton>
                  </Tooltip>
                </FormLabel>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {animalHelpers.map((animal) => (
                    <Chip
                      key={animal.value}
                      label={animal.label}
                      onClick={() => handleSettingChange('animalHelper', animal.value)}
                      variant={animalHelper === animal.value ? 'filled' : 'outlined'}
                      color={animalHelper === animal.value ? 'primary' : 'default'}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 1.5,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Magnetic Strength */}
              <Box>
                <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.875rem' }}>
                  🧲 Magnetic Strength
                  <Tooltip title="How close items need to be to snap to targets">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <HelpCircle size={14} />
                    </IconButton>
                  </Tooltip>
                </FormLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="Easy (150px)"
                    onClick={() => handleSettingChange('magneticStrength', 150)}
                    variant={magneticStrength === 150 ? 'filled' : 'outlined'}
                    color={magneticStrength === 150 ? 'primary' : 'default'}
                    sx={{ flex: 1, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem' }}
                  />
                  <Chip
                    label="Normal (100px)"
                    onClick={() => handleSettingChange('magneticStrength', 100)}
                    variant={magneticStrength === 100 ? 'filled' : 'outlined'}
                    color={magneticStrength === 100 ? 'primary' : 'default'}
                    sx={{ flex: 1, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem' }}
                  />
                  <Chip
                    label="Hard (60px)"
                    onClick={() => handleSettingChange('magneticStrength', 60)}
                    variant={magneticStrength === 60 ? 'filled' : 'outlined'}
                    color={magneticStrength === 60 ? 'primary' : 'default'}
                    sx={{ flex: 1, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {magneticStrength === 150 && '✨ Very easy - items snap from far away'}
                  {magneticStrength === 100 && '👍 Balanced - items snap when close'}
                  {magneticStrength === 60 && '🎯 Challenging - items must be very close'}
                </Typography>
              </Box>

              {/* Celebration Level */}
              <Box>
                <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.875rem' }}>
                  Celebration Level
                </FormLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="🎉 High"
                    onClick={() => handleSettingChange('celebrationLevel', 'high')}
                    variant={celebrationLevel === 'high' ? 'filled' : 'outlined'}
                    color={celebrationLevel === 'high' ? 'primary' : 'default'}
                    sx={{ flex: 1, borderRadius: '10px', fontWeight: 600 }}
                  />
                  <Chip
                    label="🎊 Maximum"
                    onClick={() => handleSettingChange('celebrationLevel', 'maximum')}
                    variant={celebrationLevel === 'maximum' ? 'filled' : 'outlined'}
                    color={celebrationLevel === 'maximum' ? 'primary' : 'default'}
                    sx={{ flex: 1, borderRadius: '10px', fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Stack>
          </Collapse>
        </CardContent>
      </Card>

      <Divider />

      {/* Drop Targets Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Target size={18} color={theme.palette.warning.main} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Drop Targets ({targets.length})
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleAddTarget}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Add Target
          </Button>
        </Box>

        {targets.length === 0 ? (
          <EmptyStateCard
            icon={Target}
            title="No targets yet"
            description="Add drop targets where items will be placed"
            actionLabel="Add First Target"
            onAction={handleAddTarget}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTargetDragEnd}
          >
            <SortableContext items={targets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <Stack spacing={1.5}>
                {targets.map((target) => (
                  <DraggableListItem key={target.id} id={target.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        onClick={() => toggleExpandTarget(target.id)}
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          backgroundColor: alpha(theme.palette.warning.main, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              backgroundColor: target.backgroundColor || '#FFF9E6',
                              border: '2px solid',
                              borderColor: alpha(theme.palette.warning.main, 0.5),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Target size={20} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {target.label || 'Unnamed Target'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {target.id}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTarget(target.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                          <IconButton size="small">
                            {expandedTargets.has(target.id) ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </IconButton>
                        </Box>
                      </Box>

                      <Collapse in={expandedTargets.has(target.id)}>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              label="Label"
                              value={target.label}
                              onChange={(e) =>
                                handleUpdateTarget(target.id, { label: e.target.value })
                              }
                              placeholder="e.g., Home, Basket, Box"
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />

                            <Box>
                              <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, display: 'block' }}>
                                Background Color
                              </FormLabel>
                              <ColorPickerButton
                                value={target.backgroundColor || '#FFF9E6'}
                                onChange={(newColor) =>
                                  handleUpdateTarget(target.id, { backgroundColor: newColor })
                                }
                              />
                            </Box>

                            <TextField
                              fullWidth
                              label="Background Image URL (optional)"
                              value={target.imageUrl || ''}
                              onChange={(e) =>
                                handleUpdateTarget(target.id, { imageUrl: e.target.value })
                              }
                              placeholder="https://..."
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />

                            <Box>
                              <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, display: 'block' }}>
                                Size
                              </FormLabel>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label="Large"
                                  onClick={() => handleUpdateTarget(target.id, { size: 'large' })}
                                  variant={target.size === 'large' ? 'filled' : 'outlined'}
                                  color={target.size === 'large' ? 'primary' : 'default'}
                                  sx={{ flex: 1, borderRadius: '8px' }}
                                />
                                <Chip
                                  label="Extra Large"
                                  onClick={() =>
                                    handleUpdateTarget(target.id, { size: 'extra-large' })
                                  }
                                  variant={target.size === 'extra-large' ? 'filled' : 'outlined'}
                                  color={target.size === 'extra-large' ? 'primary' : 'default'}
                                  sx={{ flex: 1, borderRadius: '8px' }}
                                />
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      </Collapse>
                    </Card>
                  </DraggableListItem>
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Box>

      <Divider />

      {/* Draggable Items Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sparkles size={18} color={theme.palette.primary.main} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Draggable Items ({items.length})
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            disabled={targets.length === 0}
          >
            Add Item
          </Button>
        </Box>

        {targets.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Please add at least one target first before adding items.
          </Alert>
        ) : items.length === 0 ? (
          <EmptyStateCard
            icon={Sparkles}
            title="No items yet"
            description="Add items that kids will drag to targets"
            actionLabel="Add First Item"
            onAction={handleAddItem}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleItemDragEnd}
          >
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <Stack spacing={1.5}>
                {items.map((item) => {
                  const targetMatch = targets.find((t) => t.id === item.correctTarget);
                  return (
                    <DraggableListItem key={item.id} id={item.id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          onClick={() => toggleExpandItem(item.id)}
                          sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '10px',
                                backgroundColor: '#FFE5F1',
                                border: '2px solid #FF6B9D',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                              }}
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.label || 'Item'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              ) : (
                                <ImageIcon size={20} />
                              )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.label || 'Unnamed Item'}
                              </Typography>
                              {targetMatch ? (
                                <Chip
                                  label={`→ ${targetMatch.label}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    mt: 0.5,
                                    backgroundColor: alpha(theme.palette.warning.main, 0.2),
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" color="error">
                                  No target selected
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                            <IconButton size="small">
                              {expandedItems.has(item.id) ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                            </IconButton>
                          </Box>
                        </Box>

                        <Collapse in={expandedItems.has(item.id)}>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Stack spacing={2}>
                              <TextField
                                fullWidth
                                label="Label"
                                value={item.label || ''}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { label: e.target.value })
                                }
                                placeholder="e.g., Apple, Ball, Car"
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                              />

                              <TextField
                                fullWidth
                                label="Image URL"
                                value={item.imageUrl}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { imageUrl: e.target.value })
                                }
                                placeholder="https://..."
                                size="small"
                                required
                                error={!item.imageUrl}
                                helperText={!item.imageUrl ? 'Image URL is required' : ''}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                              />

                              <Box>
                                <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, display: 'block' }}>
                                  Correct Target
                                </FormLabel>
                                <Select
                                  fullWidth
                                  value={item.correctTarget}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, { correctTarget: e.target.value })
                                  }
                                  size="small"
                                  error={!item.correctTarget}
                                  sx={{ borderRadius: '10px' }}
                                >
                                  {targets.map((target) => (
                                    <MenuItem key={target.id} value={target.id}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '4px',
                                            backgroundColor: target.backgroundColor || '#FFF9E6',
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.3),
                                          }}
                                        />
                                        {target.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Box>

                              <Box>
                                <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, display: 'block' }}>
                                  Size
                                </FormLabel>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip
                                    label="Large"
                                    onClick={() => handleUpdateItem(item.id, { size: 'large' })}
                                    variant={item.size === 'large' ? 'filled' : 'outlined'}
                                    color={item.size === 'large' ? 'primary' : 'default'}
                                    sx={{ flex: 1, borderRadius: '8px' }}
                                  />
                                  <Chip
                                    label="Extra Large"
                                    onClick={() => handleUpdateItem(item.id, { size: 'extra-large' })}
                                    variant={item.size === 'extra-large' ? 'filled' : 'outlined'}
                                    color={item.size === 'extra-large' ? 'primary' : 'default'}
                                    sx={{ flex: 1, borderRadius: '8px' }}
                                  />
                                </Box>
                              </Box>
                            </Stack>
                          </Box>
                        </Collapse>
                      </Card>
                    </DraggableListItem>
                  );
                })}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Box>

      {/* Quick Tips */}
      <Alert severity="info" icon={<Heart size={18} />} sx={{ borderRadius: '12px' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          💡 Quick Tips:
        </Typography>
        <Typography variant="caption" display="block">
          • Add targets first, then items that match them
        </Typography>
        <Typography variant="caption" display="block">
          • Use bright, simple images for toddlers
        </Typography>
        <Typography variant="caption" display="block">
          • Higher magnetic strength = easier for young kids
        </Typography>
      </Alert>
    </Stack>
  );
};

export default MagneticPlaygroundEditor;

