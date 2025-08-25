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
      {/* Enhanced Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handlePrevSlide}
          disabled={slides.length <= 1}
          sx={{
            backgroundColor: theme.palette.grey[100],
            borderRadius: 2,
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText
            },
            '&:disabled': {
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.grey[300]
            }
          }}
        >
          <PrevIcon fontSize="small" />
        </IconButton>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 3,
          px: 2,
          py: 1
        }}>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            {currentSlideIndex + 1}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            of
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {slides.length}
          </Typography>
        </Box>

        <IconButton 
          onClick={handleNextSlide}
          disabled={slides.length <= 1}
          sx={{
            backgroundColor: theme.palette.grey[100],
            borderRadius: 2,
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText
            },
            '&:disabled': {
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.grey[300]
            }
          }}
        >
          <NextIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Current Slide Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        {/* Slide Header */}
        <Box sx={{ 
          p: 4, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.background.paper})`
        }}>
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
              {currentSlide.slideNumber}
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
              {currentSlide.type}
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
            {currentSlide.title}
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
            {currentSlide.goal}
          </Typography>
        </Box>

        {/* Slide Content */}
        <CardContent sx={{ p: 4 }}>
          {/* Structured Content Sections */}
          {currentSlide.structure ? (
            <Box>
              {/* Main Content Flow */}
              <Box sx={{ mb: 4 }}>
                {/* Greeting */}
                {currentSlide.structure.greeting && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: currentSlide.structure.greeting.action ? 1 : 0 }}>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontStyle: 'italic',
                          color: theme.palette.primary.main,
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          flex: 1
                        }}
                      >
                        "{currentSlide.structure.greeting.text}"
                      </Typography>
                      {currentSlide.structure.greeting.tone && (
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontStyle: 'normal',
                            backgroundColor: theme.palette.grey[100],
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            textTransform: 'capitalize'
                          }}
                        >
                          {currentSlide.structure.greeting.tone}
                        </Typography>
                      )}
                    </Box>
                    {currentSlide.structure.greeting.action && (
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.875rem',
                          pl: 2,
                          borderLeft: `2px solid ${theme.palette.primary.light}`,
                          fontStyle: 'italic'
                        }}
                      >
                        {currentSlide.structure.greeting.action}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Main Content */}
                {currentSlide.structure.mainContent && (
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        mb: currentSlide.structure.mainContent.keyPoints?.length ? 2 : 0
                      }}
                    >
                      {currentSlide.structure.mainContent.text}
                    </Typography>

                    {/* Key Points and Visual Elements */}
                    {((currentSlide.structure.mainContent.keyPoints && currentSlide.structure.mainContent.keyPoints.length > 0) ||
                      (currentSlide.structure.mainContent.visualElements && currentSlide.structure.mainContent.visualElements.length > 0)) && (
                      <Box sx={{ 
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        p: 2,
                        borderLeft: `3px solid ${theme.palette.success.main}`
                      }}>
                        {currentSlide.structure.mainContent.keyPoints && currentSlide.structure.mainContent.keyPoints.length > 0 && (
                          <Box sx={{ mb: currentSlide.structure.mainContent.visualElements?.length ? 2 : 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.success.main }}>
                              Key Points:
                            </Typography>
                            {currentSlide.structure.mainContent.keyPoints.map((point, index) => (
                              <Typography 
                                key={index}
                                variant="body2"
                                sx={{ 
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                  mb: index < currentSlide.structure.mainContent.keyPoints.length - 1 ? 0.5 : 0,
                                  '&:before': { content: '"• "', color: theme.palette.success.main }
                                }}
                              >
                                {point}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        
                        {currentSlide.structure.mainContent.visualElements && currentSlide.structure.mainContent.visualElements.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.warning.main }}>
                              Visual Elements:
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                color: theme.palette.text.secondary
                              }}
                            >
                              {currentSlide.structure.mainContent.visualElements.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Interactive Elements & Activities */}
              {((currentSlide.structure.interactions && currentSlide.structure.interactions.length > 0) || 
                (currentSlide.structure.activities && currentSlide.structure.activities.length > 0)) && (
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
                    What to Do
                  </Typography>

                  {/* Interactions */}
                  {currentSlide.structure.interactions && currentSlide.structure.interactions.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {currentSlide.structure.interactions.map((interaction, index) => (
                        <Box key={index} sx={{ 
                          mb: 1.5, 
                          p: 2, 
                          backgroundColor: theme.palette.primary.main + '08',
                          borderRadius: 2,
                          borderLeft: `3px solid ${theme.palette.primary.main}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                              {interaction.description}
                            </Typography>
                            {interaction.type && (
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  color: theme.palette.primary.main,
                                  fontSize: '0.7rem',
                                  backgroundColor: theme.palette.primary.main + '20',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {interaction.type}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem', mb: interaction.feedback ? 0.5 : 0 }}>
                            {interaction.instruction}
                          </Typography>
                          {interaction.feedback && (
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.primary.main, 
                              fontSize: '0.8rem',
                              fontStyle: 'italic',
                              display: 'block'
                            }}>
                              Expected: {interaction.feedback}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Activities */}
                  {currentSlide.structure.activities && currentSlide.structure.activities.length > 0 && (
                    <Box>
                      {currentSlide.structure.activities.map((activity, index) => (
                        <Box key={index} sx={{ 
                          mb: 1.5, 
                          p: 2, 
                          backgroundColor: theme.palette.secondary.main + '08',
                          borderRadius: 2,
                          borderLeft: `3px solid ${theme.palette.secondary.main}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {activity.name}
                            </Typography>
                            {activity.duration && (
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {activity.duration}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: (activity.materials?.length || activity.expectedOutcome) ? 1 : 0 }}>
                            {activity.description}
                          </Typography>
                          {activity.materials && activity.materials.length > 0 && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem', mb: activity.expectedOutcome ? 0.5 : 0 }}>
                              Materials: {activity.materials.join(', ')}
                            </Typography>
                          )}
                          {activity.expectedOutcome && (
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.secondary.main, 
                              fontSize: '0.8rem',
                              fontStyle: 'italic',
                              display: 'block'
                            }}>
                              Expected outcome: {activity.expectedOutcome}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Teacher Notes */}
              {currentSlide.structure.teacherGuidance && (
                <Box sx={{ 
                  backgroundColor: theme.palette.info.main + '08',
                  borderRadius: 2,
                  p: 2,
                  borderLeft: `3px solid ${theme.palette.info.main}`
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.info.main,
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    Teacher Notes
                  </Typography>
                  
                  {Object.entries(currentSlide.structure.teacherGuidance).map(([key, items]) => 
                    items && items.length > 0 ? (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.75rem' }}>
                          {key}:
                        </Typography>
                        {items.map((item, index) => (
                          <Typography 
                            key={index}
                            variant="caption"
                            sx={{ 
                              display: 'block',
                              fontSize: '0.75rem',
                              lineHeight: 1.4,
                              ml: 1,
                              '&:before': { content: '"• "' }
                            }}
                          >
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : null
                  )}
                </Box>
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
