/**
 * === SOLID: SRP - Slide Edit Progress Modal ===
 * 
 * Modal component for tracking batch slide editing progress
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  useTheme,
  alpha,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Loader2,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

// === SOLID: SRP - Styled Components ===
const ProgressContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
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

const StatChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const SlideResultItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// === SOLID: ISP - Component interfaces ===
export interface BatchProgress {
  batchId: string;
  completed: number;
  total: number;
  currentSlide?: number;
  status: 'editing' | 'completed' | 'error';
  estimatedTimeRemaining?: number;
  results?: BatchEditResult[];
}

export interface BatchEditResult {
  slideId: string;
  slideIndex: number;
  success: boolean;
  updatedSlide?: any;
  previewUrl?: string;
  error?: string;
  editingTime: number;
}

interface SlideEditProgressModalProps {
  open: boolean;
  onClose: () => void;
  batchId: string;
  editInstruction: string;
  slideNumbers: number[];
  onComplete?: (results: BatchEditResult[]) => void;
  onCancel?: () => void;
}

// === SOLID: SRP - Progress polling hook ===
const useProgressPolling = (
  batchId: string, 
  enabled: boolean,
  onComplete?: (results: BatchEditResult[]) => void
) => {
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!enabled || !batchId) return;

    try {
      const response = await fetch(`/api/slides/batch-edit/${batchId}/progress`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
        setError(null);

        // Check if completed
        if (data.progress.status === 'completed' && onComplete) {
          onComplete(data.progress.results || []);
        }
      } else {
        setError(data.error || 'Failed to fetch progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }, [batchId, enabled, onComplete]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchProgress();

    // Poll every 500ms
    const interval = setInterval(fetchProgress, 500);

    return () => clearInterval(interval);
  }, [fetchProgress, enabled]);

  return { progress, error };
};

// === SOLID: SRP - Format time utility ===
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// === SOLID: SRP - Get status color ===
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'error': return 'error';
    case 'editing': return 'primary';
    default: return 'default';
  }
};

// === SOLID: SRP - Get status icon ===
const getStatusIcon = (success: boolean, isProcessing: boolean) => {
  if (isProcessing) return <Loader2 size={20} className="animate-spin" />;
  return success ? <CheckCircle size={20} /> : <XCircle size={20} />;
};

// === SOLID: SRP - Main Component ===
const SlideEditProgressModal: React.FC<SlideEditProgressModalProps> = ({
  open,
  onClose,
  batchId,
  editInstruction,
  slideNumbers,
  onComplete,
  onCancel
}) => {
  const { t } = useTranslation(['slides', 'common']);
  const theme = useTheme();
  const [isCancelling, setIsCancelling] = useState(false);

  // Poll progress
  const { progress, error } = useProgressPolling(batchId, open, onComplete);

  // Handle cancel
  const handleCancel = async () => {
    if (!batchId || isCancelling) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/slides/batch-edit/${batchId}/progress`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onCancel?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to cancel batch edit:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress ? (progress.completed / progress.total) * 100 : 0;
  const isCompleted = progress?.status === 'completed';
  const hasError = progress?.status === 'error' || !!error;

  return (
    <Dialog
      open={open}
      onClose={isCompleted ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit3 size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" component="span">
              Batch Slide Editing
            </Typography>
          </Box>
          {isCompleted && (
            <IconButton onClick={onClose} size="small">
              <X size={20} />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Error Alert */}
        {hasError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {error || 'An error occurred during batch editing'}
            </Typography>
          </Alert>
        )}

        {/* Edit Instruction */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Edit Instruction:
          </Typography>
          <Typography variant="body1" sx={{ 
            fontStyle: 'italic',
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            "{editInstruction}"
          </Typography>
        </Box>

        {/* Progress Section */}
        <ProgressContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Progress
            </Typography>
            <Chip 
              label={progress?.status || 'starting'}
              color={getStatusColor(progress?.status || 'default') as any}
              size="small"
            />
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {progress?.completed || 0} of {progress?.total || slideNumbers.length} slides
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
            <StatChip 
              icon={<PlayCircle size={16} />}
              label={`${slideNumbers.length} slides`}
              color="primary"
              variant="outlined"
            />
            {progress?.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
              <StatChip 
                icon={<Clock size={16} />}
                label={`~${formatTime(Math.ceil(progress.estimatedTimeRemaining / 1000))} remaining`}
                color="default"
                variant="outlined"
              />
            )}
            {progress?.currentSlide && (
              <StatChip 
                icon={<Edit3 size={16} />}
                label={`Editing slide ${progress.currentSlide}`}
                color="secondary"
                variant="outlined"
              />
            )}
          </StatsContainer>
        </ProgressContainer>

        {/* Results List */}
        {progress?.results && progress.results.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Slide Results
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {progress.results.map((result, index) => (
                <SlideResultItem key={result.slideId}>
                  <ListItemIcon>
                    {getStatusIcon(result.success, false)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Slide ${result.slideIndex}`}
                    secondary={
                      result.success 
                        ? `Edited successfully in ${result.editingTime}ms`
                        : `Failed: ${result.error}`
                    }
                  />
                  <Chip 
                    size="small"
                    label={result.success ? 'Success' : 'Failed'}
                    color={result.success ? 'success' : 'error'}
                    variant="outlined"
                  />
                </SlideResultItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        {!isCompleted && !hasError && (
          <Button 
            onClick={handleCancel}
            disabled={isCancelling}
            variant="outlined"
            color="error"
            startIcon={isCancelling ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        )}
        
        {isCompleted && (
          <Button 
            onClick={onClose} 
            variant="contained"
            startIcon={<CheckCircle size={16} />}
          >
            Done
          </Button>
        )}

        {hasError && (
          <Button 
            onClick={onClose} 
            variant="outlined"
            startIcon={<AlertTriangle size={16} />}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SlideEditProgressModal;
