'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Pagination,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  School,
  Schedule,
  Person,
  MoreVert,
  Edit,
  Delete,
  Share,
  Visibility,
  PlayArrow,
  FileCopy,
  Star,
  StarBorder
} from '@mui/icons-material';
import { useSupabaseLessons } from '@/hooks/useSupabaseLessons';
import { useAuth } from '@/providers/AuthProvider';
import type { LessonRow } from '@/types/database';

interface LessonsListProps {
  onLessonSelect?: (lesson: LessonRow) => void;
  onLessonEdit?: (lesson: LessonRow) => void;
  showPublicLessons?: boolean;
}

const LessonsList: React.FC<LessonsListProps> = ({
  onLessonSelect,
  onLessonEdit,
  showPublicLessons = false
}) => {
  const { t } = useTranslation(['lessons', 'common']);
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    lessons, 
    loading, 
    error, 
    loadUserLessons, 
    deleteLesson, 
    clearError 
  } = useSupabaseLessons();

  const [filteredLessons, setFilteredLessons] = useState<LessonRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonRow | null>(null);

  // Apply filters
  useEffect(() => {
    let filtered = lessons;

    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter) {
      filtered = filtered.filter(lesson => lesson.subject === subjectFilter);
    }

    if (ageGroupFilter) {
      filtered = filtered.filter(lesson => lesson.age_group === ageGroupFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(lesson => lesson.status === statusFilter);
    }

    setFilteredLessons(filtered);
    setCurrentPage(1);
  }, [lessons, searchTerm, subjectFilter, ageGroupFilter, statusFilter]);

  // Get unique values for filters
  const subjects = [...new Set(lessons.map(lesson => lesson.subject))];
  const ageGroups = [...new Set(lessons.map(lesson => lesson.age_group))];
  const statuses = [...new Set(lessons.map(lesson => lesson.status))];

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = filteredLessons.slice(startIndex, startIndex + itemsPerPage);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lesson: LessonRow) => {
    setMenuAnchor(event.currentTarget);
    setSelectedLesson(lesson);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedLesson(null);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm(t('common:confirmations.deleteLesson'))) {
      try {
        await deleteLesson(lessonId);
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete lesson:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return t('common:status.published');
      case 'draft':
        return t('common:status.draft');
      case 'archived':
        return t('common:status.archived');
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return t('common:status.easy');
      case 'medium':
        return t('common:status.medium');
      case 'hard':
        return t('common:status.hard');
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        onClose={clearError}
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('lessons:search.label')}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('lessons:search.placeholder')}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('lessons:filters.subject')}</InputLabel>
              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                label={t('lessons:filters.subject')}
              >
                <MenuItem value="">{t('lessons:filters.all')}</MenuItem>
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('lessons:filters.age')}</InputLabel>
              <Select
                value={ageGroupFilter}
                onChange={(e) => setAgeGroupFilter(e.target.value)}
                label={t('lessons:filters.age')}
              >
                <MenuItem value="">{t('lessons:filters.all')}</MenuItem>
                {ageGroups.map(ageGroup => (
                  <MenuItem key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('lessons:filters.status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t('lessons:filters.status')}
              >
                <MenuItem value="">{t('lessons:filters.all')}</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSubjectFilter('');
                setAgeGroupFilter('');
                setStatusFilter('');
              }}
            >
              {t('lessons:actions.clear')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Lessons Grid */}
      {paginatedLessons.length === 0 ? (
        <Alert severity="info">
          {filteredLessons.length === 0 && lessons.length === 0 
            ? t('lessons:search.empty')
            : t('lessons:search.noResults')}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {paginatedLessons.map((lesson) => (
            <Grid item xs={12} sm={6} md={4} key={lesson.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {lesson.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, lesson)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {lesson.description || t('lessons:forms.descriptionMissing')}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={getStatusLabel(lesson.status)}
                      color={getStatusColor(lesson.status) as any}
                      size="small"
                    />
                    <Chip
                      label={getDifficultyLabel(lesson.difficulty_level)}
                      color={getDifficultyColor(lesson.difficulty_level) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.subject}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.age_group}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.duration_minutes} {t('lessons:duration.minutes')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => onLessonSelect?.(lesson)}
                    sx={{ mr: 1 }}
                  >
                    {t('lessons:actions.open')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => onLessonEdit?.(lesson)}
                  >
                    {t('lessons:actions.edit')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Lesson Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: '12px',
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => {
          onLessonSelect?.(selectedLesson!);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <PlayArrow />
          </ListItemIcon>
          {t('lessons:actions.open')}
        </MenuItem>
        <MenuItem onClick={() => {
          onLessonEdit?.(selectedLesson!);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          {t('lessons:actions.edit')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          // TODO: Implement sharing
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          {t('common:buttons.share')}
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement duplication
          handleMenuClose();
        }}>
          <ListItemIcon>
            <FileCopy />
          </ListItemIcon>
          {t('common:buttons.duplicate')}
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleDeleteLesson(selectedLesson!.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete sx={{ color: 'error.main' }} />
          </ListItemIcon>
          {t('common:buttons.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LessonsList; 