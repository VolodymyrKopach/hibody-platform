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
  IconButton,
  Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Close as CloseIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { CommentSectionType, PlanComment } from '@/types/templates';

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  initialSection?: CommentSectionType;
  initialSectionId?: string;
  title?: string;
  totalSlides?: number;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialSection = 'general',
  initialSectionId,
  title = 'Add Comment',
  totalSlides = 0
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  const [sectionType, setSectionType] = useState<CommentSectionType>(initialSection);
  const [sectionId, setSectionId] = useState(initialSectionId || '');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setSectionType(initialSection);
      setSectionId(initialSectionId || '');
      setComment('');
      setPriority('medium');
      setError(null);
      setShowAdvancedOptions(false);
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
        pb: 2,
        pt: 2,
        minHeight: 64,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 600,
        position: 'relative',
        zIndex: 1
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

            <DialogContent sx={{ 
        pt: '24px !important', 
        pb: 2,
        mt: 0,
        position: 'relative',
        '&.MuiDialogContent-root': {
          paddingTop: '24px !important',
          marginTop: 0
        }
      }}>
        <Box sx={{ pt: 1 }}>
          {/* Comment Text - Primary Field */}
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
            sx={{ mb: 3 }}
            autoFocus
          />

          {/* Advanced Options - Collapsible */}
          <Box sx={{ mb: 2 }}>
            <Box
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Advanced Options
              </Typography>
              <IconButton
                size="small"
                sx={{
                  transform: showAdvancedOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>

            <Collapse in={showAdvancedOptions}>
              <Box sx={{ pt: 2 }}>
                {/* Section Type - Chip Selector */}
                <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Section Type
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sectionOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </Box>
                    }
                    variant={sectionType === option.value ? 'filled' : 'outlined'}
                    color={sectionType === option.value ? 'primary' : 'default'}
                    onClick={() => handleSectionTypeChange(option.value)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: sectionType === option.value 
                          ? theme.palette.primary.dark 
                          : theme.palette.action.hover
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

                            {/* Slide Selector (for slides) */}
                {sectionType === 'slide' && totalSlides > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Select Slide (optional)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {/* All slides option */}
                      <Chip
                        label="All Slides"
                        variant={!sectionId ? 'filled' : 'outlined'}
                        color={!sectionId ? 'primary' : 'default'}
                        onClick={() => setSectionId('')}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: !sectionId 
                              ? theme.palette.primary.dark 
                              : theme.palette.action.hover
                          }
                        }}
                      />
                      
                      {/* Individual slide options */}
                      {Array.from({ length: totalSlides }, (_, index) => {
                        const slideNumber = (index + 1).toString();
                        const isSelected = sectionId === slideNumber;
                        
                        return (
                          <Chip
                            key={slideNumber}
                            label={`Slide ${slideNumber}`}
                            variant={isSelected ? 'filled' : 'outlined'}
                            color={isSelected ? 'primary' : 'default'}
                            onClick={() => setSectionId(slideNumber)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: isSelected 
                                  ? theme.palette.primary.dark 
                                  : theme.palette.action.hover
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Choose a specific slide or leave "All Slides" for general slide comments
                    </Typography>
                  </Box>
                )}

                        {/* Priority - Chip Selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Priority
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {priorityOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: option.color
                          }}
                        />
                        <span>{option.label}</span>
                      </Box>
                    }
                    variant={priority === option.value ? 'filled' : 'outlined'}
                    color={priority === option.value ? 'primary' : 'default'}
                    onClick={() => setPriority(option.value as 'low' | 'medium' | 'high')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: priority === option.value 
                          ? theme.palette.primary.dark 
                          : theme.palette.action.hover
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
              </Box>
            </Collapse>
          </Box>

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
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
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
