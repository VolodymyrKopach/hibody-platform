'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  MessageSquare, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Languages
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
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useUnsavedChangesContext } from '@/providers/UnsavedChangesProvider';
import { AuthModal } from '@/components/auth';
import { Logo } from '@/components/ui';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidebarCollapse: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleSidebarCollapse,
  sidebarCollapsed
}) => {
  const { t, i18n } = useTranslation(['common', 'auth']);
  const theme = useTheme();
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const { navigateWithConfirmation } = useUnsavedChangesContext();

  // Logs for tracking state in Header (can be removed for production)
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
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Languages configuration
  const languages = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
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

  const handleCreateClick = async () => {
    await navigateWithConfirmation('/create-lesson');
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleUserMenuClose();
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
            <Logo variant="header" />
            
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
              TeachSpark
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



        </Stack>

        {/* Right Section */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Quick Actions - show only for authorized users */}
          {user && (
            <Button
              startIcon={<Sparkles size={18} />}
              variant="contained"
              size="small"
              onClick={handleCreateClick}
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
                {t('common:buttons.create', 'Create')}
              </Box>
            </Button>
          )}

          {/* User Menu or Login Button */}
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
              {t('auth:login.submit', 'Sign In')}
            </Button>
          )}
        </Stack>
      </Toolbar>

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
                {profile?.full_name || t('titles.defaultUser')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
              <Chip
                label={profile?.subscription_type === 'free' ? t('subscription.free') : 
                      profile?.subscription_type === 'professional' ? t('subscription.professional') : t('subscription.premium')}
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
          
          <MenuItem onClick={async () => {
            handleUserMenuClose();
            await navigateWithConfirmation('/account');
          }} sx={{ borderRadius: '8px', mb: 0.5 }}>
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            {t('buttons.profile')}
          </MenuItem>

          {/* Language Selector */}
          <MenuItem 
            sx={{ 
              borderRadius: '8px', 
              mb: 0.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'transparent',
              },
              cursor: 'default'
            }}
          >
            <ListItemIcon>
              <Languages size={18} />
            </ListItemIcon>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {t('language.title', 'Language')}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {languages.map((language) => (
                  <Box
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: language.code === i18n.language ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                      border: `1px solid ${language.code === i18n.language ? theme.palette.primary.main : 'transparent'}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                      transition: 'all 0.2s ease',
                    }}
                    title={language.name}
                  >
                    <span style={{ fontSize: '1rem' }}>{language.flag}</span>
                  </Box>
                ))}
              </Stack>
            </Box>
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
            {t('buttons.logout')}
          </MenuItem>
        </Box>
      </MuiMenu>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthModalClose}
      />
    </AppBar>
  );
};

export default Header; 