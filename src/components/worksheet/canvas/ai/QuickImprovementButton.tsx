'use client';

import React from 'react';
import { Chip, Tooltip, alpha, useTheme } from '@mui/material';
import * as LucideIcons from 'lucide-react';
import { QuickImprovement } from '@/types/worksheet-generation';

interface QuickImprovementButtonProps {
  improvement: QuickImprovement;
  onClick: (improvement: QuickImprovement) => void;
  disabled?: boolean;
}

const QuickImprovementButton: React.FC<QuickImprovementButtonProps> = ({
  improvement,
  onClick,
  disabled = false
}) => {
  const theme = useTheme();

  // Get icon component from Lucide
  const IconComponent = (LucideIcons as any)[improvement.icon] || LucideIcons.Sparkles;

  return (
    <Tooltip title={improvement.description} arrow>
      <span>
        <Chip
          icon={<IconComponent size={14} />}
          label={improvement.label}
          onClick={() => onClick(improvement)}
          disabled={disabled}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 28,
            borderRadius: 1.5,
            background: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            transition: 'all 0.2s',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.15),
              borderColor: theme.palette.primary.main,
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '& .MuiChip-icon': {
              color: theme.palette.primary.main,
              marginLeft: '8px',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          }}
        />
      </span>
    </Tooltip>
  );
};

export default QuickImprovementButton;
