import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generationAPIService, GenerationAPIError } from '@/services/generation/GenerationAPIService';
import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Types for hook state ===
interface GenerationState {
  isGenerating: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
  lastGeneratedLesson: any | null;
  savedConfigurations: any[];
}

interface UseGenerationAPIReturn {
  // State
  state: GenerationState;
  
  // Actions
  generateLesson: (params: {
    ageGroupConfig: AgeGroupConfig;
    formValues: FormValues;
    metadata?: {
      title?: string;
      description?: string;
      generateSlides?: boolean;
      slideCount?: number;
    };
  }) => Promise<any>;
  
  saveConfiguration: (params: {
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate?: boolean;
  }) => Promise<any>;
  
  loadConfigurations: (params?: {
    ageGroupId?: string;
    templatesOnly?: boolean;
  }) => Promise<void>;
  
  deleteConfiguration: (configId: string) => Promise<void>;
  
  getCapabilities: () => Promise<any>;
  
  clearError: () => void;
  
  reset: () => void;
}

// === SOLID: SRP - Main hook ===
export function useGenerationAPI(): UseGenerationAPIReturn {
  const { t } = useTranslation(['common', 'generation']);
  
  // === SOLID: SRP - State management ===
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    isSaving: false,
    isLoading: false,
    isDeleting: false,
    error: null,
    lastGeneratedLesson: null,
    savedConfigurations: []
  });

  // === SOLID: SRP - Error handling ===
  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error('Generation API error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error instanceof GenerationAPIError) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isGenerating: false,
      isSaving: false,
      isLoading: false,
      isDeleting: false
    }));
  }, []);

  // === SOLID: SRP - Generate lesson ===
  const generateLesson = useCallback(async (params: {
    ageGroupConfig: AgeGroupConfig;
    formValues: FormValues;
    metadata?: {
      title?: string;
      description?: string;
      generateSlides?: boolean;
      slideCount?: number;
    };
  }) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    try {
      console.log('🚀 HOOK: Starting lesson generation');
      
      const response = await generationAPIService.generateLesson({
        ageGroupConfig: params.ageGroupConfig,
        formValues: params.formValues,
        metadata: params.metadata
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate lesson');
      }

      console.log('✅ HOOK: Lesson generated successfully');
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastGeneratedLesson: response.lesson,
        error: null
      }));

      return response.lesson;
      
    } catch (error) {
      handleError(error, t('generation:errors.generateLesson', 'Помилка генерації уроку'));
      throw error;
    }
  }, [handleError, t]);

  // === SOLID: SRP - Save configuration ===
  const saveConfiguration = useCallback(async (params: {
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate?: boolean;
  }) => {
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null
    }));

    try {
      console.log('💾 HOOK: Saving configuration');
      
      const response = await generationAPIService.saveConfiguration(params);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save configuration');
      }

      console.log('✅ HOOK: Configuration saved successfully');
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        savedConfigurations: response.config ? 
          [response.config, ...prev.savedConfigurations] : 
          prev.savedConfigurations,
        error: null
      }));

      return response.config;
      
    } catch (error) {
      handleError(error, t('generation:errors.saveConfiguration', 'Помилка збереження конфігурації'));
      throw error;
    }
  }, [handleError, t]);

  // === SOLID: SRP - Load configurations ===
  const loadConfigurations = useCallback(async (params?: {
    ageGroupId?: string;
    templatesOnly?: boolean;
  }) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      console.log('📋 HOOK: Loading configurations');
      
      const response = await generationAPIService.getConfigurations(params);

      if (!response.success) {
        throw new Error(response.error || 'Failed to load configurations');
      }

      console.log('✅ HOOK: Configurations loaded successfully');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        savedConfigurations: response.configs || [],
        error: null
      }));
      
    } catch (error) {
      handleError(error, t('generation:errors.loadConfigurations', 'Помилка завантаження конфігурацій'));
      throw error;
    }
  }, [handleError, t]);

  // === SOLID: SRP - Delete configuration ===
  const deleteConfiguration = useCallback(async (configId: string) => {
    setState(prev => ({
      ...prev,
      isDeleting: true,
      error: null
    }));

    try {
      console.log('🗑️ HOOK: Deleting configuration');
      
      const response = await generationAPIService.deleteConfiguration(configId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete configuration');
      }

      console.log('✅ HOOK: Configuration deleted successfully');
      
      setState(prev => ({
        ...prev,
        isDeleting: false,
        savedConfigurations: prev.savedConfigurations.filter(config => config.id !== configId),
        error: null
      }));
      
    } catch (error) {
      handleError(error, t('generation:errors.deleteConfiguration', 'Помилка видалення конфігурації'));
      throw error;
    }
  }, [handleError, t]);

  // === SOLID: SRP - Get capabilities ===
  const getCapabilities = useCallback(async () => {
    try {
      console.log('🔍 HOOK: Getting capabilities');
      
      const response = await generationAPIService.getCapabilities();

      if (!response.success) {
        throw new Error(response.error || 'Failed to get capabilities');
      }

      console.log('✅ HOOK: Capabilities retrieved successfully');
      return response;
      
    } catch (error) {
      handleError(error, t('generation:errors.getCapabilities', 'Помилка отримання можливостей'));
      throw error;
    }
  }, [handleError, t]);

  // === SOLID: SRP - Clear error ===
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // === SOLID: SRP - Reset state ===
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      isSaving: false,
      isLoading: false,
      isDeleting: false,
      error: null,
      lastGeneratedLesson: null,
      savedConfigurations: []
    });
  }, []);

  return {
    state,
    generateLesson,
    saveConfiguration,
    loadConfigurations,
    deleteConfiguration,
    getCapabilities,
    clearError,
    reset
  };
}

// === SOLID: SRP - Specific hooks for different use cases ===

export function useGenerationActions() {
  const {
    generateLesson,
    saveConfiguration,
    state: { isGenerating, isSaving, error }
  } = useGenerationAPI();

  return {
    generateLesson,
    saveConfiguration,
    isGenerating,
    isSaving,
    error
  };
}

export function useConfigurationManagement() {
  const {
    loadConfigurations,
    deleteConfiguration,
    saveConfiguration,
    state: { savedConfigurations, isLoading, isDeleting, error }
  } = useGenerationAPI();

  return {
    configurations: savedConfigurations,
    loadConfigurations,
    deleteConfiguration,
    saveConfiguration,
    isLoading,
    isDeleting,
    error
  };
} 