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
    <Card 
      sx={{ 
        mb: 2,
        border: `1px solid ${theme.palette.secondary.light}40`,
        backgroundColor: `${theme.palette.secondary.light}08`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ActivityIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.2rem' }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.secondary.main,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            Activities
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {activities.map((activity, index) => (
            <Grid item xs={12} key={index}>
              <Box 
                sx={{ 
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.secondary.main}30`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>🎯</Typography>
                  <Typography 
                    variant="subtitle2"
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: '1rem'
                    }}
                  >
                    {activity.name}
                  </Typography>
                  {activity.duration && (
                    <Chip
                      icon={<TimeIcon sx={{ fontSize: '0.8rem' }} />}
                      label={activity.duration}
                      size="small"
                      sx={{
                        ml: 'auto',
                        backgroundColor: `${theme.palette.info.main}20`,
                        color: theme.palette.info.main,
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': {
                          color: theme.palette.info.main
                        }
                      }}
                    />
                  )}
                </Box>

                <Typography 
                  variant="body2"
                  sx={{ 
                    mb: (activity.materials?.length || activity.expectedOutcome) ? 2 : 0,
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {activity.description}
                </Typography>

                {activity.materials && activity.materials.length > 0 && (
                  <Box sx={{ mb: activity.expectedOutcome ? 1.5 : 0 }}>
                    <Typography 
                      variant="caption"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 1
                      }}
                    >
                      <MaterialIcon sx={{ fontSize: '0.9rem' }} />
                      Materials Needed:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {activity.materials.map((material, materialIndex) => (
                        <Chip
                          key={materialIndex}
                          label={material}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.grey[100],
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {activity.expectedOutcome && (
                  <Box 
                    sx={{ 
                      p: 1.5,
                      backgroundColor: `${theme.palette.success.main}10`,
                      borderRadius: 1,
                      borderLeft: `3px solid ${theme.palette.success.main}`
                    }}
                  >
                    <Typography 
                      variant="caption"
                      sx={{ 
                        color: theme.palette.success.main,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5
                      }}
                    >
                      <OutcomeIcon sx={{ fontSize: '0.9rem' }} />
                      Expected Outcome:
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontSize: '0.8rem',
                        lineHeight: 1.4
                      }}
                    >
                      {activity.expectedOutcome}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ActivitiesSection;
