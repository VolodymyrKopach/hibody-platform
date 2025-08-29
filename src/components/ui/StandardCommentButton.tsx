import React from 'react';
import {
  Fab,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MessageSquare } from 'lucide-react';

interface StandardCommentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Standardized comment button component with consistent styling across the project
 * Based on the design: Fab with info color, MessageSquare icon, size small
 */
const StandardCommentButton: React.FC<StandardCommentButtonProps> = ({
  onClick,
  disabled = false,
  tooltip = 'Add Comment',
  size = 'small'
}) => {
  const theme = useTheme();

  return (
    <Tooltip title={tooltip} placement="left">
      <Fab
        size={size}
        color="info"
        onClick={onClick}
        disabled={disabled}
        sx={{
          boxShadow: theme.shadows[4],
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'scale(1.05)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <MessageSquare size={16} />
      </Fab>
    </Tooltip>
  );
};

export default StandardCommentButton;
