/**
 * Lesson Filters Component
 * Filtering options for lessons management
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import type { LessonFilters as LessonFiltersType } from '@/types/admin';

interface LessonFiltersProps {
  filters: LessonFiltersType;
  onFilterChange: (filters: LessonFiltersType) => void;
  onClearFilters: () => void;
  onExport?: () => void;
  subjects?: string[];
  ageGroups?: string[];
  loading?: boolean;
}

export const LessonFilters: React.FC<LessonFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onExport,
  subjects = [],
  ageGroups = [],
  loading = false,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ ...filters, search: searchValue || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleFilterChange = (key: keyof LessonFiltersType, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof LessonFiltersType] !== undefined && key !== 'limit' && key !== 'offset' && key !== 'sort_by' && key !== 'sort_order'
  ).length;

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) =>
          `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Box>
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} active`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              disabled={loading}
            >
              Clear All
            </Button>
          )}
          {onExport && (
            <Tooltip title="Export to CSV">
              <IconButton onClick={onExport} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filters Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search lessons..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={loading}
          sx={{
            gridColumn: { xs: '1', md: '1 / 3' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchValue('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filter */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="Status"
            disabled={loading}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>

        {/* Difficulty Filter */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={filters.difficulty || 'all'}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            label="Difficulty"
            disabled={loading}
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>

        {/* Subject Filter */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Subject</InputLabel>
          <Select
            value={filters.subject || 'all'}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            label="Subject"
            disabled={loading}
          >
            <MenuItem value="all">All Subjects</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Age Group Filter */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Age Group</InputLabel>
          <Select
            value={filters.age_group || 'all'}
            onChange={(e) => handleFilterChange('age_group', e.target.value)}
            label="Age Group"
            disabled={loading}
          >
            <MenuItem value="all">All Ages</MenuItem>
            {ageGroups.map((age) => (
              <MenuItem key={age} value={age}>
                {age}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sort_by || 'created_at'}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            label="Sort By"
            disabled={loading}
          >
            <MenuItem value="created_at">Created Date</MenuItem>
            <MenuItem value="updated_at">Updated Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="views">Views</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>

        {/* Sort Order */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Order</InputLabel>
          <Select
            value={filters.sort_order || 'desc'}
            onChange={(e) => handleFilterChange('sort_order', e.target.value)}
            label="Order"
            disabled={loading}
          >
            <MenuItem value="desc">Descending</MenuItem>
            <MenuItem value="asc">Ascending</MenuItem>
          </Select>
        </FormControl>

        {/* Public/Private Filter */}
        <FormControl
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        >
          <InputLabel>Visibility</InputLabel>
          <Select
            value={
              filters.is_public === undefined ? 'all' : filters.is_public ? 'public' : 'private'
            }
            onChange={(e) =>
              handleFilterChange(
                'is_public',
                e.target.value === 'all' ? undefined : e.target.value === 'public'
              )
            }
            label="Visibility"
            disabled={loading}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

