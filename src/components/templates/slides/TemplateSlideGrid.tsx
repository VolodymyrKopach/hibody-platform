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
  const theme = useTheme();
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Локальний стан для превью
  const [slidePreviews, setSlidePreviews] = useState<Record<string, string>>({});
  const thumbnailService = getLocalThumbnailStorage();

  // Автоматично завантажуємо превью для слайдів
  useEffect(() => {
    const loadPreviews = async () => {
      console.log(`🔍 [TemplateSlideGrid] Loading previews for ${slides.length} slides`);
      

      
      for (const slide of slides) {
        console.log(`🔍 [TemplateSlideGrid] Checking slide ${slide.id}:`, {
          title: slide.title,
          hasHtmlContent: !!slide.htmlContent,
          hasPreviewInState: !!slidePreviews[slide.id],
          htmlContentLength: slide.htmlContent?.length || 0
        });
        
        if (slide.htmlContent && !slidePreviews[slide.id]) {
          // Перевіряємо, чи є превью в LocalThumbnailService
          const existingPreview = thumbnailService.get(slide.id);
          console.log(`🔍 [TemplateSlideGrid] LocalThumbnailService check for ${slide.id}:`, {
            hasExistingPreview: !!existingPreview,
            previewLength: existingPreview?.length || 0
          });
          
          if (existingPreview) {
            console.log(`✅ [TemplateSlideGrid] Loading existing preview for slide ${slide.id}`);
            setSlidePreviews(prev => ({
              ...prev,
              [slide.id]: existingPreview
            }));
          } else {
            console.log(`⚠️ [TemplateSlideGrid] No existing preview found for slide ${slide.id}, will wait for generation`);
          }
        }
      }
    };

    loadPreviews();
  }, [slides, slidePreviews, thumbnailService]);

  // Реактивне оновлення превью (перевіряємо кожні 2 секунди)
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      let hasNewPreviews = false;
      const newPreviews: Record<string, string> = {};

      for (const slide of slides) {
        if (slide.htmlContent && !slidePreviews[slide.id]) {
          const existingPreview = thumbnailService.get(slide.id);
          if (existingPreview) {
            console.log(`🔄 [TemplateSlideGrid] Found new preview for slide ${slide.id} during reactive check`);
            newPreviews[slide.id] = existingPreview;
            hasNewPreviews = true;
          }
        }
      }

      if (hasNewPreviews) {
        setSlidePreviews(prev => ({
          ...prev,
          ...newPreviews
        }));
      }
    }, 2000);

      return () => clearInterval(interval);
  }, [slides, slidePreviews, thumbnailService]);

  // Функція для ручної генерації превью
  const generateMissingPreviews = async () => {
    console.log('🔧 [TemplateSlideGrid] Manually generating missing previews');
    
    for (const slide of slides) {
      if (slide.htmlContent && !slidePreviews[slide.id] && !thumbnailService.get(slide.id)) {
        console.log(`🎨 [TemplateSlideGrid] Manually generating preview for slide ${slide.id}`);
        try {
          await thumbnailService.generateThumbnail(slide.id, slide.htmlContent);
          const newPreview = thumbnailService.get(slide.id);
          if (newPreview) {
            setSlidePreviews(prev => ({
              ...prev,
              [slide.id]: newPreview
            }));
            console.log(`✅ [TemplateSlideGrid] Manual preview generation successful for slide ${slide.id}`);
          }
        } catch (error) {
          console.error(`❌ [TemplateSlideGrid] Manual preview generation failed for slide ${slide.id}:`, error);
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
        console.log(`🔧 [TemplateSlideGrid] Auto-generating ${slidesWithoutPreviews.length} missing previews after delay`);
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
    const errorSlides = slides.filter(slide => slide.status === 'draft' && !isGenerating).length;
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
    if (isGenerating && (slide.isPlaceholder || slide.status !== 'completed')) {
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
                  estimatedTime={30} // Можна зробити динамічним
                  isSelected={selectedSlideId === slide.id}
                  previewUrl={slidePreviews[slide.id] || slide.previewUrl || slide.thumbnailUrl}
                  onSelect={onSlideSelect}
                  onPreview={onSlidePreview}
                  onOpenFullscreen={onSlideFullscreen}
                  compact={compact}
                  showProgress={isGenerating}
                  showEstimatedTime={isGenerating}
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
