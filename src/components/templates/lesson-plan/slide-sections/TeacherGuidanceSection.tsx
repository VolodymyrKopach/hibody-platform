import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  School as TeacherIcon,
  ExpandMore as ExpandIcon,
  Assignment as PrepIcon,
  PlayArrow as DeliveryIcon,
  Tune as AdaptIcon,
  Build as TroubleshootIcon,
  FiberManualRecord as BulletIcon
} from '@mui/icons-material';

interface TeacherGuidanceSectionProps {
  teacherGuidance: {
    preparation?: string[];
    delivery?: string[];
    adaptations?: string[];
    troubleshooting?: string[];
  };
}

const TeacherGuidanceSection: React.FC<TeacherGuidanceSectionProps> = ({ teacherGuidance }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const sections = [
    {
      key: 'preparation',
      title: 'Preparation',
      icon: <PrepIcon />,
      emoji: '📋',
      color: theme.palette.info.main,
      items: teacherGuidance.preparation || []
    },
    {
      key: 'delivery',
      title: 'Delivery Tips',
      icon: <DeliveryIcon />,
      emoji: '🎯',
      color: theme.palette.success.main,
      items: teacherGuidance.delivery || []
    },
    {
      key: 'adaptations',
      title: 'Adaptations',
      icon: <AdaptIcon />,
      emoji: '🔄',
      color: theme.palette.warning.main,
      items: teacherGuidance.adaptations || []
    },
    {
      key: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <TroubleshootIcon />,
      emoji: '🔧',
      color: theme.palette.error.main,
      items: teacherGuidance.troubleshooting || []
    }
  ].filter(section => section.items.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          backgroundColor: `${theme.palette.info.main}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TeacherIcon sx={{ fontSize: '1rem', color: theme.palette.info.main }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Teacher Guidance
        </Typography>
      </Box>

      {sections.map((section, sectionIndex) => (
        <Box key={section.key} sx={{ mb: sectionIndex < sections.length - 1 ? 2 : 0 }}>
          <Typography 
            variant="subtitle2"
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
              mb: 1
            }}
          >
            {section.title}
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            {section.items.map((item, index) => (
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
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TeacherGuidanceSection;
