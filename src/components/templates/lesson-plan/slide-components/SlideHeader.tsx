'use client';

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon
} from '@mui/icons-material';
import { SlideCommentButton } from '../../plan-editing';
import { PlanComment } from '@/types/templates';

interface SlideHeaderProps {
  slideNumber: number;
  slideType: string;
  title: string;
  goal: string;
  // Navigation props
  currentIndex: number;
  totalSlides: number;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  // Editing props
  isEditingMode?: boolean;
  hasComments?: boolean;
  commentCount?: number;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
}

const SlideHeader: React.FC<SlideHeaderProps> = ({
  slideNumber,
  slideType,
  title,
  goal,
  currentIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  isEditingMode = false,
  hasComments = false,
  commentCount = 0,
  onAddComment
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      p: 4, 
      borderBottom: `1px solid ${theme.palette.divider}`,
      background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.background.paper})`,
      position: 'relative'
    }}>
      {/* Controls - Top Right */}
      <Box sx={{ 
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {/* Comment Button - Always in navigation area when editing */}
        {isEditingMode && onAddComment && (
          <SlideCommentButton
            slideNumber={slideNumber}
            isEditingMode={isEditingMode}
            hasComments={hasComments}
            commentCount={commentCount}
            onAddComment={onAddComment}
            variant="inline"
            size="small"
            totalSlides={totalSlides}
          />
        )}

        {/* Navigation Controls */}
        {totalSlides > 1 && (
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            p: 1,
            boxShadow: theme.shadows[1]
          }}>
            <IconButton 
              onClick={onPrevSlide}
              size="small"
              disabled={!onPrevSlide}
              sx={{
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText
                }
              }}
            >
              <PrevIcon fontSize="small" />
            </IconButton>

            <Typography 
              variant="caption" 
              sx={{ 
                px: 1,
                fontWeight: 600,
                color: theme.palette.text.primary,
                minWidth: 40,
                textAlign: 'center'
              }}
            >
              {currentIndex + 1}/{totalSlides}
            </Typography>

            <IconButton 
              onClick={onNextSlide}
              size="small"
              disabled={!onNextSlide}
              sx={{
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText
                }
              }}
            >
              <NextIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Slide Number Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 700
        }}>
          {slideNumber}
        </Box>
        <Typography 
          variant="caption"
          sx={{ 
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 500
          }}
        >
          {t(`lessonPlan.slideTypes.${slideType.toLowerCase()}`, slideType)}
        </Typography>
      </Box>

      {/* Slide Title */}
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 1.5,
          lineHeight: 1.2
        }}
      >
        {title}
      </Typography>

      {/* Slide Goal */}
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          lineHeight: 1.5,
          fontStyle: 'italic',
          position: 'relative',
          pl: 3,
          '&:before': {
            content: '"🎯"',
            position: 'absolute',
            left: 0,
            top: 0
          }
        }}
      >
        {goal}
      </Typography>
    </Box>
  );
};

export default SlideHeader;
