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
  topic: string;
  difficulty: string;
  duration: string;
  activities: string;
  goals: string;
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