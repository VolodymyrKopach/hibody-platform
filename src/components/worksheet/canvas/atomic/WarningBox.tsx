'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface WarningBoxProps {
  text: string;
  type?: 'grammar' | 'time' | 'difficulty' | 'common-mistake';
}

const WarningBox: React.FC<WarningBoxProps> = ({ text, type = 'grammar' }) => {
  const getIcon = () => {
    switch (type) {
      case 'time': return '⏰';
      case 'difficulty': return '🔥';
      case 'common-mistake': return '❗';
      default: return '⚠️';
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: '8px',
        background: '#FFF7ED',
        borderLeft: '4px solid #EA580C',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem' }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#EA580C',
              mb: 0.5,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Warning
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

export default WarningBox;

