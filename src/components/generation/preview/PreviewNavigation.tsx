import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  Typography,
  ButtonGroup,
  Chip,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ChevronLeft, 
  ChevronRight, 
  Monitor, 
  Tablet, 
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';
import { PreviewSlide } from '@/services/generation/PreviewGenerationService';

// === SOLID: SRP - Styled Components ===
const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
}));

const NavigationRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const DeviceButton = styled(IconButton)<{ active: boolean }>(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  transition: 'all 0.2s ease',
  backgroundColor: active ? 
    alpha(theme.palette.primary.main, 0.1) : 
    'transparent',
  color: active ? 
    theme.palette.primary.main : 
    theme.palette.text.secondary,
  border: `2px solid ${active ? 
    theme.palette.primary.main : 
    'transparent'}`,
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
}));

const SlideIndicator = styled(Box)<{ active: boolean; completed: boolean }>(({ theme, active, completed }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: completed ? 
    theme.palette.success.main : 
    active ? 
      theme.palette.primary.main : 
      alpha(theme.palette.text.secondary, 0.3),
  border: `2px solid ${active ? 
    theme.palette.primary.main : 
    'transparent'}`,
  
  '&:hover': {
    transform: 'scale(1.2)',
    backgroundColor: active ? 
      theme.palette.primary.main : 
      theme.palette.primary.light,
  },
}));

// === SOLID: ISP - Specific interface for PreviewNavigation ===
interface PreviewNavigationProps {
  slides: PreviewSlide[];
  currentSlideIndex: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isPlaying: boolean;
  totalProgress: number; // 0-100
  onSlideChange: (index: number) => void;
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPlayPause: () => void;
  onRestart: () => void;
  onSettings?: () => void;
}

// === SOLID: SRP - Main component ===
const PreviewNavigation: React.FC<PreviewNavigationProps> = ({
  slides,
  currentSlideIndex,
  deviceType,
  isPlaying,
  totalProgress,
  onSlideChange,
  onDeviceChange,
  onPlayPause,
  onRestart,
  onSettings
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();

  // === SOLID: SRP - Handle navigation ===
  const handlePrevious = useCallback(() => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, onSlideChange]);

  const handleNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, slides.length, onSlideChange]);

  // === SOLID: SRP - Get device icon ===
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor;
      case 'tablet': return Tablet;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  // === SOLID: SRP - Calculate total duration ===
  const totalDuration = slides.reduce((sum, slide) => sum + slide.estimatedDuration, 0);
  const currentTime = slides.slice(0, currentSlideIndex + 1)
    .reduce((sum, slide) => sum + slide.estimatedDuration, 0);

  return (
    <NavigationContainer>
      {/* Progress Bar */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('generation:preview.progress', 'Прогрес превью')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(totalProgress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalProgress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        />
      </Box>

      {/* Main Navigation Row */}
      <NavigationRow>
        {/* Slide Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
            size="small"
          >
            <ChevronLeft size={20} />
          </IconButton>
          
          <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
            {currentSlideIndex + 1} / {slides.length}
          </Typography>
          
          <IconButton
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            size="small"
          >
            <ChevronRight size={20} />
          </IconButton>
        </Box>

        {/* Current Slide Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={slides[currentSlideIndex]?.type || 'content'}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              fontWeight: 500,
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {slides[currentSlideIndex]?.title}
          </Typography>
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isPlaying ? t('common:pause') : t('common:play')}>
            <IconButton onClick={onPlayPause} size="small">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('common:restart')}>
            <IconButton onClick={onRestart} size="small">
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
          
          {onSettings && (
            <Tooltip title={t('common:settings')}>
              <IconButton onClick={onSettings} size="small">
                <Settings size={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </NavigationRow>

      {/* Device Selection & Slide Indicators */}
      <NavigationRow>
        {/* Device Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {t('generation:preview.device', 'Пристрій')}:
          </Typography>
          
          <ButtonGroup size="small">
            {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
              const DeviceIcon = getDeviceIcon(device);
              
              return (
                <Tooltip
                  key={device}
                  title={t(`generation:preview.${device}`, device)}
                >
                  <DeviceButton
                    active={deviceType === device}
                    onClick={() => onDeviceChange(device)}
                  >
                    <DeviceIcon size={16} />
                  </DeviceButton>
                </Tooltip>
              );
            })}
          </ButtonGroup>
        </Box>

        {/* Slide Indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {t('generation:preview.slides', 'Слайди')}:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {slides.map((slide, index) => (
              <Tooltip
                key={slide.id}
                title={`${slide.title} (${slide.estimatedDuration}s)`}
              >
                <SlideIndicator
                  active={index === currentSlideIndex}
                  completed={index < currentSlideIndex}
                  onClick={() => onSlideChange(index)}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Timing Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            / {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
          </Typography>
        </Box>
      </NavigationRow>
    </NavigationContainer>
  );
};

export default PreviewNavigation; 