/**
 * Admin Sidebar Component
 * Navigation sidebar for admin panel
 */

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import type { AdminUser } from '@/types/admin';

const DRAWER_WIDTH = 280;

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: <DashboardIcon />
  },
  {
    id: 'users',
    label: 'Users',
    path: '/admin/users',
    icon: <PeopleIcon />
  },
  {
    id: 'lessons',
    label: 'Lessons',
    path: '/admin/lessons',
    icon: <SchoolIcon />
  },
  {
    id: 'worksheets',
    label: 'Worksheets',
    path: '/admin/worksheets',
    icon: <AssignmentIcon />
  },
  {
    id: 'activity',
    label: 'Activity Log',
    path: '/admin/activity',
    icon: <TimelineIcon />
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/admin/settings',
    icon: <SettingsIcon />
  }
];

interface AdminSidebarProps {
  adminUser: AdminUser | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminUser,
  mobileOpen = false,
  onMobileClose,
  onLogout
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Header */}
      <Toolbar
        sx={{
          px: 3,
          py: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 700,
              letterSpacing: 0.5
            }}
          >
            TeachSpark
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.75rem'
            }}
          >
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Admin User Info */}
      {adminUser && (
        <>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 48,
                  height: 48
                }}
              >
                {adminUser.email?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {adminUser.full_name || 'Admin User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                >
                  {adminUser.email}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.25,
                    mt: 0.5,
                    borderRadius: 1,
                    bgcolor:
                      adminUser.role === 'super_admin'
                        ? 'error.main'
                        : 'primary.main',
                    color: 'white'
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                    {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'white' : 'text.secondary'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Back to Platform */}
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={() => {
            router.push('/');
            if (isMobile && onMobileClose) {
              onMobileClose();
            }
          }}
          sx={{
            borderRadius: 2,
            mx: 1,
            '&:hover': {
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ArrowBackIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Back to Platform"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: theme.palette.primary.main
            }}
          />
        </ListItemButton>

        {/* Logout */}
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            mt: 1,
            '&:hover': {
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.contrastText
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

