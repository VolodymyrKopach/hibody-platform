import { useCallback, useEffect, useMemo } from 'react';
import { 
  FormValues, 
  ValidationErrors, 
  FilterConfig, 
  AgeGroupFilters,
  IValidator
} from '@/types/generation';

// === SOLID: SRP - Валідатор ===

/**
 * Базовий валідатор для форми
 * SOLID: SRP - відповідає тільки за валідацію
 * SOLID: DIP - реалізує інтерфейс IValidator
 */
class FormValidator implements IValidator {
  /**
   * Валідувати одне поле
   * SOLID: SRP - одна відповідальність: валідувати поле
   */
  validate(value: any, config: FilterConfig): string[] {
    const errors: string[] = [];

    // Перевірка обов'язкових полів
    if (config.required && this.isEmpty(value)) {
      errors.push(`Поле "${config.label}" є обов'язковим`);
      return errors;
    }

    // Валідація не обов'язкових порожніх полів
    if (this.isEmpty(value)) {
      return errors;
    }

    // Валідація на основі типу поля
    switch (config.type) {
      case 'text':
      case 'textarea':
        errors.push(...this.validateText(value, config));
        break;
      case 'select':
        errors.push(...this.validateSelect(value, config));
        break;
      case 'multiselect':
        errors.push(...this.validateMultiselect(value, config));
        break;
      case 'radio':
        errors.push(...this.validateRadio(value, config));
        break;
      case 'checkbox':
        errors.push(...this.validateCheckbox(value, config));
        break;
    }

    // Кастомна валідація
    if (config.validation?.custom) {
      if (!config.validation.custom(value)) {
        errors.push(`Поле "${config.label}" має некоректне значення`);
      }
    }

    return errors;
  }

  /**
   * Валідувати всю форму
   * SOLID: SRP - одна відповідальність: валідувати форму
   */
  validateForm(values: FormValues, filters: FilterConfig[]): ValidationErrors {
    const errors: ValidationErrors = {};

    filters.forEach(filter => {
      const fieldErrors = this.validate(values[filter.id], filter);
      if (fieldErrors.length > 0) {
        errors[filter.id] = fieldErrors;
      }
    });

    return errors;
  }

  // === SOLID: SRP - Допоміжні методи валідації ===

  /**
   * Перевірити, чи порожнє значення
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  }

  /**
   * Валідувати текстове поле
   */
  private validateText(value: string, config: FilterConfig): string[] {
    const errors: string[] = [];
    const validation = config.validation;

    if (validation?.minLength && value.length < validation.minLength) {
      errors.push(`Мінімальна довжина: ${validation.minLength} символів`);
    }

    if (validation?.maxLength && value.length > validation.maxLength) {
      errors.push(`Максимальна довжина: ${validation.maxLength} символів`);
    }

    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push(`Значення не відповідає формату`);
      }
    }

    return errors;
  }

  /**
   * Валідувати селект
   */
  private validateSelect(value: string, config: FilterConfig): string[] {
    const errors: string[] = [];
    const validOptions = config.options?.map(opt => opt.value) || [];

    if (value && !validOptions.includes(value)) {
      errors.push(`Невалідне значення`);
    }

    return errors;
  }

  /**
   * Валідувати мультиселект
   */
  private validateMultiselect(value: string[], config: FilterConfig): string[] {
    const errors: string[] = [];
    const validOptions = config.options?.map(opt => opt.value) || [];

    if (Array.isArray(value)) {
      const invalidValues = value.filter(v => !validOptions.includes(v));
      if (invalidValues.length > 0) {
        errors.push(`Невалідні значення: ${invalidValues.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * Валідувати радіо кнопки
   */
  private validateRadio(value: string, config: FilterConfig): string[] {
    return this.validateSelect(value, config);
  }

  /**
   * Валідувати чекбокси
   */
  private validateCheckbox(value: string[], config: FilterConfig): string[] {
    return this.validateMultiselect(value, config);
  }
}

// === Main Hook ===

/**
 * Хук для валідації форми генерації
 * SOLID: SRP - відповідає тільки за валідацію
 * SOLID: DIP - використовує абстрактний валідатор
 */
export function useFormValidation(
  values: FormValues,
  filters: AgeGroupFilters | null,
  autoValidate: boolean = true
) {
  // === SOLID: SRP - Створення валідатора ===
  const validator = useMemo(() => new FormValidator(), []);

  // === SOLID: SRP - Отримання всіх фільтрів ===
  const allFilters = useMemo(() => {
    if (!filters) return [];
    return filters.groups.flatMap(group => group.filters);
  }, [filters]);

  // === SOLID: SRP - Валідація форми ===
  const validateForm = useCallback(() => {
    return validator.validateForm(values, allFilters);
  }, [validator, values, allFilters]);

  // === SOLID: SRP - Валідація одного поля ===
  const validateField = useCallback((fieldId: string) => {
    const filter = allFilters.find(f => f.id === fieldId);
    if (!filter) return [];
    
    return validator.validate(values[fieldId], filter);
  }, [validator, values, allFilters]);

  // === SOLID: SRP - Автоматична валідація ===
  const errors = useMemo(() => {
    if (!autoValidate || !filters) return {};
    return validateForm();
  }, [autoValidate, filters, validateForm]);

  // === SOLID: SRP - Перевірка валідності ===
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // === SOLID: SRP - Перевірка готовності до відправки ===
  const isFormComplete = useMemo(() => {
    const requiredFields = allFilters.filter(f => f.required);
    return requiredFields.every(field => {
      const value = values[field.id];
      return !validator.validate(value, field).length;
    });
  }, [allFilters, values, validator]);

  // === SOLID: SRP - Статистика помилок ===
  const errorCount = useMemo(() => {
    return Object.values(errors).reduce((total, fieldErrors) => total + fieldErrors.length, 0);
  }, [errors]);

  // === SOLID: SRP - Отримання помилок для поля ===
  const getFieldErrors = useCallback((fieldId: string) => {
    return errors[fieldId] || [];
  }, [errors]);

  // === SOLID: SRP - Перевірка, чи є помилки у полі ===
  const hasFieldError = useCallback((fieldId: string) => {
    return getFieldErrors(fieldId).length > 0;
  }, [getFieldErrors]);

  // === SOLID: SRP - Отримання першої помилки поля ===
  const getFirstFieldError = useCallback((fieldId: string) => {
    const fieldErrors = getFieldErrors(fieldId);
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [getFieldErrors]);

  // === API хука ===
  return {
    // Основні функції
    validateForm,
    validateField,
    
    // Стан валідації
    errors,
    isValid,
    isFormComplete,
    errorCount,
    
    // Допоміжні функції
    getFieldErrors,
    hasFieldError,
    getFirstFieldError,
    
    // Валідатор для розширення
    validator
  };
}

// === Типи для експорту ===
export type UseFormValidationReturn = ReturnType<typeof useFormValidation>;
export { FormValidator }; 