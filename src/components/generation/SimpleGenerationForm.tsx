/**
 * === SOLID: SRP - Simple Generation Form ===
 * 
 * Simple form for lesson generation with age-based dynamic fields
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Baby, 
  Users, 
  School, 
  GraduationCap,
  Eye,
  Wand2
} from 'lucide-react';

// === SOLID: SRP - Styled Components ===
const FormContainer = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const AgeButton = styled(Button)(({ theme }) => ({
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
  padding: theme.spacing(2, 3),
  minHeight: 80,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
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

// === SOLID: ISP - Type definitions ===
type AgeGroup = '2-3' | '4-6' | '7-8' | '9-10';

interface FormData {
  topic: string;
  difficulty: string;
  duration: string;
  activities: string;
  goals: string;
}

interface SimpleGenerationFormProps {
  onGenerate: (data: { ageGroup: AgeGroup; formData: FormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: FormData }) => void;
}

// === SOLID: SRP - Age group configurations ===
const getAgeGroupConfig = (ageGroup: AgeGroup) => {
  const configs = {
    '2-3': {
      icon: Baby,
      label: '2-3 роки',
      color: '#FF6B9D',
      fields: {
        topic: { label: 'Тема заняття', placeholder: 'Наприклад: кольори, фігури, тварини' },
        activities: { label: 'Активності', placeholder: 'Ігри, пісеньки, малювання' },
        duration: { label: 'Тривалість', options: ['15 хв', '20 хв', '30 хв'] },
        goals: { label: 'Цілі', placeholder: 'Розвиток моторики, мовлення, увага' }
      }
    },
    '4-6': {
      icon: Users,
      label: '4-6 років',
      color: '#4ECDC4',
      fields: {
        topic: { label: 'Тема уроку', placeholder: 'Математика, природа, мистецтво' },
        difficulty: { label: 'Складність', options: ['Легка', 'Середня'] },
        activities: { label: 'Типи активностей', placeholder: 'Творчі завдання, експерименти' },
        duration: { label: 'Тривалість', options: ['30 хв', '45 хв', '60 хв'] },
        goals: { label: 'Навчальні цілі', placeholder: 'Логіка, креативність, соціалізація' }
      }
    },
    '7-8': {
      icon: School,
      label: '7-8 років',
      color: '#45B7D1',
      fields: {
        topic: { label: 'Предмет/Тема', placeholder: 'Українська мова, математика, природознавство' },
        difficulty: { label: 'Рівень складності', options: ['Базовий', 'Поглиблений'] },
        activities: { label: 'Методи навчання', placeholder: 'Проектна робота, дослідження' },
        duration: { label: 'Тривалість', options: ['45 хв', '60 хв', '90 хв'] },
        goals: { label: 'Освітні результати', placeholder: 'Знання, навички, компетенції' }
      }
    },
    '9-10': {
      icon: GraduationCap,
      label: '9-10 років',
      color: '#96CEB4',
      fields: {
        topic: { label: 'Дисципліна', placeholder: 'Історія, географія, біологія' },
        difficulty: { label: 'Академічний рівень', options: ['Стандартний', 'Підвищений', 'Олімпіадний'] },
        activities: { label: 'Навчальні активності', placeholder: 'Аналіз, синтез, критичне мислення' },
        duration: { label: 'Тривалість', options: ['60 хв', '90 хв', '120 хв'] },
        goals: { label: 'Компетентності', placeholder: 'Аналітичне мислення, дослідницькі навички' }
      }
    }
  };
  
  return configs[ageGroup];
};

// === SOLID: SRP - Main Component ===
const SimpleGenerationForm: React.FC<SimpleGenerationFormProps> = ({
  onGenerate,
  onPreview
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  // === SOLID: SRP - State management ===
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    difficulty: '',
    duration: '',
    activities: '',
    goals: ''
  });
  
  // === SOLID: SRP - Get current configuration ===
  const currentConfig = useMemo(() => {
    return selectedAge ? getAgeGroupConfig(selectedAge) : null;
  }, [selectedAge]);
  
  // === SOLID: SRP - Handle age selection ===
  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAge(age);
    // Reset form when age changes
    setFormData({
      topic: '',
      difficulty: '',
      duration: '',
      activities: '',
      goals: ''
    });
  }, []);
  
  // === SOLID: SRP - Handle form field change ===
  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // === SOLID: SRP - Check if form is valid ===
  const isFormValid = useMemo(() => {
    if (!selectedAge || !currentConfig) return false;
    
    const requiredFields = Object.keys(currentConfig.fields);
    return requiredFields.every(field => 
      formData[field as keyof FormData]?.trim().length > 0
    );
  }, [selectedAge, currentConfig, formData]);
  
  // === SOLID: SRP - Generate detailed prompt ===
  const generateDetailedPrompt = useCallback(() => {
    if (!selectedAge || !currentConfig) return '';
    
    return `Створи детальний урок для дітей віком ${selectedAge} років.

Тема: ${formData.topic}
${formData.difficulty ? `Складність: ${formData.difficulty}` : ''}
Тривалість: ${formData.duration}
Активності: ${formData.activities}
Цілі: ${formData.goals}

Урок повинен включати:
- Детальний план заняття
- Пояснення матеріалу простою мовою
- Інтерактивні елементи та ігри
- Практичні завдання
- Способи перевірки розуміння

Адаптуй зміст під віковую групу ${selectedAge} років, використовуючи відповідну лексику та методи навчання.`;
  }, [selectedAge, currentConfig, formData]);
  
  // === SOLID: SRP - Handle preview ===
  const handlePreview = useCallback(() => {
    if (!selectedAge) return;
    
    onPreview({
      ageGroup: selectedAge,
      formData
    });
  }, [selectedAge, formData, onPreview]);
  
  // === SOLID: SRP - Handle generate ===
  const handleGenerate = useCallback(() => {
    if (!selectedAge) return;
    
    const detailedPrompt = generateDetailedPrompt();
    
    onGenerate({
      ageGroup: selectedAge,
      formData,
      detailedPrompt
    });
  }, [selectedAge, formData, generateDetailedPrompt, onGenerate]);
  
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
        
        {/* Age Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Оберіть вікову групу
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 2,
            mb: 3
          }}>
            {(['2-3', '4-6', '7-8', '9-10'] as AgeGroup[]).map((age) => {
              const config = getAgeGroupConfig(age);
              const Icon = config.icon;
              const isSelected = selectedAge === age;
              
              return (
                <AgeButton
                  key={age}
                  variant={isSelected ? 'contained' : 'outlined'}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => handleAgeSelect(age)}
                  sx={{
                    borderColor: config.color,
                    '&.selected': {
                      backgroundColor: config.color,
                      borderColor: config.color,
                    },
                    '&:hover': {
                      borderColor: config.color,
                      backgroundColor: alpha(config.color, 0.1),
                    }
                  }}
                >
                  <Icon size={24} />
                  <Typography variant="caption" fontWeight="bold">
                    {config.label}
                  </Typography>
                </AgeButton>
              );
            })}
          </Box>
          
          {/* Preview/Save Button near age buttons */}
          {selectedAge && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Eye size={16} />}
                onClick={handlePreview}
                disabled={!isFormValid}
                sx={{ mr: 1 }}
              >
                Попередній перегляд
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Form Fields */}
        {selectedAge && currentConfig && (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom>
                2. Деталі уроку
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Заповніть інформацію для створення уроку для групи {currentConfig.label}
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 3
              }}>
                {Object.entries(currentConfig.fields).map(([fieldKey, fieldConfig]) => {
                  const value = formData[fieldKey as keyof FormData];
                  
                  if ('options' in fieldConfig) {
                    // Dropdown field
                    return (
                      <FormControl key={fieldKey} fullWidth>
                        <InputLabel>{fieldConfig.label}</InputLabel>
                        <Select
                          value={value}
                          label={fieldConfig.label}
                          onChange={(e) => handleFieldChange(fieldKey as keyof FormData, e.target.value)}
                        >
                          {fieldConfig.options.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  } else {
                    // Text field
                    return (
                      <TextField
                        key={fieldKey}
                        fullWidth
                        label={fieldConfig.label}
                        placeholder={fieldConfig.placeholder}
                        value={value}
                        onChange={(e) => handleFieldChange(fieldKey as keyof FormData, e.target.value)}
                        multiline={fieldKey === 'activities' || fieldKey === 'goals'}
                        rows={fieldKey === 'activities' || fieldKey === 'goals' ? 3 : 1}
                      />
                    );
                  }
                })}
              </Box>
              
              {/* Form Status */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={isFormValid ? 'Готово до генерації' : 'Заповніть всі поля'}
                  color={isFormValid ? 'success' : 'default'}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  {Object.values(formData).filter(v => v.trim()).length} з {Object.keys(currentConfig.fields).length} полів заповнено
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

export default SimpleGenerationForm; 