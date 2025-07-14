import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  TextField as MuiTextField,
  FormHelperText,
  Box,
  Typography,
  useTheme,
  alpha,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { FilterConfig } from '@/types/generation';

// === SOLID: SRP - Styled Components ===
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  
  '& .MuiTextField-root': {
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
  },
}));

const ValidationIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  
  '& .validation-icon': {
    fontSize: '0.875rem',
  },
  
  '& .validation-text': {
    fontSize: '0.75rem',
    lineHeight: 1.2,
  },
  
  '&.success': {
    color: theme.palette.success.main,
  },
  
  '&.error': {
    color: theme.palette.error.main,
  },
  
  '&.warning': {
    color: theme.palette.warning.main,
  },
}));

// === SOLID: SRP - Component Interface ===
interface TextFieldProps {
  config: FilterConfig;
  value: string | undefined;
  error?: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

// === SOLID: SRP - Main Component ===
const TextField: React.FC<TextFieldProps> = ({
  config,
  value = '',
  error,
  onChange,
  onBlur,
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  // === SOLID: SRP - Determine field type ===
  const isPasswordField = config.field.toLowerCase().includes('password');
  const isEmailField = config.field.toLowerCase().includes('email');
  const isNumberField = config.validation?.pattern === 'number';
  
  // === SOLID: SRP - Handle value change ===
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
  }, [onChange]);
  
  // === SOLID: SRP - Handle focus events ===
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);
  
  // === SOLID: SRP - Toggle password visibility ===
  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // === SOLID: SRP - Validate field in real-time ===
  const validateField = useCallback(() => {
    if (!value || !focused) return null;
    
    const { validation } = config;
    if (!validation) return null;
    
    // Length validation
    if (validation.minLength && value.length < validation.minLength) {
      return {
        type: 'warning' as const,
        message: `Minimum ${validation.minLength} characters required`
      };
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      return {
        type: 'error' as const,
        message: `Maximum ${validation.maxLength} characters allowed`
      };
    }
    
    // Pattern validation
    if (validation.pattern) {
      const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        number: /^\d+$/,
        phone: /^\+?[\d\s-()]+$/,
      };
      
      const pattern = patterns[validation.pattern as keyof typeof patterns];
      if (pattern && !pattern.test(value)) {
        return {
          type: 'error' as const,
          message: `Invalid ${validation.pattern} format`
        };
      }
    }
    
    // Custom validation
    if (validation.custom && !validation.custom(value)) {
      return {
        type: 'error' as const,
        message: 'Invalid value'
      };
    }
    
    return {
      type: 'success' as const,
      message: 'Valid'
    };
  }, [value, focused, config]);
  
  // === SOLID: SRP - Get input type ===
  const getInputType = useCallback(() => {
    if (isPasswordField) {
      return showPassword ? 'text' : 'password';
    }
    if (isEmailField) return 'email';
    if (isNumberField) return 'number';
    return 'text';
  }, [isPasswordField, isEmailField, isNumberField, showPassword]);
  
  // === SOLID: SRP - Check if field has error ===
  const hasError = error && error.length > 0;
  const validation = validateField();
  
  return (
    <StyledFormControl
      error={hasError}
      disabled={disabled}
      required={config.required}
    >
      <MuiTextField
        fullWidth
        size="small"
        label={config.label}
        type={getInputType()}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={config.placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        error={hasError}
        required={config.required}
        InputProps={{
          endAdornment: isPasswordField ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePassword}
                edge="end"
                size="small"
                aria-label="toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
        inputProps={{
          minLength: config.validation?.minLength,
          maxLength: config.validation?.maxLength,
        }}
      />
      
      {/* Real-time validation feedback */}
      {validation && focused && (
        <ValidationIndicator className={validation.type}>
          {validation.type === 'success' && <Check className="validation-icon" size={14} />}
          {validation.type === 'error' && <AlertCircle className="validation-icon" size={14} />}
          {validation.type === 'warning' && <AlertCircle className="validation-icon" size={14} />}
          <Typography className="validation-text">
            {validation.message}
          </Typography>
        </ValidationIndicator>
      )}
      
      {/* Error messages */}
      {hasError && (
        <FormHelperText>
          {error?.map((errorMsg, index) => (
            <span key={index}>{errorMsg}</span>
          ))}
        </FormHelperText>
      )}
      
      {/* Character count for fields with length limits */}
      {config.validation?.maxLength && focused && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 0.5,
            opacity: 0.7,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {value.length}/{config.validation.maxLength}
          </Typography>
        </Box>
      )}
    </StyledFormControl>
  );
};

export default TextField; 