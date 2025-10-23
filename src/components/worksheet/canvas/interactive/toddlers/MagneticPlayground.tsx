'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BaseDragDrop } from '../shared/BaseDragDrop';
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

  // Handle magnetic attraction and placement
  const handleItemDrag = (itemId: string, position: { x: number; y: number }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let closestTarget: string | null = null;
    let minDistance = Infinity;

    // Check distance to all targets
    targetRefs.current.forEach((targetEl, targetId) => {
      const targetRect = targetEl.getBoundingClientRect();
      const targetCenterX = targetRect.left - containerRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top - containerRect.top + targetRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(position.x - targetCenterX, 2) + 
        Math.pow(position.y - targetCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = targetId;
      }
    });

    // Magnetic attraction
    if (closestTarget && minDistance < data.magneticStrength) {
      const item = data.items.find(i => i.id === itemId);
      if (!item) return;

      const isCorrect = item.correctTarget === closestTarget;
      
      // Place the item
      setPlacedItems(prev => [
        ...prev.filter(p => p.itemId !== itemId && p.targetId !== closestTarget),
        { 
          itemId, 
          targetId: closestTarget!, 
          isCorrect,
          placedAt: Date.now()
        }
      ]);

      // Feedback
      if (isCorrect) {
        soundService.playCorrect();
        triggerHaptic('success');
        setAnimalHelperMessage(getAnimalHelperMessage(true, item.label));
        
        // Mini celebration
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { 
            x: position.x / window.innerWidth,
            y: position.y / window.innerHeight 
          },
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'],
        });
      } else {
        soundService.playError();
        triggerHaptic('error');
        setAnimalHelperMessage(getAnimalHelperMessage(false, item.label));
      }

      // Clear message after 2 seconds
      setTimeout(() => setAnimalHelperMessage(''), 2000);
    }
  };

  // Handle completion celebration
  useEffect(() => {
    if (allCorrect && placedItems.length > 0) {
      setShowCelebration(true);
      
      // Major celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'],
      });

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

      if (onComplete) {
        onComplete({
          completed: true,
          correctCount: placedItems.filter(p => p.isCorrect).length,
          totalCount: data.items.length,
          timeSpent: Math.max(...placedItems.map(p => p.placedAt)) - Math.min(...placedItems.map(p => p.placedAt)),
        });
      }
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
        onDrag={(_, info) => handleItemDrag(item.id, info.point)}
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
    const placedItem = placedItems.find(p => p.targetId === target.id);
    const isCompleted = placedItem?.isCorrect;
    
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
            borderColor: isCompleted ? '#4CAF50' : '#FEC84E',
            borderRadius: '32px',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease',
            ...(isCompleted && {
              boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
              transform: 'scale(1.05)',
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
                width: '90%',
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
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20,
                duration: 0.6,
              }}
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
                src={data.items.find(i => i.id === placedItem.itemId)?.imageUrl}
                alt="Placed item"
                sx={{
                  width: '85%',
                  height: '85%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                }}
              />
            </motion.div>
          )}

          {/* Success indicator */}
          {isCompleted && (
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
              }}
            >
              <Heart size={24} color="white" fill="white" />
            </motion.div>
          )}

          {/* Target label */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              bottom: 8,
              fontWeight: 800,
              color: isCompleted ? '#4CAF50' : '#F57C00',
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
    <BaseDragDrop
      data={data}
      ageGroup="3-5"
      isSelected={isSelected}
      onEdit={onEdit}
      onFocus={onFocus}
      onComplete={onComplete}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 300,
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
    </BaseDragDrop>
  );
};

export default MagneticPlayground;
