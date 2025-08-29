import React, { useState } from 'react';
import {
  Box,
  Typography,
  Badge,
  Tooltip,
  Fab,
  Collapse,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  EmojiObjects as ObjectivesIcon,
  SlideshowOutlined as SlidesIcon,
  SportsEsports as GameIcon,
  Inventory as MaterialsIcon,
  Lightbulb as TipsIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { ParsedLessonPlan, PlanComment, PlanChanges } from '@/types/templates';
import { StandardCommentButton } from '@/components/ui';
import { CommentPanel, CommentDialog } from '@/components/templates/plan-editing';
import LessonObjectives from './LessonObjectives';
import SlideNavigation from './SlideNavigation';
import GameElements from './GameElements';
import MaterialsList from './MaterialsList';
import TeacherRecommendations from './TeacherRecommendations';

interface LessonPlanTabsProps {
  parsedPlan: ParsedLessonPlan;
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
  onEnterEditMode?: () => void;
  onExitEditMode?: () => void;
  // New props for CommentPanel integration
  planChanges?: PlanChanges | null;
  showCommentResults?: boolean;
  onProcessComments?: () => void;
  onRemoveComment?: (commentId: string) => void;
  onClearAllComments?: () => void;
  onAddMoreComments?: () => void;
  isProcessingComments?: boolean;
}

interface TabData {
  id: string;
  label: string;
  icon: React.ReactElement;
  count: number;
  component: React.ReactElement;
}

const LessonPlanTabs: React.FC<LessonPlanTabsProps> = ({ 
  parsedPlan, 
  isEditingMode = false,
  onAddComment,
  pendingComments = [],
  onEnterEditMode,
  onExitEditMode,
  planChanges,
  showCommentResults = false,
  onProcessComments,
  onRemoveComment,
  onClearAllComments,
  onAddMoreComments,
  isProcessingComments = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // State for comment dialog
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  // Comment dialog handlers
  const handleOpenCommentDialog = () => {
    setShowCommentDialog(true);
  };

  const handleCloseCommentDialog = () => {
    setShowCommentDialog(false);
  };

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment(comment);
    }
    setShowCommentDialog(false);
  };

  // Prepare tab data
  const tabs: TabData[] = [
    {
      id: 'objectives',
      label: 'Objectives',
      icon: <ObjectivesIcon />,
      count: parsedPlan.objectives.length,
      component: (
        <LessonObjectives 
          objectives={parsedPlan.objectives}
          isEditingMode={isEditingMode}
          onAddComment={onAddComment}
          pendingComments={pendingComments}
        />
      )
    },
    {
      id: 'slides',
      label: 'Slides',
      icon: <SlidesIcon />,
      count: parsedPlan.slides.length,
      component: (
        <SlideNavigation 
          slides={parsedPlan.slides}
          isEditingMode={isEditingMode}
          onAddComment={onAddComment}
          pendingComments={pendingComments}
        />
      )
    },
    {
      id: 'games',
      label: 'Games',
      icon: <GameIcon />,
      count: parsedPlan.gameElements.length,
      component: (
        <GameElements 
          gameElements={parsedPlan.gameElements}
          isEditingMode={isEditingMode}
          onAddComment={onAddComment}
          pendingComments={pendingComments}
        />
      )
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: <MaterialsIcon />,
      count: parsedPlan.materials.length,
      component: (
        <MaterialsList 
          materials={parsedPlan.materials}
          isEditingMode={isEditingMode}
          onAddComment={onAddComment}
          pendingComments={pendingComments}
        />
      )
    },
    {
      id: 'tips',
      label: 'Tips',
      icon: <TipsIcon />,
      count: parsedPlan.recommendations.length,
      component: (
        <TeacherRecommendations 
          recommendations={parsedPlan.recommendations}
          isEditingMode={isEditingMode}
          onAddComment={onAddComment}
          pendingComments={pendingComments}
        />
      )
    }
  ].filter(tab => tab.count > 0); // Only show tabs with content

  // Find the index of the "slides" tab, fallback to 0 if not found
  const defaultTabIndex = tabs.findIndex(tab => tab.id === 'slides');
  const [activeTab, setActiveTab] = useState(defaultTabIndex !== -1 ? defaultTabIndex : 0);
  
  // State for collapsing comment panel
  const [isCommentPanelExpanded, setIsCommentPanelExpanded] = useState(true);
  const [showDetailedChanges, setShowDetailedChanges] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Custom Tab Bar */}
      <Box sx={{ mb: (pendingComments.length > 0 || showCommentResults || (planChanges && planChanges.changes && planChanges.changes.length > 0)) ? 2 : 3 }}>
        <Box sx={{ 
          display: 'flex',
          gap: 1,
          py: 1,
          pl: 1,
          pr: 2,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Tabs */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            flex: 1
          }}>
            {tabs.map((tab, index) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(index)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 2,
                  minWidth: 80,
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: activeTab === index ? theme.palette.primary.main : 'transparent',
                  color: activeTab === index ? 'white' : theme.palette.text.secondary,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: activeTab === index ? theme.palette.primary.dark : theme.palette.grey[200],
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Badge 
                  badgeContent={tab.count} 
                  color={activeTab === index ? 'secondary' : 'primary'}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 16,
                      minWidth: 16,
                      backgroundColor: activeTab === index ? theme.palette.secondary.main : theme.palette.primary.main
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {tab.icon}
                  </Box>
                </Badge>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {tab.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Edit Mode Controls */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {/* Comment Button - Always visible in edit mode */}
            {isEditingMode && onAddComment && (
              <StandardCommentButton
                onClick={handleOpenCommentDialog}
                tooltip="Add Comment to Plan"
              />
            )}

            {/* Edit Mode Toggle */}
            <Tooltip 
              title={isEditingMode ? 'Exit Edit Mode' : 'Edit Plan'}
              placement="left"
            >
              <Fab
                size="small"
                color={isEditingMode ? 'secondary' : 'primary'}
                onClick={isEditingMode ? onExitEditMode : onEnterEditMode}
                sx={{
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isEditingMode ? <CloseIcon /> : <EditIcon />}
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Comment Panel - Separate block */}
      {(pendingComments.length > 0 || showCommentResults || (planChanges && planChanges.changes && planChanges.changes.length > 0)) && (
        <Box sx={{ 
          mb: 3,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          {/* Collapsible Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: isCommentPanelExpanded ? theme.palette.grey[50] : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.grey[200]
            }
          }}
          onClick={() => setIsCommentPanelExpanded(!isCommentPanelExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: (planChanges && planChanges.changes && planChanges.changes.length > 0) ? theme.palette.success.light + '20' : theme.palette.primary.light + '20'
              }}>
                <CommentIcon 
                  sx={{ 
                    fontSize: '1.1rem',
                    color: (planChanges && planChanges.changes && planChanges.changes.length > 0) ? theme.palette.success.main : theme.palette.primary.main
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2
                  }}
                >
                  {(planChanges && planChanges.changes && planChanges.changes.length > 0) ? t('planChanges.title') : t('editMode.comments')}
                </Typography>
                {(pendingComments.length > 0 || (planChanges && planChanges.changes && planChanges.changes.length > 0)) && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem'
                    }}
                  >
                    {(planChanges && planChanges.changes && planChanges.changes.length > 0)
                      ? `${planChanges.summary.totalChanges} changes in ${planChanges.summary.sectionsModified} sections`
                      : `${pendingComments.length} pending comments`
                    }
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Action buttons in header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(planChanges && planChanges.changes && planChanges.changes.length > 0) && (
                <Tooltip title={showDetailedChanges ? t('planChanges.hideDetails') : t('planChanges.showDetails')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetailedChanges(!showDetailedChanges);
                    }}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: theme.palette.action.hover,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {showDetailedChanges ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={isCommentPanelExpanded ? t('common.collapse') : t('common.expand')}>
                <IconButton 
                size="small"
                sx={{
                  ml: 1,
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.hover,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {isCommentPanelExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
            </Box>
          </Box>

          {/* Collapsible Content */}
          <Collapse in={isCommentPanelExpanded}>
            <Box sx={{
              maxHeight: 300,
              overflowY: 'auto',
              backgroundColor: theme.palette.background.paper,
              mx: 1,
              mb: 1,
              borderRadius: 1
            }}>
              <CommentPanel
                comments={pendingComments}
                isProcessing={isProcessingComments}
                onProcessComments={onProcessComments || (() => {})}
                onRemoveComment={onRemoveComment || (() => {})}
                onClearAllComments={onClearAllComments || (() => {})}
                planChanges={planChanges}
                showResults={showCommentResults}
                onAddMoreComments={onAddMoreComments}
                showDetailedChanges={showDetailedChanges}
                isEditingMode={isEditingMode}
                onToggleDetails={() => setShowDetailedChanges(!showDetailedChanges)}
              />
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Tab Content */}
      <Box sx={{ 
        minHeight: 200,
        py: 2
      }}>
        {tabs[activeTab]?.component}
      </Box>

      {/* Comment Dialog */}
      <CommentDialog
        open={showCommentDialog}
        onClose={handleCloseCommentDialog}
        onSubmit={handleSubmitComment}
        initialSection="general"
        title="Add Comment to Plan"
        totalSlides={parsedPlan.slides.length}
      />
    </Box>
  );
};

export default LessonPlanTabs;
