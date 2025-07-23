import { useCallback, useEffect, useMemo } from 'react';
import { 
  AgeGroupId, 
  GenerationParameters,
  GenerationConstructorState,
  AgeGroupConfig
} from '@/types/generation';
import { useGenerationForm } from './useGenerationForm';
import { useFormValidation } from './useFormValidation';
import { usePreview } from './usePreview';
import { configManager } from '@/services/generation/ConfigManager';

/**
 * Main hook for the generation constructor
 * SOLID: SRP - responsible only for coordinating other hooks
 * SOLID: DIP - depends on abstract hooks, not concrete implementations
 */
export function useGenerationConstructor(initialAgeGroup: AgeGroupId = '4-6') {
  // === SOLID: SRP - Using other hooks ===
  
  /**
   * Hook for form management
   * SOLID: DIP - depends on an abstract hook
   */
  const form = useGenerationForm(initialAgeGroup);
  
  /**
   * Hook for validation
   * SOLID: DIP - depends on an abstract hook
   */
  const validation = useFormValidation(
    form.values,
    form.getCurrentFilters(),
    true // automatic validation
  );
  
  /**
   * Hook for preview
   * SOLID: DIP - depends on an abstract hook
   */
  const preview = usePreview(
    form.getCurrentAgeGroupConfig(),
    form.values
  );

  // === SOLID: SRP - State synchronization ===
  
  /**
   * Synchronize validation errors with the form
   * SOLID: SRP - single responsibility: synchronize errors
   */
  useEffect(() => {
    form.setErrors(validation.errors);
  }, [validation.errors, form.setErrors]);

  /**
   * Update preview on age group change
   * SOLID: SRP - single responsibility: update preview
   */
  useEffect(() => {
    if (preview.isVisible) {
      preview.refreshPreview();
    }
  }, [form.selectedAgeGroup]); // Respond only to age group change

  // === SOLID: SRP - Combined state ===
  
  /**
   * Create combined constructor state
   * SOLID: SRP - single responsibility: create state
   */
  const constructorState: GenerationConstructorState = useMemo(() => ({
    form: form.state,
    preview: preview.previewState,
    availableAgeGroups: configManager.getAgeGroups(),
    availableFilters: configManager.getAllFilters()
  }), [form.state, preview.previewState]);

  // === SOLID: SRP - Main actions ===
  
  /**
   * Change age group with validation
   * SOLID: SRP - single responsibility: change group
   */
  const changeAgeGroup = useCallback((ageGroupId: string) => {
    form.setAgeGroup(ageGroupId);
  }, [form.setAgeGroup]);

  /**
   * Change field value with validation
   * SOLID: SRP - single responsibility: change field
   */
  const changeFieldValue = useCallback((fieldId: string, value: any) => {
    form.setFieldValue(fieldId, value);
  }, [form.setFieldValue]);

  /**
   * Show preview with checks
   * SOLID: SRP - single responsibility: show preview
   */
  const showPreview = useCallback(() => {
    if (!preview.canShowPreview) return;
    preview.showPreview();
  }, [preview.canShowPreview, preview.showPreview]);

  /**
   * Reset form to initial state
   * SOLID: SRP - single responsibility: reset form
   */
  const resetForm = useCallback(() => {
    form.resetForm();
    preview.hidePreview();
  }, [form.resetForm, preview.hidePreview]);

  // === SOLID: SRP - Preparation for generation ===
  
  /**
   * Check readiness for generation
   * SOLID: SRP - single responsibility: check readiness
   */
  const canGenerate = useMemo(() => {
    return validation.isFormComplete && form.canSubmit();
  }, [validation.isFormComplete, form.canSubmit]);

  /**
   * Prepare parameters for generation
   * SOLID: SRP - single responsibility: prepare parameters
   */
  const prepareGenerationParameters = useCallback((): GenerationParameters => {
    if (!canGenerate) {
      throw new Error('Form is not ready for generation');
    }
    return form.createGenerationParameters();
  }, [canGenerate, form.createGenerationParameters]);

  /**
   * Execute generation
   * SOLID: SRP - single responsibility: execute generation
   */
  const generate = useCallback(async (): Promise<GenerationParameters> => {
    if (!canGenerate) {
      throw new Error('Form is not ready for generation');
    }

    form.startSubmit();
    
    try {
      const parameters = prepareGenerationParameters();
      form.submitSuccess();
      return parameters;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation error';
      form.submitError(errorMessage);
      throw error;
    }
  }, [canGenerate, form, prepareGenerationParameters]);

  // === SOLID: SRP - Helper functions ===
  
  /**
   * Get constructor status
   * SOLID: SRP - single responsibility: get status
   */
  const getStatus = useCallback(() => {
    if (form.isSubmitting) return 'generating';
    if (preview.isLoading) return 'loading_preview';
    if (validation.errorCount > 0) return 'has_errors';
    if (canGenerate) return 'ready';
    return 'filling';
  }, [form.isSubmitting, preview.isLoading, validation.errorCount, canGenerate]);

  /**
   * Get form filling progress
   * SOLID: SRP - single responsibility: calculate progress
   */
  const getProgress = useCallback(() => {
    const filters = form.getCurrentFilters();
    if (!filters) return 0;

    const allFilters = filters.groups.flatMap(group => group.filters);
    const filledFields = allFilters.filter(filter => {
      const value = form.values[filter.id];
      return value !== '' && value !== null && value !== undefined && 
             (!Array.isArray(value) || value.length > 0);
    });

    return Math.round((filledFields.length / allFilters.length) * 100);
  }, [form.getCurrentFilters, form.values]);

  /**
   * Get current age group
   * SOLID: SRP - single responsibility: get group
   */
  const getCurrentAgeGroup = useCallback((): AgeGroupConfig | null => {
    return form.getCurrentAgeGroupConfig();
  }, [form.getCurrentAgeGroupConfig]);

  // === Hook API ===
  return {
    // State
    state: constructorState,
    status: getStatus(),
    progress: getProgress(),
    
    // Main actions
    changeAgeGroup,
    changeFieldValue,
    showPreview,
    resetForm,
    generate,
    
    // Preview
    preview: {
      show: showPreview,
      hide: preview.hidePreview,
      refresh: preview.refreshPreview,
      canShow: preview.canShowPreview,
      isVisible: preview.isVisible,
      isLoading: preview.isLoading,
      hasError: preview.hasError,
      data: preview.data,
      error: preview.error
    },
    
    // Validation
    validation: {
      errors: validation.errors,
      isValid: validation.isValid,
      isComplete: validation.isFormComplete,
      errorCount: validation.errorCount,
      getFieldErrors: validation.getFieldErrors,
      hasFieldError: validation.hasFieldError,
      getFirstFieldError: validation.getFirstFieldError
    },
    
    // Form
    form: {
      selectedAgeGroup: form.selectedAgeGroup,
      values: form.values,
      isDirty: form.isDirty,
      isSubmitting: form.isSubmitting,
      getCurrentAgeGroup,
      getCurrentFilters: form.getCurrentFilters
    },
    
    // Checks
    canGenerate,
    canShowPreview: preview.canShowPreview,
    
    // Helper functions
    prepareGenerationParameters,
    
    // Extended properties for convenience
    selectedAgeGroup: form.selectedAgeGroup,
    values: form.values,
    errors: validation.errors,
    isValid: validation.isValid,
    isDirty: form.isDirty,
    isSubmitting: form.isSubmitting,
    
    // Internal hooks for extension
    _internal: {
      form,
      validation,
      preview
    }
  };
}

// === Exported types ===
export type UseGenerationConstructorReturn = ReturnType<typeof useGenerationConstructor>; 