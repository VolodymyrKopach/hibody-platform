import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  SportsEsports as ActivityIcon,
  Schedule as TimeIcon,
  Inventory as MaterialIcon,
  EmojiEvents as OutcomeIcon,
  FiberManualRecord as BulletIcon
} from '@mui/icons-material';

interface ActivitiesSectionProps {
  activities: Array<{
    name: string;
    description: string;
    duration?: string;
    materials?: string[];
    expectedOutcome?: string;
  }>;
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ activities }) => {
  const theme = useTheme();

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          backgroundColor: `${theme.palette.secondary.main}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIcon sx={{ fontSize: '1rem', color: theme.palette.secondary.main }} />
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

      {activities.map((activity, index) => (
        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < activities.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography 
              variant="body1"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              {activity.name}
            </Typography>
            {activity.duration && (
              <Typography 
                variant="caption"
                sx={{ 
                  ml: 'auto',
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem'
                }}
              >
                ({activity.duration})
              </Typography>
            )}
          </Box>

          <Typography 
            variant="body2"
            sx={{ 
              mb: 1,
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            {activity.description}
          </Typography>

          {activity.materials && activity.materials.length > 0 && (
            <Typography 
              variant="body2"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                lineHeight: 1.5,
                mb: activity.expectedOutcome ? 1 : 0
              }}
            >
              <strong>Materials:</strong> {activity.materials.join(', ')}
            </Typography>
          )}

          {activity.expectedOutcome && (
            <Typography 
              variant="body2"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            >
              <strong>Expected outcome:</strong> {activity.expectedOutcome}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ActivitiesSection;
