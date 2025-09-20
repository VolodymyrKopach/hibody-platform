import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ParsedSlide, PlanComment } from '@/types/templates';
import {
  SlideHeader,
  SlideGreeting,
  SlideMainContent,
  SlideInteractions,
  SlideActivities,
  SlideTeacherGuidance,
  SlideFallbackContent
} from './slide-components';

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
  slides: ExtendedSlide[];
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ 
  slides, 
  isEditingMode = false,
  onAddComment,
  pendingComments = []
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
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

  const handlePrevSlide = () => {
    setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : slides.length - 1);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex(prev => prev < slides.length - 1 ? prev + 1 : 0);
  };

  // Handle adding comment for current slide
  const handleAddSlideComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment({
        ...comment,
        sectionType: 'slide',
        sectionId: (currentSlideIndex + 1).toString()
      });
    }
  };

  // Check if current slide has pending comments
  const slideComments = pendingComments.filter(
    comment => comment.sectionType === 'slide' && 
    comment.sectionId === (currentSlideIndex + 1).toString()
  );
  const hasSlideComments = slideComments.length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Current Slide Card with Embedded Navigation */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Slide Header */}
        <SlideHeader
          slideNumber={currentSlide.slideNumber}
          slideType={currentSlide.type}
          title={currentSlide.title}
          goal={currentSlide.goal}
          currentIndex={currentSlideIndex}
          totalSlides={slides.length}
          onPrevSlide={slides.length > 1 ? handlePrevSlide : undefined}
          onNextSlide={slides.length > 1 ? handleNextSlide : undefined}
          isEditingMode={isEditingMode}
          hasComments={hasSlideComments}
          commentCount={slideComments.length}
          onAddComment={onAddComment ? handleAddSlideComment : undefined}
        />

        {/* Slide Content */}
        <CardContent 
          sx={{ 
            p: 4,
            cursor: slides.length > 1 ? 'pointer' : 'default',
            userSelect: 'none',
            position: 'relative',
            '&:hover': slides.length > 1 ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                pointerEvents: 'none',
                zIndex: 1
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                pointerEvents: 'none',
                zIndex: 1
              }
            } : {}
          }}
          onClick={(e) => {
            if (slides.length <= 1) return;
            
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const centerX = rect.width / 2;
            
            if (clickX < centerX) {
              handlePrevSlide();
            } else {
              handleNextSlide();
            }
          }}
        >
          {/* Structured Content Sections */}
          {currentSlide.structure ? (
            <Box>
              {/* Main Content Flow */}
              <Box sx={{ mb: 4 }}>
                {/* Combined Greeting and Main Content */}
                {(currentSlide.structure.greeting || currentSlide.structure.mainContent) && (
                  <Box sx={{ mb: 3 }}>
                    {/* Greeting */}
                    {currentSlide.structure.greeting && (
                      <Box sx={{ mb: currentSlide.structure.mainContent ? 2 : 0 }}>
                        <SlideGreeting greeting={currentSlide.structure.greeting} />
                      </Box>
                    )}

                    {/* Main Content */}
                    {currentSlide.structure.mainContent && (
                      <SlideMainContent mainContent={currentSlide.structure.mainContent} />
                    )}
                  </Box>
                )}
              </Box>

              {/* Interactive Elements & Activities */}
              {((currentSlide.structure?.interactions && currentSlide.structure.interactions.length > 0) || 
                (currentSlide.structure?.activities && currentSlide.structure.activities.length > 0)) && (
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 2,
                      fontSize: '1rem'
                    }}
                  >
                    {t('lessonPlan.sectionTitles.whatToDo')}
                  </Typography>

                  {/* Interactions */}
                  {currentSlide.structure?.interactions && (
                    <SlideInteractions interactions={currentSlide.structure.interactions} />
                  )}

                  {/* Activities */}
                  {currentSlide.structure?.activities && (
                    <SlideActivities activities={currentSlide.structure.activities} />
                  )}
                </Box>
              )}

              {/* Teacher Notes */}
              {currentSlide.structure?.teacherGuidance && (
                <SlideTeacherGuidance teacherGuidance={currentSlide.structure.teacherGuidance} />
              )}
            </Box>
          ) : (
            /* Fallback to legacy content display */
            <SlideFallbackContent 
              content={currentSlide.content}
              allowHtml={true}
              showPlaceholder={true}
              placeholderText="No content available for this slide."
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SlideNavigation;