'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Paper, alpha, useTheme } from '@mui/material';
import { GripVertical } from 'lucide-react';

interface DraggableListItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  showDragHandle?: boolean;
  onDragHandleClick?: () => void;
}

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  id,
  children,
  disabled = false,
  showDragHandle = true,
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        position: 'relative',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        overflow: 'visible',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: isDragging ? 'none' : `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
        ...(isDragging && {
          zIndex: 1000,
          boxShadow: theme.shadows[8],
          cursor: 'grabbing',
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        {/* Drag Handle */}
        {showDragHandle && !disabled && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              flexShrink: 0,
              cursor: 'grab',
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.action.hover, 0.02),
              color: theme.palette.text.secondary,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              },
              '&:active': {
                cursor: 'grabbing',
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
              },
            }}
          >
            <GripVertical size={16} />
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </Paper>
  );
};

export default DraggableListItem;

