import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FilterConfig } from '@/types/generation';
import { SelectField } from './form-fields';

// === SOLID: SRP - Styled Components ===
const PlaceholderField = styled(Box)(({ theme }) => ({
  minHeight: 80,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.action.hover, 0.3),
  position: 'relative',
  padding: theme.spacing(2),
}));

const RequiredIndicator = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  position: 'absolute',
  top: 4,
  right: 4,
}));

// === SOLID: ISP - Specific interface for FieldRenderer ===
interface FieldRendererProps {
  config: FilterConfig;
  value: any;
  error?: string[];
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

// === SOLID: SRP - FieldRenderer component ===
const FieldRenderer: React.FC<FieldRendererProps> = ({
  config,
  value,
  error,
  onChange,
  onBlur,
  disabled = false
}) => {
  const theme = useTheme();
  
  // === SOLID: SRP - Render field based on type ===
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
        />
      );
    
    case 'multiselect':
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            MULTISELECT
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Буде реалізовано далі
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
    
    case 'radio':
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            RADIO
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Буде реалізовано далі
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
    
    case 'checkbox':
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            CHECKBOX
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Буде реалізовано далі
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
    
    case 'text':
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            TEXT
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Буде реалізовано далі
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
    
    case 'textarea':
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            TEXTAREA
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Буде реалізовано далі
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
    
    default:
      return (
        <PlaceholderField>
          <Typography variant="body2" color="text.secondary">
            UNKNOWN TYPE: {config.type}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.field}
          </Typography>
          {config.required && (
            <RequiredIndicator>*</RequiredIndicator>
          )}
        </PlaceholderField>
      );
  }
};

export default FieldRenderer; 