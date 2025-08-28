import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Comment as CommentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PlanComment } from '@/types/templates';
import { CommentDialog } from '../plan-editing';

interface MaterialsListProps {
  materials: string[];
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  materials, 
  isEditingMode = false,
  onAddComment,
  pendingComments = []
}) => {
  const theme = useTheme();
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  if (materials.length === 0) {
    return null;
  }

  const materialComments = pendingComments.filter(
    comment => comment.sectionType === 'material'
  );
  const hasComments = materialComments.length > 0;

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment({
        ...comment,
        sectionType: 'material'
      });
    }
    setShowCommentDialog(false);
  };

  return (
    <>
      {isEditingMode && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title={hasComments ? `Edit materials (${materialComments.length} comments)` : 'Add comment to materials'}>
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
        {materials.map((material, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1.5,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography sx={{ fontSize: '1rem', mt: 0.2 }}>📦</Typography>
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {material}
          </Typography>
        </Box>
      ))}
      </Box>

      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleSubmitComment}
        initialSection="material"
        title="Comment on Materials"
      />
    </>
  );
};

export default MaterialsList;
