/**
 * === SOLID: SRP - Optimized Batch Edit Progress Component ===
 * 
 * Component for displaying batch edit progress with real-time updates
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock,
  Zap
} from 'lucide-react';
import { BatchEditProgress } from '@/services/slides/OptimizedBatchEditService';

// === SOLID: SRP - Styled Components ===
const ProgressContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.default, 0.3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}));

const CurrentSlideBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  marginBottom: theme.spacing(2),
}));

const ResultItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// === SOLID: ISP - Component interface ===
interface OptimizedBatchEditProgressProps {
  progress: BatchEditProgress;
  showDetails?: boolean;
  compact?: boolean;
}

// === SOLID: SRP - Format time utility ===
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// === SOLID: SRP - Get status color ===
const getStatusColor = (success: boolean) => {
  return success ? 'success' : 'error';
};

// === SOLID: SRP - Main Component ===
const OptimizedBatchEditProgress: React.FC<OptimizedBatchEditProgressProps> = ({
  progress,
  showDetails = true,
  compact = false
}) => {
  const { t } = useTranslation(['slides', 'common']);
  const theme = useTheme();

  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const isCompleted = progress.isCompleted;
  const hasErrors = progress.errors.length > 0;

  return (
    <ProgressContainer>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Edit3 size={24} color={theme.palette.primary.main} />
          <Typography variant="h6">
            {isCompleted ? 'Batch Edit Complete' : 'Batch Editing in Progress'}
          </Typography>
        </Box>
        <Chip 
          label={isCompleted ? 'Completed' : 'Processing'}
          color={isCompleted ? 'success' : 'primary'}
          size="small"
        />
      </Box>

      {/* Current Slide Info */}
      {!isCompleted && progress.currentSlide && (
        <CurrentSlideBox>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Currently Editing:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {progress.currentSlide}
          </Typography>
          {progress.currentInstruction && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
              "{progress.currentInstruction}"
            </Typography>
          )}
        </CurrentSlideBox>
      )}

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {progress.completed} of {progress.total} slides
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progressPercentage)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Stats */}
      <StatsContainer>
        <Chip 
          icon={<Zap size={16} />}
          label={`${progress.total} slides`}
          color="primary"
          variant="outlined"
          size="small"
        />
        <Chip 
          icon={<CheckCircle size={16} />}
          label={`${progress.results.length} success`}
          color="success"
          variant="outlined"
          size="small"
        />
        {hasErrors && (
          <Chip 
            icon={<XCircle size={16} />}
            label={`${progress.errors.length} errors`}
            color="error"
            variant="outlined"
            size="small"
          />
        )}
        {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
          <Chip 
            icon={<Clock size={16} />}
            label={`~${formatTime(Math.ceil(progress.estimatedTimeRemaining / 1000))} remaining`}
            color="default"
            variant="outlined"
            size="small"
          />
        )}
      </StatsContainer>

      {/* Error Alert */}
      {hasErrors && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {progress.errors.length} slide(s) failed to edit. Check details below.
          </Typography>
        </Alert>
      )}

      {/* Detailed Results */}
      {showDetails && !compact && (progress.results.length > 0 || progress.errors.length > 0) && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Results
          </Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {/* Successful results */}
            {progress.results.map((result) => (
              <ResultItem key={result.slideId}>
                <ListItemIcon>
                  <CheckCircle size={20} color={theme.palette.success.main} />
                </ListItemIcon>
                <ListItemText
                  primary={result.slideId}
                  secondary={`Edited successfully in ${result.editingTime}ms`}
                />
                <Chip 
                  size="small"
                  label="Success"
                  color="success"
                  variant="outlined"
                />
              </ResultItem>
            ))}

            {/* Error results */}
            {progress.errors.map((error, index) => (
              <ResultItem key={`error-${error.slideId}-${index}`}>
                <ListItemIcon>
                  <XCircle size={20} color={theme.palette.error.main} />
                </ListItemIcon>
                <ListItemText
                  primary={error.slideId}
                  secondary={`Failed: ${error.error}`}
                />
                <Chip 
                  size="small"
                  label="Failed"
                  color="error"
                  variant="outlined"
                />
              </ResultItem>
            ))}
          </List>
        </Box>
      )}

      {/* Completion Summary */}
      {isCompleted && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
            🎉 Batch edit completed! {progress.results.length} slides edited successfully
            {hasErrors && `, ${progress.errors.length} failed`}.
          </Typography>
        </Box>
      )}
    </ProgressContainer>
  );
};

export default OptimizedBatchEditProgress;
