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
  Lightbulb as LightbulbIcon,
  TipsAndUpdates as TipIcon
} from '@mui/icons-material';

interface TeacherRecommendationsProps {
  recommendations: string[];
}

const TeacherRecommendations: React.FC<TeacherRecommendationsProps> = ({ recommendations }) => {
  const theme = useTheme();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {recommendations.map((recommendation, index) => (
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
          <TipIcon 
            sx={{ 
              color: theme.palette.warning.main,
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
            {recommendation}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default TeacherRecommendations;
