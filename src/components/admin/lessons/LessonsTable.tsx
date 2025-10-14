/**
 * Lessons Table Component
 * Table for displaying and managing lessons in admin panel
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Checkbox,
  Tooltip,
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Publish as PublishIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { LessonListItem, LessonStatus, LessonDifficulty } from '@/types/admin';

interface LessonsTableProps {
  lessons: LessonListItem[];
  loading?: boolean;
  selectedLessons?: string[];
  onSelectLesson?: (lessonId: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onView?: (lessonId: string) => void;
  onEdit?: (lessonId: string) => void;
  onDelete?: (lessonId: string) => void;
  onArchive?: (lessonId: string) => void;
  onPublish?: (lessonId: string) => void;
}

export const LessonsTable: React.FC<LessonsTableProps> = ({
  lessons,
  loading = false,
  selectedLessons = [],
  onSelectLesson,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onPublish,
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lessonId: string) => {
    setAnchorEl({ ...anchorEl, [lessonId]: event.currentTarget });
  };

  const handleMenuClose = (lessonId: string) => {
    setAnchorEl({ ...anchorEl, [lessonId]: null });
  };

  const handleAction = (lessonId: string, action: () => void) => {
    action();
    handleMenuClose(lessonId);
  };

  const getStatusColor = (status: LessonStatus): 'default' | 'primary' | 'success' | 'warning' => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (
    difficulty: LessonDifficulty
  ): 'success' | 'warning' | 'error' => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              {onSelectAll && <TableCell padding="checkbox" />}
              <TableCell>Lesson</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Age Group</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {onSelectAll && <TableCell padding="checkbox"><Skeleton width={24} /></TableCell>}
                <TableCell><Skeleton width={200} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (lessons.length === 0) {
    return (
      <Paper
        sx={{
          p: 8,
          borderRadius: 3,
          textAlign: 'center',
          border: (theme) => `2px dashed ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No Lessons Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search criteria
          </Typography>
        </Box>
      </Paper>
    );
  }

  const allSelected = lessons.length > 0 && selectedLessons.length === lessons.length;
  const someSelected = selectedLessons.length > 0 && !allSelected;

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 3,
        boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
            {onSelectAll && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 700 }}>Lesson</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Age Group</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Stats</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow
              key={lesson.id}
              hover
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                },
              }}
            >
              {onSelectLesson && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => onSelectLesson(lesson.id)}
                  />
                </TableCell>
              )}

              {/* Lesson Info */}
              <TableCell onClick={() => router.push(`/admin/lessons/${lesson.id}`)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={lesson.thumbnail_url || undefined}
                    sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                  >
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {lesson.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={lesson.difficulty}
                        size="small"
                        color={getDifficultyColor(lesson.difficulty)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      {lesson.is_public && (
                        <Chip
                          label="Public"
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </TableCell>

              {/* Author */}
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {lesson.user_full_name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lesson.user_email}
                  </Typography>
                </Box>
              </TableCell>

              {/* Subject */}
              <TableCell>
                <Typography variant="body2">{lesson.subject}</Typography>
              </TableCell>

              {/* Age Group */}
              <TableCell>
                <Chip label={lesson.age_group} size="small" variant="outlined" />
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={lesson.status}
                  size="small"
                  color={getStatusColor(lesson.status)}
                />
              </TableCell>

              {/* Stats */}
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    👁️ {lesson.views} views
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    📊 {lesson.slides_count || 0} slides
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ⭐ {lesson.rating.toFixed(1)}
                  </Typography>
                </Box>
              </TableCell>

              {/* Created Date */}
              <TableCell>
                <Typography variant="body2">{formatDate(lesson.created_at)}</Typography>
              </TableCell>

              {/* Actions */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView ? onView(lesson.id) : router.push(`/admin/lessons/${lesson.id}`);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, lesson.id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl[lesson.id]}
                    open={Boolean(anchorEl[lesson.id])}
                    onClose={() => handleMenuClose(lesson.id)}
                  >
                    {onEdit && (
                      <MenuItem onClick={() => handleAction(lesson.id, () => onEdit(lesson.id))}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                    )}

                    {lesson.status !== 'published' && onPublish && (
                      <MenuItem
                        onClick={() => handleAction(lesson.id, () => onPublish(lesson.id))}
                      >
                        <ListItemIcon>
                          <PublishIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Publish</ListItemText>
                      </MenuItem>
                    )}

                    {lesson.status !== 'archived' && onArchive && (
                      <MenuItem
                        onClick={() => handleAction(lesson.id, () => onArchive(lesson.id))}
                      >
                        <ListItemIcon>
                          <ArchiveIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Archive</ListItemText>
                      </MenuItem>
                    )}

                    {onDelete && (
                      <MenuItem
                        onClick={() => handleAction(lesson.id, () => onDelete(lesson.id))}
                        sx={{ color: 'error.main' }}
                      >
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

