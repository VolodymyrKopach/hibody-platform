import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  TextField as MuiTextField,
  FormHelperText,
  Box,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AlertCircle, Check, Maximize2, Minimize2 } from 'lucide-react';
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
      
      '& .MuiInputBase-inputMultiline': {
        padding: theme.spacing(1.5),
        minHeight: '80px',
        resize: 'vertical',
        lineHeight: 1.5,
        fontFamily: theme.typography.body1.fontFamily,
        fontSize: '0.875rem',
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

const TextareaActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(0.5),
  
  '& .actions-left': {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  
  '& .actions-right': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

// === SOLID: SRP - Component Interface ===
interface TextareaFieldProps {
  config: FilterConfig;
  value: string | undefined;
  error?: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

// === SOLID: SRP - Main Component ===
const TextareaField: React.FC<TextareaFieldProps> = ({
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
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // === SOLID: SRP - Toggle expanded mode ===
  const handleToggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // === SOLID: SRP - Auto-resize textarea ===
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);
  
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
    
    // Custom validation
    if (validation.custom && !validation.custom(value)) {
      return {
        type: 'error' as const,
        message: 'Invalid content'
      };
    }
    
    return {
      type: 'success' as const,
      message: 'Valid content'
    };
  }, [value, focused, config]);
  
  // === SOLID: SRP - Get word count ===
  const getWordCount = useCallback(() => {
    if (!value) return 0;
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [value]);
  
  // === SOLID: SRP - Get character count without spaces ===
  const getCharacterCount = useCallback(() => {
    return value.replace(/\s/g, '').length;
  }, [value]);
  
  // === SOLID: SRP - Check if field has error ===
  const hasError = error && error.length > 0;
  const validation = validateField();
  const wordCount = getWordCount();
  const charCount = getCharacterCount();
  
  return (
    <StyledFormControl
      error={hasError}
      disabled={disabled}
      required={config.required}
    >
      <MuiTextField
        fullWidth
        multiline
        size="small"
        label={config.label}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={config.placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        error={hasError}
        required={config.required}
        rows={expanded ? 8 : 4}
        maxRows={expanded ? 12 : 6}
        inputRef={textareaRef}
        inputProps={{
          minLength: config.validation?.minLength,
          maxLength: config.validation?.maxLength,
          style: {
            resize: 'vertical',
          },
        }}
        sx={{
          '& .MuiInputBase-inputMultiline': {
            transition: 'all 0.3s ease-in-out',
            ...(expanded && {
              minHeight: '200px',
            }),
          },
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
      
      {/* Textarea actions and stats */}
      <TextareaActions>
        <Box className="actions-left">
          <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box className="actions-right">
          {/* Word count */}
          <Typography variant="caption" color="text.secondary">
            {wordCount} words
          </Typography>
          
          {/* Character count */}
          <Typography variant="caption" color="text.secondary">
            {charCount} chars
          </Typography>
          
          {/* Character count with limit */}
          {config.validation?.maxLength && (
            <Typography 
              variant="caption" 
              color={value.length > config.validation.maxLength ? 'error' : 'text.secondary'}
            >
              {value.length}/{config.validation.maxLength}
            </Typography>
          )}
        </Box>
      </TextareaActions>
    </StyledFormControl>
  );
};

export default TextareaField; 