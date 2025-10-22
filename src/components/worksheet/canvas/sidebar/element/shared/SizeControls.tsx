'use client';

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { SizeControlsProps } from '@/types/element-editors';

const SizeControls: React.FC<SizeControlsProps> = ({ 
  width, 
  height, 
  onChange,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight
}) => {
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        Size
      </Typography>
      <Stack direction="row" spacing={1}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Width
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={Math.round(width)}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (minWidth && value < minWidth) return;
              if (maxWidth && value > maxWidth) return;
              onChange({ width: value });
            }}
            inputProps={{ min: minWidth, max: maxWidth }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Height
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={Math.round(height)}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (minHeight && value < minHeight) return;
              if (maxHeight && value > maxHeight) return;
              onChange({ height: value });
            }}
            inputProps={{ min: minHeight, max: maxHeight }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SizeControls;

