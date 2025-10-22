'use client';

import React from 'react';
import { Box, Button, Paper, Typography, alpha, useTheme } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'info' | 'warning' | 'success';
  size?: 'small' | 'medium' | 'large';
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  size = 'medium',
}) => {
  const theme = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'info':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const variantColor = getVariantColor();

  const padding = {
    small: 2,
    medium: 3,
    large: 4,
  }[size];

  const iconSize = {
    small: 32,
    medium: 40,
    large: 48,
  }[size];

  return (
    <Paper
      elevation={0}
      sx={{
        p: padding,
        textAlign: 'center',
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        background: alpha(variantColor, 0.02),
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: alpha(variantColor, 0.3),
          background: alpha(variantColor, 0.04),
        },
      }}
    >
      {Icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            margin: '0 auto',
            mb: 2,
            borderRadius: 2,
            backgroundColor: alpha(variantColor, 0.1),
            color: variantColor,
          }}
        >
          <Icon size={iconSize * 0.5} />
        </Box>
      )}

      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        fontWeight={600}
        color="text.primary"
        sx={{ mb: description ? 0.5 : 2 }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 2 }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size={size === 'large' ? 'medium' : 'small'}
          onClick={onAction}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyStateCard;

