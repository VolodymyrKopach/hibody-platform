/**
 * Drag & Drop Age-Based Style Configuration
 * Defines visual styles optimized for different age groups
 */

export type DragDropAgeStyleName =
  | 'toddler'      // 3-5 years - Very large, bright, simple
  | 'preschool'    // 6-7 years - Large, colorful, playful
  | 'elementary'   // 8-9 years - Medium, structured
  | 'middle'       // 10-13 years - Standard, balanced
  | 'teen';        // 14-18 years - Compact, minimal

export interface DragDropAgeStyle {
  id: DragDropAgeStyleName;
  name: string;
  description: string;
  suitableForAges: string[];
  
  // Visual characteristics
  elementSize: {
    item: number;           // Draggable item size in px
    target: number;         // Drop target size in px
    gap: number;            // Gap between elements in px
  };
  
  typography: {
    fontSize: number;       // Label font size
    fontWeight: number;
    labelVisible: boolean;  // Show text labels
  };
  
  colors: {
    itemBg: string;        // Item background
    itemBorder: string;    // Item border color
    targetBg: string;      // Target background
    targetBorder: string;  // Target border
    targetHover: string;   // Target hover state
    success: string;       // Success feedback
    error: string;         // Error feedback
  };
  
  borders: {
    width: number;         // Border width in px
    radius: number;        // Border radius in px
    style: 'solid' | 'dashed' | 'dotted';
  };
  
  animations: {
    enabled: boolean;
    duration: number;      // Animation duration in ms
    bounce: boolean;       // Enable bounce effect
    particles: boolean;    // Show particle effects
    soundEnabled: boolean; // Play sound effects
  };
  
  interaction: {
    snapDistance: number;  // Distance for magnetic snap in px
    showHints: boolean;    // Show visual hints
    showHandCursor: boolean; // Show animated hand hint
    hapticFeedback: boolean; // Vibration on mobile
  };
  
  accessibility: {
    highContrast: boolean;
    largeHitArea: boolean; // Larger clickable area
    keyboardNav: boolean;  // Enable keyboard navigation
  };
}

