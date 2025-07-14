import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  useTheme,
  alpha,
  SelectChangeEvent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, ChevronDown } from 'lucide-react';
import { FilterConfig, FilterOption } from '@/types/generation';

// === SOLID: SRP - Styled Components ===
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  
  '& .MuiOutlinedInput-root': {
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-icon': {
    color: theme.palette.text.secondary,
    transition: 'transform 0.2s ease',
  },
  
  '&.Mui-focused .MuiSelect-icon': {
    transform: 'rotate(180deg)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.25, 1),
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

const OptionContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  width: '100%',
}));

const OptionIcon = styled(Box)(({ theme }) => ({
  fontSize: '1.125rem',
  lineHeight: 1,
  minWidth: 20,
  textAlign: 'center',
}));

const OptionText = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
}));

const OptionLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.2,
}));

const OptionDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.2,
}));

const RequiredIndicator = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(0.5),
}));

// === SOLID: ISP - Specific interface for SelectField ===
interface SelectFieldProps {
  config: FilterConfig;
  value: string | undefined;
  error?: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

// === SOLID: SRP - SelectField component ===
const SelectField: React.FC<SelectFieldProps> = ({
  config,
  value,
  error,
  onChange,
  onBlur,
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  // === SOLID: SRP - Handle value change ===
  const handleChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value as string;
    onChange(newValue);
  }, [onChange]);
  
  // === SOLID: SRP - Handle blur ===
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);
  
  // === SOLID: SRP - Get selected option ===
  const selectedOption = config.options?.find(option => option.value === value);
  
  // === SOLID: SRP - Check if field has error ===
  const hasError = error && error.length > 0;
  
  return (
    <StyledFormControl
      error={hasError}
      disabled={disabled}
      required={config.required}
    >
      <InputLabel id={`${config.field}-label`}>
        {config.label}
        {config.required && <RequiredIndicator>*</RequiredIndicator>}
      </InputLabel>
      
      <StyledSelect
        labelId={`${config.field}-label`}
        id={config.field}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        label={config.label}
        autoFocus={autoFocus}
        IconComponent={ChevronDown}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography variant="body2" color="text.secondary">
                {config.placeholder || t('form.selectOption', 'Оберіть варіант')}
              </Typography>
            );
          }
          
          const option = config.options?.find(opt => opt.value === selected);
          return (
            <OptionContent>
              {option?.icon && (
                <OptionIcon>{option.icon}</OptionIcon>
              )}
              <OptionText>
                <OptionLabel>{option?.label || selected}</OptionLabel>
              </OptionText>
            </OptionContent>
          );
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
              borderRadius: (theme.shape.borderRadius as number) * 1.5,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
      >
        {/* Empty option for clearing selection */}
        {!config.required && (
          <StyledMenuItem value="">
            <OptionContent>
              <OptionText>
                <OptionLabel color="text.secondary">
                  {t('form.clearSelection', 'Очистити вибір')}
                </OptionLabel>
              </OptionText>
            </OptionContent>
          </StyledMenuItem>
        )}
        
        {/* Options */}
        {config.options?.map((option: FilterOption) => (
          <StyledMenuItem
            key={option.id}
            value={option.value}
            selected={value === option.value}
          >
            <OptionContent>
              {option.icon && (
                <OptionIcon>{option.icon}</OptionIcon>
              )}
              <OptionText>
                <OptionLabel>{option.label}</OptionLabel>
                {option.description && (
                  <OptionDescription>{option.description}</OptionDescription>
                )}
              </OptionText>
              {value === option.value && (
                <Check size={16} color={theme.palette.primary.main} />
              )}
            </OptionContent>
          </StyledMenuItem>
        ))}
      </StyledSelect>
      
      {hasError && (
        <FormHelperText>
          {error.join(', ')}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default SelectField; 