'use client';

import React from 'react';
import { Box, Typography, IconButton, Tooltip, useTheme } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { alpha } from '@mui/material';
import { SidebarBaseProps } from '@/types/sidebar';

interface SidebarHeaderProps extends SidebarBaseProps {
  title: string;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, isOpen, onToggle }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: isOpen ? 2 : 1.5,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
      }}
    >
      {isOpen && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1rem', 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
      )}
      
      <Tooltip title={isOpen ? 'Collapse panel' : 'Expand panel'} placement="left">
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isOpen ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SidebarHeader;

