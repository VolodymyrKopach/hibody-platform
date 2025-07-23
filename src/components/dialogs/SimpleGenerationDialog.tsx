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
    setSuccessMessage('Request sent to chat! Generating lesson...');
    
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
              Lesson Generation
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogHeader>
        
        {/* Content */}
        <DialogContent sx={{ p: 0 }}>
            <SimpleGenerationForm
              onGenerate={handleGenerate}
              onPreview={handlePreview}
            />
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