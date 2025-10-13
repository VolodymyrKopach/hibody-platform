/**
 * Metrics Card Component
 * Displays a single metric with icon and change indicator
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  useTheme
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

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: theme.shadows[2],
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        {/* Header with title and icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.75rem'
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
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Main value */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: theme.palette.text.primary
          }}
        >
          {value}
        </Typography>

        {/* Change indicator */}
        {change && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: getChangeColor()
            }}
          >
            {getChangeIcon()}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem'
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

