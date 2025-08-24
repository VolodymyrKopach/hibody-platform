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
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Визначаємо поточний стан
  const getStatusInfo = () => {
    if (hasError) {
      return {
        status: 'error',
        color: theme.palette.error.main,
        icon: <AlertTriangle size={16} />,
        text: 'Generation Failed'
      };
    }
    
    if (isCompleted) {
      return {
        status: 'completed',
        color: theme.palette.success.main,
        icon: <CheckCircle size={16} />,
        text: 'Generation Complete'
      };
    }
    
    if (isPaused) {
      return {
        status: 'paused',
        color: theme.palette.warning.main,
        icon: <Pause size={16} />,
        text: 'Generation Paused'
      };
    }
    
    if (isGenerating) {
      return {
        status: 'generating',
        color: theme.palette.primary.main,
        icon: <Play size={16} />,
        text: 'Generating Slides'
      };
    }
    
    return {
      status: 'idle',
      color: theme.palette.grey[500],
      icon: <Clock size={16} />,
      text: 'Ready to Generate'
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
              <Tooltip title="View detailed statistics">
                <IconButton
                  size="small"
                  onClick={() => setShowStatsDialog(true)}
                >
                  <Info size={16} />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Settings">
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
              {completedSlides} of {totalSlides} slides completed ({Math.round(overallProgress)}%)
            </Typography>

            {showEstimatedTime && estimatedTimeRemaining && isGenerating && (
              <Typography variant="body2" color="text.secondary">
                ~{formatTime(estimatedTimeRemaining)} remaining
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
                  label={`${completedSlides} completed`}
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
                  label="generating"
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
                  label={`${failedSlides} failed`}
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
              startIcon={<ArrowLeft />}
              onClick={onBack}
              size={compact ? "small" : "medium"}
            >
              Back
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
                Pause
              </Button>
            )}

            {isPaused && (
              <Button
                variant="contained"
                startIcon={<Play />}
                onClick={onResume}
                size={compact ? "small" : "medium"}
              >
                Resume
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
                Stop
              </Button>
            )}

            {(hasError || (isCompleted && failedSlides > 0)) && (
              <Button
                variant="outlined"
                startIcon={<RotateCcw />}
                onClick={onRestart}
                size={compact ? "small" : "medium"}
              >
                Retry
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
                  Download
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Share2 />}
                  onClick={onShare}
                  size={compact ? "small" : "medium"}
                >
                  Share
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
                Save Lesson
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Stop Confirmation Dialog */}
      <Dialog open={showStopDialog} onClose={() => setShowStopDialog(false)}>
        <DialogTitle>Stop Generation?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will stop the current generation process. Any slides that are currently being generated will be lost.
          </Alert>
          <Typography>
            {completedSlides} out of {totalSlides} slides have been completed. 
            You can save the completed slides and restart generation later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStopDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmStop} color="error" variant="contained">
            Stop Generation
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
        <DialogTitle>Generation Statistics</DialogTitle>
        <DialogContent>
          {generationStats ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total slides: {generationStats.totalSlides || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed: {generationStats.completedSlides || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed: {generationStats.failedSlides || 0}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Timing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {generationStats.startTime ? generationStats.startTime.toLocaleTimeString() : 'N/A'}
                </Typography>
                {generationStats.endTime && (
                  <Typography variant="body2" color="text.secondary">
                    Completed: {generationStats.endTime.toLocaleTimeString()}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Duration: {formatTime(Math.floor((generationStats.totalTimeMs || 0) / 1000))}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              No statistics available yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GenerationControls;
