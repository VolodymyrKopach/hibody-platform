/**
 * Visual Themes Configuration
 * Defines all available themes with their visual properties
 */

import { VisualTheme, ThemeName } from '@/types/themes';

export const VISUAL_THEMES: Record<ThemeName, VisualTheme> = {
  cartoon: {
    id: 'cartoon',
    name: 'Cartoon Fun',
    description: 'Bright, playful colors perfect for young learners',
    category: 'playful',
    suitableForAges: ['2-3', '4-6', '7-8'],
    colors: {
      primary: '#FF6B9D',
      secondary: '#FEC84B',
      accent: '#9B87F5',
      background: '#FFFBF0',
      surface: '#FFFFFF',
      text: {
        primary: '#2D3748',
        secondary: '#718096',
      },
      success: '#48BB78',
      error: '#F56565',
      warning: '#ED8936',
      info: '#4299E1',
    },
    typography: {
      fontFamily: 'baloo',
      fontSize: {
        small: 12,
        medium: 16,
        large: 22,
        xlarge: 32,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.1)',
      md: '0 4px 8px rgba(0,0,0,0.12)',
      lg: '0 8px 16px rgba(0,0,0,0.15)',
      xl: '0 12px 24px rgba(0,0,0,0.18)',
    },
    animations: {
      speed: 'normal',
      complexity: 'rich',
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
    },
    ux: {
      useEmojis: true,
      useSounds: true,
      hapticFeedback: true,
    },
  },

  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and engaging with balanced colors',
    category: 'playful',
    suitableForAges: ['4-6', '7-8', '9-10'],
    colors: {
      primary: '#3B82F6',
      secondary: '#F59E0B',
      accent: '#EC4899',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: {
        primary: '#1E293B',
        secondary: '#64748B',
      },
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#06B6D4',
    },
    typography: {
      fontFamily: 'nunito',
      fontSize: {
        small: 13,
        medium: 16,
        large: 20,
        xlarge: 28,
      },
      lineHeight: 1.5,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 6,
      md: 12,
      lg: 18,
      xl: 24,
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.1)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.1)',
    },
    animations: {
      speed: 'normal',
      complexity: 'moderate',
      duration: {
        fast: 150,
        normal: 300,
        slow: 450,
      },
    },
    ux: {
      useEmojis: true,
      useSounds: false,
      hapticFeedback: true,
    },
  },

  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Professional and focused for serious study',
    category: 'educational',
    suitableForAges: ['9-10', '11-12', '13-15', '16-18'],
    colors: {
      primary: '#1E40AF',
      secondary: '#059669',
      accent: '#7C3AED',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: {
        primary: '#111827',
        secondary: '#6B7280',
      },
      success: '#059669',
      error: '#DC2626',
      warning: '#D97706',
      info: '#2563EB',
    },
    typography: {
      fontFamily: 'inter',
      fontSize: {
        small: 12,
        medium: 14,
        large: 18,
        xlarge: 24,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 20,
      xl: 28,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.07)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.1)',
    },
    animations: {
      speed: 'fast',
      complexity: 'minimal',
      duration: {
        fast: 100,
        normal: 200,
        slow: 300,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: false,
      hapticFeedback: false,
    },
  },

  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and minimal design for older students',
    category: 'professional',
    suitableForAges: ['13-15', '16-18'],
    colors: {
      primary: '#18181B',
      secondary: '#71717A',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: {
        primary: '#09090B',
        secondary: '#52525B',
      },
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    typography: {
      fontFamily: 'inter',
      fontSize: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 20,
      },
      lineHeight: 1.5,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 6,
      xl: 8,
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.04)',
      md: '0 2px 4px rgba(0,0,0,0.06)',
      lg: '0 4px 8px rgba(0,0,0,0.08)',
      xl: '0 8px 16px rgba(0,0,0,0.1)',
    },
    animations: {
      speed: 'fast',
      complexity: 'minimal',
      duration: {
        fast: 100,
        normal: 200,
        slow: 250,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: false,
      hapticFeedback: false,
    },
  },

  'bright-fun': {
    id: 'bright-fun',
    name: 'Bright Fun',
    description: 'Vibrant and energetic colors for active learning',
    category: 'playful',
    suitableForAges: ['4-6', '7-8', '9-10'],
    colors: {
      primary: '#FF3366',
      secondary: '#FFCC00',
      accent: '#00CC99',
      background: '#FFF9E5',
      surface: '#FFFFFF',
      text: {
        primary: '#2D2D2D',
        secondary: '#666666',
      },
      success: '#00CC66',
      error: '#FF3366',
      warning: '#FF9900',
      info: '#3399FF',
    },
    typography: {
      fontFamily: 'poppins',
      fontSize: {
        small: 12,
        medium: 16,
        large: 22,
        xlarge: 30,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 14,
      lg: 20,
      xl: 28,
    },
    shadows: {
      sm: '0 2px 4px rgba(255,51,102,0.1)',
      md: '0 4px 8px rgba(255,51,102,0.15)',
      lg: '0 8px 16px rgba(255,51,102,0.2)',
      xl: '0 12px 24px rgba(255,51,102,0.25)',
    },
    animations: {
      speed: 'fast',
      complexity: 'rich',
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
    },
    ux: {
      useEmojis: true,
      useSounds: true,
      hapticFeedback: true,
    },
  },

  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Calm and natural colors inspired by nature',
    category: 'creative',
    suitableForAges: ['7-8', '9-10', '11-12'],
    colors: {
      primary: '#34D399',
      secondary: '#86EFAC',
      accent: '#FCD34D',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: {
        primary: '#065F46',
        secondary: '#059669',
      },
      success: '#10B981',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#60A5FA',
    },
    typography: {
      fontFamily: 'nunito',
      fontSize: {
        small: 12,
        medium: 15,
        large: 19,
        xlarge: 26,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 22,
      xl: 30,
    },
    borderRadius: {
      sm: 6,
      md: 12,
      lg: 18,
      xl: 24,
    },
    shadows: {
      sm: '0 1px 3px rgba(16,185,129,0.1)',
      md: '0 4px 6px rgba(16,185,129,0.15)',
      lg: '0 10px 15px rgba(16,185,129,0.2)',
      xl: '0 20px 25px rgba(16,185,129,0.25)',
    },
    animations: {
      speed: 'slow',
      complexity: 'moderate',
      duration: {
        fast: 200,
        normal: 400,
        slow: 600,
      },
    },
    ux: {
      useEmojis: true,
      useSounds: false,
      hapticFeedback: false,
    },
  },

  space: {
    id: 'space',
    name: 'Space',
    description: 'Dark and cosmic theme for space enthusiasts',
    category: 'creative',
    suitableForAges: ['9-10', '11-12', '13-15'],
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#06B6D4',
      background: '#1E1B4B',
      surface: '#312E81',
      text: {
        primary: '#E0E7FF',
        secondary: '#C7D2FE',
      },
      success: '#34D399',
      error: '#FB7185',
      warning: '#FBBF24',
      info: '#60A5FA',
    },
    typography: {
      fontFamily: 'poppins',
      fontSize: {
        small: 12,
        medium: 15,
        large: 19,
        xlarge: 26,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 22,
      xl: 30,
    },
    borderRadius: {
      sm: 8,
      md: 14,
      lg: 20,
      xl: 28,
    },
    shadows: {
      sm: '0 2px 4px rgba(139,92,246,0.2)',
      md: '0 4px 8px rgba(139,92,246,0.3)',
      lg: '0 10px 20px rgba(139,92,246,0.4)',
      xl: '0 15px 30px rgba(139,92,246,0.5)',
    },
    animations: {
      speed: 'slow',
      complexity: 'rich',
      duration: {
        fast: 200,
        normal: 400,
        slow: 700,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: true,
      hapticFeedback: true,
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue tones inspired by the ocean',
    category: 'creative',
    suitableForAges: ['7-8', '9-10', '11-12', '13-15'],
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#14B8A6',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: {
        primary: '#0C4A6E',
        secondary: '#0369A1',
      },
      success: '#14B8A6',
      error: '#F43F5E',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    typography: {
      fontFamily: 'nunito',
      fontSize: {
        small: 12,
        medium: 15,
        large: 19,
        xlarge: 26,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 22,
      xl: 30,
    },
    borderRadius: {
      sm: 6,
      md: 12,
      lg: 18,
      xl: 24,
    },
    shadows: {
      sm: '0 1px 3px rgba(14,165,233,0.1)',
      md: '0 4px 6px rgba(14,165,233,0.15)',
      lg: '0 10px 15px rgba(14,165,233,0.2)',
      xl: '0 20px 25px rgba(14,165,233,0.25)',
    },
    animations: {
      speed: 'slow',
      complexity: 'moderate',
      duration: {
        fast: 200,
        normal: 400,
        slow: 600,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: true,
      hapticFeedback: false,
    },
  },

  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage colors for a nostalgic feel',
    category: 'creative',
    suitableForAges: ['11-12', '13-15', '16-18'],
    colors: {
      primary: '#F97316',
      secondary: '#FACC15',
      accent: '#DC2626',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: {
        primary: '#78350F',
        secondary: '#92400E',
      },
      success: '#65A30D',
      error: '#DC2626',
      warning: '#EA580C',
      info: '#0284C7',
    },
    typography: {
      fontFamily: 'poppins',
      fontSize: {
        small: 12,
        medium: 15,
        large: 20,
        xlarge: 28,
      },
      lineHeight: 1.5,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 20,
      xl: 28,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
    shadows: {
      sm: '0 2px 4px rgba(249,115,22,0.2)',
      md: '0 4px 8px rgba(249,115,22,0.25)',
      lg: '0 8px 16px rgba(249,115,22,0.3)',
      xl: '0 12px 24px rgba(249,115,22,0.35)',
    },
    animations: {
      speed: 'normal',
      complexity: 'moderate',
      duration: {
        fast: 150,
        normal: 300,
        slow: 450,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: true,
      hapticFeedback: false,
    },
  },

  pastel: {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft pastel colors for gentle learning',
    category: 'playful',
    suitableForAges: ['2-3', '4-6', '7-8', '9-10'],
    colors: {
      primary: '#DDA0DD',
      secondary: '#FFB6C1',
      accent: '#B0E0E6',
      background: '#FFF5F7',
      surface: '#FFFFFF',
      text: {
        primary: '#4A5568',
        secondary: '#718096',
      },
      success: '#90EE90',
      error: '#FFB6C1',
      warning: '#FFE4B5',
      info: '#ADD8E6',
    },
    typography: {
      fontFamily: 'nunito',
      fontSize: {
        small: 12,
        medium: 16,
        large: 21,
        xlarge: 28,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 14,
      lg: 20,
      xl: 28,
    },
    shadows: {
      sm: '0 2px 4px rgba(221,160,221,0.15)',
      md: '0 4px 8px rgba(221,160,221,0.2)',
      lg: '0 8px 16px rgba(221,160,221,0.25)',
      xl: '0 12px 24px rgba(221,160,221,0.3)',
    },
    animations: {
      speed: 'slow',
      complexity: 'moderate',
      duration: {
        fast: 200,
        normal: 400,
        slow: 600,
      },
    },
    ux: {
      useEmojis: true,
      useSounds: true,
      hapticFeedback: true,
    },
  },

  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Strong, high-contrast colors for impact',
    category: 'playful',
    suitableForAges: ['9-10', '11-12', '13-15'],
    colors: {
      primary: '#DC2626',
      secondary: '#FACC15',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F8F8F8',
      text: {
        primary: '#000000',
        secondary: '#404040',
      },
      success: '#16A34A',
      error: '#DC2626',
      warning: '#EA580C',
      info: '#2563EB',
    },
    typography: {
      fontFamily: 'poppins',
      fontSize: {
        small: 13,
        medium: 16,
        large: 20,
        xlarge: 28,
      },
      lineHeight: 1.5,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 20,
      xl: 28,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.15)',
      md: '0 4px 8px rgba(0,0,0,0.2)',
      lg: '0 8px 16px rgba(0,0,0,0.25)',
      xl: '0 12px 24px rgba(0,0,0,0.3)',
    },
    animations: {
      speed: 'fast',
      complexity: 'moderate',
      duration: {
        fast: 100,
        normal: 250,
        slow: 400,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: false,
      hapticFeedback: true,
    },
  },

  'soft-minimal': {
    id: 'soft-minimal',
    name: 'Soft Minimal',
    description: 'Gentle, minimal design for focused learning',
    category: 'professional',
    suitableForAges: ['11-12', '13-15', '16-18'],
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#8B5CF6',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
      },
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    typography: {
      fontFamily: 'inter',
      fontSize: {
        small: 12,
        medium: 14,
        large: 17,
        xlarge: 22,
      },
      lineHeight: 1.6,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 18,
      xl: 26,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.04)',
      md: '0 2px 4px rgba(0,0,0,0.06)',
      lg: '0 4px 8px rgba(0,0,0,0.08)',
      xl: '0 8px 16px rgba(0,0,0,0.1)',
    },
    animations: {
      speed: 'fast',
      complexity: 'minimal',
      duration: {
        fast: 100,
        normal: 200,
        slow: 300,
      },
    },
    ux: {
      useEmojis: false,
      useSounds: false,
      hapticFeedback: false,
    },
  },
};

/**
 * Get a theme by its ID
 */
export const getTheme = (themeName: ThemeName): VisualTheme => {
  return VISUAL_THEMES[themeName] || VISUAL_THEMES.playful;
};

/**
 * Get all available themes as an array
 */
export const getAllThemes = (): VisualTheme[] => {
  return Object.values(VISUAL_THEMES);
};

/**
 * Get themes suitable for a specific age group
 */
export const getThemesByAge = (ageGroup: string): VisualTheme[] => {
  return getAllThemes().filter((theme) =>
    theme.suitableForAges.includes(ageGroup)
  );
};

/**
 * Get the default theme for a specific age group and optional component type
 * This provides intelligent theme selection based on age and context
 */
export const getDefaultThemeForAge = (
  ageGroup: string,
  componentType?: string
): ThemeName => {
  // Age-based theme mapping
  const ageThemeMap: Record<string, ThemeName> = {
    '2-3': 'cartoon',
    '4-6': 'cartoon',
    '7-8': 'playful',
    '9-10': 'playful',
    '11-12': 'academic',
    '13-15': 'academic',
    '16-18': 'modern-minimal',
  };

  // Component-specific overrides for younger ages
  if (componentType && ['2-3', '4-6'].includes(ageGroup)) {
    const interactiveComponents = [
      'tap-image',
      'simple-counter',
      'memory-cards',
      'color-matcher',
      'simple-drag-and-drop',
    ];
    if (interactiveComponents.includes(componentType.toLowerCase())) {
      return 'bright-fun';
    }
  }

  return ageThemeMap[ageGroup] || 'playful';
};

/**
 * Get themes by category
 */
export const getThemesByCategory = (
  category: 'playful' | 'educational' | 'professional' | 'creative'
): VisualTheme[] => {
  return getAllThemes().filter((theme) => theme.category === category);
};

/**
 * Check if a theme is suitable for a specific age group
 */
export const isThemeSuitableForAge = (
  themeName: ThemeName,
  ageGroup: string
): boolean => {
  const theme = getTheme(themeName);
  return theme.suitableForAges.includes(ageGroup);
};

