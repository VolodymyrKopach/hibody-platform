'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface TipBoxProps {
  text: string;
  type?: 'study' | 'memory' | 'practice' | 'cultural';
}

const TipBox: React.FC<TipBoxProps> = ({ text, type = 'study' }) => {
  const getIcon = () => {
    switch (type) {
      case 'memory': return '🧠';
      case 'practice': return '🎯';
      case 'cultural': return '🌍';
      default: return '💡';
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: '8px',
        background: '#F0F4FF',
        borderLeft: '4px solid #667EEA',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography sx={{ fontSize: '1.2rem' }}>{getIcon()}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#667EEA',
              mb: 0.5,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Tip
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

export default TipBox;

