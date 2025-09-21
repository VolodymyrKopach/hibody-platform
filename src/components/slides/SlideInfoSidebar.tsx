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
import { lessonService } from '@/services/database/LessonService';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';
import { LessonPlanParser } from '@/utils/lessonPlanParser';
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
  lessonId: string | null; // For Materials page - load from database
  lessonPlan?: string | object | null; // For Step3 - use local plan
  isFullscreen?: boolean;
  onClose?: () => void;
}

const SlideInfoSidebar: React.FC<SlideInfoSidebarProps> = ({
  open,
  slideIndex,
  lessonId,
  lessonPlan,
  isFullscreen = false,
  onClose
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['slides', 'common']);
  const [parsedPlan, setParsedPlan] = useState<ParsedLessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Styles (keeping the same styles as before)
  const styles = {
    container: {
      position: 'absolute' as const,
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
      borderRadius: { xs: '0', md: '20px 0 0 20px' },
      display: 'flex',
      flexDirection: 'column' as const,
      backdropFilter: 'blur(20px)',
      zIndex: 10,
      boxShadow: isFullscreen 
        ? `
          0 0 50px ${alpha('#000000', 0.8)},
          inset 0 1px 0 ${alpha('#ffffff', 0.1)}
        `
        : `
          -8px 0 32px ${alpha(theme.palette.common.black, 0.12)},
          -4px 0 16px ${alpha(theme.palette.common.black, 0.08)},
          -2px 0 8px ${alpha(theme.palette.common.black, 0.04)},
          inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
        `,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 3,
      borderBottom: `1px solid ${isFullscreen 
        ? alpha('#ffffff', 0.2) 
        : theme.palette.divider}`,
      backgroundColor: isFullscreen 
        ? alpha('#000000', 0.5)
        : alpha(theme.palette.background.default, 0.8),
      borderRadius: { xs: '0', md: '20px 0 0 0' },
      backdropFilter: 'blur(10px)',
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
      position: 'relative' as const,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, 
          ${alpha(theme.palette.divider, 0)} 0%, 
          ${theme.palette.divider} 20%, 
          ${theme.palette.divider} 80%, 
          ${alpha(theme.palette.divider, 0)} 100%
        )`,
      }
    },
    headerTitle: {
      fontWeight: 600,
      color: isFullscreen ? '#ffffff' : 'inherit'
    },
    closeButton: {
      color: isFullscreen ? '#ffffff' : 'inherit',
      borderRadius: '12px',
      padding: '8px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: isFullscreen 
          ? alpha('#ffffff', 0.15)
          : alpha(theme.palette.grey[500], 0.12),
        transform: 'scale(1.05)',
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
      },
      '&:active': {
        transform: 'scale(0.95)',
      }
    },
    content: {
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
    },
    slideInfoContainer: {
      p: 3, 
      pb: 2
    },
    slideTitle: {
      mb: 2, 
      fontWeight: 600
    },
    chipContainer: {
      display: 'flex', 
      gap: 1, 
      mb: 1, 
      flexWrap: 'wrap'
    },
    chip: {
      borderRadius: '8px',
      fontWeight: 500,
    },
    primaryChip: {
      boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    secondaryChip: {
      boxShadow: `0 2px 4px ${alpha(theme.palette.secondary.main, 0.2)}`,
    },
    goalPaper: {
      p: 2.5, 
      mt: 2, 
      backgroundColor: alpha(theme.palette.grey[500], 0.05),
      borderRadius: '12px',
      border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
      boxShadow: `
        0 2px 8px ${alpha(theme.palette.common.black, 0.04)},
        0 1px 3px ${alpha(theme.palette.common.black, 0.06)}
      `,
    },
    goalText: {
      color: 'text.secondary', 
      fontStyle: 'italic',
      lineHeight: 1.6
    },
    slideContent: {
      p: 3
    },
    sectionContainer: {
      mb: 4
    },
    sectionHeader: {
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5, 
      mb: 2
    },
    sectionIcon: {
      width: 32,
      height: 32,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    warningIcon: {
      backgroundColor: `${theme.palette.warning.main}15`,
      boxShadow: `
        0 2px 8px ${alpha(theme.palette.warning.main, 0.2)},
        0 1px 3px ${alpha(theme.palette.warning.main, 0.1)}
      `,
      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
    },
    primaryIcon: {
      backgroundColor: `${theme.palette.primary.main}15`,
      boxShadow: `
        0 2px 8px ${alpha(theme.palette.primary.main, 0.2)},
        0 1px 3px ${alpha(theme.palette.primary.main, 0.1)}
      `,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    secondaryIcon: {
      backgroundColor: `${theme.palette.secondary.main}15`,
      boxShadow: `
        0 2px 8px ${alpha(theme.palette.secondary.main, 0.2)},
        0 1px 3px ${alpha(theme.palette.secondary.main, 0.1)}
      `,
      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
    },
    infoIcon: {
      backgroundColor: `${theme.palette.info.main}15`,
      boxShadow: `
        0 2px 8px ${alpha(theme.palette.info.main, 0.2)},
        0 1px 3px ${alpha(theme.palette.info.main, 0.1)}
      `,
      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
    },
    sectionTitle: {
      fontWeight: 600,
      color: theme.palette.text.primary
    },
    overviewContainer: {
      p: 3, 
      pt: 0
    },
    overviewPaper: {
      p: 3, 
      backgroundColor: alpha(theme.palette.grey[500], 0.05),
      borderRadius: '16px',
      border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
      boxShadow: `
        0 4px 12px ${alpha(theme.palette.common.black, 0.05)},
        0 2px 6px ${alpha(theme.palette.common.black, 0.08)}
      `,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
        ${alpha(theme.palette.grey[50], 0.4)} 100%
      )`,
    },
    overviewTitle: {
      mb: 2, 
      fontWeight: 600,
      color: theme.palette.text.primary
    },
    overviewItem: {
      display: 'flex', 
      alignItems: 'center', 
      mb: 1.5
    },
    overviewItemLast: {
      display: 'flex', 
      alignItems: 'center', 
      mb: 2
    },
    overviewIconContainer: {
      width: 20,
      height: 20,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1.5
    },
    overviewPrimaryIcon: {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    overviewSecondaryIcon: {
      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    },
    overviewText: {
      fontWeight: 500
    },
    overviewGoal: {
      color: 'text.secondary',
      lineHeight: 1.5,
      fontStyle: 'italic'
    },
    loadingContainer: {
      display: 'flex', 
      justifyContent: 'center', 
      p: 4
    },
    alertContainer: {
      m: 2
    },
    backdrop: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 9,
    }
  };

  // Load lesson plan - prioritize local plan over database
  useEffect(() => {
    if (!open) {
      setParsedPlan(null);
      return;
    }

    // Priority 1: Use local lesson plan (Step3 scenario)
    if (lessonPlan) {
      setLoading(true);
      setError(null);

      try {
        let parsed: ParsedLessonPlan;
        
        if (typeof lessonPlan === 'string') {
          // Try to parse as JSON first, then as markdown
          try {
            const jsonPlan = JSON.parse(lessonPlan);
            parsed = LessonPlanJSONProcessor.processJSONObject(jsonPlan);
          } catch {
            parsed = LessonPlanParser.parse(lessonPlan);
          }
        } else {
          // Object format
          parsed = LessonPlanJSONProcessor.processJSONObject(lessonPlan);
        }

        setParsedPlan(parsed);
        setLoading(false);
      } catch (err) {
        console.error('❌ SLIDE INFO SIDEBAR: Error parsing local lesson plan:', err);
        setError('Failed to parse lesson plan');
        setLoading(false);
      }
      return;
    }

    // Priority 2: Load from database using lessonId (Materials page scenario)
    if (lessonId) {
      const loadLessonPlan = async () => {
        setLoading(true);
        setError(null);

        try {
          const plan = await lessonService.getLessonPlan(lessonId);
          
          if (plan) {
            setParsedPlan(plan);
          } else {
            setError('No lesson plan available for this lesson');
          }
        } catch (err) {
          console.error('❌ SLIDE INFO SIDEBAR: Error loading lesson plan from database:', err);
          setError('Failed to load lesson plan');
        } finally {
          setLoading(false);
        }
      };

      loadLessonPlan();
      return;
    }

    // No plan available
    setParsedPlan(null);
    setError(null);
  }, [lessonId, lessonPlan, open]);

  const currentSlide = parsedPlan?.slides?.[slideIndex] || null;

  const renderSlideInfo = () => {
    if (loading) {
      return (
        <Box sx={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={styles.alertContainer}>
          {error}
        </Alert>
      );
    }

    if (!currentSlide) {
      return (
        <Alert severity="info" sx={styles.alertContainer}>
          No information available for this slide
        </Alert>
      );
    }

    // Cast to extended slide type to access structure
    const extendedSlide = currentSlide as any;

    return (
      <Box>
        {/* Basic Slide Info */}
        <Box sx={styles.slideInfoContainer}>
          <Typography variant="h6" sx={styles.slideTitle}>
            {currentSlide.title}
          </Typography>
          <Box sx={styles.chipContainer}>
            <Chip
              label={currentSlide.type}
              color="primary"
              variant="outlined"
              size="small"
              sx={[styles.chip, styles.primaryChip]}
            />
            {currentSlide.goal && (
              <Chip
                label="Has Goal"
                color="secondary"
                variant="outlined"
                size="small"
                sx={[styles.chip, styles.secondaryChip]}
              />
            )}
          </Box>
          {currentSlide.goal && (
            <Paper sx={styles.goalPaper}>
              <Typography variant="body2" sx={styles.goalText}>
                {currentSlide.goal}
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider />

        {/* Slide Content using new modular components */}
        <Box sx={styles.slideContent}>
          {extendedSlide.structure ? (
            <Box>
              {/* Main Content Flow */}
              <Box sx={styles.sectionContainer}>
                {/* Combined Greeting and Main Content */}
                {(extendedSlide.structure.greeting || extendedSlide.structure.mainContent) && (
                  <Box sx={{ mb: 3 }}>
                    {/* Greeting */}
                    {extendedSlide.structure.greeting && (
                      <Box sx={{ mb: extendedSlide.structure.mainContent ? 2 : 0 }}>
                        <Box sx={styles.sectionHeader}>
                          <Box sx={[styles.sectionIcon, styles.warningIcon]}>
                            <SoundIcon size={16} color={theme.palette.warning.main} />
                          </Box>
                          <Typography variant="subtitle1" sx={styles.sectionTitle}>
                            Greeting
                          </Typography>
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
                <Box sx={styles.sectionContainer}>
                  <Box sx={styles.sectionHeader}>
                    <Box sx={[styles.sectionIcon, styles.primaryIcon]}>
                      <GameIcon size={16} color={theme.palette.primary.main} />
                    </Box>
                    <Typography variant="subtitle1" sx={styles.sectionTitle}>
                      Interactive Elements
                    </Typography>
                  </Box>
                  <SlideInteractions interactions={extendedSlide.structure.interactions} />
                </Box>
              )}

              {/* Activities */}
              {extendedSlide.structure.activities && extendedSlide.structure.activities.length > 0 && (
                <Box sx={styles.sectionContainer}>
                  <Box sx={styles.sectionHeader}>
                    <Box sx={[styles.sectionIcon, styles.secondaryIcon]}>
                      <Activity size={16} color={theme.palette.secondary.main} />
                    </Box>
                    <Typography variant="subtitle1" sx={styles.sectionTitle}>
                      Activities
                    </Typography>
                  </Box>
                  <SlideActivities activities={extendedSlide.structure.activities} />
                </Box>
              )}

              {/* Teacher Guidance */}
              {extendedSlide.structure.teacherGuidance && (
                <Box sx={styles.sectionContainer}>
                  <Box sx={styles.sectionHeader}>
                    <Box sx={[styles.sectionIcon, styles.infoIcon]}>
                      <TeacherIcon size={16} color={theme.palette.info.main} />
                    </Box>
                    <Typography variant="subtitle1" sx={styles.sectionTitle}>
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
          <Box sx={styles.overviewContainer}>
            <Paper sx={styles.overviewPaper}>
              <Typography variant="subtitle2" sx={styles.overviewTitle}>
                Lesson Overview
              </Typography>
              <Box sx={styles.overviewItem}>
                <Box sx={[styles.overviewIconContainer, styles.overviewPrimaryIcon]}>
                  <Users size={12} color={theme.palette.primary.main} />
                </Box>
                <Typography variant="body2" sx={styles.overviewText}>
                  {parsedPlan.metadata.targetAudience}
                </Typography>
              </Box>
              <Box sx={styles.overviewItemLast}>
                <Box sx={[styles.overviewIconContainer, styles.overviewSecondaryIcon]}>
                  <Clock size={12} color={theme.palette.secondary.main} />
                </Box>
                <Typography variant="body2" sx={styles.overviewText}>
                  {parsedPlan.metadata.duration}
                </Typography>
              </Box>
              <Typography variant="body2" sx={styles.overviewGoal}>
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
      {/* Backdrop - click outside to close */}
      <Box
        sx={styles.backdrop}
        onClick={onClose ? onClose : undefined}
      >
        {/* Sidebar container - prevent event bubbling */}
        <Box 
          sx={styles.container}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box sx={styles.header}>
            <Typography variant="h6" sx={styles.headerTitle}>
              Slide Information
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              sx={styles.closeButton}
            >
              <X size={20} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={styles.content}>
            {renderSlideInfo()}
          </Box>
        </Box>
      </Box>
    </Slide>
  );
};

export default SlideInfoSidebar;
