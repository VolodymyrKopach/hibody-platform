/**
 * Visual Theme Types
 * Defines the structure and types for the worksheet theme system
 */

export type ThemeName =
  | 'cartoon'
  | 'playful'
  | 'academic'
  | 'modern-minimal'
  | 'bright-fun'
  | 'nature'
  | 'space'
  | 'ocean'
  | 'retro'
  | 'pastel'
  | 'bold'
  | 'soft-minimal';

export type ThemeCategory = 'playful' | 'educational' | 'professional' | 'creative';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationComplexity = 'minimal' | 'moderate' | 'rich';

export interface VisualTheme {
  id: ThemeName;
  name: string;
  description: string;
  category: ThemeCategory;
  suitableForAges: string[];
  
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
    };
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    lineHeight: number;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  animations: {
    speed: AnimationSpeed;
    complexity: AnimationComplexity;
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
  };
  
  ux: {
    useEmojis: boolean;
    useSounds: boolean;
    hapticFeedback: boolean;
  };
}

export interface ThemeContextValue {
  currentTheme: VisualTheme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

