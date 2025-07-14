import { useState, useCallback, useEffect, useReducer } from 'react';
import { 
  FormState, 
  FormValues, 
  ValidationErrors, 
  FormEvent, 
  AgeGroupId,
  GenerationParameters
} from '@/types/generation';
import { configManager } from '@/services/generation/ConfigManager';

// === SOLID: SRP - Reducer для управління станом форми ===

/**
 * Reducer для управління станом форми
 * SOLID: SRP - відповідає тільки за зміни стану
 */
function formReducer(state: FormState, action: FormEvent): FormState {
  switch (action.type) {
    case 'SET_AGE_GROUP':
      return {
        ...state,
        selectedAgeGroup: action.payload,
        values: configManager.getDefaultValues(action.payload),
        errors: {},
        isValid: false,
        isDirty: false
      };

    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.field]: action.payload.value
        },
        isDirty: true
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0
      };

    case 'RESET_FORM':
      return {
        ...state,
        values: configManager.getDefaultValues(state.selectedAgeGroup),
        errors: {},
        isValid: false,
        isDirty: false,
        isSubmitting: false
      };

    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        isDirty: false
      };

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errors: { general: [action.payload] }
      };

    default:
      return state;
  }
}

// === SOLID: SRP - Початковий стан ===

/**
 * Створити початковий стан форми
 * SOLID: SRP - одна відповідальність: створити стан
 */
function createInitialState(initialAgeGroup: AgeGroupId = '4-6'): FormState {
  return {
    selectedAgeGroup: initialAgeGroup,
    values: configManager.getDefaultValues(initialAgeGroup),
    errors: {},
    isValid: false,
    isDirty: false,
    isSubmitting: false
  };
}

// === Main Hook ===

/**
 * Хук для управління станом форми генерації
 * SOLID: SRP - відповідає тільки за стан форми
 * SOLID: DIP - залежить від абстракції configManager
 */
export function useGenerationForm(initialAgeGroup: AgeGroupId = '4-6') {
  const [state, dispatch] = useReducer(formReducer, createInitialState(initialAgeGroup));

  // === SOLID: SRP - Функції для зміни стану ===

  /**
   * Змінити вікову групу
   * SOLID: SRP - одна відповідальність: змінити групу
   */
  const setAgeGroup = useCallback((ageGroupId: AgeGroupId) => {
    if (!configManager.isValidAgeGroup(ageGroupId)) {
      console.error(`Невалідна вікова група: ${ageGroupId}`);
      return;
    }
    dispatch({ type: 'SET_AGE_GROUP', payload: ageGroupId });
  }, []);

  /**
   * Змінити значення поля
   * SOLID: SRP - одна відповідальність: змінити поле
   */
  const setFieldValue = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value } });
  }, []);

  /**
   * Встановити помилки валідації
   * SOLID: SRP - одна відповідальність: встановити помилки
   */
  const setErrors = useCallback((errors: ValidationErrors) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  /**
   * Скинути форму
   * SOLID: SRP - одна відповідальність: скинути форму
   */
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  /**
   * Почати відправку форми
   * SOLID: SRP - одна відповідальність: почати відправку
   */
  const startSubmit = useCallback(() => {
    dispatch({ type: 'SUBMIT_START' });
  }, []);

  /**
   * Завершити відправку успішно
   * SOLID: SRP - одна відповідальність: завершити успішно
   */
  const submitSuccess = useCallback(() => {
    dispatch({ type: 'SUBMIT_SUCCESS' });
  }, []);

  /**
   * Завершити відправку з помилкою
   * SOLID: SRP - одна відповідальність: завершити з помилкою
   */
  const submitError = useCallback((error: string) => {
    dispatch({ type: 'SUBMIT_ERROR', payload: error });
  }, []);

  // === SOLID: SRP - Допоміжні функції ===

  /**
   * Отримати конфігурацію поточної вікової групи
   * SOLID: SRP - одна відповідальність: отримати конфігурацію
   */
  const getCurrentAgeGroupConfig = useCallback(() => {
    return configManager.getAgeGroupConfig(state.selectedAgeGroup);
  }, [state.selectedAgeGroup]);

  /**
   * Отримати фільтри для поточної вікової групи
   * SOLID: SRP - одна відповідальність: отримати фільтри
   */
  const getCurrentFilters = useCallback(() => {
    return configManager.getFiltersForAge(state.selectedAgeGroup);
  }, [state.selectedAgeGroup]);

  /**
   * Створити параметри для генерації
   * SOLID: SRP - одна відповідальність: створити параметри
   */
  const createGenerationParameters = useCallback((): GenerationParameters => {
    const ageGroupConfig = getCurrentAgeGroupConfig();
    if (!ageGroupConfig) {
      throw new Error(`Конфігурація для вікової групи ${state.selectedAgeGroup} не знайдена`);
    }

    return {
      ageGroup: state.selectedAgeGroup,
      filters: state.values,
      requirements: {
        includeAudio: ageGroupConfig.audio.required,
        complexity: ageGroupConfig.complexity,
        duration: parseInt(ageGroupConfig.timeRange.split('-')[1]) || 10
      }
    };
  }, [state.selectedAgeGroup, state.values, getCurrentAgeGroupConfig]);

  /**
   * Перевірити, чи можна відправити форму
   * SOLID: SRP - одна відповідальність: перевірити готовність
   */
  const canSubmit = useCallback(() => {
    return state.isValid && !state.isSubmitting && state.isDirty;
  }, [state.isValid, state.isSubmitting, state.isDirty]);

  // === Повернути API хука ===
  return {
    // Стан
    state,
    
    // Дії
    setAgeGroup,
    setFieldValue,
    setErrors,
    resetForm,
    startSubmit,
    submitSuccess,
    submitError,
    
    // Допоміжні функції
    getCurrentAgeGroupConfig,
    getCurrentFilters,
    createGenerationParameters,
    canSubmit,
    
    // Розширені властивості для зручності
    selectedAgeGroup: state.selectedAgeGroup,
    values: state.values,
    errors: state.errors,
    isValid: state.isValid,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting
  };
}

// === Типи для експорту ===
export type UseGenerationFormReturn = ReturnType<typeof useGenerationForm>; 