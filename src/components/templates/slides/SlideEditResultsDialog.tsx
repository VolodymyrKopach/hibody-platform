import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { SlideChanges } from '@/types/templates';
import { SimpleSlide } from '@/types/chat';

interface SlideEditResultsDialogProps {
  open: boolean;
  onClose: () => void;
  slideChanges: Record<string, SlideChanges>;
  slides: SimpleSlide[];
  onAddMoreComments?: () => void;
}

const SlideEditResultsDialog: React.FC<SlideEditResultsDialogProps> = ({
  open,
  onClose,
  slideChanges,
  slides,
  onAddMoreComments
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

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

  const totalChanges = Object.values(slideChanges).reduce((acc, changes) => acc + changes.changes.length, 0);
  const totalSlides = Object.keys(slideChanges).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        pb: 2,
        pt: 2,
        minHeight: 64,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 600,
        position: 'relative',
        zIndex: 1,
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText
      }}>
        <SuccessIcon sx={{ mr: 1 }} />
        <Box component="span" sx={{ flex: 1 }}>
          {t('slideEditing.results.title')}
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, mr: 2 }}>
          {t('slideEditing.results.subtitle', { slideCount: totalSlides, changeCount: totalChanges })}
        </Typography>
        
        <IconButton
          onClick={onClose}
          sx={{ color: 'inherit' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        pt: '24px !important', 
        pb: 2,
        mt: 0,
        position: 'relative',
        '&.MuiDialogContent-root': {
          paddingTop: '24px !important',
          marginTop: 0
        }
      }}>
        <Box sx={{ pt: 1 }}>
          {/* Summary */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.success.light + '20', 
            borderRadius: 2,
            border: `1px solid ${theme.palette.success.light}`,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <SuccessIcon color="success" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                {t('slideEditing.results.successTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('slideEditing.results.successDescription', { slideCount: totalSlides, changeCount: totalChanges })}
              </Typography>
            </Box>
          </Box>

          {/* Changes by Slide */}
          <Stack spacing={2}>
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
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    {isSlideExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>

                  {/* Slide Changes */}
                  {isSlideExpanded && (
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
                              {isChangeExpanded && hasDetailedInfo && (
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
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {onAddMoreComments && (
          <Button 
            onClick={onAddMoreComments} 
            color="primary"
            startIcon={<MessageSquare size={16} />}
          >
            {t('slideEditing.results.addMoreComments')}
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          {t('slideEditing.results.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlideEditResultsDialog;
