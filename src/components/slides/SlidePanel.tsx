import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { X, Download } from 'lucide-react';
import { SimpleLesson, SimpleSlide } from '@/types/chat';
import SlideCard from './SlideCard';

interface SlidePanelProps {
  currentLesson: SimpleLesson | null;
  selectedSlides: Set<string>;
  slidePreviews: Record<string, string>;
  previewsUpdating: Set<string>;
  isSavingLesson: boolean;
  onToggleSlideSelection: (slideId: string) => void;
  onSelectAllSlides: () => void;
  onDeselectAllSlides: () => void;
  onOpenSlideDialog: (index: number) => void;
  onRegenerateSlidePreview: (slideId: string) => void;
  onOpenSaveDialog: () => void;
  onCloseSidePanel: () => void;
  onExportLesson: () => void;
}

const SlidePanel: React.FC<SlidePanelProps> = ({
  currentLesson,
  selectedSlides,
  slidePreviews,
  previewsUpdating,
  isSavingLesson,
  onToggleSlideSelection,
  onSelectAllSlides,
  onDeselectAllSlides,
  onOpenSlideDialog,
  onRegenerateSlidePreview,
  onOpenSaveDialog,
  onCloseSidePanel,
  onExportLesson
}) => {
  const theme = useTheme();

  // Компонент для відображення інформації про урок
  const LessonInfo = () => {
    if (!currentLesson) return null;

    return (
      <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
          {currentLesson.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {currentLesson.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={currentLesson.subject} 
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={currentLesson.ageGroup} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
          <Chip 
            label={`${currentLesson.duration} хв`} 
            size="small" 
            variant="outlined"
          />
        </Box>
      </Paper>
    );
  };

  // Компонент для управління вибором слайдів
  const SelectionControls = () => {
    if (!currentLesson) return null;

    return (
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Вибрано: <strong>{selectedSlides.size}</strong> з <strong>{currentLesson.slides.length}</strong> слайдів
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onSelectAllSlides}
              disabled={selectedSlides.size === currentLesson.slides.length}
            >
              Вибрати всі
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={onDeselectAllSlides}
              disabled={selectedSlides.size === 0}
            >
              Очистити
            </Button>
          </Box>
        </Box>
        
        {/* Кнопка збереження */}
        {selectedSlides.size > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={onOpenSaveDialog}
              disabled={isSavingLesson}
              sx={{
                px: 4,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }
              }}
            >
              {isSavingLesson ? 'Збереження...' : `Зберегти урок (${selectedSlides.size} слайдів)`}
            </Button>
          </Box>
        )}
      </Paper>
    );
  };

  // Компонент для порожнього стану
  const EmptyState = () => (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      textAlign: 'center',
      p: 3
    }}>
      <Box sx={{ fontSize: '4rem', mb: 2 }}>🎨</Box>
      
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Створіть свій перший урок!
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        Просто напишіть в чаті що ви хочете створити, наприклад:
      </Typography>
      
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        borderRadius: 2,
        width: '100%'
      }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          💡 "Створи урок про космос для дітей 7 років"
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
          📚 "Зроби урок математики про додавання"
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
          🌈 "Урок англійської про кольори"
        </Typography>
      </Paper>
      
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        ✨ Після створення уроку тут з'являться всі слайди з можливістю перегляду та редагування
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Заголовок панелі */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Слайди уроку
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentLesson && (
            <Tooltip title="Експортувати урок">
              <IconButton
                onClick={onExportLesson}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <Download size={16} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={onCloseSidePanel}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {currentLesson ? (
        <>
          <LessonInfo />
          <SelectionControls />
          
          {/* Список слайдів */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {currentLesson.slides.map((slide, index) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                index={index}
                isSelected={selectedSlides.has(slide.id)}
                isUpdating={previewsUpdating.has(slide.id)}
                previewUrl={slidePreviews[slide.id]}
                onToggleSelection={onToggleSlideSelection}
                onOpenDialog={onOpenSlideDialog}
                onRegeneratePreview={onRegenerateSlidePreview}
              />
            ))}
          </Box>
        </>
      ) : (
        <EmptyState />
      )}
    </Box>
  );
};

export default SlidePanel; 