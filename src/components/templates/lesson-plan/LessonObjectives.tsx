import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  EmojiObjects as ObjectiveIcon,
  Comment as CommentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PlanComment } from '@/types/templates';
import { CommentDialog } from '../plan-editing';

interface LessonObjectivesProps {
  objectives: string[];
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
}

const LessonObjectives: React.FC<LessonObjectivesProps> = ({ 
  objectives, 
  isEditingMode = false,
  onAddComment,
  pendingComments = []
}) => {
  const theme = useTheme();
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  if (objectives.length === 0) {
    return null;
  }

  // Get comments for objectives section
  const objectiveComments = pendingComments.filter(
    comment => comment.sectionType === 'objective'
  );
  const hasComments = objectiveComments.length > 0;

  const handleAddComment = () => {
    if (onAddComment) {
      setShowCommentDialog(true);
    }
  };

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment({
        ...comment,
        sectionType: 'objective'
      });
    }
    setShowCommentDialog(false);
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {/* Section Header with Comment Button */}
        {isEditingMode && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: 2,
            position: 'relative'
          }}>
            <Tooltip title={hasComments ? `Edit objectives (${objectiveComments.length} comments)` : 'Add comment to objectives'}>
              <IconButton
                onClick={handleAddComment}
                size="small"
                sx={{
                  color: hasComments ? theme.palette.primary.main : theme.palette.action.active,
                  backgroundColor: hasComments ? theme.palette.primary.main + '10' : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '20',
                    color: theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {hasComments ? <EditIcon /> : <CommentIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {objectives.map((objective, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                '&:hover': isEditingMode ? {
                  backgroundColor: theme.palette.grey[100],
                  borderColor: theme.palette.primary.light
                } : {}
              }}
            >
              <CheckIcon 
                sx={{ 
                  color: theme.palette.success.main,
                  fontSize: 20,
                  mt: 0.2
                }} 
              />
              <Typography 
                variant="body2"
                sx={{ 
                  lineHeight: 1.4,
                  color: theme.palette.text.primary,
                  flex: 1
                }}
              >
                {objective}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Comment Dialog */}
      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleSubmitComment}
        initialSection="objective"
        title="Comment on Learning Objectives"
      />
    </>
  );
};

export default LessonObjectives;
