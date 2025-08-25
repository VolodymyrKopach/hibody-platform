'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface RegenerationConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'plan' | 'slides';
  hasSlides?: boolean;
}

const RegenerationConfirmDialog: React.FC<RegenerationConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  type,
  hasSlides = false
}) => {
  const { t } = useTranslation('common');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {t(`createLesson.regeneration.${type}.title`)}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t(`createLesson.regeneration.${type}.description`)}
        </Typography>

        {type === 'plan' && hasSlides && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t('createLesson.regeneration.plan.slidesWarning')}
            </Typography>
          </Alert>
        )}

        <Box sx={{ 
          p: 2, 
          backgroundColor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary">
            {t(`createLesson.regeneration.${type}.consequences`)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          {t('buttons.cancel')}
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          startIcon={<RefreshIcon />}
          sx={{ minWidth: 140 }}
        >
          {t(`createLesson.regeneration.${type}.confirm`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegenerationConfirmDialog;
