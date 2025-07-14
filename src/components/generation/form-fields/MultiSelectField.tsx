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
  SelectChangeEvent,
  Chip,
  ListItemText,
  Checkbox,
  OutlinedInput
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, ChevronDown, X } from 'lucide-react';
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
  '& .MuiSelect-select': {
    padding: theme.spacing(1.5, 1.5, 1.5, 1.5),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    minHeight: '1.4375em',
  },
  
  '& .MuiSelect-icon': {
    color: theme.palette.text.secondary,
    fontSize: '1.2rem',
    right: 12,
    transition: 'transform 0.2s ease-in-out',
  },
  
  '&.Mui-focused .MuiSelect-icon': {
    transform: 'rotate(180deg)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.25, 0.5),
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
  
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    fontWeight: 500,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  height: '24px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
  
  '& .MuiChip-deleteIcon': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
  
  '&.MuiChip-filled': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  },
}));

// === SOLID: SRP - Component Interface ===
interface MultiSelectFieldProps {
  config: FilterConfig;
  value: string[] | undefined;
  error?: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

// === SOLID: SRP - Main Component ===
const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  config,
  value = [],
  error,
  onChange,
  onBlur,
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation('common');
  
  // === SOLID: SRP - Handle selection changes ===
  const handleChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value as string[];
    onChange(newValue);
  }, [onChange]);

  // === SOLID: SRP - Handle chip deletion ===
  const handleDeleteChip = useCallback((chipValue: string) => {
    const newValue = value.filter(v => v !== chipValue);
    onChange(newValue);
  }, [value, onChange]);

  // === SOLID: SRP - Get option label ===
  const getOptionLabel = useCallback((optionValue: string) => {
    const option = config.options?.find(opt => opt.value === optionValue);
    return option?.label || optionValue;
  }, [config.options]);

  // === SOLID: SRP - Render selected values ===
  const renderValue = useCallback((selected: unknown) => {
    const selectedArray = selected as string[];
    if (selectedArray.length === 0) {
      return <Typography variant="body2" color="text.secondary">{config.placeholder}</Typography>;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedArray.map((val) => (
          <StyledChip
            key={val}
            variant="filled"
            size="small"
            label={getOptionLabel(val)}
            onDelete={() => handleDeleteChip(val)}
            deleteIcon={<X size={14} />}
            disabled={disabled}
          />
        ))}
      </Box>
    );
  }, [config.placeholder, getOptionLabel, handleDeleteChip, disabled]);

  // === SOLID: SRP - Check if option is selected ===
  const isOptionSelected = useCallback((optionValue: string) => {
    return value.includes(optionValue);
  }, [value]);

  return (
    <StyledFormControl
      variant="outlined"
      error={Boolean(error?.length)}
      disabled={disabled}
      size="small"
    >
      <InputLabel shrink={value.length > 0}>
        {config.label}
        {config.required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
      </InputLabel>
      
      <StyledSelect
        multiple
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        input={<OutlinedInput label={config.label} />}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 224,
              width: 250,
            },
          },
        }}
        IconComponent={ChevronDown}
        autoFocus={autoFocus}
      >
        {config.options?.map((option: FilterOption) => (
          <StyledMenuItem key={option.value} value={option.value}>
            <Checkbox
              checked={isOptionSelected(option.value)}
              size="small"
              sx={{
                color: 'primary.main',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
            <ListItemText 
              primary={option.label}
              secondary={option.description}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: isOptionSelected(option.value) ? 500 : 400,
                },
                '& .MuiListItemText-secondary': {
                  fontSize: '0.75rem',
                },
              }}
            />
            {isOptionSelected(option.value) && (
              <Check 
                size={16} 
                style={{ 
                  marginLeft: 'auto',
                  color: 'inherit'
                }} 
              />
            )}
          </StyledMenuItem>
        ))}
      </StyledSelect>
      
      {error?.length && error.length > 0 && (
        <FormHelperText>
          {error.map((errorMsg, index) => (
            <span key={index}>{errorMsg}</span>
          ))}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default MultiSelectField; 