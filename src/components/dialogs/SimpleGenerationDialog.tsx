/**
 * === SOLID: SRP - Simple Generation Dialog ===
 * 
 * Simple dialog for lesson generation that integrates with chat
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Fade,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, ArrowLeft } from 'lucide-react';
import SimpleGenerationForm from '@/components/generation/SimpleGenerationForm';
import SimplePreviewModal from './SimplePreviewModal';

// === SOLID: SRP - Styled Components ===
const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
}));

// === SOLID: ISP - Component interfaces ===
interface SimpleGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
}

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

// === SOLID: SRP - Main Component ===
const SimpleGenerationDialog: React.FC<SimpleGenerationDialogProps> = ({
  open,
  onClose,
  onSendToChat
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  // === SOLID: SRP - State management ===
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // === SOLID: SRP - Handle preview ===
  const handlePreview = useCallback((data: PreviewData) => {
    setPreviewData(data);
    setPreviewOpen(true);
  }, []);
  
  // === SOLID: SRP - Handle preview close ===
  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
  }, []);
  
  // === SOLID: SRP - Handle generation ===
  const handleGenerate = useCallback((data: {
    ageGroup: AgeGroup;
    formData: FormData;
    detailedPrompt: string;
  }) => {
    // Send the detailed prompt to chat
    onSendToChat(data.detailedPrompt);
    
    // Show success message
    setSuccessMessage('Запит відправлено в чат! Генерую урок...');
    
    // Close dialog after short delay
    setTimeout(() => {
      onClose();
      setSuccessMessage('');
    }, 1500);
  }, [onSendToChat, onClose]);
  
  // === SOLID: SRP - Handle close ===
  const handleClose = useCallback(() => {
    setPreviewOpen(false);
    setPreviewData(null);
    onClose();
  }, [onClose]);
  
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            minHeight: '70vh',
          }
        }}
      >
        {/* Header */}
        <DialogHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleClose} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Генерація уроку
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogHeader>
        
        {/* Content */}
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <SimpleGenerationForm
              onGenerate={handleGenerate}
              onPreview={handlePreview}
            />
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Preview Modal */}
      {previewData && (
        <SimplePreviewModal
          open={previewOpen}
          onClose={handlePreviewClose}
          data={previewData}
        />
      )}
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SimpleGenerationDialog; 