/**
 * Lesson Preview Dialog Component
 * Modal for previewing lesson details and slides
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as ViewsIcon,
  Star as StarIcon,
  Schedule as DurationIcon,
} from '@mui/icons-material';
import type { LessonDetail } from '@/types/admin';

interface LessonPreviewDialogProps {
  lesson: LessonDetail | null;
  open: boolean;
  onClose: () => void;
}

export const LessonPreviewDialog: React.FC<LessonPreviewDialogProps> = ({
  lesson,
  open,
  onClose,
}) => {
  if (!lesson) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Lesson Preview
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {lesson.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label={lesson.status} color="primary" size="small" />
            <Chip label={lesson.difficulty} size="small" />
            <Chip label={lesson.subject} variant="outlined" size="small" />
            <Chip label={lesson.age_group} variant="outlined" size="small" />
            {lesson.is_public && <Chip label="Public" color="success" size="small" />}
          </Box>

          {lesson.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {lesson.description}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ViewsIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Views
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {lesson.views}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Rating
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {lesson.rating.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DurationIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {lesson.duration}m
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Slides
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {lesson.slides_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Author Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Author
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {lesson.user_full_name || 'Unknown'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lesson.user_email}
          </Typography>
        </Box>

        {/* Tags */}
        {lesson.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {lesson.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Slides Preview */}
        {lesson.slides.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Slides ({lesson.slides.length})
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              {lesson.slides.slice(0, 10).map((slide) => (
                <Card key={slide.id} variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {slide.slide_number}. {slide.title || 'Untitled Slide'}
                    </Typography>
                    {slide.content && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {slide.content}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
              {lesson.slides.length > 10 && (
                <Typography variant="caption" color="text.secondary" align="center">
                  + {lesson.slides.length - 10} more slides
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(lesson.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Updated
              </Typography>
              <Typography variant="body2">
                {new Date(lesson.updated_at).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" href={`/admin/lessons/${lesson.id}`}>
          View Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

