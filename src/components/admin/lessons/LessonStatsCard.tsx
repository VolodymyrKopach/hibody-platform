/**
 * Lesson Stats Card Component
 * Displays key statistics for lessons
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as ViewsIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Archive as ArchiveIcon,
  Description as DraftIcon,
} from '@mui/icons-material';
import type { LessonStats } from '@/types/admin';

interface LessonStatsCardProps {
  stats: LessonStats | null;
  loading?: boolean;
}

export const LessonStatsCard: React.FC<LessonStatsCardProps> = ({ stats, loading = false }) => {
  if (loading || !stats) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const statCards = [
    {
      title: 'Total Lessons',
      value: stats.total_lessons,
      icon: <SchoolIcon />,
      color: '#2196f3',
    },
    {
      title: 'Published',
      value: stats.published_lessons,
      icon: <PublicIcon />,
      color: '#4caf50',
    },
    {
      title: 'Drafts',
      value: stats.draft_lessons,
      icon: <DraftIcon />,
      color: '#ff9800',
    },
    {
      title: 'Archived',
      value: stats.archived_lessons,
      icon: <ArchiveIcon />,
      color: '#9e9e9e',
    },
    {
      title: 'Total Views',
      value: stats.total_views.toLocaleString(),
      icon: <ViewsIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Avg Rating',
      value: stats.average_rating.toFixed(1),
      icon: <StarIcon />,
      color: '#ffc107',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: (theme) =>
                  `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
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
                  background: stat.color,
                  opacity: 0.8,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) =>
                    `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Popular Subjects & Age Groups */}
      <Grid container spacing={3}>
        {/* Popular Subjects */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Popular Subjects
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.most_popular_subjects.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                ) : (
                  stats.most_popular_subjects.map((item, index) => {
                    const percentage =
                      stats.total_lessons > 0 ? (item.count / stats.total_lessons) * 100 : 0;
                    return (
                      <Box key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.count} ({percentage.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Age Groups */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Popular Age Groups
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.most_popular_age_groups.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                ) : (
                  stats.most_popular_age_groups.map((item, index) => {
                    const percentage =
                      stats.total_lessons > 0 ? (item.count / stats.total_lessons) * 100 : 0;
                    return (
                      <Box key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.age_group}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.count} ({percentage.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

