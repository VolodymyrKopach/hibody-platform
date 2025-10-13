/**
 * Admin Dashboard Page
 * Main dashboard with key metrics and charts
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { MetricsCard } from '@/components/admin/dashboard/MetricsCard';
import { ActivityChart } from '@/components/admin/dashboard/ActivityChart';
import { metricsService } from '@/services/admin/metricsService';
import type { DashboardMetrics, MetricsChartData } from '@/types/admin';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<MetricsChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, chartsData] = await Promise.all([
        metricsService.getDashboardMetrics(),
        metricsService.getChartsData(30)
      ]);

      setMetrics(metricsData);
      setChartData(chartsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your platform's performance
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="Total Users"
            value={formatNumber(metrics?.total_users || 0)}
            change={
              metrics
                ? `${calculateChange(
                    metrics.new_registrations_30d,
                    metrics.total_users - metrics.new_registrations_30d
                  )} this month`
                : undefined
            }
            changeType={
              metrics && metrics.user_growth_rate_30d > 0 ? 'positive' : 'neutral'
            }
            icon={<PeopleIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="Active Users"
            value={formatNumber(metrics?.active_users_30d || 0)}
            change={`${formatNumber(metrics?.active_users_7d || 0)} last 7 days`}
            changeType="positive"
            icon={<TrendingUpIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="Lessons"
            value={formatNumber(metrics?.total_lessons || 0)}
            change={`+${metrics?.lessons_created_7d || 0} this week`}
            changeType="positive"
            icon={<SchoolIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="Worksheets"
            value={formatNumber(metrics?.total_worksheets || 0)}
            change={`+${metrics?.worksheets_created_7d || 0} this week`}
            changeType="positive"
            icon={<AssignmentIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="AI Requests"
            value={formatNumber(metrics?.ai_requests_30d || 0)}
            change={`${formatNumber(metrics?.ai_requests_7d || 0)} this week`}
            changeType="neutral"
            icon={<SmartToyIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricsCard
            title="Revenue (MRR)"
            value={formatCurrency(metrics?.mrr || 0)}
            change={
              metrics && metrics.revenue_growth_rate_30d !== 0
                ? `${calculateChange(metrics.revenue_30d, metrics.revenue_30d)} this month`
                : 'No change'
            }
            changeType={
              metrics && metrics.revenue_growth_rate_30d > 0 ? 'positive' : 'neutral'
            }
            icon={<AttachMoneyIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ActivityChart
            title="User Growth (30 days)"
            data={chartData?.user_growth || []}
            loading={loading}
            dataKey="value"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityChart
            title="Lesson Creation (30 days)"
            data={chartData?.lesson_creation || []}
            loading={loading}
            dataKey="value"
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityChart
            title="AI Usage (30 days)"
            data={chartData?.ai_usage || []}
            loading={loading}
            dataKey="value"
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityChart
            title="Revenue (30 days)"
            data={chartData?.revenue || []}
            loading={loading}
            dataKey="value"
            color="#2196f3"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Subscription Stats
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.active_subscriptions || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Trial Users
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.trial_users || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Paid Users
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.paid_users || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Content Stats
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Slides
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatNumber(metrics?.total_slides || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Slides Generated Today
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.slides_generated_today || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Slides This Week
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.slides_generated_7d || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Growth Rates
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    User Growth (7d)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        (metrics?.user_growth_rate_7d || 0) > 0
                          ? 'success.main'
                          : 'text.secondary'
                    }}
                  >
                    {metrics?.user_growth_rate_7d.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    User Growth (30d)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        (metrics?.user_growth_rate_30d || 0) > 0
                          ? 'success.main'
                          : 'text.secondary'
                    }}
                  >
                    {metrics?.user_growth_rate_30d.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    New Registrations (7d)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {metrics?.new_registrations_7d || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

