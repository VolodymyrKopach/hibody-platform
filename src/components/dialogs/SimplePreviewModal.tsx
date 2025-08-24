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
  Chip,
  IconButton,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, Clock, Target, BookOpen, Activity } from 'lucide-react';

// === SOLID: SRP - Styled Components ===
const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.default, 0.3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
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
  // Basic fields
  topic: string;
  difficulty: string;
  duration: string;
  activities: string;
  goals: string;
  
  // Fields for 4-6 years
  // Basic filters
  thematic?: string;
  taskTypes?: string[];
  language?: string;
  
  // Specialized filters
  learningGoal?: string;
  complexityLevel?: string;
  lessonDuration?: string;
  
  // Interactive settings
  presentationStyle?: string;
  audioSupport?: string[];
  participationFormat?: string;
  
  // Technical parameters
  visualDesign?: string[];
  presentationSpeed?: string;
  interactivity?: string;
  
  // Educational standards
  educationalProgram?: string;
  gradingSystem?: string;
  
  // New fields for 2-4 years
  // Primary filters
  lessonGoal?: string;
  activityType?: string[];
  thematic24?: string;
  audioSupport24?: boolean;
  complexityLevel24?: string;
  lessonDuration24?: string;
  
  // Special filters
  presentationStyle24?: string;
  participationFormat24?: string;
  
  // Technical settings
  visualEffects?: string[];
  presentationSpeed24?: string;
  
  // New fields for 7-8 years (junior schoolchildren)
  // Main subjects
  subject78?: string;
  lessonFormat78?: string[];
  skills78?: string[];
  
  // Specialized filters
  complexityLevel78?: string;
  lessonDuration78?: string;
  thematicOrientation78?: string;
  
  // Methodological parameters
  pedagogicalGoal78?: string;
  assessmentMethod78?: string;
  audioSettings78?: string[];
  
  // Interactive elements
  interactionType78?: string;
  presentationStyle78?: string;
  socialFormat78?: string;
  
  // Technical parameters
  platform78?: string[];
  visualStyle78?: string;
  
  // Educational standards
  educationalProgram78?: string;
  competencies78?: string[];

  // New fields for 9-10 years (senior schoolchildren)
  // Academic subjects
  subject910?: string;
  complexity910?: string;
  taskTypes910?: string[];
  
  // Specialized filters
  learningGoal910?: string;
  lessonDuration910?: string;
  thematicOrientation910?: string;
  
  // Methodological parameters
  pedagogicalApproach910?: string;
  independenceLevel910?: string;
  gradingSystem910?: string;
  
  // Technological parameters
  digitalTools910?: string[];
  visualDesign910?: string;
  audioSettings910?: string;
  
  // Social parameters
  interactionFormat910?: string;
  studentRole910?: string;
  
  // Educational standards
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
const getAgeGroupLabel = (ageGroup: AgeGroup, t: any) => {
  return t(`common:createLesson.ageGroup.${ageGroup}`);
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
      topic: 'Lesson Topic',
      activities: 'Activities',
      duration: 'Duration',
      goals: 'Goals'
    },
    '4-6': {
      topic: 'Lesson Topic',
      difficulty: 'Difficulty',
      activities: 'Activity Types',
      duration: 'Duration',
      goals: 'Learning Goals'
    },
    '7-8': {
      topic: 'Subject/Topic',
      difficulty: 'Difficulty Level',
      activities: 'Teaching Methods',
      duration: 'Duration',
      goals: 'Educational Outcomes'
    },
    '9-10': {
      topic: 'Discipline',
      difficulty: 'Academic Level',
      activities: 'Learning Activities',
      duration: 'Duration',
      goals: 'Competencies'
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
            Lesson Preview
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Age Group */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={`${t('common:createLesson.ageGroup.title')}: ${getAgeGroupLabel(data.ageGroup, t)}`}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Box>
        
        {/* Form Data Preview */}
        <SectionContainer>
          <Typography variant="h6" gutterBottom>
            Lesson Details
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
        </SectionContainer>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Generated Prompt Preview */}
        <SectionContainer>
          <Typography variant="h6" gutterBottom>
            What will be sent to chat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            A detailed request will be created to generate a personalized lesson 
            based on the specified parameters. The lesson will be adapted for age group {getAgeGroupLabel(data.ageGroup, t)}.
          </Typography>
        </SectionContainer>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={onClose} variant="contained">
          Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimplePreviewModal; 