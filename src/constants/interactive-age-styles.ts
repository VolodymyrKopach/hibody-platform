/**
 * Universal Age-Based Styles for ALL Interactive Components
 * These styles ensure consistency across tap-image, drag-drop, counter, etc.
 * Updated: 2025-10-31 - Fixed export configuration
 */

import { InteractiveAgeStyle, AgeStyleName } from '@/types/interactive-age-styles';

// === TODDLER STYLE (3-5 years) ===
// Maximum simplicity, very large, bright colors, maximum assistance
export const TODDLER_STYLE: InteractiveAgeStyle = {
  id: 'toddler',
  name: 'Toddler (3-5 years)',
  emoji: '🐣',
  description: 'Extra large, simple, touch-optimized',
  suitableForAges: ['2-3', '3-5'],
  color: '#FF6B9D', // Pink
  
  sizes: {
    element: 120,
    target: 140,
    icon: 60,
    gap: 24,
    padding: 20,
  },
  
  typography: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 0.5,
    showLabels: true,
    useSimpleText: true,
  },
  
  colors: {
    primary: '#FF6B9D',       // Bright pink
    secondary: '#FEC84E',     // Bright yellow
    background: '#FFE5F1',    // Soft pink
    border: '#FF6B9D',
    hover: '#FF8AB3',
    active: '#E85589',
    success: '#68D391',       // Bright green
    error: '#FC8181',         // Soft red
    disabled: '#E2E8F0',
    text: '#2D3748',
  },
  
  borders: {
    width: 4,
    radius: 24,
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce
    bounce: true,
    particles: true,
    soundEnabled: true,
    intensity: 'intense',
  },
  
  interaction: {
    snapDistance: 100,
    showHints: true,
    showHandCursor: true,
    hapticFeedback: true,
    errorTolerance: 'lenient',
    autoCorrect: true,
  },
  
  feedback: {
    immediate: true,
    celebrateSuccess: true,
    encourageErrors: true,
    showProgress: true,
    rewardStickers: true,
    voicePraise: true,
  },
  
  accessibility: {
    highContrast: true,
    largeHitArea: true,
    keyboardNav: false,
    screenReader: true,
    focusVisible: true,
  },
  
  complexity: {
    maxOptions: 4,
    maxSteps: 3,
    showInstructions: true,
    allowRetry: true,
    timedMode: false,
  },
};

// === PRESCHOOL STYLE (6-7 years) ===
// Large, playful, game-like, colorful
export const PRESCHOOL_STYLE: InteractiveAgeStyle = {
  id: 'preschool',
  name: 'Preschool (6-7 years)',
  emoji: '🎨',
  description: 'Large, playful, engaging',
  suitableForAges: ['4-6', '6-7'],
  color: '#667eea', // Indigo
  
  sizes: {
    element: 100,
    target: 120,
    icon: 50,
    gap: 20,
    padding: 16,
  },
  
  typography: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: 0.3,
    showLabels: true,
    useSimpleText: true,
  },
  
  colors: {
    primary: '#667eea',       // Indigo
    secondary: '#EC4899',     // Pink
    background: '#E0E7FF',    // Light indigo
    border: '#667eea',
    hover: '#7C8CEA',
    active: '#4C63D2',
    success: '#48BB78',       // Green
    error: '#F56565',         // Red
    disabled: '#CBD5E0',
    text: '#2D3748',
  },
  
  borders: {
    width: 3,
    radius: 20,
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 400,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: true,
    particles: true,
    soundEnabled: true,
    intensity: 'moderate',
  },
  
  interaction: {
    snapDistance: 80,
    showHints: true,
    showHandCursor: false,
    hapticFeedback: true,
    errorTolerance: 'moderate',
    autoCorrect: false,
  },
  
  feedback: {
    immediate: true,
    celebrateSuccess: true,
    encourageErrors: true,
    showProgress: true,
    rewardStickers: true,
    voicePraise: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: true,
    keyboardNav: true,
    screenReader: true,
    focusVisible: true,
  },
  
  complexity: {
    maxOptions: 6,
    maxSteps: 5,
    showInstructions: true,
    allowRetry: true,
    timedMode: false,
  },
};

// === ELEMENTARY STYLE (8-9 years) ===
// Medium, structured, balanced
export const ELEMENTARY_STYLE: InteractiveAgeStyle = {
  id: 'elementary',
  name: 'Elementary (8-9 years)',
  emoji: '📚',
  description: 'Medium, structured, balanced',
  suitableForAges: ['7-8', '8-9'],
  color: '#3B82F6', // Blue
  
  sizes: {
    element: 80,
    target: 96,
    icon: 40,
    gap: 16,
    padding: 12,
  },
  
  typography: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: 0,
    showLabels: true,
    useSimpleText: false,
  },
  
  colors: {
    primary: '#3B82F6',       // Blue
    secondary: '#10B981',     // Green
    background: '#DBEAFE',    // Light blue
    border: '#3B82F6',
    hover: '#60A5FA',
    active: '#2563EB',
    success: '#10B981',
    error: '#EF4444',
    disabled: '#9CA3AF',
    text: '#1F2937',
  },
  
  borders: {
    width: 2,
    radius: 12,
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    bounce: false,
    particles: false,
    soundEnabled: false,
    intensity: 'moderate',
  },
  
  interaction: {
    snapDistance: 60,
    showHints: false,
    showHandCursor: false,
    hapticFeedback: false,
    errorTolerance: 'moderate',
    autoCorrect: false,
  },
  
  feedback: {
    immediate: true,
    celebrateSuccess: false,
    encourageErrors: false,
    showProgress: true,
    rewardStickers: false,
    voicePraise: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
    screenReader: true,
    focusVisible: true,
  },
  
  complexity: {
    maxOptions: 8,
    maxSteps: 8,
    showInstructions: false,
    allowRetry: true,
    timedMode: true,
  },
};

// === MIDDLE SCHOOL STYLE (10-13 years) ===
// Standard, balanced, clean
export const MIDDLE_STYLE: InteractiveAgeStyle = {
  id: 'middle',
  name: 'Middle School (10-13 years)',
  emoji: '🎯',
  description: 'Standard, clean, efficient',
  suitableForAges: ['9-10', '10-11', '10-12', '11-13'],
  color: '#8B5CF6', // Purple
  
  sizes: {
    element: 70,
    target: 84,
    icon: 32,
    gap: 12,
    padding: 10,
  },
  
  typography: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: 0,
    showLabels: true,
    useSimpleText: false,
  },
  
  colors: {
    primary: '#8B5CF6',       // Purple
    secondary: '#F59E0B',     // Amber
    background: '#EDE9FE',    // Light purple
    border: '#8B5CF6',
    hover: '#A78BFA',
    active: '#7C3AED',
    success: '#10B981',
    error: '#EF4444',
    disabled: '#9CA3AF',
    text: '#1F2937',
  },
  
  borders: {
    width: 2,
    radius: 8,
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 250,
    easing: 'ease-in-out',
    bounce: false,
    particles: false,
    soundEnabled: false,
    intensity: 'subtle',
  },
  
  interaction: {
    snapDistance: 40,
    showHints: false,
    showHandCursor: false,
    hapticFeedback: false,
    errorTolerance: 'strict',
    autoCorrect: false,
  },
  
  feedback: {
    immediate: true,
    celebrateSuccess: false,
    encourageErrors: false,
    showProgress: true,
    rewardStickers: false,
    voicePraise: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
    screenReader: true,
    focusVisible: true,
  },
  
  complexity: {
    maxOptions: 12,
    maxSteps: 12,
    showInstructions: false,
    allowRetry: true,
    timedMode: true,
  },
};

// === TEEN STYLE (14-18 years) ===
// Compact, minimal, sophisticated
export const TEEN_STYLE: InteractiveAgeStyle = {
  id: 'teen',
  name: 'Teen (14-18 years)',
  emoji: '🎓',
  description: 'Compact, minimal, sophisticated',
  suitableForAges: ['12-13', '14-15', '16-18'],
  color: '#1F2937', // Dark gray
  
  sizes: {
    element: 60,
    target: 72,
    icon: 24,
    gap: 8,
    padding: 8,
  },
  
  typography: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: 0,
    showLabels: false,
    useSimpleText: false,
  },
  
  colors: {
    primary: '#1F2937',       // Dark gray
    secondary: '#6B7280',     // Gray
    background: '#F3F4F6',    // Light gray
    border: '#D1D5DB',
    hover: '#9CA3AF',
    active: '#111827',
    success: '#059669',
    error: '#DC2626',
    disabled: '#E5E7EB',
    text: '#111827',
  },
  
  borders: {
    width: 1,
    radius: 6,
    style: 'solid',
  },
  
  animations: {
    enabled: true,
    duration: 200,
    easing: 'ease-in-out',
    bounce: false,
    particles: false,
    soundEnabled: false,
    intensity: 'subtle',
  },
  
  interaction: {
    snapDistance: 30,
    showHints: false,
    showHandCursor: false,
    hapticFeedback: false,
    errorTolerance: 'strict',
    autoCorrect: false,
  },
  
  feedback: {
    immediate: false,
    celebrateSuccess: false,
    encourageErrors: false,
    showProgress: false,
    rewardStickers: false,
    voicePraise: false,
  },
  
  accessibility: {
    highContrast: false,
    largeHitArea: false,
    keyboardNav: true,
    screenReader: true,
    focusVisible: true,
  },
  
  complexity: {
    maxOptions: 20,
    maxSteps: 20,
    showInstructions: false,
    allowRetry: false,
    timedMode: true,
  },
};

// === COLLECTION ===
export const INTERACTIVE_AGE_STYLES: Record<AgeStyleName, InteractiveAgeStyle> = {
  toddler: TODDLER_STYLE,
  preschool: PRESCHOOL_STYLE,
  elementary: ELEMENTARY_STYLE,
  middle: MIDDLE_STYLE,
  teen: TEEN_STYLE,
};

// === UTILITY FUNCTIONS ===

export function getAgeStyle(styleName: AgeStyleName): InteractiveAgeStyle {
  return INTERACTIVE_AGE_STYLES[styleName];
}

export function getAllAgeStyles(): InteractiveAgeStyle[] {
  return Object.values(INTERACTIVE_AGE_STYLES);
}

export function getAgeStylesByAge(age: string): InteractiveAgeStyle[] {
  return getAllAgeStyles().filter(style => 
    style.suitableForAges.includes(age)
  );
}

export function getDefaultAgeStyleForAge(age: string): AgeStyleName {
  const styles = getAgeStylesByAge(age);
  if (styles.length > 0) {
    return styles[0].id;
  }
  return 'elementary'; // Default fallback
}

export function isAgeStyleSuitableForAge(styleName: AgeStyleName, age: string): boolean {
  const style = getAgeStyle(styleName);
  return style.suitableForAges.includes(age);
}

// Age labels for UI
export const AGE_STYLE_LABELS: Record<AgeStyleName, string> = {
  'toddler': '3-5 yrs',
  'preschool': '6-7 yrs',
  'elementary': '8-9 yrs',
  'middle': '10-13 yrs',
  'teen': '14-18 yrs',
};
