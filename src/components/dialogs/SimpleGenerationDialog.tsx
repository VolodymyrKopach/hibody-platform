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