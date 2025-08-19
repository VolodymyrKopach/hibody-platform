'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Card,
  IconButton
} from '@mui/material';
import { Check, ImageIcon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateFallbackPreview } from '@/utils/slidePreview';

interface SlideData {
  id: string;
  title: string;
  htmlContent: string;
  type: string;
  thumbnailUrl?: string; // Add thumbnailUrl from database
}

interface PreviewSelectorProps {
  slides: SlideData[];
  selectedPreviewId: string | null;
  onPreviewSelect: (slideId: string, previewUrl: string) => void;
  disabled?: boolean;
  cachedPreviews?: Record<string, string>; // External cached previews
}

interface PreviewState {
  url: string;
  loading: boolean;
  error: boolean;
}

const PreviewSelector: React.FC<PreviewSelectorProps> = ({
  slides,
  selectedPreviewId,
  onPreviewSelect,
  disabled = false,
  cachedPreviews = {}
}) => {
  const theme = useTheme();
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Memoize slides to prevent unnecessary re-renders
  const memoizedSlides = useMemo(() => slides, [slides]);

  // Simplified preview loading logic - use only cached/DB previews
  useEffect(() => {
    console.log('🎯 PREVIEW SELECTOR: Loading cached previews', {
      slidesCount: memoizedSlides.length,
      slideIds: memoizedSlides.map(s => s.id),
      cachedPreviewsCount: Object.keys(cachedPreviews).length,
      cachedPreviewIds: Object.keys(cachedPreviews),
      selectedPreviewId,
      timestamp: new Date().toISOString()
    });

    if (memoizedSlides.length === 0) {
      console.log('❌ PREVIEW SELECTOR: No slides to process, exiting');
      return;
    }

    // Initialize previews from cache or slide.thumbnailUrl
    const initialPreviews: Record<string, PreviewState> = {};
    
    memoizedSlides.forEach(slide => {
      let previewUrl = '';
      
      // Priority: 1) cachedPreviews, 2) slide.thumbnailUrl, 3) fallback
      if (cachedPreviews[slide.id]) {
        previewUrl = cachedPreviews[slide.id];
        console.log(`✅ PREVIEW SELECTOR: Using cached preview for slide ${slide.id}`, {
          previewLength: previewUrl.length,
          isDataUrl: previewUrl.startsWith('data:')
        });
      } else if (slide.thumbnailUrl) {
        previewUrl = slide.thumbnailUrl;
        console.log(`💾 PREVIEW SELECTOR: Using database thumbnailUrl for slide ${slide.id}`, {
          thumbnailUrl: slide.thumbnailUrl
        });
      } else {
        previewUrl = generateFallbackPreview();
        console.log(`🎨 PREVIEW SELECTOR: Generated fallback preview for slide ${slide.id}`, {
          previewLength: previewUrl.length,
          isDataUrl: previewUrl.startsWith('data:')
        });
      }
      
      initialPreviews[slide.id] = {
        url: previewUrl,
        loading: false,
        error: !previewUrl
      };
    });

    setPreviews(initialPreviews);

    // Automatically select the first slide if nothing is selected
    if (!selectedPreviewId && memoizedSlides.length > 0) {
      const firstSlide = memoizedSlides[0];
      const firstPreview = initialPreviews[firstSlide.id];
      if (firstPreview?.url) {
        console.log('🎯 PREVIEW SELECTOR: Auto-selecting first slide preview:', firstSlide.id);
        onPreviewSelect(firstSlide.id, firstPreview.url);
      }
    }
  }, [memoizedSlides, cachedPreviews, selectedPreviewId, onPreviewSelect]);

  const getSlideTypeIcon = useCallback((type: string) => {
    const icons = {
      'title': '🏠',
      'content': '📖',
      'interactive': '🎮',
      'summary': '📝'
    };
    return icons[type as keyof typeof icons] || '📄';
  }, []);

  // Slider navigation
  const goToPrevSlide = useCallback(() => {
    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : memoizedSlides.length - 1;
    setCurrentSlideIndex(newIndex);
    const slide = memoizedSlides[newIndex];
    if (slide && previews[slide.id]?.url) {
      onPreviewSelect(slide.id, previews[slide.id].url);
    }
  }, [currentSlideIndex, memoizedSlides, previews, onPreviewSelect]);

  const goToNextSlide = useCallback(() => {
    const newIndex = currentSlideIndex < memoizedSlides.length - 1 ? currentSlideIndex + 1 : 0;
    setCurrentSlideIndex(newIndex);
    const slide = memoizedSlides[newIndex];
    if (slide && previews[slide.id]?.url) {
      onPreviewSelect(slide.id, previews[slide.id].url);
    }
  }, [currentSlideIndex, memoizedSlides, previews, onPreviewSelect]);

  // Synchronize currentSlideIndex with selectedPreviewId
  useEffect(() => {
    if (selectedPreviewId) {
      const index = memoizedSlides.findIndex(slide => slide.id === selectedPreviewId);
      if (index !== -1 && index !== currentSlideIndex) {
        setCurrentSlideIndex(index);
      }
    }
  }, [selectedPreviewId, memoizedSlides, currentSlideIndex]);

  // Get current slide
  const currentSlide = memoizedSlides[currentSlideIndex];
  const currentPreview = currentSlide ? previews[currentSlide.id] : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (memoizedSlides.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSlide, goToNextSlide, memoizedSlides.length]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 3,
        color: 'text.primary',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        🖼️ Select preview for lesson
      </Typography>

      {/* Preview slider */}
      <Card sx={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box sx={{ 
          width: '100%',
          aspectRatio: '4/3',  // Set proportions for preview
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          bgcolor: alpha(theme.palette.grey[100], 0.5)
        }}>
          {/* Previous slide button */}
          {memoizedSlides.length > 1 && (
            <IconButton
              onClick={goToPrevSlide}
              disabled={disabled}
              sx={{
                position: 'absolute',
                left: 16,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                '&:disabled': {
                  opacity: 0.5
                },
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
          )}

          {/* Preview content */}
          {currentPreview?.url ? (
            <img
              src={currentPreview.url}
              alt={`Slide preview ${currentSlideIndex + 1}`}
              style={{
                maxWidth: '80%',
                maxHeight: '90%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          ) : currentPreview?.loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2,
              color: 'text.secondary'
            }}>
              <CircularProgress size={48} />
              <Typography variant="body1">
                Generating preview...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2,
              color: 'text.secondary'
            }}>
              <AlertCircle size={48} />
              <Typography variant="body1">
                Preview generation error
              </Typography>
            </Box>
          )}

          {/* Next slide button */}
          {memoizedSlides.length > 1 && (
            <IconButton
              onClick={goToNextSlide}
              disabled={disabled}
              sx={{
                position: 'absolute',
                right: 16,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                '&:disabled': {
                  opacity: 0.5
                },
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          )}

          {/* Select current slide */}
          <Box sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: theme.palette.primary.main,
            color: 'white',
            borderRadius: '20px',
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Check size={16} />
            Selected
          </Box>
        </Box>
      </Card>

      {/* Navigation dots */}
      {memoizedSlides.length > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 1,
          mt: 3
        }}>
          {memoizedSlides.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setCurrentSlideIndex(index);
                const slide = memoizedSlides[index];
                if (slide && previews[slide.id]?.url) {
                  onPreviewSelect(slide.id, previews[slide.id].url);
                }
              }}
              sx={{
                width: currentSlideIndex === index ? 12 : 8,
                height: currentSlideIndex === index ? 12 : 8,
                borderRadius: '50%',
                backgroundColor: currentSlideIndex === index 
                  ? theme.palette.primary.main 
                  : alpha(theme.palette.grey[400], 0.5),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: currentSlideIndex === index ? 'scale(1.2)' : 'scale(1)',
                '&:hover': {
                  backgroundColor: currentSlideIndex === index 
                    ? theme.palette.primary.dark 
                    : alpha(theme.palette.grey[400], 0.8),
                  transform: 'scale(1.1)'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Message about no slides */}
      {memoizedSlides.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: 'text.secondary'
        }}>
          <ImageIcon size={48} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            No slides to generate preview
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PreviewSelector; 