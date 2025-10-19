'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VisualTheme, ThemeName, ThemeContextValue } from '@/types/themes';
import { VISUAL_THEMES, getTheme } from '@/constants/visual-themes';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
  ageGroup?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'playful',
  ageGroup,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState<VisualTheme>(
    getTheme(defaultTheme)
  );

  // Auto-select appropriate theme based on age group
  useEffect(() => {
    if (ageGroup) {
      const suitableTheme = getSuitableThemeForAge(ageGroup);
      if (suitableTheme) {
        setThemeName(suitableTheme);
        setCurrentTheme(getTheme(suitableTheme));
      }
    }
  }, [ageGroup]);

  // Update theme when themeName changes
  useEffect(() => {
    const theme = getTheme(themeName);
    setCurrentTheme(theme);
    
    // Apply CSS variables to document root
    applyThemeVariables(theme);
  }, [themeName]);

  const handleSetTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
  };

  const value: ThemeContextValue = {
    currentTheme,
    themeName,
    setTheme: handleSetTheme,
    availableThemes: Object.keys(VISUAL_THEMES) as ThemeName[],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to get suitable theme for age group
const getSuitableThemeForAge = (ageGroup: string): ThemeName | null => {
  const ageMap: Record<string, ThemeName> = {
    '2-3': 'cartoon',
    '4-6': 'cartoon',
    '7-8': 'playful',
    '9-10': 'academic',
    '11-12': 'academic',
    '13-15': 'academic',
    '16-18': 'modern-minimal',
  };
  return ageMap[ageGroup] || null;
};

// Apply theme as CSS variables
const applyThemeVariables = (theme: VisualTheme) => {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-text-primary', theme.colors.text.primary);
  root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--theme-success', theme.colors.success);
  root.style.setProperty('--theme-error', theme.colors.error);
  root.style.setProperty('--theme-warning', theme.colors.warning);
  root.style.setProperty('--theme-info', theme.colors.info);
  
  // Typography
  root.style.setProperty('--theme-font-family', getFontFamily(theme.typography.fontFamily));
  root.style.setProperty('--theme-font-size-sm', `${theme.typography.fontSize.small}px`);
  root.style.setProperty('--theme-font-size-md', `${theme.typography.fontSize.medium}px`);
  root.style.setProperty('--theme-font-size-lg', `${theme.typography.fontSize.large}px`);
  root.style.setProperty('--theme-font-size-xl', `${theme.typography.fontSize.xlarge}px`);
  root.style.setProperty('--theme-line-height', theme.typography.lineHeight.toString());
  
  // Spacing
  root.style.setProperty('--theme-spacing-xs', `${theme.spacing.xs}px`);
  root.style.setProperty('--theme-spacing-sm', `${theme.spacing.sm}px`);
  root.style.setProperty('--theme-spacing-md', `${theme.spacing.md}px`);
  root.style.setProperty('--theme-spacing-lg', `${theme.spacing.lg}px`);
  root.style.setProperty('--theme-spacing-xl', `${theme.spacing.xl}px`);
  
  // Border radius
  root.style.setProperty('--theme-radius-sm', `${theme.borderRadius.sm}px`);
  root.style.setProperty('--theme-radius-md', `${theme.borderRadius.md}px`);
  root.style.setProperty('--theme-radius-lg', `${theme.borderRadius.lg}px`);
  root.style.setProperty('--theme-radius-xl', `${theme.borderRadius.xl}px`);
  
  // Shadows
  root.style.setProperty('--theme-shadow-sm', theme.shadows.sm);
  root.style.setProperty('--theme-shadow-md', theme.shadows.md);
  root.style.setProperty('--theme-shadow-lg', theme.shadows.lg);
  root.style.setProperty('--theme-shadow-xl', theme.shadows.xl);
  
  // Animation duration
  root.style.setProperty('--theme-anim-fast', `${theme.animations.duration.fast}ms`);
  root.style.setProperty('--theme-anim-normal', `${theme.animations.duration.normal}ms`);
  root.style.setProperty('--theme-anim-slow', `${theme.animations.duration.slow}ms`);
};

// Map font family names to actual font stacks
const getFontFamily = (family: string): string => {
  const fontMap: Record<string, string> = {
    'nunito': "'Nunito', sans-serif",
    'poppins': "'Poppins', sans-serif",
    'baloo': "'Baloo 2', cursive",
    'comic-neue': "'Comic Neue', cursive",
    'inter': "'Inter', sans-serif",
    'roboto': "'Roboto', sans-serif",
    'open-sans': "'Open Sans', sans-serif",
    'georgia': "'Georgia', serif",
  };
  return fontMap[family] || "'Inter', sans-serif";
};

