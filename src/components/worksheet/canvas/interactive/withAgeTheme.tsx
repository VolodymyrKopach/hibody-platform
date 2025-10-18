'use client';

import React from 'react';
import { getAgeTheme, AgeTheme } from '@/utils/interactive/ageTheme';

/**
 * HOC that injects age theme into component props
 * @param Component - The component to wrap
 * @returns Wrapped component with age theme
 */
export function withAgeTheme<P extends object>(
  Component: React.ComponentType<P & { ageTheme?: AgeTheme }>
): React.FC<P & { ageGroup?: string }> {
  return function WithAgeThemeComponent(props) {
    const { ageGroup, ...rest } = props as P & { ageGroup?: string };
    
    // Get age theme (fallback to 6-7 if not provided)
    const ageTheme = ageGroup ? getAgeTheme(ageGroup) : undefined;
    
    return <Component {...(rest as P)} ageTheme={ageTheme} />;
  };
}

/**
 * Hook to use age theme in components
 */
export function useAgeTheme(ageGroup?: string): AgeTheme | undefined {
  if (!ageGroup) return undefined;
  return getAgeTheme(ageGroup);
}

