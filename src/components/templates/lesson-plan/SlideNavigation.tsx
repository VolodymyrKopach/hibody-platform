import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { ParsedSlide } from '@/types/templates';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';
import {
  GreetingSection,
  MainContentSection,
  InteractionsSection,
  ActivitiesSection,
  TeacherGuidanceSection
} from './slide-sections';

// Extended slide interface to include structure
interface ExtendedSlide extends ParsedSlide {
  structure?: {
    greeting?: {
      text: string;
      action?: string;
      tone?: string;
    };
    mainContent?: {
      text: string;
      keyPoints?: string[];
      visualElements?: string[];
    };
    interactions?: Array<{
      type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
      description: string;
      instruction: string;
      feedback?: string;
    }>;
    activities?: Array<{
      name: string;
      description: string;
      duration?: string;
      materials?: string[];
      expectedOutcome?: string;
    }>;
    teacherGuidance?: {
      preparation?: string[];
      delivery?: string[];
      adaptations?: string[];
      troubleshooting?: string[];
    };
  };
}

interface SlideNavigationProps {
  slides: (ParsedSlide & { structure?: ExtendedSlide['structure'] })[];
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ slides }) => {
  const theme = useTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  if (!slides || slides.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No slides available
        </Typography>
      </Box>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const typeConfig = LessonPlanJSONProcessor.getSlideTypeConfig(currentSlide.type);
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  const handlePrevSlide = () => {
    setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : slides.length - 1);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex(prev => prev < slides.length - 1 ? prev + 1 : 0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Slide {currentSlideIndex + 1} of {slides.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: typeConfig.color,
              borderRadius: 3
            }
          }}
        />
      </Box>

      {/* Navigation Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handlePrevSlide}
          disabled={slides.length <= 1}
          sx={{
            backgroundColor: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[200]
            },
            '&:disabled': {
              backgroundColor: theme.palette.grey[50]
            }
          }}
        >
          <PrevIcon />
        </IconButton>

        {/* Slide Indicators */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {slides.map((slide, index) => (
            <Box
              key={slide.slideNumber}
              onClick={() => setCurrentSlideIndex(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentSlideIndex 
                  ? typeConfig.color 
                  : theme.palette.grey[300],
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                  backgroundColor: index === currentSlideIndex 
                    ? typeConfig.color 
                    : theme.palette.grey[400]
                }
              }}
            />
          ))}
        </Box>

        <IconButton 
          onClick={handleNextSlide}
          disabled={slides.length <= 1}
          sx={{
            backgroundColor: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[200]
            },
            '&:disabled': {
              backgroundColor: theme.palette.grey[50]
            }
          }}
        >
          <NextIcon />
        </IconButton>
      </Box>

      {/* Current Slide Card */}
      <Card 
        sx={{ 
          border: `2px solid ${typeConfig.color}40`,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s ease'
        }}
      >
        {/* Slide Header */}
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${typeConfig.color}15, ${typeConfig.color}05)`,
            borderBottom: `1px solid ${typeConfig.color}20`,
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {/* Slide Number */}
            <Avatar 
              sx={{ 
                width: 48,
                height: 48,
                backgroundColor: typeConfig.color,
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700
              }}
            >
              {currentSlide.slideNumber}
            </Avatar>

            {/* Type Badge */}
            <Chip
              icon={<Typography sx={{ fontSize: '1rem' }}>{typeConfig.icon}</Typography>}
              label={currentSlide.type}
              sx={{
                backgroundColor: `${typeConfig.color}20`,
                color: typeConfig.color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: typeConfig.color
                }
              }}
            />
          </Box>

          {/* Slide Title */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              lineHeight: 1.2
            }}
          >
            {currentSlide.title}
          </Typography>

          {/* Slide Goal */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontStyle: 'italic',
              lineHeight: 1.4
            }}
          >
            🎯 {currentSlide.goal}
          </Typography>
        </Box>

        {/* Slide Content */}
        <CardContent sx={{ p: 3 }}>
          {/* Structured Content Sections */}
          {currentSlide.structure ? (
            <Box>
              {/* Greeting Section */}
              {currentSlide.structure.greeting && (
                <GreetingSection greeting={currentSlide.structure.greeting} />
              )}

              {/* Main Content Section */}
              {currentSlide.structure.mainContent && (
                <MainContentSection mainContent={currentSlide.structure.mainContent} />
              )}

              {/* Interactions Section */}
              {currentSlide.structure.interactions && currentSlide.structure.interactions.length > 0 && (
                <InteractionsSection interactions={currentSlide.structure.interactions} />
              )}

              {/* Activities Section */}
              {currentSlide.structure.activities && currentSlide.structure.activities.length > 0 && (
                <ActivitiesSection activities={currentSlide.structure.activities} />
              )}

              {/* Teacher Guidance Section */}
              {currentSlide.structure.teacherGuidance && (
                <TeacherGuidanceSection teacherGuidance={currentSlide.structure.teacherGuidance} />
              )}
            </Box>
          ) : (
            /* Fallback to legacy content display */
            <Box 
              sx={{ 
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                p: 3,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem'
                }}
              >
                {currentSlide.content || 'No content available for this slide.'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>


    </Box>
  );
};

export default SlideNavigation;
