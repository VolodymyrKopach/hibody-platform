'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface CountingObject {
  imageUrl: string;
  count: number; // Target count (1-3 for toddlers, 1-10 for older)
}

interface SimpleCounterProps {
  objects: CountingObject[];
  voiceEnabled?: boolean;
  celebrationAtEnd?: boolean;
  showProgress?: boolean;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const SimpleCounter: React.FC<SimpleCounterProps> = ({
  objects = [],
  voiceEnabled = true,
  celebrationAtEnd = true,
  showProgress = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [tappedCount, setTappedCount] = useState(0);
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentObject = objects[currentObjectIndex];
  const targetCount = currentObject?.count || 0;
  const progress = targetCount > 0 ? (tappedCount / targetCount) * 100 : 0;

  // Check if current object counting is complete
  useEffect(() => {
    if (currentObject && tappedCount === targetCount && targetCount > 0) {
      // Current object completed!
      triggerHaptic('success');
      
      // Mini celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Move to next object or complete
      setTimeout(() => {
        if (currentObjectIndex < objects.length - 1) {
          setCurrentObjectIndex(prev => prev + 1);
          setTappedCount(0);
          setTappedItems(new Set());
        } else {
          // All objects counted!
          setIsCompleted(true);
          if (celebrationAtEnd) {
            setShowCelebration(true);
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
            });
            soundService.playSuccess();
          }
        }
      }, 1500);
    }
  }, [tappedCount, targetCount, currentObjectIndex, objects.length, celebrationAtEnd, currentObject]);

  const handleItemTap = (itemIndex: number) => {
    if (tappedItems.has(itemIndex) || isCompleted) return;

    const newCount = tappedCount + 1;
    setTappedCount(newCount);
    setTappedItems(prev => new Set([...prev, itemIndex]));
    
    // Voice feedback
    if (voiceEnabled) {
      const numberWords = [
        'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 
        'Six', 'Seven', 'Eight', 'Nine', 'Ten'
      ];
      const word = numberWords[newCount] || newCount.toString();
      soundService.speak(word);
    }

    // Sound effect
    soundService.playCorrect();
    triggerHaptic('light');
  };

  const handleReset = () => {
    setCurrentObjectIndex(0);
    setTappedCount(0);
    setTappedItems(new Set());
    setIsCompleted(false);
    setShowCelebration(false);
    triggerHaptic('light');
  };

  if (!currentObject) {
    return (
      <Box
        onClick={onFocus}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'grey.400',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">
          No counting objects configured
        </Typography>
      </Box>
    );
  }

  return (
    <Box
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
      {/* Header with instruction and reset */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            {isCompleted ? '🎉 All Done!' : `Count to ${targetCount}!`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? 'You counted everything!' 
              : 'Tap each item to count'}
          </Typography>
        </Box>

        {/* Reset button */}
        {(isCompleted || tappedCount > 0) && (
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={28} />
          </IconButton>
        )}
      </Box>

      {/* Progress bar */}
      {showProgress && !isCompleted && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="primary">
              {tappedCount} / {targetCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Object {currentObjectIndex + 1} of {objects.length}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 12, 
              borderRadius: 2,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: 'linear-gradient(90deg, #10B981, #34D399)',
              }
            }} 
          />
        </Box>
      )}

      {/* Counting items grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: targetCount <= 3 
            ? 'repeat(3, 1fr)' 
            : targetCount <= 6 
            ? 'repeat(3, 1fr)' 
            : 'repeat(5, 1fr)',
          gap: 2,
          justifyContent: 'center',
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <AnimatePresence>
          {Array.from({ length: targetCount }).map((_, index) => {
            const isTapped = tappedItems.has(index);
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ 
                  scale: isTapped ? 0 : 1, 
                  opacity: isTapped ? 0 : 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={{ scale: isTapped ? 0 : 1.1 }}
                whileTap={{ scale: isTapped ? 0 : 0.9 }}
                onClick={() => handleItemTap(index)}
                style={{
                  cursor: isTapped ? 'default' : 'pointer',
                }}
              >
                <Paper
                  elevation={isTapped ? 0 : 4}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isTapped ? 'transparent' : 'white',
                    borderRadius: 3,
                    border: '3px solid',
                    borderColor: isTapped ? 'transparent' : 'primary.main',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {!isTapped && (
                    <>
                      <Box
                        component="img"
                        src={currentObject.imageUrl}
                        alt={`Count item ${index + 1}`}
                        sx={{
                          width: '80%',
                          height: '80%',
                          objectFit: 'contain',
                        }}
                      />
                      
                      {/* Pulsing hint for first item */}
                      {index === 0 && tappedCount === 0 && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '4px solid',
                            borderColor: '#FCD34D',
                            borderRadius: 12,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </>
                  )}
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>

      {/* Current count display (big number) */}
      {!isCompleted && tappedCount > 0 && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Box
            sx={{
              mt: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '120px',
                fontWeight: 800,
                color: 'primary.main',
                textShadow: '4px 4px 0px rgba(0,0,0,0.1)',
              }}
            >
              {tappedCount}
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Success celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
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
                Fantastic!
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                You can count! 🎉
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 3 }}>
                {Array.from({ length: Math.min(5, objects.reduce((sum, obj) => sum + obj.count, 0)) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <Star size={32} fill="#FCD34D" color="#FCD34D" />
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && tappedCount === 0 && (
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
            💡 Tap each item to count them one by one
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SimpleCounter;

