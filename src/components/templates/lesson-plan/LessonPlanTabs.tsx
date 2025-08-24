import React, { useState } from 'react';
import {
  Box,
  Typography,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  EmojiObjects as ObjectivesIcon,
  SlideshowOutlined as SlidesIcon,
  SportsEsports as GameIcon,
  Inventory as MaterialsIcon,
  Lightbulb as TipsIcon
} from '@mui/icons-material';
import { ParsedLessonPlan } from '@/types/templates';
import LessonObjectives from './LessonObjectives';
import SlideNavigation from './SlideNavigation';
import GameElements from './GameElements';
import MaterialsList from './MaterialsList';
import TeacherRecommendations from './TeacherRecommendations';

interface LessonPlanTabsProps {
  parsedPlan: ParsedLessonPlan;
}

interface TabData {
  id: string;
  label: string;
  icon: React.ReactElement;
  count: number;
  component: React.ReactElement;
}

const LessonPlanTabs: React.FC<LessonPlanTabsProps> = ({ parsedPlan }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Prepare tab data
  const tabs: TabData[] = [
    {
      id: 'objectives',
      label: 'Objectives',
      icon: <ObjectivesIcon />,
      count: parsedPlan.objectives.length,
      component: <LessonObjectives objectives={parsedPlan.objectives} />
    },
    {
      id: 'slides',
      label: 'Slides',
      icon: <SlidesIcon />,
      count: parsedPlan.slides.length,
      component: <SlideNavigation slides={parsedPlan.slides} />
    },
    {
      id: 'games',
      label: 'Games',
      icon: <GameIcon />,
      count: parsedPlan.gameElements.length,
      component: <GameElements gameElements={parsedPlan.gameElements} />
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: <MaterialsIcon />,
      count: parsedPlan.materials.length,
      component: <MaterialsList materials={parsedPlan.materials} />
    },
    {
      id: 'tips',
      label: 'Tips',
      icon: <TipsIcon />,
      count: parsedPlan.recommendations.length,
      component: <TeacherRecommendations recommendations={parsedPlan.recommendations} />
    }
  ].filter(tab => tab.count > 0); // Only show tabs with content

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
          p: 1,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          flexWrap: 'wrap'
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
