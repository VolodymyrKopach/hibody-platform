'use client';

import React, { useState } from 'react';
import { Box, Popover, IconButton, Stack, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  icon: React.ReactNode;
  label: string;
  colorType?: 'text' | 'highlight';
}

const PRESET_COLORS = {
  text: [
    '#000000', // Black
    '#374151', // Dark Gray
    '#6B7280', // Gray
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Green
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#FFFFFF', // White
  ],
  highlight: [
    'transparent', // No highlight
    '#FEF3C7', // Light Yellow
    '#FFEB3B', // Yellow
    '#FDE68A', // Amber
    '#FED7AA', // Orange
    '#FECACA', // Red
    '#FCE7F3', // Pink
    '#E9D5FF', // Purple
    '#DBEAFE', // Blue
    '#D1FAE5', // Green
    '#CCFBF1', // Cyan
    '#F3F4F6', // Gray
  ],
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  icon,
  label,
  colorType = 'text',
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [customColor, setCustomColor] = useState(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    // Don't close immediately - let user see the change
    // handleClose(); // Commented out so popover stays open
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  const open = Boolean(anchorEl);
  const presetColors = PRESET_COLORS[colorType];

  return (
    <>
      <IconButton
        size="small"
        onMouseDown={handleClick}
        sx={{
          width: 32,
          height: 32,
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          color: colorType === 'text' ? value : 'text.primary',
          backgroundColor: colorType === 'highlight' ? value : 'transparent',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: colorType === 'highlight' ? value : alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        {icon}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: 240,
              boxShadow: 3,
            },
            'data-color-picker-popover': 'true',
          },
        }}
        disablePortal={false}
        // Keep popover open until user clicks outside or selects color
        disableRestoreFocus
        disableAutoFocus
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>

          {/* Preset colors grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1.5,
            }}
          >
            {presetColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  backgroundColor: color === 'transparent' ? 'white' : color,
                  border: '2px solid',
                  borderColor: value === color ? theme.palette.primary.main : 'divider',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    borderColor: theme.palette.primary.main,
                  },
                  ...(color === 'transparent' && {
                    background: `
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)
                    `,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }),
                }}
              >
                {value === color && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color === '#000000' || color === '#374151' ? 'white' : 'black',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Custom color picker */}
          <Box>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
              Custom Color
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="label"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '6px',
                  backgroundColor: customColor === 'transparent' ? 'white' : customColor,
                  border: '2px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  ...(customColor === 'transparent' && {
                    background: `
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)
                    `,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }),
                }}
              >
                <input
                  type="color"
                  value={customColor === 'transparent' ? '#FFFFFF' : customColor}
                  onChange={handleCustomColorChange}
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
              <Box
                sx={{
                  flex: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'text.primary',
                }}
              >
                {customColor}
              </Box>
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

