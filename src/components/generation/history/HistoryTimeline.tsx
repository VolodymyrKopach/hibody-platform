/**
 * === SOLID: SRP - History Timeline ===
 * 
 * This component displays a visual timeline of history changes,
 * allowing users to see and potentially jump to specific states.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  useTheme,
  alpha,
  Fade,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FileText, 
  Edit, 
  RotateCcw, 
  Upload, 
  Layers, 
  CheckCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  User
} from 'lucide-react';
import { useHistory } from '@/providers/HistoryProvider';
import { HistoryEntry, HistoryOperationType } from '@/services/history/HistoryService';

// === SOLID: SRP - Styled Components ===
const TimelineContainer = styled(Paper)(({ theme }) => ({
  maxHeight: 400,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  
  '&::-webkit-scrollbar': {
    width: 8,
  },
  
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.text.secondary, 0.3),
    borderRadius: 4,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.secondary, 0.5),
    },
  },
}));

const TimelineItem = styled(ListItem)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  
  '&.current': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  },
  
  '&.past': {
    opacity: 0.7,
  },
  
  '&.future': {
    opacity: 0.5,
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(1.5),
    top: '50%',
    transform: 'translateY(-50%)',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.divider,
  },
  
  '&.current::before': {
    backgroundColor: theme.palette.primary.main,
    width: 12,
    height: 12,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(1.875),
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: alpha(theme.palette.divider, 0.3),
  },
  
  '&:last-child::after': {
    display: 'none',
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const TypeChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.6875rem',
  height: 20,
  
  '&.field_change': {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
  },
  
  '&.bulk_change': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
  },
  
  '&.form_load': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
  },
  
  '&.form_reset': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
}));

// === SOLID: ISP - Component interfaces ===
interface HistoryTimelineProps {
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  allowJumpTo?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface HistoryItemProps {
  entry: HistoryEntry;
  position: 'past' | 'current' | 'future';
  onJumpTo?: (entry: HistoryEntry) => void;
  allowJumpTo?: boolean;
}

// === SOLID: SRP - Get operation icon ===
const getOperationIcon = (type: HistoryOperationType) => {
  switch (type) {
    case 'field_change':
      return <Edit size={16} />;
    case 'bulk_change':
      return <Layers size={16} />;
    case 'form_load':
      return <Upload size={16} />;
    case 'form_reset':
      return <RotateCcw size={16} />;
    case 'validation_fix':
      return <CheckCircle size={16} />;
    case 'template_apply':
      return <FileText size={16} />;
    default:
      return <FileText size={16} />;
  }
};

// === SOLID: SRP - History Item Component ===
const HistoryItem: React.FC<HistoryItemProps> = ({
  entry,
  position,
  onJumpTo,
  allowJumpTo = false
}) => {
  const { t } = useTranslation('generation');
  const theme = useTheme();
  
  // === SOLID: SRP - Format timestamp ===
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);
  
  // === SOLID: SRP - Handle jump to ===
  const handleJumpTo = useCallback(() => {
    if (allowJumpTo && onJumpTo) {
      onJumpTo(entry);
    }
  }, [allowJumpTo, onJumpTo, entry]);
  
  return (
    <TimelineItem 
      className={position}
      onClick={handleJumpTo}
      sx={{
        cursor: allowJumpTo ? 'pointer' : 'default',
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {getOperationIcon(entry.type)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" component="span">
              {entry.description}
            </Typography>
            <TypeChip 
              className={entry.type}
              label={entry.type.replace('_', ' ')}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption">
              {formatTime(entry.timestamp)}
            </Typography>
            {entry.metadata && (
              <Typography variant="caption" color="text.secondary">
                • {JSON.stringify(entry.metadata, null, 0)}
              </Typography>
            )}
          </Box>
        }
      />
    </TimelineItem>
  );
};

// === SOLID: SRP - Main Timeline Component ===
const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  maxItems = 50,
  showFilters = true,
  showSearch = true,
  allowJumpTo = false,
  collapsed = false,
  onToggleCollapse
}) => {
  const { t } = useTranslation('generation');
  const theme = useTheme();
  const { getHistory, stats } = useHistory();
  
  // === SOLID: SRP - Local state ===
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<HistoryOperationType | 'all'>('all');
  const [showMetadata, setShowMetadata] = useState(false);
  
  // === SOLID: SRP - Get history entries ===
  const historyEntries = useMemo(() => {
    return getHistory();
  }, [getHistory]);
  
  // === SOLID: SRP - Filter entries ===
  const filteredEntries = useMemo(() => {
    let filtered = historyEntries;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }
    
    // Limit items
    return filtered.slice(0, maxItems);
  }, [historyEntries, searchQuery, typeFilter, maxItems]);
  
  // === SOLID: SRP - Get position for entry ===
  const getEntryPosition = useCallback((index: number): 'past' | 'current' | 'future' => {
    if (index === stats.currentPosition) return 'current';
    if (index < stats.currentPosition) return 'past';
    return 'future';
  }, [stats.currentPosition]);
  
  // === SOLID: SRP - Handle jump to entry ===
  const handleJumpTo = useCallback((entry: HistoryEntry) => {
    // TODO: Implement jump to specific history entry
    console.log('Jump to entry:', entry);
  }, []);
  
  // === SOLID: SRP - Handle search change ===
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);
  
  // === SOLID: SRP - Handle type filter change ===
  const handleTypeFilterChange = useCallback((event: any) => {
    setTypeFilter(event.target.value);
  }, []);
  
  // === SOLID: SRP - Toggle metadata display ===
  const handleToggleMetadata = useCallback(() => {
    setShowMetadata(prev => !prev);
  }, []);
  
  if (historyEntries.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('history.noEntries', 'No history entries yet')}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="h3">
          {t('history.timeline', 'History Timeline')}
        </Typography>
        
        {onToggleCollapse && (
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </IconButton>
        )}
      </Box>
      
      <Collapse in={!collapsed}>
        <Box>
          {/* Filters */}
          {(showFilters || showSearch) && (
            <FilterContainer>
              {showSearch && (
                <TextField
                  size="small"
                  placeholder={t('history.searchPlaceholder', 'Search history...')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <Search size={16} style={{ marginRight: 8 }} />
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}
              
              {showFilters && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{t('history.filterByType', 'Filter by type')}</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={handleTypeFilterChange}
                    label={t('history.filterByType', 'Filter by type')}
                  >
                    <MenuItem value="all">
                      {t('history.allTypes', 'All types')}
                    </MenuItem>
                    <MenuItem value="field_change">
                      {t('history.fieldChange', 'Field change')}
                    </MenuItem>
                    <MenuItem value="bulk_change">
                      {t('history.bulkChange', 'Bulk change')}
                    </MenuItem>
                    <MenuItem value="form_load">
                      {t('history.formLoad', 'Form load')}
                    </MenuItem>
                    <MenuItem value="form_reset">
                      {t('history.formReset', 'Form reset')}
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <Tooltip title={t('history.toggleMetadata', 'Toggle metadata display')}>
                <IconButton 
                  onClick={handleToggleMetadata}
                  size="small"
                  color={showMetadata ? 'primary' : 'default'}
                >
                  <Filter size={16} />
                </IconButton>
              </Tooltip>
            </FilterContainer>
          )}
          
          {/* Timeline */}
          <TimelineContainer>
            <List dense>
              {filteredEntries.map((entry, index) => (
                <Fade key={entry.id} in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                  <div>
                    <HistoryItem
                      entry={entry}
                      position={getEntryPosition(index)}
                      onJumpTo={handleJumpTo}
                      allowJumpTo={allowJumpTo}
                    />
                  </div>
                </Fade>
              ))}
            </List>
          </TimelineContainer>
          
          {/* Stats */}
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {t('history.showingEntries', 'Showing {{count}} of {{total}} entries', {
                count: filteredEntries.length,
                total: historyEntries.length
              })}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default HistoryTimeline; 