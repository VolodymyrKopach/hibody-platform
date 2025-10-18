'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface SortItem {
  id: string;
  imageUrl: string;
  category: string;
  label?: string;
}

interface SortCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface SortingGameProps {
  items: SortItem[];
  categories: SortCategory[];
  sortBy?: 'color' | 'size' | 'type' | 'custom';
  layout?: 'horizontal' | 'vertical';
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

interface PlacedItem {
  itemId: string;
  categoryId: string;
}

const SortingGame: React.FC<SortingGameProps> = ({
  items = [],
  categories = [],
  sortBy = 'type',
  layout = 'horizontal',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Check if all items are correctly sorted
  const allCorrect = items.length > 0 && placedItems.length === items.length &&
    placedItems.every(placed => {
      const item = items.find(i => i.id === placed.itemId);
      return item && item.category === placed.categoryId;
    });

  // Get available (not placed) items
  const availableItems = items.filter(item => 
    !placedItems.some(p => p.itemId === item.id)
  );

  // Get items in each category
  const getItemsInCategory = (categoryId: string) => {
    return placedItems
      .filter(p => p.categoryId === categoryId)
      .map(p => items.find(i => i.id === p.itemId))
      .filter(Boolean) as SortItem[];
  };

  // Check if placement is correct
  const isCorrectPlacement = (itemId: string, categoryId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.category === categoryId;
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
    triggerHaptic('light');
  };

  const handleDragEnd = (event: any, itemId: string) => {
    if (!draggedItem) return;

    const dragEndX = event.point.x;
    const dragEndY = event.point.y;

    // Find closest category
    let closestCategory: string | null = null;
    let minDistance = Infinity;

    categoryRefs.current.forEach((categoryEl, categoryId) => {
      const rect = categoryEl.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (!containerRect) return;

      const categoryCenterX = rect.left - containerRect.left + rect.width / 2;
      const categoryCenterY = rect.top - containerRect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(dragEndX - categoryCenterX, 2) + 
        Math.pow(dragEndY - categoryCenterY, 2)
      );

      if (distance < minDistance && distance < 200) {
        minDistance = distance;
        closestCategory = categoryId;
      }
    });

    if (closestCategory) {
      const isCorrect = isCorrectPlacement(itemId, closestCategory);
      
      // Place item
      setPlacedItems(prev => [
        ...prev.filter(p => p.itemId !== itemId),
        { itemId, categoryId: closestCategory! }
      ]);

      if (isCorrect) {
        soundService.playCorrect();
        triggerHaptic('success');
      } else {
        soundService.playError();
        triggerHaptic('error');
      }
    }

    setDraggedItem(null);
    setHoveredCategory(null);
  };

  const handleReset = () => {
    setPlacedItems([]);
    setDraggedItem(null);
    triggerHaptic('light');
  };

  // Celebration when all correct
  React.useEffect(() => {
    if (allCorrect && placedItems.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
        triggerHaptic('success');
      }, 300);
    }
  }, [allCorrect, placedItems.length]);

  return (
    <Box
      ref={containerRef}
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 500,
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
            {allCorrect ? '🎉 Perfect Sorting!' : 'Sort the Items'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {allCorrect 
              ? 'Everything is in the right place!' 
              : `Sorted: ${placedItems.length}/${items.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Categories */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: layout === 'vertical' ? 'column' : 'row',
          gap: 3,
          mb: 4,
        }}
      >
        {categories.map((category) => {
          const itemsInCategory = getItemsInCategory(category.id);
          const allItemsCorrect = itemsInCategory.every(item => 
            isCorrectPlacement(item.id, category.id)
          );
          const hasIncorrectItems = itemsInCategory.some(item => 
            !isCorrectPlacement(item.id, category.id)
          );
          const isHovered = hoveredCategory === category.id || draggedItem !== null;

          return (
            <Box
              key={category.id}
              ref={(el) => {
                if (el) categoryRefs.current.set(category.id, el);
              }}
              sx={{ flex: 1, position: 'relative' }}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Glow effect when dragging */}
              <AnimatePresence>
                {isHovered && draggedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      right: -8,
                      bottom: -8,
                      background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)`,
                      borderRadius: 20,
                      filter: 'blur(12px)',
                      zIndex: 0,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </AnimatePresence>

              <Paper
                elevation={3}
                sx={{
                  minHeight: 280,
                  p: 2,
                  borderRadius: 2,
                  border: '4px dashed',
                  borderColor: allItemsCorrect && itemsInCategory.length > 0
                    ? 'success.main'
                    : hasIncorrectItems
                    ? 'error.main'
                    : category.color,
                  backgroundColor: `${category.color}10`,
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.3s',
                }}
              >
                {/* Category header */}
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  {category.icon && (
                    <Typography sx={{ fontSize: '32px', mb: 1 }}>
                      {category.icon}
                    </Typography>
                  )}
                  <Typography variant="h6" fontWeight={700} sx={{ color: category.color }}>
                    {category.name}
                  </Typography>
                </Box>

                {/* Items in category */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    justifyContent: 'center',
                    minHeight: 150,
                  }}
                >
                  <AnimatePresence>
                    {itemsInCategory.map((item) => {
                      const isCorrect = isCorrectPlacement(item.id, category.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Paper
                            elevation={4}
                            sx={{
                              width: 100,
                              height: 100,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 1,
                              borderRadius: 2,
                              border: '3px solid',
                              borderColor: isCorrect ? 'success.main' : 'error.main',
                              backgroundColor: 'white',
                              position: 'relative',
                            }}
                          >
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.label}
                              sx={{
                                width: '70%',
                                height: '70%',
                                objectFit: 'contain',
                              }}
                            />
                            {item.label && (
                              <Typography
                                variant="caption"
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                }}
                              >
                                {item.label}
                              </Typography>
                            )}

                            {/* Success indicator */}
                            {isCorrect && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                }}
                              >
                                <CheckCircle size={24} color="#4CAF50" fill="#4CAF50" />
                              </Box>
                            )}
                          </Paper>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </Box>

      {/* Available items to drag */}
      {availableItems.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Drag these items:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            {availableItems.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={(e, info) => handleDragEnd(info, item.id)}
                whileDrag={{ scale: 1.1, zIndex: 100 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              >
                <Paper
                  elevation={draggedItem === item.id ? 8 : 4}
                  sx={{
                    width: 120,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.label}
                    sx={{
                      width: '75%',
                      height: '75%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                  {item.label && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        fontWeight: 600,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Sparkles size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Great Job!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You sorted everything correctly! 🎯
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!allCorrect && placedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            💡 Drag items to the matching category boxes
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SortingGame;

