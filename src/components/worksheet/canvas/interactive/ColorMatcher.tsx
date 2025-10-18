'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, Sparkles, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

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
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const ColorMatcher: React.FC<ColorMatcherProps> = ({
  colors = [],
  mode = 'single',
  showNames = true,
  autoVoice = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isSingleMode = mode === 'single';
  const currentColor = isSingleMode ? colors[currentColorIndex] : null;

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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
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
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: color.hex,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '6px solid',
              borderColor: isTargetInSingleMode 
                ? 'warning.main' 
                : isSelectedInMultipleMode 
                ? 'success.main' 
                : 'white',
              boxShadow: shouldGlow 
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
                <Star size={60} fill="white" color="white" />
              </motion.div>
            )}
          </Paper>

          {/* Color name */}
          {showNames && (
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
        minHeight: 350,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Instruction header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSingleMode && currentColor && !isCompleted && (
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
          {!isSingleMode && !isCompleted && (
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
          gap: 4,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        {colors.map((color, index) => renderColorCircle(color, index))}
      </Box>

      {/* Progress indicator (single mode) */}
      {isSingleMode && !isCompleted && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
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
        </Box>
      )}

      {/* Success message */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                px: 5,
                py: 3,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Sparkles size={48} />
              <Typography variant="h4" fontWeight={700}>
                Amazing! 🎨
              </Typography>
              <Typography variant="body1">
                You know all the colors!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && (
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
            {isSingleMode 
              ? '💡 Tap the color that matches!' 
              : '💡 Tap all the colors to hear their names'}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default ColorMatcher;

