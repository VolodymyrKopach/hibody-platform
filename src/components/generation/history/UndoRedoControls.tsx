/**
 * === SOLID: SRP - Undo/Redo Controls ===
 * 
 * This component provides UI controls for undo/redo functionality,
 * including buttons, keyboard shortcuts, and visual feedback.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Fade,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Undo2, 
  Redo2, 
  History, 
  KeyboardIcon,
  Info
} from 'lucide-react';
import { useUndoRedo } from '@/providers/HistoryProvider';

// === SOLID: SRP - Styled Components ===
const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  },
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5),
  },
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-1px)',
  },
  
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.04),
    color: theme.palette.action.disabled,
  },
  
  '&.undo': {
    color: theme.palette.warning.main,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.warning.main, 0.08),
    },
  },
  
  '&.redo': {
    color: theme.palette.info.main,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.info.main, 0.08),
    },
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  
  '& .MuiChip-icon': {
    fontSize: '0.875rem',
  },
}));

const ShortcutText = styled(Typography)(({ theme }) => ({
  fontSize: '0.6875rem',
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  backgroundColor: alpha(theme.palette.text.primary, 0.08),
  padding: theme.spacing(0.25, 0.5),
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 0.5 : 4,
  userSelect: 'none',
  
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

// === SOLID: ISP - Component interfaces ===
interface UndoRedoControlsProps {
  variant?: 'compact' | 'expanded' | 'minimal';
  showStats?: boolean;
  showShortcuts?: boolean;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  onUndoClick?: () => void;
  onRedoClick?: () => void;
}

interface HistoryStatsProps {
  totalEntries: number;
  currentPosition: number;
  memoryUsage: number;
}

// === SOLID: SRP - History Stats Component ===
const HistoryStats: React.FC<HistoryStatsProps> = ({
  totalEntries,
  currentPosition,
  memoryUsage
}) => {
  const { t } = useTranslation('generation');
  
  // === SOLID: SRP - Format memory usage ===
  const formatMemoryUsage = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }, []);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatsChip
        icon={<History size={14} />}
        label={`${currentPosition + 1}/${totalEntries}`}
        size="small"
      />
      <Tooltip title={t('history.memoryUsage', 'Memory usage')}>
        <Typography variant="caption" color="text.secondary">
          {formatMemoryUsage(memoryUsage)}
        </Typography>
      </Tooltip>
    </Box>
  );
};

// === SOLID: SRP - Keyboard Shortcuts Display ===
const KeyboardShortcuts: React.FC = () => {
  const { t } = useTranslation('generation');
  const theme = useTheme();
  
  // === SOLID: SRP - Determine OS for shortcuts ===
  const isMac = navigator.platform.toLowerCase().includes('mac');
  const cmdKey = isMac ? '⌘' : 'Ctrl';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <KeyboardIcon size={14} color={theme.palette.text.secondary} />
      <ShortcutText>{cmdKey}+Z</ShortcutText>
      <ShortcutText>{cmdKey}+Y</ShortcutText>
    </Box>
  );
};

// === SOLID: SRP - Main Undo/Redo Controls Component ===
const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  variant = 'expanded',
  showStats = true,
  showShortcuts = true,
  orientation = 'horizontal',
  disabled = false,
  onUndoClick,
  onRedoClick
}) => {
  const { t } = useTranslation('generation');
  const theme = useTheme();
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    undoDescription,
    redoDescription,
    stats
  } = useUndoRedo();
  
  // === SOLID: SRP - Handle undo click ===
  const handleUndoClick = useCallback(() => {
    if (!disabled && canUndo) {
      undo();
      onUndoClick?.();
    }
  }, [disabled, canUndo, undo, onUndoClick]);
  
  // === SOLID: SRP - Handle redo click ===
  const handleRedoClick = useCallback(() => {
    if (!disabled && canRedo) {
      redo();
      onRedoClick?.();
    }
  }, [disabled, canRedo, redo, onRedoClick]);
  
  // === SOLID: SRP - Render based on variant ===
  if (variant === 'minimal') {
    return (
      <ButtonGroup
        orientation={orientation}
        variant="outlined"
        size="small"
        disabled={disabled}
      >
        <Tooltip title={undoDescription || t('history.undo', 'Undo')}>
          <span>
            <IconButton
              onClick={handleUndoClick}
              disabled={disabled || !canUndo}
              size="small"
            >
              <Undo2 size={16} />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title={redoDescription || t('history.redo', 'Redo')}>
          <span>
            <IconButton
              onClick={handleRedoClick}
              disabled={disabled || !canRedo}
              size="small"
            >
              <Redo2 size={16} />
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ButtonGroup size="small" disabled={disabled}>
          <Tooltip title={undoDescription || t('history.undo', 'Undo')}>
            <span>
              <Button
                onClick={handleUndoClick}
                disabled={disabled || !canUndo}
                startIcon={<Undo2 size={14} />}
              >
                {t('history.undo', 'Undo')}
              </Button>
            </span>
          </Tooltip>
          
          <Tooltip title={redoDescription || t('history.redo', 'Redo')}>
            <span>
              <Button
                onClick={handleRedoClick}
                disabled={disabled || !canRedo}
                startIcon={<Redo2 size={14} />}
              >
                {t('history.redo', 'Redo')}
              </Button>
            </span>
          </Tooltip>
        </ButtonGroup>
        
        {showStats && (
          <HistoryStats
            totalEntries={stats.totalEntries}
            currentPosition={stats.currentPosition}
            memoryUsage={stats.memoryUsage}
          />
        )}
      </Box>
    );
  }
  
  // === SOLID: SRP - Expanded variant (default) ===
  return (
    <ControlsContainer
      sx={{
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Undo/Redo buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip 
          title={
            <Box>
              <Typography variant="body2">
                {undoDescription || t('history.undo', 'Undo')}
              </Typography>
              {undoDescription && (
                <Typography variant="caption" color="text.secondary">
                  {t('history.undoDescription', 'Undo: {{description}}', { description: undoDescription })}
                </Typography>
              )}
            </Box>
          }
        >
          <span>
            <ControlButton
              className="undo"
              onClick={handleUndoClick}
              disabled={disabled || !canUndo}
              size="small"
            >
              <Undo2 size={18} />
            </ControlButton>
          </span>
        </Tooltip>
        
        <Tooltip 
          title={
            <Box>
              <Typography variant="body2">
                {redoDescription || t('history.redo', 'Redo')}
              </Typography>
              {redoDescription && (
                <Typography variant="caption" color="text.secondary">
                  {t('history.redoDescription', 'Redo: {{description}}', { description: redoDescription })}
                </Typography>
              )}
            </Box>
          }
        >
          <span>
            <ControlButton
              className="redo"
              onClick={handleRedoClick}
              disabled={disabled || !canRedo}
              size="small"
            >
              <Redo2 size={18} />
            </ControlButton>
          </span>
        </Tooltip>
      </Box>
      
      {/* Stats */}
      {showStats && stats.totalEntries > 0 && (
        <Fade in timeout={300}>
          <Box>
            <HistoryStats
              totalEntries={stats.totalEntries}
              currentPosition={stats.currentPosition}
              memoryUsage={stats.memoryUsage}
            />
          </Box>
        </Fade>
      )}
      
      {/* Keyboard shortcuts */}
      {showShortcuts && (
        <Fade in timeout={300}>
          <Box>
            <KeyboardShortcuts />
          </Box>
        </Fade>
      )}
    </ControlsContainer>
  );
};

export default UndoRedoControls; 