'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Home,
  MessageSquare,
  FileText,
  BookTemplate,
  BarChart,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Search,
  Plus,
  Star,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const [templatesExpanded, setTemplatesExpanded] = useState(false);

  const menuItems = [
    {
      label: 'Головна',
      icon: Home,
      href: '/',
      exact: true
    },
    {
      label: 'AI Чат',
      icon: MessageSquare,
      href: '/chat'
    },
    {
      label: 'AI Зображення',
      icon: Star,
      href: '/images'
    },
    {
      label: 'Мої матеріали',
      icon: FileText,
      href: '/materials'
    },
    {
      label: 'Шаблони',
      icon: BookTemplate,
      href: '/templates'
    },
    {
      label: 'Аналітика',
      icon: BarChart,
      href: '/analytics'
    }
  ];

  const bottomMenuItems = [
    {
      label: 'Налаштування',
      icon: Settings,
      href: '/settings'
    },
    {
      label: 'Профіль',
      icon: User,
      href: '/profile'
    }
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleTemplatesClick = () => {
    setTemplatesExpanded(!templatesExpanded);
  };

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.href, item.exact);

    return (
      <ListItem key={index} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          component={Link}
          href={item.href}
          sx={{
            minHeight: 48,
            px: 2.5,
            borderRadius: '12px',
            mx: 1,
            mb: 0.5,
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.primary.main,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: 'center',
              color: 'inherit',
            }}
          >
            <Icon size={20} />
          </ListItemIcon>
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
        </ListItemButton>
      </ListItem>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width: isCollapsed ? 80 : 280,
        height: '100%',
        backgroundColor: 'white',
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
          justifyContent: 'flex-end',
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

      {/* Bottom menu */}
      <Box sx={{ pb: 2 }}>
        <Divider sx={{ mx: 2, mb: 2 }} />
        <List>
          {bottomMenuItems.map((item, index) => renderMenuItem(item, index))}
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