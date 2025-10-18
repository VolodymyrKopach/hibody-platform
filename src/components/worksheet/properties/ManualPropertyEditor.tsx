'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
  Button,
  Stack,
  Paper,
  Tooltip,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material';
import { Plus, Trash2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import {
  ComponentPropertySchema,
  PropertyDefinition,
} from '@/constants/interactive-properties-schema';

interface ManualPropertyEditorProps {
  schema: ComponentPropertySchema;
  properties: any;
  onChange: (newProperties: any) => void;
}

const ManualPropertyEditor: React.FC<ManualPropertyEditorProps> = ({
  schema,
  properties,
  onChange,
}) => {
  const theme = useTheme();

  const handlePropertyChange = (key: string, value: any) => {
    onChange({
      ...properties,
      [key]: value,
    });
  };

  const renderPropertyField = (propDef: PropertyDefinition) => {
    const value = properties[propDef.key] ?? propDef.default;

    switch (propDef.type) {
      case 'string':
      case 'url':
        return (
          <StringField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'number':
        return (
          <NumberField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'boolean':
        return (
          <BooleanField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'color':
        return (
          <ColorField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'select':
        return (
          <SelectField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'array-object':
        return (
          <ArrayObjectField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'array-simple':
        return (
          <ArraySimpleField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      case 'object':
        return (
          <ObjectField
            propDef={propDef}
            value={value}
            onChange={(newValue) => handlePropertyChange(propDef.key, newValue)}
          />
        );

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Unsupported property type: {propDef.type}
          </Typography>
        );
    }
  };

  return (
    <Stack spacing={3}>
      {schema.properties.map((propDef) => (
        <Box key={propDef.key}>
          {renderPropertyField(propDef)}
        </Box>
      ))}
    </Stack>
  );
};

// String Field Component
const StringField: React.FC<{
  propDef: PropertyDefinition;
  value: string;
  onChange: (value: string) => void;
}> = ({ propDef, value, onChange }) => {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
        {propDef.label}
        {propDef.required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
        {propDef.helperText && (
          <Tooltip title={propDef.helperText} placement="top">
            <HelpCircle
              size={14}
              style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'help' }}
            />
          </Tooltip>
        )}
      </FormLabel>
      <TextField
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={propDef.placeholder}
        fullWidth
        size="small"
        multiline={propDef.type === 'string'}
        rows={propDef.type === 'string' ? 2 : 1}
      />
    </FormControl>
  );
};

// Number Field Component
const NumberField: React.FC<{
  propDef: PropertyDefinition;
  value: number;
  onChange: (value: number) => void;
}> = ({ propDef, value, onChange }) => {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
        {propDef.label}
        {propDef.helperText && (
          <Tooltip title={propDef.helperText} placement="top">
            <HelpCircle
              size={14}
              style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'help' }}
            />
          </Tooltip>
        )}
      </FormLabel>
      <TextField
        type="number"
        value={value ?? propDef.default ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        fullWidth
        size="small"
        inputProps={{
          min: propDef.min,
          max: propDef.max,
        }}
      />
    </FormControl>
  );
};

// Boolean Field Component
const BooleanField: React.FC<{
  propDef: PropertyDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ propDef, value, onChange }) => {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value ?? propDef.default ?? false}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography fontWeight={600} fontSize="0.875rem">
            {propDef.label}
          </Typography>
          {propDef.helperText && (
            <Tooltip title={propDef.helperText} placement="top">
              <HelpCircle size={14} style={{ cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
      }
    />
  );
};

// Color Field Component
const ColorField: React.FC<{
  propDef: PropertyDefinition;
  value: string;
  onChange: (value: string) => void;
}> = ({ propDef, value, onChange }) => {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
        {propDef.label}
      </FormLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <input
          type="color"
          value={value || propDef.default || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 60,
            height: 40,
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        />
        <TextField
          value={value || propDef.default || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          fullWidth
          placeholder="#000000"
        />
      </Box>
    </FormControl>
  );
};

// Select Field Component
const SelectField: React.FC<{
  propDef: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
}> = ({ propDef, value, onChange }) => {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
        {propDef.label}
      </FormLabel>
      <Select
        value={value ?? propDef.default ?? ''}
        onChange={(e) => onChange(e.target.value)}
        size="small"
      >
        {propDef.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Array Simple Field Component (array of strings)
const ArraySimpleField: React.FC<{
  propDef: PropertyDefinition;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ propDef, value, onChange }) => {
  const [expanded, setExpanded] = useState(true);
  const items = value || [];

  const handleAddItem = () => {
    onChange([...items, '']);
  };

  const handleUpdateItem = (index: number, newValue: string) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <FormLabel sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {propDef.label} ({items.length})
        </FormLabel>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={1}>
          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                value={item}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                size="small"
                fullWidth
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveItem(index)}
                color="error"
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            size="small"
          >
            Add Item
          </Button>
        </Stack>
      </Collapse>
    </FormControl>
  );
};

// Array Object Field Component
const ArrayObjectField: React.FC<{
  propDef: PropertyDefinition;
  value: any[];
  onChange: (value: any[]) => void;
}> = ({ propDef, value, onChange }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const items = value || [];

  const handleAddItem = () => {
    const newItem: any = {};
    propDef.objectSchema?.forEach((field) => {
      newItem[field.key] = field.default ?? '';
    });
    onChange([...items, newItem]);
    setExpandedItems(new Set([...expandedItems, items.length]));
  };

  const handleUpdateItem = (index: number, key: string, newValue: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: newValue };
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(index);
    setExpandedItems(newExpanded);
  };

  const toggleItemExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <FormLabel sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {propDef.label} ({items.length})
          {propDef.required && (
            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </FormLabel>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={2}>
          {items.map((item, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                background: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: expandedItems.has(index) ? 1.5 : 0,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Item {index + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleItemExpanded(index)}
                  >
                    {expandedItems.has(index) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedItems.has(index)}>
                <Stack spacing={1.5}>
                  {propDef.objectSchema?.map((field) => {
                    const fieldValue = item[field.key];
                    return (
                      <Box key={field.key}>
                        {field.type === 'string' || field.type === 'url' ? (
                          <TextField
                            label={field.label}
                            value={fieldValue || ''}
                            onChange={(e) =>
                              handleUpdateItem(index, field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            size="small"
                            fullWidth
                            required={field.required}
                          />
                        ) : field.type === 'number' ? (
                          <TextField
                            label={field.label}
                            type="number"
                            value={fieldValue ?? field.default ?? 0}
                            onChange={(e) =>
                              handleUpdateItem(index, field.key, Number(e.target.value))
                            }
                            size="small"
                            fullWidth
                            required={field.required}
                            inputProps={{
                              min: field.min,
                              max: field.max,
                            }}
                          />
                        ) : field.type === 'color' ? (
                          <Box>
                            <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                              {field.label}
                            </FormLabel>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <input
                                type="color"
                                value={fieldValue || '#000000'}
                                onChange={(e) =>
                                  handleUpdateItem(index, field.key, e.target.value)
                                }
                                style={{
                                  width: 50,
                                  height: 35,
                                  border: '1px solid #ddd',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                              />
                              <TextField
                                value={fieldValue || '#000000'}
                                onChange={(e) =>
                                  handleUpdateItem(index, field.key, e.target.value)
                                }
                                size="small"
                                fullWidth
                                placeholder="#000000"
                              />
                            </Box>
                          </Box>
                        ) : field.type === 'select' ? (
                          <FormControl fullWidth size="small">
                            <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                              {field.label}
                            </FormLabel>
                            <Select
                              value={fieldValue ?? field.default ?? ''}
                              onChange={(e) =>
                                handleUpdateItem(index, field.key, e.target.value)
                              }
                              size="small"
                            >
                              {field.options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            label={field.label}
                            value={fieldValue || ''}
                            onChange={(e) =>
                              handleUpdateItem(index, field.key, e.target.value)
                            }
                            size="small"
                            fullWidth
                          />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Paper>
          ))}

          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            size="small"
          >
            Add {propDef.label}
          </Button>
        </Stack>
      </Collapse>
    </FormControl>
  );
};

// Object Field Component
const ObjectField: React.FC<{
  propDef: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
}> = ({ propDef, value, onChange }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const objValue = value || {};

  const handleFieldChange = (key: string, newValue: any) => {
    onChange({
      ...objValue,
      [key]: newValue,
    });
  };

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <FormLabel sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {propDef.label}
        </FormLabel>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Stack spacing={1.5}>
            {propDef.objectSchema?.map((field) => {
              const fieldValue = objValue[field.key];
              return (
                <Box key={field.key}>
                  {field.type === 'string' || field.type === 'url' ? (
                    <TextField
                      label={field.label}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      size="small"
                      fullWidth
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <TextField
                      label={field.label}
                      type="number"
                      value={fieldValue ?? field.default ?? 0}
                      onChange={(e) =>
                        handleFieldChange(field.key, Number(e.target.value))
                      }
                      size="small"
                      fullWidth
                      required={field.required}
                    />
                  ) : field.type === 'color' ? (
                    <Box>
                      <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        {field.label}
                      </FormLabel>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <input
                          type="color"
                          value={fieldValue || '#000000'}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          style={{
                            width: 50,
                            height: 35,
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        />
                        <TextField
                          value={fieldValue || '#000000'}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          size="small"
                          fullWidth
                          placeholder="#000000"
                        />
                      </Box>
                    </Box>
                  ) : (
                    <TextField
                      label={field.label}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      size="small"
                      fullWidth
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Collapse>
    </FormControl>
  );
};

export default ManualPropertyEditor;

