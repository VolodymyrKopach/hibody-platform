/**
 * Admin Analytics Dashboard
 * Advanced analytics, user segments, engagement metrics, and content popularity
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Button,
  Alert,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { analyticsService } from '@/services/admin/analyticsService';
import type {
  EngagementMetrics,
  CohortData,
  UserSegment,
  FeatureUsageData,
  ContentPopularity,
} from '@/types/admin';

export default function AdminAnalyticsPage() {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData[]>([]);
  const [contentPop, setContentPop] = useState<ContentPopularity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [engagement, cohortData, segmentData, usage, popularity] = await Promise.all([
        analyticsService.getEngagementMetrics(),
        analyticsService.getCohortAnalysis(),
        analyticsService.getUserSegments(),
        analyticsService.getFeatureUsage(),
        analyticsService.getContentPopularity(),
      ]);

      setEngagementMetrics(engagement);
      setCohorts(cohortData);
      setSegments(segmentData);
      setFeatureUsage(usage);
      setContentPop(popularity);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
          boxShadow: (theme) => `0 8px 24px ${theme.palette.info.main}40`,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
              <AssessmentIcon sx={{ mr: 2, fontSize: 40 }} />
              Advanced Analytics
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              User engagement, cohorts, segments, and content insights
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadAnalytics}
            sx={{ bgcolor: 'white', color: 'info.main', fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            📊 Engagement Metrics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Daily Active Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                    {engagementMetrics.dau}
                  </Typography>
                  <Chip icon={<PeopleIcon />} label={`${(engagementMetrics.dau_wau_ratio * 100).toFixed(1)}% of WAU`} size="small" />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Weekly Active Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                    {engagementMetrics.wau}
                  </Typography>
                  <Chip icon={<PeopleIcon />} label={`${(engagementMetrics.wau_mau_ratio * 100).toFixed(1)}% of MAU`} size="small" />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Monthly Active Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                    {engagementMetrics.mau}
                  </Typography>
                  <Chip icon={<TrendingUpIcon />} label="Last 30 days" size="small" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* User Segments */}
      {segments.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            👥 User Segments
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {segments.map((segment) => (
              <Grid item xs={12} md={4} key={segment.segment_name}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {segment.segment_name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {segment.user_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {segment.percentage}% of total users
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={segment.percentage}
                      sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Avg Revenue: ${segment.avg_revenue.toFixed(2)}
                    </Typography>
                    {Object.entries(segment.characteristics).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Feature Usage */}
      {featureUsage.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            🎯 Feature Usage
          </Typography>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Usage Count</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unique Users</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Avg Time (min)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Adoption Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {featureUsage.map((feature) => (
                  <TableRow key={feature.feature_name} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{feature.feature_name}</TableCell>
                    <TableCell>{feature.usage_count.toLocaleString()}</TableCell>
                    <TableCell>{feature.unique_users.toLocaleString()}</TableCell>
                    <TableCell>{feature.avg_time_spent.toFixed(1)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={feature.adoption_rate}
                          sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" sx={{ minWidth: 40 }}>
                          {feature.adoption_rate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Cohort Analysis */}
      {cohorts.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            📈 Cohort Retention Analysis
          </Typography>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Cohort</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 1</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 7</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 14</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 30</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 60</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Day 90</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cohorts.map((cohort) => (
                  <TableRow key={cohort.cohort_date} hover>
                    <TableCell>{new Date(cohort.cohort_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>{cohort.cohort_size}</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_1 / 100) }}>
                      {cohort.retention_rates.day_1.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_7 / 100) }}>
                      {cohort.retention_rates.day_7.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_14 / 100) }}>
                      {cohort.retention_rates.day_14.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_30 / 100) }}>
                      {cohort.retention_rates.day_30.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_60 / 100) }}>
                      {cohort.retention_rates.day_60.toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ bgcolor: alpha('#4caf50', cohort.retention_rates.day_90 / 100) }}>
                      {cohort.retention_rates.day_90.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Content Popularity */}
      {contentPop && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🔥 Popular Subjects
              </Typography>
              {contentPop.popular_subjects.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.subject}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2">{item.count}</Typography>
                      <Chip icon={<TrendingUpIcon />} label={`+${item.growth_rate}%`} size="small" color="success" />
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={(item.count / contentPop.popular_subjects[0].count) * 100} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                👶 Popular Age Groups
              </Typography>
              {contentPop.popular_age_groups.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.age_group}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2">{item.count}</Typography>
                      <Chip icon={<TrendingUpIcon />} label={`+${item.growth_rate}%`} size="small" color="info" />
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={(item.count / contentPop.popular_age_groups[0].count) * 100} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

