'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Button,
  TextField,
  Tooltip,
  alpha,
  useTheme,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Slider,
  Collapse,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  Check,
  MoveRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VisualChipSelector, ChipOption } from './VisualChipSelector';
import { AgeStyleName } from '@/types/interactive-age-styles';
import { getAllAgeStyles, AGE_STYLE_LABELS } from '@/constants/interactive-age-styles';

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
  ageStyle?: AgeStyleName;
  items: DraggableItem[];
  targets: DropTarget[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  difficulty?: 'easy' | 'medium';
  snapDistance?: number;
}

interface DragDropPropertyEditorProps {
  properties: DragDropProperties;
  onChange: (newProperties: DragDropProperties) => void;
}

const DragDropPropertyEditor: React.FC<DragDropPropertyEditorProps> = ({
  properties,
  onChange,
}) => {
  const theme = useTheme();
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Initialize with defaults
  const items = properties.items || [];
  const targets = properties.targets || [];
  const ageStyle = properties.ageStyle || 'elementary';
  const layout = properties.layout || 'horizontal';
  const difficulty = properties.difficulty || 'easy';
  const snapDistance = properties.snapDistance || 80;

  // Auto-generate unique ID
  const generateId = (prefix: string) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`;
  };

  // Add new target
  const handleAddTarget = () => {
    const newTarget: DropTarget = {
      id: generateId('target'),
      label: `Target ${targets.length + 1}`,
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
      return; // Don't add item if no targets exist
    }

    const newItem: DraggableItem = {
      id: generateId('item'),
      imageUrl: '',
      correctTarget: targets[0].id, // Default to first target
      label: `Item ${items.length + 1}`,
    };
    
    onChange({
      ...properties,
      items: [...items, newItem],
    });
    
    setSelectedItemIndex(items.length);
  };

  // Update target
  const handleUpdateTarget = (index: number, updates: Partial<DropTarget>) => {
    const updatedTargets = [...targets];
    updatedTargets[index] = { ...updatedTargets[index], ...updates };
    
    onChange({
      ...properties,
      targets: updatedTargets,
    });
  };

  // Delete target
  const handleDeleteTarget = (index: number) => {
    const targetId = targets[index].id;
    const updatedTargets = targets.filter((_, i) => i !== index);
    
    // Update items that pointed to this target
    const updatedItems = items.map(item => {
      if (item.correctTarget === targetId) {
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

  // Update item
  const handleUpdateItem = (index: number, updates: Partial<DraggableItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    
    onChange({
      ...properties,
      items: updatedItems,
    });
  };

  // Delete item
  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange({
      ...properties,
      items: updatedItems,
    });
    
    if (selectedItemIndex === index) {
      setSelectedItemIndex(null);
    }
  };

  // Age Style Options
  const allStyles = getAllAgeStyles();
  const ageStyleOptions: ChipOption<AgeStyleName>[] = allStyles.map((style) => ({
    value: style.id,
    label: AGE_STYLE_LABELS[style.id],
    emoji: style.emoji,
    color: style.color,
    tooltip: {
      title: style.name,
      description: style.description,
      details: `Element: ${style.sizes.element}px • Gap: ${style.sizes.gap}px`,
    },
  }));

  return (
    <Stack spacing={3}>
      {/* Age Style Selector */}
      <VisualChipSelector
        label="Age Style"
        icon={<Sparkles size={14} />}
        options={ageStyleOptions}
        value={ageStyle}
        onChange={(newStyle) => onChange({ ...properties, ageStyle: newStyle })}
        colorMode="multi"
      />

      {/* Help button with collapsible guide */}
      <Box>
        <Button
          variant="text"
          size="small"
          startIcon={<HelpCircle size={16} />}
          endIcon={showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          onClick={() => setShowGuide(!showGuide)}
          sx={{
            textTransform: 'none',
            color: 'info.main',
            fontWeight: 600,
            mb: showGuide ? 2 : 0,
          }}
        >
          Як створити активність?
        </Button>
        
        <Collapse in={showGuide}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.main' }}>
                📝 Покрокова інструкція
              </Typography>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                  1️⃣ Створіть категорії (наприклад: "Meow", "Woof")
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                  2️⃣ Додайте картинки (наприклад: кіт 🐱, собака 🐶)
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  3️⃣ Вкажіть, куди перетягувати кожну картинку
                </Typography>
              </Box>
              {items.length === 0 && targets.length === 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    // Create example activity
                    const exampleTargets = [
                      { id: generateId('target'), label: 'Meow 🐱', backgroundColor: '#FFF9E6' },
                      { id: generateId('target'), label: 'Woof 🐶', backgroundColor: '#E6F4FF' },
                    ];
                    const exampleItems = [
                      {
                        id: generateId('item'),
                        imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200',
                        correctTarget: exampleTargets[0].id,
                        label: 'Cat',
                      },
                      {
                        id: generateId('item'),
                        imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
                        correctTarget: exampleTargets[1].id,
                        label: 'Dog',
                      },
                    ];
                    onChange({
                      ...properties,
                      targets: exampleTargets,
                      items: exampleItems,
                    });
                    setShowGuide(false); // Close guide after creating example
                  }}
                  sx={{ textTransform: 'none', mt: 1 }}
                >
                  ✨ Створити приклад для початку
                </Button>
              )}
            </Stack>
          </Paper>
        </Collapse>
      </Box>

      <Divider />

      {/* Drop Targets Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              🎯 Крок 1: Категорії
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Створіть зони, куди учні перетягуватимуть картинки
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleAddTarget}
            sx={{ textTransform: 'none' }}
          >
            Додати категорію
          </Button>
        </Box>

        {targets.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              📦 Ще немає категорій
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Приклади: "Meow", "Woof", "Червоний", "Синій", "Фрукти", "Овочі"
            </Typography>
          </Paper>
        )}

        <Stack spacing={1.5}>
          {targets.map((target, index) => (
            <Paper
              key={target.id}
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: target.backgroundColor || '#F0F4FF',
                      border: `2px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700}>
                      {index + 1}
                    </Typography>
                  </Box>

                  <TextField
                    value={target.label}
                    onChange={(e) => handleUpdateTarget(index, { label: e.target.value })}
                    placeholder="Наприклад: Meow, Червоний, Фрукти..."
                    size="small"
                    fullWidth
                    sx={{ flex: 1 }}
                  />

                  <input
                    type="color"
                    value={target.backgroundColor || '#F0F4FF'}
                    onChange={(e) => handleUpdateTarget(index, { backgroundColor: e.target.value })}
                    style={{
                      width: 40,
                      height: 40,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTarget(index)}
                    color="error"
                    disabled={targets.length === 1 && items.length > 0}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>

                {/* Show which items point to this target */}
                {items.filter(item => item.correctTarget === target.id).length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      background: alpha(theme.palette.success.main, 0.08),
                      borderRadius: 1,
                    }}
                  >
                    <Check size={12} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      ✓ Підключено {items.filter(item => item.correctTarget === target.id).length} картинок
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Draggable Items Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              🖼️ Крок 2: Картинки
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Додайте зображення, які учні перетягуватимуть
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            disabled={targets.length === 0}
            sx={{ textTransform: 'none' }}
          >
            Додати картинку
          </Button>
        </Box>

        {targets.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              background: alpha(theme.palette.warning.main, 0.05),
            }}
          >
            <AlertCircle
              size={24}
              color={theme.palette.warning.main}
              style={{ marginBottom: 8 }}
            />
            <Typography variant="body2" color="warning.main" fontWeight={600}>
              ⚠️ Спочатку створіть хоча б одну категорію
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Поверніться до Кроку 1 вгорі ↑
            </Typography>
          </Paper>
        )}

        {targets.length > 0 && items.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              🎨 Ще немає картинок
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Натисніть "Додати картинку" і вставте посилання на зображення
            </Typography>
          </Paper>
        )}

        <Stack spacing={2}>
          {items.map((item, index) => (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                border: `2px solid ${
                  selectedItemIndex === index
                    ? theme.palette.primary.main
                    : theme.palette.divider
                }`,
                borderRadius: 2,
                overflow: 'visible',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
              onClick={() => setSelectedItemIndex(index)}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Картинка {index + 1} {item.label && `• ${item.label}`}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(index);
                      }}
                      color="error"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>

                  {/* Image Preview and URL */}
                  <Box>
                    <FormLabel sx={{ fontSize: '0.75rem', mb: 1, display: 'block' }}>
                      📸 Зображення
                    </FormLabel>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.label || 'Item'}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: `2px solid ${theme.palette.divider}`,
                          }}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            border: `2px dashed ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: alpha(theme.palette.divider, 0.1),
                          }}
                        >
                          <ImageIcon size={24} color={theme.palette.text.disabled} />
                        </Box>
                      )}

                      <TextField
                        value={item.imageUrl}
                        onChange={(e) => handleUpdateItem(index, { imageUrl: e.target.value })}
                        placeholder="Вставте посилання на картинку..."
                        size="small"
                        fullWidth
                        InputProps={{
                          startAdornment: <LinkIcon size={14} style={{ marginRight: 8 }} />,
                        }}
                        helperText="💡 Знайдіть картинку в Google Images → клік правою → Копіювати адресу зображення"
                      />
                    </Stack>
                  </Box>

                  {/* Label (optional) */}
                  <TextField
                    value={item.label || ''}
                    onChange={(e) => handleUpdateItem(index, { label: e.target.value })}
                    label="Підпис (необов'язково)"
                    placeholder="Наприклад: Кіт, Собака, Яблуко..."
                    size="small"
                    fullWidth
                  />

                  {/* Target Connection */}
                  <Box>
                    <FormLabel sx={{ fontSize: '0.75rem', mb: 1, display: 'block' }}>
                      🎯 Куди перетягувати?
                    </FormLabel>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Select
                        value={item.correctTarget}
                        onChange={(e) => handleUpdateItem(index, { correctTarget: e.target.value })}
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
                        {targets.map((target, targetIndex) => (
                          <MenuItem key={target.id} value={target.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 0.5,
                                  backgroundColor: target.backgroundColor || '#F0F4FF',
                                  border: `1px solid ${theme.palette.divider}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                }}
                              >
                                {targetIndex + 1}
                              </Box>
                              {target.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      
                      <Tooltip title="Ця картинка буде правильною, коли її перетягнуть на вибрану категорію">
                        <Box>
                          <MoveRight size={18} color={theme.palette.text.secondary} />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Settings */}
      <Stack spacing={3}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          ⚙️ Налаштування активності
        </Typography>

        {/* Layout - Visual Buttons */}
        <Box>
          <FormLabel sx={{ fontSize: '0.75rem', mb: 1.5, display: 'block' }}>
            📐 Розташування
          </FormLabel>
          <Stack direction="row" spacing={1}>
            <Button
              variant={layout === 'horizontal' ? 'contained' : 'outlined'}
              onClick={() => onChange({ ...properties, layout: 'horizontal' })}
              sx={{
                flex: 1,
                textTransform: 'none',
                py: 1.5,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>→</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                В ряд
              </Typography>
            </Button>
            <Button
              variant={layout === 'vertical' ? 'contained' : 'outlined'}
              onClick={() => onChange({ ...properties, layout: 'vertical' })}
              sx={{
                flex: 1,
                textTransform: 'none',
                py: 1.5,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>↓</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                В стовпчик
              </Typography>
            </Button>
            <Button
              variant={layout === 'grid' ? 'contained' : 'outlined'}
              onClick={() => onChange({ ...properties, layout: 'grid' })}
              sx={{
                flex: 1,
                textTransform: 'none',
                py: 1.5,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>⊞</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Сітка
              </Typography>
            </Button>
          </Stack>
        </Box>

        {/* Difficulty - Toggle Buttons */}
        <Box>
          <FormLabel sx={{ fontSize: '0.75rem', mb: 1.5, display: 'block' }}>
            🎓 Складність
          </FormLabel>
          <Stack direction="row" spacing={1}>
            <Button
              variant={difficulty === 'easy' ? 'contained' : 'outlined'}
              onClick={() => onChange({ ...properties, difficulty: 'easy' })}
              sx={{
                flex: 1,
                textTransform: 'none',
                py: 1.5,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>😊</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Легко
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                з підказками
              </Typography>
            </Button>
            <Button
              variant={difficulty === 'medium' ? 'contained' : 'outlined'}
              onClick={() => onChange({ ...properties, difficulty: 'medium' })}
              sx={{
                flex: 1,
                textTransform: 'none',
                py: 1.5,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>🤔</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Середньо
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                без підказок
              </Typography>
            </Button>
          </Stack>
        </Box>

        {/* Snap Distance - Slider */}
        <Box>
          <FormLabel sx={{ fontSize: '0.75rem', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🎯 Точність прилипання
            <Tooltip title="Наскільки близько треба піднести картинку до категорії">
              <span style={{ cursor: 'help' }}>ℹ️</span>
            </Tooltip>
          </FormLabel>
          <Box sx={{ px: 1 }}>
            <Slider
              value={snapDistance}
              onChange={(_, value) => onChange({ ...properties, snapDistance: value as number })}
              min={50}
              max={200}
              step={10}
              marks={[
                { value: 50, label: '🎯' },
                { value: 80, label: '👍' },
                { value: 120, label: '😊' },
                { value: 200, label: '🤗' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}px`}
              sx={{
                '& .MuiSlider-mark': {
                  fontSize: '1.2rem',
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '1.2rem',
                  top: -8,
                },
              }}
            />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1,
                fontWeight: 600,
              }}
            >
              {snapDistance}px - {
                snapDistance < 70 ? '🎯 Точно (для старших дітей)' : 
                snapDistance < 100 ? '👍 Нормально (рекомендовано)' : 
                snapDistance < 150 ? '😊 М\'яко (для молодших дітей)' :
                '🤗 Дуже м\'яко (для найменших)'
              }
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};

export default DragDropPropertyEditor;

