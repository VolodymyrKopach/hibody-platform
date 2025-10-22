'use client';

import React from 'react';
import { Box, Typography, TextField, Stack, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { BACKGROUND_PRESETS } from '@/constants/backgroundPresets';
import { PageBackground } from '@/types/sidebar';

interface ColorBackgroundTabProps {
  pageData: any;
  customColor: string;
  onCustomColorChange: (color: string) => void;
  onApplyBackground: (background: PageBackground) => void;
}

const ColorBackgroundTab: React.FC<ColorBackgroundTabProps> = ({
  pageData,
  customColor,
  onCustomColorChange,
  onApplyBackground,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {/* Color Presets */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {BACKGROUND_PRESETS.map((preset) => (
          <Tooltip key={preset.color} title={preset.name} placement="top">
            <Box
              onClick={() => {
                onApplyBackground({
                  type: 'solid',
                  color: preset.color,
                  opacity: 100,
                });
              }}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                backgroundColor: preset.color,
                border: `2px solid ${
                  pageData?.background?.color === preset.color
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.2)
                }`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              {preset.icon}
            </Box>
          </Tooltip>
        ))}
      </Stack>

      {/* Custom Color Input */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
          Custom Color
        </Typography>
        <TextField
          fullWidth
          size="small"
          type="color"
          value={customColor}
          onChange={(e) => onCustomColorChange(e.target.value)}
          onBlur={() => {
            onApplyBackground({
              type: 'solid',
              color: customColor,
              opacity: 100,
            });
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: 40,
            },
            '& input[type="color"]': {
              cursor: 'pointer',
              height: 30,
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default ColorBackgroundTab;

