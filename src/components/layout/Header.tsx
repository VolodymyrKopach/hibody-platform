'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  MessageSquare, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  alpha,
  useTheme,
  Badge,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';
import { AuthModal } from '@/components/auth';
import { MigrationDialog } from '@/components/migration/MigrationDialog';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidebarCollapse: () => void;
  sidebarCollapsed: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleSidebarCollapse,
  sidebarCollapsed,
  breadcrumbs = [], 
  title = 'Дашборд' 
}) => {
  const theme = useTheme();
  const { user, profile, signOut, loading } = useAuth();

  // Логи для відстеження стану в Header (можна видалити для production)
  // React.useEffect(() => {
  //   console.log('🎯 Header: User state in header:', user ? `${user.email} (${user.id})` : 'null')
  // }, [user])

  // React.useEffect(() => {
  //   console.log('🎯 Header: Profile state in header:', profile ? `${profile.full_name}` : 'null')
  // }, [profile])

  // React.useEffect(() => {
  //   console.log('🎯 Header: Loading state in header:', loading)
  // }, [loading])
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleUserMenuClose();
    } catch (error) {
      console.error('❌ Header.handleSignOut: Error during logout:', error)
    }
  };

  const handleMigrationDialogOpen = () => {
    setMigrationDialogOpen(true);
    handleUserMenuClose();
  };

  const handleMigrationDialogClose = () => {
    setMigrationDialogOpen(false);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ px: 2, py: 1, height: 64 }}>
        {/* Left Section */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
          {/* Logo */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                H
              </Typography>
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              HiBody
            </Typography>
          </Stack>

          {/* Menu button for mobile only */}
          <IconButton
            onClick={onToggleSidebar}
            sx={{ 
              display: { xs: 'flex', lg: 'none' },
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <Menu size={20} />
          </IconButton>

          {/* Collapse button for desktop only */}
          <IconButton
            onClick={onToggleSidebarCollapse}
            sx={{ 
              display: { xs: 'none', lg: 'flex' },
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </IconButton>

          {/* Page Title */}
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {title}
            </Typography>
          </Box>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <ChevronRight size={16} color={theme.palette.text.disabled} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: item.href ? 'primary.main' : 'text.primary',
                      fontWeight: item.href ? 400 : 500,
                      cursor: item.href ? 'pointer' : 'default',
                      '&:hover': item.href ? { textDecoration: 'underline' } : {},
                    }}
                  >
                    {item.label}
                  </Typography>
                </React.Fragment>
              ))}
            </Stack>
          )}
        </Stack>



        {/* Right Section */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Quick Actions - показуємо тільки для авторизованих користувачів */}
          {user && (
            <Button
              startIcon={<Sparkles size={18} />}
              variant="contained"
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Створити
              </Box>
            </Button>
          )}

          {/* Notifications - показуємо тільки для авторизованих користувачів */}
          {user && (
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                background: alpha(theme.palette.grey[500], 0.1),
                '&:hover': {
                  background: alpha(theme.palette.grey[500], 0.2),
                },
              }}
            >
              <Badge badgeContent={2} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>
          )}

          {/* User Menu або Login Button */}
          {user ? (
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            <Button
              onClick={handleAuthModalOpen}
              variant="contained"
              size="small"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Увійти
            </Button>
          )}
        </Stack>
      </Toolbar>

      {/* Notifications Menu */}
      <MuiMenu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: '16px',
            minWidth: 320,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Сповіщення
          </Typography>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: '12px',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Новий шаблон "Математика 1 клас" готовий
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                5 хвилин тому
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: alpha(theme.palette.secondary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                borderRadius: '12px',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Ваш урок отримав 12 лайків
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                1 година тому
              </Typography>
            </Paper>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            size="small"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Переглянути всі
          </Button>
        </Box>
      </MuiMenu>

      {/* User Menu */}
      <MuiMenu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: '16px',
            minWidth: 240,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {profile?.full_name || 'Користувач'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
              <Chip
                label={profile?.subscription_type === 'free' ? 'Безкоштовний' : 
                      profile?.subscription_type === 'professional' ? 'Професійний' : 'Преміум'}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  background: alpha(
                    profile?.subscription_type === 'free' ? theme.palette.grey[500] :
                    profile?.subscription_type === 'professional' ? theme.palette.primary.main :
                    theme.palette.success.main, 0.1
                  ),
                  color: profile?.subscription_type === 'free' ? theme.palette.grey[700] :
                         profile?.subscription_type === 'professional' ? theme.palette.primary.main :
                         theme.palette.success.main,
                }}
              />
            </Box>
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            Профіль
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            Налаштування
          </MenuItem>
          <MenuItem onClick={handleMigrationDialogOpen} sx={{ borderRadius: '8px', mb: 0.5 }}>
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            Міграція даних
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem
            onClick={handleSignOut}
            sx={{
              borderRadius: '8px',
              color: 'error.main',
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.05),
              },
            }}
          >
            <ListItemIcon>
              <LogOut size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            Вийти
          </MenuItem>
        </Box>
      </MuiMenu>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthModalClose}
      />

      {/* Migration Dialog */}
      <MigrationDialog
        open={migrationDialogOpen}
        onClose={handleMigrationDialogClose}
        onMigrationComplete={(result) => {
          console.log('Migration completed:', result);
          // Можна додати сповіщення про результат
        }}
      />
    </AppBar>
  );
};

export default Header; 