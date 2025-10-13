/**
 * Activity Chart Component
 * Displays activity trends over time with modern gradient fills
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { MetricTrend } from '@/types/admin';

interface ActivityChartProps {
  title: string;
  data: MetricTrend[];
  loading?: boolean;
  dataKey?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps & { color: string }> = ({ 
  active, 
  payload, 
  label,
  color
}) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          border: `1px solid ${alpha(color, 0.3)}`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`
        }}
      >
        <Box
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
            mb: 0.5,
            fontWeight: 500
          }}
        >
          {label}
        </Box>
        <Box
          sx={{
            fontSize: '1rem',
            color: color,
            fontWeight: 700
          }}
        >
          {payload[0].value.toLocaleString()}
        </Box>
      </Box>
    );
  }

  return null;
};

export const ActivityChart: React.FC<ActivityChartProps> = ({
  title,
  data,
  loading = false,
  dataKey = 'value',
  color
}) => {
  const theme = useTheme();
  const lineColor = color || theme.palette.primary.main;

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
        <CardHeader 
          title={title}
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Skeleton 
            variant="rectangular" 
            height={300} 
            sx={{ borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 700,
          fontSize: '1rem'
        }}
        sx={{ 
          pb: 1,
          '& .MuiCardHeader-title': {
            color: theme.palette.text.primary
          }
        }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={lineColor} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={lineColor} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={alpha(theme.palette.divider, 0.3)}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke={theme.palette.text.secondary}
                style={{ 
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
                tickLine={false}
                axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ 
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
                tickLine={false}
                axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
              />
              <Tooltip 
                content={<CustomTooltip color={lineColor} />}
                cursor={{
                  stroke: alpha(lineColor, 0.3),
                  strokeWidth: 2,
                  strokeDasharray: '5 5'
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={3}
                fill={`url(#gradient-${dataKey})`}
                dot={false}
                activeDot={{ 
                  r: 6,
                  fill: lineColor,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

