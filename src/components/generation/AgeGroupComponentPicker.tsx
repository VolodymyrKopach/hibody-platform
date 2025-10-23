'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  AccessTime,
  Star,
  Info,
  FilterList,
  Search,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup, ComponentDefinition } from '@/types/age-group-data';
import ComponentSelectorService, { COMPONENT_DEFINITIONS } from '@/services/ComponentSelectorService';

interface AgeGroupComponentPickerProps {
  ageGroup: AgeGroup;
  onComponentSelect: (componentType: string, componentData: any) => void;
  onPreview?: (componentType: string) => void;
  selectedComponents?: string[];
  maxComponents?: number;
}

interface FilterState {
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  category: string;
  maxTime: number;
  searchQuery: string;
}

const AgeGroupComponentPicker: React.FC<AgeGroupComponentPickerProps> = ({
  ageGroup,
  onComponentSelect,
  onPreview,
  selectedComponents = [],
  maxComponents,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: 'all',
    category: 'all',
    maxTime: 60,
    searchQuery: '',
  });

  // Get components for the current age group
  const availableComponents = useMemo(() => {
    return ComponentSelectorService.getComponentsForAge(ageGroup);
  }, [ageGroup]);

  // Filter components based on current filters
  const filteredComponents = useMemo(() => {
    let components = availableComponents;

    if (filters.difficulty !== 'all') {
      components = components.filter(c => c.difficulty === filters.difficulty);
    }

    if (filters.category !== 'all') {
      components = components.filter(c => c.tags.includes(filters.category));
    }

    if (filters.maxTime < 60) {
      components = components.filter(c => c.estimatedTime <= filters.maxTime);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      components = components.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return components;
  }, [availableComponents, filters]);

  // Get unique categories from available components
  const categories = useMemo(() => {
    const allTags = availableComponents.flatMap(c => c.tags);
    return Array.from(new Set(allTags)).sort();
  }, [availableComponents]);

  // Age group information
  const ageGroupInfo = {
    '3-5': {
      name: '🐣 Toddlers (3-5 years)',
      description: 'Large, colorful components with magnetic attraction and animal helpers',
      characteristics: ['Extra large elements', 'Magnetic snapping', 'Animal guides', 'Maximum celebration'],
      color: '#FFE5F1',
      borderColor: '#FF6B9D',
    },
    '6-7': {
      name: '🎨 Preschoolers (6-7 years)',
      description: 'Story-driven components with characters and adventure themes',
      characteristics: ['Story elements', 'Character guides', 'Reward systems', 'Playful animations'],
      color: '#F3E7FF',
      borderColor: '#8B5CF6',
    },
    '8-9': {
      name: '📚 Elementary (8-9 years)',
      description: 'Educational components with explanations and progress tracking',
      characteristics: ['Educational focus', 'Progress tracking', 'Explanations', 'Skill building'],
      color: '#EFF6FF',
      borderColor: '#3B82F6',
    },
    '10-13': {
      name: '🎯 Middle School (10-13 years)',
      description: 'Strategic components with scoring and complex interactions',
      characteristics: ['Strategic thinking', 'Scoring systems', 'Complex rules', 'Challenge modes'],
      color: '#F9FAFB',
      borderColor: '#6B7280',
    },
    '14-18': {
      name: '🎓 Teens (14-18 years)',
      description: 'Professional workflow components with advanced features',
      characteristics: ['Professional tools', 'Keyboard shortcuts', 'Export options', 'Real-world context'],
      color: '#FFFFFF',
      borderColor: '#1F2937',
    },
  };

  const currentAgeInfo = ageGroupInfo[ageGroup];

  const handleComponentSelect = (component: ComponentDefinition) => {
    if (maxComponents && selectedComponents.length >= maxComponents) {
      return; // Max components reached
    }

    const templateData = ComponentSelectorService.generateTemplateData(component.type, ageGroup);
    onComponentSelect(component.type, templateData);
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      category: 'all',
      maxTime: 60,
      searchQuery: '',
    });
  };

  const renderComponentCard = (component: ComponentDefinition) => {
    const isSelected = selectedComponents.includes(component.type);
    const canSelect = !maxComponents || selectedComponents.length < maxComponents;

    return (
      <motion.div
        key={component.type}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          elevation={isSelected ? 8 : 2}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid',
            borderColor: isSelected ? 'primary.main' : 'transparent',
            backgroundColor: isSelected ? 'primary.50' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              elevation: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            {/* Component header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                {component.icon}
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {component.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={component.difficulty} 
                    size="small" 
                    color={
                      component.difficulty === 'easy' ? 'success' : 
                      component.difficulty === 'medium' ? 'warning' : 'error'
                    }
                  />
                  <Chip 
                    icon={<AccessTime />}
                    label={`${component.estimatedTime}min`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {component.description}
            </Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {component.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {component.tags.length > 3 && (
                <Chip
                  label={`+${component.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </CardContent>

          <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
            <Button
              fullWidth
              variant={isSelected ? "outlined" : "contained"}
              startIcon={isSelected ? <Star /> : <Add />}
              onClick={() => handleComponentSelect(component)}
              disabled={isSelected || !canSelect}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isSelected ? 'Selected' : 'Add Component'}
            </Button>
            
            {onPreview && (
              <Tooltip title="Preview component">
                <IconButton
                  onClick={() => onPreview(component.type)}
                  color="primary"
                >
                  <Info />
                </IconButton>
              </Tooltip>
            )}
          </CardActions>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Age Group Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: currentAgeInfo.color,
          border: '2px solid',
          borderColor: currentAgeInfo.borderColor,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {currentAgeInfo.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {currentAgeInfo.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {currentAgeInfo.characteristics.map((char) => (
            <Chip
              key={char}
              label={char}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<Clear />}
            onClick={clearFilters}
            size="small"
            variant="outlined"
          >
            Clear
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search components..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Max Time</InputLabel>
              <Select
                value={filters.maxTime}
                label="Max Time"
                onChange={(e) => setFilters(prev => ({ ...prev, maxTime: e.target.value as number }))}
              >
                <MenuItem value={60}>Any Duration</MenuItem>
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={10}>10 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Component Selection Status */}
      {maxComponents && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Components selected: {selectedComponents.length} / {maxComponents}
          </Typography>
          <Box sx={{ flexGrow: 1, height: 4, backgroundColor: 'grey.200', borderRadius: 2 }}>
            <Box
              sx={{
                height: '100%',
                backgroundColor: 'primary.main',
                borderRadius: 2,
                width: `${(selectedComponents.length / maxComponents) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      )}

      {/* Components Grid */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Available Components
          </Typography>
          <Badge badgeContent={filteredComponents.length} color="primary" sx={{ ml: 2 }} />
        </Box>

        <AnimatePresence mode="wait">
          {filteredComponents.length > 0 ? (
            <Grid container spacing={3}>
              {filteredComponents.map((component) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={component.type}>
                  {renderComponentCard(component)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No components found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters to see more components
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AgeGroupComponentPicker;
