import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { PlanComment, CommentSectionType } from '@/types/templates';

interface CommentPanelProps {
  comments: PlanComment[];
  isProcessing: boolean;
  onProcessComments: () => void;
  onRemoveComment: (commentId: string) => void;
  onClearAllComments: () => void;
  onEditComment?: (commentId: string) => void;
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  isProcessing,
  onProcessComments,
  onRemoveComment,
  onClearAllComments,
  onEditComment
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  // Get section type display info
  const getSectionInfo = (sectionType: CommentSectionType) => {
    const sectionMap = {
      slide: { label: 'Slide', icon: '📄', color: theme.palette.primary.main },
      objective: { label: 'Objective', icon: '🎯', color: theme.palette.success.main },
      material: { label: 'Material', icon: '📚', color: theme.palette.info.main },
      game: { label: 'Game', icon: '🎮', color: theme.palette.warning.main },
      recommendation: { label: 'Tip', icon: '💡', color: theme.palette.secondary.main },
      general: { label: 'General', icon: '📝', color: theme.palette.grey[600] }
    };
    
    return sectionMap[sectionType] || sectionMap.general;
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };

  // Group comments by section
  const groupedComments = comments.reduce((acc, comment) => {
    if (!acc[comment.sectionType]) {
      acc[comment.sectionType] = [];
    }
    acc[comment.sectionType].push(comment);
    return acc;
  }, {} as Record<CommentSectionType, PlanComment[]>);

  if (comments.length === 0) {
    return null;
  }

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mt: 3,
        border: `2px dashed ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.primary.light + '08'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MessageSquare size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Pending Edits ({comments.length})
          </Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Clear all comments">
              <IconButton 
                size="small" 
                onClick={onClearAllComments}
                disabled={isProcessing}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Processing indicator */}
        {isProcessing && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            icon={<CircularProgress size={20} />}
          >
            Processing your comments... This may take a few moments.
          </Alert>
        )}

        {/* Comments by section */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {Object.entries(groupedComments).map(([sectionType, sectionComments]) => {
            const sectionInfo = getSectionInfo(sectionType as CommentSectionType);
            
            return (
              <Box key={sectionType}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    color: sectionInfo.color,
                    fontWeight: 600
                  }}
                >
                  <span style={{ marginRight: 8 }}>{sectionInfo.icon}</span>
                  {sectionInfo.label} ({sectionComments.length})
                </Typography>
                
                <Stack spacing={1} sx={{ ml: 2 }}>
                  {sectionComments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        position: 'relative'
                      }}
                    >
                      {/* Comment header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {comment.sectionId && (
                          <Chip
                            label={`#${comment.sectionId}`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        
                        <Chip
                          label={comment.priority || 'medium'}
                          size="small"
                          sx={{
                            backgroundColor: getPriorityColor(comment.priority) + '20',
                            color: getPriorityColor(comment.priority),
                            fontWeight: 600,
                            mr: 1
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                          <Clock size={14} color={theme.palette.text.secondary} />
                          <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                            {comment.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>
                        
                        {/* Action buttons */}
                        <Box sx={{ ml: 1 }}>
                          {onEditComment && (
                            <IconButton
                              size="small"
                              onClick={() => onEditComment(comment.id)}
                              disabled={isProcessing}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          
                          <IconButton
                            size="small"
                            onClick={() => onRemoveComment(comment.id)}
                            disabled={isProcessing}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {/* Comment text */}
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onClearAllComments}
            disabled={isProcessing}
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
          
          <Button
            variant="contained"
            onClick={onProcessComments}
            disabled={isProcessing || comments.length === 0}
            startIcon={isProcessing ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{ minWidth: 140 }}
          >
            {isProcessing ? 'Processing...' : 'Apply Changes'}
          </Button>
        </Box>

        {/* Info message */}
        <Alert severity="info" sx={{ mt: 2 }} icon={<InfoIcon />}>
          <Typography variant="body2">
            Your comments will be processed by AI to modify the lesson plan. 
            The original structure and format will be preserved.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CommentPanel;
