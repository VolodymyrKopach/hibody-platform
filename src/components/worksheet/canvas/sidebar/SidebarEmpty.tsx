'use client';

import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Settings } from 'lucide-react';
import { alpha } from '@mui/material';
import { SidebarBaseProps } from '@/types/sidebar';
import SidebarHeader from './SidebarHeader';

const SidebarEmpty: React.FC<SidebarBaseProps> = ({ isOpen, onToggle }) => {
  const theme = useTheme();
  const sidebarWidth = isOpen ? 320 : 72;

  return (
    <Paper
      elevation={0}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        height: '100%',
        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.98)',
        overflow: 'hidden',
      }}
    >
      <SidebarHeader title="Properties" isOpen={isOpen} onToggle={onToggle} />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: isOpen ? 3 : 1 }}>
        {isOpen ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>👈</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Nothing selected
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select a page or element to edit
            </Typography>
          </Box>
        ) : (
          <Settings size={20} color={theme.palette.text.disabled} />
        )}
      </Box>
    </Paper>
  );
};

export default SidebarEmpty;

