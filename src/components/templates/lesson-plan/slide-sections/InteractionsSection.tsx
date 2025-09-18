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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          backgroundColor: `${theme.palette.primary.main}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <InteractionIcon sx={{ fontSize: '1rem', color: theme.palette.primary.main }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {t('lessonPlan.sections.interactiveElements')}
        </Typography>
      </Box>

      {interactions.map((interaction, index) => (
        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < interactions.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
          <Typography 
            variant="body1"
            sx={{ 
              mb: 1,
              color: theme.palette.text.primary,
              fontWeight: 500
            }}
          >
            {interaction.description}
          </Typography>

          <Typography 
            variant="body2"
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              lineHeight: 1.5,
              mb: interaction.feedback ? 1 : 0
            }}
          >
              <strong>{t('lessonPlan.sections.instructions')}</strong> {interaction.instruction}
          </Typography>

          {interaction.feedback && (
            <Typography 
              variant="body2"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            >
              <strong>{t('lessonPlan.sections.expectedOutcome')}</strong> {interaction.feedback}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default InteractionsSection;
