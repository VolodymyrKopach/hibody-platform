'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Paper,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import Layout from '@/components/layout/Layout';
import { 
  Plus,
  FileText,
  Clock,
  TrendingUp,
  Users,
  Star,
  Play,
  Edit,
  Share2,
  BookOpen,
  Calculator,
  Palette,
  Music,
  ChevronRight,
  Activity,
  Target,
  Award,
  BarChart3,
  Sparkles,
  Zap,
  Heart,
  MessageCircle
} from 'lucide-react';

const Dashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Марія');
  const [loadingStats, setLoadingStats] = useState(true);
  const [animationDelay, setAnimationDelay] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const loadingTimer = setTimeout(() => {
      setLoadingStats(false);
      setTimeout(() => setAnimationDelay(true), 300);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Доброго ранку';
    if (hour < 18) return 'Доброго дня';
    return 'Доброго вечора';
  };

  const stats = [
    {
      title: 'Матеріалів створено',
      value: '12',
      previousValue: 9,
      change: '+3 цього тижня',
      icon: FileText,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08),
      trend: 'up',
      percentage: 33
    },
    {
      title: 'Загальних переглядів',
      value: '248',
      previousValue: 200,
      change: '+24% від минулого місяця',
      icon: TrendingUp,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.08),
      trend: 'up',
      percentage: 24
    },
    {
      title: 'Часу заощаджено',
      value: '8.5 год',
      previousValue: 6.2,
      change: 'В середньому на тиждень',
      icon: Clock,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.08),
      trend: 'up',
      percentage: 37
    },
    {
      title: 'Учнів залучено',
      value: '85',
      previousValue: 76,
      change: 'Активних цього місяця',
      icon: Users,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.08),
      trend: 'up',
      percentage: 12
    }
  ];

  const quickActions = [
    {
      title: 'Математичний квіз',
      description: 'Створити інтерактивний квіз з математики',
      icon: Calculator,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
      href: '/create?type=quiz&subject=math',
      estimatedTime: '5 хв',
      popularity: 'Найпопулярніше',
      chipColor: 'error',
      emoji: '🧮'
    },
    {
      title: 'Історія-розповідь',
      description: 'Згенерувати освітню історію',
      icon: BookOpen,
      color: theme.palette.secondary.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
      href: '/create?type=story&subject=language',
      estimatedTime: '8 хв',
      popularity: 'Рекомендоване',
      chipColor: 'primary',
      emoji: '📚'
    },
    {
      title: 'Творче завдання',
      description: 'Створити арт-проект для дітей',
      icon: Palette,
      color: '#EC4899',
      bgGradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      href: '/create?type=art&subject=art',
      estimatedTime: '10 хв',
      popularity: 'Новинка',
      chipColor: 'success',
      emoji: '🎨'
    },
    {
      title: 'Музична гра',
      description: 'Інтерактивна музична активність',
      icon: Music,
      color: theme.palette.warning.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
      href: '/create?type=game&subject=music',
      estimatedTime: '7 хв',
      popularity: 'Трендінг',
      chipColor: 'secondary',
      emoji: '🎵'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Таблиця множення - Гра',
      subject: 'Математика',
      type: 'Інтерактивна гра',
      createdAt: '2 години тому',
      views: 12,
      status: 'completed',
      thumbnail: '🔢',
      completionRate: 95,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
    },
    {
      id: 2,
      name: 'Англійський алфавіт',
      subject: 'Англійська мова',
      type: 'Квіз',
      createdAt: 'Вчора',
      views: 28,
      status: 'completed',
      thumbnail: '🔤',
      completionRate: 88,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`
    },
    {
      id: 3,
      name: 'Кольори та форми',
      subject: 'Творчість',
      type: 'Інтерактивне завдання',
      createdAt: '3 дні тому',
      views: 45,
      status: 'completed',
      thumbnail: '🎨',
      completionRate: 92,
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899, #F472B6)'
    }
  ];

  const popularTemplates = [
    {
      id: 1,
      name: 'Пригода в космосі',
      category: 'Наука',
      difficulty: 'Легко',
      rating: 4.9,
      uses: 156,
      thumbnail: '🚀',
      tags: ['Космос', 'Дослідження'],
      color: '#8B5CF6'
    },
    {
      id: 2,
      name: 'Зоопарк тварин',
      category: 'Природа',
      difficulty: 'Легко',
      rating: 4.8,
      uses: 203,
      thumbnail: '🦁',
      tags: ['Тварини', 'Природа'],
      color: theme.palette.secondary.main
    },
    {
      id: 3,
      name: 'Магічні числа',
      category: 'Математика',
      difficulty: 'Середньо',
      rating: 4.7,
      uses: 189,
      thumbnail: '✨',
      tags: ['Числа', 'Логіка'],
      color: theme.palette.warning.main
    }
  ];

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.default,
          py: 2,
        }}
      >
        <Box sx={{ width: '100%', px: 3 }}>
          {/* Hero Section with Glassmorphism */}
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                background: 'white',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: '20px',
                p: 3,
                mb: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {getGreeting()}, {userName}! 
                    <Box component="span" sx={{ ml: 1, fontSize: '0.8em' }}>🌟</Box>
                  </Typography>
                  <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}>
                    Готові створити щось неймовірне сьогодні?
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    {currentTime.toLocaleDateString('uk-UA', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Sparkles size={20} />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                    color: 'white',
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.warning.main, 0.5)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Створити новий матеріал
                </Button>
              </Stack>
            </Paper>
          </Fade>

          {/* Stats Cards */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <BarChart3 size={24} />
              Ваша статистика
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {stats.map((stat, index) => (
                <Grow key={index} in={!loadingStats} timeout={600 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      background: 'white',
                      border: `1px solid ${alpha(stat.color, 0.1)}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px ${alpha(stat.color, 0.3)}`,
                          }}
                        >
                          <stat.icon size={24} color="white" />
                        </Box>
                        <Chip
                          label={`+${stat.percentage}%`}
                          size="small"
                          sx={{
                            background: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          }}
                        />
                      </Stack>
                      
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {stat.change}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Zap size={24} />
              Швидкі дії
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {quickActions.map((action, index) => (
                <Grow key={index} in={animationDelay} timeout={800 + index * 150}>
                  <Card
                    elevation={0}
                    sx={{
                      background: 'white',
                      border: `1px solid ${alpha(action.color, 0.1)}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: '120px',
                        background: action.bgGradient,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        },
                      }}
                    >
                      <Typography variant="h2" sx={{ position: 'relative', zIndex: 1 }}>
                        {action.emoji}
                      </Typography>
                      <Chip
                        label={action.popularity}
                        size="small"
                        color={action.chipColor as any}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
                        {action.description}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Clock size={16} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {action.estimatedTime}
                          </Typography>
                        </Stack>
                        <IconButton
                          size="small"
                          sx={{
                            background: alpha(action.color, 0.1),
                            color: action.color,
                            '&:hover': {
                              background: alpha(action.color, 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <ChevronRight size={18} />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </Box>
          </Box>

          {/* Recent Projects & Popular Templates */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 4,
            }}
          >
            {/* Recent Projects */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Activity size={24} />
                Останні проекти
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  background: 'white',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                {recentProjects.map((project, index) => (
                  <Box key={project.id}>
                    <Box sx={{ p: 3 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            background: project.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: `0 8px 24px ${alpha(project.color, 0.3)}`,
                          }}
                        >
                          {project.thumbnail}
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            {project.subject} • {project.type}
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {project.createdAt}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {project.views} переглядів
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <LinearProgress
                              variant="determinate"
                              value={project.completionRate}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(project.color, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${project.color}, ${alpha(project.color, 0.8)})`,
                                  borderRadius: 3,
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ color: project.color, fontWeight: 600 }}>
                              {project.completionRate}%
                            </Typography>
                          </Stack>
                        </Box>
                        
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) },
                            }}
                          >
                            <Play size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              background: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              '&:hover': { background: alpha(theme.palette.success.main, 0.2) },
                            }}
                          >
                            <Edit size={16} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                    {index < recentProjects.length - 1 && (
                      <Divider sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }} />
                    )}
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Popular Templates */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Heart size={24} />
                Популярні шаблони
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  background: 'white',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                {popularTemplates.map((template, index) => (
                  <Box key={template.id}>
                    <Box sx={{ p: 3 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${template.color}, ${alpha(template.color, 0.7)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: `0 8px 24px ${alpha(template.color, 0.3)}`,
                          }}
                        >
                          {template.thumbnail}
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            {template.category} • {template.difficulty}
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Star size={14} fill="currentColor" color={theme.palette.warning.main} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {template.rating}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {template.uses} використань
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" spacing={1}>
                            {template.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 24,
                                  background: alpha(template.color, 0.1),
                                  color: template.color,
                                  border: `1px solid ${alpha(template.color, 0.2)}`,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                        
                        <IconButton
                          size="small"
                          sx={{
                            background: alpha(template.color, 0.1),
                            color: template.color,
                            '&:hover': {
                              background: alpha(template.color, 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <Plus size={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                    {index < popularTemplates.length - 1 && (
                      <Divider sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }} />
                    )}
                  </Box>
                ))}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard;
