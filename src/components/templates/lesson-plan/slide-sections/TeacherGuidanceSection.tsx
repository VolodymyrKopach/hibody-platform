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
    <Card 
      sx={{ 
        mb: 2,
        border: `1px solid ${theme.palette.info.light}40`,
        backgroundColor: `${theme.palette.info.light}08`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TeacherIcon sx={{ color: theme.palette.info.main, fontSize: '1.2rem' }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.info.main,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            Teacher Guidance
          </Typography>
          <Chip
            label={`${sections.length} sections`}
            size="small"
            sx={{
              ml: 'auto',
              backgroundColor: `${theme.palette.info.main}20`,
              color: theme.palette.info.main,
              fontSize: '0.7rem'
            }}
          />
        </Box>

        {sections.map((section) => (
          <Accordion
            key={section.key}
            expanded={expanded === section.key}
            onChange={handleChange(section.key)}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: `1px solid ${section.color}30`,
              borderRadius: '8px !important',
              '&.Mui-expanded': {
                margin: '0 0 8px 0'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandIcon sx={{ color: section.color }} />}
              sx={{
                backgroundColor: `${section.color}10`,
                borderRadius: expanded === section.key ? '8px 8px 0 0' : '8px',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1rem' }}>{section.emoji}</Typography>
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    fontWeight: 600,
                    color: section.color,
                    fontSize: '0.875rem'
                  }}
                >
                  {section.title}
                </Typography>
                <Chip
                  label={section.items.length}
                  size="small"
                  sx={{
                    height: 20,
                    backgroundColor: `${section.color}20`,
                    color: section.color,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1, pb: 2 }}>
              <List dense sx={{ py: 0 }}>
                {section.items.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <BulletIcon 
                        sx={{ 
                          color: section.color,
                          fontSize: 8
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { 
                          fontSize: '0.875rem', 
                          lineHeight: 1.5,
                          color: theme.palette.text.primary
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

export default TeacherGuidanceSection;
