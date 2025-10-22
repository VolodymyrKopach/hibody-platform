'use client';

import React from 'react';
import { Box, Typography, Stack, Tooltip, Paper, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { PATTERN_PRESETS } from '@/constants/backgroundPresets';
import { PageBackground } from '@/types/sidebar';

interface PatternBackgroundTabProps {
  pageData: any;
  onApplyBackground: (background: PageBackground) => void;
}

const PatternBackgroundTab: React.FC<PatternBackgroundTabProps> = ({
  pageData,
  onApplyBackground,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {PATTERN_PRESETS.map((pattern) => {
        const previewStyle = {
          background: pattern.backgroundColor,
          backgroundImage: pattern.css,
          backgroundSize: pattern.backgroundSize,
          backgroundPosition: pattern.backgroundPosition || '0 0',
        };
        
        return (
          <Tooltip key={pattern.pattern} title={pattern.name} placement="left">
            <Paper
              elevation={0}
              onClick={() => {
                onApplyBackground({
                  type: 'pattern',
                  pattern: {
                    name: pattern.pattern,
                    backgroundColor: pattern.backgroundColor,
                    patternColor: pattern.patternColor,
                    css: pattern.css,
                    backgroundSize: pattern.backgroundSize,
                    backgroundPosition: pattern.backgroundPosition,
                    scale: 1,
                    opacity: 100,
                  },
                  opacity: 100,
                });
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {/* Preview */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  ...previewStyle,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                  flexShrink: 0,
                }}
              />
              
              {/* Info */}
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
                  <span>{pattern.icon}</span>
                  <span>{pattern.name}</span>
                </Typography>
              </Box>
            </Paper>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

export default PatternBackgroundTab;

