'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SlideFallbackContentProps {
  content: string;
  allowHtml?: boolean;
  showPlaceholder?: boolean;
  placeholderText?: string;
}

const SlideFallbackContent: React.FC<SlideFallbackContentProps> = ({
  content,
  allowHtml = true,
  showPlaceholder = true,
  placeholderText = 'No content available for this slide.'
}) => {
  const theme = useTheme();

  const displayContent = content || (showPlaceholder ? placeholderText : '');

  if (!displayContent) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: theme.palette.grey[50],
        borderRadius: 2,
        p: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {allowHtml && content && content.includes('<') ? (
        /* Render HTML content */
        <Box
          sx={{
            '& *': {
              lineHeight: 1.6,
              color: theme.palette.text.primary,
              fontSize: '1rem'
            },
            '& .hero-image': {
              width: '100%',
              height: '200px',
              backgroundColor: theme.palette.grey[200],
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.grey[300]
              }
            },
            '& .main-heading': {
              fontSize: '1.5rem',
              fontWeight: 600,
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 2
            }
          }}
          dangerouslySetInnerHTML={{ 
            __html: content.replace(/onclick="[^"]*"/g, '') // Remove onclick handlers for security
          }}
        />
      ) : (
        /* Render plain text content */
        <Typography 
          variant="body1"
          sx={{ 
            lineHeight: 1.6,
            color: content ? theme.palette.text.primary : theme.palette.text.secondary,
            whiteSpace: 'pre-wrap',
            fontSize: '1rem',
            fontStyle: content ? 'normal' : 'italic'
          }}
        >
          {displayContent}
        </Typography>
      )}
    </Box>
  );
};

export default SlideFallbackContent;
