/**
 * Users Table Component
 * Displays paginated list of users with actions
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Skeleton
} from '@mui/material';
import {
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  PersonAdd as MakeAdminIcon
} from '@mui/icons-material';
import type { UserListItem } from '@/types/admin';

interface UsersTableProps {
  users: UserListItem[];
  loading?: boolean;
  onUserClick?: (userId: string) => void;
  onMakeAdmin?: (userId: string, userEmail: string, userName?: string | null) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading = false,
  onUserClick,
  onMakeAdmin
}) => {
  const router = useRouter();

  const handleUserClick = (userId: string) => {
    if (onUserClick) {
      onUserClick(userId);
    } else {
      router.push(`/admin/users/${userId}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Subscription</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Last Sign In</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={150} />
                      <Skeleton variant="text" width={100} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={60} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No users found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Subscription</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Last Sign In</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => handleUserClick(user.id)}
            >
              {/* User Info */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.email[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user.full_name || 'No Name'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              {/* Role */}
              <TableCell>
                {user.is_admin ? (
                  <Chip
                    icon={<AdminIcon />}
                    label={
                      user.admin_role === 'super_admin' ? 'Super Admin' : 'Admin'
                    }
                    size="small"
                    color={user.admin_role === 'super_admin' ? 'success' : 'primary'}
                  />
                ) : (
                  <Chip label="User" size="small" variant="outlined" />
                )}
              </TableCell>

              {/* Subscription */}
              <TableCell>
                <Chip
                  label={user.subscription_status || 'Free'}
                  size="small"
                  color={getSubscriptionColor(user.subscription_status)}
                  variant="outlined"
                />
              </TableCell>

              {/* Activity Stats */}
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption">
                    {user.lessons_count} lessons
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.worksheets_count} worksheets
                  </Typography>
                </Box>
              </TableCell>

              {/* Joined Date */}
              <TableCell>
                <Typography variant="body2">
                  {formatDate(user.created_at)}
                </Typography>
              </TableCell>

              {/* Last Sign In */}
              <TableCell>
                <Typography variant="body2">
                  {formatDate(user.last_sign_in_at)}
                </Typography>
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  {!user.is_admin && onMakeAdmin && (
                    <Tooltip title="Make Admin">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMakeAdmin(user.id, user.email, user.full_name);
                        }}
                      >
                        <MakeAdminIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user.id);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

