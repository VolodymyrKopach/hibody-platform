/**
 * Admin Users Page
 * Manage and view all platform users
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Pagination,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { usersService } from '@/services/admin/usersService';
import type { UserListItem, UserFilters } from '@/types/admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'free' | 'trial' | 'active' | 'cancelled'>('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, subscriptionFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: UserFilters = {
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        subscription_status: subscriptionFilter !== 'all' ? subscriptionFilter : undefined,
        limit,
        offset: (page - 1) * limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const result = await usersService.getUsers(filters);

      setUsers(result.data);
      setTotalPages(result.total_pages);
      setTotalUsers(result.total);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUsers();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and view all platform users ({totalUsers} total)
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
          {/* Search */}
          <TextField
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {/* Role Filter */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="user">Users</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
              <MenuItem value="super_admin">Super Admins</MenuItem>
            </Select>
          </FormControl>

          {/* Subscription Filter */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Subscription</InputLabel>
            <Select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value as any)}
              label="Subscription"
            >
              <MenuItem value="all">All Subscriptions</MenuItem>
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <UsersTable users={users} loading={loading} />

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

