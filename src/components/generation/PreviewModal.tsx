import React, { useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  X, 
  Eye, 
  Loader2, 
  Clock, 
  Volume2, 
  FileText, 
  Palette,
  Settings,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Maximize2,
  AlertCircle
} from 'lucide-react';
import { AgeGroupConfig, FormValues } from '@/types/generation';
import { useEnhancedPreview } from '@/hooks/useEnhancedPreview';
import { EnhancedPreviewData } from '@/services/generation/PreviewGenerationService';
import EnhancedSlidePreview from './preview/SlidePreview';
import PreviewNavigation from './preview/PreviewNavigation';

// === SOLID: SRP - Styled Components ===
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 700,
    width: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  },
}));

const AnimatedDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
    transform: 'translateX(-100%)',
    animation: 'shimmer 3s infinite',
  },
  
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

const ContentContainer = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  
  '&::-webkit-scrollbar': {
    width: 6,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 3,
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 300,
  gap: theme.spacing(3),
  padding: theme.spacing(4),
}));

const CharacteristicsSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.default, 0.5),
}));

const CharacteristicCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const SampleSlideContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
}));

const SlidePreview = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  minHeight: 200,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const DevicePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const DeviceButton = styled(Button)<{ isActive?: boolean }>(({ theme, isActive }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
  background: alpha(theme.palette.primary.main, 0.1),
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '0 2px 2px 0',
    animation: 'progress 2s ease-in-out infinite alternate',
  },
  
  '@keyframes progress': {
    '0%': { width: '20%' },
    '100%': { width: '80%' },
  },
}));

// === SOLID: ISP - Specific interface for PreviewModal ===
interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  data: PreviewData | null;
  error: string | null;
  ageGroup?: AgeGroupConfig;
}

// === SOLID: SRP - PreviewModal component ===
const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  loading,
  data,
  error,
  ageGroup
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  // === SOLID: SRP - Handle device preview ===
  const [selectedDevice, setSelectedDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // === SOLID: SRP - Get device icon ===
  const getDeviceIcon = useCallback((device: string) => {
    switch (device) {
      case 'desktop': return <Monitor size={20} />;
      case 'tablet': return <Tablet size={20} />;
      case 'mobile': return <Smartphone size={20} />;
      default: return <Monitor size={20} />;
    }
  }, []);
  
  // === SOLID: SRP - Get device sizing ===
  const getDeviceStyles = useCallback((device: string) => {
    const baseStyles = {
      transition: 'all 0.3s ease',
      margin: '0 auto',
    };
    
    switch (device) {
      case 'desktop':
        return { ...baseStyles, maxWidth: '100%', aspectRatio: '16/9' };
      case 'tablet':
        return { ...baseStyles, maxWidth: '70%', aspectRatio: '4/3' };
      case 'mobile':
        return { ...baseStyles, maxWidth: '40%', aspectRatio: '9/16' };
      default:
        return baseStyles;
    }
  }, []);
  
  // === SOLID: SRP - Format duration ===
  const formatDuration = useCallback((duration: string) => {
    return duration.replace(/(\d+)/, '$1');
  }, []);
  
  // === SOLID: SRP - Get characteristics grid ===
  const characteristicsData = useMemo(() => {
    if (!data) return [];
    
    return [
      {
        icon: <Palette size={24} />,
        label: t('preview.fontSize', 'Розмір шрифту'),
        value: data.characteristics.fontSize.primary,
        color: theme.palette.primary.main,
      },
      {
        icon: <FileText size={24} />,
        label: t('preview.elementsPerSlide', 'Елементів на слайд'),
        value: data.characteristics.layout.elementsPerSlide,
        color: theme.palette.secondary.main,
      },
      {
        icon: <Settings size={24} />,
        label: t('preview.maxWords', 'Максимум слів'),
        value: data.characteristics.layout.maxWords,
        color: theme.palette.success.main,
      },
      {
        icon: <Volume2 size={24} />,
        label: t('preview.audio', 'Аудіо'),
        value: data.characteristics.audio.required ? t('common.yes', 'Так') : t('common.no', 'Ні'),
        color: data.characteristics.audio.required ? theme.palette.warning.main : theme.palette.text.secondary,
      },
      {
        icon: <Clock size={24} />,
        label: t('preview.duration', 'Тривалість'),
        value: formatDuration(data.characteristics.estimatedDuration),
        color: theme.palette.info.main,
      },
    ];
  }, [data, t, theme, formatDuration]);
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      TransitionComponent={Zoom}
      TransitionProps={{
        timeout: {
          enter: 400,
          exit: 300,
        },
      }}
    >
      <AnimatedDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Sparkles size={24} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('preview.title', 'Попередній перегляд')}
            </Typography>
            {ageGroup && (
              <Chip
                label={ageGroup.name}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
                  color: theme.palette.primary.contrastText,
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <X size={20} />
          </IconButton>
        </Box>
        {loading && <ProgressBar />}
      </AnimatedDialogTitle>

      <ContentContainer>
        {loading ? (
          <Fade in={loading} timeout={300}>
            <LoadingContainer>
              <Zoom in={loading} timeout={500}>
                <Box sx={{ position: 'relative' }}>
                  <Loader2 size={48} className="animate-spin" color={theme.palette.primary.main} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 60,
                      height: 60,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: '50%',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                </Box>
              </Zoom>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
                {t('preview.generating', 'Генерація превю...')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 300 }}>
                {t('preview.generatingDesc', 'Підготовка характеристик та прикладу слайду для вашої вікової групи')}
              </Typography>
            </LoadingContainer>
          </Fade>
        ) : error ? (
          <Fade in={!loading} timeout={300}>
            <LoadingContainer>
              <Typography variant="h6" color="error">
                {t('preview.error', 'Помилка генерації')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error}
              </Typography>
            </LoadingContainer>
          </Fade>
        ) : data ? (
          <Fade in={!loading && !!data} timeout={500}>
            <Box>
              {/* Характеристики */}
              <CharacteristicsSection>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Eye size={20} />
                  {t('preview.characteristics', 'Характеристики для')} {data.ageGroup.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 2 
                }}>
                  {characteristicsData.map((item, index) => (
                    <Slide
                      key={item.label}
                      direction="up"
                      in={!loading && !!data}
                      timeout={300 + index * 100}
                    >
                      <CharacteristicCard elevation={0}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ color: item.color }}>
                              {item.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {item.value}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </CharacteristicCard>
                    </Slide>
                  ))}
                </Box>
              </CharacteristicsSection>

              <Divider />

              {/* Приклад слайду */}
              <SampleSlideContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sparkles size={20} />
                    {t('preview.sampleSlide', 'Приклад слайду')}
                  </Typography>
                  
                  <DevicePreview>
                    {['desktop', 'tablet', 'mobile'].map((device) => (
                      <DeviceButton
                        key={device}
                        isActive={selectedDevice === device}
                        onClick={() => setSelectedDevice(device as any)}
                        size="small"
                      >
                        {getDeviceIcon(device)}
                      </DeviceButton>
                    ))}
                  </DevicePreview>
                </Box>
                
                <Slide direction="up" in={!loading && !!data} timeout={600}>
                  <SlidePreview sx={getDeviceStyles(selectedDevice)}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        fontSize: selectedDevice === 'mobile' ? '1.25rem' : '1.5rem'
                      }}
                    >
                      {data.sampleSlide.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        lineHeight: 1.6,
                        fontSize: selectedDevice === 'mobile' ? '0.875rem' : '1rem'
                      }}
                    >
                      {data.sampleSlide.content}
                    </Typography>
                    
                    {/* Елементи слайду */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mt: 3,
                      opacity: 0.7
                    }}>
                      {data.sampleSlide.elements.map((element, index) => (
                        <Chip
                          key={element.id}
                          label={element.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </SlidePreview>
                </Slide>
              </SampleSlideContainer>
            </Box>
          </Fade>
        ) : null}
      </ContentContainer>

      <DialogActions sx={{ p: 3, background: alpha(theme.palette.background.default, 0.5) }}>
        <Button onClick={onClose} variant="contained" sx={{ minWidth: 120 }}>
          {t('common.close', 'Закрити')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PreviewModal; 