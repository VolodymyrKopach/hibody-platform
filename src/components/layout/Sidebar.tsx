'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  alpha,
  useTheme,
  Collapse,
  Drawer,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MessageSquare,
  FileText,
  BookOpen,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import SafeLink from '@/components/ui/SafeLink';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const pathname = usePathname();

  const menuItems = [
    {
      label: t('navigation.aiChat'),
      icon: MessageSquare,
      href: '/chat'
    },
    {
      label: t('navigation.createLesson'),
      icon: BookOpen,
      href: '/create-lesson'
    },
    {
      label: t('navigation.myMaterials'),
      icon: FileText,
      href: '/materials'
    }
  ];

  const isActive = (href: string, exact = false) => {
    // If this is the home page (/) and we are on /materials, show materials as active
    if (pathname === '/' && href === '/materials') {
      return true;
    }
    
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.href, item.exact);

    const menuButton = (
      <ListItemButton
        component={SafeLink}
        href={item.href}
        sx={{
          minHeight: 48,
          px: isCollapsed ? 1.5 : 2.5,
          borderRadius: '12px',
          mx: 1,
          mb: 0.5,
          backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            color: theme.palette.primary.main,
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed ? 0 : 2,
            justifyContent: 'center',
            color: 'inherit',
          }}
        >
          <Icon size={20} />
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText 
            primary={item.label} 
            sx={{ 
              opacity: 1,
              '& .MuiTypography-root': {
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem'
              }
            }} 
          />
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={index} disablePadding sx={{ display: 'block' }}>
        {isCollapsed ? (
          <Tooltip title={item.label} placement="right" arrow>
            {menuButton}
          </Tooltip>
        ) : (
          menuButton
        )}
      </ListItem>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width: isCollapsed ? 80 : 280,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Mobile close button */}
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          p: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            background: alpha(theme.palette.grey[500], 0.1),
            color: theme.palette.text.secondary,
            '&:hover': {
              background: alpha(theme.palette.grey[500], 0.2),
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { lg: isCollapsed ? 80 : 280 },
          flexShrink: { lg: 0 },
          display: { xs: 'none', lg: 'block' },
          transition: 'width 0.3s ease',
          height: '100%',
        }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar; 