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
  useMediaQuery,
  alpha
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
          py: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 800,
              letterSpacing: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            TeachSpark
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: 1
            }}
          >
            ADMIN PANEL
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Admin User Info */}
      {adminUser && (
        <>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  width: 52,
                  height: 52,
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              >
                {adminUser.email?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.95rem'
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
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  {adminUser.email}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.5,
                    mt: 0.75,
                    borderRadius: 1.5,
                    background:
                      adminUser.role === 'super_admin'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    boxShadow:
                      adminUser.role === 'super_admin'
                        ? '0 2px 8px rgba(16, 185, 129, 0.4)'
                        : `0 2px 8px ${theme.palette.primary.main}40`
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.5 }}>
                    {adminUser.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ borderColor: theme.palette.divider, opacity: 0.3 }} />
        </>
      )}

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1.5 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2.5,
                  py: 1.25,
                  px: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      bgcolor: 'white',
                      borderRadius: '0 4px 4px 0'
                    },
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateX(4px)'
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                      transform: 'scale(1.1)'
                    }
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'white' : 'text.secondary',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: isActive ? 0.3 : 0
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Back to Platform */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={() => {
            router.push('/');
            if (isMobile && onMobileClose) {
              onMobileClose();
            }
          }}
          sx={{
            borderRadius: 2.5,
            py: 1.25,
            px: 2,
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main,
              transform: 'translateX(-4px)',
              '& .MuiListItemIcon-root': {
                transform: 'translateX(-4px)',
                color: theme.palette.primary.dark
              }
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: 40,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ArrowBackIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Back to Platform"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          />
        </ListItemButton>

        {/* Logout */}
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2.5,
            py: 1.25,
            px: 2,
            mt: 1,
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.3)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              borderColor: theme.palette.error.main,
              '& .MuiListItemIcon-root': {
                transform: 'rotate(-10deg)',
                color: theme.palette.error.dark
              }
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: 40,
              color: theme.palette.error.main,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: theme.palette.error.main
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

