'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Slide
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  X, 
  Users, 
  Clock,
  Volume2 as SoundIcon,
  Gamepad2 as GameIcon,
  Activity,
  School as TeacherIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ParsedSlide, ParsedLessonPlan } from '@/types/templates';
import { LessonPlanParser } from '@/utils/lessonPlanParser';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';
import {
  SlideGreeting,
  SlideMainContent,
  SlideInteractions,
  SlideActivities,
  SlideTeacherGuidance,
  SlideFallbackContent
} from '@/components/templates/lesson-plan/slide-components';

interface SlideInfoSidebarProps {
  open: boolean;
  slideIndex: number;
  lessonPlan: string | null; // Raw lesson plan data
  isFullscreen?: boolean; // Для адаптації під повноекранний режим
  onClose?: () => void; // Callback для закриття сайдбару
}

const SlideInfoSidebar: React.FC<SlideInfoSidebarProps> = ({
  open,
  slideIndex,
  lessonPlan,
  isFullscreen = false,
  onClose
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['slides', 'common']);
  const [parsedPlan, setParsedPlan] = useState<ParsedLessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse lesson plan when it changes
  useEffect(() => {
    if (!lessonPlan) {
      setParsedPlan(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let parsed: ParsedLessonPlan;
      
      // Try to parse as JSON first
      if (typeof lessonPlan === 'object') {
        parsed = LessonPlanJSONProcessor.processJSONObject(lessonPlan);
      } else if (typeof lessonPlan === 'string') {
        try {
          const jsonPlan = JSON.parse(lessonPlan);
          parsed = LessonPlanJSONProcessor.processJSONObject(jsonPlan);
        } catch {
          // Fallback to markdown parsing
          parsed = LessonPlanParser.parse(lessonPlan);
        }
      } else {
        throw new Error('Invalid lesson plan format');
      }

      setParsedPlan(parsed);
    } catch (err) {
      console.error('❌ SlideInfoSidebar: Error parsing lesson plan:', err);
      setError('Failed to parse lesson plan');
    } finally {
      setLoading(false);
    }
  }, [lessonPlan, slideIndex]);

  const currentSlide = parsedPlan?.slides?.[slideIndex] || null;

  const renderSlideInfo = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!currentSlide) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No information available for this slide
        </Alert>
      );
    }

    // Cast to extended slide type to access structure
    const extendedSlide = currentSlide as any;

    return (
      <Box>
        {/* Basic Slide Info */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {currentSlide.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={currentSlide.type}
              color="primary"
              variant="outlined"
              size="small"
            />
            {currentSlide.goal && (
              <Chip
                label="Has Goal"
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          {currentSlide.goal && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: alpha(theme.palette.grey[500], 0.05) }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {currentSlide.goal}
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider />

        {/* Slide Content using new modular components */}
        <Box sx={{ p: 3 }}>
          {extendedSlide.structure ? (
            <Box>
              {/* Main Content Flow */}
              <Box sx={{ mb: 4 }}>
                {/* Combined Greeting and Main Content */}
                {(extendedSlide.structure.greeting || extendedSlide.structure.mainContent) && (
                  <Box sx={{ mb: 3 }}>
                    {/* Greeting */}
                    {extendedSlide.structure.greeting && (
                      <Box sx={{ mb: extendedSlide.structure.mainContent ? 2 : 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <Box sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '6px',
                            backgroundColor: `${theme.palette.warning.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <SoundIcon size={16} color={theme.palette.warning.main} />
                          </Box>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600,
                              color: theme.palette.text.primary
                            }}
                          >
                            Greeting
                          </Typography>
                          {extendedSlide.structure.greeting.tone && (
                            <Typography 
                              variant="caption"
                              sx={{ 
                                ml: 'auto',
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem'
                              }}
                            >
                              ({extendedSlide.structure.greeting.tone})
                            </Typography>
                          )}
                        </Box>
                        <SlideGreeting greeting={extendedSlide.structure.greeting} />
                      </Box>
                    )}

                    {/* Main Content */}
                    {extendedSlide.structure.mainContent && (
                      <SlideMainContent mainContent={extendedSlide.structure.mainContent} />
                    )}
                  </Box>
                )}

              </Box>

              {/* Interactive Elements */}
              {extendedSlide.structure.interactions && extendedSlide.structure.interactions.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      backgroundColor: `${theme.palette.primary.main}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GameIcon size={16} color={theme.palette.primary.main} />
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      Interactive Elements
                    </Typography>
                  </Box>
                  <SlideInteractions interactions={extendedSlide.structure.interactions} />
                </Box>
              )}

              {/* Activities */}
              {extendedSlide.structure.activities && extendedSlide.structure.activities.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      backgroundColor: `${theme.palette.secondary.main}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Activity size={16} color={theme.palette.secondary.main} />
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      Activities
                    </Typography>
                  </Box>
                  <SlideActivities activities={extendedSlide.structure.activities} />
                </Box>
              )}

              {/* Teacher Guidance */}
              {extendedSlide.structure.teacherGuidance && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      backgroundColor: `${theme.palette.info.main}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TeacherIcon size={16} color={theme.palette.info.main} />
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      Teacher Guidance
                    </Typography>
                  </Box>
                  <SlideTeacherGuidance teacherGuidance={extendedSlide.structure.teacherGuidance} />
                </Box>
              )}
            </Box>
          ) : (
            /* Fallback to legacy content display */
            <SlideFallbackContent 
              content={currentSlide.content || ''}
              allowHtml={true}
              showPlaceholder={true}
              placeholderText="No content available for this slide."
            />
          )}
        </Box>

        {/* Lesson Overview */}
        {parsedPlan && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.grey[500], 0.05) }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Lesson Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Users size={14} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {parsedPlan.metadata.targetAudience}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Clock size={14} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {parsedPlan.metadata.duration}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {parsedPlan.metadata.goal}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: 341, md: 488 },
          maxWidth: { xs: '59vw', md: '48vw' },
          minWidth: { xs: 312, md: 390 },
          height: '100%',
          backgroundColor: isFullscreen 
            ? alpha('#000000', 0.95)
            : alpha(theme.palette.background.paper, 0.98),
          borderLeft: `1px solid ${isFullscreen 
            ? alpha('#ffffff', 0.2) 
            : theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
          boxShadow: isFullscreen 
            ? `0 0 50px ${alpha('#000000', 0.8)}`
            : theme.shadows[8],
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${isFullscreen 
              ? alpha('#ffffff', 0.2) 
              : theme.palette.divider}`,
            backgroundColor: isFullscreen 
              ? alpha('#000000', 0.5)
              : theme.palette.background.default,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: isFullscreen ? '#ffffff' : 'inherit'
            }}
          >
            Slide Information
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: isFullscreen ? '#ffffff' : 'inherit',
              '&:hover': {
                backgroundColor: isFullscreen 
                  ? alpha('#ffffff', 0.1)
                  : alpha(theme.palette.grey[500], 0.1),
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            color: isFullscreen ? '#ffffff' : 'inherit',
            '& .MuiPaper-root': {
              backgroundColor: isFullscreen 
                ? alpha('#ffffff', 0.1)
                : undefined,
              color: isFullscreen ? '#ffffff' : 'inherit',
            },
            '& .MuiTypography-root': {
              color: isFullscreen ? '#ffffff' : 'inherit',
            },
            '& .MuiChip-root': {
              backgroundColor: isFullscreen 
                ? alpha('#ffffff', 0.2)
                : undefined,
              color: isFullscreen ? '#ffffff' : 'inherit',
            }
          }}
        >
          {renderSlideInfo()}
        </Box>
      </Box>
    </Slide>
  );
};

export default SlideInfoSidebar;