/**
 * Admin Activity Log Page
 * View and filter platform activity logs
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Pagination,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { activityService } from '@/services/admin/activityService';
import type { ActivityLog, ActivityLogFilters } from '@/types/admin';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadActivities();
  }, [page, actionFilter, entityTypeFilter, dateRange]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      let dateFrom: string | undefined;

      switch (dateRange) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFrom = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setDate(monthAgo.getDate() - 30);
          dateFrom = monthAgo.toISOString();
          break;
        default:
          dateFrom = undefined;
      }

      const filters: ActivityLogFilters = {
        action: actionFilter !== 'all' ? actionFilter : undefined,
        entity_type: entityTypeFilter !== 'all' ? (entityTypeFilter as any) : undefined,
        date_from: dateFrom,
        limit,
        offset: (page - 1) * limit
      };

      const result = await activityService.getActivityLogs(filters);

      setActivities(result.data);
      setTotalPages(result.total_pages);
      setTotalActivities(result.total);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadActivities();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    if (action.includes('created') || action.includes('register')) return 'success';
    if (action.includes('deleted') || action.includes('failed')) return 'error';
    if (action.includes('updated') || action.includes('login')) return 'primary';
    if (action.includes('payment')) return 'warning';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Activity Log
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor all platform activities ({totalActivities} total)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {/* Date Range */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              label="Date Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          {/* Action Filter */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              label="Action"
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="register">Register</MenuItem>
              <MenuItem value="lesson_created">Lesson Created</MenuItem>
              <MenuItem value="slide_generated">Slide Generated</MenuItem>
              <MenuItem value="worksheet_created">Worksheet Created</MenuItem>
              <MenuItem value="payment_succeeded">Payment Succeeded</MenuItem>
              <MenuItem value="failed_login">Failed Login</MenuItem>
            </Select>
          </FormControl>

          {/* Entity Type Filter */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Entity</InputLabel>
            <Select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              label="Entity"
            >
              <MenuItem value="all">All Entities</MenuItem>
              <MenuItem value="lesson">Lesson</MenuItem>
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="worksheet">Worksheet</MenuItem>
              <MenuItem value="auth">Auth</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Activity Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="text" width={150} />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                </TableRow>
              ))
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No activities found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id} hover>
                  {/* User */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                        {activity.user_email?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.user_full_name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user_email || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Chip
                      label={activity.action.replace(/_/g, ' ')}
                      size="small"
                      color={getActionColor(activity.action)}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Entity */}
                  <TableCell>
                    {activity.entity_type ? (
                      <Chip
                        label={activity.entity_type}
                        size="small"
                        variant="filled"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(activity.created_at)}
                    </Typography>
                  </TableCell>

                  {/* Details */}
                  <TableCell>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        {JSON.stringify(activity.metadata).substring(0, 50)}...
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No details
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}

