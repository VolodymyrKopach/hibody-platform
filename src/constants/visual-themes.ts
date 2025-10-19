/**
 * Visual Themes Configuration
 * Defines all available visual themes for the component library
 */

import { VisualTheme, ThemeName } from '@/types/themes';

// === CARTOON THEME (3-6 years) ===
export const CARTOON_THEME: VisualTheme = {
  id: 'cartoon',
  name: 'Cartoon',
  description: 'Colorful, playful theme with cartoon-style illustrations and large elements',
  suitableForAges: ['2-3', '4-6'],
  category: 'playful',
  
  typography: {
    fontFamily: 'nunito',
    fontSize: {
      small: 18,
      medium: 24,
      large: 32,
      xlarge: 48,
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 800,
    },
    lineHeight: 1.6,
  },
  
  colors: {
    primary: '#FF6B9D',
    secondary: '#FEC84E',
    accent: '#5BC0EB',
    background: '#FFF5F7',
    surface: '#FFFFFF',
    text: {
      primary: '#2D3748',
      secondary: '#718096',
      disabled: '#CBD5E0',
    },
    success: '#68D391',
    error: '#FC8181',
    warning: '#F6AD55',
    info: '#63B3ED',
  },
  
  spacing: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 12,
    md: 20,
    lg: 30,
    xl: 40,
    full: 9999,
  },
  
  animations: {
    complexity: 'very-high',
    speed: 'normal',
    enableHover: true,
    enableTransitions: true,
    enableParticles: true,
    duration: {
      fast: 200,
      normal: 400,
      slow: 600,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 8px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },
  
  illustrationStyle: {
    style: 'cartoon',
    colorfulness: 'vibrant',
    complexity: 'simple',
  },
  
  ui: {
    buttonStyle: 'pill',
    inputStyle: 'filled',
    cardElevation: 'high',
    iconStyle: 'filled',
  },
  
  ux: {
    focusOnContent: false,
    useEmojis: true,
    useIllustrations: true,
    useSounds: true,
    feedbackIntensity: 'intense',
  },
};

// === PLAYFUL THEME (6-8 years) ===
export const PLAYFUL_THEME: VisualTheme = {
  id: 'playful',
  name: 'Playful',
  description: 'Engaging theme with game elements and interactive visuals',
  suitableForAges: ['4-6', '7-8'],
  category: 'playful',
  
  typography: {
    fontFamily: 'baloo',
    fontSize: {
      small: 16,
      medium: 20,
      large: 28,
      xlarge: 40,
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 700,
    },
    lineHeight: 1.5,
  },
  
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#F7FAFC',
    surface: '#FFFFFF',
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      disabled: '#A0AEC0',
    },
    success: '#48BB78',
    error: '#F56565',
    warning: '#ED8936',
    info: '#4299E1',
  },
  
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
    xxl: 48,
  },
  
  borderRadius: {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  
  animations: {
    complexity: 'high',
    speed: 'normal',
    enableHover: true,
    enableTransitions: true,
    enableParticles: true,
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 20px rgba(0, 0, 0, 0.18)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.2)',
  },
  
  illustrationStyle: {
    style: 'cartoon',
    colorfulness: 'high',
    complexity: 'moderate',
  },
  
  ui: {
    buttonStyle: 'rounded',
    inputStyle: 'outlined',
    cardElevation: 'medium',
    iconStyle: 'rounded',
  },
  
  ux: {
    focusOnContent: false,
    useEmojis: true,
    useIllustrations: true,
    useSounds: true,
    feedbackIntensity: 'moderate',
  },
};

// === ACADEMIC THEME (9-12, 13+ years) ===
export const ACADEMIC_THEME: VisualTheme = {
  id: 'academic',
  name: 'Academic',
  description: 'Clean, structured theme focused on content and readability',
  suitableForAges: ['9-10', '11-12', '13-15'],
  category: 'educational',
  
  typography: {
    fontFamily: 'inter',
    fontSize: {
      small: 14,
      medium: 16,
      large: 22,
      xlarge: 32,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: 1.7,
  },
  
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  animations: {
    complexity: 'moderate',
    speed: 'fast',
    enableHover: true,
    enableTransitions: true,
    enableParticles: false,
    duration: {
      fast: 100,
      normal: 200,
      slow: 300,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  
  illustrationStyle: {
    style: 'flat',
    colorfulness: 'medium',
    complexity: 'moderate',
  },
  
  ui: {
    buttonStyle: 'soft',
    inputStyle: 'outlined',
    cardElevation: 'low',
    iconStyle: 'outlined',
  },
  
  ux: {
    focusOnContent: true,
    useEmojis: false,
    useIllustrations: false,
    useSounds: false,
    feedbackIntensity: 'moderate',
  },
};

// === MODERN MINIMAL THEME (13+ years) ===
export const MODERN_MINIMAL_THEME: VisualTheme = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'Sleek, minimalist design with focus on typography and whitespace',
  suitableForAges: ['13-15', '16-18'],
  category: 'professional',
  
  typography: {
    fontFamily: 'inter',
    fontSize: {
      small: 14,
      medium: 16,
      large: 20,
      xlarge: 28,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: 1.75,
    letterSpacing: -0.02,
  },
  
  colors: {
    primary: '#0066FF',
    secondary: '#1A1A1A',
    accent: '#00FF88',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: {
      primary: '#0A0A0A',
      secondary: '#737373',
      disabled: '#D4D4D4',
    },
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0066FF',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  
  animations: {
    complexity: 'minimal',
    speed: 'fast',
    enableHover: true,
    enableTransitions: true,
    enableParticles: false,
    duration: {
      fast: 100,
      normal: 150,
      slow: 200,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  
  illustrationStyle: {
    style: 'minimal',
    colorfulness: 'low',
    complexity: 'simple',
  },
  
  ui: {
    buttonStyle: 'soft',
    inputStyle: 'underlined',
    cardElevation: 'flat',
    iconStyle: 'outlined',
  },
  
  ux: {
    focusOnContent: true,
    useEmojis: false,
    useIllustrations: false,
    useSounds: false,
    feedbackIntensity: 'subtle',
  },
};

// === FANTASY THEME (4-8 years) ===
export const FANTASY_THEME: VisualTheme = {
  id: 'fantasy',
  name: 'Fantasy',
  description: 'Magical theme with nature, space, and fairy tale elements',
  suitableForAges: ['4-6', '7-8'],
  category: 'playful',
  
  typography: {
    fontFamily: 'poppins',
    fontSize: {
      small: 16,
      medium: 22,
      large: 30,
      xlarge: 44,
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 700,
    },
    lineHeight: 1.6,
  },
  
  colors: {
    primary: '#9333EA',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#F3E8FF',
    surface: '#FFFFFF',
    text: {
      primary: '#1E1B4B',
      secondary: '#6B21A8',
      disabled: '#D8B4FE',
    },
    success: '#10B981',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#3B82F6',
  },
  
  spacing: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 28,
    xl: 42,
    xxl: 56,
  },
  
  borderRadius: {
    none: 0,
    sm: 10,
    md: 18,
    lg: 28,
    xl: 38,
    full: 9999,
  },
  
  animations: {
    complexity: 'very-high',
    speed: 'slow',
    enableHover: true,
    enableTransitions: true,
    enableParticles: true,
    duration: {
      fast: 250,
      normal: 500,
      slow: 800,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 2px 8px rgba(147, 51, 234, 0.15)',
    md: '0 8px 16px rgba(147, 51, 234, 0.2)',
    lg: '0 12px 24px rgba(147, 51, 234, 0.25)',
    xl: '0 20px 40px rgba(147, 51, 234, 0.3)',
  },
  
  illustrationStyle: {
    style: 'cartoon',
    colorfulness: 'vibrant',
    complexity: 'detailed',
  },
  
  ui: {
    buttonStyle: 'rounded',
    inputStyle: 'filled',
    cardElevation: 'high',
    iconStyle: 'filled',
  },
  
  ux: {
    focusOnContent: false,
    useEmojis: true,
    useIllustrations: true,
    useSounds: true,
    feedbackIntensity: 'intense',
  },
};

// === QUEST/ADVENTURE THEME (7-12 years) ===
export const QUEST_ADVENTURE_THEME: VisualTheme = {
  id: 'quest-adventure',
  name: 'Quest & Adventure',
  description: 'Game-inspired theme with progress bars, levels, and achievements',
  suitableForAges: ['7-8', '9-10', '11-12'],
  category: 'playful',
  
  typography: {
    fontFamily: 'roboto',
    fontSize: {
      small: 15,
      medium: 18,
      large: 26,
      xlarge: 38,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: 1.6,
  },
  
  colors: {
    primary: '#EA580C',
    secondary: '#16A34A',
    accent: '#FACC15',
    background: '#FFFBEB',
    surface: '#FFFFFF',
    text: {
      primary: '#292524',
      secondary: '#78716C',
      disabled: '#D6D3D1',
    },
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0EA5E9',
  },
  
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
    xxl: 48,
  },
  
  borderRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  
  animations: {
    complexity: 'high',
    speed: 'normal',
    enableHover: true,
    enableTransitions: true,
    enableParticles: true,
    duration: {
      fast: 150,
      normal: 350,
      slow: 550,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 2px 4px rgba(234, 88, 12, 0.1)',
    md: '0 6px 12px rgba(234, 88, 12, 0.15)',
    lg: '0 10px 20px rgba(234, 88, 12, 0.2)',
    xl: '0 16px 32px rgba(234, 88, 12, 0.25)',
  },
  
  illustrationStyle: {
    style: 'flat',
    colorfulness: 'high',
    complexity: 'moderate',
  },
  
  ui: {
    buttonStyle: 'rounded',
    inputStyle: 'outlined',
    cardElevation: 'medium',
    iconStyle: 'filled',
  },
  
  ux: {
    focusOnContent: false,
    useEmojis: true,
    useIllustrations: true,
    useSounds: true,
    feedbackIntensity: 'moderate',
  },
};

// === CLASSIC CLASSROOM THEME (6-10 years) ===
export const CLASSIC_CLASSROOM_THEME: VisualTheme = {
  id: 'classic-classroom',
  name: 'Classic Classroom',
  description: 'Traditional educational theme inspired by notebooks and chalkboards',
  suitableForAges: ['4-6', '7-8', '9-10'],
  category: 'educational',
  
  typography: {
    fontFamily: 'comic-neue',
    fontSize: {
      small: 15,
      medium: 19,
      large: 26,
      xlarge: 36,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: 1.65,
  },
  
  colors: {
    primary: '#1E40AF',
    secondary: '#DC2626',
    accent: '#16A34A',
    background: '#FFFEF0',
    surface: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#1E40AF',
  },
  
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 22,
    xl: 32,
    xxl: 44,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  animations: {
    complexity: 'moderate',
    speed: 'normal',
    enableHover: true,
    enableTransitions: true,
    enableParticles: false,
    duration: {
      fast: 150,
      normal: 300,
      slow: 450,
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
  },
  
  illustrationStyle: {
    style: 'realistic',
    colorfulness: 'medium',
    complexity: 'moderate',
  },
  
  ui: {
    buttonStyle: 'soft',
    inputStyle: 'outlined',
    cardElevation: 'low',
    iconStyle: 'outlined',
  },
  
  ux: {
    focusOnContent: true,
    useEmojis: false,
    useIllustrations: true,
    useSounds: false,
    feedbackIntensity: 'moderate',
  },
};

// === THEME REGISTRY ===
export const VISUAL_THEMES: Record<ThemeName, VisualTheme> = {
  'cartoon': CARTOON_THEME,
  'playful': PLAYFUL_THEME,
  'academic': ACADEMIC_THEME,
  'modern-minimal': MODERN_MINIMAL_THEME,
  'fantasy': FANTASY_THEME,
  'quest-adventure': QUEST_ADVENTURE_THEME,
  'classic-classroom': CLASSIC_CLASSROOM_THEME,
};

// === UTILITY FUNCTIONS ===
export const getTheme = (themeName: ThemeName): VisualTheme => {
  return VISUAL_THEMES[themeName];
};

export const getAllThemes = (): VisualTheme[] => {
  return Object.values(VISUAL_THEMES);
};

/**
 * Get themes suitable for a specific age group
 * Supports multiple formats: '4-6', '4-6 years', '4-6 years old'
 */
export const getThemesByAge = (ageGroup: string): VisualTheme[] => {
  if (!ageGroup) return getAllThemes();
  
  // Normalize age group format - extract just the numbers and dash
  const normalizedAge = ageGroup.match(/\d+-\d+/)?.[0] || ageGroup;
  
  return getAllThemes().filter(theme => 
    theme.suitableForAges.some(age => {
      // Direct match
      if (age === normalizedAge) return true;
      
      // Try to match with different formats
      const normalizedThemeAge = age.match(/\d+-\d+/)?.[0] || age;
      return normalizedThemeAge === normalizedAge;
    })
  );
};

export const getThemesByCategory = (category: 'educational' | 'playful' | 'professional'): VisualTheme[] => {
  return getAllThemes().filter(theme => theme.category === category);
};

/**
 * Get default theme for a specific age group
 * Returns most suitable theme based on age and category preference
 */
export const getDefaultThemeForAge = (
  ageGroup: string,
  preferCategory?: 'educational' | 'playful' | 'professional'
): VisualTheme | null => {
  const themesForAge = getThemesByAge(ageGroup);
  
  if (themesForAge.length === 0) return null;
  
  // If category preference specified, try to find matching theme
  if (preferCategory) {
    const categoryTheme = themesForAge.find(theme => theme.category === preferCategory);
    if (categoryTheme) return categoryTheme;
  }
  
  // Default priority: playful > educational > professional
  const playfulTheme = themesForAge.find(theme => theme.category === 'playful');
  if (playfulTheme) return playfulTheme;
  
  const educationalTheme = themesForAge.find(theme => theme.category === 'educational');
  if (educationalTheme) return educationalTheme;
  
  // Return first available
  return themesForAge[0];
};

/**
 * Get theme recommendations based on age and component type
 */
export const getThemeRecommendations = (
  ageGroup: string,
  componentType?: string
): VisualTheme[] => {
  const themesForAge = getThemesByAge(ageGroup);
  
  if (!componentType) return themesForAge;
  
  // Recommend based on component type
  const isInteractive = componentType.includes('interactive') || 
                        componentType.includes('tap') || 
                        componentType.includes('drag') ||
                        componentType.includes('game');
  
  if (isInteractive) {
    // Prefer playful themes for interactive components
    return [
      ...themesForAge.filter(t => t.category === 'playful'),
      ...themesForAge.filter(t => t.category !== 'playful'),
    ];
  }
  
  // For regular components, prefer educational themes
  return [
    ...themesForAge.filter(t => t.category === 'educational'),
    ...themesForAge.filter(t => t.category !== 'educational'),
  ];
};

/**
 * Check if a theme is suitable for an age group
 */
export const isThemeSuitableForAge = (themeName: ThemeName, ageGroup: string): boolean => {
  const theme = getTheme(themeName);
  if (!theme || !ageGroup) return false;
  
  const normalizedAge = ageGroup.match(/\d+-\d+/)?.[0] || ageGroup;
  
  return theme.suitableForAges.some(age => {
    const normalizedThemeAge = age.match(/\d+-\d+/)?.[0] || age;
    return normalizedThemeAge === normalizedAge;
  });
};

