'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Grid, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, CheckCircle2, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface GridItem {
  id: string;
  name: string;
  imageUrl?: string;
  correctCategory: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface CategorizationGridProps {
  items: GridItem[];
  categories: Category[];
  gridSize?: '2x2' | '3x3' | '4x4';
  showHints?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const CategorizationGrid: React.FC<CategorizationGridProps> = ({
  items = [],
  categories = [],
  gridSize = '3x3',
  showHints = false,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [shuffledItems] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [availableItems, setAvailableItems] = useState<GridItem[]>(shuffledItems);
  const [categorizedItems, setCategorizedItems] = useState<
    Record<string, GridItem[]>
  >(() => {
    const initial: Record<string, GridItem[]> = {};
    categories.forEach((cat) => {
      initial[cat.id] = [];
    });
    return initial;
  });
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const getGridDimensions = () => {
    switch (gridSize) {
      case '2x2':
        return { cols: 2, rows: 2 };
      case '3x3':
        return { cols: 3, rows: 3 };
      case '4x4':
        return { cols: 4, rows: 4 };
      default:
        return { cols: 3, rows: 3 };
    }
  };

  const handleItemPlace = (item: GridItem, categoryId: string) => {
    // Remove from available
    setAvailableItems(availableItems.filter((i) => i.id !== item.id));

    // Add to category
    setCategorizedItems({
      ...categorizedItems,
      [categoryId]: [...categorizedItems[categoryId], item],
    });

    // Check if correct
    if (item.correctCategory === categoryId) {
      soundService.playCorrect();
      triggerHaptic('success');
    } else {
      setMistakes((prev) => prev + 1);
      soundService.playError();
      triggerHaptic('error');
    }

    // Check completion
    const newAvailable = availableItems.filter((i) => i.id !== item.id);
    if (newAvailable.length === 0) {
      checkCompletion({
        ...categorizedItems,
        [categoryId]: [...categorizedItems[categoryId], item],
      });
    }
  };

  const handleItemRemove = (item: GridItem, categoryId: string) => {
    // Remove from category
    setCategorizedItems({
      ...categorizedItems,
      [categoryId]: categorizedItems[categoryId].filter((i) => i.id !== item.id),
    });

    // Add back to available
    setAvailableItems([...availableItems, item]);

    triggerHaptic('light');
    soundService.play('tap');
  };

  const checkCompletion = (finalCategorized: Record<string, GridItem[]>) => {
    const allCorrect = Object.entries(finalCategorized).every(([categoryId, items]) =>
      items.every((item) => item.correctCategory === categoryId)
    );

    if (allCorrect) {
      setIsComplete(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      soundService.playSuccess();
      triggerHaptic('success');
    }
  };

  const handleReset = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setAvailableItems(shuffled);
    
    const initial: Record<string, GridItem[]> = {};
    categories.forEach((cat) => {
      initial[cat.id] = [];
    });
    setCategorizedItems(initial);
    
    setIsComplete(false);
    setMistakes(0);
    triggerHaptic('light');
  };

  if (items.length === 0 || categories.length === 0) {
    return (
      <Box
        onClick={onFocus}
        sx={{
          p: 4,
          textAlign: 'center',
          border: isSelected ? '2px solid' : '2px dashed',
          borderColor: isSelected ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          backgroundColor: 'grey.50',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Add items and categories to get started!
        </Typography>
      </Box>
    );
  }

  const dimensions = getGridDimensions();

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 700,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            📦 Categorization Grid
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sort items into the correct categories
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${items.length - availableItems.length}/${items.length} sorted`}
            color="primary"
            icon={<Grid3x3 size={16} />}
          />
          {mistakes > 0 && (
            <Chip label={`Mistakes: ${mistakes}`} color="warning" />
          )}
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={24} />
          </IconButton>
        </Box>
      </Box>

      {!isComplete ? (
        <>
          {/* Categories Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {categories.map((category) => {
              const categoryItems = categorizedItems[category.id] || [];
              const isCorrect = categoryItems.every(
                (item) => item.correctCategory === category.id
              );

              return (
                <Grid item xs={12} sm={6} md={12 / dimensions.cols} key={category.id}>
                  <Paper
                    elevation={4}
                    sx={{
                      minHeight: 250,
                      p: 3,
                      borderRadius: 3,
                      border: '3px solid',
                      borderColor: category.color,
                      backgroundColor: alpha(category.color, 0.05),
                    }}
                  >
                    {/* Category Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 2,
                        borderBottom: '2px solid',
                        borderColor: category.color,
                      }}
                    >
                      {category.icon && (
                        <Typography variant="h4">{category.icon}</Typography>
                      )}
                      <Typography variant="h6" fontWeight={700}>
                        {category.name}
                      </Typography>
                      {categoryItems.length > 0 && isCorrect && (
                        <CheckCircle2 size={24} color={category.color} />
                      )}
                    </Box>

                    {/* Drop Zone */}
                    <Box
                      sx={{
                        minHeight: 150,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: category.color,
                        backgroundColor: 'white',
                      }}
                    >
                      {categoryItems.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ width: '100%', textAlign: 'center', py: 4 }}
                        >
                          Drop items here
                        </Typography>
                      ) : (
                        categoryItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                          >
                            <Chip
                              label={item.name}
                              onClick={() => handleItemRemove(item, category.id)}
                              onDelete={() => handleItemRemove(item, category.id)}
                              sx={{
                                backgroundColor:
                                  item.correctCategory === category.id
                                    ? alpha('#4CAF50', 0.2)
                                    : alpha('#f44336', 0.2),
                                borderColor:
                                  item.correctCategory === category.id
                                    ? 'success.main'
                                    : 'error.main',
                                border: '2px solid',
                              }}
                            />
                          </motion.div>
                        ))
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Available Items */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Items to sort:
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  minHeight: 100,
                }}
              >
                {availableItems.length === 0 ? (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ width: '100%', textAlign: 'center', py: 3 }}
                  >
                    All items have been sorted!
                  </Typography>
                ) : (
                  availableItems.map((item) => (
                    <Box key={item.id}>
                      <Paper
                        elevation={4}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          cursor: 'grab',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        {item.imageUrl && (
                          <Box
                            component="img"
                            src={item.imageUrl}
                            alt={item.name}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>

                        {/* Quick place buttons */}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                          {categories.map((cat) => (
                            <Chip
                              key={cat.id}
                              label={cat.name}
                              size="small"
                              onClick={() => handleItemPlace(item, cat.id)}
                              sx={{
                                backgroundColor: alpha(cat.color, 0.2),
                                fontSize: '10px',
                                height: 20,
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: alpha(cat.color, 0.4),
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Box>
        </>
      ) : (
        /* Completion Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                  <Sparkles size={32} fill="#FCD34D" color="#FCD34D" />
                </motion.div>
              ))}
            </Box>

            <Trophy size={80} />

            <Typography variant="h3" fontWeight={800} sx={{ my: 3 }}>
              Perfect Sorting!
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              All {items.length} items sorted correctly!
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Mistakes: {mistakes}
            </Typography>

            <IconButton
              onClick={handleReset}
              sx={{
                backgroundColor: 'white',
                color: 'success.main',
                width: 60,
                height: 60,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              <RotateCcw size={28} />
            </IconButton>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default CategorizationGrid;

