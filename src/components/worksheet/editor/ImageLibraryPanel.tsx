'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Tooltip,
  InputAdornment,
  Alert,
} from '@mui/material';
import { IconSearch, IconSparkles } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import { 
  ImageLibraryService, 
  LibraryCategory, 
  LibraryItem 
} from '@/services/images/ImageLibraryService';
import { getRecommendedCategories } from '@/utils/ageGroupPromptHelper';

interface ImageLibraryPanelProps {
  onSelectItem: (iconName: string, itemName: string) => void;
  currentAgeGroup?: string;
}

const ImageLibraryPanel: React.FC<ImageLibraryPanelProps> = ({
  onSelectItem,
  currentAgeGroup = '8-9'
}) => {
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter items when category, search, or age group changes
  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchQuery, categories, currentAgeGroup]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedCategories = await ImageLibraryService.getCategories();
      setCategories(loadedCategories);
      
      // Set default category based on age group
      const recommended = getRecommendedCategories(currentAgeGroup);
      if (recommended.length > 0 && loadedCategories.some(c => c.id === recommended[0])) {
        setSelectedCategory(recommended[0]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Не вдалося завантажити бібліотеку зображень');
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = async () => {
    try {
      let items: LibraryItem[] = [];

      if (searchQuery.trim()) {
        // Search across all categories
        items = await ImageLibraryService.searchItems(searchQuery);
      } else if (selectedCategory === 'all') {
        // Show all items
        items = await ImageLibraryService.getAllItems();
      } else {
        // Show items from selected category
        items = await ImageLibraryService.getItemsByCategory(selectedCategory);
      }

      // Filter by age group if specified
      if (currentAgeGroup) {
        items = items.filter(item => item.ageGroups.includes(currentAgeGroup));
      }

      // Check for missing icons in Tabler
      const missingIcons = items.filter(item => {
        const tablerIconName = item.icon.startsWith('Icon') ? item.icon : `Icon${item.icon}`;
        return !(TablerIcons as any)[tablerIconName];
      });
      if (missingIcons.length > 0) {
        console.group('🔍 Image Library Icon Check (Tabler Icons)');
        console.log(`Total items: ${items.length}`);
        console.log(`Missing icons: ${missingIcons.length}`);
        console.table(missingIcons.map(item => ({
          name: item.name,
          icon: item.icon,
          tablerIcon: item.icon.startsWith('Icon') ? item.icon : `Icon${item.icon}`,
          category: item.category
        })));
        console.groupEnd();
      }

      setFilteredItems(items);
    } catch (err) {
      console.error('Failed to filter items:', err);
    }
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
    setSearchQuery(''); // Clear search when changing category
  };

  const handleItemClick = (item: LibraryItem) => {
    onSelectItem(item.icon, item.name);
  };

  const renderIcon = (iconName: string, size: number = 40, itemName?: string) => {
    // Tabler icons all start with "Icon" prefix
    const tablerIconName = iconName.startsWith('Icon') ? iconName : `Icon${iconName}`;
    const IconComponent = (TablerIcons as any)[tablerIconName];
    
    if (!IconComponent) {
      console.warn(`⚠️ Missing icon in @tabler/icons-react: "${tablerIconName}" (original: "${iconName}") for item: "${itemName || 'Unknown'}"`);
      return <Box sx={{ width: size, height: size, bgcolor: '#e0e0e0', borderRadius: 1 }} />;
    }
    return <IconComponent size={size} stroke={1.5} />;
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          width: 1000,
          bgcolor: '#f8f9fa',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Завантаження бібліотеки...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          width: 1000,
          bgcolor: '#f8f9fa',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        width: 1000,
        bgcolor: '#f8f9fa',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconSparkles size={20} style={{ color: '#6366f1' }} />
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Бібліотека Зображень
        </Typography>
        <Chip 
          label={`${filteredItems.length} елементів`} 
          size="small" 
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Пошук зображень..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'white',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={18} />
            </InputAdornment>
          ),
        }}
      />

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 48,
              fontSize: '0.875rem',
            },
          }}
        >
          <Tab
            label="Всі"
            value="all"
            icon={<span style={{ fontSize: '1.2rem' }}>🎨</span>}
            iconPosition="start"
          />
          {categories.map((category) => (
            <Tab
              key={category.id}
              label={category.name}
              value={category.id}
              icon={<span style={{ fontSize: '1.2rem' }}>{category.emoji}</span>}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Items Grid */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          bgcolor: 'white',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        {filteredItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              {searchQuery ? 'Нічого не знайдено' : 'Немає доступних елементів'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {filteredItems.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
                <Tooltip title={`${item.name} (${item.complexity})`}>
                  <Card
                    onClick={() => handleItemClick(item)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                        borderColor: '#6366f1',
                      },
                      border: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        '&:last-child': {
                          pb: 1.5,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 60,
                          mb: 1,
                          color: '#374151',
                        }}
                      >
                        {renderIcon(item.icon, 48, item.name)}
                      </Box>
                      <Typography
                        variant="caption"
                        display="block"
                        fontWeight={500}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ fontSize: '0.65rem', mt: 0.5 }}
                      >
                        {item.complexity === 'simple' && '⭐ Просто'}
                        {item.complexity === 'medium' && '⭐⭐ Середнє'}
                        {item.complexity === 'detailed' && '⭐⭐⭐ Складно'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Age Group Hint */}
      {currentAgeGroup && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1.5, display: 'block' }}
        >
          💡 Показано елементи, підходящі для віку {currentAgeGroup} років
        </Typography>
      )}
    </Paper>
  );
};

export default ImageLibraryPanel;

