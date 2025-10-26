'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface CountingObject {
  imageUrl: string;
  count: number; // Target count (1-3 for toddlers, 1-10 for older)
}

interface SimpleCounterProps {
  objects: CountingObject[];
  voiceEnabled?: boolean;
  celebrationAtEnd?: boolean;
  showProgress?: boolean;
  theme?: ThemeName;
  ageGroup?: string;
  ageStyle?: 'toddler' | 'preschool' | 'elementary'; // New prop for age-specific styling
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const SimpleCounter: React.FC<SimpleCounterProps> = ({
  objects = [],
  voiceEnabled = true,
  celebrationAtEnd = true,
  showProgress = true,
  theme: themeName,
  ageStyle = 'preschool',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const componentTheme = useComponentTheme(themeName);
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [tappedCount, setTappedCount] = useState(0);
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentObject = objects[currentObjectIndex];
  const targetCount = currentObject?.count || 0;
  const progress = targetCount > 0 ? (tappedCount / targetCount) * 100 : 0;
  const isToddlerMode = ageStyle === 'toddler';

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
        maxWidth: 1000,
        mx: 'auto',
        minHeight: isToddlerMode ? 550 : 400,
        p: isToddlerMode ? 5 : 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: isToddlerMode ? 4 : 2,
        background: isToddlerMode
          ? 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)'
          : 'linear-gradient(135deg, #FAFAFA 0%, #F0F4F8 100%)',
        cursor: onFocus ? 'pointer' : 'default',
        overflow: 'hidden',
        
        // Pattern overlay for toddler mode
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
      {/* Decorative background elements for toddler mode */}
      {isToddlerMode && (
        <>
          <motion.div
            animate={{
              x: [0, 20, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
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

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
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

          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
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

          <motion.div
            animate={{
              x: [0, -15, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
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

      {/* Header with instruction and reset */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box>
          {/* Toddler mode - big emoji instruction */}
          {isToddlerMode ? (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: 80,
                    fontWeight: 800,
                    fontFamily: "'Comic Sans MS', cursive",
                    lineHeight: 1,
                  }}
                >
                  {isCompleted ? '🎉' : `${tappedCount || ''}`}
                </Typography>
                {!isCompleted && (
                  <Typography
                    sx={{
                      fontSize: 48,
                      fontWeight: 800,
                      fontFamily: "'Comic Sans MS', cursive",
                    }}
                  >
                    👆
                  </Typography>
                )}
              </Box>
            </motion.div>
          ) : (
            <>
              <Typography variant="h5" fontWeight={700} color="primary">
                {isCompleted ? '🎉 All Done!' : `Count to ${targetCount}!`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isCompleted 
                  ? 'You counted everything!' 
                  : 'Tap each item to count'}
              </Typography>
            </>
          )}
        </Box>

        {/* Reset button */}
        {(isCompleted || tappedCount > 0) && (
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={28} />
          </IconButton>
        )}
      </Box>

      {/* Progress bar */}
      {showProgress && !isCompleted && !isToddlerMode && (
        <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
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
      
      {/* Stars progress for toddler mode */}
      {showProgress && !isCompleted && isToddlerMode && (
        <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {Array.from({ length: targetCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: index < tappedCount ? 1 : 0.5,
                  opacity: index < tappedCount ? 1 : 0.3,
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  bounce: 0.5,
                }}
              >
                <Box
                  sx={{
                    fontSize: index < tappedCount ? 60 : 40,
                    filter: index < tappedCount ? 'none' : 'grayscale(100%)',
                  }}
                >
                  ⭐
                </Box>
              </motion.div>
            ))}
          </Box>
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
          gap: isToddlerMode ? 4 : 2,
          justifyContent: 'center',
          maxWidth: isToddlerMode ? 700 : 600,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence>
          {Array.from({ length: targetCount }).map((_, index) => {
            const isTapped = tappedItems.has(index);
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 1, opacity: 1 }}
                // Idle animation for toddler - jump/bounce
                animate={!isTapped && isToddlerMode ? { 
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1],
                } : isTapped ? {
                  scale: 0,
                  opacity: 0,
                  rotate: 360,
                } : {
                  scale: 1,
                  opacity: 1,
                }}
                transition={!isTapped && isToddlerMode ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.15,
                } : {
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                exit={{ scale: 0, opacity: 0, rotate: 360 }}
                whileHover={{ scale: isTapped ? 0 : (isToddlerMode ? 1.2 : 1.1) }}
                whileTap={{ scale: isTapped ? 0 : 0.85, rotate: -10 }}
                onClick={() => handleItemTap(index)}
                style={{
                  cursor: isTapped ? 'default' : 'pointer',
                }}
              >
                <Paper
                  elevation={isTapped ? 0 : (isToddlerMode ? 8 : 4)}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isTapped ? 'transparent' : 'white',
                    borderRadius: isToddlerMode ? 32 : 3,
                    border: isToddlerMode ? '6px solid' : '3px solid',
                    borderColor: isTapped ? 'transparent' : (isToddlerMode ? '#FF6B9D' : 'primary.main'),
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isToddlerMode && !isTapped
                      ? '0 12px 24px rgba(255, 182, 193, 0.3), 0 4px 8px rgba(255, 215, 0, 0.2)'
                      : undefined,
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

      {/* Current count display (big number with emoji for toddler) */}
      {!isCompleted && tappedCount > 0 && !isToddlerMode && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Box
            sx={{
              mt: 4,
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
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
      
      {/* Big emoji numbers for toddler mode */}
      {!isCompleted && tappedCount > 0 && isToddlerMode && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            y: [0, -10, 0],
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            y: {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          }}
        >
          <Box
            sx={{
              mt: 4,
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '150px',
                fontWeight: 800,
                fontFamily: "'Comic Sans MS', cursive",
                lineHeight: 1,
              }}
            >
              {['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][tappedCount] || `${tappedCount}️⃣`}
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Success celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                px: isToddlerMode ? 8 : 6,
                py: isToddlerMode ? 6 : 4,
                background: isToddlerMode
                  ? 'linear-gradient(135deg, #FFD93D 0%, #FF6B9D 50%, #4DABF7 100%)'
                  : 'linear-gradient(135deg, #51CF66 0%, #4ECDC4 100%)',
                color: 'white',
                borderRadius: isToddlerMode ? 6 : 4,
                border: isToddlerMode ? '6px solid #FFFFFF' : 'none',
                boxShadow: '0 20px 60px rgba(255, 107, 157, 0.6)',
                textAlign: 'center',
              }}
            >
              {isToddlerMode ? (
                <>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                    }}
                  >
                    <Box sx={{ fontSize: 120, lineHeight: 1 }}>
                      🎉
                    </Box>
                  </motion.div>
                  <Typography
                    variant="h2"
                    sx={{
                      mt: 2,
                      fontWeight: 800,
                      fontFamily: "'Comic Sans MS', cursive",
                      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    WOW! 🌟
                  </Typography>
                </>
              ) : (
                <>
                  <Sparkles size={64} />
                  <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                    Fantastic!
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    You can count! 🎉
                  </Typography>
                </>
              )}
              <Box sx={{ display: 'flex', gap: isToddlerMode ? 2 : 1, justifyContent: 'center', mt: 3 }}>
                {Array.from({ length: Math.min(5, objects.reduce((sum, obj) => sum + obj.count, 0)) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <Star size={isToddlerMode ? 48 : 32} fill="#FCD34D" color="#FCD34D" />
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && tappedCount === 0 && !isToddlerMode && (
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
              position: 'relative',
              zIndex: 1,
            }}
          >
            💡 Tap each item to count them one by one
          </Typography>
        </motion.div>
      )}
      
      {/* Encouragement for toddler mode - emoji only */}
      {!isCompleted && isToddlerMode && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
          }}
          style={{
            marginTop: '24px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
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

export default SimpleCounter;

