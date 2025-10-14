/**
 * Admin Finance Dashboard
 * Financial metrics, revenue tracking, and subscription analytics
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  Skeleton,
  LinearProgress,
  Chip,
  alpha,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Subscriptions as SubscriptionsIcon,
  PersonOff as ChurnIcon,
} from '@mui/icons-material';
import { financeService } from '@/services/admin/financeService';
import type {
  RevenueMetrics,
  ChurnMetrics,
  ConversionMetrics,
  SubscriptionMetrics,
} from '@/types/admin';

export default function AdminFinancePage() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [churnMetrics, setChurnMetrics] = useState<ChurnMetrics | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics | null>(null);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenue, churn, conversion, subscription] = await Promise.all([
        financeService.getRevenueMetrics(),
        financeService.getChurnMetrics(),
        financeService.getConversionMetrics(),
        financeService.getSubscriptionMetrics(),
      ]);

      setRevenueMetrics(revenue);
      setChurnMetrics(churn);
      setConversionMetrics(conversion);
      setSubscriptionMetrics(subscription);
    } catch (err) {
      console.error('Error loading finance data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
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
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          boxShadow: (theme) => `0 8px 24px ${theme.palette.success.main}40`,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
              Finance Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Revenue, subscriptions, and financial metrics
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadFinanceData}
            sx={{ bgcolor: 'white', color: 'success.main', fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}

      {/* Revenue Metrics */}
      {revenueMetrics && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            💰 Revenue Metrics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Monthly Recurring Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                    {formatCurrency(revenueMetrics.mrr)}
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`+${revenueMetrics.mrr_growth_rate}%`}
                    size="small"
                    color="success"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Annual Recurring Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                    {formatCurrency(revenueMetrics.arr)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Projected: {formatCurrency(revenueMetrics.projected_arr)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Revenue (30 days)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                    {formatCurrency(revenueMetrics.total_revenue_30d)}
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`+${revenueMetrics.revenue_growth_rate_30d}%`}
                    size="small"
                    color="info"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Revenue Today</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                    {formatCurrency(revenueMetrics.revenue_today)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 7 days: {formatCurrency(revenueMetrics.total_revenue_7d)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Revenue by Plan */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Revenue by Plan
            </Typography>
            {revenueMetrics.revenue_by_plan.map((item) => (
              <Box key={item.plan} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.plan}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(item.revenue)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.revenue / revenueMetrics.mrr) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Paper>
        </>
      )}

      {/* Subscription & Conversion Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Subscriptions */}
        {subscriptionMetrics && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SubscriptionsIcon color="primary" />
                Subscription Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha('#4caf50', 0.1) }}>
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {subscriptionMetrics.total_active}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha('#ff9800', 0.1) }}>
                    <Typography variant="caption" color="text.secondary">Trial</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {subscriptionMetrics.total_trial}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha('#f44336', 0.1) }}>
                    <Typography variant="caption" color="text.secondary">Cancelled</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {subscriptionMetrics.total_cancelled}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha('#9e9e9e', 0.1) }}>
                    <Typography variant="caption" color="text.secondary">Past Due</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {subscriptionMetrics.total_past_due}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Conversions */}
        {conversionMetrics && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Conversion Rates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Trial → Paid</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {conversionMetrics.trial_to_paid_rate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conversionMetrics.trial_conversions_30d} conversions (30d)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Free → Trial</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {conversionMetrics.free_to_trial_rate}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Free → Paid</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {conversionMetrics.free_to_paid_rate}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Churn Metrics */}
      {churnMetrics && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChurnIcon color="error" />
            Churn Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Churn Rate (30d)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {churnMetrics.churn_rate_30d}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Churned Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {churnMetrics.churned_customers_30d}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Revenue Lost</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {formatCurrency(churnMetrics.revenue_lost_30d)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Churn Rate (7d)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {churnMetrics.churn_rate_7d}%
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Churn Reasons */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Churn Reasons
            </Typography>
            {churnMetrics.churn_by_reason.map((reason, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{reason.reason}</Typography>
                  <Typography variant="body2" color="text.secondary">{reason.count}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(reason.count / churnMetrics.churned_customers_30d) * 100}
                  sx={{ height: 4, borderRadius: 2 }}
                  color="error"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

