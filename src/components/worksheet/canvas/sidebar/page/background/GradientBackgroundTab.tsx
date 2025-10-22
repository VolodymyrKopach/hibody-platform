'use client';

import React from 'react';
import { Box, Typography, Stack, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Check } from 'lucide-react';
import { GRADIENT_PRESETS } from '@/constants/backgroundPresets';
import { PageBackground } from '@/types/sidebar';

interface GradientBackgroundTabProps {
  pageData: any;
  onApplyBackground: (background: PageBackground) => void;
}

const GradientBackgroundTab: React.FC<GradientBackgroundTabProps> = ({
  pageData,
  onApplyBackground,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {GRADIENT_PRESETS.map((gradient, index) => {
        const colors = gradient.colors || [gradient.from, gradient.to];
        const cssDirection = gradient.direction.replace(/-/g, ' ');
        const gradientStyle = `linear-gradient(${cssDirection}, ${colors.join(', ')})`;
        const isCurrentBackground = pageData?.background?.type === 'gradient' && 
          pageData?.background?.gradient?.from === gradient.from &&
          pageData?.background?.gradient?.to === gradient.to;
        
        return (
          <Tooltip key={index} title={gradient.name} placement="left">
            <Box
              onClick={() => {
                onApplyBackground({
                  type: 'gradient',
                  gradient: {
                    from: gradient.from,
                    to: gradient.to,
                    colors: gradient.colors,
                    direction: gradient.direction,
                  },
                  opacity: 100,
                });
              }}
              sx={{
                width: '100%',
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1.5,
                cursor: 'pointer',
                border: isCurrentBackground 
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {/* Gradient Preview */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  background: gradientStyle,
                  flexShrink: 0,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              />
              
              {/* Name */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <span>{gradient.icon}</span>
                  <span>{gradient.name}</span>
                </Typography>
              </Box>
              
              {/* Check Icon */}
              {isCurrentBackground && (
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} />
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

export default GradientBackgroundTab;

