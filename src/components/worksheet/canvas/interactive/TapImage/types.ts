/**
 * Type definitions for TapImage component (3-5 years optimized)
 */

import { AgeStyleName } from '@/types/interactive-age-styles';

export type TapImageMode = 'simple' | 'find' | 'sequence' | 'memory';

export interface TapImageItem {
  id: string;
  url: string;
  label: string;
  sound?: string;
}

export interface TapImageProps {
  // Game mode
  mode?: TapImageMode;
  
  // Images (can be single or multiple)
  imageUrl?: string; // Legacy support
  images?: TapImageItem[];
  
  // Game config
  targetCount?: number; // How many stars to collect (simple mode)
  sequence?: string[]; // Sequence for sequence mode
  correctAnswer?: string; // Correct image ID for find mode
  memoryTime?: number; // Time to show image in memory mode (ms)
  
  // Visual
  caption?: string;
  prompt?: string; // Voice/text prompt like "Find the dog!"
  size?: 'small' | 'medium' | 'large';
  
  // Progression
  showProgress?: boolean;
  showStars?: boolean;
  level?: number;
  
  // Mascot & hints
  showMascot?: boolean;
  showHints?: boolean;
  hintDelay?: number; // Delay before showing hint (ms)
  showTutorial?: boolean; // Show tutorial on first use
  
  // Voice guidance (Web Speech API)
  enableVoice?: boolean; // Enable text-to-speech
  voiceLanguage?: 'uk-UA' | 'en-US' | 'ru-RU';
  speakPrompt?: boolean; // Speak prompt on load
  speakFeedback?: boolean; // Speak feedback messages
  
  // Age styling
  ageGroup?: string;
  ageStyle?: AgeStyleName;
  
  // Editor mode
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  
  // Callbacks
  onComplete?: () => void;
  onLevelUp?: () => void;
  onCorrectTap?: (imageId: string) => void;
  onWrongTap?: (imageId: string) => void;
  onProgress?: (progress: number) => void;
}

export interface TapImageCardProps {
  image: TapImageItem;
  size: number;
  isCorrect?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
  sequenceNumber?: number;
  showGlow?: boolean;
  showPulse?: boolean;
  disabled?: boolean;
  ageStyle?: AgeStyleName;
  onTap: (imageId: string) => void;
}

export interface TapImageRewardProps {
  stars: number;
  maxStars: number;
  animate?: boolean;
  ageStyle?: AgeStyleName;
}

export interface TapImageProgressProps {
  current: number;
  total: number;
  showLabel?: boolean;
  ageStyle?: AgeStyleName;
}

export interface TapImageMascotProps {
  emotion: 'happy' | 'encouraging' | 'celebrating' | 'idle';
  message?: string;
  animate?: boolean;
  ageStyle?: AgeStyleName;
}

export interface TapImageHintProps {
  show: boolean;
  targetId?: string;
  type: 'hand' | 'glow' | 'arrow';
  position?: { x: number; y: number };
}

export interface TapImageCelebrationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
  ageStyle?: AgeStyleName;
}

export interface GameState {
  mode: TapImageMode;
  currentProgress: number;
  targetProgress: number;
  stars: number;
  targetStars: number;
  sequenceProgress: string[];
  isCompleted: boolean;
  wrongAttempts: number;
}

