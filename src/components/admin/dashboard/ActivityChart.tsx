/**
 * Activity Chart Component
 * Displays activity trends over time
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { MetricTrend } from '@/types/admin';

interface ActivityChartProps {
  title: string;
  data: MetricTrend[];
  loading?: boolean;
  dataKey?: string;
  color?: string;
}

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
      <Card sx={{ height: '100%' }}>
        <CardHeader title={title} />
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
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
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 600
        }}
      />
      <CardContent>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="date"
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={2}
                dot={{ fill: lineColor, r: 4 }}
                activeDot={{ r: 6 }}
                name={title}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

