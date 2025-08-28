import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  SportsEsports as GameIcon,
  Comment as CommentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PlanComment } from '@/types/templates';
import { CommentDialog } from '../plan-editing';

interface GameElementsProps {
  gameElements: string[];
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
}

const GameElements: React.FC<GameElementsProps> = ({ 
  gameElements, 
  isEditingMode = false,
  onAddComment,
  pendingComments = []
}) => {
  const theme = useTheme();
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  if (gameElements.length === 0) {
    return null;
  }

  const gameComments = pendingComments.filter(
    comment => comment.sectionType === 'game'
  );
  const hasComments = gameComments.length > 0;

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment({
        ...comment,
        sectionType: 'game'
      });
    }
    setShowCommentDialog(false);
  };

  return (
    <>
      {isEditingMode && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title={hasComments ? `Edit games (${gameComments.length} comments)` : 'Add comment to games'}>
            <IconButton
              onClick={() => setShowCommentDialog(true)}
              size="small"
              sx={{
                color: hasComments ? theme.palette.primary.main : theme.palette.action.active,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              {hasComments ? <EditIcon /> : <CommentIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {gameElements.map((element, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography sx={{ fontSize: '1.2rem' }}>🎯</Typography>
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {element}
          </Typography>
        </Box>
      ))}
      </Box>

      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleSubmitComment}
        initialSection="game"
        title="Comment on Game Elements"
      />
    </>
  );
};

export default GameElements;
