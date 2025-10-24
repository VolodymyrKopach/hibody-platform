/**
 * Drag & Drop Age-Based Styles
 * Pre-configured styles optimized for different age groups
 */

import { DragDropAgeStyle, DragDropAgeStyleName } from '@/types/drag-drop-styles';

// === TODDLER STYLE (3-5 years) ===
// Very large elements, maximum simplicity, bright colors
export const TODDLER_DRAG_DROP_STYLE: DragDropAgeStyle = {
  id: 'toddler',
  name: '🐣 Toddler (3-5 years)',
  description: 'Very large elements, simple interactions, touch-optimized',
  suitableForAges: ['3-5'],
  
  elementSize: {
    item: 150,           // ДУЖЕ великі items для малюків 2-5 років
    target: 180,         // Ще більші targets для легкого дропу
    gap: 32,             // Великий spacing
  },
  
  typography: {
    fontSize: 24,        // Extra large text
    fontWeight: 700,     // Bold for visibility
    labelVisible: true,  // Always show labels
  },
  
  colors: {
    itemBg: '#FFE5F1',          // Яскравий рожевий
    itemBorder: '#FF69B4',      // Hot pink
    targetBg: '#FFE66D',        // Яскравий жовтий
    targetBorder: '#FFB700',    // Яскравий золотий
    targetHover: '#FFD93D',     // Яскравий жовтий hover
    success: '#4ECDC4',         // Яскравий бірюзовий
    error: '#FF6B6B',           // Яскравий червоний (але м'який)
  },
  
  borders: {
    width: 4,            // Thick borders for visibility
    radius: 24,          // Very rounded corners
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 500,       // Slower animations
    bounce: true,        // Fun bounce effect
    particles: true,     // Celebration particles
    soundEnabled: true,  // Praise sounds
  },
  
  interaction: {
    snapDistance: 100,   // Magnetic snap from far away
    showHints: true,     // Show all hints
    showHandCursor: true, // Animated hand
    hapticFeedback: true,
  },
  
  accessibility: {
    highContrast: true,
    largeHitArea: true,  // Extra large touch areas
    keyboardNav: false,  // Too young for keyboard
  },
};

// === PRESCHOOL STYLE (6-7 years) ===
// Large elements, playful design, game-like
export const PRESCHOOL_DRAG_DROP_STYLE: DragDropAgeStyle = {
  id: 'preschool',
  name: '🎨 Preschool (6-7 years)',
  description: 'Large elements, playful colors, engaging animations',
  suitableForAges: ['6-7'],
  
  elementSize: {
    item: 100,           // Large items
    target: 120,         // Large targets
    gap: 20,
  },
  
  typography: {
    fontSize: 20,        // Large text
    fontWeight: 600,
    labelVisible: true,
  },
  
  colors: {
    itemBg: '#E0E7FF',          // Light indigo
    itemBorder: '#667eea',      // Indigo
    targetBg: '#FCE7F3',        // Light pink
    targetBorder: '#EC4899',    // Pink
    targetHover: '#FBB6CE',     // Hover pink
    success: '#48BB78',         // Green
    error: '#F56565',           // Red
  },
  
  borders: {
    width: 3,
    radius: 20,          // Rounded corners
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 400,       // Medium speed
    bounce: true,
    particles: true,
    soundEnabled: true,
  },
  
  interaction: {
    snapDistance: 80,    // Good magnetic snap
    showHints: true,
    showHandCursor: true,
    hapticFeedback: true,
  },
  
  accessibility: {
    highContrast: true,
    largeHitArea: true,
    keyboardNav: true,   // Can start learning keyboard
  },
};

// === ELEMENTARY STYLE (8-9 years) ===
// Medium-sized elements, clear structure, educational focus
export const ELEMENTARY_DRAG_DROP_STYLE: DragDropAgeStyle = {
  id: 'elementary',
  name: '📚 Elementary (8-9 years)',
  description: 'Medium elements, clear structure, balanced design',
  suitableForAges: ['8-9'],
  
  elementSize: {
    item: 80,            // Medium items
    target: 100,         // Medium targets
    gap: 16,
  },
  
  typography: {
    fontSize: 18,        // Medium text
    fontWeight: 500,
    labelVisible: true,
  },
  
  colors: {
    itemBg: '#DBEAFE',          // Light blue
    itemBorder: '#3B82F6',      // Blue
    targetBg: '#FEF3C7',        // Light amber
    targetBorder: '#F59E0B',    // Amber
    targetHover: '#FDE68A',     // Hover amber
    success: '#10B981',         // Emerald
    error: '#EF4444',           // Red
  },
  
  borders: {
    width: 2,
    radius: 16,          // Moderately rounded
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 300,       // Standard speed
    bounce: false,       // More subtle
    particles: true,
    soundEnabled: false, // Less distracting
  },
  
  interaction: {
    snapDistance: 60,    // Medium snap distance
    showHints: true,
    showHandCursor: false, // No need for hand cursor
    hapticFeedback: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
  },
};

// === MIDDLE SCHOOL STYLE (10-13 years) ===
// Standard size, clean design, efficient interaction
export const MIDDLE_DRAG_DROP_STYLE: DragDropAgeStyle = {
  id: 'middle',
  name: '🎯 Middle School (10-13 years)',
  description: 'Standard elements, clean design, efficient interaction',
  suitableForAges: ['10-11', '10-12', '11-13', '12-13'],
  
  elementSize: {
    item: 70,            // Standard items
    target: 90,          // Standard targets
    gap: 12,
  },
  
  typography: {
    fontSize: 16,        // Standard text
    fontWeight: 500,
    labelVisible: true,
  },
  
  colors: {
    itemBg: '#E0E7FF',          // Light blue
    itemBorder: '#4F46E5',      // Indigo
    targetBg: '#F3F4F6',        // Light gray
    targetBorder: '#6B7280',    // Gray
    targetHover: '#E5E7EB',     // Hover gray
    success: '#10B981',         // Green
    error: '#DC2626',           // Red
  },
  
  borders: {
    width: 2,
    radius: 12,          // Slightly rounded
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 250,       // Fast animations
    bounce: false,
    particles: false,    // Minimal effects
    soundEnabled: false,
  },
  
  interaction: {
    snapDistance: 50,    // Precise snap
    showHints: false,    // No hints needed
    showHandCursor: false,
    hapticFeedback: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
  },
};

// === TEEN STYLE (14-18 years) ===
// Compact, minimal, professional design
export const TEEN_DRAG_DROP_STYLE: DragDropAgeStyle = {
  id: 'teen',
  name: '🎓 Teen (14-18 years)',
  description: 'Compact elements, minimal design, professional look',
  suitableForAges: ['14-15', '16-18'],
  
  elementSize: {
    item: 60,            // Compact items
    target: 80,          // Compact targets
    gap: 10,
  },
  
  typography: {
    fontSize: 14,        // Smaller text
    fontWeight: 400,
    labelVisible: true,
  },
  
  colors: {
    itemBg: '#F9FAFB',          // Very light gray
    itemBorder: '#1F2937',      // Dark gray
    targetBg: '#F3F4F6',        // Light gray
    targetBorder: '#4B5563',    // Medium gray
    targetHover: '#E5E7EB',     // Hover gray
    success: '#059669',         // Dark green
    error: '#B91C1C',           // Dark red
  },
  
  borders: {
    width: 1,            // Thin borders
    radius: 8,           // Subtle rounding
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 200,       // Very fast
    bounce: false,
    particles: false,
    soundEnabled: false,
  },
  
  interaction: {
    snapDistance: 40,    // Minimal snap
    showHints: false,
    showHandCursor: false,
    hapticFeedback: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
  },
};

// === STYLE REGISTRY ===
export const DRAG_DROP_AGE_STYLES: Record<DragDropAgeStyleName, DragDropAgeStyle> = {
  'toddler': TODDLER_DRAG_DROP_STYLE,
  'preschool': PRESCHOOL_DRAG_DROP_STYLE,
  'elementary': ELEMENTARY_DRAG_DROP_STYLE,
  'middle': MIDDLE_DRAG_DROP_STYLE,
  'teen': TEEN_DRAG_DROP_STYLE,
};

// === UTILITY FUNCTIONS ===

/**
 * Get drag-drop style by name
 */
export const getDragDropStyle = (styleName: DragDropAgeStyleName): DragDropAgeStyle => {
  return DRAG_DROP_AGE_STYLES[styleName];
};

/**
 * Get all drag-drop styles
 */
export const getAllDragDropStyles = (): DragDropAgeStyle[] => {
  return Object.values(DRAG_DROP_AGE_STYLES);
};

/**
 * Get drag-drop styles suitable for a specific age group
 */
export const getDragDropStylesByAge = (ageGroup: string): DragDropAgeStyle[] => {
  if (!ageGroup) return getAllDragDropStyles();
  
  // Normalize age group format
  const normalizedAge = ageGroup.match(/\d+-\d+/)?.[0] || ageGroup;
  
  return getAllDragDropStyles().filter(style =>
    style.suitableForAges.some(age => {
      const normalizedStyleAge = age.match(/\d+-\d+/)?.[0] || age;
      return normalizedStyleAge === normalizedAge;
    })
  );
};

/**
 * Get default drag-drop style for an age group
 */
export const getDefaultDragDropStyleForAge = (ageGroup: string): DragDropAgeStyleName => {
  const normalizedAge = ageGroup.match(/\d+-\d+/)?.[0] || ageGroup;
  
  switch (normalizedAge) {
    case '3-5':
      return 'toddler';
    
    case '6-7':
      return 'preschool';
    
    case '8-9':
      return 'elementary';
    
    case '10-11':
    case '10-12':
    case '11-13':
    case '12-13':
      return 'middle';
    
    case '14-15':
    case '16-18':
      return 'teen';
    
    default:
      return 'elementary'; // Safe fallback
  }
};

/**
 * Check if a drag-drop style is suitable for an age group
 */
export const isDragDropStyleSuitableForAge = (
  styleName: DragDropAgeStyleName,
  ageGroup: string
): boolean => {
  const style = getDragDropStyle(styleName);
  if (!style || !ageGroup) return false;
  
  const normalizedAge = ageGroup.match(/\d+-\d+/)?.[0] || ageGroup;
  
  return style.suitableForAges.some(age => {
    const normalizedStyleAge = age.match(/\d+-\d+/)?.[0] || age;
    return normalizedStyleAge === normalizedAge;
  });
};

