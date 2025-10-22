import { useState, useCallback, useEffect } from 'react';
import { PageBackground } from '@/types/sidebar';

interface BackgroundEditorState {
  customColor: string;
  patternBgColor: string;
  patternFgColor: string;
  patternScale: number;
  patternOpacity: number;
  gradientColors: string[];
  gradientDirection: PageBackground['gradient']['direction'];
  imageSize: 'cover' | 'contain' | 'repeat' | 'auto';
  imagePosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageOpacity: number;
  activeTab: 'colors' | 'gradients' | 'patterns' | 'templates';
}

export const useBackgroundEditor = (pageData: any, onUpdate?: (pageId: string, background: PageBackground) => void) => {
  const [state, setState] = useState<BackgroundEditorState>({
    customColor: '#FFFFFF',
    patternBgColor: '#FFFFFF',
    patternFgColor: '#E5E7EB',
    patternScale: 1,
    patternOpacity: 100,
    gradientColors: ['#667eea', '#764ba2'],
    gradientDirection: 'to-right',
    imageSize: 'cover',
    imagePosition: 'center',
    imageOpacity: 100,
    activeTab: 'colors',
  });

  // Update local state when page background changes
  useEffect(() => {
    if (pageData?.background) {
      const bg = pageData.background;
      
      if (bg.color) {
        setState(prev => ({ ...prev, customColor: bg.color }));
      }
      
      if (bg.type === 'pattern' && bg.pattern) {
        setState(prev => ({
          ...prev,
          patternBgColor: bg.pattern.backgroundColor,
          patternFgColor: bg.pattern.patternColor,
          patternScale: bg.pattern.scale || 1,
          patternOpacity: bg.pattern.opacity || 100,
        }));
      }
      
      if (bg.type === 'gradient' && bg.gradient) {
        const colors = bg.gradient.colors || [bg.gradient.from, bg.gradient.to];
        setState(prev => ({
          ...prev,
          gradientColors: colors,
          gradientDirection: bg.gradient.direction,
        }));
      }
      
      if (bg.type === 'image' && bg.image) {
        setState(prev => ({
          ...prev,
          imageSize: bg.image.size,
          imagePosition: bg.image.position,
          imageOpacity: bg.image.opacity || 100,
        }));
      }
    }
  }, [pageData]);

  const applyBackground = useCallback((background: PageBackground) => {
    if (onUpdate && pageData) {
      onUpdate(pageData.id, background);
    }
  }, [pageData, onUpdate]);

  const updateState = useCallback((updates: Partial<BackgroundEditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    ...state,
    applyBackground,
    updateState,
  };
};

