/**
 * === SOLID: SRP - Simple Generation Form ===
 * 
 * Відрефакторований компонент форми, який використовує SOLID принципи
 */

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  alpha,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Eye,
  Wand2,
  ChevronDown
} from 'lucide-react';

// === SOLID: DIP - Імпорт залежностей через абстракції ===
import { SimpleGenerationFormProps } from '../../types/generation';
import { useGenerationForm } from '../../hooks/useGenerationForm';
import { getAgeGroupConfig } from './configs';
import AgeGroupSelector from './AgeGroupSelector';
import FieldRenderer from './FieldRenderer';

// === SOLID: SRP - Styled Components ===
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

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '& .MuiAccordionSummary-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
  }
}));

// === SOLID: SRP - Основний компонент ===
const SimpleGenerationForm: React.FC<SimpleGenerationFormProps> = ({
  onGenerate,
  onPreview
}) => {
  const theme = useTheme();
  
  // === SOLID: SRP - Використання кастомного хука ===
  const {
    selectedAge,
    formData,
    isFormValid,
    validationErrors,
    handleAgeSelect,
    handleFieldChange,
    handleGenerate,
    handlePreview
  } = useGenerationForm({ onGenerate, onPreview });
  
  // === SOLID: SRP - Отримання конфігурації поточної вікової групи ===
  const currentConfig = selectedAge ? getAgeGroupConfig(selectedAge) : null;
  
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
        <AgeGroupSelector
          selectedAge={selectedAge}
          onAgeSelect={handleAgeSelect}
        />
        
        {/* Preview Button */}
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
              
              {/* Sections */}
              <Box>
                {currentConfig.sections.map((section) => {
                  const fieldsInSection = Object.entries(currentConfig.fields).filter(
                    ([, fieldConfig]) => fieldConfig.section === section.id
                  );
                  
                  if (fieldsInSection.length === 0) return null;
                  
                  return (
                    <SectionCard key={section.id} elevation={1}>
                      <Accordion defaultExpanded={section.id === 'basic' || section.id === 'academic'}>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {section.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {section.description}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 3
                          }}>
                            {fieldsInSection.map(([fieldKey, fieldConfig]) => {
                              const value = formData[fieldKey as keyof typeof formData];
                              return (
                                <FieldRenderer
                                  key={fieldKey}
                                  fieldKey={fieldKey}
                                  fieldConfig={fieldConfig}
                                  value={value || ''}
                                  onChange={(newValue) => 
                                    handleFieldChange(fieldKey as keyof typeof formData, newValue)
                                  }
                                />
                              );
                            })}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </SectionCard>
                  );
                })}
              </Box>
              
              {/* Form Status */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={isFormValid ? 'Готово до генерації' : 'Заповніть обов\'язкові поля'}
                  color={isFormValid ? 'success' : 'default'}
                  size="small"
                />
                {validationErrors.length > 0 && (
                  <Typography variant="caption" color="error">
                    {validationErrors[0]}
                  </Typography>
                )}
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