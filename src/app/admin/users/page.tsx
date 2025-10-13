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
  Refresh as RefreshIcon,
  People as PeopleIcon
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
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              color: 'white',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            Users
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              letterSpacing: 0.3
            }}
          >
            Manage and view all platform users ({totalUsers} total)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{
            bgcolor: 'white',
            color: (theme) => theme.palette.primary.main,
            position: 'relative',
            zIndex: 1,
            fontWeight: 700,
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
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
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`
          }
        }}
      >
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
            sx={{ 
              flex: 1, 
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`
                },
                '&.Mui-focused': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}40`
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              )
            }}
          />

          {/* Role Filter */}
          <FormControl 
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`
                },
                '&.Mui-focused': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}40`
                }
              }
            }}
          >
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
          <FormControl 
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`
                },
                '&.Mui-focused': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}40`
                }
              }
            }}
          >
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
      {!loading && users.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            borderRadius: 3,
            textAlign: 'center',
            border: (theme) => `2px dashed ${theme.palette.divider}`,
            bgcolor: (theme) => `${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <PeopleIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
              No Users Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
              {searchTerm || roleFilter !== 'all' || subscriptionFilter !== 'all' 
                ? 'No users match your current filters. Try adjusting your search criteria.'
                : 'No users have registered yet. They will appear here once they sign up.'}
            </Typography>
            {(searchTerm || roleFilter !== 'all' || subscriptionFilter !== 'all') && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setSubscriptionFilter('all');
                  setPage(1);
                }}
                sx={{ mt: 2 }}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        </Paper>
      ) : (
        <>
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
        </>
      )}
    </Container>
  );
}

