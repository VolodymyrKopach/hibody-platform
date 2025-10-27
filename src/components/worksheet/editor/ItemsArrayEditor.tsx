'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { Plus, Trash2, ChevronDown, Wand2 } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ColorPickerField from './ColorPickerField';
import ShapeConstructor from './ShapeConstructor';
import { getColorNameInUkrainian, getColorEmoji } from '@/utils/colorUtils';

interface ColoringItem {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'flower' | 'apple' | 'sun' |
         'moon' | 'cloud' | 'tree' | 'house' | 'balloon' | 'car' | 'fish' | 'butterfly' | 'custom';
  label: string;
  color: string; // Auto-generated from colorHex
  colorEmoji: string; // Auto-generated from colorHex
  colorHex?: string; // Primary color source
  size?: number;
  customSvg?: string; // For custom shapes from constructor
}

interface ItemsArrayEditorProps {
  items: ColoringItem[];
  onChange: (items: ColoringItem[]) => void;
  maxItems?: number;
}

const SHAPE_OPTIONS = [
  { value: 'circle', label: 'Коло' },
  { value: 'square', label: 'Квадрат' },
  { value: 'triangle', label: 'Трикутник' },
  { value: 'star', label: 'Зірка' },
  { value: 'heart', label: 'Серце' },
  { value: 'flower', label: 'Квітка' },
  { value: 'apple', label: 'Яблуко' },
  { value: 'sun', label: 'Сонце' },
  { value: 'moon', label: 'Місяць' },
  { value: 'cloud', label: 'Хмаринка' },
  { value: 'tree', label: 'Дерево' },
  { value: 'house', label: 'Будинок' },
  { value: 'balloon', label: 'Кулька' },
  { value: 'car', label: 'Машина' },
  { value: 'fish', label: 'Рибка' },
  { value: 'butterfly', label: 'Метелик' },
  { value: 'custom', label: 'Власна картинка', isCustom: true },
];

// Render shape function (from ColoringPage.tsx) - same as in ShapeConstructor
const renderShape = (shape: string, size: number) => {
  const commonProps = {
    stroke: '#000000',
    strokeWidth: 5,
    fill: 'transparent',
  };

  const centerX = size / 2;
  const centerY = size / 2;

  switch (shape) {
    case 'circle':
      return <circle cx={centerX} cy={centerY} r={size / 2 - 5} {...commonProps} />;
    case 'square':
      return <rect x="5" y="5" width={size - 10} height={size - 10} {...commonProps} />;
    case 'triangle':
      return (
        <polygon
          points={`${centerX},10 ${size - 10},${size - 10} 10,${size - 10}`}
          {...commonProps}
        />
      );
    case 'star':
      return (
        <path
          d={`M${centerX},10 L${centerX + 10},${centerY - 5} L${size - 10},${centerY} L${
            centerX + 10
          },${centerY + 10} L${centerX},${size - 10} L${centerX - 10},${centerY + 10} L10,${
            centerY
          } L${centerX - 10},${centerY - 5} Z`}
          {...commonProps}
        />
      );
    case 'heart':
      return (
        <path
          d={`M${centerX},${size - 10} C${centerX},${size - 10} 10,${centerY} 10,${
            size / 3
          } C10,15 ${size / 4},10 ${centerX},${size / 4} C${size * 0.75},10 ${size - 10},15 ${
            size - 10
          },${size / 3} C${size - 10},${centerY} ${centerX},${size - 10} ${centerX},${
            size - 10
          } Z`}
          {...commonProps}
        />
      );
    case 'flower':
      return (
        <g>
          <circle cx={centerX} cy={centerY} r={15} {...commonProps} />
          <circle cx={centerX} cy={centerY - 25} r={18} {...commonProps} />
          <circle cx={centerX + 22} cy={centerY - 12} r={18} {...commonProps} />
          <circle cx={centerX + 22} cy={centerY + 12} r={18} {...commonProps} />
          <circle cx={centerX} cy={centerY + 25} r={18} {...commonProps} />
          <circle cx={centerX - 22} cy={centerY + 12} r={18} {...commonProps} />
          <circle cx={centerX - 22} cy={centerY - 12} r={18} {...commonProps} />
        </g>
      );
    case 'apple':
      return (
        <g>
          <ellipse cx={centerX} cy={centerY + 10} rx={35} ry={40} {...commonProps} />
          <path
            d={`M${centerX - 5},${centerY - 25} Q${centerX - 5},${centerY - 40} ${centerX},${
              centerY - 35
            }`}
            {...commonProps}
            fill="transparent"
          />
          <ellipse
            cx={centerX + 10}
            cy={centerY - 35}
            rx={12}
            ry={8}
            {...commonProps}
          />
        </g>
      );
    case 'sun':
      return (
        <g>
          <circle cx={centerX} cy={centerY} r={25} {...commonProps} />
          {[...Array(8)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 8;
            const x1 = centerX + Math.cos(angle) * 30;
            const y1 = centerY + Math.sin(angle) * 30;
            const x2 = centerX + Math.cos(angle) * 45;
            const y2 = centerY + Math.sin(angle) * 45;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#000000"
                strokeWidth={3}
              />
            );
          })}
        </g>
      );
    case 'moon':
      return (
        <path
          d={`M${centerX + 15},${centerY - 40} A40,40 0 1,0 ${centerX + 15},${centerY + 40} A30,30 0 1,1 ${centerX + 15},${centerY - 40}`}
          {...commonProps}
        />
      );
    case 'cloud':
      return (
        <g>
          <ellipse cx={centerX} cy={centerY} rx={40} ry={25} {...commonProps} />
          <ellipse cx={centerX - 25} cy={centerY - 5} rx={25} ry={20} {...commonProps} />
          <ellipse cx={centerX + 25} cy={centerY - 5} rx={25} ry={20} {...commonProps} />
        </g>
      );
    case 'tree':
      return (
        <g>
          <rect x={centerX - 10} y={centerY + 10} width={20} height={30} {...commonProps} />
          <polygon
            points={`${centerX},${centerY - 30} ${centerX - 40},${centerY + 15} ${centerX + 40},${centerY + 15}`}
            {...commonProps}
          />
        </g>
      );
    case 'house':
      return (
        <g>
          <rect x={centerX - 35} y={centerY - 10} width={70} height={50} {...commonProps} />
          <polygon
            points={`${centerX},${centerY - 40} ${centerX - 45},${centerY - 10} ${centerX + 45},${centerY - 10}`}
            {...commonProps}
          />
          <rect x={centerX - 10} y={centerY + 10} width={20} height={30} {...commonProps} />
        </g>
      );
    case 'balloon':
      return (
        <g>
          <ellipse cx={centerX} cy={centerY - 10} rx={30} ry={40} {...commonProps} />
          <line
            x1={centerX}
            y1={centerY + 30}
            x2={centerX}
            y2={centerY + 60}
            stroke="#000000"
            strokeWidth={2}
          />
        </g>
      );
    case 'car':
      return (
        <g>
          <rect x={centerX - 40} y={centerY} width={80} height={25} {...commonProps} />
          <rect x={centerX - 20} y={centerY - 20} width={40} height={20} {...commonProps} />
          <circle cx={centerX - 25} cy={centerY + 30} r={10} {...commonProps} />
          <circle cx={centerX + 25} cy={centerY + 30} r={10} {...commonProps} />
        </g>
      );
    case 'fish':
      return (
        <g>
          <ellipse cx={centerX} cy={centerY} rx={35} ry={25} {...commonProps} />
          <polygon
            points={`${centerX + 35},${centerY} ${centerX + 55},${centerY - 20} ${centerX + 55},${centerY + 20}`}
            {...commonProps}
          />
          <circle cx={centerX - 15} cy={centerY - 5} r={5} {...commonProps} />
        </g>
      );
    case 'butterfly':
      return (
        <g>
          <ellipse cx={centerX} cy={centerY} rx={5} ry={30} {...commonProps} />
          <ellipse cx={centerX - 18} cy={centerY - 15} rx={20} ry={25} {...commonProps} />
          <ellipse cx={centerX + 18} cy={centerY - 15} rx={20} ry={25} {...commonProps} />
          <ellipse cx={centerX - 15} cy={centerY + 15} rx={15} ry={20} {...commonProps} />
          <ellipse cx={centerX + 15} cy={centerY + 15} rx={15} ry={20} {...commonProps} />
        </g>
      );
    default:
      return <circle cx={centerX} cy={centerY} r={size / 2 - 5} {...commonProps} />;
  }
};

const ItemsArrayEditor: React.FC<ItemsArrayEditorProps> = ({
  items,
  onChange,
  maxItems = 3,
}) => {
  const [constructorOpen, setConstructorOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const handleItemChange = (index: number, field: keyof ColoringItem, value: any) => {
    const newItems = [...items];
    
    // If colorHex is changed, auto-update color name and emoji
    if (field === 'colorHex') {
      newItems[index] = {
        ...newItems[index],
        colorHex: value,
        color: getColorNameInUkrainian(value),
        colorEmoji: getColorEmoji(value),
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    onChange(newItems);
  };

  const handleAddItem = () => {
    if (items.length < maxItems) {
      const defaultColorHex = '#FF0000';
      onChange([
        ...items,
        {
          shape: 'circle',
          label: 'Розфарбуй фігуру',
          colorHex: defaultColorHex,
          color: getColorNameInUkrainian(defaultColorHex),
          colorEmoji: getColorEmoji(defaultColorHex),
          size: 200,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleOpenConstructor = (index: number) => {
    setCurrentEditingIndex(index);
    setConstructorOpen(true);
  };

  const handleSaveCustomShape = (svgData: string) => {
    if (currentEditingIndex !== null) {
      const newItems = [...items];
      newItems[currentEditingIndex] = {
        ...newItems[currentEditingIndex],
        shape: 'custom',
        customSvg: svgData,
      };
      onChange(newItems);
    }
    setConstructorOpen(false);
    setCurrentEditingIndex(null);
  };

  return (
    <>
      <ShapeConstructor
        open={constructorOpen}
        onClose={() => {
          setConstructorOpen(false);
          setCurrentEditingIndex(null);
        }}
        onSave={handleSaveCustomShape}
      />
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" fontWeight="bold" color="text.secondary">
          📚 Фігури для розфарбовування ({items.length}/{maxItems})
        </Typography>
        <Tooltip title="Додати фігуру">
          <span>
            <IconButton
              size="small"
              onClick={handleAddItem}
              disabled={items.length >= maxItems}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                },
              }}
            >
              <Plus size={18} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {items.map((item, index) => (
        <Accordion
          key={index}
          sx={{
            mb: 1,
            maxWidth: '313.5px',
            '&:before': { display: 'none' },
            boxShadow: 1,
            position: 'relative',
            '&:hover .delete-button': {
              opacity: 1,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown size={20} />}
            sx={{
              bgcolor: '#F5F5F5',
              minHeight: 48,
              '&.Mui-expanded': { minHeight: 48 },
              '& .MuiAccordionSummary-content': {
                my: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.shape === 'custom' ? (
                <>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: 0.5,
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {item.customSvg ? (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '& svg': {
                            maxWidth: '100%',
                            maxHeight: '100%',
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: item.customSvg }}
                      />
                    ) : (
                      <span style={{ fontSize: '1rem' }}>🎨</span>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight="600">
                    Власна картинка
                  </Typography>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <svg width={22} height={22} viewBox="0 0 100 100">
                      {renderShape(item.shape, 100)}
                    </svg>
                  </Box>
                  <Typography variant="body2" fontWeight="600">
                    {SHAPE_OPTIONS.find((s) => s.value === item.shape)?.label || 'Коло'}
                  </Typography>
                </>
              )}
            </Box>
            <Box
              sx={{
                ml: 'auto',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: item.colorHex || '#FF0000',
                    border: '2px solid #ccc',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.color}
                </Typography>
              </Box>
              <IconButton
                size="small"
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(index);
                }}
                disabled={items.length === 1}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: items.length === 1 ? 'action.disabled' : 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    opacity: 0,
                  },
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Shape Selector */}
              <FormControl fullWidth size="small">
                <InputLabel>Фігура</InputLabel>
                <Select
                  value={item.shape}
                  label="Фігура"
                  onChange={(e) =>
                    handleItemChange(index, 'shape', e.target.value as ColoringItem['shape'])
                  }
                  renderValue={(value) => {
                    const option = SHAPE_OPTIONS.find((s) => s.value === value);
                    if (!option) return value;
                    
                    if (option.isCustom) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>🎨</span>
                          <span>{option.label}</span>
                        </Box>
                      );
                    }
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                            borderRadius: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          <svg width={26} height={26} viewBox="0 0 100 100">
                            {renderShape(value as string, 100)}
                          </svg>
                        </Box>
                        <span>{option.label}</span>
                      </Box>
                    );
                  }}
                >
                  {SHAPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.isCustom ? (
                          <>
                            <span>🎨</span>
                            <span>{option.label}</span>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#FFFFFF',
                                border: '1px solid #E0E0E0',
                                borderRadius: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              <svg width={26} height={26} viewBox="0 0 100 100">
                                {renderShape(option.value, 100)}
                              </svg>
                            </Box>
                            <span>{option.label}</span>
                          </>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Shape Constructor Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Wand2 size={16} />}
                onClick={() => handleOpenConstructor(index)}
                sx={{
                  textTransform: 'none',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.5,
                  '&:hover': {
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                Створити власну картинку
              </Button>

              {/* Custom SVG Preview */}
              {item.shape === 'custom' && item.customSvg && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: '#F5F5F5',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Попередній перегляд:
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      maxWidth: '100%',
                      maxHeight: 150,
                      overflow: 'hidden',
                      borderRadius: 1,
                      bgcolor: 'white',
                      p: 1,
                      '& svg': {
                        maxWidth: '100%',
                        maxHeight: '100%',
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: item.customSvg }}
                  />
                </Paper>
              )}

              {/* Label */}
              <TextField
                fullWidth
                size="small"
                label="Підпис"
                value={item.label}
                onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                placeholder="Розфарбуй яблуко"
              />

              {/* Color Picker - auto-generates name and emoji */}
              <Box>
                <ColorPickerField
                  label="Колір для розфарбовування"
                  value={item.colorHex || '#FF0000'}
                  onChange={(value) => handleItemChange(index, 'colorHex', value)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {item.colorEmoji} {item.color}
                </Typography>
              </Box>

              {/* Size Options */}
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Розмір
                </Typography>
                <ToggleButtonGroup
                  value={item.size || 200}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      handleItemChange(index, 'size', value);
                    }
                  }}
                  size="small"
                  fullWidth
                  sx={{ mt: 0.5 }}
                >
                  <ToggleButton value={150}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block" fontWeight="bold">
                        Малий
                      </Typography>
                      <Typography variant="caption" display="block" fontSize="0.65rem" color="text.secondary">
                        150px
                      </Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value={200}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block" fontWeight="bold">
                        Середній
                      </Typography>
                      <Typography variant="caption" display="block" fontSize="0.65rem" color="text.secondary">
                        200px
                      </Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value={250}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block" fontWeight="bold">
                        Великий
                      </Typography>
                      <Typography variant="caption" display="block" fontSize="0.65rem" color="text.secondary">
                        250px
                      </Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
    </>
  );
};

export default ItemsArrayEditor;

