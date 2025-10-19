/**
 * Hook for applying visual theme to components
 * Returns theme object and helper functions for styling
 */

import { useMemo } from 'react';
import { ThemeName, VisualTheme } from '@/types/themes';
import { getTheme, VISUAL_THEMES } from '@/constants/visual-themes';

interface ComponentThemeResult {
  theme: VisualTheme | null;
  colors: VisualTheme['colors'] | null;
  typography: VisualTheme['typography'] | null;
  spacing: VisualTheme['spacing'] | null;
  borderRadius: VisualTheme['borderRadius'] | null;
  shadows: VisualTheme['shadows'] | null;
  animations: VisualTheme['animations'] | null;
  ui: VisualTheme['ui'] | null;
  ux: VisualTheme['ux'] | null;
  
  // Helper functions
  getColor: (key: keyof VisualTheme['colors']) => string;
  getSpacing: (key: keyof VisualTheme['spacing']) => number;
  getBorderRadius: (key: keyof VisualTheme['borderRadius']) => number;
  getShadow: (key: keyof VisualTheme['shadows']) => string;
  getFontSize: (key: keyof VisualTheme['typography']['fontSize']) => number;
  getFontWeight: (key: keyof VisualTheme['typography']['fontWeight']) => number;
  getAnimationDuration: (key: keyof VisualTheme['animations']['duration']) => number;
  
  // Style generators
  getButtonStyles: () => React.CSSProperties;
  getCardStyles: () => React.CSSProperties;
  getInputStyles: () => React.CSSProperties;
  getTextStyles: (size?: 'small' | 'medium' | 'large' | 'xlarge') => React.CSSProperties;
}

export const useComponentTheme = (
  themeName?: ThemeName,
  defaultTheme: ThemeName = 'playful'
): ComponentThemeResult => {
  const theme = useMemo(() => {
    if (themeName) {
      return getTheme(themeName);
    }
    return getTheme(defaultTheme);
  }, [themeName, defaultTheme]);

  // Helper functions
  const getColor = (key: keyof VisualTheme['colors']): string => {
    if (!theme) return '#000000';
    const value = theme.colors[key];
    return typeof value === 'string' ? value : '#000000';
  };

  const getSpacing = (key: keyof VisualTheme['spacing']): number => {
    return theme?.spacing[key] ?? 16;
  };

  const getBorderRadius = (key: keyof VisualTheme['borderRadius']): number => {
    return theme?.borderRadius[key] ?? 8;
  };

  const getShadow = (key: keyof VisualTheme['shadows']): string => {
    return theme?.shadows[key] ?? 'none';
  };

  const getFontSize = (key: keyof VisualTheme['typography']['fontSize']): number => {
    return theme?.typography.fontSize[key] ?? 16;
  };

  const getFontWeight = (key: keyof VisualTheme['typography']['fontWeight']): number => {
    return theme?.typography.fontWeight[key] ?? 400;
  };

  const getAnimationDuration = (key: keyof VisualTheme['animations']['duration']): number => {
    return theme?.animations.duration[key] ?? 300;
  };

  // Style generators
  const getButtonStyles = (): React.CSSProperties => {
    if (!theme) return {};

    const baseStyles: React.CSSProperties = {
      backgroundColor: theme.colors.primary,
      color: '#FFFFFF',
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.fontSize.medium}px`,
      fontWeight: theme.typography.fontWeight.medium,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      border: 'none',
      cursor: 'pointer',
      transition: `all ${theme.animations.duration.normal}ms`,
    };

    switch (theme.ui.buttonStyle) {
      case 'pill':
        return { ...baseStyles, borderRadius: theme.borderRadius.full };
      case 'rounded':
        return { ...baseStyles, borderRadius: theme.borderRadius.md };
      case 'sharp':
        return { ...baseStyles, borderRadius: 0 };
      case 'soft':
        return { ...baseStyles, borderRadius: theme.borderRadius.sm };
      default:
        return baseStyles;
    }
  };

  const getCardStyles = (): React.CSSProperties => {
    if (!theme) return {};

    const baseStyles: React.CSSProperties = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      transition: `all ${theme.animations.duration.normal}ms`,
    };

    switch (theme.ui.cardElevation) {
      case 'flat':
        return { ...baseStyles, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.1)' };
      case 'low':
        return { ...baseStyles, boxShadow: theme.shadows.sm };
      case 'medium':
        return { ...baseStyles, boxShadow: theme.shadows.md };
      case 'high':
        return { ...baseStyles, boxShadow: theme.shadows.lg };
      default:
        return baseStyles;
    }
  };

  const getInputStyles = (): React.CSSProperties => {
    if (!theme) return {};

    const baseStyles: React.CSSProperties = {
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.fontSize.medium}px`,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      borderRadius: theme.borderRadius.sm,
      transition: `all ${theme.animations.duration.fast}ms`,
    };

    switch (theme.ui.inputStyle) {
      case 'outlined':
        return {
          ...baseStyles,
          border: `2px solid ${theme.colors.primary}`,
          backgroundColor: 'transparent',
        };
      case 'filled':
        return {
          ...baseStyles,
          border: 'none',
          backgroundColor: theme.colors.background,
        };
      case 'underlined':
        return {
          ...baseStyles,
          border: 'none',
          borderBottom: `2px solid ${theme.colors.primary}`,
          borderRadius: 0,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = (size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'): React.CSSProperties => {
    if (!theme) return {};

    return {
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.fontSize[size]}px`,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight,
      color: theme.colors.text.primary,
      letterSpacing: theme.typography.letterSpacing ? `${theme.typography.letterSpacing}em` : 'normal',
    };
  };

  return {
    theme,
    colors: theme?.colors ?? null,
    typography: theme?.typography ?? null,
    spacing: theme?.spacing ?? null,
    borderRadius: theme?.borderRadius ?? null,
    shadows: theme?.shadows ?? null,
    animations: theme?.animations ?? null,
    ui: theme?.ui ?? null,
    ux: theme?.ux ?? null,
    
    // Helper functions
    getColor,
    getSpacing,
    getBorderRadius,
    getShadow,
    getFontSize,
    getFontWeight,
    getAnimationDuration,
    
    // Style generators
    getButtonStyles,
    getCardStyles,
    getInputStyles,
    getTextStyles,
  };
};

/**
 * Hook to get theme for a specific age group
 */
export const useAgeGroupTheme = (
  ageGroup: string,
  preferredCategory?: 'educational' | 'playful' | 'professional'
): VisualTheme | null => {
  return useMemo(() => {
    const themes = Object.values(VISUAL_THEMES).filter(
      (theme) => theme.suitableForAges.includes(ageGroup)
    );

    if (themes.length === 0) return null;

    if (preferredCategory) {
      const categoryTheme = themes.find((theme) => theme.category === preferredCategory);
      if (categoryTheme) return categoryTheme;
    }

    // Return first matching theme
    return themes[0];
  }, [ageGroup, preferredCategory]);
};

/**
 * Hook to check if a theme supports certain features
 */
export const useThemeFeatures = (themeName?: ThemeName) => {
  const theme = themeName ? getTheme(themeName) : null;

  return useMemo(() => {
    if (!theme) {
      return {
        supportsAnimations: false,
        supportsParticles: false,
        supportsEmojis: false,
        supportsIllustrations: false,
        supportsSounds: false,
        animationComplexity: 'none' as const,
        feedbackIntensity: 'subtle' as const,
      };
    }

    return {
      supportsAnimations: theme.animations.complexity !== 'none',
      supportsParticles: theme.animations.enableParticles,
      supportsEmojis: theme.ux.useEmojis,
      supportsIllustrations: theme.ux.useIllustrations,
      supportsSounds: theme.ux.useSounds,
      animationComplexity: theme.animations.complexity,
      feedbackIntensity: theme.ux.feedbackIntensity,
    };
  }, [theme]);
};

