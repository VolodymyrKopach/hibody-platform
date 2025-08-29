import React, { useState } from 'react';
import {
  Box,
  Typography,
  Badge,
  Tooltip,
  Fab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  EmojiObjects as ObjectivesIcon,
  SlideshowOutlined as SlidesIcon,
  SportsEsports as GameIcon,
  Inventory as MaterialsIcon,
  Lightbulb as TipsIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ParsedLessonPlan, PlanComment } from '@/types/templates';
import { StandardCommentButton } from '@/components/ui';
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
  onExitEditMode
}) => {
  const theme = useTheme();

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Custom Tab Bar */}
      <Box sx={{ mb: 3 }}>
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
                onClick={() => onAddComment({
                  sectionType: 'general',
                  comment: '',
                  priority: 'medium',
                  status: 'pending'
                })}
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

      {/* Tab Content */}
      <Box sx={{ 
        minHeight: 200,
        py: 2
      }}>
        {tabs[activeTab]?.component}
      </Box>
    </Box>
  );
};

export default LessonPlanTabs;
