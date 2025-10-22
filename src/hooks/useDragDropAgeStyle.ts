/**
 * Hook for applying age-based styles to drag-and-drop components
 * Provides unified styling system specifically for drag-drop interactions
 */

import { useMemo } from 'react';
import { DragDropAgeStyleName, DragDropAgeStyle } from '@/types/drag-drop-styles';
import { getDragDropStyle, getDefaultDragDropStyleForAge, DRAG_DROP_AGE_STYLES } from '@/constants/drag-drop-age-styles';

interface DragDropAgeStyleResult extends DragDropAgeStyle {
  // Helper functions for easy access
  getElementSize: (key: keyof DragDropAgeStyle['elementSize']) => number;
  getTypography: (key: keyof DragDropAgeStyle['typography']) => any;
  getColor: (key: keyof DragDropAgeStyle['colors']) => string;
  getBorder: (key: keyof DragDropAgeStyle['borders']) => any;
  getAnimation: (key: keyof DragDropAgeStyle['animations']) => any;
  getInteraction: (key: keyof DragDropAgeStyle['interaction']) => any;
  getAccessibility: (key: keyof DragDropAgeStyle['accessibility']) => boolean;
}

/**
 * Main hook to get age-based styling for drag-drop components
 * @param ageStyleName - Name of age style (toddler, preschool, etc.)
 * @param defaultStyle - Default style if ageStyleName is not provided
 */
export const useDragDropAgeStyle = (
  ageStyleName?: DragDropAgeStyleName,
  defaultStyle: DragDropAgeStyleName = 'elementary'
): DragDropAgeStyleResult => {
  const ageStyle = useMemo(() => {
    if (ageStyleName && ageStyleName in DRAG_DROP_AGE_STYLES) {
      return getDragDropStyle(ageStyleName);
    }
    return getDragDropStyle(defaultStyle);
  }, [ageStyleName, defaultStyle]);

  // Helper functions
  const getElementSize = (key: keyof DragDropAgeStyle['elementSize']): number => {
    return ageStyle.elementSize[key];
  };

  const getTypography = (key: keyof DragDropAgeStyle['typography']): any => {
    return ageStyle.typography[key];
  };

  const getColor = (key: keyof DragDropAgeStyle['colors']): string => {
    return ageStyle.colors[key];
  };

  const getBorder = (key: keyof DragDropAgeStyle['borders']): any => {
    return ageStyle.borders[key];
  };

  const getAnimation = (key: keyof DragDropAgeStyle['animations']): any => {
    return ageStyle.animations[key];
  };

  const getInteraction = (key: keyof DragDropAgeStyle['interaction']): any => {
    return ageStyle.interaction[key];
  };

  const getAccessibility = (key: keyof DragDropAgeStyle['accessibility']): boolean => {
    return ageStyle.accessibility[key];
  };

  return {
    ...ageStyle,
    getElementSize,
    getTypography,
    getColor,
    getBorder,
    getAnimation,
    getInteraction,
    getAccessibility,
  };
};

/**
 * Hook to get default drag-drop style for a specific age group
 * @param ageGroup - Age group string (e.g., '3-5', '6-7', etc.)
 */
export const useDragDropStyleForAgeGroup = (ageGroup?: string): DragDropAgeStyleResult => {
  const ageStyleName = useMemo((): DragDropAgeStyleName => {
    if (!ageGroup) return 'elementary';

    return getDefaultDragDropStyleForAge(ageGroup);
  }, [ageGroup]);

  return useDragDropAgeStyle(ageStyleName);
};

