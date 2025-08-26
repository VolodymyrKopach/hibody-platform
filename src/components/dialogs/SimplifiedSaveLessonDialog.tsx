import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Dialog,
  TextField,
  Button,
  MenuItem,
  LinearProgress,
  Alert,
  Stack,
  Slide
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
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: { 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Custom Header */}
      <Box sx={{ 
        p: 4,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        flexShrink: 0
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          mb: 0.5,
          fontSize: '1.25rem'
        }}>
          {t('lessons:saveDialog.title')}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}>
          {t('lessons:saveDialog.subtitle')} • {lessonData.slides.length} {t('common:slides')}
        </Typography>
      </Box>

      {/* Custom Content */}
      <Box sx={{ 
        p: 4,
        overflow: 'auto',
        flex: 1,
        minHeight: 0 // Важливо для правильної роботи flex overflow
      }}>
        <Stack spacing={4}>
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
                borderRadius: 2,
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                }
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
                borderRadius: 2,
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }
            }}
            placeholder={t('lessons:saveDialog.descriptionPlaceholder')}
          />

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
                borderRadius: 2,
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                }
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
        </Stack>
      </Box>

      {/* Custom Actions */}
      <Box sx={{ 
        p: 4, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        flexShrink: 0
      }}>
        <Button 
          onClick={handleClose} 
          disabled={isSaving}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          {t('common:buttons.cancel')}
        </Button>
        
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!dialogData.title.trim() || isSaving}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            minWidth: 140
          }}
        >
          {isSaving ? t('lessons:saveDialog.saving') : t('lessons:saveDialog.save')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default SimplifiedSaveLessonDialog;
