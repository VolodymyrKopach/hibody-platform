/**
 * Enhanced Age-Based Styles with Psychology, Feedback, and Motivation
 * Extension of basic age styles with advanced features
 */

import { AgeStyleName } from '@/types/interactive-age-styles';

// === FEEDBACK PATTERNS ===
export interface FeedbackPattern {
  onSuccess: {
    animation: 'celebration' | 'subtle-glow' | 'pulse' | 'bounce';
    particles: boolean;
    particleCount: number;
    particleColors: string[];
    sound?: 'cheerful' | 'bell' | 'chime' | 'none';
    haptic: boolean;
    voicePraise: boolean;
    delay: number;
    duration: number;
    message?: string;
    emoji?: string;
  };
  onError: {
    animation: 'gentle-shake' | 'border-pulse' | 'subtle-fade';
    sound?: 'soft-error' | 'none';
    message: string;
    showCorrectAnswer: boolean;
    encouragement: string[];
    autoRetry: boolean;
    haptic: boolean;
  };
  onInteraction: {
    animation: 'scale' | 'lift' | 'glow';
    sound?: 'tap' | 'click' | 'none';
    haptic: 'light' | 'medium' | 'strong' | 'none';
  };
}

// === MOTIVATION SYSTEMS ===
export interface MotivationSystem {
  type: 'immediate-reward' | 'achievement-based' | 'progress-tracking';
  rewards: {
    perTask?: string;
    perSession?: string;
    special?: string;
  };
  showProgress: 'visual' | 'numerical' | 'both' | 'none';
  celebrationFrequency: 'high' | 'medium' | 'low';
  encouragementMessages: string[];
  gamification?: {
    streaks?: boolean;
    points?: boolean;
    badges?: boolean;
  };
}

// === COGNITIVE LOAD ===
export interface CognitiveLoad {
  maxElementsOnScreen: number;
  maxTextLength: number;
  requiresImageSupport: boolean;
  attentionSpan: number; // seconds
  taskSwitchingDelay: number; // ms
  simplificationLevel: number; // 1.0 = normal, 1.5 = simplified
}

// === ENHANCED AGE STYLE ===
export interface EnhancedAgeStyle {
  id: AgeStyleName;
  feedbackPattern: FeedbackPattern;
  motivationSystem: MotivationSystem;
  cognitiveLoad: CognitiveLoad;
  colorPsychology: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    attention: string;
    calm: string;
  };
  emotionalTone: 'playful' | 'encouraging' | 'neutral' | 'professional';
}

// === TODDLER (3-5) ===
export const TODDLER_ENHANCED: EnhancedAgeStyle = {
  id: 'toddler',
  
  feedbackPattern: {
    onSuccess: {
      animation: 'celebration',
      particles: true,
      particleCount: 30,
      particleColors: ['#FF6B9D', '#FEC84E', '#68D391', '#4FD1C5'],
      sound: 'cheerful',
      haptic: true,
      voicePraise: true,
      delay: 0,
      duration: 2000,
      message: 'Супер! 🎉',
      emoji: '⭐',
    },
    onError: {
      animation: 'gentle-shake',
      sound: 'soft-error',
      message: 'Спробуй ще раз! 💪',
      showCorrectAnswer: true,
      encouragement: [
        'Ти майже впорався!',
        'Давай разом!',
        'У тебе чудово виходить!',
      ],
      autoRetry: true,
      haptic: true,
    },
    onInteraction: {
      animation: 'scale',
      sound: 'tap',
      haptic: 'medium',
    },
  },
  
  motivationSystem: {
    type: 'immediate-reward',
    rewards: {
      perTask: '⭐',
      perSession: '🎈',
      special: '🦄',
    },
    showProgress: 'visual',
    celebrationFrequency: 'high',
    encouragementMessages: [
      'Чудово! 🌟',
      'Молодець! 👏',
      'Фантастично! 🎊',
      'Ти супер! 💫',
    ],
  },
  
  cognitiveLoad: {
    maxElementsOnScreen: 3,
    maxTextLength: 20,
    requiresImageSupport: true,
    attentionSpan: 30,
    taskSwitchingDelay: 1000,
    simplificationLevel: 1.5,
  },
  
  colorPsychology: {
    primary: '#FF6B9D',      // Яскраво-рожевий - радість
    secondary: '#FEC84E',    // Жовтий - увага
    success: '#68D391',      // Зелений - успіх
    error: '#FC8181',        // М'який червоний
    attention: '#F6AD55',    // Помаранчевий
    calm: '#B4E4FF',         // Світло-блакитний
  },
  
  emotionalTone: 'playful',
};

// === PRESCHOOL (6-7) ===
export const PRESCHOOL_ENHANCED: EnhancedAgeStyle = {
  id: 'preschool',
  
  feedbackPattern: {
    onSuccess: {
      animation: 'celebration',
      particles: true,
      particleCount: 20,
      particleColors: ['#667eea', '#EC4899', '#48BB78'],
      sound: 'bell',
      haptic: true,
      voicePraise: false,
      delay: 0,
      duration: 1500,
      message: 'Відмінно! ✨',
      emoji: '🌟',
    },
    onError: {
      animation: 'gentle-shake',
      sound: 'soft-error',
      message: 'Спробуй ще раз!',
      showCorrectAnswer: true,
      encouragement: [
        'Майже правильно!',
        'Ти на правильному шляху!',
        'Давай подумаємо разом!',
      ],
      autoRetry: false,
      haptic: true,
    },
    onInteraction: {
      animation: 'bounce',
      sound: 'tap',
      haptic: 'light',
    },
  },
  
  motivationSystem: {
    type: 'immediate-reward',
    rewards: {
      perTask: '⭐',
      perSession: '🏆',
      special: '👑',
    },
    showProgress: 'both',
    celebrationFrequency: 'high',
    encouragementMessages: [
      'Чудова робота! 🎨',
      'Так тримати! 🌈',
      'Ти справжній розумник! 🧠',
    ],
    gamification: {
      streaks: true,
      points: false,
    },
  },
  
  cognitiveLoad: {
    maxElementsOnScreen: 5,
    maxTextLength: 50,
    requiresImageSupport: true,
    attentionSpan: 60,
    taskSwitchingDelay: 800,
    simplificationLevel: 1.3,
  },
  
  colorPsychology: {
    primary: '#667eea',
    secondary: '#EC4899',
    success: '#48BB78',
    error: '#F56565',
    attention: '#F6AD55',
    calm: '#90CDF4',
  },
  
  emotionalTone: 'playful',
};

// === ELEMENTARY (8-9) ===
export const ELEMENTARY_ENHANCED: EnhancedAgeStyle = {
  id: 'elementary',
  
  feedbackPattern: {
    onSuccess: {
      animation: 'pulse',
      particles: true,
      particleCount: 10,
      particleColors: ['#3B82F6', '#10B981', '#F59E0B'],
      sound: 'chime',
      haptic: false,
      voicePraise: false,
      delay: 0,
      duration: 1000,
      message: 'Правильно! ✓',
      emoji: '✓',
    },
    onError: {
      animation: 'border-pulse',
      sound: 'none',
      message: 'Не зовсім правильно',
      showCorrectAnswer: false,
      encouragement: [
        'Подумай ще раз',
        'Перевір свою відповідь',
        'Майже впорався!',
      ],
      autoRetry: false,
      haptic: false,
    },
    onInteraction: {
      animation: 'lift',
      sound: 'click',
      haptic: 'none',
    },
  },
  
  motivationSystem: {
    type: 'progress-tracking',
    rewards: {
      perTask: undefined,
      perSession: '📊',
      special: '🎯',
    },
    showProgress: 'both',
    celebrationFrequency: 'medium',
    encouragementMessages: [
      'Добра робота! 👍',
      'Продовжуй в тому ж дусі!',
      'Чудовий прогрес!',
    ],
    gamification: {
      streaks: true,
      points: true,
    },
  },
  
  cognitiveLoad: {
    maxElementsOnScreen: 8,
    maxTextLength: 100,
    requiresImageSupport: false,
    attentionSpan: 120,
    taskSwitchingDelay: 500,
    simplificationLevel: 1.0,
  },
  
  colorPsychology: {
    primary: '#3B82F6',
    secondary: '#10B981',
    success: '#10B981',
    error: '#EF4444',
    attention: '#F59E0B',
    calm: '#60A5FA',
  },
  
  emotionalTone: 'encouraging',
};

// === MIDDLE (10-13) ===
export const MIDDLE_ENHANCED: EnhancedAgeStyle = {
  id: 'middle',
  
  feedbackPattern: {
    onSuccess: {
      animation: 'subtle-glow',
      particles: false,
      particleCount: 5,
      particleColors: ['#8B5CF6', '#F59E0B'],
      sound: 'chime',
      haptic: false,
      voicePraise: false,
      delay: 0,
      duration: 600,
      message: 'Correct',
      emoji: '✓',
    },
    onError: {
      animation: 'border-pulse',
      sound: 'none',
      message: 'Incorrect',
      showCorrectAnswer: false,
      encouragement: [
        'Try again',
        'Review the question',
        'Think it through',
      ],
      autoRetry: false,
      haptic: false,
    },
    onInteraction: {
      animation: 'glow',
      sound: 'none',
      haptic: 'none',
    },
  },
  
  motivationSystem: {
    type: 'achievement-based',
    rewards: {
      perSession: 'XP',
      special: '🏅',
    },
    showProgress: 'numerical',
    celebrationFrequency: 'medium',
    encouragementMessages: [
      'Good job!',
      'Keep it up!',
      'Nice work!',
    ],
    gamification: {
      streaks: true,
      points: true,
      badges: true,
    },
  },
  
  cognitiveLoad: {
    maxElementsOnScreen: 12,
    maxTextLength: 200,
    requiresImageSupport: false,
    attentionSpan: 180,
    taskSwitchingDelay: 300,
    simplificationLevel: 0.9,
  },
  
  colorPsychology: {
    primary: '#8B5CF6',
    secondary: '#F59E0B',
    success: '#10B981',
    error: '#EF4444',
    attention: '#F97316',
    calm: '#A78BFA',
  },
  
  emotionalTone: 'neutral',
};

// === TEEN (14-18) ===
export const TEEN_ENHANCED: EnhancedAgeStyle = {
  id: 'teen',
  
  feedbackPattern: {
    onSuccess: {
      animation: 'subtle-glow',
      particles: false,
      particleCount: 0,
      particleColors: [],
      sound: 'none',
      haptic: false,
      voicePraise: false,
      delay: 0,
      duration: 300,
      message: '✓',
    },
    onError: {
      animation: 'subtle-fade',
      sound: 'none',
      message: '✗',
      showCorrectAnswer: false,
      encouragement: [],
      autoRetry: false,
      haptic: false,
    },
    onInteraction: {
      animation: 'glow',
      sound: 'none',
      haptic: 'none',
    },
  },
  
  motivationSystem: {
    type: 'achievement-based',
    rewards: {
      perSession: 'Points',
      special: 'Badge',
    },
    showProgress: 'numerical',
    celebrationFrequency: 'low',
    encouragementMessages: [],
    gamification: {
      streaks: true,
      points: true,
      badges: true,
    },
  },
  
  cognitiveLoad: {
    maxElementsOnScreen: 20,
    maxTextLength: 500,
    requiresImageSupport: false,
    attentionSpan: 300,
    taskSwitchingDelay: 200,
    simplificationLevel: 0.8,
  },
  
  colorPsychology: {
    primary: '#1F2937',
    secondary: '#6B7280',
    success: '#059669',
    error: '#DC2626',
    attention: '#D97706',
    calm: '#9CA3AF',
  },
  
  emotionalTone: 'professional',
};

// === COLLECTION ===
export const ENHANCED_AGE_STYLES: Record<AgeStyleName, EnhancedAgeStyle> = {
  toddler: TODDLER_ENHANCED,
  preschool: PRESCHOOL_ENHANCED,
  elementary: ELEMENTARY_ENHANCED,
  middle: MIDDLE_ENHANCED,
  teen: TEEN_ENHANCED,
};

// === UTILITY ===
export const getEnhancedAgeStyle = (styleName: AgeStyleName): EnhancedAgeStyle => {
  return ENHANCED_AGE_STYLES[styleName];
};

