'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ThemeName, VisualTheme } from '@/types/themes';
import { 
  getTheme, 
  getDefaultThemeForAge, 
  isThemeSuitableForAge 
} from '@/constants/visual-themes';

interface ComponentThemeContextValue {
  // Global theme settings
  defaultTheme: ThemeName | null;
  ageGroup: string | null;
  
  // Theme management
  setDefaultTheme: (theme: ThemeName) => void;
  setAgeGroup: (ageGroup: string) => void;
  
  // Component-specific themes
  componentThemes: Map<string, ThemeName>;
  setComponentTheme: (componentId: string, theme: ThemeName) => void;
  getComponentTheme: (componentId: string) => VisualTheme | null;
  removeComponentTheme: (componentId: string) => void;
  clearAllComponentThemes: () => void;
  
  // Utility functions
  getEffectiveTheme: (componentId: string, componentTheme?: ThemeName) => VisualTheme | null;
  isThemeValid: (theme: ThemeName) => boolean;
}

const ComponentThemeContext = createContext<ComponentThemeContextValue | null>(null);

interface ComponentThemeProviderProps {
  children: React.ReactNode;
  initialAgeGroup?: string;
  initialDefaultTheme?: ThemeName;
}

export const ComponentThemeProvider: React.FC<ComponentThemeProviderProps> = ({
  children,
  initialAgeGroup,
  initialDefaultTheme,
}) => {
  const [defaultTheme, setDefaultThemeState] = useState<ThemeName | null>(
    initialDefaultTheme || null
  );
  const [ageGroup, setAgeGroupState] = useState<string | null>(initialAgeGroup || null);
  const [componentThemes, setComponentThemes] = useState<Map<string, ThemeName>>(new Map());

  // Update default theme when age group changes
  useEffect(() => {
    if (ageGroup && !defaultTheme) {
      const recommendedTheme = getDefaultThemeForAge(ageGroup);
      if (recommendedTheme) {
        setDefaultThemeState(recommendedTheme.id);
      }
    }
  }, [ageGroup, defaultTheme]);

  const setDefaultTheme = useCallback((theme: ThemeName) => {
    setDefaultThemeState(theme);
  }, []);

  const setAgeGroup = useCallback((newAgeGroup: string) => {
    setAgeGroupState(newAgeGroup);
    
    // Auto-update default theme if not set
    if (!defaultTheme) {
      const recommendedTheme = getDefaultThemeForAge(newAgeGroup);
      if (recommendedTheme) {
        setDefaultThemeState(recommendedTheme.id);
      }
    }
  }, [defaultTheme]);

  const setComponentTheme = useCallback((componentId: string, theme: ThemeName) => {
    setComponentThemes(prev => {
      const newMap = new Map(prev);
      newMap.set(componentId, theme);
      return newMap;
    });
  }, []);

  const getComponentTheme = useCallback((componentId: string): VisualTheme | null => {
    const themeName = componentThemes.get(componentId);
    if (!themeName) return null;
    
    try {
      return getTheme(themeName);
    } catch {
      return null;
    }
  }, [componentThemes]);

  const removeComponentTheme = useCallback((componentId: string) => {
    setComponentThemes(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentId);
      return newMap;
    });
  }, []);

  const clearAllComponentThemes = useCallback(() => {
    setComponentThemes(new Map());
  }, []);

  const getEffectiveTheme = useCallback(
    (componentId: string, componentTheme?: ThemeName): VisualTheme | null => {
      // Priority: component-specific theme > passed theme > default theme
      const effectiveThemeName = 
        componentTheme || 
        componentThemes.get(componentId) || 
        defaultTheme;

      if (!effectiveThemeName) return null;

      try {
        return getTheme(effectiveThemeName);
      } catch {
        return null;
      }
    },
    [componentThemes, defaultTheme]
  );

  const isThemeValid = useCallback(
    (theme: ThemeName): boolean => {
      if (!ageGroup) return true; // If no age group set, all themes valid
      
      return isThemeSuitableForAge(theme, ageGroup);
    },
    [ageGroup]
  );

  const value: ComponentThemeContextValue = {
    defaultTheme,
    ageGroup,
    setDefaultTheme,
    setAgeGroup,
    componentThemes,
    setComponentTheme,
    getComponentTheme,
    removeComponentTheme,
    clearAllComponentThemes,
    getEffectiveTheme,
    isThemeValid,
  };

  return (
    <ComponentThemeContext.Provider value={value}>
      {children}
    </ComponentThemeContext.Provider>
  );
};

/**
 * Hook to access component theme context
 */
export const useComponentThemeContext = () => {
  const context = useContext(ComponentThemeContext);
  
  if (!context) {
    throw new Error(
      'useComponentThemeContext must be used within a ComponentThemeProvider'
    );
  }
  
  return context;
};

/**
 * Hook to access theme context (optional - returns null if not in provider)
 */
export const useOptionalComponentThemeContext = () => {
  return useContext(ComponentThemeContext);
};

/**
 * Hook to get theme for a specific component
 * Combines context with component-specific theme
 */
export const useComponentThemeForId = (
  componentId: string,
  componentTheme?: ThemeName
): VisualTheme | null => {
  const context = useOptionalComponentThemeContext();
  
  if (!context) {
    // Fallback: just use the component theme if provided
    if (componentTheme) {
      try {
        return getTheme(componentTheme);
      } catch {
        return null;
      }
    }
    return null;
  }
  
  return context.getEffectiveTheme(componentId, componentTheme);
};

