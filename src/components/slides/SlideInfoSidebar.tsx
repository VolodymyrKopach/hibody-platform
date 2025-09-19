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
import { X, BookOpen, Target, Clock, Users, Activity, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ParsedSlide, ParsedLessonPlan } from '@/types/templates';
import { LessonPlanParser } from '@/utils/lessonPlanParser';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';

interface SlideInfoSidebarProps {
  open: boolean;
  slideIndex: number;
  lessonPlan: string | null; // Raw lesson plan data
  isFullscreen?: boolean; // Для адаптації під повноекранний режим
}

const SlideInfoSidebar: React.FC<SlideInfoSidebarProps> = ({
  open,
  slideIndex,
  lessonPlan,
  isFullscreen = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['slides', 'common']);
  const [parsedPlan, setParsedPlan] = useState<ParsedLessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse lesson plan when it changes
  useEffect(() => {
    console.log('🔍 SlideInfoSidebar: Parsing lesson plan:', {
      hasLessonPlan: !!lessonPlan,
      planLength: lessonPlan?.length || 0,
      planType: typeof lessonPlan,
      slideIndex,
      sidebarOpen: open
    });

    if (!lessonPlan) {
      console.log('❌ SlideInfoSidebar: No lesson plan provided');
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
      console.log('✅ SlideInfoSidebar: Successfully parsed lesson plan:', {
        slidesCount: parsed.slides?.length || 0,
        hasMetadata: !!parsed.metadata,
        currentSlideExists: !!parsed.slides?.[slideIndex]
      });
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

    return (
      <Box sx={{ p: 3 }}>
        {/* Slide Title */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {currentSlide.title}
        </Typography>

        {/* Slide Type */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={currentSlide.type}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
        </Box>

        {/* Slide Goal */}
        {currentSlide.goal && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Target size={16} />
              <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
                Goal
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {currentSlide.goal}
            </Typography>
          </Paper>
        )}

        {/* Slide Content */}
        {currentSlide.content && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BookOpen size={16} />
              <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
                Content
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {currentSlide.content}
            </Typography>
          </Paper>
        )}

        {/* Additional Structure Info (if available) */}
        {(currentSlide as any)?.structure && (
          <>
            {/* Teacher Guidance */}
            {(currentSlide as any).structure.teacherGuidance && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Lightbulb size={16} />
                  <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
                    Teacher Guidance
                  </Typography>
                </Box>
                {(currentSlide as any).structure.teacherGuidance.preparation && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Preparation:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {(currentSlide as any).structure.teacherGuidance.preparation.map((item: string, index: number) => (
                        <li key={index}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
                {(currentSlide as any).structure.teacherGuidance.delivery && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Delivery:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {(currentSlide as any).structure.teacherGuidance.delivery.map((item: string, index: number) => (
                        <li key={index}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Paper>
            )}

            {/* Activities */}
            {(currentSlide as any).structure.activities && (currentSlide as any).structure.activities.length > 0 && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Activity size={16} />
                  <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
                    Activities
                  </Typography>
                </Box>
                {(currentSlide as any).structure.activities.map((activity: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {activity.description}
                    </Typography>
                    {activity.duration && (
                      <Chip label={activity.duration} size="small" variant="outlined" />
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </>
        )}

        {/* Lesson Overview */}
        {parsedPlan && (
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
        )}
      </Box>
    );
  };

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          width: { xs: 300, md: 400 },
          maxWidth: { xs: '50vw', md: '40vw' },
          minWidth: { xs: 280, md: 300 },
          height: '100%',
          backgroundColor: isFullscreen 
            ? alpha('#000000', 0.9)
            : theme.palette.background.paper,
          borderLeft: `1px solid ${isFullscreen 
            ? alpha('#ffffff', 0.2) 
            : theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)',
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
              ? alpha('#000000', 0.8)
              : 'transparent',
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
                : 'inherit',
              color: isFullscreen ? '#ffffff' : 'inherit',
            },
            '& .MuiTypography-root': {
              color: isFullscreen ? '#ffffff' : 'inherit',
            },
            '& .MuiChip-root': {
              backgroundColor: isFullscreen 
                ? alpha('#ffffff', 0.2)
                : 'inherit',
              color: isFullscreen ? '#ffffff' : 'inherit',
              borderColor: isFullscreen 
                ? alpha('#ffffff', 0.3)
                : 'inherit',
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
