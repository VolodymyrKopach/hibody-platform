/**
 * === SOLID: SRP - Single Responsibility ===
 * Компонент відповідальний лише за рендеринг полів форми
 */

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Chip
} from '@mui/material';
import { FieldRendererProps } from '../../types/generation';

// === SOLID: SRP - Окремі компоненти для різних типів полів ===

const TextFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: string;
  onChange: (value: string) => void;
}> = ({ fieldConfig, value, onChange }) => (
  <TextField
    fullWidth
    label={fieldConfig.label}
    placeholder={fieldConfig.placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    size="small"
  />
);

const TextAreaFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: string;
  onChange: (value: string) => void;
}> = ({ fieldConfig, value, onChange }) => (
  <TextField
    fullWidth
    label={fieldConfig.label}
    placeholder={fieldConfig.placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    multiline
    rows={3}
    size="small"
  />
);

const SelectFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: string;
  onChange: (value: string) => void;
}> = ({ fieldConfig, value, onChange }) => (
  <FormControl fullWidth size="small">
    <InputLabel>{fieldConfig.label}</InputLabel>
    <Select
      value={value || ''}
      label={fieldConfig.label}
      onChange={(e) => onChange(e.target.value)}
    >
      {fieldConfig.options?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const MultiSelectFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ fieldConfig, value, onChange }) => (
  <FormControl fullWidth size="small">
    <InputLabel>{fieldConfig.label}</InputLabel>
    <Select
      multiple
      value={Array.isArray(value) ? value : []}
      label={fieldConfig.label}
      onChange={(e) => {
        const selectedValue = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
        onChange(selectedValue);
      }}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(selected as string[]).map((value) => (
            <Chip key={value} label={value} size="small" />
          ))}
        </Box>
      )}
    >
      {fieldConfig.options?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const CheckboxFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ fieldConfig, value, onChange }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        size="small"
      />
    }
    label={fieldConfig.label}
    sx={{ alignItems: 'flex-start' }}
  />
);

// === SOLID: SRP - Головний компонент FieldRenderer ===
const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  fieldConfig,
  value,
  onChange
}) => {
  // === SOLID: OCP - Легко розширюється новими типами полів ===
  const renderField = () => {
    switch (fieldConfig.type) {
      case 'text':
        return (
          <TextFieldRenderer
            fieldConfig={fieldConfig}
            value={value as string}
            onChange={onChange as (value: string) => void}
          />
        );
      
      case 'textarea':
        return (
          <TextAreaFieldRenderer
            fieldConfig={fieldConfig}
            value={value as string}
            onChange={onChange as (value: string) => void}
          />
        );
      
      case 'select':
        return (
          <SelectFieldRenderer
            fieldConfig={fieldConfig}
            value={value as string}
            onChange={onChange as (value: string) => void}
          />
        );
      
      case 'multiselect':
        return (
          <MultiSelectFieldRenderer
            fieldConfig={fieldConfig}
            value={value as string[]}
            onChange={onChange as (value: string[]) => void}
          />
        );
      
      case 'checkbox':
        return (
          <CheckboxFieldRenderer
            fieldConfig={fieldConfig}
            value={value as boolean}
            onChange={onChange as (value: boolean) => void}
          />
        );
      
      default:
        console.warn(`Unknown field type: ${fieldConfig.type}`);
        return null;
    }
  };

  return (
    <Box key={fieldKey}>
      {renderField()}
    </Box>
  );
};

export default FieldRenderer; 