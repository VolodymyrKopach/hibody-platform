'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface DragItem {
  id: string;
  imageUrl: string;
  correctTarget: string;
  label?: string;
}

interface DropTarget {
  id: string;
  label: string;
  imageUrl?: string;
  backgroundColor?: string;
}

interface SimpleDragAndDropProps {
  items: DragItem[];
  targets: DropTarget[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  difficulty?: 'easy' | 'medium';
  snapDistance?: number; // px
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

interface PlacedItem {
  itemId: string;
  targetId: string;
  isCorrect: boolean;
}

const SimpleDragAndDrop: React.FC<SimpleDragAndDropProps> = ({
  items = [],
  targets = [],
  layout = 'horizontal',
  difficulty = 'easy',
  snapDistance = 80,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isEasyMode = difficulty === 'easy';

  // Check if item is already placed
  const isItemPlaced = (itemId: string) => {
    return placedItems.some(p => p.itemId === itemId);
  };

  // Get available items (not yet placed)
  const availableItems = items.filter(item => !isItemPlaced(item.id));

  // Check if all items are correctly placed
  const allCorrect = placedItems.length === items.length && 
    placedItems.every(p => p.isCorrect);

  useEffect(() => {
    if (allCorrect && placedItems.length > 0) {
      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      soundService.playSuccess();
      triggerHaptic('success');
    }
  }, [allCorrect, placedItems.length]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
    triggerHaptic('light');
  };

  const handleDragEnd = (event: any, itemId: string) => {
    if (!draggedItem) return;

    const dragEndX = event.point.x;
    const dragEndY = event.point.y;

    // Find closest target
    let closestTarget: string | null = null;
    let minDistance = Infinity;

    targetRefs.current.forEach((targetEl, targetId) => {
      const rect = targetEl.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (!containerRect) return;

      const targetCenterX = rect.left - containerRect.left + rect.width / 2;
      const targetCenterY = rect.top - containerRect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(dragEndX - targetCenterX, 2) + 
        Math.pow(dragEndY - targetCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = targetId;
      }
    });

    // Check if within snap distance
    if (closestTarget && minDistance < snapDistance) {
      const item = items.find(i => i.id === itemId);
      const isCorrect = item?.correctTarget === closestTarget;

      // Place item
      setPlacedItems(prev => [
        ...prev.filter(p => p.itemId !== itemId && p.targetId !== closestTarget),
        { itemId, targetId: closestTarget!, isCorrect }
      ]);

      if (isCorrect) {
        setCompletedTargets(prev => new Set([...prev, closestTarget!]));
        soundService.playCorrect();
        triggerHaptic('success');
        
        // Mini confetti
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { 
            x: (dragEndX + (containerRef.current?.offsetLeft || 0)) / window.innerWidth,
            y: (dragEndY + (containerRef.current?.offsetTop || 0)) / window.innerHeight 
          },
        });
      } else {
        soundService.playError();
        triggerHaptic('error');
      }
    }

    setDraggedItem(null);
    setHoveredTarget(null);
  };

  const getLayoutStyles = () => {
    switch (layout) {
      case 'vertical':
        return { flexDirection: 'column', gap: 3 };
      case 'grid':
        return { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 3 
        };
      default: // horizontal
        return { flexDirection: 'row', gap: 3, flexWrap: 'wrap' };
    }
  };

  const renderDraggableItem = (item: DragItem) => {
    const placed = placedItems.find(p => p.itemId === item.id);
    
    if (placed) {
      return null; // Already placed
    }

    return (
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
            width: 150,
            height: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: 'white',
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 3,
            transition: 'all 0.2s',
          }}
        >
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.label || 'Drag item'}
            sx={{
              width: '100%',
              height: '100%',
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
                fontSize: '1rem',
              }}
            >
              {item.label}
            </Typography>
          )}
        </Paper>
      </motion.div>
    );
  };

  const renderDropTarget = (target: DropTarget) => {
    const placedItem = placedItems.find(p => p.targetId === target.id);
    const isCompleted = completedTargets.has(target.id);
    const isHovered = hoveredTarget === target.id;
    const showGlow = (isEasyMode && draggedItem) || isHovered;

    return (
      <Box
        key={target.id}
        ref={(el) => {
          if (el) targetRefs.current.set(target.id, el);
        }}
        sx={{ position: 'relative' }}
      >
        {/* Glow effect for easy mode */}
        <AnimatePresence>
          {showGlow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                borderRadius: 24,
                filter: 'blur(12px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        <Paper
          elevation={2}
          sx={{
            width: 180,
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: target.backgroundColor || '#f5f5f5',
            border: '4px dashed',
            borderColor: isCompleted 
              ? 'success.main' 
              : showGlow 
              ? 'warning.main' 
              : 'grey.300',
            borderRadius: 3,
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s',
          }}
        >
          {/* Target background image */}
          {target.imageUrl && !placedItem && (
            <Box
              component="img"
              src={target.imageUrl}
              alt={target.label}
              sx={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
                opacity: 0.3,
                position: 'absolute',
              }}
            />
          )}

          {/* Placed item */}
          {placedItem && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={items.find(i => i.id === placedItem.itemId)?.imageUrl}
                alt="Placed"
                sx={{
                  width: '90%',
                  height: '90%',
                  objectFit: 'contain',
                }}
              />
            </motion.div>
          )}

          {/* Success checkmark */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
              }}
            >
              <CheckCircle size={40} color="#4CAF50" fill="#4CAF50" />
            </motion.div>
          )}

          {/* Label */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              bottom: 8,
              fontWeight: 700,
              color: isCompleted ? 'success.main' : 'text.secondary',
              textAlign: 'center',
              fontSize: '1.1rem',
              zIndex: 2,
            }}
          >
            {target.label}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box
      ref={containerRef}
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 400,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Success banner */}
      <AnimatePresence>
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                px: 4,
                py: 2,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Sparkles size={24} />
              <Typography variant="h6" fontWeight={700}>
                Perfect! You did it! 🎉
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Drop targets section */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
          >
            Drop here:
          </Typography>
          <Box sx={{ display: 'flex', ...getLayoutStyles() }}>
            {targets.map(renderDropTarget)}
          </Box>
        </Box>

        {/* Draggable items section */}
        {availableItems.length > 0 && (
          <Box>
            <Typography 
              variant="h6" 
              sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
            >
              Drag these:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {availableItems.map(renderDraggableItem)}
            </Box>
          </Box>
        )}
      </Box>

      {/* Hint for easy mode */}
      {isEasyMode && availableItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
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
            💡 Drag and drop items to the matching spots
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SimpleDragAndDrop;

