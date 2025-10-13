/**
 * Admin Worksheets Page
 * View and manage all worksheets created on the platform
 */

'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper
} from '@mui/material';

export default function AdminWorksheetsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Worksheets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all worksheets created on the platform
        </Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Worksheets management coming soon...
        </Typography>
      </Paper>
    </Container>
  );
}

