'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToddlerDragDrop } from '../shared/ToddlerDragDrop';
import { AgeSpecificProps } from '../shared/SharedTypes';
import { ToddlerComponents } from '@/types/age-group-data';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface MagneticPlaygroundProps {
  data: ToddlerComponents.MagneticPlaygroundData;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: (results: any) => void;
}

interface PlacedItem {
  itemId: string;
  targetId: string;
  isCorrect: boolean;
  placedAt: number;
}

const MagneticPlayground: React.FC<MagneticPlaygroundProps> = ({
  data,
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animalHelperMessage, setAnimalHelperMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const celebrationShownRef = useRef(false); // Track if celebration was already shown

  // Get available (not placed) items
  const availableItems = data.items.filter(item => 
    !placedItems.some(placed => placed.itemId === item.id)
  );

  // Check if all items are correctly placed
  const allCorrect = data.items.length > 0 && 
    placedItems.length === data.items.length && 
    placedItems.every(placed => placed.isCorrect);

  // Animal helper messages
  const getAnimalHelperMessage = (success: boolean, itemLabel?: string) => {
    const messages = {
      bunny: {
        success: [
          `Great job! 🐰 The ${itemLabel} is happy now!`,
          `Yay! 🐰 You did it perfectly!`,
          `Wonderful! 🐰 That's exactly right!`,
        ],
        encourage: [
          `Try again! 🐰 I believe in you!`,
          `Almost there! 🐰 You're doing great!`,
          `Keep trying! 🐰 You can do it!`,
        ],
        start: [
          `Hi there! 🐰 Let's play together!`,
          `I'm here to help! 🐰 Drag the items to their homes!`,
          `This will be fun! 🐰 I'll cheer you on!`,
        ],
      },
      cat: {
        success: [
          `Purr-fect! 🐱 The ${itemLabel} is in the right place!`,
          `Meow-velous! 🐱 You're so smart!`,
          `Fantastic! 🐱 That makes me purr with joy!`,
        ],
        encourage: [
          `Don't give up! 🐱 Try a different spot!`,
          `Meow! 🐱 You're getting closer!`,
          `Keep going! 🐱 I know you can do it!`,
        ],
        start: [
          `Hello! 🐱 Ready to play with me?`,
          `Meow! 🐱 Let's match things together!`,
          `I'm excited! 🐱 This will be paw-some!`,
        ],
      },
      dog: {
        success: [
          `Woof! 🐕 Good job with the ${itemLabel}!`,
          `Excellent! 🐕 You make me wag my tail!`,
          `Amazing! 🐕 That's my favorite human!`,
        ],
        encourage: [
          `Woof! 🐕 Try again, you're learning!`,
          `Don't worry! 🐕 Even I make mistakes!`,
          `Keep trying! 🐕 You're my best friend!`,
        ],
        start: [
          `Woof woof! 🐕 Let's play together!`,
          `Hi buddy! 🐕 I'll help you match everything!`,
          `This is exciting! 🐕 Let's have fun!`,
        ],
      },
      bear: {
        success: [
          `Bear-illiant! 🐻 The ${itemLabel} is perfect there!`,
          `Roar-some! 🐻 You're incredibly smart!`,
          `Wonderful! 🐻 That makes me so happy!`,
        ],
        encourage: [
          `Bear with me! 🐻 Try once more!`,
          `You're doing great! 🐻 Keep going!`,
          `Almost there! 🐻 I believe in you!`,
        ],
        start: [
          `Hello little one! 🐻 Ready for an adventure?`,
          `Grr-eat! 🐻 Let's match things together!`,
          `I'm so excited! 🐻 This will be bear-y fun!`,
        ],
      },
    };

    const animalMessages = messages[data.animalHelper] || messages.bunny;
    const messageType = success ? 'success' : 'encourage';
    const messageArray = animalMessages[messageType];
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };

  // Show initial animal helper message
  useEffect(() => {
    const messages = {
      bunny: `Hi there! 🐰 Let's play together!`,
      cat: `Hello! 🐱 Ready to play with me?`,
      dog: `Woof woof! 🐕 Let's play together!`,
      bear: `Hello little one! 🐻 Ready for an adventure?`,
    };
    
    setAnimalHelperMessage(messages[data.animalHelper] || messages.bunny);
    
    // Clear message after 3 seconds
    const timer = setTimeout(() => setAnimalHelperMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [data.animalHelper]);

  // Reset celebration state when data changes (user edited items/targets)
  useEffect(() => {
    celebrationShownRef.current = false;
    setShowCelebration(false);
  }, [data.items, data.targets]);

  // Find closest target and calculate distance
  const findClosestTarget = (absolutePosition: { x: number; y: number }) => {
    if (!containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Convert absolute position to relative position within container
    const relativeX = absolutePosition.x - containerRect.left;
    const relativeY = absolutePosition.y - containerRect.top;
    
    let closestTarget: string | null = null;
    let minDistance = Infinity;

    // Check distance to all targets
    targetRefs.current.forEach((targetEl, targetId) => {
      const targetRect = targetEl.getBoundingClientRect();
      const targetCenterX = targetRect.left - containerRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top - containerRect.top + targetRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(relativeX - targetCenterX, 2) + 
        Math.pow(relativeY - targetCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = targetId;
      }
    });

    return { closestTarget, minDistance };
  };

  // Handle item placement
  const placeItem = (itemId: string, targetId: string, position: { x: number; y: number }) => {
    const item = data.items.find(i => i.id === itemId);
    if (!item) return;

    const isCorrect = item.correctTarget === targetId;
    
    // Place the item - allow multiple items on same target
    // Only remove this item from its previous position
    setPlacedItems(prev => [
      ...prev.filter(p => p.itemId !== itemId),
      { 
        itemId, 
        targetId, 
        isCorrect,
        placedAt: Date.now()
      }
    ]);

    // Feedback
    if (isCorrect) {
      soundService.playCorrect();
      triggerHaptic('success');
      setAnimalHelperMessage(getAnimalHelperMessage(true, item.label));
      
      // Mini celebration - fire from center with spread
      // Use a global canvas to avoid being constrained by parent container
      const myConfetti = confetti.create(undefined, { 
        resize: true,
        useWorker: true 
      });
      
      myConfetti({
        particleCount: 50,
        spread: 70,
        origin: { 
          x: 0.5,  // Center horizontally
          y: 0.5   // Center vertically
        },
        colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'],
        startVelocity: 30,
        gravity: 1,
        ticks: 100,
      });
    } else {
      soundService.playError();
      triggerHaptic('error');
      setAnimalHelperMessage(getAnimalHelperMessage(false, item.label));
    }

    // Clear message after 2 seconds
    setTimeout(() => setAnimalHelperMessage(''), 2000);
  };

  // Handle drag end - place item if close enough to target
  const handleDragEnd = (itemId: string, position: { x: number; y: number }) => {
    const result = findClosestTarget(position);
    if (!result) {
      console.log('❌ Container ref not found');
      return;
    }

    const { closestTarget, minDistance } = result;
    
    // Use default magnetic strength if not set
    const magneticStrength = data.magneticStrength || 100;

    console.log('🧲 Drag end:', { 
      itemId, 
      closestTarget, 
      minDistance: Math.round(minDistance), 
      magneticStrength,
      willSnap: minDistance < magneticStrength 
    });

    // Magnetic attraction - snap to target if close enough
    if (closestTarget && minDistance < magneticStrength) {
      console.log('✅ Placing item on target');
      placeItem(itemId, closestTarget, position);
    } else {
      console.log(`❌ Too far from target (${Math.round(minDistance)}px > ${magneticStrength}px)`);
    }
  };

  // Handle completion celebration
  useEffect(() => {
    // Only show celebration once when all items are correctly placed
    if (allCorrect && placedItems.length > 0 && !celebrationShownRef.current) {
      celebrationShownRef.current = true; // Mark as shown
      setShowCelebration(true);
      
      console.log('🎉 Game completed! Showing celebration...');
      
      // Major celebration - multiple bursts!
      // Create a global confetti instance to avoid being constrained by parent container
      const myConfetti = confetti.create(undefined, { 
        resize: true,
        useWorker: true 
      });
      
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 10000,
        colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD']
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Fire from left
        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: 0.2, y: 0.6 }
        });
        
        // Fire from right
        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: 0.8, y: 0.6 }
        });
      }, 250);

      soundService.playSuccess();
      triggerHaptic('success');

      // Final animal message
      const finalMessages = {
        bunny: `Amazing! 🐰 You completed everything! You're the best!`,
        cat: `Purr-fect! 🐱 All done! You're incredible!`,
        dog: `Woof! 🐕 Fantastic job! You're my hero!`,
        bear: `Bear-illiant! 🐻 You did it all! I'm so proud!`,
      };
      
      setAnimalHelperMessage(finalMessages[data.animalHelper] || finalMessages.bunny);

      // Auto-hide celebration after 4 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 4000);

      if (onComplete) {
        onComplete({
          completed: true,
          correctCount: placedItems.filter(p => p.isCorrect).length,
          totalCount: data.items.length,
          timeSpent: Math.max(...placedItems.map(p => p.placedAt)) - Math.min(...placedItems.map(p => p.placedAt)),
        });
      }

      return () => clearTimeout(timer);
    }
  }, [allCorrect, placedItems, data.animalHelper, onComplete]);

  const renderDraggableItem = (item: ToddlerComponents.ToddlerDragItem) => {
    const isPlaced = placedItems.some(p => p.itemId === item.id);
    if (isPlaced) return null;

    return (
      <motion.div
        key={item.id}
        drag
        dragMomentum={false}
        dragElastic={0.2}
        onDragEnd={(_, info) => handleDragEnd(item.id, info.point)}
        dragSnapToOrigin={false}
        whileDrag={{ 
          scale: 1.2, 
          zIndex: 100,
          rotate: 5,
        }}
        whileHover={{ 
          scale: 1.1,
          y: -5,
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: item.size === 'extra-large' ? 140 : 120,
            height: item.size === 'extra-large' ? 140 : 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: '#FFE5F1',
            border: '4px solid #FF6B9D',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: 'radial-gradient(circle, rgba(255,107,157,0.3) 0%, transparent 70%)',
              animation: 'pulse 2s infinite',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.7 },
              '50%': { transform: 'scale(1.1)', opacity: 1 },
              '100%': { transform: 'scale(1)', opacity: 0.7 },
            },
          }}
        >
          {/* Sparkle decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#FFD700',
            }}
          >
            <Sparkles size={20} />
          </Box>

          {/* Item image */}
          {item.imageUrl ? (
            <Box
              component="img"
              src={item.imageUrl}
              alt={item.label || 'Drag item'}
              sx={{
                width: '80%',
                height: '70%',
                objectFit: 'contain',
                pointerEvents: 'none',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '80%',
                height: '70%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF1493',
                fontSize: '3rem',
              }}
            >
              ❓
            </Box>
          )}

          {/* Item label */}
          {item.label && (
            <Typography 
              variant="h6" 
              sx={{ 
                mt: 1,
                fontWeight: 800,
                textAlign: 'center',
                fontSize: '18px',
                color: '#FF1493',
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                lineHeight: 1,
              }}
            >
              {item.label}
            </Typography>
          )}
        </Paper>
      </motion.div>
    );
  };

  const renderDropTarget = (target: ToddlerComponents.ToddlerDropTarget) => {
    // Get all items placed on this target
    const placedItemsOnTarget = placedItems.filter(p => p.targetId === target.id);
    const hasItems = placedItemsOnTarget.length > 0;
    const allCorrectOnTarget = hasItems && placedItemsOnTarget.every(p => p.isCorrect);
    
    return (
      <Box
        key={target.id}
        ref={(el) => {
          if (el) targetRefs.current.set(target.id, el);
        }}
        sx={{ position: 'relative' }}
      >
        {/* Magnetic field visualization */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: -target.magneticZone / 2,
            left: -target.magneticZone / 2,
            width: (target.size === 'extra-large' ? 160 : 140) + target.magneticZone,
            height: (target.size === 'extra-large' ? 160 : 140) + target.magneticZone,
            borderRadius: '50%',
            border: '3px dashed #FFD700',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Paper
          elevation={4}
          sx={{
            width: target.size === 'extra-large' ? 160 : 140,
            height: target.size === 'extra-large' ? 160 : 140,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: target.backgroundColor || '#FFF9E6',
            border: '4px solid',
            borderColor: allCorrectOnTarget ? '#4CAF50' : '#FEC84E',
            borderRadius: '32px',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease',
            ...(allCorrectOnTarget && {
              boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
              transform: 'scale(1.05)',
            }),
          }}
        >
          {/* Target background image */}
          {target.imageUrl && !hasItems && (
            <Box
              component="img"
              src={target.imageUrl}
              alt={target.label}
              sx={{
                width: '90%',
                height: '80%',
                objectFit: 'contain',
                opacity: 0.3,
                position: 'absolute',
              }}
            />
          )}

          {/* Placed items - show all items on this target */}
          {hasItems && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                p: 1,
              }}
            >
              {placedItemsOnTarget.map((placedItem, index) => {
                const placedItemData = data.items.find(i => i.id === placedItem.itemId);
                const itemImageUrl = placedItemData?.imageUrl;
                
                return (
                  <motion.div
                    key={placedItem.itemId}
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20,
                      duration: 0.6,
                      delay: index * 0.1,
                    }}
                    style={{
                      flex: placedItemsOnTarget.length === 1 ? '1 1 100%' : '0 0 45%',
                      maxWidth: placedItemsOnTarget.length === 1 ? '100%' : '45%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {itemImageUrl ? (
                      <Box
                        component="img"
                        src={itemImageUrl}
                        alt={placedItemData?.label || 'Placed item'}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4CAF50',
                          fontSize: '2rem',
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </motion.div>
                );
              })}
            </Box>
          )}

          {/* Success indicator - show count badge */}
          {allCorrectOnTarget && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 15,
                delay: 0.3,
              }}
              style={{
                position: 'absolute',
                top: -15,
                right: -15,
                background: '#4CAF50',
                borderRadius: '50%',
                padding: '8px',
                boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                minWidth: placedItemsOnTarget.length > 1 ? '40px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {placedItemsOnTarget.length > 1 ? (
                <Typography 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 800, 
                    fontSize: '18px',
                  }}
                >
                  {placedItemsOnTarget.length}
                </Typography>
              ) : (
                <Heart size={24} color="white" fill="white" />
              )}
            </motion.div>
          )}

          {/* Target label */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              bottom: 8,
              fontWeight: 800,
              color: allCorrectOnTarget ? '#4CAF50' : '#F57C00',
              textAlign: 'center',
              fontSize: '16px',
              textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
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
    <ToddlerDragDrop
      data={data}
      isSelected={isSelected}
      onEdit={onEdit}
      onFocus={onFocus}
      onComplete={onComplete}
    >
      <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
        {/* Animal helper message */}
        <AnimatePresence>
          {animalHelperMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: '#FFE5F1',
                  border: '3px solid #FF6B9D',
                  borderRadius: '24px',
                  maxWidth: '400px',
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    fontSize: '20px',
                    color: '#FF1493',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {animalHelperMessage}
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success celebration */}
        <AnimatePresence>
          {showCelebration && allCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
              }}
            >
              <Paper
                elevation={12}
                sx={{
                  px: 6,
                  py: 4,
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 50%, #00CED1 100%)',
                  borderRadius: '32px',
                  textAlign: 'center',
                  border: '4px solid white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                    >
                      <Star size={40} color="white" fill="white" />
                    </motion.div>
                  ))}
                </Box>
                
                <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 2 }}>
                  🎉 Amazing! 🎉
                </Typography>
                
                <Typography variant="h5" color="white" fontWeight={600}>
                  You did it perfectly!
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop targets section */}
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 800, 
              color: '#FF1493',
              textAlign: 'center',
              fontSize: '32px',
              textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
            }}
          >
            🎯 Drop Here:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 4, 
            justifyContent: 'center',
          }}>
            {data.targets?.map(renderDropTarget)}
          </Box>
        </Box>

        {/* Draggable items section */}
        {availableItems.length > 0 && (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 800, 
                color: '#FF1493',
                textAlign: 'center',
                fontSize: '32px',
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
              }}
            >
              🎈 Drag These:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {availableItems.map(renderDraggableItem)}
            </Box>
          </Box>
        )}
      </Box>
    </ToddlerDragDrop>
  );
};

export default MagneticPlayground;
