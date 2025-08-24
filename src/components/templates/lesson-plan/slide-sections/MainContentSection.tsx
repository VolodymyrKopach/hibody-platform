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
    <Card 
      sx={{ 
        mb: 2,
        border: `1px solid ${theme.palette.primary.light}40`,
        backgroundColor: `${theme.palette.primary.light}08`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BookIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            Main Content
          </Typography>
        </Box>

        <Typography 
          variant="body1"
          sx={{ 
            mb: (mainContent.keyPoints?.length || mainContent.visualElements?.length) ? 2 : 0,
            color: theme.palette.text.primary,
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          {mainContent.text}
        </Typography>

        {mainContent.keyPoints && mainContent.keyPoints.length > 0 && (
          <Box sx={{ mb: mainContent.visualElements?.length ? 2 : 0 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              🎯 Key Points:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {mainContent.keyPoints.map((point, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <BulletIcon 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontSize: 8
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={point}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.875rem', lineHeight: 1.4 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {mainContent.visualElements && mainContent.visualElements.length > 0 && (
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              👁️ Visual Elements:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mainContent.visualElements.map((element, index) => (
                <Chip
                  key={index}
                  icon={<VisualIcon sx={{ fontSize: '0.9rem' }} />}
                  label={element}
                  size="small"
                  sx={{
                    backgroundColor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MainContentSection;
