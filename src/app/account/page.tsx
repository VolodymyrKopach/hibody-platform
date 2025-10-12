'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  User, 
  Settings, 
  Shield, 
  BarChart3,
  Crown 
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Layout from '@/components/layout/Layout';
import ProfileSection from '@/components/account/ProfileSection';
import StatsSection from '@/components/account/StatsSection';
import SecuritySection from '@/components/account/SecuritySection';
import SubscriptionSection from '@/components/account/SubscriptionSection';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `account-tab-${index}`,
    'aria-controls': `account-tabpanel-${index}`,
  };
}

const AccountPage: React.FC = () => {
  const { t } = useTranslation(['account', 'common']);
  const theme = useTheme();
  const { user, profile } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return theme.palette.error.main;
      case 'teacher':
        return theme.palette.primary.main;
      case 'student':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[600];
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'pro':
        return '#FFD700';
      case 'premium':
        return '#FFD700';
      case 'professional':
        return theme.palette.primary.main;
      case 'free':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header with user info */}
          <Card
            sx={{
              mb: 4,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.full_name || user?.email}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2rem',
                    fontWeight: 600,
                  }}
                >
                  {(profile?.full_name || user?.email || '').charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {profile?.full_name || t('common:roles.user')}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={t(`common:roles.${profile?.role || 'user'}`)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getRoleColor(profile?.role || ''), 0.1),
                        color: getRoleColor(profile?.role || ''),
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      label={t(`common:subscriptionTypes.${profile?.subscription_type || 'free'}`)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getSubscriptionColor(profile?.subscription_type || ''), 0.1),
                        color: getSubscriptionColor(profile?.subscription_type || ''),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Main content with tabs */}
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="account tabs"
                sx={{
                  px: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    minHeight: 64,
                  },
                }}
              >
                <Tab
                  icon={<User size={20} />}
                  label={t('account:tabs.profile')}
                  iconPosition="start"
                  {...a11yProps(0)}
                />
                <Tab
                  icon={<Crown size={20} />}
                  label={t('account:tabs.subscription')}
                  iconPosition="start"
                  {...a11yProps(1)}
                />
                <Tab
                  icon={<BarChart3 size={20} />}
                  label={t('account:tabs.stats')}
                  iconPosition="start"
                  {...a11yProps(2)}
                />
                <Tab
                  icon={<Shield size={20} />}
                  label={t('account:tabs.security')}
                  iconPosition="start"
                  {...a11yProps(3)}
                />
              </Tabs>
            </Box>

            <Box sx={{ px: 3, pb: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <ProfileSection />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <SubscriptionSection />
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <StatsSection />
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <SecuritySection />
              </TabPanel>
            </Box>
          </Card>
        </Container>
      </Layout>
  );
};

export default AccountPage; 