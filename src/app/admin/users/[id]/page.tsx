/**
 * User Detail Page
 * View and manage individual user details
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { usersService } from '@/services/admin/usersService';
import type { UserDetail, ActivityLog } from '@/types/admin';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialogs
  const [editLimitDialog, setEditLimitDialog] = useState(false);
  const [newLimit, setNewLimit] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetail();
    }
  }, [userId]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await usersService.getUserDetail(userId);
      
      if (!userData) {
        setError('User not found');
        return;
      }

      setUser(userData);
      setNewLimit(userData.generation_limit_total);
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    try {
      await usersService.updateGenerationLimit(userId, newLimit);
      setEditLimitDialog(false);
      loadUserDetail();
    } catch (err) {
      console.error('Error updating limit:', err);
      setError('Failed to update generation limit');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersService.deleteUser(userId);
      router.push('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'User not found'}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/admin/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push('/admin/users')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          User Details
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {user.email[0].toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.full_name || 'No Name'}
              </Typography>
              {user.is_admin && (
                <Chip
                  label={user.admin_role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  color={user.admin_role === 'super_admin' ? 'error' : 'primary'}
                  size="small"
                />
              )}
              <Chip
                label={user.subscription_status || 'Free'}
                color={user.subscription_status === 'active' ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {user.email}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Joined
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(user.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Last Sign In
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(user.last_sign_in_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Last Activity
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(user.last_activity_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Total Paid
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${user.total_paid.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Lessons Created
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.lessons_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Slides Generated
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.slides_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Worksheets Created
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.worksheets_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              AI Requests
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.total_ai_requests}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Generation Limit */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Generation Limit
          </Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setEditLimitDialog(true)}
          >
            Edit
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                height: 8,
                bgcolor: 'grey.200',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  bgcolor: 'primary.main',
                  width: `${(user.generation_limit_used / user.generation_limit_total) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100, textAlign: 'right' }}>
            {user.generation_limit_used} / {user.generation_limit_total}
          </Typography>
        </Box>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Activity
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.recent_activities.slice(0, 10).map((activity: ActivityLog) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Chip
                      label={activity.action.replace(/_/g, ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {activity.entity_type || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatDate(activity.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {user.recent_activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Limit Dialog */}
      <Dialog open={editLimitDialog} onClose={() => setEditLimitDialog(false)}>
        <DialogTitle>Edit Generation Limit</DialogTitle>
        <DialogContent>
          <TextField
            label="New Limit"
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLimitDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateLimit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

