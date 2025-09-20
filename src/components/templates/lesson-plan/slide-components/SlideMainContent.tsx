'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface MainContentData {
  text: string;
  keyPoints?: string[];
  visualElements?: string[];
}

interface SlideMainContentProps {
  mainContent: MainContentData;
  showSayItPrompt?: boolean;
  showKeyPoints?: boolean;
  showVisualElements?: boolean;
}

const SlideMainContent: React.FC<SlideMainContentProps> = ({
  mainContent,
  showSayItPrompt = true,
  showKeyPoints = true,
  showVisualElements = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const hasKeyPoints = showKeyPoints && mainContent.keyPoints && mainContent.keyPoints.length > 0;
  const hasVisualElements = showVisualElements && mainContent.visualElements && mainContent.visualElements.length > 0;

  return (
    <Box>
      {/* Main Content Text */}
      <Typography 
        variant="h6"
        sx={{ 
          fontStyle: 'italic',
          color: theme.palette.primary.main,
          fontSize: '1.1rem',
          lineHeight: 1.6,
          mb: 1
        }}
      >
        "{mainContent.text}"
      </Typography>

      {/* Say it prompt */}
      {showSayItPrompt && (
        <Typography 
          variant="body2"
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            pl: 2,
            borderLeft: `2px solid ${theme.palette.secondary.light}`,
            fontStyle: 'italic',
            mb: (hasKeyPoints || hasVisualElements) ? 2 : 0
          }}
        >
          {t('lessonPlan.prompts.sayIt', 'Промовте')}
        </Typography>
      )}

      {/* Key Points and Visual Elements */}
      {(hasKeyPoints || hasVisualElements) && (
        <Box sx={{ 
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2,
          p: 2,
          borderLeft: `3px solid ${theme.palette.success.main}`,
          mt: 2
        }}>
          {/* Key Points */}
          {hasKeyPoints && (
            <Box sx={{ mb: hasVisualElements ? 2 : 0 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: theme.palette.success.main 
                }}
              >
                {t('lessonPlan.sections.keyPoints')}:
              </Typography>
              {mainContent.keyPoints!.map((point, index) => (
                <Typography 
                  key={index}
                  variant="body2"
                  sx={{ 
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    mb: index < mainContent.keyPoints!.length - 1 ? 0.5 : 0,
                    '&:before': { 
                      content: '"• "', 
                      color: theme.palette.success.main 
                    }
                  }}
                >
                  {point}
                </Typography>
              ))}
            </Box>
          )}
          
          {/* Visual Elements */}
          {hasVisualElements && (
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: theme.palette.warning.main 
                }}
              >
                {t('lessonPlan.sections.visualElements')}:
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: theme.palette.text.secondary
                }}
              >
                {mainContent.visualElements!.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SlideMainContent;
