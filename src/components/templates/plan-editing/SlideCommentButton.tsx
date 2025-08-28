import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Badge,
  Fab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Comment as CommentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { PlanComment } from '@/types/templates';
import CommentDialog from './CommentDialog';

interface SlideCommentButtonProps {
  slideNumber: number;
  isEditingMode: boolean;
  hasComments: boolean;
  commentCount: number;
  onAddComment: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  variant?: 'icon' | 'fab';
  size?: 'small' | 'medium' | 'large';
}

const SlideCommentButton: React.FC<SlideCommentButtonProps> = ({
  slideNumber,
  isEditingMode,
  hasComments,
  commentCount,
  onAddComment,
  variant = 'icon',
  size = 'medium'
}) => {
  const theme = useTheme();
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  const handleOpenDialog = () => {
    setShowCommentDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCommentDialog(false);
  };

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    onAddComment({
      ...comment,
      sectionType: 'slide',
      sectionId: slideNumber.toString()
    });
    setShowCommentDialog(false);
  };

  if (!isEditingMode) {
    return null;
  }

  const tooltipTitle = hasComments 
    ? `Edit slide ${slideNumber} (${commentCount} comment${commentCount !== 1 ? 's' : ''})`
    : `Add comment to slide ${slideNumber}`;

  const buttonColor = hasComments ? 'primary' : 'default';
  const iconColor = hasComments ? theme.palette.primary.main : theme.palette.action.active;

  if (variant === 'fab') {
    return (
      <>
        <Tooltip title={tooltipTitle}>
          <Badge badgeContent={commentCount} color="primary">
            <Fab
              size={size}
              color={buttonColor}
              onClick={handleOpenDialog}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 2,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {hasComments ? <EditIcon /> : <MessageSquare size={20} />}
            </Fab>
          </Badge>
        </Tooltip>

        <CommentDialog
          open={showCommentDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitComment}
          initialSection="slide"
          initialSectionId={slideNumber.toString()}
          title={`Comment on Slide ${slideNumber}`}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Badge badgeContent={commentCount} color="primary">
          <IconButton
            size={size}
            onClick={handleOpenDialog}
            sx={{
              color: iconColor,
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '10',
                color: theme.palette.primary.main
              },
              transition: 'all 0.2s ease'
            }}
          >
            {hasComments ? <EditIcon /> : <CommentIcon />}
          </IconButton>
        </Badge>
      </Tooltip>

      <CommentDialog
        open={showCommentDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitComment}
        initialSection="slide"
        initialSectionId={slideNumber.toString()}
        title={`Comment on Slide ${slideNumber}`}
      />
    </>
  );
};

export default SlideCommentButton;
