import React from 'react';
import { FilterConfig } from '@/types/generation';
import { 
  SelectField, 
  MultiSelectField,
  RadioField, 
  CheckboxField,
  TextField,
  TextareaField 
} from './';
import { FieldRendererProps } from './types';

// === SOLID: SRP - Single responsibility: render appropriate field based on type ===
const FieldRenderer: React.FC<FieldRendererProps> = ({
  config,
  value,
  error,
  onChange,
  onBlur,
  disabled = false,
  autoFocus = false
}) => {
  
  // === SOLID: OCP - Open for extension: easy to add new field types ===
  switch (config.type) {
    case 'select':
      return (
        <SelectField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    case 'multiselect':
      return (
        <MultiSelectField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    case 'radio':
      return (
        <RadioField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    case 'checkbox':
      return (
        <CheckboxField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    case 'text':
      return (
        <TextField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    case 'textarea':
      return (
        <TextareaField
          config={config}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
      
    default:
      // === SOLID: LSP - Fallback maintains interface contract ===
      return (
        <TextField
          config={{
            ...config,
            type: 'text'
          }}
          value={value}
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      );
  }
};

export default FieldRenderer; 