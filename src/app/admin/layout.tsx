/**
 * Admin Layout
 * Main layout for admin panel with sidebar and protected routes
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isAdmin, adminUser, loading } = useAdminAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  // If not admin, don't render (useAdminAuth will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              TeachSpark Admin
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <AdminSidebar
        adminUser={adminUser}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          ...(isMobile && {
            mt: 7 // Offset for mobile AppBar
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

