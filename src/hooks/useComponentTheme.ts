/**
 * useComponentTheme Hook
 * A hook to get the theme object for a component
 */

import { useMemo } from 'react';
import { getTheme } from '@/constants/visual-themes';
import { ThemeName, VisualTheme } from '@/types/themes';

/**
 * Hook to get component theme based on theme name
 * If no theme name is provided, returns the default 'playful' theme
 * 
 * @param themeName - Optional theme name to apply
 * @returns VisualTheme object with all theme properties
 * 
 * @example
 * ```tsx
 * const componentTheme = useComponentTheme('cartoon');
 * // Use theme properties
 * const fontSize = componentTheme.typography.fontSize.medium;
 * const primaryColor = componentTheme.colors.primary;
 * ```
 */
export const useComponentTheme = (themeName?: ThemeName): VisualTheme => {
  const theme = useMemo(() => {
    return getTheme(themeName || 'playful');
  }, [themeName]);

  return theme;
};

