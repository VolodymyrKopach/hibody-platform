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
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Lightbulb as LightbulbIcon,
  TipsAndUpdates as TipIcon
} from '@mui/icons-material';
import { PlanComment } from '@/types/templates';
import { CommentDialog } from '../plan-editing';
import { StandardCommentButton } from '@/components/ui';

interface TeacherRecommendationsProps {
  recommendations: string[];
  isEditingMode?: boolean;
  onAddComment?: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  pendingComments?: PlanComment[];
}

const TeacherRecommendations: React.FC<TeacherRecommendationsProps> = ({ 
  recommendations, 
  isEditingMode = false,
  onAddComment,
  pendingComments = []
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  if (recommendations.length === 0) {
    return null;
  }

  const recommendationComments = pendingComments.filter(
    comment => comment.sectionType === 'recommendation'
  );
  const hasComments = recommendationComments.length > 0;

  const handleSubmitComment = (comment: Omit<PlanComment, 'id' | 'timestamp'>) => {
    if (onAddComment) {
      onAddComment({
        ...comment,
        sectionType: 'recommendation'
      });
    }
    setShowCommentDialog(false);
  };

  return (
    <>
      {isEditingMode && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <StandardCommentButton
            onClick={() => setShowCommentDialog(true)}
            tooltip={hasComments ? `Edit tips (${recommendationComments.length} comments)` : 'Add comment to tips'}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {recommendations.map((recommendation, index) => (
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
          <TipIcon 
            sx={{ 
              color: theme.palette.warning.main,
              fontSize: 20,
              mt: 0.2
            }} 
          />
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {recommendation}
          </Typography>
        </Box>
      ))}
      </Box>

      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleSubmitComment}
        initialSection="recommendation"
        title={t('planEditing.commentOnTeacherTips')}
      />
    </>
  );
};

export default TeacherRecommendations;
