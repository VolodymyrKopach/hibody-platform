import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  Download,
  Share2,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { SimpleLesson } from '@/types/chat';
import { GenerationStats } from '@/services/chat/ParallelSlideGenerationService';

export interface GenerationControlsProps {
  // Стан генерації
  isGenerating?: boolean;
  isPaused?: boolean;
  isCompleted?: boolean;
  hasError?: boolean;
  
  // Дані прогресу
  totalSlides: number;
  completedSlides: number;
  failedSlides?: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  
  // Дані уроку
  currentLesson?: SimpleLesson | null;
  generationStats?: GenerationStats;
  
  // Callbacks
  onBack?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  
  // Опції відображення
  showDetailedStats?: boolean;
  showEstimatedTime?: boolean;
  compact?: boolean;
}

const GenerationControls: React.FC<GenerationControlsProps> = ({
  isGenerating = false,
  isPaused = false,
  isCompleted = false,
  hasError = false,
  totalSlides,
  completedSlides,
  failedSlides = 0,
  overallProgress,
  estimatedTimeRemaining,
  currentLesson,
  generationStats,
  onBack,
  onPause,
  onResume,
  onStop,
  onRestart,
  onSave,
  onDownload,
  onShare,
  onSettings,
  showDetailedStats = true,
  showEstimatedTime = true,
  compact = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Визначаємо поточний стан
  const getStatusInfo = () => {
    if (hasError) {
      return {
        status: 'error',
        color: theme.palette.error.main,
        icon: <AlertTriangle size={16} />,
        text: t('createLesson.step3.status.error')
      };
    }
    
    if (isCompleted) {
      return {
        status: 'completed',
        color: theme.palette.success.main,
        icon: <CheckCircle size={16} />,
        text: t('createLesson.step3.status.completed')
      };
    }
    
    if (isPaused) {
      return {
        status: 'paused',
        color: theme.palette.warning.main,
        icon: <Pause size={16} />,
        text: t('createLesson.step3.status.paused')
      };
    }
    
    if (isGenerating) {
      return {
        status: 'generating',
        color: theme.palette.primary.main,
        icon: <Play size={16} />,
        text: t('createLesson.step3.status.generating')
      };
    }
    
    return {
      status: 'idle',
      color: theme.palette.grey[500],
      icon: <Clock size={16} />,
              text: t('createLesson.step3.idle.title')
    };
  };

  const statusInfo = getStatusInfo();

  // Форматування часу
  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Обробка зупинки генерації
  const handleStopClick = () => {
    if (isGenerating) {
      setShowStopDialog(true);
    }
  };

  const handleConfirmStop = () => {
    onStop?.();
    setShowStopDialog(false);
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: compact ? 2 : 3,
          backgroundColor: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: compact ? 1.5 : 2
        }}>
          {/* Status Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.text}
              sx={{
                backgroundColor: alpha(statusInfo.color, 0.1),
                color: statusInfo.color,
                border: `1px solid ${alpha(statusInfo.color, 0.3)}`,
                fontWeight: 600
              }}
            />
            
            {currentLesson && (
              <Typography variant="body2" color="text.secondary">
                {currentLesson.title}
              </Typography>
            )}
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {showDetailedStats && (
              <Tooltip title={t('createLesson.step3.controls.viewStats')}>
                <IconButton
                  size="small"
                  onClick={() => setShowStatsDialog(true)}
                >
                  <Info size={16} />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={t('createLesson.step3.controls.settings')}>
              <IconButton
                size="small"
                onClick={onSettings}
              >
                <Settings size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Section */}
        <Box sx={{ mb: compact ? 1.5 : 2 }}>
          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: compact ? 6 : 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.grey[300], 0.3),
              mb: 1,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: statusInfo.color
              }
            }}
          />

          {/* Progress Info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2" color="text.secondary">
              {t('createLesson.step3.controls.slidesCompleted', { count: completedSlides, total: totalSlides, percent: Math.round(overallProgress) })}
            </Typography>

            {showEstimatedTime && estimatedTimeRemaining && isGenerating && (
              <Typography variant="body2" color="text.secondary">
                {t('createLesson.step3.controls.timeRemaining', { time: formatTime(estimatedTimeRemaining) })}
              </Typography>
            )}
          </Box>

          {/* Slide Status Chips */}
          {!compact && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {completedSlides > 0 && (
                <Chip
                  size="small"
                  icon={<CheckCircle size={12} />}
                  label={t('createLesson.step3.controls.completed', { count: completedSlides })}
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}
                />
              )}
              
              {isGenerating && (
                <Chip
                  size="small"
                  icon={<Play size={12} />}
                  label={t('createLesson.step3.controls.generating')}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                />
              )}
              
              {failedSlides > 0 && (
                <Chip
                  size="small"
                  icon={<AlertTriangle size={12} />}
                  label={t('createLesson.step3.controls.failed', { count: failedSlides })}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {/* Left Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={onBack}
              size={compact ? "small" : "medium"}
            >
              {t('createLesson.step3.controls.back')}
            </Button>
          </Box>

          {/* Center Actions - Generation Controls */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isGenerating && !isPaused && (
              <Button
                variant="outlined"
                startIcon={<Pause />}
                onClick={onPause}
                size={compact ? "small" : "medium"}
              >
                {t('createLesson.step3.controls.pause')}
              </Button>
            )}

            {isPaused && (
              <Button
                variant="contained"
                startIcon={<Play />}
                onClick={onResume}
                size={compact ? "small" : "medium"}
              >
                {t('createLesson.step3.controls.resume')}
              </Button>
            )}

            {(isGenerating || isPaused) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Square />}
                onClick={handleStopClick}
                size={compact ? "small" : "medium"}
              >
                {t('createLesson.step3.controls.stop')}
              </Button>
            )}

            {(hasError || (isCompleted && failedSlides > 0)) && (
              <Button
                variant="outlined"
                startIcon={<RotateCcw />}
                onClick={onRestart}
                size={compact ? "small" : "medium"}
              >
                {t('createLesson.step3.controls.retry')}
              </Button>
            )}
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isCompleted && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={onDownload}
                  size={compact ? "small" : "medium"}
                >
                  {t('createLesson.step3.controls.download')}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Share2 />}
                  onClick={onShare}
                  size={compact ? "small" : "medium"}
                >
                  {t('createLesson.step3.controls.share')}
                </Button>
              </>
            )}

            {(isCompleted || completedSlides > 0) && (
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={onSave}
                size={compact ? "small" : "medium"}
              >
                {t('createLesson.step3.controls.saveLesson')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Stop Confirmation Dialog */}
      <Dialog open={showStopDialog} onClose={() => setShowStopDialog(false)}>
        <DialogTitle>{t('createLesson.step3.controls.stopConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('createLesson.step3.controls.stopConfirmMessage')}
          </Alert>
          <Typography>
            {t('createLesson.step3.controls.stopConfirmDescription', { completedSlides, totalSlides })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStopDialog(false)}>
            {t('createLesson.step3.controls.cancel')}
          </Button>
          <Button onClick={handleConfirmStop} color="error" variant="contained">
            {t('createLesson.step3.controls.stopGeneration')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog 
        open={showStatsDialog} 
        onClose={() => setShowStatsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('createLesson.step3.stats.title')}</DialogTitle>
        <DialogContent>
          {generationStats ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('createLesson.step3.stats.progress')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createLesson.step3.stats.totalSlides', { count: generationStats.totalSlides || 0 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createLesson.step3.stats.completedSlides', { count: generationStats.completedSlides || 0 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createLesson.step3.stats.failedSlides', { count: generationStats.failedSlides || 0 })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('createLesson.step3.stats.timing')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createLesson.step3.stats.startTime', { time: generationStats.startTime ? generationStats.startTime.toLocaleTimeString() : 'N/A' })}
                </Typography>
                {generationStats.endTime && (
                  <Typography variant="body2" color="text.secondary">
                    {t('createLesson.step3.stats.completedTime', { time: generationStats.endTime.toLocaleTimeString() })}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {t('createLesson.step3.stats.duration', { time: formatTime(Math.floor((generationStats.totalTimeMs || 0) / 1000)) })}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              {t('createLesson.step3.stats.noStats')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatsDialog(false)}>
            {t('createLesson.step3.stats.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GenerationControls;
