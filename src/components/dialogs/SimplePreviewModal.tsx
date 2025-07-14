/**
 * === SOLID: SRP - Simple Preview Modal ===
 * 
 * Simple modal to preview lesson generation parameters
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, Clock, Target, BookOpen, Activity } from 'lucide-react';

// === SOLID: SRP - Styled Components ===
const PreviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const FieldRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  
  '&:last-child': {
    marginBottom: 0,
  },
}));

const FieldIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

// === SOLID: ISP - Component interfaces ===
type AgeGroup = '2-3' | '4-6' | '7-8' | '9-10';

interface FormData {
  // Базовые поля
  topic: string;
  difficulty: string;
  duration: string;
  activities: string;
  goals: string;
  
  // Поля для 4-6 лет
  // Базовые фильтры
  thematic?: string;
  taskTypes?: string[];
  language?: string;
  
  // Специализированные фильтры
  learningGoal?: string;
  complexityLevel?: string;
  lessonDuration?: string;
  
  // Интерактивные настройки
  presentationStyle?: string;
  audioSupport?: string[];
  participationFormat?: string;
  
  // Технические параметры
  visualDesign?: string[];
  presentationSpeed?: string;
  interactivity?: string;
  
  // Образовательные стандарты
  educationalProgram?: string;
  gradingSystem?: string;
  
  // Новые поля для 2-4 лет
  // Основные фильтры
  lessonGoal?: string;
  activityType?: string[];
  thematic24?: string;
  audioSupport24?: boolean;
  complexityLevel24?: string;
  lessonDuration24?: string;
  
  // Специальные фильтры
  presentationStyle24?: string;
  participationFormat24?: string;
  
  // Технические настройки
  visualEffects?: string[];
  presentationSpeed24?: string;
  
  // Новые поля для 7-8 лет (молодші школярі)
  // Основные предметы
  subject78?: string;
  lessonFormat78?: string[];
  skills78?: string[];
  
  // Специализированные фильтры
  complexityLevel78?: string;
  lessonDuration78?: string;
  thematicOrientation78?: string;
  
  // Методические параметры
  pedagogicalGoal78?: string;
  assessmentMethod78?: string;
  audioSettings78?: string[];
  
  // Интерактивные элементы
  interactionType78?: string;
  presentationStyle78?: string;
  socialFormat78?: string;
  
  // Технические параметры
  platform78?: string[];
  visualStyle78?: string;
  
  // Образовательные стандарты
  educationalProgram78?: string;
  competencies78?: string[];

  // Новые поля для 9-10 лет (старші школярі)
  // Академические предметы
  subject910?: string;
  complexity910?: string;
  taskTypes910?: string[];
  
  // Специализированные фильтры
  learningGoal910?: string;
  lessonDuration910?: string;
  thematicOrientation910?: string;
  
  // Методические параметры
  pedagogicalApproach910?: string;
  independenceLevel910?: string;
  gradingSystem910?: string;
  
  // Технологические параметры
  digitalTools910?: string[];
  visualDesign910?: string;
  audioSettings910?: string;
  
  // Социальные параметры
  interactionFormat910?: string;
  studentRole910?: string;
  
  // Образовательные стандарты
  educationalProgram910?: string;
  keyCompetencies910?: string[];
}

interface PreviewData {
  ageGroup: AgeGroup;
  formData: FormData;
}

interface SimplePreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: PreviewData;
}

// === SOLID: SRP - Age group configurations ===
const getAgeGroupLabel = (ageGroup: AgeGroup) => {
  const labels = {
    '2-3': '2-3 роки',
    '4-6': '4-6 років',
    '7-8': '7-8 років',
    '9-10': '9-10 років'
  };
  return labels[ageGroup];
};

// === SOLID: SRP - Get field icon ===
const getFieldIcon = (fieldKey: string) => {
  switch (fieldKey) {
    case 'topic':
      return BookOpen;
    case 'difficulty':
      return Target;
    case 'duration':
      return Clock;
    case 'activities':
      return Activity;
    case 'goals':
      return Target;
    default:
      return BookOpen;
  }
};

// === SOLID: SRP - Get field labels ===
const getFieldLabel = (fieldKey: string, ageGroup: AgeGroup) => {
  const labelMap: Record<AgeGroup, Record<string, string>> = {
    '2-3': {
      topic: 'Тема заняття',
      activities: 'Активності',
      duration: 'Тривалість',
      goals: 'Цілі'
    },
    '4-6': {
      topic: 'Тема уроку',
      difficulty: 'Складність',
      activities: 'Типи активностей',
      duration: 'Тривалість',
      goals: 'Навчальні цілі'
    },
    '7-8': {
      topic: 'Предмет/Тема',
      difficulty: 'Рівень складності',
      activities: 'Методи навчання',
      duration: 'Тривалість',
      goals: 'Освітні результати'
    },
    '9-10': {
      topic: 'Дисципліна',
      difficulty: 'Академічний рівень',
      activities: 'Навчальні активності',
      duration: 'Тривалість',
      goals: 'Компетентності'
    }
  };
  
  return labelMap[ageGroup][fieldKey] || fieldKey;
};

// === SOLID: SRP - Main Component ===
const SimplePreviewModal: React.FC<SimplePreviewModalProps> = ({
  open,
  onClose,
  data
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Попередній перегляд уроку
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Age Group */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={`Вікова група: ${getAgeGroupLabel(data.ageGroup)}`}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Box>
        
        {/* Form Data Preview */}
        <PreviewCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Деталі уроку
            </Typography>
            
            {Object.entries(data.formData).map(([fieldKey, value]) => {
              if (!value.trim()) return null;
              
              const Icon = getFieldIcon(fieldKey);
              const label = getFieldLabel(fieldKey, data.ageGroup);
              
              return (
                <FieldRow key={fieldKey}>
                  <FieldIcon>
                    <Icon size={20} />
                  </FieldIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {label}
                    </Typography>
                    <Typography variant="body1">
                      {value}
                    </Typography>
                  </Box>
                </FieldRow>
              );
            })}
          </CardContent>
        </PreviewCard>
        
        {/* Generated Prompt Preview */}
        <PreviewCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Що буде відправлено в чат
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Буде створено детальний запит для генерації персоналізованого уроку 
              на основі вказаних параметрів. Урок буде адаптований для вікової групи {getAgeGroupLabel(data.ageGroup)}.
            </Typography>
          </CardContent>
        </PreviewCard>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Закрити
        </Button>
        <Button onClick={onClose} variant="contained">
          Зрозуміло
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimplePreviewModal; 