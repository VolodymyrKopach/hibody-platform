import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  RecordVoiceOver as WaveIcon
} from '@mui/icons-material';

interface GreetingSectionProps {
  greeting: {
    text: string;
    action?: string;
    tone?: string;
  };
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ greeting }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          backgroundColor: `${theme.palette.warning.main}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <WaveIcon sx={{ fontSize: '1rem', color: theme.palette.warning.main }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {t('lessonPlan.sections.greeting', 'Greeting')}
        </Typography>
        {greeting.tone && (
          <Typography 
            variant="caption"
            sx={{ 
              ml: 'auto',
              color: theme.palette.text.secondary,
              fontSize: '0.75rem'
            }}
          >
            ({t(`lessonPlan.tones.${greeting.tone}`, greeting.tone)})
          </Typography>
        )}
      </Box>

      <Typography 
        variant="body1"
        sx={{ 
          mb: greeting.action ? 2 : 0,
          fontStyle: 'italic',
          color: theme.palette.text.primary,
          fontSize: '1.1rem',
          lineHeight: 1.7,
          fontWeight: 400
        }}
      >
        "{greeting.text}"
      </Typography>

      {greeting.action && (
        <Typography 
          variant="body2"
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}
        >
          <strong>{t('lessonPlan.sections.action', 'Action')}:</strong> {greeting.action}
        </Typography>
      )}
    </Box>
  );
};

export default GreetingSection;
