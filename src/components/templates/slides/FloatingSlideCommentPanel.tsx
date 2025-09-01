import React, { useState } from 'react';
import {
  Paper,
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
  CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Refresh as ProcessingIcon
} from '@mui/icons-material';
import { SlideComment, SlideEditingProgress } from '@/types/templates';
import { SimpleSlide } from '@/types/chat';

interface FloatingSlideCommentPanelProps {
  slides: SimpleSlide[];
  comments: SlideComment[];
  editingProgress: SlideEditingProgress[];
  isProcessingComments: boolean;
  onRemoveComment: (commentId: string) => void;
  onClearAllComments: () => void;
  onStartEditing: () => void;
  onClose?: () => void;
}

const FloatingSlideCommentPanel: React.FC<FloatingSlideCommentPanelProps> = ({
  slides,
  comments,
  editingProgress,
  isProcessingComments,
  onRemoveComment,
  onClearAllComments,
  onStartEditing,
  onClose
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());



  // Групуємо коментарі по слайдах
  const commentsBySlide = comments.reduce((acc, comment) => {
    if (!acc[comment.slideId]) {
      acc[comment.slideId] = [];
    }
    acc[comment.slideId].push(comment);
    return acc;
  }, {} as Record<string, SlideComment[]>);

  const slidesWithComments = Object.keys(commentsBySlide);
  const totalComments = comments.length;
  const totalSlides = slidesWithComments.length;

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
        return <ProcessingIcon color="primary" fontSize="small" sx={{ 
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />;
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

  if (totalComments === 0 && !isProcessingComments) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: '50%',
        right: 24,
        transform: 'translateY(-50%)',
        width: 420,
        maxHeight: '85vh',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.modal - 1,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            📝 {t('slideEditing.panel.title')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {t('slideEditing.panel.subtitle', { slideCount: totalSlides, commentCount: totalComments })}
          </Typography>
        </Box>
        
        {onClose && (
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Processing Progress */}
      {isProcessingComments && (
        <Card sx={{ m: 2, backgroundColor: theme.palette.grey[50] }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ProcessingIcon 
                color="primary" 
                sx={{ 
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                🤖 {t('slideEditing.panel.processing')}
              </Typography>
            </Box>
            
            <Stack spacing={1.5}>
              {editingProgress.map(progress => (
                <Box key={progress.slideId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {getProgressIcon(progress)}
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                      {getSlideTitle(progress.slideId)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {progress.progress}%
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
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {!isProcessingComments && (
        <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
          <Stack spacing={1} sx={{ p: 2 }}>
            {slidesWithComments.map(slideId => {
              const slideComments = commentsBySlide[slideId];
              const isExpanded = expandedSlides.has(slideId);
              
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
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  
                  <Collapse in={isExpanded}>
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
                            <CloseIcon sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Actions */}
      {!isProcessingComments && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', gap: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
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
              {t('slideEditing.panel.startEditing', { count: totalSlides })}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default FloatingSlideCommentPanel;
