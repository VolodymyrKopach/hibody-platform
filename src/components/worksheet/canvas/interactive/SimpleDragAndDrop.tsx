'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Heart, Star } from 'lucide-react';
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
  emoji?: string; // Large emoji for toddler mode
  soundEffect?: 'pop' | 'whoosh' | 'ding' | 'yay'; // Sound when dragging
}

interface DropTarget {
  id: string;
  label: string;
  imageUrl?: string;
  backgroundColor?: string;
  character?: string; // Emoji character for toddler mode (e.g., '🐶', '🐱')
  celebrationText?: string; // Text shown on success (e.g., 'Yummy!', 'Om nom!')
  idleAnimation?: 'bounce' | 'wiggle' | 'pulse' | 'none'; // Idle animation
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
  const [celebratingTarget, setCelebratingTarget] = useState<string | null>(null);
  const [floatingStars, setFloatingStars] = useState<Array<{id: string, x: number, y: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  const isToddlerMode = ageStyleName === 'toddler';

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
        
        // Show celebration for toddler mode
        if (isToddlerMode) {
          setCelebratingTarget(closestTarget!);
          setTimeout(() => setCelebratingTarget(null), 2000);
          
          // Add floating stars
          const newStars = Array.from({ length: 5 }, (_, i) => ({
            id: `${closestTarget}-star-${i}-${Date.now()}`,
            x: dragEndX + (Math.random() - 0.5) * 100,
            y: dragEndY + (Math.random() - 0.5) * 100,
          }));
          setFloatingStars(prev => [...prev, ...newStars]);
          setTimeout(() => {
            setFloatingStars(prev => prev.filter(s => !newStars.find(ns => ns.id === s.id)));
          }, 1500);
        }
        
        if (ageStyle.animations.soundEnabled) {
          soundService.playCorrect();
        }
        if (ageStyle.interaction.hapticFeedback) {
          triggerHaptic('success');
        }
        
        // Enhanced confetti for toddler mode
        if (ageStyle.animations.particles) {
          const particleCount = isToddlerMode ? 50 : 30;
          const spread = isToddlerMode ? 70 : 50;
          
          confetti({
            particleCount,
            spread,
            origin: { 
              x: (dragEndX + (containerRef.current?.offsetLeft || 0)) / window.innerWidth,
              y: (dragEndY + (containerRef.current?.offsetTop || 0)) / window.innerHeight 
            },
            colors: isToddlerMode ? ['#FFD700', '#FF69B4', '#00CED1', '#FF6B6B', '#4ECDC4'] : undefined,
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
    const gapValue = isToddlerMode 
      ? ageStyle.elementSize.gap / 6  // Більше gap для toddler (24px/6 = 4 spacing units = 32px)
      : ageStyle.elementSize.gap / 8; // Стандартний gap (24px/8 = 3 spacing units = 24px)
    
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
    const scaleOnDrag = isToddlerMode ? 1.2 : (ageStyle.animations.bounce ? 1.15 : 1.05);
    const scaleOnHover = isToddlerMode ? 1.1 : 1.03;

    // Idle animation for toddler mode
    const idleAnimation = isToddlerMode ? {
      y: [0, -5, 0],
      rotate: [0, -3, 3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut',
      }
    } : undefined;

    return (
      <motion.div
        key={item.id}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => handleDragStart(item.id)}
        onDragEnd={(e, info) => handleDragEnd(info, item.id)}
        whileDrag={{ scale: scaleOnDrag, zIndex: 100, rotate: 0 }}
        whileHover={{ scale: scaleOnHover }}
        animate={ageStyle.animations.enabled ? idleAnimation : false}
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
            position: 'relative',
            overflow: 'visible',
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
            // Toddler mode: add soft pastel shadow
            ...(isToddlerMode && {
              boxShadow: '0 8px 16px rgba(255, 182, 193, 0.3), 0 2px 4px rgba(255, 215, 0, 0.2)',
            }),
          }}
        >
          {/* Big emoji for toddler mode */}
          {item.emoji && isToddlerMode ? (
            <Typography
              sx={{
                fontSize: itemSize * 0.6,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {item.emoji}
            </Typography>
          ) : (
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
          )}
          {/* Label - БЕЗ ТЕКСТУ для toddler mode, тільки якщо немає емоджі */}
          {item.label && ageStyle.typography.labelVisible && !isToddlerMode && (
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
          
          {/* Sparkles for toddler mode */}
          {isToddlerMode && (
            <motion.div
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
              }}
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={20} color="#FFD700" fill="#FFD700" />
            </motion.div>
          )}
        </Paper>
      </motion.div>
    );
  };

  const renderDropTarget = (target: DropTarget) => {
    const placedItem = placedItems.find(p => p.targetId === target.id);
    const isCompleted = completedTargets.has(target.id);
    const isHovered = hoveredTarget === target.id;
    const isCelebrating = celebratingTarget === target.id;
    const showGlow = (isEasyMode && draggedItem && ageStyle.interaction.showHints) || isHovered;
    
    const targetSize = ageStyle.elementSize.target;
    
    // Idle animation for character in toddler mode
    const characterIdleAnimation = isToddlerMode && !isCompleted ? {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut',
      }
    } : undefined;
    
    // "Open mouth" animation when dragging item nearby
    const mouthOpenAnimation = isToddlerMode && draggedItem && isHovered ? {
      scale: 1.15,
      rotate: 0,
      transition: {
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
      }
    } : undefined;
    
    // Celebration animation
    const celebrationAnimation = isCelebrating ? {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, -10, 10, 0],
      y: [0, -20, 0],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      }
    } : undefined;

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

        <motion.div
          animate={celebrationAnimation || mouthOpenAnimation || characterIdleAnimation}
          style={{ width: '100%', height: '100%' }}
        >
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
              overflow: 'visible',
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
              // Toddler mode: rainbow border when hovering + soft shadow always
              ...(isToddlerMode && showGlow && {
                borderWidth: 6,
                borderColor: 'transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #FF6B6B, #FFD93D, #6BCF7F, #4D96FF, #9B59B6)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
              }),
              // Toddler mode: soft shadow when not hovering
              ...(isToddlerMode && !showGlow && {
                boxShadow: '0 8px 20px rgba(255, 215, 0, 0.25)',
              }),
            }}
          >
          {/* Character emoji for toddler mode */}
          {target.character && isToddlerMode && !placedItem ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: targetSize * 0.5,
                  lineHeight: 1,
                  userSelect: 'none',
                  filter: draggedItem && isHovered ? 'brightness(1.2)' : 'none',
                  transition: 'filter 0.2s',
                }}
              >
                {target.character}
              </Typography>
              {/* "Hungry" indicator for toddler mode */}
              {draggedItem && !isHovered && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <Typography sx={{ fontSize: 24, lineHeight: 1 }}>
                    ⬇️
                  </Typography>
                </motion.div>
              )}
            </Box>
          ) : !target.character && target.imageUrl && !placedItem ? (
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
          ) : null}

          {/* Celebration емоджі замість тексту для toddler mode */}
          {isCelebrating && isToddlerMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 0 }}
              animate={{ scale: 2, opacity: 1, y: -40 }}
              exit={{ scale: 0, opacity: 0, y: -60 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                fontSize: '50px',
              }}
            >
              🎉✨
            </motion.div>
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
              {items.find(i => i.id === placedItem.itemId)?.emoji && isToddlerMode ? (
                <Typography
                  sx={{
                    fontSize: targetSize * 0.5,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {items.find(i => i.id === placedItem.itemId)?.emoji}
                </Typography>
              ) : (
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
              )}
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
              {isToddlerMode ? (
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Star size={50} color="#FFD700" fill="#FFD700" />
                </motion.div>
              ) : (
                <CheckCircle size={40} color={ageStyle.colors.success} fill={ageStyle.colors.success} />
              )}
            </motion.div>
          )}

          {/* Label - БЕЗ ТЕКСТУ для toddler mode */}
          {ageStyle.typography.labelVisible && !isToddlerMode && (
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
          
          {/* Hearts floating for toddler mode on completion */}
          {isCompleted && isToddlerMode && (
            <>
              <motion.div
                animate={{
                  y: [0, -30, -60],
                  x: [-10, 0, 10],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '20%',
                }}
              >
                <Heart size={24} color="#FF69B4" fill="#FF69B4" />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -30, -60],
                  x: [10, 0, -10],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.3,
                  repeatDelay: 0.5,
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20%',
                }}
              >
                <Heart size={24} color="#FF1493" fill="#FF1493" />
              </motion.div>
            </>
          )}
        </Paper>
        </motion.div>
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
        maxWidth: 1000,
        mx: 'auto',
        minHeight: isToddlerMode ? 500 : 400,
        p: isToddlerMode ? 5 : 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: isToddlerMode ? 4 : 2,
        background: isToddlerMode 
          ? 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)'
          : 'linear-gradient(135deg, #FAFAFA 0%, #F0F4F8 100%)',
        cursor: onFocus ? 'pointer' : 'default',
        overflow: 'hidden',
        '&::before': isToddlerMode ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 2px, transparent 2px), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px, 30px 30px',
          pointerEvents: 'none',
          zIndex: 0,
        } : {},
      }}
    >
      {/* Decorative background elements for toddler mode - ANIMATED */}
      {isToddlerMode && (
        <>
          {/* Animated cloud 1 */}
          <motion.div
            animate={{
              x: [0, 20, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              top: 20,
              left: 30,
              fontSize: '50px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            ☁️
          </motion.div>
          
          {/* Animated star - twinkling */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              fontSize: '35px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            ⭐
          </motion.div>
          
          {/* Animated rainbow */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              bottom: 30,
              left: 50,
              fontSize: '40px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            🌈
          </motion.div>
          
          {/* Animated cloud 2 */}
          <motion.div
            animate={{
              x: [0, -15, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              bottom: 50,
              right: 60,
              fontSize: '50px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            ☁️
          </motion.div>
        </>
      )}

      {/* Floating stars for toddler mode */}
      <AnimatePresence>
        {floatingStars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ scale: 0, x: star.x, y: star.y, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              y: star.y - 100,
              opacity: [1, 1, 0],
              rotate: [0, 360],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute',
              zIndex: 150,
              pointerEvents: 'none',
            }}
          >
            <Star size={30} color="#FFD700" fill="#FFD700" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {allCorrect && ageStyle.animations.enabled && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: isToddlerMode ? [0.8, 1.2, 1] : 1,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: animationDuration,
              type: isToddlerMode ? 'spring' : 'tween',
              stiffness: 200,
            }}
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
                backgroundColor: isToddlerMode ? '#FFD700' : ageStyle.colors.success,
                color: isToddlerMode ? '#000' : 'white',
                borderRadius: `${ageStyle.borders.radius}px`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ...(isToddlerMode && {
                  border: '4px solid #FF69B4',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                }),
              }}
            >
              {isToddlerMode ? (
                <Box sx={{ 
                  fontSize: '60px', 
                  lineHeight: 1,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                }}>
                  🌟🎉✨🏆🎊
                </Box>
              ) : (
                <>
                  <Sparkles size={24} />
                  <Typography 
                    variant="h6" 
                    fontWeight={ageStyle.typography.fontWeight}
                    sx={{ fontSize: `${ageStyle.typography.fontSize + 4}px` }}
                  >
                    Perfect! You did it! 🎉
                  </Typography>
                </>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Drop targets section */}
        <Box>
          {isToddlerMode ? (
            <motion.div
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              style={{
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <Box sx={{ fontSize: '80px', lineHeight: 1 }}>
                ⬇️⬇️⬇️
              </Box>
            </motion.div>
          ) : (
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
          )}
          <Box sx={{ display: 'flex', ...getLayoutStyles() }}>
            {targets.map(renderDropTarget)}
          </Box>
        </Box>

        {/* Draggable items section */}
        {availableItems.length > 0 && (
          <Box>
            {isToddlerMode ? (
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                }}
              >
                <Box sx={{ fontSize: '80px', lineHeight: 1 }}>
                  ⬆️⬆️⬆️
                </Box>
              </motion.div>
            ) : (
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
            )}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {availableItems.map(renderDraggableItem)}
            </Box>
          </Box>
        )}
      </Box>

      {/* Hint for easy mode */}
      {isEasyMode && availableItems.length > 0 && ageStyle.interaction.showHints && !isToddlerMode && (
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
      
      {/* Encouragement for toddler mode - БЕЗ ТЕКСТУ */}
      {isToddlerMode && availableItems.length > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          <Box sx={{ fontSize: '60px', lineHeight: 1 }}>
            💪✨🎉
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default SimpleDragAndDrop;

