/**
 * Hook for applying age-based styles to interactive components
 * Provides unified styling system across all interactive elements
 */

import { useMemo } from 'react';
import { AgeStyleName, InteractiveAgeStyle } from '@/types/interactive-age-styles';
import { getAgeStyle, INTERACTIVE_AGE_STYLES } from '@/constants/interactive-age-styles';

interface AgeStyleResult extends InteractiveAgeStyle {
  // Helper functions for easy access
  getSize: (key: keyof InteractiveAgeStyle['sizes']) => number;
  getColor: (key: keyof InteractiveAgeStyle['colors']) => string;
  getTypography: (key: keyof InteractiveAgeStyle['typography']) => any;
  getBorder: (key: keyof InteractiveAgeStyle['borders']) => any;
}

/**
 * Main hook to get age-based styling for interactive components
 * @param ageStyleName - Name of age style (toddler, preschool, etc.)
 * @param defaultStyle - Default style if ageStyleName is not provided
 */
export const useAgeStyle = (
  ageStyleName?: AgeStyleName,
  defaultStyle: AgeStyleName = 'elementary'
): AgeStyleResult => {
  const ageStyle = useMemo(() => {
    if (ageStyleName && ageStyleName in INTERACTIVE_AGE_STYLES) {
      return getAgeStyle(ageStyleName);
    }
    return getAgeStyle(defaultStyle);
  }, [ageStyleName, defaultStyle]);

  // Helper functions
  const getSize = (key: keyof InteractiveAgeStyle['sizes']): number => {
    return ageStyle.sizes[key];
  };

  const getColor = (key: keyof InteractiveAgeStyle['colors']): string => {
    return ageStyle.colors[key];
  };

  const getTypography = (key: keyof InteractiveAgeStyle['typography']): any => {
    return ageStyle.typography[key];
  };

  const getBorder = (key: keyof InteractiveAgeStyle['borders']): any => {
    return ageStyle.borders[key];
  };

  return {
    ...ageStyle,
    getSize,
    getColor,
    getTypography,
    getBorder,
  };
};

/**
 * Hook to get default age style for a specific age group
 * @param ageGroup - Age group string (e.g., '3-5', '6-7', etc.)
 */
export const useAgeStyleForAgeGroup = (ageGroup?: string): AgeStyleResult => {
  const ageStyleName = useMemo((): AgeStyleName => {
    if (!ageGroup) return 'elementary';

    // Map age groups to age styles
    const ageGroupMap: Record<string, AgeStyleName> = {
      '2-3': 'toddler',
      '3-5': 'toddler',
      '4-6': 'preschool',
      '6-7': 'preschool',
      '7-8': 'elementary',
      '8-9': 'elementary',
      '9-10': 'middle',
      '10-11': 'middle',
      '10-12': 'middle',
      '11-13': 'middle',
      '12-13': 'teen',
      '14-15': 'teen',
      '16-18': 'teen',
    };

    return ageGroupMap[ageGroup] || 'elementary';
  }, [ageGroup]);

  return useAgeStyle(ageStyleName);
};

