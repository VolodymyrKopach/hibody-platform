'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  useTheme,
  Chip,
} from '@mui/material';
import { 
  BookOpen, 
  Presentation, 
  Calendar,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserStats {
  totalLessons: number;
  totalSlides: number;
  lastActivity: string | null;
  monthlyLessons: number;
  joinedAt: string;
  subscriptionType: string;
  lastSignIn: string | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = '#1976d2' 
}) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      borderRadius: '12px',
      border: `1px solid ${theme.palette.divider}`,
      height: '100%',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          mb: 1,
          color: 'text.primary',
        }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const StatsSection: React.FC = () => {
  const { t } = useTranslation(['account', 'common']);
  const theme = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.error?.message || t('account:stats.loadError'));
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(t('common:errors.serverError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('account:stats.unknown');
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t('account:stats.unknown');
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t('account:stats.today');
    if (diffInDays === 1) return t('account:stats.yesterday');
    if (diffInDays < 7) return `${diffInDays} ${t('account:stats.daysAgo')}`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${t('account:stats.weeksAgo')}`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ${t('account:stats.monthsAgo')}`;
    return `${Math.floor(diffInDays / 365)} ${t('account:stats.yearsAgo')}`;
  };

  const getSubscriptionLabel = (type: string) => {
    return t(`common:subscriptionTypes.${type}`, { defaultValue: t('account:stats.unknown') });
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
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

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info">
        {t('account:stats.loadError')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        📊 {t('common:stats.yourStats')}
      </Typography>

      {/* Main Stats Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '1fr 1fr 1fr'
        },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          icon={<BookOpen size={24} />}
          title={t('account:stats.lessons')}
          value={stats.totalLessons}
          subtitle={t('account:stats.totalCreated')}
          color={theme.palette.primary.main}
        />
        <StatCard
          icon={<Presentation size={24} />}
          title={t('account:stats.slides')}
          value={stats.totalSlides}
          subtitle={t('account:stats.totalGenerated')}
          color={theme.palette.secondary.main}
        />
        <StatCard
          icon={<Calendar size={24} />}
          title={t('account:stats.thisMonth')}
          value={stats.monthlyLessons}
          subtitle={t('account:stats.newLessons')}
          color={theme.palette.success.main}
        />
      </Box>

      {/* Activity Stats */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr'
        },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          icon={<Clock size={24} />}
          title={t('account:stats.lastActivity')}
          value={formatRelativeTime(stats.lastActivity)}
          subtitle={t('account:stats.contentCreation')}
          color={theme.palette.info.main}
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title={t('account:stats.productivity')}
          value={`${(stats.totalSlides / Math.max(stats.totalLessons, 1)).toFixed(1)}`}
          subtitle={t('account:stats.slidesPerLesson')}
          color={theme.palette.warning.main}
        />
      </Box>

      {/* Analysis Section */}
      <Card sx={{ 
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
        border: `1px solid ${theme.palette.divider}`,
        mb: 4
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Award size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              📈 {t('common:stats.activityAnalysis')}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr'
            },
            gap: 3
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('common:stats.averageSlides')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {(stats.totalSlides / Math.max(stats.totalLessons, 1)).toFixed(1)} {t('common:stats.slidesPerLesson')}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('common:stats.subscriptionType')}
              </Typography>
              <Chip 
                label={getSubscriptionLabel(stats.subscriptionType)}
                sx={{ 
                  backgroundColor: getSubscriptionColor(stats.subscriptionType),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card sx={{ 
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            ℹ️ {t('common:stats.accountInfo')}
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr'
            },
            gap: 3
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('common:dates.joinedAt')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(stats.joinedAt)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('common:dates.lastSignIn')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatRelativeTime(stats.lastSignIn)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StatsSection; 