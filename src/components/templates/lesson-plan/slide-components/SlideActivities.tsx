'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface ActivityData {
  name: string;
  description: string;
  duration?: string;
  materials?: string[];
  expectedOutcome?: string;
}

interface SlideActivitiesProps {
  activities: ActivityData[];
  showDuration?: boolean;
  showMaterials?: boolean;
  showExpectedOutcome?: boolean;
}

const SlideActivities: React.FC<SlideActivitiesProps> = ({
  activities,
  showDuration = true,
  showMaterials = true,
  showExpectedOutcome = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <Box>
      {activities.map((activity, index) => (
        <Box 
          key={index} 
          sx={{ 
            mb: 1.5, 
            p: 2, 
            backgroundColor: theme.palette.secondary.main + '08',
            borderRadius: 2,
            borderLeft: `3px solid ${theme.palette.secondary.main}`
          }}
        >
          {/* Activity Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 0.5 
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600 
              }}
            >
              {activity.name}
            </Typography>
            
            {showDuration && activity.duration && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary 
                }}
              >
                {activity.duration}
              </Typography>
            )}
          </Box>
          
          {/* Activity Description */}
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.875rem', 
              mb: (
                (showMaterials && activity.materials?.length) || 
                (showExpectedOutcome && activity.expectedOutcome)
              ) ? 1 : 0 
            }}
          >
            {activity.description}
          </Typography>
          
          {/* Materials */}
          {showMaterials && activity.materials && activity.materials.length > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.8rem', 
                mb: (showExpectedOutcome && activity.expectedOutcome) ? 0.5 : 0 
              }}
            >
              {t('lessonPlan.sections.materials')} {activity.materials.join(', ')}
            </Typography>
          )}
          
          {/* Expected Outcome */}
          {showExpectedOutcome && activity.expectedOutcome && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.secondary.main, 
                fontSize: '0.8rem',
                fontStyle: 'italic',
                display: 'block'
              }}
            >
              {t('lessonPlan.sections.expectedOutcome')} {activity.expectedOutcome}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default SlideActivities;
