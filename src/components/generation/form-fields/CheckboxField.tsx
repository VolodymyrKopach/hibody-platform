import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  FormHelperText,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, Square, CheckSquare, Circle } from 'lucide-react';
import { FilterConfig, FilterOption } from '@/types/generation';

// === SOLID: SRP - Styled Components ===
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  
  '& .MuiFormLabel-root': {
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledFormGroup = styled(FormGroup)(({ theme }) => ({
  gap: theme.spacing(0.5),
  
  '& .MuiFormControlLabel-root': {
    margin: 0,
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    padding: theme.spacing(0.5),
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'translateX(2px)',
    },
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: theme.spacing(0.75),
  
  '&:hover': {
    backgroundColor: 'transparent',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    color: theme.palette.text.secondary,
  },
  
  '&.Mui-checked': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const OptionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  
  '&.selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const OptionContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  
  '& .option-icon': {
    fontSize: '1.1rem',
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
  
  '& .option-text': {
    flex: 1,
    
    '& .option-label': {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.25),
    },
    
    '& .option-description': {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      lineHeight: 1.4,
    },
  },
  
  '& .option-checkbox': {
    flexShrink: 0,
  },
}));

// === SOLID: SRP - Component Interface ===
interface CheckboxFieldProps {
  config: FilterConfig;
  value: string[] | undefined;
  error?: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

// === SOLID: SRP - Main Component ===
const CheckboxField: React.FC<CheckboxFieldProps> = ({
  config,
  value = [],
  error,
  onChange,
  onBlur,
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  // === SOLID: SRP - Handle value change ===
  const handleChange = useCallback((optionValue: string, checked: boolean) => {
    let newValue: string[];
    
    if (checked) {
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter(v => v !== optionValue);
    }
    
    onChange(newValue);
  }, [value, onChange]);
  
  // === SOLID: SRP - Handle option click ===
  const handleOptionClick = useCallback((optionValue: string) => {
    if (!disabled) {
      const isChecked = value.includes(optionValue);
      handleChange(optionValue, !isChecked);
    }
  }, [value, handleChange, disabled]);
  
  // === SOLID: SRP - Check if option is selected ===
  const isOptionSelected = useCallback((optionValue: string) => {
    return value.includes(optionValue);
  }, [value]);
  
  // === SOLID: SRP - Check if field has error ===
  const hasError = error && error.length > 0;
  
  return (
    <StyledFormControl
      error={hasError}
      disabled={disabled}
      required={config.required}
    >
      <FormLabel component="legend">
        {config.label}
        {config.required && (
          <span style={{ color: theme.palette.error.main, marginLeft: 4 }}>*</span>
        )}
      </FormLabel>
      
      <StyledFormGroup onBlur={onBlur}>
        {config.options?.map((option: FilterOption) => {
          const isSelected = isOptionSelected(option.value);
          
          return (
            <OptionCard
              key={option.value}
              className={isSelected ? 'selected' : ''}
              onClick={() => handleOptionClick(option.value)}
              elevation={0}
            >
              <OptionContent>
                {option.icon && (
                  <Box className="option-icon">
                    {/* Icon placeholder - can be extended to render actual icons */}
                    <Circle size={16} />
                  </Box>
                )}
                
                <Box className="option-text">
                  <Typography className="option-label">
                    {option.label}
                  </Typography>
                  {option.description && (
                    <Typography className="option-description">
                      {option.description}
                    </Typography>
                  )}
                </Box>
                
                <Box className="option-checkbox">
                  <FormControlLabel
                    control={
                      <StyledCheckbox
                        checked={isSelected}
                        onChange={(event) => handleChange(option.value, event.target.checked)}
                        icon={<Square size={16} />}
                        checkedIcon={<CheckSquare size={16} />}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </OptionContent>
            </OptionCard>
          );
        })}
      </StyledFormGroup>
      
      {hasError && (
        <FormHelperText>
          {error?.map((errorMsg, index) => (
            <span key={index}>{errorMsg}</span>
          ))}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default CheckboxField; 