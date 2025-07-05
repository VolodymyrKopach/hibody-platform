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
  onOpenSaveDialog,
  onCloseSidePanel,
  onExportLesson
}) => {
  const theme = useTheme();

  // Компонент для відображення інформації про урок
  const LessonInfo = () => {
    if (!currentLesson) return null;

    return (
      <Paper elevation={0} sx={{ 
        p: 1, 
        mb: 1.5, 
        backgroundColor: alpha(theme.palette.primary.main, 0.03), 
        borderRadius: 1.5 
      }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 600, 
          color: 'primary.main', 
          mb: 0.5,
          fontSize: '0.85rem',
          lineHeight: 1.2
        }}>
          {currentLesson.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={currentLesson.subject} 
            size="small"
            color="primary"
            variant="outlined"
            sx={{ 
              height: 20, 
              fontSize: '0.65rem',
              '& .MuiChip-label': { px: 0.5 }
            }}
          />
          <Chip 
            label={currentLesson.ageGroup} 
            size="small" 
            color="secondary" 
            variant="outlined"
            sx={{ 
              height: 20, 
              fontSize: '0.65rem',
              '& .MuiChip-label': { px: 0.5 }
            }}
          />
          <Chip 
            label={`${currentLesson.duration} хв`} 
            size="small" 
            variant="outlined"
            sx={{ 
              height: 20, 
              fontSize: '0.65rem',
              '& .MuiChip-label': { px: 0.5 }
            }}
          />
        </Box>
      </Paper>
    );
  };

  // Компонент для управління вибором слайдів
  const SelectionControls = () => {
    if (!currentLesson) return null;

    return (
      <Paper elevation={0} sx={{ 
        p: 1, 
        mb: 1.5, 
        backgroundColor: alpha(theme.palette.grey[50], 0.3), 
        borderRadius: 1.5 
      }}>
        {/* Компактний рядок з усіма елементами */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}>
          {/* Лічильник */}
          <Typography variant="caption" color="text.secondary" sx={{ 
            fontSize: '0.75rem',
            minWidth: 'fit-content',
            whiteSpace: 'nowrap'
          }}>
            <strong>{selectedSlides.size}</strong>/{currentLesson.slides.length}
          </Typography>
          
          {/* Кнопки управління */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Button
              size="small"
              variant="text"
              onClick={onSelectAllSlides}
              disabled={selectedSlides.size === currentLesson.slides.length}
              sx={{ 
                minWidth: 'auto',
                px: 1,
                py: 0.25,
                fontSize: '0.7rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              Всі
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={onDeselectAllSlides}
              disabled={selectedSlides.size === 0}
              sx={{ 
                minWidth: 'auto',
                px: 1,
                py: 0.25,
                fontSize: '0.7rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              Очистити
            </Button>
            
            {/* Кнопка збереження */}
            {selectedSlides.size > 0 && (
              <Button
                variant="contained"
                onClick={onOpenSaveDialog}
                disabled={isSavingLesson}
                size="small"
                sx={{
                  px: 1.5,
                  py: 0.25,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  borderRadius: 1,
                  textTransform: 'none',
                  minHeight: 'auto',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }
                }}
              >
                {isSavingLesson ? 'Збереження...' : `Зберегти (${selectedSlides.size})`}
              </Button>
            )}
          </Box>
        </Box>
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
    <Box sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Заголовок панелі */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
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
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            paddingRight: 0.5, // Невеликий відступ для скролбару
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.grey[300], 0.2),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.grey[400], 0.6),
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[500], 0.8),
              },
            },
          }}>
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