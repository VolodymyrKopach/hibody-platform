'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface TeacherGuidanceData {
  preparation?: string[];
  delivery?: string[];
  adaptations?: string[];
  troubleshooting?: string[];
}

interface SlideTeacherGuidanceProps {
  teacherGuidance: TeacherGuidanceData;
  showSectionTitles?: boolean;
}

const SlideTeacherGuidance: React.FC<SlideTeacherGuidanceProps> = ({
  teacherGuidance,
  showSectionTitles = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Check if there's any content to display
  const hasContent = Object.values(teacherGuidance).some(
    items => items && items.length > 0
  );

  if (!hasContent) {
    return null;
  }

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.info.main + '08',
      borderRadius: 2,
      p: 2,
      borderLeft: `3px solid ${theme.palette.info.main}`
    }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.info.main,
          mb: 1,
          fontSize: '0.875rem'
        }}
      >
        {t('lessonPlan.sectionTitles.teacherNotes')}
      </Typography>
      
      {Object.entries(teacherGuidance).map(([key, items]) => 
        items && items.length > 0 ? (
          <Box key={key} sx={{ mb: 1 }}>
            {showSectionTitles && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'capitalize', 
                  fontSize: '0.75rem',
                  color: theme.palette.info.main
                }}
              >
                {t(`lessonPlan.sectionTitles.${key}`, `${key}:`)}
              </Typography>
            )}
            
            {items.map((item, index) => (
              <Typography 
                key={index}
                variant="caption"
                sx={{ 
                  display: 'block',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  ml: showSectionTitles ? 1 : 0,
                  color: theme.palette.text.secondary,
                  '&:before': { 
                    content: '"• "',
                    color: theme.palette.info.main
                  }
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        ) : null
      )}
    </Box>
  );
};

export default SlideTeacherGuidance;
