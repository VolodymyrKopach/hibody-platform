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
  CircularProgress,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  SmartToy as SmartToyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MetricsCard } from '@/components/admin/dashboard/MetricsCard';
import { ActivityChart } from '@/components/admin/dashboard/ActivityChart';
import { metricsService } from '@/services/admin/metricsService';
import type { DashboardMetrics, MetricsChartData } from '@/types/admin';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<MetricsChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Export data clicked');
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
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 3
          }}
        >
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 1.5,
                color: 'white',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                letterSpacing: 0.3,
                mb: 1
              }}
            >
              Overview of your platform's performance
            </Typography>
            {lastUpdated && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<InfoIcon sx={{ fontSize: 16 }} />}
                  label={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: 'white',
                  color: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.5s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export data">
              <IconButton
                onClick={handleExportData}
                sx={{
                  bgcolor: 'white',
                  color: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton
                onClick={() => router.push('/admin/settings')}
                sx={{
                  bgcolor: 'white',
                  color: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'rotate(45deg)'
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Quick Navigation */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => router.push('/admin/users')}
            sx={{
              borderRadius: 2.5,
              borderWidth: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            Manage Users
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => router.push('/admin/lessons')}
            sx={{
              borderRadius: 2.5,
              borderWidth: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            View Lessons
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={() => router.push('/admin/worksheets')}
            sx={{
              borderRadius: 2.5,
              borderWidth: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            View Worksheets
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => router.push('/admin/activity')}
            sx={{
              borderRadius: 2.5,
              borderWidth: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            Activity Log
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      {!loading && !metrics ? (
        <Paper
          sx={{
            p: 6,
            mb: 4,
            borderRadius: 3,
            textAlign: 'center',
            border: (theme) => `2px dashed ${theme.palette.divider}`,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
              No Metrics Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard metrics will appear here once data is available.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Refresh Data
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
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
        </>
      )}

      {/* Quick Summary Bar */}
      {!loading && !metrics ? null : (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(
                theme.palette.info.main,
                0.1
              )})`,
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: (theme) =>
              `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="success" />
            Quick Summary
          </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Revenue
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', mt: 1 }}>
                {loading ? <Skeleton width={80} /> : formatCurrency(metrics?.revenue_30d || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                New Users (7d)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>
                {loading ? <Skeleton width={60} /> : `+${metrics?.new_registrations_7d || 0}`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Active Today
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main', mt: 1 }}>
                {loading ? <Skeleton width={60} /> : formatNumber(metrics?.active_users_7d || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Content Created
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'warning.main', mt: 1 }}>
                {loading ? <Skeleton width={60} /> : `+${(metrics?.lessons_created_7d || 0) + (metrics?.worksheets_created_7d || 0)}`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        </Paper>
      )}

      {/* Charts Section Header */}
      {!loading && !chartData ? null : (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Analytics Overview
          </Typography>
          <Chip
            label="Last 30 days"
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          />
        </Box>
      )}

      {/* Charts */}
      {!loading && (!chartData || 
        (chartData.user_growth.length === 0 && 
         chartData.lesson_creation.length === 0 && 
         chartData.ai_usage.length === 0 && 
         chartData.revenue.length === 0)) ? (
        <Paper
          sx={{
            p: 8,
            borderRadius: 3,
            textAlign: 'center',
            border: (theme) => `2px dashed ${theme.palette.divider}`,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <SmartToyIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
              No Analytics Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
              Charts will be displayed here once there is sufficient activity data. 
              Start by creating lessons and inviting users to see trends.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ActivityChart
              title="User Growth (30 days)"
              data={chartData?.user_growth || []}
              loading={loading}
              dataKey="value"
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActivityChart
              title="Lesson Creation (30 days)"
              data={chartData?.lesson_creation || []}
              loading={loading}
              dataKey="value"
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActivityChart
              title="AI Usage (30 days)"
              data={chartData?.ai_usage || []}
              loading={loading}
              dataKey="value"
              color="#ff9800"
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActivityChart
              title="Revenue (30 days)"
              data={chartData?.revenue || []}
              loading={loading}
              dataKey="value"
              color="#2196f3"
            />
          </Grid>
        </Grid>
      )}

      {/* Additional Stats */}
      {!loading && !metrics ? null : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
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
                background: (theme) => `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                opacity: 0.8
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: '1.1rem',
                letterSpacing: 0.3
              }}
            >
              Subscription Stats
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Active Subscriptions
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'info.main' }}>
                    {metrics?.active_subscriptions || 0}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Trial Users
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'warning.main' }}>
                    {metrics?.trial_users || 0}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Paid Users
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'success.main' }}>
                    {metrics?.paid_users || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
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
                background: (theme) => `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                opacity: 0.8
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: '1.1rem',
                letterSpacing: 0.3
              }}
            >
              Content Stats
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Total Slides
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'success.main' }}>
                    {formatNumber(metrics?.total_slides || 0)}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Slides Generated Today
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {metrics?.slides_generated_today || 0}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Slides This Week
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {metrics?.slides_generated_7d || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
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
                background: (theme) => `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                opacity: 0.8
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: '1.1rem',
                letterSpacing: 0.3
              }}
            >
              Growth Rates
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    User Growth (7d)
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color:
                        (metrics?.user_growth_rate_7d || 0) > 0
                          ? 'success.main'
                          : 'text.secondary'
                    }}
                  >
                    {metrics?.user_growth_rate_7d.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    User Growth (30d)
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color:
                        (metrics?.user_growth_rate_30d || 0) > 0
                          ? 'success.main'
                          : 'text.secondary'
                    }}
                  >
                    {metrics?.user_growth_rate_30d.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    New Registrations (7d)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                    {metrics?.new_registrations_7d || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        </Grid>
      )}
    </Container>
  );
}

