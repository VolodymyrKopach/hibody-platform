import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Collapse,
  LinearProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Comment as CommentsIcon
} from '@mui/icons-material';
import { SlideComment, SlideEditingProgress, SlideChanges } from '@/types/templates';
import { SimpleSlide } from '@/types/chat';

interface SlideEditingExpandablePanelProps {
  // Comment state
  slides: SimpleSlide[];
  comments: SlideComment[];
  editingProgress: SlideEditingProgress[];
  isProcessingComments: boolean;
  
  // Results state
  slideChanges?: Record<string, SlideChanges> | null;
  
  // Callbacks
  onRemoveComment: (commentId: string) => void;
  onClearAllComments: () => void;
  onStartEditing: () => void;
  onCloseResults?: () => void;
}

type PanelMode = 'comments' | 'processing' | 'results';

const SlideEditingExpandablePanel: React.FC<SlideEditingExpandablePanelProps> = ({
  slides,
  comments,
  editingProgress,
  isProcessingComments,
  slideChanges,
  onRemoveComment,
  onClearAllComments,
  onStartEditing,
  onCloseResults
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  // Determine panel mode and visibility
  const hasComments = comments.length > 0;
  const hasResults = slideChanges && Object.keys(slideChanges).length > 0;
  const shouldShow = hasComments || isProcessingComments || hasResults;

  let panelMode: PanelMode;
  if (isProcessingComments) {
    panelMode = 'processing';
  } else if (hasResults) {
    panelMode = 'results';
  } else {
    panelMode = 'comments';
  }

  if (!shouldShow) {
    return null;
  }

  // Group comments by slide
  const commentsBySlide = comments.reduce((acc, comment) => {
    if (!acc[comment.slideId]) {
      acc[comment.slideId] = [];
    }
    acc[comment.slideId].push(comment);
    return acc;
  }, {} as Record<string, SlideComment[]>);

  const slidesWithComments = Object.keys(commentsBySlide);
  const totalComments = comments.length;
  const totalSlidesWithComments = slidesWithComments.length;

  // Results calculations
  const totalChanges = hasResults ? Object.values(slideChanges!).reduce((acc, changes) => acc + changes.changes.length, 0) : 0;
  const totalSlidesWithChanges = hasResults ? Object.keys(slideChanges!).length : 0;

  const toggleSlideExpansion = (slideId: string) => {
    setExpandedSlides(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slideId)) {
        newSet.delete(slideId);
      } else {
        newSet.add(slideId);
      }
      return newSet;
    });
  };

  const toggleChangeExpansion = (changeKey: string) => {
    setExpandedChanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(changeKey)) {
        newSet.delete(changeKey);
      } else {
        newSet.add(changeKey);
      }
      return newSet;
    });
  };

  const getSlideTitle = (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    return slide?.title || `Slide ${slideId}`;
  };

  const getProgressIcon = (progress: SlideEditingProgress) => {
    switch (progress.status) {
      case 'completed':
        return <CompleteIcon color="success" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'processing':
        return null;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getSectionTypeColor = (sectionType: SlideComment['sectionType']) => {
    const sectionColors = {
      title: theme.palette.primary.main,
      content: theme.palette.success.main,
      styling: theme.palette.secondary.main,
      interactions: theme.palette.info.main,
      general: theme.palette.grey[600]
    };
    return sectionColors[sectionType] || sectionColors.general;
  };

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
    
    // Clean up quotes - make them more readable
    cleaned = cleaned.replace(/'/g, '"');
    
    return cleaned;
  };

  // Get header info based on mode
  const getHeaderInfo = () => {
    switch (panelMode) {
      case 'processing':
        return {
          title: t('slideEditing.panel.processing'),
          subtitle: t('slideEditing.panel.processingSubtitle'),
          icon: null,
          color: theme.palette.primary.main,
          bgColor: theme.palette.primary.light + '20'
        };
      case 'results':
        return {
          title: t('slideEditing.results.title'),
          subtitle: t('slideEditing.results.subtitle', { slideCount: totalSlidesWithChanges, changeCount: totalChanges }),
          icon: <CompleteIcon color="success" />,
          color: theme.palette.success.main,
          bgColor: theme.palette.success.light + '20'
        };
      default: // comments
        return {
          title: t('slideEditing.panel.title'),
          subtitle: t('slideEditing.panel.subtitle', { slideCount: totalSlidesWithComments, commentCount: totalComments }),
          icon: <CommentsIcon color="primary" />,
          color: theme.palette.primary.main,
          bgColor: theme.palette.primary.light + '20'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        mb: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header - Always visible */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: 2,
          backgroundColor: headerInfo.bgColor,
          borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': {
            backgroundColor: alpha(headerInfo.color, 0.1)
          },
          transition: 'background-color 0.2s ease'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {headerInfo.icon}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: headerInfo.color }}>
              {headerInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {headerInfo.subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {panelMode === 'comments' && (
            <Chip 
              label={`${totalComments} ${t('slideEditing.panel.comments')}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
          {panelMode === 'results' && (
            <Chip 
              label={`${totalChanges} ${t('slideEditing.results.changes')}`}
              size="small"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          )}
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Expandable Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 3 }}>
          {/* Processing Mode */}
          {panelMode === 'processing' && (
            <Stack spacing={2}>
              {editingProgress.map(progress => (
                <Box key={progress.slideId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {getProgressIcon(progress)}
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                      {getSlideTitle(progress.slideId)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {Math.round(progress.progress)}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.progress}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: progress.status === 'error' 
                          ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }
                    }}
                  />
                  
                  {progress.currentOperation && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                      {progress.currentOperation}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {/* Comments Mode */}
          {panelMode === 'comments' && (
            <Stack spacing={2}>
              {slidesWithComments.map(slideId => {
                const slideComments = commentsBySlide[slideId];
                const isSlideExpanded = expandedSlides.has(slideId);
                
                return (
                  <Box key={slideId}>
                    <Box
                      onClick={() => toggleSlideExpansion(slideId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.grey[200]}`,
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                          borderColor: theme.palette.primary.light
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                        {getSlideTitle(slideId)}
                      </Typography>
                      <Chip 
                        label={slideComments.length}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, fontWeight: 600 }}
                      />
                      {isSlideExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={isSlideExpanded}>
                      <Stack spacing={1} sx={{ mt: 1, ml: 1 }}>
                        {slideComments.map(comment => (
                          <Box
                            key={comment.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.5,
                              p: 1.5,
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.grey[200]}`,
                              position: 'relative',
                              '&:hover': {
                                borderColor: theme.palette.primary.light,
                                '& .delete-button': {
                                  opacity: 1
                                }
                              },
                              transition: 'border-color 0.2s ease'
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                                {comment.comment}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={t(`slideEditing.sections.${comment.sectionType}`)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: 22, 
                                    fontSize: '0.7rem',
                                    borderColor: getSectionTypeColor(comment.sectionType),
                                    color: getSectionTypeColor(comment.sectionType)
                                  }}
                                />
                                <Chip 
                                  label={t(`slideEditing.priority.${comment.priority}`)}
                                  size="small"
                                  sx={{ 
                                    height: 22, 
                                    fontSize: '0.7rem',
                                    backgroundColor: getPriorityColor(comment.priority) + '20',
                                    color: getPriorityColor(comment.priority),
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </Box>
                            
                            <IconButton
                              className="delete-button"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveComment(comment.id);
                              }}
                              sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                width: 24,
                                height: 24,
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.grey[300]}`,
                                '&:hover': {
                                  backgroundColor: theme.palette.error.light,
                                  borderColor: theme.palette.error.main,
                                  color: theme.palette.error.contrastText
                                }
                              }}
                            >
                              <ClearIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Results Mode */}
          {panelMode === 'results' && slideChanges && (
            <Stack spacing={2}>
              {/* Changes by Slide */}
              {Object.entries(slideChanges).map(([slideId, changes]) => {
                const isSlideExpanded = expandedSlides.has(slideId);
                
                return (
                  <Box key={slideId}>
                    {/* Slide Header */}
                    <Box
                      onClick={() => toggleSlideExpansion(slideId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                          borderColor: theme.palette.primary.light
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
                        {getSlideTitle(slideId)}
                      </Typography>
                      <Chip 
                        label={`${changes.changes.length} ${t('slideEditing.results.changes')}`}
                        size="small"
                        color="success"
                        sx={{ mr: 1 }}
                      />
                      {isSlideExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>

                    {/* Slide Changes */}
                    <Collapse in={isSlideExpanded}>
                      <Box sx={{ mt: 1, ml: 2 }}>
                        <Stack spacing={1}>
                          {changes.changes.map((change, changeIndex) => {
                            const changeKey = `${slideId}_${changeIndex}`;
                            const hasDetailedInfo = change.detailedDescription !== change.shortDescription;
                            const isChangeExpanded = expandedChanges.has(changeKey);
                            
                            return (
                              <Box key={changeIndex} sx={{
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                overflow: 'hidden'
                              }}>
                                <Box
                                  onClick={() => hasDetailedInfo && toggleChangeExpansion(changeKey)}
                                  sx={{
                                    p: 1.5,
                                    cursor: hasDetailedInfo ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    '&:hover': hasDetailedInfo ? {
                                      backgroundColor: theme.palette.action.hover
                                    } : {}
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    <Chip
                                      label={change.section}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontSize: '0.85rem',
                                        lineHeight: 1.4
                                      }}
                                    >
                                      {change.shortDescription}
                                    </Typography>
                                  </Box>
                                  
                                  {hasDetailedInfo && (
                                    <Box sx={{ 
                                      ml: 1,
                                      color: theme.palette.text.secondary,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}>
                                      {isChangeExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </Box>
                                  )}
                                </Box>
                                
                                {/* Detailed description */}
                                <Collapse in={isChangeExpanded && hasDetailedInfo}>
                                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.5,
                                        fontStyle: 'italic'
                                      }}
                                    >
                                      {cleanupDetailedDescription(change.detailedDescription)}
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Actions */}
        {!isProcessingComments && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
              {panelMode === 'comments' && (
                <>
                  <Button
                    size="small"
                    variant="text"
                    onClick={onClearAllComments}
                    startIcon={<ClearIcon />}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: theme.palette.error.light + '20',
                        color: theme.palette.error.main
                      }
                    }}
                  >
                    {t('slideEditing.panel.clearAll')}
                  </Button>
                  
                  <Button
                    size="medium"
                    variant="contained"
                    onClick={onStartEditing}
                    disabled={totalComments === 0}
                    startIcon={<EditIcon />}
                    sx={{ 
                      minWidth: 160,
                      fontWeight: 600,
                      boxShadow: theme.shadows[3],
                      '&:hover': {
                        boxShadow: theme.shadows[6]
                      }
                    }}
                  >
                    {t('slideEditing.panel.startEditing', { count: totalSlidesWithComments })}
                  </Button>
                </>
              )}

              {panelMode === 'results' && (
                <Button 
                  onClick={onCloseResults} 
                  variant="contained"
                  color="success"
                >
                  {t('slideEditing.results.close')}
                </Button>
              )}
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
};

export default SlideEditingExpandablePanel;
