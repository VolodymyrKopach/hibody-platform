import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Fade
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => {
  const theme = useTheme();

  if (!isTyping) return null;

  return (
    <Fade in>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '80%' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <Bot size={18} />
          </Avatar>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Друкую...
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

export default TypingIndicator; 