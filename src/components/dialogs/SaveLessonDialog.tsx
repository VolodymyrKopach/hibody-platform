import React from 'react';
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

  // Список предметів
  const subjects = [
    { value: "Математика", label: "🔢 Математика" },
    { value: "Українська мова", label: "🇺🇦 Українська мова" },
    { value: "Англійська мова", label: "🇬🇧 Англійська мова" },
    { value: "Природознавство", label: "🌿 Природознавство" },
    { value: "Історія", label: "📜 Історія" },
    { value: "Географія", label: "🌍 Географія" },
    { value: "Фізика", label: "⚡ Фізика" },
    { value: "Хімія", label: "🧪 Хімія" },
    { value: "Біологія", label: "🧬 Біологія" },
    { value: "Мистецтво", label: "🎨 Мистецтво" },
    { value: "Музика", label: "🎵 Музика" },
    { value: "Фізкультура", label: "⚽ Фізкультура" },
    { value: "Інформатика", label: "💻 Інформатика" },
    { value: "Трудове навчання", label: "🔨 Трудове навчання" },
    { value: "Загальне навчання", label: "📚 Загальне навчання" }
  ];

  // Список вікових груп
  const ageGroups = [
    { value: "3-5 років", label: "🍼 3-5 років (дошкільна)" },
    { value: "6-7 років", label: "🎒 6-7 років (1 клас)" },
    { value: "8-9 років", label: "📖 8-9 років (2-3 класи)" },
    { value: "10-11 років", label: "🧮 10-11 років (4-5 класи)" },
    { value: "12-13 років", label: "🔬 12-13 років (6-7 класи)" },
    { value: "14-15 років", label: "🎓 14-15 років (8-9 класи)" },
    { value: "16-18 років", label: "🎯 16-18 років (10-11 класи)" },
    { value: "Всі вікові групи", label: "🌈 Всі вікові групи" }
  ];

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
            Зберегти урок
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem',
            lineHeight: 1.4
          }}>
            Налаштуйте інформацію про ваш урок перед збереженням
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Назва уроку */}
          <TextField
            label="📚 Назва уроку"
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
            placeholder="Введіть назву уроку"
            required
          />

          {/* Опис уроку */}
          <TextField
            label="📝 Опис уроку"
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
            placeholder="Короткий опис змісту та мети уроку"
          />

          {/* Предмет/жанр */}
          <TextField
            label="🎯 Предмет/Жанр"
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

          {/* Вікова група */}
          <TextField
            label="👥 Вікова група"
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

          {/* Превью селектор */}
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
          Скасувати
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
          {isSaving ? 'Збереження...' : 'Зберегти урок'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveLessonDialog; 