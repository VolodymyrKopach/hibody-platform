'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface GreetingData {
  text: string;
  action?: string;
  tone?: string;
}

interface SlideGreetingProps {
  greeting: GreetingData;
  showAction?: boolean;
  showTone?: boolean;
}

const SlideGreeting: React.FC<SlideGreetingProps> = ({
  greeting,
  showAction = true,
  showTone = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: greeting.action ? 1 : 0 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 1, 
        mb: greeting.action ? 1 : 0 
      }}>
        <Typography 
          variant="h6"
          sx={{ 
            fontStyle: 'italic',
            color: theme.palette.primary.main,
            fontSize: '1.1rem',
            lineHeight: 1.6,
            flex: 1
          }}
        >
          "{greeting.text}"
        </Typography>
        
        {showTone && greeting.tone && (
          <Typography 
            variant="caption"
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontStyle: 'normal',
              backgroundColor: theme.palette.grey[100],
              px: 1,
              py: 0.5,
              borderRadius: 1,
              textTransform: 'capitalize'
            }}
          >
            {t(`lessonPlan.tones.${greeting.tone}`, greeting.tone)}
          </Typography>
        )}
      </Box>
      
      {showAction && greeting.action && (
        <Typography 
          variant="body2"
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            pl: 2,
            borderLeft: `2px solid ${theme.palette.primary.light}`,
            fontStyle: 'italic'
          }}
        >
          {greeting.action}
        </Typography>
      )}
    </Box>
  );
};

export default SlideGreeting;
