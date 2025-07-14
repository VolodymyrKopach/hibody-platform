/**
 * === SOLID: SRP - Form with History Hook ===
 * 
 * This hook integrates form state management with the history system,
 * providing undo/redo capabilities for form fields.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormHistory } from '@/providers/HistoryProvider';
import { FormValues, ValidationErrors } from '@/types/generation';
import { AgeGroupConfig } from '@/types/generation';

// === SOLID: ISP - Hook options interface ===
interface UseFormWithHistoryOptions {
  initialValues?: FormValues;
  ageGroupConfig?: AgeGroupConfig;
  debounceMs?: number;
  excludeFields?: string[];
  trackValidationErrors?: boolean;
  onFormChange?: (values: FormValues) => void;
  onHistoryChange?: (stats: { canUndo: boolean; canRedo: boolean }) => void;
}

// === SOLID: ISP - Hook return interface ===
interface UseFormWithHistoryReturn {
  // Form state
  values: FormValues;
  errors: ValidationErrors;
  originalValues: FormValues;
  
  // Form actions
  setValue: (field: string, value: any, fieldType?: string) => void;
  setValues: (newValues: FormValues, description?: string) => void;
  setError: (field: string, error: string[]) => void;
  clearErrors: () => void;
  resetForm: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  
  // Information
  hasChanges: boolean;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  
  // History stats
  historyStats: {
    totalEntries: number;
    currentPosition: number;
    memoryUsage: number;
  };
}

// === SOLID: SRP - Form with History Hook ===
export const useFormWithHistory = (
  options: UseFormWithHistoryOptions = {}
): UseFormWithHistoryReturn => {
  const {
    initialValues = {},
    ageGroupConfig,
    debounceMs = 300,
    excludeFields = [],
    trackValidationErrors = true,
    onFormChange,
    onHistoryChange
  } = options;
  
  // === SOLID: DIP - Use history provider ===
  const history = useFormHistory();
  
  // === SOLID: SRP - Local state ===
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [originalValues] = useState<FormValues>(initialValues);
  
  // === SOLID: SRP - Refs for debouncing ===
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const previousValuesRef = useRef<FormValues>(initialValues);
  
  // === SOLID: SRP - Sync with history state ===
  useEffect(() => {
    if (history.currentState.formValues) {
      setValues(history.currentState.formValues);
      
      if (trackValidationErrors && history.currentState.errors) {
        setErrors(history.currentState.errors);
      }
    }
  }, [history.currentState, trackValidationErrors]);
  
  // === SOLID: SRP - Notify on form changes ===
  useEffect(() => {
    onFormChange?.(values);
  }, [values, onFormChange]);
  
  // === SOLID: SRP - Notify on history changes ===
  useEffect(() => {
    onHistoryChange?.({
      canUndo: history.canUndo,
      canRedo: history.canRedo
    });
  }, [history.canUndo, history.canRedo, onHistoryChange]);
  
  // === SOLID: SRP - Initialize form with history ===
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      if (ageGroupConfig?.id) {
        history.addFormLoad(initialValues, ageGroupConfig.id);
      } else {
        history.addFormLoad(initialValues);
      }
    }
  }, [initialValues, ageGroupConfig?.id, history.addFormLoad]);
  
  // === SOLID: SRP - Set single field value ===
  const setValue = useCallback((
    field: string,
    value: any,
    fieldType: string = 'text'
  ) => {
    // Skip if field is excluded
    if (excludeFields.includes(field)) {
      setValues(prev => ({ ...prev, [field]: value }));
      return;
    }
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Get old value
    const oldValue = values[field];
    
    // Update local state immediately
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      return newValues;
    });
    
    // Add to history with debounce
    debounceTimerRef.current = setTimeout(() => {
      history.handleFieldChange(field, oldValue, value, fieldType);
    }, debounceMs);
  }, [values, excludeFields, debounceMs, history]);
  
  // === SOLID: SRP - Set multiple field values ===
  const setMultipleValues = useCallback((
    newValues: FormValues,
    description: string = 'Multiple fields changed'
  ) => {
    // Calculate changes
    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    
    Object.entries(newValues).forEach(([field, newValue]) => {
      const oldValue = values[field];
      if (oldValue !== newValue && !excludeFields.includes(field)) {
        changes[field] = { oldValue, newValue };
      }
    });
    
    // Update local state
    setValues(prev => ({ ...prev, ...newValues }));
    
    // Add to history if there are changes
    if (Object.keys(changes).length > 0) {
      history.handleBulkChange(changes, description);
    }
  }, [values, excludeFields, history]);
  
  // === SOLID: SRP - Set field error ===
  const setError = useCallback((field: string, error: string[]) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  // === SOLID: SRP - Clear all errors ===
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  // === SOLID: SRP - Reset form ===
  const resetForm = useCallback(() => {
    setValues(originalValues);
    setErrors({});
    history.addFormReset();
  }, [originalValues, history]);
  
  // === SOLID: SRP - Undo action ===
  const undo = useCallback(() => {
    history.undo();
  }, [history]);
  
  // === SOLID: SRP - Redo action ===
  const redo = useCallback(() => {
    history.redo();
  }, [history]);
  
  // === SOLID: SRP - Clear history ===
  const clearHistory = useCallback(() => {
    history.clearHistory();
  }, [history]);
  
  // === SOLID: SRP - Check if form has changes ===
  const hasChanges = useCallback(() => {
    return JSON.stringify(values) !== JSON.stringify(originalValues);
  }, [values, originalValues]);
  
  // === SOLID: SRP - Cleanup on unmount ===
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    // Form state
    values,
    errors,
    originalValues,
    
    // Form actions
    setValue,
    setValues: setMultipleValues,
    setError,
    clearErrors,
    resetForm,
    
    // History actions
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clearHistory,
    
    // Information
    hasChanges: hasChanges(),
    isTracking: history.isTracking,
    startTracking: history.startTracking,
    stopTracking: history.stopTracking,
    
    // History stats
    historyStats: {
      totalEntries: history.stats.totalEntries,
      currentPosition: history.stats.currentPosition,
      memoryUsage: history.stats.memoryUsage
    }
  };
};

// === SOLID: SRP - Hook for simple form integration ===
export const useSimpleFormWithHistory = (
  initialValues: FormValues = {},
  ageGroupConfig?: AgeGroupConfig
) => {
  return useFormWithHistory({
    initialValues,
    ageGroupConfig,
    debounceMs: 500,
    excludeFields: ['temporary', 'preview'],
    trackValidationErrors: true
  });
};

// === SOLID: SRP - Hook for advanced form integration ===
export const useAdvancedFormWithHistory = (
  options: UseFormWithHistoryOptions
) => {
  const form = useFormWithHistory(options);
  
  // === SOLID: SRP - Enhanced field change handler ===
  const handleFieldChange = useCallback((
    field: string,
    value: any,
    fieldType?: string,
    skipHistory?: boolean
  ) => {
    if (skipHistory) {
      form.setValues({ [field]: value }, `Manual ${field} change`);
    } else {
      form.setValue(field, value, fieldType);
    }
  }, [form]);
  
  // === SOLID: SRP - Enhanced form reset ===
  const handleFormReset = useCallback((
    newValues?: FormValues,
    description?: string
  ) => {
    if (newValues) {
      form.setValues(newValues, description || 'Form reset with new values');
    } else {
      form.resetForm();
    }
  }, [form]);
  
  return {
    ...form,
    handleFieldChange,
    handleFormReset
  };
}; 