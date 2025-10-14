/**
 * Admin Worksheets Page
 * Manage and view all worksheets created on the platform
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Pagination,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Skeleton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { worksheetsService } from '@/services/admin/worksheetsService';
import type {
  WorksheetListItem,
  WorksheetFilters,
  WorksheetStats,
} from '@/types/admin';

export default function AdminWorksheetsPage() {
  const [worksheets, setWorksheets] = useState<WorksheetListItem[]>([]);
  const [stats, setStats] = useState<WorksheetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorksheets, setTotalWorksheets] = useState(0);
  const limit = 20;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');

  useEffect(() => {
    loadWorksheets();
  }, [page, typeFilter, ageGroupFilter]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadWorksheets();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadWorksheets = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: WorksheetFilters = {
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? (typeFilter as any) : undefined,
        age_group: ageGroupFilter !== 'all' ? ageGroupFilter : undefined,
        limit,
        offset: (page - 1) * limit,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      const result = await worksheetsService.getWorksheets(filters);
      setWorksheets(result.data);
      setTotalPages(result.total_pages);
      setTotalWorksheets(result.total);
    } catch (err) {
      console.error('Error loading worksheets:', err);
      setError('Failed to load worksheets');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await worksheetsService.getWorksheetsStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWorksheets();
    loadStats();
  };

  const handleDelete = async (worksheetId: string) => {
    if (!confirm('Are you sure you want to delete this worksheet?')) return;

    try {
      const result = await worksheetsService.deleteWorksheet(worksheetId);
      if (result.success) {
        setSuccess('Worksheet deleted successfully');
        loadWorksheets();
        loadStats();
      } else {
        setError(result.error || 'Failed to delete worksheet');
      }
    } catch (err) {
      console.error('Error deleting worksheet:', err);
      setError('Failed to delete worksheet');
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = await worksheetsService.exportWorksheetsToCSV({
        type: typeFilter !== 'all' ? (typeFilter as any) : undefined,
        age_group: ageGroupFilter !== 'all' ? ageGroupFilter : undefined,
      });
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worksheets-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Worksheets exported successfully');
    } catch (err) {
      console.error('Error exporting worksheets:', err);
      setError('Failed to export worksheets');
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
              Worksheets Management
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Manage all worksheets ({totalWorksheets} total)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>{success}</Alert>}

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Worksheets</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total_worksheets}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Downloads</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total_downloads}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Types</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.by_type.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Age Groups</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.by_age_group.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search worksheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon /></IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="coloring">Coloring</MenuItem>
              <MenuItem value="writing">Writing</MenuItem>
              <MenuItem value="math">Math</MenuItem>
              <MenuItem value="reading">Reading</MenuItem>
              <MenuItem value="puzzle">Puzzle</MenuItem>
              <MenuItem value="drawing">Drawing</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Age Group</InputLabel>
            <Select value={ageGroupFilter} onChange={(e) => setAgeGroupFilter(e.target.value)} label="Age Group">
              <MenuItem value="all">All Ages</MenuItem>
              <MenuItem value="3-5">3-5</MenuItem>
              <MenuItem value="6-8">6-8</MenuItem>
              <MenuItem value="9-11">9-11</MenuItem>
              <MenuItem value="12-14">12-14</MenuItem>
              <MenuItem value="15-18">15-18</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Worksheets Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : worksheets.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No Worksheets Found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {worksheets.map((worksheet) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={worksheet.id}>
              <Card sx={{ borderRadius: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.2s' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 160,
                    bgcolor: alpha('#2196f3', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {worksheet.thumbnail_url ? (
                    <Box component="img" src={worksheet.thumbnail_url} alt={worksheet.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <AssignmentIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  )}
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {worksheet.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={worksheet.type} size="small" />
                    <Chip label={worksheet.age_group} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {worksheet.user_full_name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    📥 {worksheet.downloads_count || 0} downloads
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" href={worksheet.file_url} target="_blank" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDelete(worksheet.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
        </Box>
      )}
    </Container>
  );
}
