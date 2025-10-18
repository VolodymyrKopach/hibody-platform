/**
 * Age-Based Theme System for Interactive Components
 * Provides age-appropriate styling, colors, sizes, and animations
 */

export type AgeGroup = '2-3' | '4-6' | '3-5' | '6-7' | '8-9' | '10-12' | '13-15' | '16-18';

export interface AgeTheme {
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    error: string;
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
  };
  
  // Typography
  typography: {
    title: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
    };
    body: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
    };
    caption: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
    };
  };
  
  // Spacing & Sizing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // Component Sizes
  componentSizes: {
    button: {
      height: number;
      minWidth: number;
      fontSize: string;
    };
    card: {
      padding: number;
      borderRadius: number;
      minHeight: number;
    };
    icon: {
      small: number;
      medium: number;
      large: number;
    };
    image: {
      small: number;
      medium: number;
      large: number;
    };
  };
  
  // Animations
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    intensity: 'low' | 'medium' | 'high';
    enableConfetti: boolean;
    enableParticles: boolean;
  };
  
  // Backgrounds
  backgrounds: {
    pattern: string;
    gradient: string;
    opacity: number;
  };
  
  // Interactions
  interactions: {
    hapticFeedback: boolean;
    soundEffects: boolean;
    voiceInstructions: boolean;
  };
}

/**
 * Age-specific theme configurations
 */
export const AGE_THEMES: Record<AgeGroup, AgeTheme> = {
  // 2-3 years - Very simple, large, colorful
  '2-3': {
    colors: {
      primary: '#FF6B9D',      // Bright pink
      secondary: '#FFD93D',    // Bright yellow
      accent: '#6BCF7F',       // Bright green
      success: '#4CAF50',
      error: '#FF5252',
      background: '#FFF9E6',   // Soft cream
      cardBackground: '#FFFFFF',
      textPrimary: '#2C3E50',
      textSecondary: '#7F8C8D',
    },
    typography: {
      title: {
        fontSize: '48px',      // Very large
        fontWeight: 800,
        lineHeight: 1.2,
      },
      body: {
        fontSize: '32px',      // Large
        fontWeight: 600,
        lineHeight: 1.4,
      },
      caption: {
        fontSize: '24px',
        fontWeight: 500,
        lineHeight: 1.3,
      },
    },
    spacing: {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
    },
    componentSizes: {
      button: {
        height: 120,
        minWidth: 180,
        fontSize: '36px',
      },
      card: {
        padding: 32,
        borderRadius: 32,
        minHeight: 200,
      },
      icon: {
        small: 60,
        medium: 100,
        large: 150,
      },
      image: {
        small: 150,
        medium: 250,
        large: 400,
      },
    },
    animations: {
      duration: {
        fast: 400,
        normal: 600,
        slow: 1000,
      },
      intensity: 'high',
      enableConfetti: true,
      enableParticles: true,
    },
    backgrounds: {
      pattern: 'playful-dots',
      gradient: 'linear-gradient(135deg, #FFE5F1 0%, #FFF9E6 50%, #E8F5FF 100%)',
      opacity: 0.6,
    },
    interactions: {
      hapticFeedback: true,
      soundEffects: true,
      voiceInstructions: true,
    },
  },

  // 4-6 years - Playful, colorful, slightly smaller
  '4-6': {
    colors: {
      primary: '#8B5CF6',      // Purple
      secondary: '#EC4899',    // Pink
      accent: '#F59E0B',       // Orange
      success: '#10B981',
      error: '#EF4444',
      background: '#F9FAFB',
      cardBackground: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '36px',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      body: {
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      caption: {
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: 1.3,
      },
    },
    spacing: {
      xs: 12,
      sm: 20,
      md: 28,
      lg: 40,
      xl: 56,
    },
    componentSizes: {
      button: {
        height: 90,
        minWidth: 140,
        fontSize: '28px',
      },
      card: {
        padding: 28,
        borderRadius: 24,
        minHeight: 160,
      },
      icon: {
        small: 48,
        medium: 80,
        large: 120,
      },
      image: {
        small: 120,
        medium: 200,
        large: 350,
      },
    },
    animations: {
      duration: {
        fast: 350,
        normal: 500,
        slow: 800,
      },
      intensity: 'high',
      enableConfetti: true,
      enableParticles: true,
    },
    backgrounds: {
      pattern: 'friendly-waves',
      gradient: 'linear-gradient(135deg, #F3E7FF 0%, #E0F2FE 50%, #FEF3C7 100%)',
      opacity: 0.5,
    },
    interactions: {
      hapticFeedback: true,
      soundEffects: true,
      voiceInstructions: true,
    },
  },

  // 3-5 years - Similar to 4-6 but even more playful
  '3-5': {
    colors: {
      primary: '#10B981',      // Green
      secondary: '#3B82F6',    // Blue
      accent: '#F59E0B',       // Orange
      success: '#10B981',
      error: '#EF4444',
      background: '#F0FDF4',
      cardBackground: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '40px',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      body: {
        fontSize: '28px',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      caption: {
        fontSize: '20px',
        fontWeight: 500,
        lineHeight: 1.3,
      },
    },
    spacing: {
      xs: 14,
      sm: 22,
      md: 30,
      lg: 44,
      xl: 60,
    },
    componentSizes: {
      button: {
        height: 100,
        minWidth: 160,
        fontSize: '32px',
      },
      card: {
        padding: 30,
        borderRadius: 28,
        minHeight: 180,
      },
      icon: {
        small: 54,
        medium: 90,
        large: 135,
      },
      image: {
        small: 135,
        medium: 225,
        large: 375,
      },
    },
    animations: {
      duration: {
        fast: 380,
        normal: 550,
        slow: 900,
      },
      intensity: 'high',
      enableConfetti: true,
      enableParticles: true,
    },
    backgrounds: {
      pattern: 'cheerful-shapes',
      gradient: 'linear-gradient(135deg, #DCFCE7 0%, #E0F2FE 50%, #FEF9C3 100%)',
      opacity: 0.55,
    },
    interactions: {
      hapticFeedback: true,
      soundEffects: true,
      voiceInstructions: true,
    },
  },

  // 6-7 years - Transitional, still playful but more structured
  '6-7': {
    colors: {
      primary: '#3B82F6',      // Blue
      secondary: '#8B5CF6',    // Purple
      accent: '#EC4899',       // Pink
      success: '#10B981',
      error: '#EF4444',
      background: '#F8FAFC',
      cardBackground: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '32px',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      body: {
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: 1.4,
      },
    },
    spacing: {
      xs: 10,
      sm: 16,
      md: 24,
      lg: 36,
      xl: 48,
    },
    componentSizes: {
      button: {
        height: 70,
        minWidth: 120,
        fontSize: '22px',
      },
      card: {
        padding: 24,
        borderRadius: 20,
        minHeight: 140,
      },
      icon: {
        small: 40,
        medium: 64,
        large: 96,
      },
      image: {
        small: 100,
        medium: 180,
        large: 300,
      },
    },
    animations: {
      duration: {
        fast: 300,
        normal: 400,
        slow: 600,
      },
      intensity: 'medium',
      enableConfetti: true,
      enableParticles: false,
    },
    backgrounds: {
      pattern: 'simple-grid',
      gradient: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
      opacity: 0.4,
    },
    interactions: {
      hapticFeedback: true,
      soundEffects: true,
      voiceInstructions: false,
    },
  },

  // 8-9 years - More structured, less playful
  '8-9': {
    colors: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#DB2777',
      success: '#059669',
      error: '#DC2626',
      background: '#F9FAFB',
      cardBackground: '#FFFFFF',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '28px',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      body: {
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 1.4,
      },
    },
    spacing: {
      xs: 8,
      sm: 12,
      md: 20,
      lg: 32,
      xl: 40,
    },
    componentSizes: {
      button: {
        height: 56,
        minWidth: 100,
        fontSize: '18px',
      },
      card: {
        padding: 20,
        borderRadius: 16,
        minHeight: 120,
      },
      icon: {
        small: 32,
        medium: 48,
        large: 72,
      },
      image: {
        small: 80,
        medium: 150,
        large: 250,
      },
    },
    animations: {
      duration: {
        fast: 250,
        normal: 350,
        slow: 500,
      },
      intensity: 'medium',
      enableConfetti: false,
      enableParticles: false,
    },
    backgrounds: {
      pattern: 'subtle-lines',
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
      opacity: 0.3,
    },
    interactions: {
      hapticFeedback: false,
      soundEffects: true,
      voiceInstructions: false,
    },
  },

  // 10-12 years - Clean, minimal
  '10-12': {
    colors: {
      primary: '#1D4ED8',
      secondary: '#7C3AED',
      accent: '#BE185D',
      success: '#047857',
      error: '#B91C1C',
      background: '#FFFFFF',
      cardBackground: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    spacing: {
      xs: 6,
      sm: 10,
      md: 16,
      lg: 24,
      xl: 32,
    },
    componentSizes: {
      button: {
        height: 48,
        minWidth: 80,
        fontSize: '16px',
      },
      card: {
        padding: 16,
        borderRadius: 12,
        minHeight: 100,
      },
      icon: {
        small: 24,
        medium: 40,
        large: 56,
      },
      image: {
        small: 60,
        medium: 120,
        large: 200,
      },
    },
    animations: {
      duration: {
        fast: 200,
        normal: 300,
        slow: 400,
      },
      intensity: 'low',
      enableConfetti: false,
      enableParticles: false,
    },
    backgrounds: {
      pattern: 'none',
      gradient: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      opacity: 0.2,
    },
    interactions: {
      hapticFeedback: false,
      soundEffects: false,
      voiceInstructions: false,
    },
  },

  // 13-15 years - Minimal, professional
  '13-15': {
    colors: {
      primary: '#1E40AF',
      secondary: '#6D28D9',
      accent: '#9F1239',
      success: '#065F46',
      error: '#991B1B',
      background: '#FFFFFF',
      cardBackground: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
    },
    typography: {
      title: {
        fontSize: '22px',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body: {
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 20,
      xl: 28,
    },
    componentSizes: {
      button: {
        height: 44,
        minWidth: 70,
        fontSize: '15px',
      },
      card: {
        padding: 12,
        borderRadius: 10,
        minHeight: 80,
      },
      icon: {
        small: 20,
        medium: 32,
        large: 48,
      },
      image: {
        small: 50,
        medium: 100,
        large: 180,
      },
    },
    animations: {
      duration: {
        fast: 150,
        normal: 250,
        slow: 350,
      },
      intensity: 'low',
      enableConfetti: false,
      enableParticles: false,
    },
    backgrounds: {
      pattern: 'none',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
      opacity: 0.1,
    },
    interactions: {
      hapticFeedback: false,
      soundEffects: false,
      voiceInstructions: false,
    },
  },

  // 16-18 years - Professional, clean
  '16-18': {
    colors: {
      primary: '#1E3A8A',
      secondary: '#581C87',
      accent: '#881337',
      success: '#064E3B',
      error: '#7F1D1D',
      background: '#FFFFFF',
      cardBackground: '#FAFAFA',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
    },
    typography: {
      title: {
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    componentSizes: {
      button: {
        height: 40,
        minWidth: 60,
        fontSize: '14px',
      },
      card: {
        padding: 12,
        borderRadius: 8,
        minHeight: 70,
      },
      icon: {
        small: 18,
        medium: 28,
        large: 40,
      },
      image: {
        small: 40,
        medium: 80,
        large: 150,
      },
    },
    animations: {
      duration: {
        fast: 150,
        normal: 200,
        slow: 300,
      },
      intensity: 'low',
      enableConfetti: false,
      enableParticles: false,
    },
    backgrounds: {
      pattern: 'none',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      opacity: 0.05,
    },
    interactions: {
      hapticFeedback: false,
      soundEffects: false,
      voiceInstructions: false,
    },
  },
};

/**
 * Get theme for specific age group
 */
export function getAgeTheme(ageGroup: string): AgeTheme {
  // Map age groups to our theme keys
  const normalizedAge = ageGroup as AgeGroup;
  return AGE_THEMES[normalizedAge] || AGE_THEMES['6-7']; // Default fallback
}

/**
 * Check if age group needs playful design
 */
export function isPlayfulAge(ageGroup: string): boolean {
  return ['2-3', '3-5', '4-6'].includes(ageGroup);
}

/**
 * Check if sound effects should be enabled
 */
export function shouldEnableSounds(ageGroup: string): boolean {
  const theme = getAgeTheme(ageGroup);
  return theme.interactions.soundEffects;
}

/**
 * Check if voice instructions should be enabled
 */
export function shouldEnableVoice(ageGroup: string): boolean {
  const theme = getAgeTheme(ageGroup);
  return theme.interactions.voiceInstructions;
}

/**
 * Get background style for age group
 */
export function getAgeBackground(ageGroup: string): React.CSSProperties {
  const theme = getAgeTheme(ageGroup);
  return {
    background: theme.backgrounds.gradient,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  };
}

