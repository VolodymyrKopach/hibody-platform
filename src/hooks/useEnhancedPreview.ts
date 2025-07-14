import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  previewGenerationService, 
  EnhancedPreviewData, 
  PreviewSlide,
  PreviewElement
} from '@/services/generation/PreviewGenerationService';
import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Types for enhanced preview state ===
interface EnhancedPreviewState {
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  data: EnhancedPreviewData | null;
  currentSlideIndex: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isPlaying: boolean;
  playbackSpeed: number;
  totalProgress: number;
  settings: {
    autoPlay: boolean;
    showAnimations: boolean;
    slideCount: number;
    aspectRatio: string;
  };
}

interface UseEnhancedPreviewReturn {
  // State
  state: EnhancedPreviewState;
  
  // Current slide data
  currentSlide: PreviewSlide | null;
  hasSlides: boolean;
  canNavigateNext: boolean;
  canNavigatePrev: boolean;
  
  // Actions
  generatePreview: (ageGroupConfig: AgeGroupConfig, formValues: FormValues) => Promise<void>;
  navigateToSlide: (index: number) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  setDeviceType: (device: 'desktop' | 'tablet' | 'mobile') => void;
  togglePlayback: () => void;
  restartPreview: () => void;
  updateSettings: (settings: Partial<EnhancedPreviewState['settings']>) => void;
  handleElementClick: (elementId: string, element: PreviewElement) => void;
  clearError: () => void;
  reset: () => void;
}

// === SOLID: SRP - Initial state ===
const initialState: EnhancedPreviewState = {
  isLoading: false,
  isGenerating: false,
  error: null,
  data: null,
  currentSlideIndex: 0,
  deviceType: 'desktop',
  isPlaying: true,
  playbackSpeed: 1,
  totalProgress: 0,
  settings: {
    autoPlay: true,
    showAnimations: true,
    slideCount: 3,
    aspectRatio: '16/9'
  }
};

// === SOLID: SRP - Main hook ===
export function useEnhancedPreview(): UseEnhancedPreviewReturn {
  const { t } = useTranslation(['generation', 'common']);
  const [state, setState] = useState<EnhancedPreviewState>(initialState);

  // === SOLID: SRP - Computed properties ===
  const currentSlide = useMemo(() => {
    return state.data?.slides[state.currentSlideIndex] || null;
  }, [state.data?.slides, state.currentSlideIndex]);

  const hasSlides = useMemo(() => {
    return (state.data?.slides?.length || 0) > 0;
  }, [state.data?.slides]);

  const canNavigateNext = useMemo(() => {
    return state.data ? state.currentSlideIndex < state.data.slides.length - 1 : false;
  }, [state.data, state.currentSlideIndex]);

  const canNavigatePrev = useMemo(() => {
    return state.currentSlideIndex > 0;
  }, [state.currentSlideIndex]);

  // === SOLID: SRP - Progress calculation ===
  useEffect(() => {
    if (state.data?.slides.length) {
      const progress = ((state.currentSlideIndex + 1) / state.data.slides.length) * 100;
      setState(prev => ({
        ...prev,
        totalProgress: Math.round(progress)
      }));
    }
  }, [state.currentSlideIndex, state.data?.slides.length]);

  // === SOLID: SRP - Generate preview ===
  const generatePreview = useCallback(async (
    ageGroupConfig: AgeGroupConfig,
    formValues: FormValues
  ) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      isLoading: true,
      error: null
    }));

    try {
      console.log('🎯 HOOK: Generating enhanced preview');
      
      const previewData = await previewGenerationService.generateEnhancedPreview(
        ageGroupConfig,
        formValues,
        {
          slideCount: state.settings.slideCount,
          includeInteractiveElements: true,
          deviceType: state.deviceType
        }
      );

      console.log('✅ HOOK: Enhanced preview generated successfully');
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isLoading: false,
        data: previewData,
        currentSlideIndex: 0,
        totalProgress: previewData.slides.length > 0 ? 
          Math.round(100 / previewData.slides.length) : 0,
        error: null
      }));

    } catch (error) {
      console.error('❌ HOOK: Error generating preview:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 
        t('generation:errors.generatePreview', 'Помилка генерації превью');

      setState(prev => ({
        ...prev,
        isGenerating: false,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [state.settings.slideCount, state.deviceType, t]);

  // === SOLID: SRP - Navigation actions ===
  const navigateToSlide = useCallback((index: number) => {
    if (state.data && index >= 0 && index < state.data.slides.length) {
      setState(prev => ({
        ...prev,
        currentSlideIndex: index
      }));
    }
  }, [state.data]);

  const navigateNext = useCallback(() => {
    if (canNavigateNext) {
      setState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex + 1
      }));
    }
  }, [canNavigateNext]);

  const navigatePrev = useCallback(() => {
    if (canNavigatePrev) {
      setState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex - 1
      }));
    }
  }, [canNavigatePrev]);

  // === SOLID: SRP - Device type change ===
  const setDeviceType = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({
      ...prev,
      deviceType: device
    }));
  }, []);

  // === SOLID: SRP - Playback control ===
  const togglePlayback = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  // === SOLID: SRP - Restart preview ===
  const restartPreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSlideIndex: 0,
      isPlaying: prev.settings.autoPlay,
      totalProgress: (prev.data?.slides?.length || 0) > 0 ? 
        Math.round(100 / (prev.data?.slides?.length || 1)) : 0
    }));
  }, []);

  // === SOLID: SRP - Update settings ===
  const updateSettings = useCallback((newSettings: Partial<EnhancedPreviewState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
  }, []);

  // === SOLID: SRP - Handle element interaction ===
  const handleElementClick = useCallback((elementId: string, element: PreviewElement) => {
    console.log('🎯 HOOK: Element clicked:', elementId, element.type);
    
    // Handle different element types
    switch (element.type) {
      case 'interactive':
        // Could trigger special actions, sound effects, etc.
        console.log('Interactive element clicked:', element.content);
        break;
      case 'image':
        // Could open modal, zoom, etc.
        console.log('Image element clicked:', element.content);
        break;
      default:
        console.log('Element clicked:', element.content);
    }
  }, []);

  // === SOLID: SRP - Error management ===
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // === SOLID: SRP - Reset state ===
  const reset = useCallback(() => {
    setState({
      ...initialState,
      settings: state.settings // Preserve settings
    });
  }, [state.settings]);

  // === SOLID: SRP - Auto-advance slides (optional feature) ===
  useEffect(() => {
    if (state.isPlaying && currentSlide && state.settings.autoPlay) {
      const timer = setTimeout(() => {
        if (canNavigateNext) {
          navigateNext();
        } else {
          // Auto-restart when reaching the end
          restartPreview();
        }
      }, (currentSlide.estimatedDuration * 1000) / state.playbackSpeed);

      return () => clearTimeout(timer);
    }
  }, [
    state.isPlaying, 
    currentSlide, 
    state.settings.autoPlay, 
    state.playbackSpeed,
    canNavigateNext,
    navigateNext,
    restartPreview
  ]);

  return {
    // State
    state,
    
    // Current slide data
    currentSlide,
    hasSlides,
    canNavigateNext,
    canNavigatePrev,
    
    // Actions
    generatePreview,
    navigateToSlide,
    navigateNext,
    navigatePrev,
    setDeviceType,
    togglePlayback,
    restartPreview,
    updateSettings,
    handleElementClick,
    clearError,
    reset
  };
}

// === SOLID: SRP - Specific hooks for different use cases ===

export function usePreviewNavigation() {
  const {
    currentSlide,
    hasSlides,
    canNavigateNext,
    canNavigatePrev,
    navigateToSlide,
    navigateNext,
    navigatePrev,
    state: { currentSlideIndex, data }
  } = useEnhancedPreview();

  return {
    currentSlide,
    currentSlideIndex,
    slides: data?.slides || [],
    hasSlides,
    canNavigateNext,
    canNavigatePrev,
    navigateToSlide,
    navigateNext,
    navigatePrev
  };
}

export function usePreviewControls() {
  const {
    togglePlayback,
    restartPreview,
    setDeviceType,
    updateSettings,
    state: { isPlaying, deviceType, settings }
  } = useEnhancedPreview();

  return {
    isPlaying,
    deviceType,
    settings,
    togglePlayback,
    restartPreview,
    setDeviceType,
    updateSettings
  };
} 