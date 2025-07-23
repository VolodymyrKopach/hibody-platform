import React from 'react';
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
  LinearProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { SaveLessonDialogData, SimpleSlide } from '@/types/chat';
import PreviewSelector from '@/components/PreviewSelector';

interface SaveLessonDialogProps {
  open: boolean;
  dialogData: SaveLessonDialogData;
  selectedSlides: SimpleSlide[];
  isSaving: boolean;
  cachedPreviews: Record<string, string>;
  onClose: () => void;
  onSave: (data: SaveLessonDialogData) => void;
  onDataChange: (data: Partial<SaveLessonDialogData>) => void;
  onPreviewSelect: (slideId: string, previewUrl: string) => void;
}

const SaveLessonDialog: React.FC<SaveLessonDialogProps> = ({
  open,
  dialogData,
  selectedSlides,
  isSaving,
  cachedPreviews,
  onClose,
  onSave,
  onDataChange,
  onPreviewSelect
}) => {
  const { t } = useTranslation(['lessons', 'common']);
  const theme = useTheme();

  const handleSave = () => {
    console.log('🎯 SAVE DIALOG: Save button clicked');
    console.log('📋 SAVE DIALOG: Current dialog data:', {
      title: dialogData.title,
      description: dialogData.description,
      subject: dialogData.subject,
      ageGroup: dialogData.ageGroup,
      selectedPreviewId: dialogData.selectedPreviewId,
      hasPreviewUrl: !!dialogData.previewUrl,
      previewUrlLength: dialogData.previewUrl?.length || 0
    });
    console.log('🎨 SAVE DIALOG: Selected slides:', selectedSlides.map(slide => ({
      id: slide.id,
      title: slide.title,
      type: slide.type,
      hasHtmlContent: !!slide.htmlContent
    })));
    console.log('🖼️ SAVE DIALOG: Cached previews:', Object.keys(cachedPreviews).map(key => ({
      slideId: key,
      hasPreview: !!cachedPreviews[key],
      previewSize: cachedPreviews[key]?.length || 0
    })));
    
    onSave(dialogData);
  };

  const handleInputChange = (field: keyof SaveLessonDialogData, value: string) => {
    console.log(`📝 SAVE DIALOG: Field changed - ${field}:`, value);
    onDataChange({ [field]: value });
  };

  // Get subject and age group options from translations
  const subjects = t('lessons:subjectOptions', { returnObjects: true }) as Array<{value: string, label: string}>;
  const ageGroups = t('lessons:ageGroupOptions', { returnObjects: true }) as Array<{value: string, label: string}>;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {t('lessons:saveDialog.subtitle')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Lesson Title */}
          <TextField
            label={t('lessons:saveDialog.nameLabel')}
            variant="outlined"
            fullWidth
            value={dialogData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
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

          {/* Subject/Genre */}
          <TextField
            label={t('lessons:saveDialog.subjectLabel')}
            variant="outlined"
            fullWidth
            select
            value={dialogData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
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
            {subjects.map((subject) => (
              <MenuItem key={subject.value} value={subject.value}>
                {subject.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Age Group */}
          <TextField
            label={t('lessons:saveDialog.ageGroupLabel')}
            variant="outlined"
            fullWidth
            select
            value={dialogData.ageGroup}
            onChange={(e) => handleInputChange('ageGroup', e.target.value)}
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
            {ageGroups.map((group) => (
              <MenuItem key={group.value} value={group.value}>
                {group.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Preview Selector */}
          {selectedSlides.length > 0 && (
            <PreviewSelector
              slides={selectedSlides.map(slide => ({
                id: slide.id,
                title: slide.title,
                htmlContent: slide.htmlContent,
                type: slide.type
              }))}
              selectedPreviewId={dialogData.selectedPreviewId}
              onPreviewSelect={onPreviewSelect}
              disabled={isSaving}
              cachedPreviews={cachedPreviews}
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
          onClick={onClose} 
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

export default SaveLessonDialog; 