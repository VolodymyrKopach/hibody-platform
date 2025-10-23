/**
 * Toddlers (3-5 years) Age Group Components
 * 
 * This group contains drag and drop components specifically designed for toddlers:
 * - Extra large elements for easy manipulation
 * - Magnetic attraction for forgiving interaction
 * - Cute animal helpers for guidance
 * - Maximum celebration and encouragement
 * - Simple, colorful, and engaging designs
 */

export { default as MagneticPlayground } from './MagneticPlayground';

// Export component definitions for registration
export const TODDLER_COMPONENTS = {
  'magnetic-playground': {
    component: () => import('./MagneticPlayground'),
    name: '🧲 Magnetic Playground',
    description: 'Large, colorful items that magnetically snap to targets with cute animal helpers',
    icon: '🧲',
    ageGroup: '3-5' as const,
    difficulty: 'easy' as const,
    estimatedTime: 5,
    tags: ['matching', 'animals', 'colors', 'basic-concepts'],
  },
  // Future components will be added here:
  // 'simple-matching': { ... },
  // 'color-sorter': { ... },
} as const;

// Component type for this age group
export type ToddlerComponentType = keyof typeof TODDLER_COMPONENTS;
