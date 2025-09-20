'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface InteractionData {
  type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
  description: string;
  instruction: string;
  feedback?: string;
}

interface SlideInteractionsProps {
  interactions: InteractionData[];
  showTypes?: boolean;
  showFeedback?: boolean;
}

const SlideInteractions: React.FC<SlideInteractionsProps> = ({
  interactions,
  showTypes = true,
  showFeedback = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!interactions || interactions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {interactions.map((interaction, index) => (
        <Box 
          key={index} 
          sx={{ 
            mb: 1.5, 
            p: 2, 
            backgroundColor: theme.palette.primary.main + '08',
            borderRadius: 2,
            borderLeft: `3px solid ${theme.palette.primary.main}`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 1, 
            mb: 0.5 
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                flex: 1 
              }}
            >
              {interaction.description}
            </Typography>
            
            {showTypes && interaction.type && (
              <Typography 
                variant="caption"
                sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: '0.7rem',
                  backgroundColor: theme.palette.primary.main + '20',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  textTransform: 'capitalize'
                }}
              >
                {t(`lessonPlan.interactionTypes.${interaction.type}`, interaction.type)}
              </Typography>
            )}
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: '0.8rem', 
              mb: (showFeedback && interaction.feedback) ? 0.5 : 0 
            }}
          >
            {interaction.instruction}
          </Typography>
          
          {showFeedback && interaction.feedback && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontSize: '0.8rem',
                fontStyle: 'italic',
                display: 'block'
              }}
            >
              {t('lessonPlan.sectionTitles.expectedOutcome')} {interaction.feedback}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default SlideInteractions;
