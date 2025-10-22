'use client';

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { PositionControlsProps } from '@/types/element-editors';

const PositionControls: React.FC<PositionControlsProps> = ({ x, y, onChange }) => {
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        Position
      </Typography>
      <Stack direction="row" spacing={1}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            X
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={Math.round(x)}
            onChange={(e) => onChange({ x: Number(e.target.value) })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Y
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={Math.round(y)}
            onChange={(e) => onChange({ y: Number(e.target.value) })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default PositionControls;

