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
          setError(data.error?.message || 'Помилка завантаження статистики');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Помилка підключення до сервера');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Невідомо';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сьогодні';
    if (diffInDays === 1) return 'Вчора';
    if (diffInDays < 7) return `${diffInDays} днів тому`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} тижнів тому`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} місяців тому`;
    return `${Math.floor(diffInDays / 365)} років тому`;
  };

  const getSubscriptionLabel = (type: string) => {
    switch (type) {
      case 'free':
        return 'Безкоштовна';
      case 'professional':
        return 'Професійна';
      case 'premium':
        return 'Преміум';
      default:
        return 'Невідома';
    }
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
        Статистика недоступна
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        📊 Ваша статистика
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
          title="Уроки"
          value={stats.totalLessons}
          subtitle="Всього створено"
          color={theme.palette.primary.main}
        />
        <StatCard
          icon={<Presentation size={24} />}
          title="Слайди"
          value={stats.totalSlides}
          subtitle="Всього згенеровано"
          color={theme.palette.secondary.main}
        />
        <StatCard
          icon={<Calendar size={24} />}
          title="За місяць"
          value={stats.monthlyLessons}
          subtitle="Нових уроків"
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
          title="Остання активність"
          value={formatRelativeTime(stats.lastActivity)}
          subtitle="Створення контенту"
          color={theme.palette.info.main}
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title="Продуктивність"
          value={`${(stats.totalSlides / Math.max(stats.totalLessons, 1)).toFixed(1)}`}
          subtitle="Слайдів на урок"
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
              📈 Аналіз активності
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
                Середня кількість слайдів
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {(stats.totalSlides / Math.max(stats.totalLessons, 1)).toFixed(1)} на урок
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Тип підписки
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
            ℹ️ Інформація про акаунт
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
                Дата реєстрації
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(stats.joinedAt)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Останній вхід
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