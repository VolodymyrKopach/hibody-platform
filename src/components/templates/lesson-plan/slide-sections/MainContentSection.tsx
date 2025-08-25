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
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  MenuBook as BookIcon,
  FiberManualRecord as BulletIcon,
  Visibility as VisualIcon
} from '@mui/icons-material';

interface MainContentSectionProps {
  mainContent: {
    text: string;
    keyPoints?: string[];
    visualElements?: string[];
  };
}

const MainContentSection: React.FC<MainContentSectionProps> = ({ mainContent }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="body1"
        sx={{ 
          mb: (mainContent.keyPoints?.length || mainContent.visualElements?.length) ? 3 : 0,
          color: theme.palette.text.primary,
          fontSize: '1.1rem',
          lineHeight: 1.7,
          fontWeight: 400
        }}
      >
        {mainContent.text}
      </Typography>

      {mainContent.keyPoints && mainContent.keyPoints.length > 0 && (
        <Box sx={{ mb: mainContent.visualElements?.length ? 3 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              backgroundColor: `${theme.palette.success.main}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BulletIcon sx={{ fontSize: '0.75rem', color: theme.palette.success.main }} />
            </Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '0.9rem'
              }}
            >
              Key Points
            </Typography>
          </Box>
          <Box sx={{ pl: 2 }}>
            {mainContent.keyPoints.map((point, index) => (
              <Typography 
                key={index}
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem', 
                  lineHeight: 1.5,
                  color: theme.palette.text.secondary,
                  mb: 0.5,
                  '&:before': {
                    content: '"• "',
                    color: theme.palette.text.secondary
                  }
                }}
              >
                {point}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {mainContent.visualElements && mainContent.visualElements.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              backgroundColor: `${theme.palette.warning.main}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <VisualIcon sx={{ fontSize: '0.75rem', color: theme.palette.warning.main }} />
            </Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '0.9rem'
              }}
            >
              Visual Elements
            </Typography>
          </Box>
          <Typography 
            variant="body2"
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            {mainContent.visualElements.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MainContentSection;
