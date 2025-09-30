'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface BodyTextProps {
  text: string;
  variant?: 'paragraph' | 'description' | 'example';
}

const BodyText: React.FC<BodyTextProps> = ({ text, variant = 'paragraph' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'description':
        return { fontSize: '13px', color: '#6B7280' };
      case 'example':
        return { fontSize: '13px', fontStyle: 'italic', color: '#4B5563' };
      default:
        return { fontSize: '14px', color: '#374151' };
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          ...getStyles(),
          lineHeight: 1.6,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default BodyText;

