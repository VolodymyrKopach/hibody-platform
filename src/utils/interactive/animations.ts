/**
 * Animation Library for Interactive Worksheets
 * Pre-configured animations using framer-motion
 */

import { Variants } from 'framer-motion';

/**
 * Bounce animation - for tap interactions
 */
export const bounceAnimation: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: [1, 0.9, 1.1, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.2, 0.6, 1],
    },
  },
};

/**
 * Scale animation - for successful interactions
 */
export const scaleAnimation: Variants = {
  initial: { scale: 1 },
  active: {
    scale: 1.2,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  rest: {
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Pulse animation - for hints and attention
 */
export const pulseAnimation: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shake animation - for incorrect interactions (gentle)
 */
export const shakeAnimation: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * Glow animation - for active elements
 */
export const glowAnimation: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(66, 153, 225, 0)',
  },
  glow: {
    boxShadow: [
      '0 0 0 0 rgba(66, 153, 225, 0)',
      '0 0 20px 5px rgba(66, 153, 225, 0.4)',
      '0 0 0 0 rgba(66, 153, 225, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Float animation - for hints (animated hand)
 */
export const floatAnimation: Variants = {
  initial: { y: 0 },
  float: {
    y: [-10, 0, -10],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Spin animation - for loading/processing
 */
export const spinAnimation: Variants = {
  initial: { rotate: 0 },
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pop in animation - for appearing elements
 */
export const popInAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Slide in animation - for panels
 */
export const slideInAnimation: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

/**
 * Fade animation - for subtle transitions
 */
export const fadeAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Success celebration animation - combines scale and rotation
 */
export const celebrationAnimation: Variants = {
  initial: { scale: 1, rotate: 0 },
  celebrate: {
    scale: [1, 1.2, 1.1, 1],
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.3, 0.6, 1],
    },
  },
};

/**
 * Wiggle animation - for playful attention
 */
export const wiggleAnimation: Variants = {
  initial: { rotate: 0 },
  wiggle: {
    rotate: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * Confetti particle animation
 */
export const confettiParticle: Variants = {
  initial: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  fall: (custom: { duration: number; delay: number; x: number }) => ({
    y: 500,
    x: custom.x,
    opacity: 0,
    scale: 0,
    rotate: 360,
    transition: {
      duration: custom.duration,
      delay: custom.delay,
      ease: 'easeIn',
    },
  }),
};

/**
 * Spring animation config - for natural movement
 */
export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

/**
 * Ease animation config - for smooth transitions
 */
export const easeConfig = {
  duration: 0.3,
  ease: 'easeInOut' as const,
};

/**
 * Helper function to create custom animation
 */
export const createCustomAnimation = (
  from: Record<string, any>,
  to: Record<string, any>,
  config?: {
    duration?: number;
    delay?: number;
    ease?: string;
    repeat?: number;
  }
): Variants => ({
  initial: from,
  animate: {
    ...to,
    transition: {
      duration: config?.duration || 0.3,
      delay: config?.delay || 0,
      ease: config?.ease || 'easeInOut',
      repeat: config?.repeat || 0,
    },
  },
});

/**
 * Combine multiple animations
 */
export const combineAnimations = (...animations: Variants[]): Variants => {
  const combined: Variants = {};
  
  animations.forEach((animation) => {
    Object.keys(animation).forEach((key) => {
      if (!combined[key]) {
        combined[key] = {};
      }
      combined[key] = {
        ...combined[key],
        ...(typeof animation[key] === 'object' ? animation[key] : {}),
      };
    });
  });
  
  return combined;
};

export default {
  bounce: bounceAnimation,
  scale: scaleAnimation,
  pulse: pulseAnimation,
  shake: shakeAnimation,
  glow: glowAnimation,
  float: floatAnimation,
  spin: spinAnimation,
  popIn: popInAnimation,
  slideIn: slideInAnimation,
  fade: fadeAnimation,
  celebration: celebrationAnimation,
  wiggle: wiggleAnimation,
  confetti: confettiParticle,
  springConfig,
  easeConfig,
  createCustomAnimation,
  combineAnimations,
};

