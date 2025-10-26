'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, Sparkles, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';
import { useComponentTheme } from '@/hooks/useComponentTheme';
import { ThemeName } from '@/types/themes';

interface ColorOption {
  name: string;
  hex: string;
  voicePrompt?: string;
}

interface ColorMatcherProps {
  colors: ColorOption[];
  mode?: 'single' | 'multiple';
  showNames?: boolean;
  autoVoice?: boolean; // Automatically speak color name
  theme?: ThemeName;
  ageGroup?: string;
  ageStyle?: 'toddler' | 'preschool' | 'elementary'; // New prop for age-specific styling
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const ColorMatcher: React.FC<ColorMatcherProps> = ({
  colors = [],
  mode = 'single',
  showNames = true,
  autoVoice = true,
  theme: themeName,
  ageStyle = 'preschool',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const componentTheme = useComponentTheme(themeName);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isSingleMode = mode === 'single';
  const currentColor = isSingleMode ? colors[currentColorIndex] : null;
  const isToddlerMode = ageStyle === 'toddler';

  // Check if all colors are selected in multiple mode
  useEffect(() => {
    if (!isSingleMode && selectedColors.size === colors.length && colors.length > 0) {
      setIsCompleted(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      soundService.playSuccess();
      triggerHaptic('success');
    }
  }, [selectedColors.size, colors.length, isSingleMode]);

  // Auto-play voice prompt when color changes (single mode)
  useEffect(() => {
    if (isSingleMode && autoVoice && currentColor && !isCompleted) {
      const timer = setTimeout(() => {
        const prompt = currentColor.voicePrompt || `Find ${currentColor.name}`;
        soundService.speak(prompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentColorIndex, isSingleMode, autoVoice, currentColor, isCompleted]);

  const handleColorClick = (index: number, color: ColorOption) => {
    triggerHaptic('light');

    if (isSingleMode) {
      // Single mode: check if selected color matches current target
      if (index === currentColorIndex) {
        // Correct!
        soundService.playCorrect();
        triggerHaptic('success');
        
        // Mini confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { 
            x: 0.5,
            y: 0.5 
          },
        });

        // Move to next color or complete
        if (currentColorIndex < colors.length - 1) {
          setTimeout(() => {
            setCurrentColorIndex(prev => prev + 1);
          }, 1500);
        } else {
          // All colors done!
          setTimeout(() => {
            setIsCompleted(true);
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
            });
            soundService.playSuccess();
          }, 1000);
        }
      } else {
        // Wrong color
        soundService.playError();
        triggerHaptic('error');
      }
    } else {
      // Multiple mode: select any color
      if (!selectedColors.has(index)) {
        setSelectedColors(prev => new Set([...prev, index]));
        soundService.playCorrect();
        soundService.speak(color.name);
        triggerHaptic('success');
        
        // Mini confetti
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { 
            x: 0.5,
            y: 0.5 
          },
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentColorIndex(0);
    setSelectedColors(new Set());
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const handleVoiceRepeat = () => {
    if (currentColor) {
      const prompt = currentColor.voicePrompt || `Find ${currentColor.name}`;
      soundService.speak(prompt);
      triggerHaptic('light');
    }
  };

  const renderColorCircle = (color: ColorOption, index: number) => {
    const isTargetInSingleMode = isSingleMode && index === currentColorIndex;
    const isSelectedInMultipleMode = selectedColors.has(index);
    const isHovered = hoveredIndex === index;
    const shouldGlow = (isSingleMode && isTargetInSingleMode) || isHovered;
    
    const circleSize = isToddlerMode ? 200 : 150;

    return (
      <Box
        key={index}
        sx={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Glow effect */}
        <AnimatePresence>
          {shouldGlow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: -16,
                left: -16,
                right: -16,
                bottom: -16,
                background: `radial-gradient(circle, ${color.hex}, transparent)`,
                borderRadius: '50%',
                filter: 'blur(20px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Color circle */}
        <motion.div
          // Idle animation for toddler mode - attract attention!
          animate={isToddlerMode && !isSelectedInMultipleMode ? {
            scale: [1, 1.1, 1],
            y: [0, -8, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2, // Stagger animations
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
          onClick={() => handleColorClick(index, color)}
          style={{
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Paper
            elevation={isHovered ? 8 : 4}
            sx={{
              width: circleSize,
              height: circleSize,
              borderRadius: '50%',
              backgroundColor: color.hex,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isToddlerMode ? '8px solid' : '6px solid',
              borderColor: isTargetInSingleMode 
                ? '#FFD93D'
                : isSelectedInMultipleMode 
                ? '#51CF66'
                : 'white',
              boxShadow: isToddlerMode
                ? `0 12px 24px ${color.hex}66, 0 4px 8px rgba(255, 215, 0, 0.3)`
                : shouldGlow 
                ? `0 0 30px ${color.hex}` 
                : undefined,
              transition: 'all 0.3s',
              position: 'relative',
            }}
          >
            {/* Checkmark for selected colors */}
            {isSelectedInMultipleMode && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Star size={isToddlerMode ? 80 : 60} fill="white" color="white" />
              </motion.div>
            )}
          </Paper>

          {/* Color name */}
          {showNames && !isToddlerMode && (
            <Typography
              variant="h6"
              sx={{
                mt: 1,
                textAlign: 'center',
                fontWeight: 700,
                color: 'text.primary',
                textTransform: 'capitalize',
              }}
            >
              {color.name}
            </Typography>
          )}
          
          {/* Large emoji label for toddler mode */}
          {showNames && isToddlerMode && (
            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif",
                color: color.hex,
                textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8)',
              }}
            >
              {color.name}
            </Typography>
          )}
        </motion.div>
      </Box>
    );
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1000,
        mx: 'auto',
        minHeight: isToddlerMode ? 550 : 350,
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

      {/* Instruction header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toddler mode - emoji instructions instead of text */}
          {isToddlerMode && isSingleMode && currentColor && !isCompleted && (
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
                    fontSize: 48,
                    fontWeight: 800,
                    fontFamily: "'Comic Sans MS', cursive",
                  }}
                >
                  👆
                </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: currentColor.hex,
                    border: '6px solid #FFD93D',
                    boxShadow: `0 8px 16px ${currentColor.hex}66`,
                  }}
                />
              </Box>
            </motion.div>
          )}

          {/* Toddler mode - multiple colors */}
          {isToddlerMode && !isSingleMode && !isCompleted && (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Typography
                sx={{
                  fontSize: 60,
                  fontWeight: 800,
                  fontFamily: "'Comic Sans MS', cursive",
                }}
              >
                👆🎨✨
              </Typography>
            </motion.div>
          )}

          {/* Regular mode instructions */}
          {!isToddlerMode && isSingleMode && currentColor && !isCompleted && (
            <>
              <Typography variant="h5" fontWeight={700} color="primary">
                Find: {currentColor.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleVoiceRepeat}
                sx={{ ml: 1 }}
              >
                <Volume2 size={24} />
              </IconButton>
            </>
          )}
          {!isToddlerMode && !isSingleMode && !isCompleted && (
            <Typography variant="h5" fontWeight={700} color="primary">
              Tap each color!
            </Typography>
          )}
        </Box>

        {/* Reset button */}
        {(isCompleted || selectedColors.size > 0 || currentColorIndex > 0) && (
          <IconButton onClick={handleReset} color="primary">
            <RotateCcw size={24} />
          </IconButton>
        )}
      </Box>

      {/* Colors grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isToddlerMode ? 6 : 4,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: isToddlerMode ? 300 : 200,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {colors.map((color, index) => renderColorCircle(color, index))}
      </Box>

      {/* Progress indicator (single mode) */}
      {isSingleMode && !isCompleted && (
        <Box sx={{ mt: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Stars for toddler mode */}
          {isToddlerMode ? (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              {colors.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: index < currentColorIndex ? 1 : 0.5,
                    opacity: index < currentColorIndex ? 1 : 0.3,
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: 'spring',
                    bounce: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: index < currentColorIndex ? 60 : 40,
                      filter: index < currentColorIndex ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    ⭐
                  </Box>
                </motion.div>
              ))}
            </Box>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary">
                Color {currentColorIndex + 1} of {colors.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                {colors.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index < currentColorIndex 
                        ? 'success.main' 
                        : index === currentColorIndex 
                        ? 'warning.main' 
                        : 'grey.300',
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Success message */}
      <AnimatePresence>
        {isCompleted && (
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
              elevation={8}
              sx={{
                px: isToddlerMode ? 6 : 5,
                py: isToddlerMode ? 5 : 3,
                background: isToddlerMode
                  ? 'linear-gradient(135deg, #FFD93D 0%, #FF6B9D 50%, #4DABF7 100%)'
                  : 'linear-gradient(135deg, #51CF66 0%, #4ECDC4 100%)',
                color: 'white',
                borderRadius: isToddlerMode ? 6 : 3,
                border: '6px solid #FFFFFF',
                boxShadow: '0 20px 60px rgba(255, 107, 157, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isToddlerMode ? 2 : 1,
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
                      🎨
                    </Box>
                  </motion.div>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      fontFamily: "'Comic Sans MS', cursive",
                      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    WOW! 🎉
                  </Typography>
                </>
              ) : (
                <>
                  <Sparkles size={48} />
                  <Typography variant="h4" fontWeight={700}>
                    Amazing! 🎨
                  </Typography>
                  <Typography variant="body1">
                    You know all the colors!
                  </Typography>
                </>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && !isToddlerMode && (
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
            {isSingleMode 
              ? '💡 Tap the color that matches!' 
              : '💡 Tap all the colors to hear their names'}
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

export default ColorMatcher;

