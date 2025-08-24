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
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Save, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
  onSaveAndLeave?: () => void;
  canSave?: boolean;
  title?: string;
  description?: string;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onClose,
  onConfirmLeave,
  onSaveAndLeave,
  canSave = false,
  title,
  description
}) => {
  const { t } = useTranslation(['common', 'dialogs']);
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <AlertTriangle 
              size={24} 
              color={theme.palette.warning.main}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title || t('dialogs:unsavedChanges.title', 'Незбережені зміни')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description || t('dialogs:unsavedChanges.subtitle', 'Ви впевнені, що хочете покинути сторінку?')}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {t('dialogs:unsavedChanges.description', 
            'Якщо ви покинете сторінку зараз, всі незбережені дані будуть втрачені. Ця дія не може бути скасована.'
          )}
        </Typography>

        {canSave && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '12px',
              background: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
            }}
          >
            <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
              💡 {t('dialogs:unsavedChanges.saveHint', 'Підказка: Ви можете зберегти прогрес перед виходом')}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: 100
          }}
        >
          {t('common:buttons.cancel', 'Скасувати')}
        </Button>

        {canSave && onSaveAndLeave && (
          <Button
            onClick={onSaveAndLeave}
            variant="contained"
            startIcon={<Save size={18} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
              }
            }}
          >
            {t('dialogs:unsavedChanges.saveAndLeave', 'Зберегти і вийти')}
          </Button>
        )}

        <Button
          onClick={onConfirmLeave}
          variant="contained"
          startIcon={<X size={18} />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: 120,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            color: 'white',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }}
        >
          {t('dialogs:unsavedChanges.leaveAnyway', 'Вийти без збереження')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
