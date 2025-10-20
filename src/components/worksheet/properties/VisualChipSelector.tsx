'use client';

import React, { ReactNode } from 'react';
import {
  Box,
  FormLabel,
  Chip,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';

export interface ChipOption<T = string> {
  value: T;
  label: string;
  emoji?: string;
  color?: string;
  tooltip?: {
    title: string;
    description: string;
    details?: string;
  };
}

interface VisualChipSelectorProps<T = string> {
  label: string;
  icon?: ReactNode;
  options: ChipOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  colorMode?: 'single' | 'multi'; // 'single' uses primary theme color, 'multi' uses individual colors
}

export function VisualChipSelector<T = string>({
  label,
  icon,
  options,
  value,
  onChange,
  colorMode = 'single',
}: VisualChipSelectorProps<T>) {
  const muiTheme = useTheme();

  const renderChip = (option: ChipOption<T>) => {
    const isSelected = value === option.value;
    const chipColor = colorMode === 'multi' && option.color 
      ? option.color 
      : muiTheme.palette.primary.main;

    const chipLabel = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {option.emoji && <span>{option.emoji}</span>}
        <span>{option.label}</span>
      </Box>
    );

    const chipElement = (
      <Chip
        label={chipLabel}
        onClick={() => onChange(option.value)}
        size="small"
        sx={{
          flexShrink: 0,
          height: 32,
          fontSize: '0.7rem',
          fontWeight: isSelected ? 700 : 500,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: isSelected 
            ? chipColor
            : alpha(muiTheme.palette.divider, 0.3),
          backgroundColor: isSelected 
            ? alpha(chipColor, 0.12)
            : 'transparent',
          color: isSelected 
            ? chipColor
            : muiTheme.palette.text.secondary,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: chipColor,
            backgroundColor: alpha(chipColor, 0.08),
            transform: 'translateY(-2px)',
          },
          '& .MuiChip-label': {
            px: 1.5,
          },
        }}
      />
    );

    // Wrap with tooltip if tooltip data is provided
    if (option.tooltip) {
      return (
        <Tooltip
          key={String(option.value)}
          title={
            <Box sx={{ textAlign: 'center', py: 0.5, px: 0.5 }}>
              <Box sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 0.5 }}>
                {option.tooltip.title}
              </Box>
              <Box sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                {option.tooltip.description}
              </Box>
              {option.tooltip.details && (
                <Box sx={{ fontSize: '0.65rem', opacity: 0.8, mt: 0.5 }}>
                  {option.tooltip.details}
                </Box>
              )}
            </Box>
          }
          arrow
          placement="top"
          enterDelay={300}
          leaveDelay={0}
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                maxWidth: 280,
              },
            },
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -4],
                },
              },
            ],
          }}
        >
          {chipElement}
        </Tooltip>
      );
    }

    return <Box key={String(option.value)}>{chipElement}</Box>;
  };

  return (
    <Box sx={{ overflow: 'visible' }}>
      {/* Header */}
      <FormLabel 
        sx={{ 
          fontWeight: 600, 
          fontSize: '0.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5, 
          mb: 1,
        }}
      >
        {icon}
        {label}
      </FormLabel>

      {/* Chips - horizontally scrollable */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          overflowY: 'visible',
          pb: 2,
          pt: 1,
          px: 0.25,
          mx: -0.25,
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            height: '3px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(muiTheme.palette.divider, 0.1),
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(muiTheme.palette.primary.main, 0.3),
            borderRadius: '2px',
            '&:hover': {
              background: alpha(muiTheme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        {options.map(renderChip)}
      </Box>
    </Box>
  );
}

