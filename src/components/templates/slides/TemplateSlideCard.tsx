import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  Eye
} from 'lucide-react';
import { SimpleSlide } from '@/types/chat';

// Розширені типи для template flow
export interface TemplateSlideCardProps {
  slide: SimpleSlide;
  index: number;
  
  // Стан генерації
  generationStatus?: 'pending' | 'generating' | 'completed' | 'error';
  generationProgress?: number;
  
  // UI стан
  previewUrl?: string;
  
  // Callbacks
  onSelect?: (slideId: string) => void;
  onOpenFullscreen?: (slideIndex: number) => void;
  
  // Опції відображення
  showProgress?: boolean;
  compact?: boolean;
}

const TemplateSlideCard: React.FC<TemplateSlideCardProps> = ({
  slide,
  index,
  generationStatus = 'pending',
  generationProgress = 0,
  previewUrl,
  onSelect,
  onOpenFullscreen,
  showProgress = true,
  compact = false
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);

  // Визначаємо стан слайду
  const isPending = generationStatus === 'pending';
  const isGenerating = generationStatus === 'generating';
  const isCompleted = generationStatus === 'completed';
  const isError = generationStatus === 'error';

  // Симуляція прогресу генерації
  useEffect(() => {
    if (!isGenerating) {
      if (isCompleted && previewUrl) {
        // Якщо є превью, то 100%
        setInternalProgress(100);
      } else if (isCompleted && !previewUrl) {
        // Якщо слайд готовий, але немає превью - залишаємо 90%
        setInternalProgress(prev => Math.max(prev, 90));
      } else if (isPending) {
        // Якщо pending, то 0%
        setInternalProgress(0);
      }
      return;
    }

    // Симуляція прогресу під час генерації - починаємо з рандомного значення
    const initialProgress = Math.random() * 10 + 5; // 5-15%
    setInternalProgress(initialProgress);
    
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        if (prev >= 90) {
          // Зупиняємося на 90% до появи превью
          return prev;
        }
        
        // Рандомне збільшення від 2% до 8%
        const increment = Math.random() * 6 + 2;
        const newProgress = Math.min(prev + increment, 90);
        
        return newProgress;
      });
    }, 800 + Math.random() * 400); // Рандомний інтервал 800-1200ms

    return () => clearInterval(interval);
  }, [isGenerating, isCompleted, isPending, previewUrl]);

  // Встановлюємо 100% коли з'являється превью
  useEffect(() => {
    if (isCompleted && previewUrl && internalProgress < 100) {
      setTimeout(() => {
        setInternalProgress(100);
      }, 200);
    }
  }, [isCompleted, previewUrl, internalProgress]);



  const handleCardClick = () => {
    if (isCompleted && onOpenFullscreen) {
      onOpenFullscreen(index);
    } else if (onSelect) {
      onSelect(slide.id);
    }
  };



  return (
    <Paper
      elevation={0}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: '100%',
        minHeight: compact ? '160px' : '200px',
        height: 'auto',
        flexShrink: 0,
        border: `2px solid ${alpha(theme.palette.grey[400], 0.4)}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: isPending
          ? alpha(theme.palette.grey[50], 0.8)
          : 'white',
        cursor: isCompleted ? 'pointer' : 'default',
        position: 'relative',
        
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }
      }}
    >
      {/* Slide Number Badge */}
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        zIndex: 2 
      }}>
        <Chip
          label={index + 1}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            color: theme.palette.primary.main,
            fontSize: '0.75rem',
            height: '24px',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      </Box>



      {/* Slide Preview Area */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.grey[100], 0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Темний overlay при hover */}
        {isCompleted && previewUrl && internalProgress === 100 && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.4),
            zIndex: 2,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            {/* Проста іконка ока */}
            <Eye 
              size={32} 
              color={theme.palette.common.white}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          </Box>
        )}


        {/* Pending State */}
        {isPending && (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          }}>
            <Typography sx={{ 
              fontSize: compact ? '20px' : '28px', 
              mb: 1, 
              opacity: 0.5
            }}>
              ⏳
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary', 
              fontSize: compact ? '9px' : '10px',
              opacity: 0.6 
            }}>
              Waiting...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {isError && (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          }}>
            <Typography sx={{ 
              fontSize: compact ? '20px' : '28px', 
              mb: 1, 
              opacity: 0.7
            }}>
              ❌
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'error.main', 
              fontSize: compact ? '9px' : '10px',
              opacity: 0.8 
            }}>
              Failed
            </Typography>
          </Box>
        )}

        {/* Completed State - Show Preview */}
        {isCompleted && previewUrl && internalProgress === 100 && (
          <Box sx={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            <img
              src={previewUrl}
              alt={slide.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        )}

        {/* Combined Generation State */}
        {(isGenerating || (isCompleted && (!previewUrl || internalProgress < 100))) && (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', // Beautiful background from left
            position: 'relative'
          }}>
            {/* Animated Emoji */}
            <Typography sx={{ 
              fontSize: compact ? '24px' : '32px', 
              mb: 2, 
              opacity: 0.8,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              🎨
            </Typography>
            
            {/* Generation Text */}
            <Typography variant="caption" sx={{ 
              color: theme.palette.primary.main, 
              fontSize: compact ? '10px' : '12px',
              fontWeight: 600,
              mb: 1
            }}>
              {internalProgress < 90 ? 'Generating...' : 
               internalProgress < 100 ? 'Creating preview...' : 'Finalizing...'}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ width: '80%', mb: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={internalProgress} 
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main
                  }
                }}
              />
            </Box>

            {/* Progress Percentage */}
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: compact ? '9px' : '10px'
            }}>
              {Math.round(internalProgress)}%
            </Typography>

            {/* CSS Animations */}
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 0.6; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </Box>
        )}
      </Box>

      {/* Progress Bar */}
      {showProgress && isGenerating && (
        <Box sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px'
        }}>
          <LinearProgress 
            variant="determinate" 
            value={generationProgress} 
            sx={{
              height: '100%',
              backgroundColor: alpha(theme.palette.grey[300], 0.3),
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.primary.main
              }
            }}
          />
        </Box>
      )}

      {/* Slide Info */}
      <Box sx={{ 
        p: compact ? 1.5 : 2, 
        pt: compact ? 1 : 1.5,
        pb: compact ? 1.5 : 2,
        display: 'flex',
        alignItems: 'center',
        minHeight: compact ? '48px' : '56px',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`
      }}>
        <Typography 
          variant={compact ? "body2" : "subtitle2"} 
          sx={{ 
            fontWeight: 600,
            fontSize: compact ? '0.8rem' : '0.9rem',
            lineHeight: 1.3,
            color: theme.palette.text.primary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {slide.title}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TemplateSlideCard;
