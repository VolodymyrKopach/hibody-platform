/**
 * 🎨 TODDLER UI COMPONENTS EXAMPLES
 * 
 * Ready-to-use components for children 2-5 years old
 * Copy-paste these examples into your code
 */

import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

// ============================================================================
// EXAMPLE 1: Toddler Container (with decorative background)
// ============================================================================

export const ToddlerContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      // Background
      background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)',
      
      // Spacing
      p: 5,
      minHeight: 500,
      
      // Shape
      borderRadius: 4,
      
      // Pattern overlay
      '&::before': {
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
      },
      
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Decorative animated elements */}
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

    {/* Content */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {children}
    </Box>
  </Box>
);

// ============================================================================
// EXAMPLE 2: Big Tap Button (with idle animation)
// ============================================================================

interface BigTapButtonProps {
  emoji: string;
  onTap: () => void;
  idleAnimation?: 'bounce' | 'wiggle' | 'pulse';
}

export const BigTapButton: React.FC<BigTapButtonProps> = ({ 
  emoji, 
  onTap, 
  idleAnimation = 'bounce' 
}) => {
  const animations = {
    bounce: {
      y: [0, -15, 0],
      scale: [1, 1.05, 1],
    },
    wiggle: {
      rotate: [-5, 5, -5, 0],
      scale: [1, 1.05, 1.05, 1],
    },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.9, 1],
    },
  };

  return (
    <motion.div
      animate={animations[idleAnimation]}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileTap={{ scale: 0.9, rotate: -5 }}
    >
      <Button
        onClick={() => {
          // Triple feedback
          soundService.playTap();
          triggerHaptic('light');
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
          });
          onTap();
        }}
        sx={{
          minWidth: 180,
          minHeight: 180,
          fontSize: 100,
          borderRadius: 36,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFE5F1 0%, #FF6B9D 100%)',
          boxShadow: '0 12px 24px rgba(255, 182, 193, 0.4)',
          border: '4px solid #FF6B9D',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB6C1 0%, #FF1493 100%)',
            boxShadow: '0 16px 32px rgba(255, 107, 157, 0.5)',
            border: '6px solid #FF1493',
          },
        }}
      >
        {emoji}
      </Button>
    </motion.div>
  );
};

// ============================================================================
// EXAMPLE 3: Animated Instruction (NO TEXT - only emojis/arrows)
// ============================================================================

interface AnimatedInstructionProps {
  type: 'drop-here' | 'drag-these' | 'you-can-do-it' | 'tap-here';
}

export const AnimatedInstruction: React.FC<AnimatedInstructionProps> = ({ type }) => {
  const instructions = {
    'drop-here': {
      emoji: '⬇️⬇️⬇️',
      animation: { y: [0, -8, 0], scale: [1, 1.1, 1] },
    },
    'drag-these': {
      emoji: '⬆️⬆️⬆️',
      animation: { y: [0, 8, 0], scale: [1, 1.1, 1] },
    },
    'you-can-do-it': {
      emoji: '💪✨🎉',
      animation: { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] },
    },
    'tap-here': {
      emoji: '👆👆👆',
      animation: { scale: [1, 1.3, 1], y: [0, -10, 0] },
    },
  };

  const { emoji, animation } = instructions[type];

  return (
    <motion.div
      animate={animation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}
    >
      <Box sx={{ fontSize: '80px', lineHeight: 1 }}>
        {emoji}
      </Box>
    </motion.div>
  );
};

// ============================================================================
// EXAMPLE 4: Draggable Item (with emoji + image)
// ============================================================================

interface DraggableItemProps {
  emoji?: string;
  imageUrl?: string;
  label?: string;
  isDragging?: boolean;
  showLabel?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  emoji, 
  imageUrl, 
  label,
  isDragging = false,
  showLabel = false, // НЕ показуємо для toddlers
}) => (
  <motion.div
    drag
    dragMomentum={false}
    dragElastic={0.1}
    whileDrag={{
      scale: 1.2,
      rotate: 5,
      boxShadow: '0 20px 40px rgba(255, 215, 0, 0.5)',
      zIndex: 1000,
    }}
    animate={!isDragging ? {
      y: [0, -8, 0],
      rotate: [-2, 2, -2, 0],
    } : {}}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <Paper
      sx={{
        width: 150,
        height: 150,
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFE5F1 0%, #FFB6C1 100%)',
        border: '4px solid #FF6B9D',
        boxShadow: '0 8px 16px rgba(255, 182, 193, 0.3), 0 2px 4px rgba(255, 215, 0, 0.2)',
        cursor: 'grab',
        overflow: 'hidden',
        
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* Large Emoji */}
      {emoji && (
        <Box sx={{ fontSize: 80, lineHeight: 1 }}>
          {emoji}
        </Box>
      )}
      
      {/* Image */}
      {imageUrl && !emoji && (
        <Box
          component="img"
          src={imageUrl}
          alt={label || 'item'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 28,
          }}
        />
      )}
      
      {/* Label (optional, НЕ для toddlers) */}
      {showLabel && label && (
        <Typography
          sx={{
            mt: 1,
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Comic Sans MS', cursive",
            color: '#FF6B9D',
          }}
        >
          {label}
        </Typography>
      )}
    </Paper>
  </motion.div>
);

// ============================================================================
// EXAMPLE 5: Drop Target (with character + celebration)
// ============================================================================

interface DropTargetProps {
  character: string;
  backgroundColor?: string;
  isHovering?: boolean;
  isCelebrating?: boolean;
  celebrationText?: string;
}

export const DropTarget: React.FC<DropTargetProps> = ({ 
  character, 
  backgroundColor = '#FFFACD',
  isHovering = false,
  isCelebrating = false,
  celebrationText,
}) => (
  <Paper
    sx={{
      width: 180,
      height: 180,
      borderRadius: 36,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor,
      border: isHovering ? '6px solid transparent' : '4px solid #FFD700',
      borderImage: isHovering ? 'linear-gradient(135deg, #FF6B9D, #FFD93D, #4DABF7, #51CF66) 1' : undefined,
      boxShadow: isHovering 
        ? '0 16px 32px rgba(255, 215, 0, 0.5)'
        : '0 8px 20px rgba(255, 215, 0, 0.25)',
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s ease',
    }}
  >
    {/* Character */}
    <motion.div
      animate={
        isCelebrating
          ? {
              scale: [1, 1.3, 1],
              rotate: [0, -15, 15, 0],
            }
          : isHovering
          ? {
              scale: 1.2,
              y: -10,
            }
          : {
              scale: [1, 1.05, 1],
            }
      }
      transition={{
        duration: isCelebrating ? 0.6 : 2,
        repeat: isCelebrating ? 0 : Infinity,
        ease: 'easeInOut',
      }}
    >
      <Box sx={{ fontSize: 100, lineHeight: 1 }}>
        {character}
      </Box>
    </motion.div>

    {/* Celebration text */}
    <AnimatePresence>
      {isCelebrating && celebrationText && (
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: 1, y: -40 }}
          exit={{ scale: 0, y: -80, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: -20,
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "'Comic Sans MS', cursive",
            color: '#FF6B9D',
            textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8)',
          }}
        >
          {celebrationText}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Floating stars on celebration */}
    <AnimatePresence>
      {isCelebrating && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, -100 - Math.random() * 50],
                opacity: [1, 0],
                scale: [1, 1.5],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
              }}
              style={{
                position: 'absolute',
                fontSize: 30,
                pointerEvents: 'none',
              }}
            >
              ⭐
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  </Paper>
);

// ============================================================================
// EXAMPLE 6: Success Banner
// ============================================================================

interface SuccessBannerProps {
  show: boolean;
  message?: string;
  emoji?: string;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ 
  show, 
  message = 'Amazing!',
  emoji = '🎉',
}) => (
  <AnimatePresence>
    {show && (
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
          zIndex: 9999,
        }}
      >
        <Paper
          sx={{
            p: 6,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B9D 50%, #4DABF7 100%)',
            boxShadow: '0 20px 60px rgba(255, 107, 157, 0.6)',
            border: '6px solid #FFFFFF',
            textAlign: 'center',
            minWidth: 400,
          }}
        >
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
            <Box sx={{ fontSize: 120, lineHeight: 1, mb: 2 }}>
              {emoji}
            </Box>
          </motion.div>
          
          <Typography
            sx={{
              fontSize: 48,
              fontWeight: 800,
              fontFamily: "'Comic Sans MS', cursive",
              color: '#FFFFFF',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
            }}
          >
            {message}
          </Typography>
        </Paper>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================================
// EXAMPLE 7: Progress Stars (instead of progress bar)
// ============================================================================

interface ProgressStarsProps {
  current: number;
  total: number;
}

export const ProgressStars: React.FC<ProgressStarsProps> = ({ current, total }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      justifyContent: 'center',
      mb: 3,
    }}
  >
    {Array.from({ length: total }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ scale: 0 }}
        animate={{ 
          scale: index < current ? 1 : 0.5,
          opacity: index < current ? 1 : 0.3,
        }}
        transition={{ 
          delay: index * 0.1,
          type: 'spring',
          bounce: 0.5,
        }}
      >
        <Box
          sx={{
            fontSize: index < current ? 60 : 40,
            filter: index < current ? 'none' : 'grayscale(100%)',
          }}
        >
          ⭐
        </Box>
      </motion.div>
    ))}
  </Box>
);

// ============================================================================
// EXAMPLE 8: Complete Component Example
// ============================================================================

export const ToddlerDragDropExample: React.FC = () => {
  const [celebrating, setCelebrating] = React.useState(false);

  const handleSuccess = () => {
    setCelebrating(true);
    
    // Triple feedback
    soundService.playSuccess();
    triggerHaptic('success');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FF6B9D', '#FFD93D', '#4DABF7', '#51CF66'],
    });

    // Hide banner after 3 seconds
    setTimeout(() => {
      setCelebrating(false);
    }, 3000);
  };

  return (
    <ToddlerContainer>
      {/* Instructions */}
      <AnimatedInstruction type="drop-here" />

      {/* Drop targets */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 6 }}>
        <DropTarget 
          character="🐶" 
          backgroundColor="#FFE5B4"
          celebrationText="Woof!"
        />
        <DropTarget 
          character="🐱" 
          backgroundColor="#FFE5F1"
          celebrationText="Meow!"
        />
      </Box>

      {/* Instructions */}
      <AnimatedInstruction type="drag-these" />

      {/* Draggable items */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        <DraggableItem emoji="🦴" />
        <DraggableItem emoji="🐟" />
      </Box>

      {/* Encouragement */}
      <Box sx={{ mt: 4 }}>
        <AnimatedInstruction type="you-can-do-it" />
      </Box>

      {/* Progress */}
      <ProgressStars current={2} total={5} />

      {/* Success banner */}
      <SuccessBanner show={celebrating} message="Amazing!" emoji="🎉" />
    </ToddlerContainer>
  );
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Simple container with background
<ToddlerContainer>
  <YourContent />
</ToddlerContainer>

// 2. Big tap button
<BigTapButton 
  emoji="🐶" 
  onTap={() => console.log('Tapped!')}
  idleAnimation="bounce"
/>

// 3. Animated instructions
<AnimatedInstruction type="tap-here" />

// 4. Draggable item
<DraggableItem 
  emoji="🦴"
  label="Bone"
  showLabel={false}  // Don't show for toddlers
/>

// 5. Drop target
<DropTarget 
  character="🐶"
  backgroundColor="#FFE5B4"
  isHovering={isOver}
  isCelebrating={success}
  celebrationText="Woof!"
/>

// 6. Success banner
<SuccessBanner 
  show={completed}
  message="Great job!"
  emoji="🎉"
/>

// 7. Progress stars
<ProgressStars current={3} total={5} />
*/

