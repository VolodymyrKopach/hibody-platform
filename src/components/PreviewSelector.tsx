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
import { ImageIcon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
    if (memoizedSlides.length === 0) {
      return;
    }

    // Initialize previews from cache or slide.thumbnailUrl
    const initialPreviews: Record<string, PreviewState> = {};
    
    memoizedSlides.forEach(slide => {
      let previewUrl = '';
      
      // Priority: 1) cachedPreviews, 2) slide.thumbnailUrl, 3) fallback
      if (cachedPreviews[slide.id]) {
        previewUrl = cachedPreviews[slide.id];
      } else if (slide.thumbnailUrl) {
        previewUrl = slide.thumbnailUrl;
      } else {
        previewUrl = generateFallbackPreview();
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
    <Box>
      {/* Header with title and navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 500, 
          color: 'text.secondary' 
        }}>
          Choose Cover Image
        </Typography>
        
        {/* Navigation buttons */}
        {memoizedSlides.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={goToPrevSlide}
              disabled={disabled}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton
              onClick={goToNextSlide}
              disabled={disabled}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <ChevronRight size={20} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Preview image - compact without padding */}
      <Box sx={{ 
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.grey[100], 0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Preview content */}
        {currentPreview?.url ? (
          <img
            src={currentPreview.url}
            alt={`Slide preview ${currentSlideIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : currentPreview?.loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary'
          }}>
            <CircularProgress size={32} />
            <Typography variant="body2">
              Generating...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary'
          }}>
            <AlertCircle size={32} />
            <Typography variant="body2">
              Error
            </Typography>
          </Box>
        )}
      </Box>

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