import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  LinearProgress,
  Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LessonSaveData, SaveLessonDialogData } from '@/types/chat';
import PreviewSelector from '@/components/PreviewSelector';
import { getAgeGroupSelectOptions, mapAgeGroupToSelectValue } from '@/constants';

interface SimplifiedSaveLessonDialogProps {
  open: boolean;
  lessonData: LessonSaveData | null;
  onClose: () => void;
  onSuccess?: (savedLesson: any) => void;
  onError?: (error: string) => void;
}

const SimplifiedSaveLessonDialog: React.FC<SimplifiedSaveLessonDialogProps> = ({
  open,
  lessonData,
  onClose,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation(['lessons', 'common']);
  const theme = useTheme();

  // Локальний стан діалогу
  const [dialogData, setDialogData] = useState<SaveLessonDialogData>({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
    selectedPreviewId: null,
    previewUrl: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get age group options from shared constants
  const ageGroupOptions = getAgeGroupSelectOptions();

  // Автоматично заповнюємо поля при відкритті діалогу
  useEffect(() => {
    if (open && lessonData) {
      const originalAgeGroup = lessonData.ageGroup || '';
      const mappedAgeGroup = mapAgeGroupToSelectValue(originalAgeGroup);

      // Логування мапінгу значень
      console.log('🔄 [DIALOG_MAPPING] Age group mapping:', { original: originalAgeGroup, mapped: mappedAgeGroup });

      setDialogData({
        title: lessonData.title || '',
        description: lessonData.description || '',
        subject: '', // Видалено subject - більше не використовується
        ageGroup: mappedAgeGroup,
        selectedPreviewId: lessonData.selectedPreviewId || null,
        previewUrl: lessonData.previewUrl || null
      });

      setSaveError(null);
    }
  }, [open, lessonData]);

  const handleInputChange = useCallback((field: keyof SaveLessonDialogData, value: string) => {
    setDialogData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePreviewSelect = useCallback((slideId: string, previewUrl: string) => {
    setDialogData(prev => ({
      ...prev,
      selectedPreviewId: slideId,
      previewUrl: previewUrl
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!lessonData) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dialogData.title,
          description: dialogData.description,
          subject: 'General Education', // Default subject since field is removed
          targetAge: dialogData.ageGroup,
          duration: lessonData.duration || 45,
          thumbnail_data: dialogData.previewUrl,
          slides: lessonData.slides.map(slide => ({
            title: slide.title,
            description: slide.content || slide.description || '',
            htmlContent: slide.htmlContent || '',
            type: 'content'
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Викликаємо callback успіху
      if (onSuccess) {
        const savedLesson = {
          id: result.lesson?.id || 'unknown',
          title: dialogData.title,
          description: dialogData.description,
          subject: dialogData.subject,
          ageGroup: dialogData.ageGroup,
          duration: lessonData.duration || 45,
          slides: lessonData.slides,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: result.lesson?.authorId || 'unknown'
        };
        onSuccess(savedLesson);
      }

      // Закриваємо діалог
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  }, [lessonData, dialogData, onSuccess, onError, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  // Age group options are now defined above using shared constants

  if (!lessonData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.95) 100%)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        pt: 3,
        px: 3,
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        borderRadius: '16px 16px 0 0',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ 
          p: 2, 
          borderRadius: '16px', 
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          minWidth: 56,
          minHeight: 56
        }}>
          💾
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 0.5,
            fontSize: '1.3rem'
          }}>
            {t('lessons:saveDialog.title')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem',
            lineHeight: 1.4
          }}>
            {t('lessons:saveDialog.subtitle')} ({lessonData.slides.length} {t('common:slides')})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Error Alert */}
          {saveError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t('common:error.saveError')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                {saveError}
              </Typography>
            </Alert>
          )}

          {/* Lesson Title */}
          <TextField
            label={t('lessons:saveDialog.nameLabel')}
            variant="outlined"
            fullWidth
            value={dialogData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isSaving}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&.Mui-focused': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
            placeholder={t('lessons:saveDialog.namePlaceholder')}
            required
          />

          {/* Lesson Description */}
          <TextField
            label={t('lessons:saveDialog.descriptionLabel')}
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={dialogData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isSaving}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&.Mui-focused': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
            placeholder={t('lessons:saveDialog.descriptionPlaceholder')}
          />

          {/* Subject field removed - no longer needed */}

          {/* Age Group */}
          <TextField
            label={t('lessons:saveDialog.ageGroupLabel')}
            variant="outlined"
            fullWidth
            select
            value={dialogData.ageGroup}
            onChange={(e) => handleInputChange('ageGroup', e.target.value)}
            disabled={isSaving}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&.Mui-focused': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            {ageGroupOptions.map((group) => (
              <MenuItem key={group.value} value={group.value}>
                {group.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Preview Selector */}
          {lessonData.slides.length > 0 && (
            <PreviewSelector
              slides={lessonData.slides.map(slide => ({
                id: slide.id,
                title: slide.title,
                htmlContent: slide.htmlContent,
                type: 'content',
                thumbnailUrl: slide.thumbnailUrl
              }))}
              selectedPreviewId={dialogData.selectedPreviewId}
              onPreviewSelect={handlePreviewSelect}
              disabled={isSaving}
              cachedPreviews={lessonData.slidePreviews}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2, 
        gap: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.grey[50], 0.5)
      }}>
        <Button 
          onClick={handleClose} 
          disabled={isSaving}
          sx={{ 
            textTransform: 'none',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[400], 0.1),
              color: theme.palette.text.primary
            }
          }}
        >
          {t('common:buttons.cancel')}
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!dialogData.title.trim() || isSaving}
          startIcon={isSaving ? <LinearProgress /> : null}
          sx={{ 
            textTransform: 'none',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              background: theme.palette.grey[300],
              color: theme.palette.grey[500],
              boxShadow: 'none'
            }
          }}
        >
          {isSaving ? t('lessons:saveDialog.saving') : t('lessons:saveDialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimplifiedSaveLessonDialog;
