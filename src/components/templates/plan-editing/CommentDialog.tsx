import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { CommentSectionType, PlanComment } from '@/types/templates';

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  initialSection?: CommentSectionType;
  initialSectionId?: string;
  title?: string;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialSection = 'general',
  initialSectionId,
  title = 'Add Comment'
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  const [sectionType, setSectionType] = useState<CommentSectionType>(initialSection);
  const [sectionId, setSectionId] = useState(initialSectionId || '');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setSectionType(initialSection);
      setSectionId(initialSectionId || '');
      setComment('');
      setPriority('medium');
      setError(null);
    }
  }, [open, initialSection, initialSectionId]);

  // Section type options
  const sectionOptions = [
    { value: 'general', label: 'General', icon: '📝', description: 'Overall plan improvements' },
    { value: 'slide', label: 'Slide', icon: '📄', description: 'Specific slide modifications' },
    { value: 'objective', label: 'Objective', icon: '🎯', description: 'Learning objectives changes' },
    { value: 'material', label: 'Material', icon: '📚', description: 'Required materials updates' },
    { value: 'game', label: 'Game', icon: '🎮', description: 'Game elements modifications' },
    { value: 'recommendation', label: 'Tip', icon: '💡', description: 'Teacher recommendations' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: theme.palette.info.main, description: 'Nice to have' },
    { value: 'medium', label: 'Medium', color: theme.palette.warning.main, description: 'Important' },
    { value: 'high', label: 'High', color: theme.palette.error.main, description: 'Critical' }
  ];

  // Validate form
  const validateForm = useCallback(() => {
    if (!comment.trim()) {
      setError('Comment text is required');
      return false;
    }

    if (comment.length < 5) {
      setError('Comment is too short (minimum 5 characters)');
      return false;
    }

    if (comment.length > 500) {
      setError('Comment is too long (maximum 500 characters)');
      return false;
    }

    if (sectionType === 'slide' && sectionId) {
      const slideNum = parseInt(sectionId);
      if (isNaN(slideNum) || slideNum < 1 || slideNum > 50) {
        setError('Slide number must be between 1 and 50');
        return false;
      }
    }

    setError(null);
    return true;
  }, [comment, sectionType, sectionId]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    onSubmit({
      sectionType,
      sectionId: sectionId.trim() || undefined,
      comment: comment.trim(),
      priority,
      status: 'pending'
    });

    onClose();
  }, [validateForm, onSubmit, sectionType, sectionId, comment, priority, onClose]);

  // Handle section type change
  const handleSectionTypeChange = (newSectionType: CommentSectionType) => {
    setSectionType(newSectionType);
    // Clear section ID when changing section type
    if (newSectionType !== 'slide') {
      setSectionId('');
    }
  };

  const selectedSection = sectionOptions.find(option => option.value === sectionType);
  const selectedPriority = priorityOptions.find(option => option.value === priority);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 600
      }}>
        <MessageSquare size={24} color={theme.palette.primary.main} />
        <Box component="span" sx={{ ml: 1 }}>
          {title} {/* Fixed HTML structure - v2 */}
        </Box>
        
        <IconButton
          onClick={onClose}
          sx={{ ml: 'auto' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Section Type Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Section Type</InputLabel>
          <Select
            value={sectionType}
            label="Section Type"
            onChange={(e) => handleSectionTypeChange(e.target.value as CommentSectionType)}
          >
            {sectionOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8 }}>{option.icon}</span>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Section ID (for slides) */}
        {sectionType === 'slide' && (
          <TextField
            fullWidth
            label="Slide Number (optional)"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            placeholder="e.g., 1, 2, 3..."
            helperText="Specify which slide to modify (leave empty for general slide comments)"
            sx={{ mb: 3 }}
            type="number"
            inputProps={{ min: 1, max: 50 }}
          />
        )}

        {/* Priority Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          >
            {priorityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      mr: 1
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Comment Text */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe what you want to change or improve..."
          helperText={`${comment.length}/500 characters`}
          error={!!error}
          sx={{ mb: 2 }}
        />

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Preview */}
        {comment.trim() && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.grey[50], 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            mb: 2
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              Preview:
              <Chip
                label={selectedSection?.label}
                size="small"
                sx={{ ml: 1, mr: 1 }}
              />
              <Chip
                label={selectedPriority?.label}
                size="small"
                sx={{
                  backgroundColor: selectedPriority?.color + '20',
                  color: selectedPriority?.color
                }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {comment}
            </Typography>
          </Box>
        )}

        {/* Info */}
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            Be specific about what you want to change. The AI will interpret your comment 
            and modify the lesson plan accordingly while preserving the overall structure.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!comment.trim()}
          startIcon={<MessageSquare size={16} />}
        >
          Add Comment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
