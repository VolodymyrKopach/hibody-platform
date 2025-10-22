'use client';

import React from 'react';
import { Box, Typography, Stack, Tooltip, Paper, Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { TEMPLATE_PRESETS } from '@/constants/backgroundPresets';
import { PageBackground } from '@/types/sidebar';

interface TemplateBackgroundTabProps {
  pageData: any;
  onApplyBackground: (background: PageBackground) => void;
}

const TemplateBackgroundTab: React.FC<TemplateBackgroundTabProps> = ({
  pageData,
  onApplyBackground,
}) => {
  const theme = useTheme();

  const getPreviewStyle = (bg: PageBackground) => {
    if (bg.type === 'solid') {
      return { background: bg.color };
    } else if (bg.type === 'gradient' && bg.gradient) {
      const colors = bg.gradient.colors || [bg.gradient.from, bg.gradient.to];
      const cssDirection = bg.gradient.direction.replace(/-/g, ' ');
      return { background: `linear-gradient(${cssDirection}, ${colors.join(', ')})` };
    } else if (bg.type === 'pattern' && bg.pattern) {
      return {
        background: bg.pattern.backgroundColor,
        backgroundImage: bg.pattern.css,
        backgroundSize: bg.pattern.backgroundSize,
        backgroundPosition: bg.pattern.backgroundPosition || '0 0',
      };
    }
    return { background: 'white' };
  };

  return (
    <Stack spacing={1.5}>
      {TEMPLATE_PRESETS.map((template) => (
        <Tooltip key={template.name} title={template.description} placement="left">
          <Paper
            elevation={0}
            onClick={() => {
              onApplyBackground({
                ...template.background,
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
                ...getPreviewStyle(template.background),
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
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <span>{template.icon}</span>
                <span>{template.name}</span>
              </Typography>
              <Chip 
                label={template.category}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
          </Paper>
        </Tooltip>
      ))}
    </Stack>
  );
};

export default TemplateBackgroundTab;

