/**
 * Admin Lesson Detail Page
 * Detailed view of a single lesson with editing capabilities
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  Alert,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Publish as PublishIcon,
  Visibility as ViewsIcon,
  Star as StarIcon,
  Schedule as DurationIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { lessonsService } from '@/services/admin/lessonsService';
import type { LessonDetail, UpdateLessonRequest } from '@/types/admin';

export default function AdminLessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editedLesson, setEditedLesson] = useState<UpdateLessonRequest>({});

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lessonsService.getLessonDetail(lessonId);
      setLesson(data);
      setEditedLesson({
        title: data.title,
        description: data.description || '',
        subject: data.subject,
        age_group: data.age_group,
        duration: data.duration,
        status: data.status,
        difficulty: data.difficulty,
        is_public: data.is_public,
        tags: data.tags,
      });
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError('Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await lessonsService.updateLesson(lessonId, editedLesson);
      if (result.success) {
        setSuccess('Lesson updated successfully');
        setEditMode(false);
        loadLesson();
      } else {
        setError(result.error || 'Failed to update lesson');
      }
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError('Failed to update lesson');
    }
  };

  const handleDelete = async () => {
    try {
      const result = await lessonsService.deleteLesson(lessonId);
      if (result.success) {
        router.push('/admin/lessons');
      } else {
        setError(result.error || 'Failed to delete lesson');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson');
    }
  };

  const handleArchive = async () => {
    try {
      const result = await lessonsService.archiveLesson(lessonId);
      if (result.success) {
        setSuccess('Lesson archived successfully');
        loadLesson();
      } else {
        setError(result.error || 'Failed to archive lesson');
      }
    } catch (err) {
      console.error('Error archiving lesson:', err);
      setError('Failed to archive lesson');
    }
  };

  const handlePublish = async () => {
    try {
      const result = await lessonsService.publishLesson(lessonId);
      if (result.success) {
        setSuccess('Lesson published successfully');
        loadLesson();
      } else {
        setError(result.error || 'Failed to publish lesson');
      }
    } catch (err) {
      console.error('Error publishing lesson:', err);
      setError('Failed to publish lesson');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Lesson not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push('/admin/lessons')}
        sx={{ mb: 3 }}
      >
        Back to Lessons
      </Button>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Header Card */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <TextField
                fullWidth
                value={editedLesson.title}
                onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
                sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
              />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                {lesson.title}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={lesson.status} color={lesson.status === 'published' ? 'success' : 'warning'} />
              <Chip label={lesson.difficulty} />
              <Chip label={lesson.subject} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
              <Chip label={lesson.age_group} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
              {lesson.is_public && <Chip label="Public" color="success" />}
            </Box>

            {editMode ? (
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editedLesson.description}
                onChange={(e) =>
                  setEditedLesson({ ...editedLesson, description: e.target.value })
                }
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            ) : (
              lesson.description && <Typography variant="body1">{lesson.description}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            {editMode ? (
              <>
                <Button variant="contained" onClick={handleSave} sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ color: 'white', borderColor: 'white' }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <IconButton onClick={() => setEditMode(true)} sx={{ color: 'white' }}>
                  <EditIcon />
                </IconButton>
                {lesson.status !== 'published' && (
                  <IconButton onClick={handlePublish} sx={{ color: 'white' }}>
                    <PublishIcon />
                  </IconButton>
                )}
                {lesson.status !== 'archived' && (
                  <IconButton onClick={handleArchive} sx={{ color: 'white' }}>
                    <ArchiveIcon />
                  </IconButton>
                )}
                <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'white' }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ViewsIcon color="action" />
                <Typography variant="caption" color="text.secondary">
                  Views
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {lesson.views}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon color="action" />
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {lesson.rating.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DurationIcon color="action" />
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {lesson.duration}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon color="action" />
                <Typography variant="caption" color="text.secondary">
                  Slides
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {lesson.slides_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Author Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Author Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {lesson.user_full_name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lesson.user_email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
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
          </Paper>
        </Grid>

        {/* Tags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {lesson.tags.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tags
                </Typography>
              ) : (
                lesson.tags.map((tag, index) => <Chip key={index} label={tag} />)
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Slides */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Slides ({lesson.slides.length})
            </Typography>
            {lesson.slides.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No slides available
              </Typography>
            ) : (
              <List>
                {lesson.slides.map((slide) => (
                  <ListItem key={slide.id} divider>
                    <ListItemText
                      primary={`${slide.slide_number}. ${slide.title || 'Untitled Slide'}`}
                      secondary={slide.content || 'No content'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lesson? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

