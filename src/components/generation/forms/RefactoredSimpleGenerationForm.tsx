// === SOLID: SRP - Single Responsibility Principle ===
// Головний компонент відповідає тільки за координацію та стан форми

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Eye, Wand2 } from 'lucide-react';

// === SOLID: DIP - Dependency Inversion Principle ===
// Імпортуємо абстракції, а не конкретні реалізації
import { 
  AgeGroup, 
  BaseFormData,
  IAgeGroupConfigProvider,
  IFormValidator,
  IPromptGenerator
} from '../../../types/generation';

// === SOLID: SRP - Імпортуємо спеціалізовані компоненти ===
import { AgeGroupSelector } from './AgeGroupSelector';
import { FormSection } from './FormSection';

// === SOLID: SRP - Стилізовані компоненти ===
const FormContainer = styled(Card)(({ theme }) => ({
  maxWidth: 1000,
  margin: '0 auto',
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.3),
  borderBottomLeftRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
  borderBottomRightRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
}));

// === SOLID: DIP - Використовуємо dependency injection ===
interface RefactoredSimpleGenerationFormProps {
  configProvider: IAgeGroupConfigProvider;
  validator: IFormValidator<BaseFormData>;
  promptGenerator: IPromptGenerator<BaseFormData>;
  onGenerate: (data: { ageGroup: AgeGroup; formData: BaseFormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: BaseFormData }) => void;
}

export const RefactoredSimpleGenerationForm: React.FC<RefactoredSimpleGenerationFormProps> = ({
  configProvider,
  validator,
  promptGenerator,
  onGenerate,
  onPreview
}) => {
  const theme = useTheme();
  
  // === SOLID: SRP - Стан форми ===
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // === SOLID: SRP - Отримуємо конфігурації ===
  const allConfigs = useMemo(() => {
    return configProvider.getAllConfigs();
  }, [configProvider]);
  
  const currentConfig = useMemo(() => {
    return selectedAge ? configProvider.getConfig(selectedAge) : null;
  }, [selectedAge, configProvider]);
  
  // === SOLID: SRP - Обробка вибору вікової групи ===
  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAge(age);
    setFormData({ topic: '' }); // Скидаємо форму
  }, []);
  
  // === SOLID: SRP - Обробка зміни поля ===
  const handleFieldChange = useCallback((field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // === SOLID: SRP - Валідація через dependency injection ===
  const isFormValid = useMemo(() => {
    if (!selectedAge) return false;
    return validator.validate(formData as BaseFormData);
  }, [selectedAge, formData, validator]);
  
  // === SOLID: SRP - Генерація промпту через dependency injection ===
  const handlePreview = useCallback(() => {
    if (!selectedAge) return;
    
    onPreview({
      ageGroup: selectedAge,
      formData: formData as BaseFormData
    });
  }, [selectedAge, formData, onPreview]);
  
  const handleGenerate = useCallback(() => {
    if (!selectedAge) return;
    
    const detailedPrompt = promptGenerator.generatePrompt(selectedAge, formData as BaseFormData);
    
    onGenerate({
      ageGroup: selectedAge,
      formData: formData as BaseFormData,
      detailedPrompt
    });
  }, [selectedAge, formData, promptGenerator, onGenerate]);
  
  // === SOLID: SRP - Підготовка даних для розділів ===
  const sectionsData = useMemo(() => {
    if (!currentConfig) return [];
    
    return currentConfig.sections
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        section,
        fields: Object.entries(currentConfig.fields)
          .filter(([, fieldConfig]) => fieldConfig.section === section.id)
          .map(([key, config]) => ({
            key,
            config,
            value: formData[key] || (config.type === 'multiselect' ? [] : config.type === 'checkbox' ? false : '')
          }))
      }));
  }, [currentConfig, formData]);
  
  return (
    <FormContainer>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Конструктор уроків
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Оберіть вікову групу та заповніть деталі для створення персоналізованого уроку
          </Typography>
        </Box>
        
        {/* Age Group Selection */}
        <AgeGroupSelector
          selectedAge={selectedAge}
          onSelect={handleAgeSelect}
          configs={allConfigs}
        />
        
        {/* Preview Button */}
        {selectedAge && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<Eye size={16} />}
              onClick={handlePreview}
              disabled={!isFormValid}
            >
              Попередній перегляд
            </Button>
          </Box>
        )}
        
        {/* Form Sections */}
        {selectedAge && currentConfig && (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom>
                2. Деталі уроку
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Заповніть інформацію для створення уроку для групи {currentConfig.label}
              </Typography>
              
              {sectionsData.map(({ section, fields }) => (
                <FormSection
                  key={section.id}
                  section={section}
                  fields={fields}
                  onFieldChange={handleFieldChange}
                  defaultExpanded={section.id === 'basic'}
                />
              ))}
              
              {/* Form Status */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={isFormValid ? 'Готово до генерації' : 'Заповніть обов\'язкові поля'}
                  color={isFormValid ? 'success' : 'default'}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedAge === '2-3' && 'Оберіть тематику або введіть власну тему'}
                  {selectedAge === '4-6' && 'Оберіть тематику або введіть власну тему'}
                  {selectedAge === '7-8' && 'Оберіть предмет або введіть власну тему'}
                  {selectedAge === '9-10' && 'Оберіть предмет або введіть власну тему'}
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
      </CardContent>
      
      {/* Action Buttons */}
      {selectedAge && (
        <ActionButtonsContainer>
          <Button
            variant="contained"
            size="large"
            startIcon={<Wand2 size={20} />}
            onClick={handleGenerate}
            disabled={!isFormValid}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            Згенерувати урок
          </Button>
        </ActionButtonsContainer>
      )}
    </FormContainer>
  );
}; 