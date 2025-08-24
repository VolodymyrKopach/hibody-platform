import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { ParsedSlide } from '@/types/templates';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';

interface SlideCardProps {
  slide: ParsedSlide;
  isExpanded?: boolean;
}

const SlideCard: React.FC<SlideCardProps> = ({ slide, isExpanded = false }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(isExpanded);
  const typeConfig = LessonPlanJSONProcessor.getSlideTypeConfig(slide.type);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Box 
      sx={{ 
        mb: 2,
        border: `1px solid ${typeConfig.color}40`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          borderColor: typeConfig.color,
          boxShadow: 1
        }
      }}
    >
      {/* Slide Header */}
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          p: 2,
          cursor: 'pointer'
        }}
        onClick={handleExpandClick}
      >
        {/* Slide Number & Type */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          <Box 
            sx={{ 
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: typeConfig.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700
            }}
          >
            {slide.slideNumber}
          </Box>
          <Typography sx={{ fontSize: '1rem' }}>
            {typeConfig.icon}
          </Typography>
        </Box>

        {/* Slide Info */}
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5
            }}
          >
            {slide.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            {slide.goal}
          </Typography>
        </Box>

        {/* Expand Button */}
        <IconButton size="small" sx={{ color: typeConfig.color }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Slide Content (Collapsible) */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <Box 
            sx={{ 
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                lineHeight: 1.5,
                color: theme.palette.text.primary,
                whiteSpace: 'pre-wrap'
              }}
            >
              {slide.content || 'No content available for this slide.'}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SlideCard;
