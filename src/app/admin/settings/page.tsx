/**
 * Admin Settings Page
 * Manage admin panel settings and configurations
 */

'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper
} from '@mui/material';

export default function AdminSettingsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage admin panel settings and configurations
        </Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Settings page coming soon...
        </Typography>
      </Paper>
    </Container>
  );
}

