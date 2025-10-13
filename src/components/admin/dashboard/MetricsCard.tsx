/**
 * Metrics Card Component
 * Displays a single metric with icon and change indicator
 * Enhanced with modern gradients and animations
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import type { MetricsCardProps } from '@/types/admin';

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false
}) => {
  const theme = useTheme();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return theme.palette.success.main;
      case 'negative':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp fontSize="small" />;
      case 'negative':
        return <TrendingDown fontSize="small" />;
      default:
        return <TrendingFlat fontSize="small" />;
    }
  };

  const getGradientColor = () => {
    const colors = {
      positive: ['#10b981', '#059669'],
      negative: ['#ef4444', '#dc2626'],
      neutral: [theme.palette.primary.main, theme.palette.primary.dark]
    };
    return colors[changeType];
  };

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
          <Skeleton variant="text" width="80%" height={48} />
          <Skeleton variant="text" width="50%" height={24} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const [gradientStart, gradientEnd] = getGradientColor();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`,
          opacity: 0.8,
          transition: 'opacity 0.3s ease'
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.1)}`,
          '&::before': {
            opacity: 1
          }
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with title and icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 3 
        }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(gradientStart, 0.15)}, ${alpha(gradientEnd, 0.15)})`,
                color: gradientStart,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  background: `linear-gradient(135deg, ${alpha(gradientStart, 0.25)}, ${alpha(gradientEnd, 0.25)})`
                }
              }}
            >
              {React.cloneElement(icon as React.ReactElement, { 
                sx: { fontSize: 24 } 
              })}
            </Box>
          )}
        </Box>

        {/* Main value */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            color: theme.palette.text.primary,
            background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.7)})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}
        >
          {value}
        </Typography>

        {/* Change indicator */}
        {change && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              backgroundColor: alpha(getChangeColor(), 0.1),
              color: getChangeColor(),
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(getChangeColor(), 0.15)
              }
            }}
          >
            {getChangeIcon()}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              {change}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

