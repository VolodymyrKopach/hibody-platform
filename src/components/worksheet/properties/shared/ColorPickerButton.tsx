'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Popover,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { Palette } from 'lucide-react';

interface ColorPickerButtonProps {
  value: string;
  onChange: (color: string) => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
  label?: string;
}

const PRESET_COLORS = [
  '#FFF9E6', // Soft Yellow
  '#FFE6E6', // Soft Pink
  '#E6F4FF', // Soft Blue
  '#E6FFF0', // Soft Green
  '#F3E6FF', // Soft Purple
  '#FFE6D9', // Soft Orange
  '#E6FFFF', // Soft Cyan
  '#FFEDE6', // Soft Coral
  '#F0F0F0', // Soft Gray
  '#FFF0E6', // Soft Peach
];

const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  value,
  onChange,
  size = 'medium',
  disabled = false,
  label,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [customColor, setCustomColor] = useState(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const open = Boolean(anchorEl);
  const buttonSize = size === 'small' ? 32 : 40;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        sx={{
          minWidth: buttonSize,
          width: buttonSize,
          height: buttonSize,
          padding: 0,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: value,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: value,
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${alpha(theme.palette.common.black, 0.1)} 25%, transparent 25%, transparent 75%, ${alpha(theme.palette.common.black, 0.1)} 75%, ${alpha(theme.palette.common.black, 0.1)}), linear-gradient(45deg, ${alpha(theme.palette.common.black, 0.1)} 25%, transparent 25%, transparent 75%, ${alpha(theme.palette.common.black, 0.1)} 75%, ${alpha(theme.palette.common.black, 0.1)})`,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px',
            opacity: 0.1,
            pointerEvents: 'none',
          },
        }}
        aria-label={label || 'Pick color'}
      >
        <Palette
          size={size === 'small' ? 14 : 16}
          style={{
            position: 'relative',
            zIndex: 1,
            color: theme.palette.getContrastText(value),
            opacity: 0.6,
          }}
        />
      </Button>

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
              mt: 1,
              p: 2,
              width: 240,
              boxShadow: theme.shadows[8],
            },
          },
        }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600}>
            Choose Color
          </Typography>

          {/* Preset Colors Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
            }}
          >
            {PRESET_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: color,
                  borderRadius: 1,
                  border: `2px solid ${
                    value === color ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[4],
                  },
                }}
              />
            ))}
          </Box>

          {/* Custom Color Input */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Custom Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                style={{
                  width: 48,
                  height: 38,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
              <TextField
                value={customColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                    setCustomColor(val);
                    if (val.length === 7) {
                      onChange(val);
                    }
                  }
                }}
                size="small"
                placeholder="#FFFFFF"
                sx={{ flex: 1 }}
                inputProps={{
                  style: { fontFamily: 'monospace', textTransform: 'uppercase' },
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

export default ColorPickerButton;

