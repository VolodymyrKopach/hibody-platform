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
import { X } from 'lucide-react';
import SlideCard from './SlideCard';
import { 
  useLessonManagement, 
  useSlideSelection, 
  useSlidePreviews, 
  useSlideUI 
} from '@/hooks/useSlideStore';
import { useContextSlideStore } from '@/providers/SlideStoreProvider';

// === SOLID: SRP - SlidePanelStore is only responsible for rendering slides ===
const SlidePanelStore: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['slides', 'common']);
  
  // === SOLID: DIP - Using Store through abstraction ===
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

  // === SOLID: SRP - Component for displaying lesson information ===
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

  // === SOLID: SRP - Component for managing slide selection ===
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
          {/* Counter */}
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
              All
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
              Clear
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
              {isSavingLesson ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  // === SOLID: SRP - Component for empty state ===
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
        {t('slides:emptyState.title')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {t('slides:emptyState.description')}
      </Typography>
      
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        borderRadius: 2,
        width: '100%'
      }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          {t('slides:emptyState.example1')}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
          {t('slides:emptyState.example2')}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
          {t('slides:emptyState.example3')}
        </Typography>
      </Paper>
      
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        {t('slides:emptyState.footer')}
      </Typography>
    </Box>
  );

  // === Event Handlers ===
  const handleOpenSaveDialog = () => {
    // TODO: Integrate with Save Dialog via Store
    console.log('🎯 Opening save dialog with selected slides:', Array.from(selectedSlides));
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      borderLeft: `1px solid ${theme.palette.divider}`
    }}>
      {/* Panel header */}
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
          🎨 {t('slides:title')}
        </Typography>
        
        <Tooltip title={t('slides:navigation.close')}>
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

      {/* Panel content */}
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
            
            {/* List of slides */}
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