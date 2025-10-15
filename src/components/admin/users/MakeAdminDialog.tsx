/**
 * Make Admin Dialog Component
 * Dialog for assigning admin roles to users
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

interface MakeAdminDialogProps {
  open: boolean;
  userId: string;
  userEmail: string;
  userName?: string | null;
  onClose: () => void;
  onConfirm: (role: 'admin' | 'super_admin') => Promise<void>;
}

export const MakeAdminDialog: React.FC<MakeAdminDialogProps> = ({
  open,
  userId,
  userEmail,
  userName,
  onClose,
  onConfirm
}) => {
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm(role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign admin role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setRole('admin');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminIcon color="primary" />
        Assign Admin Role
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            User
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {userName || userEmail}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userEmail}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth>
          <InputLabel>Admin Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
            label="Admin Role"
            disabled={loading}
          >
            <MenuItem value="admin">
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Can manage users, lessons, and view analytics
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="super_admin">
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Super Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full access including admin management
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <Alert severity="warning" sx={{ mt: 2 }}>
          This user will gain admin access to the platform.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Assigning...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

