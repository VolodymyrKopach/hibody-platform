import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Reorder as ReorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { PlanComment, CommentSectionType, PlanChanges } from '@/types/templates';

export interface CommentPanelProps {
  comments: PlanComment[];
  isProcessing: boolean;
  onProcessComments: () => void;
  onRemoveComment: (commentId: string) => void;
  onClearAllComments: () => void;
  onEditComment?: (commentId: string) => void;
  planChanges?: PlanChanges | null;
  showResults?: boolean; // Показувати результат замість коментарів
  onAddMoreComments?: () => void; // Повернутися до режиму редагування
  showDetailedChanges?: boolean; // Контроль деталізації ззовні
  onToggleDetails?: () => void; // Колбек для зміни деталізації
  isEditingMode?: boolean; // Чи знаходимося в режимі редагування
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  isProcessing,
  onProcessComments,
  onRemoveComment,
  onClearAllComments,
  onEditComment,
  planChanges,
  showResults = false,
  onAddMoreComments,
  showDetailedChanges = false,
  onToggleDetails,
  isEditingMode = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  // State for individually expanded items
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Toggle individual item expansion
  const toggleItemExpansion = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Check if item should show details (either globally expanded or individually expanded)
  const shouldShowItemDetails = (index: number, change: any) => {
    const hasDetailedInfo = change.detailedDescription !== change.shortDescription;
    const isGloballyExpanded = showDetailedChanges;
    const isIndividuallyExpanded = expandedItems.has(index);
    
    return hasDetailedInfo && (isGloballyExpanded || isIndividuallyExpanded);
  };

  // Function to clean up and humanize detailed descriptions
  const cleanupDetailedDescription = (text: string) => {
    let cleaned = text;
    
    // Remove technical field references like ('slideNumber': 1)
    cleaned = cleaned.replace(/\('([^']+)':\s*\d+\)/g, '');
    
    // Remove field name references like ('title'), ('goal'), ('content')
    cleaned = cleaned.replace(/\('([^']+)'\)/g, '');
    
    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove leading/trailing spaces
    cleaned = cleaned.trim();
    
    // Replace technical language with more natural language
    const replacements = [
      // Ukrainian replacements
      { from: /У першому слайді\s+назва була змінена/g, to: 'Назву слайду змінено' },
      { from: /У першому слайді\s+у\s+/g, to: 'У слайді ' },
      { from: /У першому слайді\s+/g, to: 'У слайді ' },
      { from: /була змінена з/g, to: 'змінено з' },
      { from: /було змінено з/g, to: 'змінено з' },
      { from: /була оновлена з/g, to: 'оновлено з' },
      { from: /було оновлено з/g, to: 'оновлено з' },
      { from: /був повністю переписаний/g, to: 'повністю переписано' },
      { from: /було повністю переписано/g, to: 'повністю переписано' },
      
      // English replacements
      { from: /In the first slide\s+the title was changed/g, to: 'Slide title changed' },
      { from: /In the first slide\s+in\s+/g, to: 'In slide ' },
      { from: /In the first slide\s+/g, to: 'In slide ' },
      { from: /was changed from/g, to: 'changed from' },
      { from: /was updated from/g, to: 'updated from' },
      { from: /was completely rewritten/g, to: 'completely rewritten' }
    ];
    
    replacements.forEach(({ from, to }) => {
      cleaned = cleaned.replace(from, to);
    });
    
    // Clean up quotes - make them more readable
    cleaned = cleaned.replace(/'/g, '"');
    
    return cleaned;
  };



  // Get section type display info
  const getSectionInfo = (sectionType: CommentSectionType) => {
    const sectionMap = {
      slide: { label: 'Slide', icon: '📄', color: theme.palette.primary.main },
      objective: { label: 'Objective', icon: '🎯', color: theme.palette.success.main },
      material: { label: 'Material', icon: '📚', color: theme.palette.info.main },
      game: { label: 'Game', icon: '🎮', color: theme.palette.warning.main },
      recommendation: { label: 'Tip', icon: '💡', color: theme.palette.secondary.main },
      general: { label: 'General', icon: '📝', color: theme.palette.grey[600] }
    };
    
    return sectionMap[sectionType] || sectionMap.general;
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };

  // Get change type icon and color
  const getChangeTypeInfo = (changeType: string) => {
    switch (changeType) {
      case 'modified':
        return { icon: <EditIcon fontSize="small" />, color: theme.palette.warning.main };
      case 'added':
        return { icon: <AddIcon fontSize="small" />, color: theme.palette.success.main };
      case 'removed':
        return { icon: <RemoveIcon fontSize="small" />, color: theme.palette.error.main };
      case 'restructured':
        return { icon: <ReorderIcon fontSize="small" />, color: theme.palette.info.main };
      default:
        return { icon: <EditIcon fontSize="small" />, color: theme.palette.grey[600] };
    }
  };

  // Нова логіка визначення режиму відображення
  const shouldShowResults = () => {
    // Показуємо результати якщо:
    // 1. Є зміни І НЕ в режимі редагування
    // 2. АБО є зміни І в режимі редагування І немає нових коментарів
    const hasChanges = planChanges && planChanges.changes && planChanges.changes.length > 0;
    return hasChanges && (
      !isEditingMode || 
      comments.length === 0
    );
  };

  const showResultsMode = shouldShowResults();
  const showCommentsMode = !showResultsMode && (comments.length > 0 || isEditingMode);

  if (!showCommentsMode && !showResultsMode) {
    return null;
  }

  // Group comments by section (for comments mode)
  const groupedComments = comments.reduce((acc, comment) => {
    if (!acc[comment.sectionType]) {
      acc[comment.sectionType] = [];
    }
    acc[comment.sectionType].push(comment);
    return acc;
  }, {} as Record<CommentSectionType, PlanComment[]>);

  // Render Results Mode
  const renderResultsMode = () => (
    <Box sx={{ p: 2, pt: 1 }}>
      {/* Changes List */}
      <Stack spacing={2}>
        {planChanges!.changes.map((change, index) => {
          const hasDetailedInfo = change.detailedDescription !== change.shortDescription;
          const isExpanded = shouldShowItemDetails(index, change);
          const isIndividuallyExpanded = expandedItems.has(index);
          
          return (
            <Box key={index} sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              '&:hover': {
                borderColor: theme.palette.primary.light,
                backgroundColor: theme.palette.primary.main + '02'
              }
            }}>
              {/* Clickable main change description */}
              <Box
                onClick={() => hasDetailedInfo && toggleItemExpansion(index)}
                sx={{
                  p: 2,
                  cursor: hasDetailedInfo ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': hasDetailedInfo ? {
                    backgroundColor: theme.palette.action.hover
                  } : {}
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.primary',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    fontWeight: 500,
                    flex: 1
                  }}
                >
                  {change.shortDescription}
                </Typography>
                
                {/* Expansion indicator */}
                {hasDetailedInfo && (
                  <Box sx={{ 
                    ml: 1,
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {isIndividuallyExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </Box>
                )}
              </Box>
              
              {/* Detailed info when expanded */}
              {isExpanded && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    mt: 0.5,
                    px: 2,
                    pb: 1
                  }}
                >
                  {cleanupDetailedDescription(change.detailedDescription)}
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );

  // Render Comments Mode
  const renderCommentsMode = () => (
    <Box sx={{ p: 1.5, pt: 1 }}>

        {/* Processing indicator */}
        {isProcessing && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            icon={<CircularProgress size={20} />}
          >
            Processing your comments... This may take a few moments.
          </Alert>
        )}

        {/* Comments by section */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {Object.entries(groupedComments).map(([sectionType, sectionComments]) => {
            const sectionInfo = getSectionInfo(sectionType as CommentSectionType);
            
            return (
              <Box key={sectionType}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    color: sectionInfo.color,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  <span style={{ marginRight: 6, fontSize: '0.9rem' }}>{sectionInfo.icon}</span>
                  {sectionInfo.label} ({sectionComments.length})
                </Typography>
                
                <Stack spacing={0.5} sx={{ ml: 1 }}>
                  {sectionComments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        p: 1,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                          '& .delete-button': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      {/* Left side - badges and content */}
                      <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          {comment.sectionId && (
                            <Chip
                              label={`#${comment.sectionId}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          )}
                          
                          <Box sx={{
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            backgroundColor: getPriorityColor(comment.priority) + '20',
                            color: getPriorityColor(comment.priority),
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            lineHeight: 1
                          }}>
                            {comment.priority || 'medium'}
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ 
                          color: 'text.primary',
                          fontSize: '0.85rem',
                          lineHeight: 1.3
                        }}>
                          {comment.comment}
                        </Typography>
                      </Box>
                      
                      {/* Right side - delete button (hover only) */}
                      <IconButton 
                        className="delete-button"
                        size="small" 
                        onClick={() => onRemoveComment(comment.id)}
                        disabled={isProcessing}
                        sx={{ 
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 20, 
                          height: 20,
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.grey[300]}`,
                          '&:hover': {
                            backgroundColor: theme.palette.error.light,
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.contrastText
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '0.8rem' }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>

        {/* Action buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          pt: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button
            size="small"
            variant="text"
            onClick={onClearAllComments}
            disabled={isProcessing}
            startIcon={<ClearIcon />}
            sx={{ 
              fontSize: '0.8rem',
              py: 0.5,
              px: 1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: theme.palette.error.light + '20',
                color: theme.palette.error.main
              }
            }}
          >
            Clear All
          </Button>
          
          <Button
            size="small"
            variant="contained"
            onClick={onProcessComments}
            disabled={isProcessing || comments.length === 0}
            startIcon={isProcessing ? <CircularProgress size={14} /> : <SaveIcon />}
            sx={{ 
              fontSize: '0.8rem',
              py: 0.5,
              px: 1.5,
              minWidth: 120
            }}
          >
            {isProcessing ? 'Processing...' : 'Apply Changes'}
          </Button>
        </Box>


    </Box>
  );

  // Return appropriate mode
  return showResultsMode ? renderResultsMode() : renderCommentsMode();
};

export default CommentPanel;
