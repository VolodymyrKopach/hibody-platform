/**
 * Universal Age-Based Style System for ALL Interactive Components
 * Ensures consistent look & feel across all component types
 */

export type AgeStyleName =
  | 'toddler'      // 3-5 years
  | 'preschool'    // 6-7 years
  | 'elementary'   // 8-9 years
  | 'middle'       // 10-13 years
  | 'teen';        // 14-18 years

/**
 * Universal age-based style configuration
 * Used by ALL interactive components for consistency
 */
export interface InteractiveAgeStyle {
  id: AgeStyleName;
  name: string;
  emoji: string;
  description: string;
  suitableForAges: string[];
  color: string;              // Primary color for this age group
  
  // === VISUAL CHARACTERISTICS ===
  
  // Element sizes (for buttons, cards, draggables, etc.)
  sizes: {
    element: number;          // Main element size (buttons, cards, items)
    target: number;           // Target/drop zone size
    icon: number;             // Icon size within elements
    gap: number;              // Spacing between elements
    padding: number;          // Internal padding
  };
  
  // Typography
  typography: {
    fontSize: number;         // Base font size
    fontWeight: number;       // Font weight
    lineHeight: number;       // Line height multiplier
    letterSpacing: number;    // Letter spacing
    showLabels: boolean;      // Always show text labels
    useSimpleText: boolean;   // Use simpler vocabulary
  };
  
  // Colors (consistent across all components)
  colors: {
    primary: string;          // Primary accent color
    secondary: string;        // Secondary color
    background: string;       // Element background
    border: string;           // Border color
    hover: string;            // Hover state
    active: string;           // Active/selected state
    success: string;          // Success feedback
    error: string;            // Error feedback
    disabled: string;         // Disabled state
    text: string;             // Text color
  };
  
  // Borders
  borders: {
    width: number;            // Border width in px
    radius: number;           // Border radius in px
    style: 'solid' | 'dashed' | 'dotted';
  };
  
  // Animations & Effects
  animations: {
    enabled: boolean;         // Enable animations
    duration: number;         // Animation duration in ms
    easing: string;           // CSS easing function
    bounce: boolean;          // Enable bounce effects
    particles: boolean;       // Show particle effects
    soundEnabled: boolean;    // Play sound effects
    intensity: 'subtle' | 'moderate' | 'intense';
  };
  
  // Interaction
  interaction: {
    snapDistance: number;     // Magnetic snap distance (for drag&drop)
    showHints: boolean;       // Show visual hints
    showHandCursor: boolean;  // Show animated hand hint
    hapticFeedback: boolean;  // Vibration on mobile
    errorTolerance: 'strict' | 'moderate' | 'lenient';
    autoCorrect: boolean;     // Auto-correct mistakes
  };
  
  // Feedback & Rewards
  feedback: {
    immediate: boolean;       // Immediate feedback on actions
    celebrateSuccess: boolean; // Celebrate correct answers
    encourageErrors: boolean; // Encourage on mistakes
    showProgress: boolean;    // Show progress indicators
    rewardStickers: boolean;  // Award stickers/badges
    voicePraise: boolean;     // Voice encouragement
  };
  
  // Accessibility
  accessibility: {
    highContrast: boolean;    // High contrast mode
    largeHitArea: boolean;    // Larger clickable area
    keyboardNav: boolean;     // Enable keyboard navigation
    screenReader: boolean;    // Screen reader optimized
    focusVisible: boolean;    // Visible focus indicators
  };
  
  // Complexity
  complexity: {
    maxOptions: number;       // Max number of options/choices
    maxSteps: number;         // Max steps in sequence
    showInstructions: boolean; // Show detailed instructions
    allowRetry: boolean;      // Allow unlimited retries
    timedMode: boolean;       // Support timed challenges
  };
}

