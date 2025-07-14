// === SOLID: SRP - Single Responsibility Principle ===
// Компонент відповідає тільки за рендеринг окремого поля форми

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Chip
} from '@mui/material';
import { FieldConfig } from '../../../types/generation';

interface FormFieldProps {
  fieldKey: string;
  config: FieldConfig;
  value: string | string[] | boolean;
  onChange: (fieldKey: string, value: string | string[] | boolean) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  fieldKey,
  config,
  value,
  onChange
}) => {
  const handleChange = (newValue: string | string[] | boolean) => {
    onChange(fieldKey, newValue);
  };

  // === SOLID: SRP - Кожен case відповідає за один тип поля ===
  switch (config.type) {
    case 'text':
      return (
        <TextField
          fullWidth
          label={config.label}
          placeholder={config.placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          size="small"
          helperText={config.description}
        />
      );
    
    case 'textarea':
      return (
        <TextField
          fullWidth
          label={config.label}
          placeholder={config.placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          multiline
          rows={3}
          size="small"
          helperText={config.description}
        />
      );
    
    case 'select':
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{config.label}</InputLabel>
          <Select
            value={value || ''}
            label={config.label}
            onChange={(e) => handleChange(e.target.value)}
          >
            {config.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    
    case 'multiselect':
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{config.label}</InputLabel>
          <Select
            multiple
            value={Array.isArray(value) ? value : []}
            label={config.label}
            onChange={(e) => {
              const selectedValue = Array.isArray(e.target.value) 
                ? e.target.value 
                : [e.target.value];
              handleChange(selectedValue);
            }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {config.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    
    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              size="small"
            />
          }
          label={config.label}
          sx={{ alignItems: 'flex-start' }}
        />
      );
    
    default:
      return null;
  }
}; 