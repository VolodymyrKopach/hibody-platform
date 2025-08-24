import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'enthusiastic': return theme.palette.warning.main;
      case 'calm': return theme.palette.info.main;
      case 'encouraging': return theme.palette.success.main;
      default: return theme.palette.primary.main;
    }
  };

  const getToneIcon = (tone?: string) => {
    switch (tone) {
      case 'enthusiastic': return '🎉';
      case 'calm': return '😌';
      case 'encouraging': return '💪';
      default: return '👋';
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        border: `1px solid ${theme.palette.warning.light}40`,
        backgroundColor: `${theme.palette.warning.light}08`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <WaveIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.warning.main,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            Greeting
          </Typography>
          {greeting.tone && (
            <Chip
              icon={<Typography sx={{ fontSize: '0.8rem' }}>{getToneIcon(greeting.tone)}</Typography>}
              label={greeting.tone}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${getToneColor(greeting.tone)}20`,
                color: getToneColor(greeting.tone),
                '& .MuiChip-icon': {
                  color: getToneColor(greeting.tone)
                }
              }}
            />
          )}
        </Box>

        <Typography 
          variant="body1"
          sx={{ 
            mb: greeting.action ? 1.5 : 0,
            fontStyle: 'italic',
            color: theme.palette.text.primary,
            fontSize: '1rem',
            lineHeight: 1.5
          }}
        >
          "{greeting.text}"
        </Typography>

        {greeting.action && (
          <Box 
            sx={{ 
              p: 1.5,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
              borderLeft: `3px solid ${theme.palette.warning.main}`
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              <strong>Action:</strong> {greeting.action}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GreetingSection;
