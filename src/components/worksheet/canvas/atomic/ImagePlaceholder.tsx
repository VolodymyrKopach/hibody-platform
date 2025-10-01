'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  caption?: string;
  width?: number;
  height?: number;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  caption = 'Image',
  width = 400,
  height = 300,
}) => {
  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          maxWidth: width,
          height: height,
          borderRadius: '8px',
          border: '2px dashed #D1D5DB',
          background: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <ImageIcon size={48} color="#9CA3AF" />
        <Typography
          sx={{
            fontSize: '14px',
            color: '#6B7280',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Image Placeholder
        </Typography>
      </Box>
      {caption && (
        <Typography
          sx={{
            fontSize: '12px',
            color: '#6B7280',
            textAlign: 'center',
            mt: 1,
            fontStyle: 'italic',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {caption}
        </Typography>
      )}
    </Box>
  );
};

export default ImagePlaceholder;

