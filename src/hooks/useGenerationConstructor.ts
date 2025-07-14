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
 * Головний хук для конструктора генерації
 * SOLID: SRP - відповідає тільки за координацію інших хуків
 * SOLID: DIP - залежить від абстрактних хуків, не від конкретних реалізацій
 */
export function useGenerationConstructor(initialAgeGroup: AgeGroupId = '4-6') {
  // === SOLID: SRP - Використання інших хуків ===
  
  /**
   * Хук для управління формою
   * SOLID: DIP - залежимо від абстрактного хука
   */
  const form = useGenerationForm(initialAgeGroup);
  
  /**
   * Хук для валідації
   * SOLID: DIP - залежимо від абстрактного хука
   */
  const validation = useFormValidation(
    form.values,
    form.getCurrentFilters(),
    true // автоматична валідація
  );
  
  /**
   * Хук для превю
   * SOLID: DIP - залежимо від абстрактного хука
   */
  const preview = usePreview(
    form.getCurrentAgeGroupConfig(),
    form.values
  );

  // === SOLID: SRP - Синхронізація стану ===
  
  /**
   * Синхронізувати помилки валідації з формою
   * SOLID: SRP - одна відповідальність: синхронізувати помилки
   */
  useEffect(() => {
    form.setErrors(validation.errors);
  }, [validation.errors, form.setErrors]);

  /**
   * Оновити превю при зміні вікової групи
   * SOLID: SRP - одна відповідальність: оновити превю
   */
  useEffect(() => {
    if (preview.isVisible) {
      preview.refreshPreview();
    }
  }, [form.selectedAgeGroup]); // Реагуємо тільки на зміну вікової групи

  // === SOLID: SRP - Об'єднаний стан ===
  
  /**
   * Створити об'єднаний стан конструктора
   * SOLID: SRP - одна відповідальність: створити стан
   */
  const constructorState: GenerationConstructorState = useMemo(() => ({
    form: form.state,
    preview: preview.previewState,
    availableAgeGroups: configManager.getAgeGroups(),
    availableFilters: configManager.getAllFilters()
  }), [form.state, preview.previewState]);

  // === SOLID: SRP - Основні дії ===
  
  /**
   * Змінити вікову групу з валідацією
   * SOLID: SRP - одна відповідальність: змінити групу
   */
  const changeAgeGroup = useCallback((ageGroupId: string) => {
    form.setAgeGroup(ageGroupId);
  }, [form.setAgeGroup]);

  /**
   * Змінити значення поля з валідацією
   * SOLID: SRP - одна відповідальність: змінити поле
   */
  const changeFieldValue = useCallback((fieldId: string, value: any) => {
    form.setFieldValue(fieldId, value);
  }, [form.setFieldValue]);

  /**
   * Показати превю з перевірками
   * SOLID: SRP - одна відповідальність: показати превю
   */
  const showPreview = useCallback(() => {
    if (!preview.canShowPreview) return;
    preview.showPreview();
  }, [preview.canShowPreview, preview.showPreview]);

  /**
   * Скинути форму до початкового стану
   * SOLID: SRP - одна відповідальність: скинути форму
   */
  const resetForm = useCallback(() => {
    form.resetForm();
    preview.hidePreview();
  }, [form.resetForm, preview.hidePreview]);

  // === SOLID: SRP - Підготовка до генерації ===
  
  /**
   * Перевірити готовність до генерації
   * SOLID: SRP - одна відповідальність: перевірити готовність
   */
  const canGenerate = useMemo(() => {
    return validation.isFormComplete && form.canSubmit();
  }, [validation.isFormComplete, form.canSubmit]);

  /**
   * Підготувати параметри для генерації
   * SOLID: SRP - одна відповідальність: підготувати параметри
   */
  const prepareGenerationParameters = useCallback((): GenerationParameters => {
    if (!canGenerate) {
      throw new Error('Форма не готова для генерації');
    }
    return form.createGenerationParameters();
  }, [canGenerate, form.createGenerationParameters]);

  /**
   * Виконати генерацію
   * SOLID: SRP - одна відповідальність: виконати генерацію
   */
  const generate = useCallback(async (): Promise<GenerationParameters> => {
    if (!canGenerate) {
      throw new Error('Форма не готова для генерації');
    }

    form.startSubmit();
    
    try {
      const parameters = prepareGenerationParameters();
      form.submitSuccess();
      return parameters;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка генерації';
      form.submitError(errorMessage);
      throw error;
    }
  }, [canGenerate, form, prepareGenerationParameters]);

  // === SOLID: SRP - Допоміжні функції ===
  
  /**
   * Отримати статус конструктора
   * SOLID: SRP - одна відповідальність: отримати статус
   */
  const getStatus = useCallback(() => {
    if (form.isSubmitting) return 'generating';
    if (preview.isLoading) return 'loading_preview';
    if (validation.errorCount > 0) return 'has_errors';
    if (canGenerate) return 'ready';
    return 'filling';
  }, [form.isSubmitting, preview.isLoading, validation.errorCount, canGenerate]);

  /**
   * Отримати прогрес заповнення форми
   * SOLID: SRP - одна відповідальність: розрахувати прогрес
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
   * Отримати поточну вікову групу
   * SOLID: SRP - одна відповідальність: отримати групу
   */
  const getCurrentAgeGroup = useCallback((): AgeGroupConfig | null => {
    return form.getCurrentAgeGroupConfig();
  }, [form.getCurrentAgeGroupConfig]);

  // === API хука ===
  return {
    // Стан
    state: constructorState,
    status: getStatus(),
    progress: getProgress(),
    
    // Основні дії
    changeAgeGroup,
    changeFieldValue,
    showPreview,
    resetForm,
    generate,
    
    // Превю
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
    
    // Валідація
    validation: {
      errors: validation.errors,
      isValid: validation.isValid,
      isComplete: validation.isFormComplete,
      errorCount: validation.errorCount,
      getFieldErrors: validation.getFieldErrors,
      hasFieldError: validation.hasFieldError,
      getFirstFieldError: validation.getFirstFieldError
    },
    
    // Форма
    form: {
      selectedAgeGroup: form.selectedAgeGroup,
      values: form.values,
      isDirty: form.isDirty,
      isSubmitting: form.isSubmitting,
      getCurrentAgeGroup,
      getCurrentFilters: form.getCurrentFilters
    },
    
    // Перевірки
    canGenerate,
    canShowPreview: preview.canShowPreview,
    
    // Допоміжні функції
    prepareGenerationParameters,
    
    // Розширені властивості для зручності
    selectedAgeGroup: form.selectedAgeGroup,
    values: form.values,
    errors: validation.errors,
    isValid: validation.isValid,
    isDirty: form.isDirty,
    isSubmitting: form.isSubmitting,
    
    // Внутрішні хуки для розширення
    _internal: {
      form,
      validation,
      preview
    }
  };
}

// === Типи для експорту ===
export type UseGenerationConstructorReturn = ReturnType<typeof useGenerationConstructor>; 