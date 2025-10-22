'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';
import { useDragDropAgeStyle } from '@/hooks/useDragDropAgeStyle';
import { DragDropAgeStyleName } from '@/types/drag-drop-styles';

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
  snapDistance?: number; // px - overrides ageStyle default
  ageStyle?: DragDropAgeStyleName;
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
  snapDistance,
  ageStyle: ageStyleName,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const ageStyle = useDragDropAgeStyle(ageStyleName);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isEasyMode = difficulty === 'easy';
  const effectiveSnapDistance = snapDistance ?? ageStyle.interaction.snapDistance;
  const animationDuration = ageStyle.animations.duration / 1000; // Convert to seconds

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
      // Celebration based on age style
      if (ageStyle.animations.particles) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      if (ageStyle.animations.soundEnabled) {
        soundService.playSuccess();
      }
      if (ageStyle.interaction.hapticFeedback) {
        triggerHaptic('success');
      }
    }
  }, [allCorrect, placedItems.length, ageStyle]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
    if (ageStyle.interaction.hapticFeedback) {
      triggerHaptic('light');
    }
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
    if (closestTarget && minDistance < effectiveSnapDistance) {
      const item = items.find(i => i.id === itemId);
      const isCorrect = item?.correctTarget === closestTarget;

      // Place item
      setPlacedItems(prev => [
        ...prev.filter(p => p.itemId !== itemId && p.targetId !== closestTarget),
        { itemId, targetId: closestTarget!, isCorrect }
      ]);

      if (isCorrect) {
        setCompletedTargets(prev => new Set([...prev, closestTarget!]));
        
        if (ageStyle.animations.soundEnabled) {
          soundService.playCorrect();
        }
        if (ageStyle.interaction.hapticFeedback) {
          triggerHaptic('success');
        }
        
        // Mini confetti
        if (ageStyle.animations.particles) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { 
              x: (dragEndX + (containerRef.current?.offsetLeft || 0)) / window.innerWidth,
              y: (dragEndY + (containerRef.current?.offsetTop || 0)) / window.innerHeight 
            },
          });
        }
      } else {
        if (ageStyle.animations.soundEnabled) {
          soundService.playError();
        }
        if (ageStyle.interaction.hapticFeedback) {
          triggerHaptic('error');
        }
      }
    }

    setDraggedItem(null);
    setHoveredTarget(null);
  };

  const getLayoutStyles = () => {
    const gapValue = ageStyle.elementSize.gap / 8; // Convert px to MUI spacing units (8px base)
    
    switch (layout) {
      case 'vertical':
        return { flexDirection: 'column', gap: gapValue };
      case 'grid':
        return { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: gapValue 
        };
      default: // horizontal
        return { flexDirection: 'row', gap: gapValue, flexWrap: 'wrap' };
    }
  };

  const renderDraggableItem = (item: DragItem) => {
    const placed = placedItems.find(p => p.itemId === item.id);
    
    if (placed) {
      return null; // Already placed
    }

    const itemSize = ageStyle.elementSize.item;
    const scaleOnDrag = ageStyle.animations.bounce ? 1.15 : 1.05;
    const scaleOnHover = 1.03;

    return (
      <motion.div
        key={item.id}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => handleDragStart(item.id)}
        onDragEnd={(e, info) => handleDragEnd(info, item.id)}
        whileDrag={{ scale: scaleOnDrag, zIndex: 100 }}
        whileHover={{ scale: scaleOnHover }}
        animate={ageStyle.animations.enabled ? undefined : false}
        style={{
          cursor: ageStyle.interaction.showHandCursor ? 'pointer' : 'grab',
          touchAction: 'none',
        }}
      >
        <Paper
          elevation={draggedItem === item.id ? 8 : 4}
          sx={{
            width: itemSize,
            height: itemSize,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            backgroundColor: ageStyle.colors.itemBg,
            border: `${ageStyle.borders.width}px ${ageStyle.borders.style}`,
            borderColor: ageStyle.colors.itemBorder,
            borderRadius: `${ageStyle.borders.radius}px`,
            transition: ageStyle.animations.enabled 
              ? `all ${animationDuration}s ease-in-out` 
              : 'none',
            // Larger hit area for accessibility
            ...(ageStyle.accessibility.largeHitArea && {
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                zIndex: -1,
              },
            }),
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
          {item.label && ageStyle.typography.labelVisible && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                fontWeight: ageStyle.typography.fontWeight,
                textAlign: 'center',
                fontSize: `${ageStyle.typography.fontSize}px`,
                lineHeight: 1.2,
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
    const showGlow = (isEasyMode && draggedItem && ageStyle.interaction.showHints) || isHovered;
    
    const targetSize = ageStyle.elementSize.target;

    return (
      <Box
        key={target.id}
        ref={(el) => {
          if (el) targetRefs.current.set(target.id, el);
        }}
        sx={{ position: 'relative' }}
      >
        {/* Glow effect for hints */}
        <AnimatePresence>
          {showGlow && ageStyle.animations.enabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: animationDuration }}
              style={{
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                borderRadius: ageStyle.borders.radius + 8,
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
            width: targetSize,
            height: targetSize,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: target.backgroundColor || ageStyle.colors.targetBg,
            border: `${ageStyle.borders.width}px ${ageStyle.borders.style}`,
            borderColor: isCompleted 
              ? ageStyle.colors.success
              : showGlow 
              ? ageStyle.colors.targetHover
              : ageStyle.colors.targetBorder,
            borderRadius: `${ageStyle.borders.radius}px`,
            position: 'relative',
            zIndex: 1,
            transition: ageStyle.animations.enabled 
              ? `all ${animationDuration}s ease-in-out` 
              : 'none',
            // High contrast mode
            ...(ageStyle.accessibility.highContrast && {
              borderWidth: ageStyle.borders.width + 1,
              boxShadow: isCompleted ? '0 0 0 3px rgba(76, 175, 80, 0.3)' : 'none',
            }),
            // Larger hit area for accessibility
            ...(ageStyle.accessibility.largeHitArea && {
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -12,
                left: -12,
                right: -12,
                bottom: -12,
                zIndex: -1,
              },
            }),
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
              initial={ageStyle.animations.enabled ? { scale: 0.8, opacity: 0 } : false}
              animate={ageStyle.animations.enabled ? { scale: 1, opacity: 1 } : false}
              transition={ageStyle.animations.bounce 
                ? { type: 'spring', stiffness: 300, damping: 20 }
                : { duration: animationDuration }
              }
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
              initial={ageStyle.animations.enabled ? { scale: 0 } : false}
              animate={ageStyle.animations.enabled ? { scale: 1 } : false}
              transition={ageStyle.animations.bounce 
                ? { type: 'spring', stiffness: 400, damping: 15 }
                : { duration: animationDuration }
              }
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
              }}
            >
              <CheckCircle size={40} color={ageStyle.colors.success} fill={ageStyle.colors.success} />
            </motion.div>
          )}

          {/* Label */}
          {ageStyle.typography.labelVisible && (
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                bottom: 8,
                fontWeight: ageStyle.typography.fontWeight,
                color: isCompleted ? ageStyle.colors.success : 'text.secondary',
                textAlign: 'center',
                fontSize: `${ageStyle.typography.fontSize}px`,
                zIndex: 2,
                lineHeight: 1.2,
              }}
            >
              {target.label}
            </Typography>
          )}
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
        {allCorrect && ageStyle.animations.enabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: animationDuration }}
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
                backgroundColor: ageStyle.colors.success,
                color: 'white',
                borderRadius: `${ageStyle.borders.radius}px`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Sparkles size={24} />
              <Typography 
                variant="h6" 
                fontWeight={ageStyle.typography.fontWeight}
                sx={{ fontSize: `${ageStyle.typography.fontSize + 4}px` }}
              >
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
            sx={{ 
              mb: 2, 
              fontWeight: ageStyle.typography.fontWeight, 
              color: 'text.primary',
              fontSize: `${ageStyle.typography.fontSize + 4}px`,
            }}
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
              sx={{ 
                mb: 2, 
                fontWeight: ageStyle.typography.fontWeight, 
                color: 'text.primary',
                fontSize: `${ageStyle.typography.fontSize + 4}px`,
              }}
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
      {isEasyMode && availableItems.length > 0 && ageStyle.interaction.showHints && (
        <motion.div
          initial={ageStyle.animations.enabled ? { opacity: 0 } : false}
          animate={ageStyle.animations.enabled ? { opacity: 1 } : false}
          transition={{ delay: 1, duration: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
              fontSize: `${ageStyle.typography.fontSize}px`,
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

