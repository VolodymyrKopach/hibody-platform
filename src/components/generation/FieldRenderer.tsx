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

// === SOLID: SRP - Утилітарна функція для перевірки наявності власного поля ===
const hasCustomOption = (options?: string[]): boolean => {
  if (!options) return false;
  return options.some(option => 
    option.includes('✏️ Власне') || 
    option.includes('✏️ Власний') || 
    option.includes('✍️ Власне') ||
    option.includes('✍️ Власний') ||
    option.includes('✨ Власний')
  );
};

const getCustomOptionValue = (options?: string[]): string | undefined => {
  if (!options) return undefined;
  return options.find(option => 
    option.includes('✏️ Власне') || 
    option.includes('✏️ Власний') || 
    option.includes('✍️ Власне') ||
    option.includes('✍️ Власний') ||
    option.includes('✨ Власний')
  );
};

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
}> = ({ fieldConfig, value, onChange }) => {
  const hasCustom = hasCustomOption(fieldConfig.options);
  const customOption = getCustomOptionValue(fieldConfig.options);
  
  // Стан для власного текстового поля
  const [customText, setCustomText] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState(value || '');
  
  // Ref для відстеження внутрішніх змін
  const isInternalChange = React.useRef(false);
  
  // Перевіряємо чи вибрано власну опцію
  const isCustomSelected = selectedOption === customOption;
  
  // Мемоізований onChange callback
  const handleValueChange = React.useCallback((newValue: string) => {
    if (newValue !== value) {
      isInternalChange.current = true;
      onChange(newValue);
    }
  }, [value, onChange]);
  
  // Синхронізація з батьківським компонентом (тільки коли значення змінилось ззовні)
  React.useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    if (value && fieldConfig.options?.includes(value)) {
      setSelectedOption(value);
      setCustomText('');
    } else if (value && !fieldConfig.options?.includes(value)) {
      setCustomText(value);
      setSelectedOption(customOption || '');
    } else if (!value) {
      setSelectedOption('');
      setCustomText('');
    }
  }, [value, fieldConfig.options, customOption]);
  
  // Обробка змін у полях
  const handleSelectChange = React.useCallback((newSelectedOption: string) => {
    setSelectedOption(newSelectedOption);
    if (newSelectedOption !== customOption) {
      setCustomText('');
      handleValueChange(newSelectedOption);
    } else {
      // Якщо вибрали власну опцію, але немає тексту, передаємо порожнє значення
      handleValueChange(customText || '');
    }
  }, [customOption, customText, handleValueChange]);
  
  const handleCustomTextChange = React.useCallback((newCustomText: string) => {
    setCustomText(newCustomText);
    handleValueChange(newCustomText);
  }, [handleValueChange]);
  
  if (hasCustom) {
    return (
      <Box sx={{ width: '100%' }}>
        {!isCustomSelected ? (
          // Коли власна опція не вибрана - показуємо тільки селект на всю ширину
          <FormControl fullWidth size="small">
            <InputLabel>{fieldConfig.label}</InputLabel>
            <Select
              value={selectedOption}
              label={fieldConfig.label}
              onChange={(e) => handleSelectChange(e.target.value)}
            >
              {fieldConfig.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          // Коли власна опція вибрана - показуємо селект і поле введення поруч
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl size="small" sx={{ minWidth: 200, flexShrink: 0 }}>
              <InputLabel>{fieldConfig.label}</InputLabel>
              <Select
                value={selectedOption}
                label={fieldConfig.label}
                onChange={(e) => handleSelectChange(e.target.value)}
              >
                {fieldConfig.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Власний варіант"
              placeholder="Введіть власний варіант..."
              value={customText}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
        )}
      </Box>
    );
  }
  
  // Стандартний dropdown без власного поля
  return (
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
};

const MultiSelectFieldRenderer: React.FC<{
  fieldConfig: FieldRendererProps['fieldConfig'];
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ fieldConfig, value, onChange }) => {
  const hasCustom = hasCustomOption(fieldConfig.options);
  const customOption = getCustomOptionValue(fieldConfig.options);
  
  // Стан для власного текстового поля
  const [customText, setCustomText] = React.useState('');
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  
  // Ref для відстеження внутрішніх змін
  const isInternalChange = React.useRef(false);
  
  // Перевіряємо чи вибрано власну опцію
  const isCustomSelected = selectedOptions.includes(customOption || '');
  
  // Мемоізований onChange callback
  const handleValueChange = React.useCallback((newValue: string[]) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
      isInternalChange.current = true;
      onChange(newValue);
    }
  }, [value, onChange]);
  
  // Синхронізація з батьківським компонентом (тільки коли значення змінилось ззовні)
  React.useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    const currentValue = Array.isArray(value) ? value : [];
    const standardOptions = fieldConfig.options || [];
    const customValues = currentValue.filter(v => !standardOptions.includes(v));
    const standardValues = currentValue.filter(v => standardOptions.includes(v));
    
    setSelectedOptions(standardValues);
    
    if (customValues.length > 0) {
      setCustomText(customValues[0]);
      if (customOption && !standardValues.includes(customOption)) {
        setSelectedOptions(prev => [...prev, customOption]);
      }
    } else {
      setCustomText('');
    }
  }, [value, fieldConfig.options, customOption]);
  
  // Обробка змін у полях
  const handleSelectChange = React.useCallback((newSelectedOptions: string[]) => {
    setSelectedOptions(newSelectedOptions);
    
    let finalValue = [...newSelectedOptions];
    
    // Якщо прибрали власний варіант, очищуємо текст
    if (!newSelectedOptions.includes(customOption || '')) {
      setCustomText('');
      finalValue = newSelectedOptions;
    } else if (customText) {
      // Якщо є власний текст, замінюємо customOption на customText
      finalValue = finalValue.filter(opt => opt !== customOption).concat([customText]);
    } else {
      // Якщо вибрали власну опцію, але немає тексту, залишаємо тільки стандартні опції
      finalValue = finalValue.filter(opt => opt !== customOption);
    }
    
    handleValueChange(finalValue);
  }, [customOption, customText, handleValueChange]);
  
  const handleCustomTextChange = React.useCallback((newCustomText: string) => {
    setCustomText(newCustomText);
    
    // Формуємо фінальне значення - якщо є текст, додаємо його замість customOption
    const finalValue = newCustomText 
      ? selectedOptions.filter(opt => opt !== customOption).concat([newCustomText])
      : selectedOptions.filter(opt => opt !== customOption);
    
    handleValueChange(finalValue);
  }, [selectedOptions, customOption, handleValueChange]);
  
  if (hasCustom) {
    return (
      <Box sx={{ width: '100%' }}>
        {!isCustomSelected ? (
          // Коли власна опція не вибрана - показуємо тільки селект на всю ширину
          <FormControl fullWidth size="small">
            <InputLabel>{fieldConfig.label}</InputLabel>
            <Select
              multiple
              value={selectedOptions}
              label={fieldConfig.label}
              onChange={(e) => {
                const newValue = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                handleSelectChange(newValue);
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((selectedValue) => {
                    const displayValue = selectedValue === customOption && customText ? customText : selectedValue;
                    return (
                      <Chip key={selectedValue} label={displayValue} size="small" />
                    );
                  })}
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
        ) : (
          // Коли власна опція вибрана - показуємо селект і поле введення поруч
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl size="small" sx={{ minWidth: 200, flexShrink: 0 }}>
              <InputLabel>{fieldConfig.label}</InputLabel>
              <Select
                multiple
                value={selectedOptions}
                label={fieldConfig.label}
                onChange={(e) => {
                  const newValue = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                  handleSelectChange(newValue);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((selectedValue) => {
                      const displayValue = selectedValue === customOption && customText ? customText : selectedValue;
                      return (
                        <Chip key={selectedValue} label={displayValue} size="small" />
                      );
                    })}
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
            
            <TextField
              label="Власний варіант"
              placeholder="Введіть власний варіант..."
              value={customText}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
        )}
      </Box>
    );
  }
  
  // Стандартний multiselect без власного поля
  return (
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
};

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