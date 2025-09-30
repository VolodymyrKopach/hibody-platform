'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface InstructionsBoxProps {
  text: string;
  icon?: string;
  type?: 'reading' | 'writing' | 'listening' | 'speaking' | 'general';
}

const InstructionsBox: React.FC<InstructionsBoxProps> = ({ 
  text, 
  icon,
  type = 'general' 
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'reading': return '📖';
      case 'writing': return '✏️';
      case 'listening': return '👂';
      case 'speaking': return '🗣️';
      default: return '📋';
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: '8px',
        background: '#EFF6FF',
        borderLeft: '4px solid #2563EB',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem' }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#2563EB',
              mb: 0.5,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Instructions
          </Typography>
          <Typography
            sx={{
              fontSize: '13px',
              color: '#374151',
              lineHeight: 1.5,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {text}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default InstructionsBox;

