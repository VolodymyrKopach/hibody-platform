'use client';

import React, { useState } from 'react';
import { Box, TextField, Typography, Popover } from '@mui/material';

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  presets = [
    // Reds & Pinks
    '#FF0000', // Red
    '#FF6B9D', // Pink
    '#E91E63', // Deep Pink
    '#FF69B4', // Hot Pink
    
    // Oranges & Yellows
    '#FF9800', // Orange
    '#FFA500', // Dark Orange
    '#FFC107', // Yellow
    '#FFEB3B', // Bright Yellow
    
    // Greens
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#00BCD4', // Cyan
    '#009688', // Teal
    
    // Blues & Purples
    '#2196F3', // Blue
    '#3F51B5', // Indigo
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    
    // Browns & Grays
    '#8D6E63', // Brown
    '#795548', // Dark Brown
    '#9E9E9E', // Gray
    '#000000', // Black
  ],
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenPresets = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePresets = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    handleClosePresets();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          onClick={handleOpenPresets}
          sx={{
            width: 60,
            height: 60,
            bgcolor: value,
            border: '2px solid #E0E0E0',
            borderRadius: 2,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            },
          }}
        />
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FF6B9D"
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Color presets in Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePresets}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 220 }}>
          <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
            Оберіть колір:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {presets.map((color, index) => (
              <Box
                key={`preset-${index}-${color}`}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: color,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: value === color ? '3px solid #000' : '2px solid #E0E0E0',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  },
                }}
              />
            ))}
          </Box>
          
          {/* Native color picker */}
          <Box sx={{ borderTop: '1px solid #E0E0E0', pt: 2 }}>
            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
              Або оберіть будь-який колір:
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 40,
                bgcolor: value,
                border: '2px solid #E0E0E0',
                borderRadius: 1,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  handleClosePresets();
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPickerField;

