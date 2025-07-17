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
import { useTranslation } from 'react-i18next';
import { X, Download } from 'lucide-react';
import SlideCard from './SlideCard';
import { 
  useLessonManagement, 
  useSlideSelection, 
  useSlidePreviews, 
  useSlideUI 
} from '@/hooks/useSlideStore';
import { useContextSlideStore } from '@/providers/SlideStoreProvider';

// === SOLID: SRP - SlidePanelStore відповідає тільки за відображення слайдів ===
const SlidePanelStore: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['slides', 'common']);
  
  // === SOLID: DIP - Використання Store через абстракцію ===
  const store = useContextSlideStore();
  const { currentLesson, slides } = useLessonManagement(store);
  const { 
    selectedSlides, 
    selectedCount, 
    toggleSelection, 
    selectAll, 
    deselectAll,
    isAllSelected,
    canSelectAll
  } = useSlideSelection(store);
  const { slidePreviews, previewsUpdating, isUpdating } = useSlidePreviews(store);
  const { 
    isSavingLesson, 
    togglePanel, 
    navigateToSlide, 
    setSaving
  } = useSlideUI(store);

  // === SOLID: SRP - Компонент для відображення інформації про урок ===
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
            label={`${currentLesson.duration} ${t('common:time.minutes')}`} 
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

  // === SOLID: SRP - Компонент для управління вибором слайдів ===
  const SelectionControls = () => {
    if (!currentLesson) return null;

    return (
      <Paper elevation={0} sx={{ 
        p: 1, 
        mb: 1.5, 
        backgroundColor: alpha(theme.palette.grey[50], 0.3), 
        borderRadius: 1.5 
      }}>
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
            <strong>{selectedCount}</strong>/{slides.length}
          </Typography>
          
          {/* Control buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="text"
              onClick={selectAll}
              disabled={isAllSelected || slides.length === 0}
              sx={{ 
                minWidth: 'auto', 
                px: 1, 
                fontSize: '0.7rem',
                height: 'auto',
                py: 0.25
              }}
            >
              Всі
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={deselectAll}
              disabled={selectedCount === 0}
              sx={{ 
                minWidth: 'auto', 
                px: 1, 
                fontSize: '0.7rem',
                height: 'auto',
                py: 0.25
              }}
            >
              Очистити
            </Button>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={selectedCount === 0 || isSavingLesson}
              onClick={handleOpenSaveDialog}
              sx={{ 
                minWidth: 'auto', 
                px: 1.5, 
                fontSize: '0.7rem',
                height: 'auto',
                py: 0.5
              }}
            >
              {isSavingLesson ? 'Зберігання...' : 'Зберегти'}
            </Button>
            
            <Tooltip title="Експорт уроку в HTML">
              <IconButton
                size="small"
                onClick={handleExportLesson}
                disabled={slides.length === 0}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Download size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    );
  };

  // === SOLID: SRP - Компонент для пустого стану ===
  const EmptyState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      color: 'text.secondary',
      p: 3
    }}>
      <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
        📝 Немає слайдів
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
        Розпочніть чат для створення слайдів
      </Typography>
    </Box>
  );

  // === Event Handlers ===
  const handleOpenSaveDialog = () => {
    // TODO: Інтегрувати з Save Dialog через Store
    console.log('🎯 Opening save dialog with selected slides:', Array.from(selectedSlides));
  };

  const handleExportLesson = () => {
    if (!currentLesson) return;
    
    // Простий експорт HTML
    const htmlContent = slides
      .map(slide => slide.htmlContent)
      .join('\n\n');
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLesson.title.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      borderLeft: `1px solid ${theme.palette.divider}`
    }}>
      {/* Заголовок панелі */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ 
          fontSize: '1rem', 
          fontWeight: 600,
          color: 'text.primary'
        }}>
          🎨 Слайди уроку
        </Typography>
        
        <Tooltip title="Закрити панель">
          <IconButton
            size="small"
            onClick={togglePanel}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                color: 'text.primary',
                backgroundColor: alpha(theme.palette.grey[500], 0.1)
              }
            }}
          >
            <X size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Контент панелі */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        p: 1
      }}>
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
              paddingRight: 0.5,
              paddingBottom: 1,
              minHeight: 0,
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
              {slides.map((slide, index) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isSelected={selectedSlides.has(slide.id)}
                  isUpdating={isUpdating(slide.id)}
                  previewUrl={slidePreviews[slide.id]}
                  onToggleSelection={toggleSelection}
                  onOpenDialog={() => navigateToSlide(index)}
                />
              ))}
            </Box>
          </>
        ) : (
          <EmptyState />
        )}
      </Box>
    </Box>
  );
};

export default SlidePanelStore; 