import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { 
  Comment as CommentIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { SlideComment } from '@/types/templates';

interface SlideCommentButtonProps {
  slideId: string;
  slideTitle: string;
  commentCount: number;
  onAddComment: (comment: Omit<SlideComment, 'id' | 'timestamp'>) => void;
  disabled?: boolean;
}

const SlideCommentButton: React.FC<SlideCommentButtonProps> = ({
  slideId,
  slideTitle,
  commentCount,
  onAddComment,
  disabled = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [sectionType, setSectionType] = useState<SlideComment['sectionType']>('general');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (dialogOpen) {
      setComment('');
      setPriority('medium');
      setSectionType('general');
      setError(null);
      setShowAdvancedOptions(false);
    }
  }, [dialogOpen]);

  // Section type options
  const sectionOptions = [
    { value: 'general', label: 'General', icon: '📝', description: 'Overall slide improvements' },
    { value: 'title', label: 'Title', icon: '🏷️', description: 'Title modifications' },
    { value: 'content', label: 'Content', icon: '📄', description: 'Content changes' },
    { value: 'styling', label: 'Styling', icon: '🎨', description: 'Visual styling updates' },
    { value: 'interactions', label: 'Interactions', icon: '⚡', description: 'Interactive elements' }
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

    setError(null);
    return true;
  }, [comment]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const commentData = {
      slideId,
      comment: comment.trim(),
      priority,
      sectionType
    };

    onAddComment(commentData);
    setDialogOpen(false);
  }, [validateForm, onAddComment, slideId, comment, priority, sectionType]);

  const selectedSection = sectionOptions.find(option => option.value === sectionType);
  const selectedPriority = priorityOptions.find(option => option.value === priority);

  return (
    <>
      <Tooltip title={`Add comment to slide (${commentCount} comments)`}>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        >
          <IconButton
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            size="medium"
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[4],
              opacity: 0,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(0.8)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              border: `2px solid ${theme.palette.divider}`,
              backdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                transform: 'scale(1.05)',
                boxShadow: theme.shadows[12],
                borderColor: theme.palette.primary.main
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              // Show on parent hover with smooth animation
              '.slide-card:hover &': {
                opacity: 1,
                transform: 'scale(1)'
              }
            }}
          >
            <Badge 
              badgeContent={commentCount} 
              color="primary" 
              max={9}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  minWidth: 20,
                  height: 20,
                  borderRadius: '50%',
                  fontWeight: 600,
                  border: `2px solid ${theme.palette.background.paper}`
                }
              }}
            >
              <CommentIcon fontSize="medium" />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
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
            {t('slideEditing.addComment.title')}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {slideTitle}
          </Typography>
          
          <IconButton
            onClick={() => setDialogOpen(false)}
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
              label={t('slideEditing.addComment.commentLabel')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('slideEditing.addComment.commentPlaceholder')}
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
                  {t('slideEditing.addComment.advancedOptions')}
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
                      {t('slideEditing.addComment.section')}
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
                          onClick={() => setSectionType(option.value as SlideComment['sectionType'])}
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

                  {/* Priority - Chip Selector */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      {t('slideEditing.addComment.priority')}
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            {t('slideEditing.addComment.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!comment.trim()}
            startIcon={<MessageSquare size={16} />}
          >
            {t('slideEditing.addComment.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SlideCommentButton;
