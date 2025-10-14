/**
 * Admin Lessons Page
 * Comprehensive lessons management with filters, stats, and bulk actions
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Fab,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Publish as PublishIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { LessonsTable } from '@/components/admin/lessons/LessonsTable';
import { LessonFilters } from '@/components/admin/lessons/LessonFilters';
import { LessonStatsCard } from '@/components/admin/lessons/LessonStatsCard';
import { LessonPreviewDialog } from '@/components/admin/lessons/LessonPreviewDialog';
import { lessonsService } from '@/services/admin/lessonsService';
import type {
  LessonListItem,
  LessonDetail,
  LessonFilters as LessonFiltersType,
  LessonStats,
} from '@/types/admin';

export default function AdminLessonsPage() {
  // State
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<LessonFiltersType>({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit,
    offset: 0,
  });

  // Selection
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<LessonDetail | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Filter options
  const [subjects, setSubjects] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    loadLessons();
  }, [page, filters]);

  useEffect(() => {
    loadStats();
    loadFilterOptions();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await lessonsService.getLessons({
        ...filters,
        limit,
        offset: (page - 1) * limit,
      });

      setLessons(result.data);
      setTotalPages(result.total_pages);
      setTotalLessons(result.total);
    } catch (err) {
      console.error('Error loading lessons:', err);
      setError('Failed to load lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await lessonsService.getLessonsStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [subjectsData, ageGroupsData] = await Promise.all([
        lessonsService.getSubjects(),
        lessonsService.getAgeGroups(),
      ]);
      setSubjects(subjectsData);
      setAgeGroups(ageGroupsData);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const handleRefresh = () => {
    loadLessons();
    loadStats();
  };

  const handleFilterChange = (newFilters: LessonFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      sort_by: 'created_at',
      sort_order: 'desc',
      limit,
      offset: 0,
    });
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedLessons(selected ? lessons.map((l) => l.id) : []);
  };

  const handleView = async (lessonId: string) => {
    try {
      const lesson = await lessonsService.getLessonDetail(lessonId);
      setPreviewLesson(lesson);
      setPreviewDialogOpen(true);
    } catch (err) {
      console.error('Error loading lesson detail:', err);
      setError('Failed to load lesson details');
    }
  };

  const handleDelete = (lessonId: string) => {
    setLessonToDelete(lessonId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!lessonToDelete) return;

    try {
      const result = await lessonsService.deleteLesson(lessonToDelete);
      if (result.success) {
        setSuccess('Lesson deleted successfully');
        loadLessons();
        loadStats();
      } else {
        setError(result.error || 'Failed to delete lesson');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson');
    } finally {
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLessons.length === 0) return;

    try {
      const result = await lessonsService.bulkDeleteLessons(selectedLessons);
      if (result.success) {
        setSuccess(result.message || 'Lessons deleted successfully');
        setSelectedLessons([]);
        loadLessons();
        loadStats();
      } else {
        setError(result.error || 'Failed to delete lessons');
      }
    } catch (err) {
      console.error('Error bulk deleting lessons:', err);
      setError('Failed to delete lessons');
    }
  };

  const handleArchive = async (lessonId: string) => {
    try {
      const result = await lessonsService.archiveLesson(lessonId);
      if (result.success) {
        setSuccess('Lesson archived successfully');
        loadLessons();
        loadStats();
      } else {
        setError(result.error || 'Failed to archive lesson');
      }
    } catch (err) {
      console.error('Error archiving lesson:', err);
      setError('Failed to archive lesson');
    }
  };

  const handlePublish = async (lessonId: string) => {
    try {
      const result = await lessonsService.publishLesson(lessonId);
      if (result.success) {
        setSuccess('Lesson published successfully');
        loadLessons();
        loadStats();
      } else {
        setError(result.error || 'Failed to publish lesson');
      }
    } catch (err) {
      console.error('Error publishing lesson:', err);
      setError('Failed to publish lesson');
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = await lessonsService.exportLessonsToCSV(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lessons-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Lessons exported successfully');
    } catch (err) {
      console.error('Error exporting lessons:', err);
      setError('Failed to export lessons');
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: 'white',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              Lessons Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                letterSpacing: 0.3,
              }}
            >
              Manage and monitor all lessons ({totalLessons} total)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                bgcolor: 'white',
                color: (theme) => theme.palette.primary.main,
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <LessonStatsCard stats={stats} loading={statsLoading} />

      {/* Bulk Actions Bar */}
      {selectedLessons.length > 0 && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            border: (theme) => `2px solid ${theme.palette.primary.main}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {selectedLessons.length} lesson(s) selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              color="error"
            >
              Delete Selected
            </Button>
            <Button variant="outlined" onClick={() => setSelectedLessons([])}>
              Clear Selection
            </Button>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <LessonFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onExport={handleExport}
        subjects={subjects}
        ageGroups={ageGroups}
        loading={loading}
      />

      {/* Table */}
      <LessonsTable
        lessons={lessons}
        loading={loading}
        selectedLessons={selectedLessons}
        onSelectLesson={handleSelectLesson}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onPublish={handlePublish}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Preview Dialog */}
      <LessonPreviewDialog
        lesson={previewLesson}
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this lesson? This action cannot be undone. All
            associated slides and data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Container>
  );
}
