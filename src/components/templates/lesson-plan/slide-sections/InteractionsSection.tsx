import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  TouchApp as TouchIcon,
  VolumeUp as SoundIcon,
  DirectionsRun as MovementIcon,
  RecordVoiceOver as VerbalIcon,
  Visibility as VisualIcon,
  SportsEsports as InteractionIcon
} from '@mui/icons-material';

interface InteractionsSectionProps {
  interactions: Array<{
    type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
    description: string;
    instruction: string;
    feedback?: string;
  }>;
}

const InteractionsSection: React.FC<InteractionsSectionProps> = ({ interactions }) => {
  const theme = useTheme();

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'touch': return <TouchIcon />;
      case 'sound': return <SoundIcon />;
      case 'movement': return <MovementIcon />;
      case 'verbal': return <VerbalIcon />;
      case 'visual': return <VisualIcon />;
      default: return <InteractionIcon />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'touch': return theme.palette.info.main;
      case 'sound': return theme.palette.warning.main;
      case 'movement': return theme.palette.success.main;
      case 'verbal': return theme.palette.secondary.main;
      case 'visual': return theme.palette.primary.main;
      default: return theme.palette.grey[600];
    }
  };

  const getInteractionEmoji = (type: string) => {
    switch (type) {
      case 'touch': return '👆';
      case 'sound': return '🔊';
      case 'movement': return '🏃';
      case 'verbal': return '🗣️';
      case 'visual': return '👀';
      default: return '🎮';
    }
  };

  if (!interactions || interactions.length === 0) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        mb: 2,
        border: `1px solid ${theme.palette.success.light}40`,
        backgroundColor: `${theme.palette.success.light}08`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InteractionIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.success.main,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            Interactive Elements
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {interactions.map((interaction, index) => (
            <Grid item xs={12} key={index}>
              <Box 
                sx={{ 
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${getInteractionColor(interaction.type)}30`,
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>
                    {getInteractionEmoji(interaction.type)}
                  </Typography>
                  <Chip
                    label={interaction.type}
                    size="small"
                    sx={{
                      backgroundColor: `${getInteractionColor(interaction.type)}20`,
                      color: getInteractionColor(interaction.type),
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>

                <Typography 
                  variant="body2"
                  sx={{ 
                    mb: 1.5,
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {interaction.description}
                </Typography>

                <Box 
                  sx={{ 
                    p: 1.5,
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 1,
                    mb: interaction.feedback ? 1.5 : 0
                  }}
                >
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    👩‍🏫 Teacher Instruction:
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontSize: '0.8rem',
                      lineHeight: 1.4
                    }}
                  >
                    {interaction.instruction}
                  </Typography>
                </Box>

                {interaction.feedback && (
                  <Box 
                    sx={{ 
                      p: 1.5,
                      backgroundColor: `${getInteractionColor(interaction.type)}10`,
                      borderRadius: 1,
                      borderLeft: `3px solid ${getInteractionColor(interaction.type)}`
                    }}
                  >
                    <Typography 
                      variant="caption"
                      sx={{ 
                        color: getInteractionColor(interaction.type),
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      ✨ Expected Feedback:
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontSize: '0.8rem',
                        lineHeight: 1.4
                      }}
                    >
                      {interaction.feedback}
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

export default InteractionsSection;
