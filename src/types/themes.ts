/**
 * Visual Theme Types for Component Library
 * Defines the structure and types for different visual themes
 */

export type ThemeName =
  | 'cartoon'
  | 'playful'
  | 'academic'
  | 'modern-minimal'
  | 'fantasy'
  | 'quest-adventure'
  | 'classic-classroom';

export type TypographyFamily =
  | 'nunito'
  | 'poppins'
  | 'baloo'
  | 'comic-neue'
  | 'inter'
  | 'roboto'
  | 'open-sans'
  | 'georgia';

export type AnimationComplexity = 'none' | 'minimal' | 'moderate' | 'high' | 'very-high';
export type AnimationSpeed = 'instant' | 'fast' | 'normal' | 'slow';

export interface ThemeTypography {
  fontFamily: TypographyFamily;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
  lineHeight: number;
  letterSpacing?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeAnimations {
  complexity: AnimationComplexity;
  speed: AnimationSpeed;
  enableHover: boolean;
  enableTransitions: boolean;
  enableParticles: boolean;
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeIllustrationStyle {
  style: 'realistic' | 'cartoon' | 'flat' | 'abstract' | 'minimal';
  colorfulness: 'monochrome' | 'low' | 'medium' | 'high' | 'vibrant';
  complexity: 'simple' | 'moderate' | 'detailed';
}

export interface VisualTheme {
  id: ThemeName;
  name: string;
  description: string;
  suitableForAges: string[];
  category: 'educational' | 'playful' | 'professional';
  
  typography: ThemeTypography;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  animations: ThemeAnimations;
  shadows: ThemeShadows;
  illustrationStyle: ThemeIllustrationStyle;
  
  // UI-specific settings
  ui: {
    buttonStyle: 'rounded' | 'pill' | 'sharp' | 'soft';
    inputStyle: 'outlined' | 'filled' | 'underlined';
    cardElevation: 'flat' | 'low' | 'medium' | 'high';
    iconStyle: 'outlined' | 'filled' | 'rounded';
  };
  
  // UX preferences
  ux: {
    focusOnContent: boolean;
    useEmojis: boolean;
    useIllustrations: boolean;
    useSounds: boolean;
    feedbackIntensity: 'subtle' | 'moderate' | 'intense';
  };
}

export interface ThemeContextValue {
  currentTheme: VisualTheme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

