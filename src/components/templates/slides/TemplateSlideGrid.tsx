import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TemplateSlideCard from './TemplateSlideCard';
import SlideCommentButton from './SlideCommentButton';
import { SimpleSlide, SlideGenerationProgress } from '@/types/chat';
import { SlideComment } from '@/types/templates';
import { getLocalThumbnailStorage } from '@/services/slides/LocalThumbnailService';

export interface TemplateSlideGridProps {
  // Дані слайдів
  slides: SimpleSlide[];
  totalSlides: number;
  
  // Прогрес генерації
  generationProgress: Map<string, number>;
  slideProgresses?: SlideGenerationProgress[];
  
  // UI стан
  selectedSlideId?: string;
  isGenerating?: boolean;
  
  // Callbacks
  onSlideSelect?: (slideId: string) => void;
  onSlidePreview?: (slideIndex: number) => void;
  onSlideFullscreen?: (slideIndex: number) => void;
  
  // Коментарі до слайдів
  showCommentButtons?: boolean;
  slideComments?: SlideComment[];
  onAddSlideComment?: (comment: Omit<SlideComment, 'id' | 'timestamp'>) => void;
  
  // Опції відображення
  showStats?: boolean;
  compact?: boolean;
}

const TemplateSlideGrid: React.FC<TemplateSlideGridProps> = ({
  slides,
  totalSlides,
  generationProgress,
  slideProgresses = [],
  selectedSlideId,
  isGenerating = false,
  onSlideSelect,
  onSlidePreview,
  onSlideFullscreen,
  showCommentButtons = false,
  slideComments = [],
  onAddSlideComment,
  showStats = true,
  compact = false
}) => {
  // Removed excessive logging that causes re-renders
  const theme = useTheme();
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Локальний стан для превью
  const [slidePreviews, setSlidePreviews] = useState<Record<string, string>>({});
  const thumbnailService = getLocalThumbnailStorage();

  // Мемоізований ключ для відслідковування змін слайдів
  const slidesUpdateKey = useMemo(() => {
    return slides.map(s => `${s.id}_${s.updatedAt || s.status}`).join('|');
  }, [slides]);

  // Завантаження превью при зміні слайдів
  useEffect(() => {
    const loadPreviews = async () => {
      for (const slide of slides) {
        if (!slide.htmlContent) continue;
        
        const existingPreview = thumbnailService.get(slide.id);
        
        // Завантажуємо превью якщо:
        // 1. Немає в стані
        // 2. Слайд має updatedAt (був відредагований) 
        const shouldLoadPreview = !slidePreviews[slide.id] || 
          (slide.updatedAt && existingPreview);
        
        if (existingPreview && shouldLoadPreview) {
          setSlidePreviews(prev => ({
            ...prev,
            [slide.id]: existingPreview
          }));
        } else if (slide.updatedAt && !existingPreview) {
          // Якщо слайд оновлено, але превью ще немає - генеруємо
          
          thumbnailService.generateThumbnail(slide.id, slide.htmlContent, {
            quality: 0.85,
            background: '#ffffff',
            compress: true,
            fast: true
          }).then(() => {
            const newPreview = thumbnailService.get(slide.id);
            if (newPreview) {
              setSlidePreviews(prev => ({
                ...prev,
                [slide.id]: newPreview
              }));
            }
          }).catch(() => {
            // Silent error handling for preview generation
          });
        }
      }
    };

    loadPreviews();
  }, [slidesUpdateKey, thumbnailService]); // Fixed dependencies - no more infinite loops!

  // One-time delayed check for new previews (replaces constant interval)
  useEffect(() => {
    if (slides.length === 0) return;

    // Check for newly generated previews after a delay
    const timeoutId = setTimeout(() => {
      for (const slide of slides) {
        if (!slide.htmlContent) continue;
        
        const existingPreview = thumbnailService.get(slide.id);
        
        // Load any new previews that appeared
        if (existingPreview && !slidePreviews[slide.id]) {
          setSlidePreviews(prev => ({
            ...prev,
            [slide.id]: existingPreview
          }));
        }
      }
    }, 2000); // Check once after 2 seconds

    return () => clearTimeout(timeoutId);
  }, [slidesUpdateKey]); // Only when slides actually change

  // Слухаємо події примусового оновлення превью
  useEffect(() => {
    const handleForcePreviewRefresh = (event: CustomEvent) => {
      const { slideId } = event.detail;
      const newPreview = thumbnailService.get(slideId);
      if (newPreview) {
        setSlidePreviews(prev => ({
          ...prev,
          [slideId]: newPreview
        }));
      }
    };

    const handleThumbnailRegenerated = (event: CustomEvent) => {
      const { slideId } = event.detail;
      const newPreview = thumbnailService.get(slideId);
      if (newPreview) {
        setSlidePreviews(prev => ({
          ...prev,
          [slideId]: newPreview
        }));
      }
    };

    window.addEventListener('forcePreviewRefresh', handleForcePreviewRefresh as EventListener);
    window.addEventListener('thumbnailRegenerated', handleThumbnailRegenerated as EventListener);
    
    return () => {
      window.removeEventListener('forcePreviewRefresh', handleForcePreviewRefresh as EventListener);
      window.removeEventListener('thumbnailRegenerated', handleThumbnailRegenerated as EventListener);
    };
  }, [thumbnailService]);

  // Функція для ручної генерації превью
  const generateMissingPreviews = async () => {
    for (const slide of slides) {
      if (slide.htmlContent && !slidePreviews[slide.id] && !thumbnailService.get(slide.id)) {
        try {
          await thumbnailService.generateThumbnail(slide.id, slide.htmlContent);
          const newPreview = thumbnailService.get(slide.id);
          if (newPreview) {
            setSlidePreviews(prev => ({
              ...prev,
              [slide.id]: newPreview
            }));
          }
        } catch (error) {
          // Silent error handling for preview generation
        }
      }
    }
  };

  // Автоматично запускаємо генерацію відсутніх превью через 5 секунд після завантаження слайдів
  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setTimeout(() => {
      const slidesWithoutPreviews = slides.filter(slide => 
        slide.htmlContent && !slidePreviews[slide.id] && !thumbnailService.get(slide.id)
      );
      
      if (slidesWithoutPreviews.length > 0) {
        generateMissingPreviews();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [slides]);

  // Визначаємо кількість колонок на основі розміру екрану
  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return totalSlides <= 4 ? 2 : 3;
  };

  // Розрахунок статистики
  const stats = useMemo(() => {
    const completedSlides = slides.filter(slide => slide.status === 'completed').length;
    const generatingSlides = slides.filter(slide => slide.status === 'generating').length;
    const errorSlides = slides.filter(slide => (slide.status === 'draft' && !isGenerating)).length;
    const pendingSlides = totalSlides - slides.length;
    
    const overallProgress = totalSlides > 0 ? (completedSlides / totalSlides) * 100 : 0;
    
    return {
      completed: completedSlides,
      generating: generatingSlides,
      pending: pendingSlides,
      errors: errorSlides,
      total: totalSlides,
      overallProgress
    };
  }, [slides, totalSlides, isGenerating]);

  // Створюємо повний список слайдів (включаючи placeholder'и)
  const allSlides = useMemo(() => {
    const slideList = [...slides];
    
    // Додаємо placeholder слайди для тих, що ще не згенеровані
    while (slideList.length < totalSlides) {
      const slideNumber = slideList.length + 1;
      slideList.push({
        id: `placeholder_${slideNumber}`,
        title: `Slide ${slideNumber}`,
        content: '',
        htmlContent: '',
        status: 'draft' as const,
        isPlaceholder: true
      });
    }
    
    return slideList;
  }, [slides, totalSlides]);

  // Отримання стану генерації для слайду
  const getSlideGenerationStatus = (slide: SimpleSlide, index: number) => {
    if (slide.status === 'completed') return 'completed';
    if (slide.status === 'generating') return 'generating';
    
    // Якщо генерація активна і слайд ще не завершений, показуємо 'generating'
    if (isGenerating && slide.isPlaceholder) {
      return 'generating';
    }
    
    if (slide.isPlaceholder) return 'pending';
    return 'error';
  };

  // Отримання прогресу для слайду
  const getSlideProgress = (slide: SimpleSlide, index: number) => {
    const progressFromMap = generationProgress.get(slide.id) || 0;
    const progressFromArray = slideProgresses.find(p => p.slideNumber === index + 1)?.progress || 0;
    return Math.max(progressFromMap, progressFromArray);
  };

  // Отримання кількості коментарів для слайду
  const getCommentCount = (slideId: string) => {
    return slideComments.filter(comment => comment.slideId === slideId).length;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>




      {/* Сітка слайдів */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
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
        <Grid container spacing={2}>
          {allSlides.map((slide, index) => (
            <Grid 
              size={{
                xs: 12,
                sm: getGridColumns() === 1 ? 12 : 6,
                md: getGridColumns() === 2 ? 6 : 4,
                lg: getGridColumns() === 3 ? 4 : 6
              }}
              key={slide.id}
            >
              <Box sx={{ position: 'relative' }} className="slide-card">
                <TemplateSlideCard
                  slide={slide}
                  index={index}
                  generationStatus={getSlideGenerationStatus(slide, index)}
                  generationProgress={getSlideProgress(slide, index)}


                  previewUrl={slidePreviews[slide.id] || slide.previewUrl || slide.thumbnailUrl}
                  onSelect={onSlideSelect}

                  onOpenFullscreen={onSlideFullscreen}
                  compact={compact}
                  showProgress={isGenerating}

                />
                
                {/* Comment Button */}
                {showCommentButtons && onAddSlideComment && !slide.isPlaceholder && slide.status === 'completed' && (
                  <SlideCommentButton
                    slideId={slide.id}
                    slideTitle={slide.title}
                    commentCount={getCommentCount(slide.id)}
                    onAddComment={onAddSlideComment}
                    disabled={isGenerating}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {allSlides.length === 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('createLesson.step3.grid.noSlides')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('createLesson.step3.grid.slidesWillAppear')}
            </Typography>
          </Box>
        )}
      </Box>



      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default TemplateSlideGrid;
