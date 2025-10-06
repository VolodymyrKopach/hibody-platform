'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Chip,
  Collapse,
  alpha,
  useTheme
} from '@mui/material';
import { Undo, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { WorksheetEdit } from '@/types/worksheet-generation';

interface EditHistoryItemProps {
  edit: WorksheetEdit;
  onUndo?: (editId: string) => void;
  canUndo?: boolean;
}

const EditHistoryItem: React.FC<EditHistoryItemProps> = ({ 
  edit, 
  onUndo,
  canUndo = true 
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'щойно';
    if (diffMins === 1) return '1 хв тому';
    if (diffMins < 60) return `${diffMins} хв тому`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 год тому';
    if (diffHours < 24) return `${diffHours} год тому`;
    
    return date.toLocaleDateString();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        border: `1px solid ${alpha(
          edit.success ? theme.palette.success.main : theme.palette.error.main, 
          0.2
        )}`,
        borderRadius: 2,
        background: alpha(
          edit.success ? theme.palette.success.main : theme.palette.error.main,
          0.03
        ),
      }}
    >
      <Stack spacing={1}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
            {edit.success ? (
              <CheckCircle size={16} color={theme.palette.success.main} />
            ) : (
              <XCircle size={16} color={theme.palette.error.main} />
            )}
            
            <Chip
              label={edit.target === 'component' ? 'Компонент' : 'Сторінка'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            />
            
            <Typography variant="caption" color="text.secondary">
              {formatTime(edit.timestamp)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            {edit.changes.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ padding: 0.5 }}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </IconButton>
            )}
            
            {canUndo && edit.success && onUndo && (
              <IconButton
                size="small"
                onClick={() => onUndo(edit.id)}
                sx={{ 
                  padding: 0.5,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <Undo size={16} />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Instruction */}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary 
          }}
        >
          {edit.instruction}
        </Typography>

        {/* Error message */}
        {!edit.success && edit.error && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.error.main,
              fontStyle: 'italic'
            }}
          >
            Помилка: {edit.error}
          </Typography>
        )}

        {/* Expanded changes */}
        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 1,
              background: alpha(theme.palette.grey[500], 0.05),
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.secondary,
                display: 'block',
                mb: 1
              }}
            >
              Зміни ({edit.changes.length}):
            </Typography>
            <Stack spacing={0.5}>
              {edit.changes.map((change, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    display: 'block'
                  }}
                >
                  • {change.description}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default EditHistoryItem;
