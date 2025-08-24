import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  EmojiObjects as ObjectiveIcon
} from '@mui/icons-material';

interface LessonObjectivesProps {
  objectives: string[];
}

const LessonObjectives: React.FC<LessonObjectivesProps> = ({ objectives }) => {
  const theme = useTheme();

  if (objectives.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {objectives.map((objective, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1.5,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CheckIcon 
            sx={{ 
              color: theme.palette.success.main,
              fontSize: 20,
              mt: 0.2
            }} 
          />
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {objective}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default LessonObjectives;
