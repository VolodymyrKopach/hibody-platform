/**
 * Shared types and interfaces for age-specific drag and drop components
 */

import { AgeGroup } from '@/types/age-group-data';

// Common drag and drop event types
export interface DragStartEvent {
  itemId: string;
  startPosition: { x: number; y: number };
  timestamp: number;
}

export interface DragEndEvent {
  itemId: string;
  endPosition: { x: number; y: number };
  targetId: string | null;
  wasSuccessful: boolean;
  timestamp: number;
}

export interface TargetHoverEvent {
  targetId: string;
  itemId: string;
  isEntering: boolean;
  timestamp: number;
}

// Age-specific settings interface
export interface AgeSettings {
  snapDistance: number;
  animationDuration: number;
  enableSounds: boolean;
  enableHaptics: boolean;
  autoComplete: boolean;
  showHints: boolean;
  elementSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontSize: number;
  borderRadius: number;
  spacing: number;
}

// Component state interfaces
export interface DragState {
  draggedItemId: string | null;
  hoveredTargetId: string | null;
  isDragging: boolean;
  dragStartTime?: number;
  dragPosition?: { x: number; y: number };
}

export interface CompletionState {
  isComplete: boolean;
  correctCount: number;
  totalCount: number;
  mistakes: number;
  timeSpent: number;
  accuracy: number;
  startTime: number;
}

// Analytics and tracking
export interface InteractionEvent {
  type: 'drag_start' | 'drag_end' | 'target_hover' | 'completion' | 'mistake' | 'hint_used';
  itemId?: string;
  targetId?: string;
  timestamp: number;
  ageGroup: AgeGroup;
  componentType: string;
  metadata?: Record<string, any>;
}

export interface SessionMetrics {
  sessionId: string;
  ageGroup: AgeGroup;
  componentType: string;
  startTime: number;
  endTime?: number;
  events: InteractionEvent[];
  finalScore?: number;
  completionRate?: number;
}

// Animation and visual effects
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  delay?: number;
  repeat?: number;
}

export interface VisualEffect {
  type: 'confetti' | 'particles' | 'glow' | 'bounce' | 'shake' | 'pulse';
  intensity: 'low' | 'medium' | 'high';
  duration: number;
  colors?: string[];
}

// Audio configuration
export interface AudioConfig {
  enabled: boolean;
  volume: number; // 0-1
  sounds: {
    dragStart?: string;
    dragEnd?: string;
    success?: string;
    error?: string;
    completion?: string;
    background?: string;
  };
}

// Accessibility configuration
export interface AccessibilityConfig {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  largeHitAreas: boolean;
  reducedMotion: boolean;
  voiceInstructions: boolean;
}

// Validation and feedback
export interface ValidationResult {
  isCorrect: boolean;
  feedback?: string;
  explanation?: string;
  hint?: string;
  encouragement?: string;
}

export interface FeedbackConfig {
  immediate: boolean;
  showExplanations: boolean;
  showHints: boolean;
  encouragementLevel: 'minimal' | 'moderate' | 'enthusiastic';
  customMessages?: Record<string, string>;
}

// Component lifecycle hooks
export interface ComponentLifecycle {
  onMount?: () => void;
  onUnmount?: () => void;
  onStart?: () => void;
  onComplete?: (results: CompletionState) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

// Theming and styling
export interface ComponentTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      extraLarge: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

// Performance monitoring
export interface PerformanceMetrics {
  renderTime: number;
  interactionLatency: number;
  memoryUsage?: number;
  frameRate?: number;
  errorCount: number;
}

// Adaptive difficulty
export interface DifficultySettings {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  adaptiveEnabled: boolean;
  increaseThreshold: number; // success rate to increase difficulty
  decreaseThreshold: number; // error rate to decrease difficulty
  maxAttempts?: number;
  timeLimit?: number;
}

// Data persistence
export interface SavedProgress {
  componentId: string;
  ageGroup: AgeGroup;
  userId?: string;
  sessionId: string;
  progress: number; // 0-100
  completedItems: string[];
  mistakes: string[];
  timeSpent: number;
  lastSaved: number;
  customData?: Record<string, any>;
}

// Component registration and metadata
export interface ComponentRegistration {
  type: string;
  name: string;
  description: string;
  ageGroups: AgeGroup[];
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  prerequisites?: string[];
  learningObjectives: string[];
  component: React.ComponentType<any>;
}

// Export utility type for component props
export type AgeSpecificProps<T = {}> = T & {
  ageGroup: AgeGroup;
  ageSettings: AgeSettings;
  dragState: DragState;
  completionState: CompletionState;
  onDragStart: (itemId: string) => void;
  onDragEnd: (itemId: string, targetId: string | null) => void;
  onTargetHover: (targetId: string | null) => void;
};
