import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { 
  ValidationService, 
  ValidationRule, 
  ValidationResult, 
  ValidationContext as ValidationServiceContext,
  validationService 
} from '@/services/validation/ValidationService';
import { FilterConfig, FormValues, ValidationErrors, AgeGroupId } from '@/types/generation';

// === SOLID: SRP - Validation context state ===
interface ValidationState {
  errors: ValidationErrors;
  warnings: Record<string, string[]>;
  suggestions: Record<string, string[]>;
  isValidating: boolean;
  lastValidated: Record<string, number>;
}

// === SOLID: SRP - Validation context interface ===
interface ValidationContextType {
  // State
  state: ValidationState;
  
  // Validation methods
  validateField: (fieldId: string, value: any, context: ValidationServiceContext) => Promise<ValidationResult>;
  validateForm: (values: FormValues, configs: FilterConfig[], ageGroup: AgeGroupId) => Promise<ValidationErrors>;
  
  // Rule management
  registerRules: (fieldId: string, rules: ValidationRule[]) => void;
  clearRules: (fieldId: string) => void;
  getRules: (fieldId: string) => ValidationRule[];
  
  // Real-time validation
  enableRealTimeValidation: (enabled: boolean) => void;
  isRealTimeEnabled: boolean;
  
  // Debounced validation
  debouncedValidateField: (fieldId: string, value: any, context: ValidationServiceContext) => void;
  
  // Validation state management
  clearFieldValidation: (fieldId: string) => void;
  clearAllValidation: () => void;
  
  // Validation summary
  getValidationSummary: () => {
    totalErrors: number;
    totalWarnings: number;
    totalSuggestions: number;
    isValid: boolean;
  };
}

// === SOLID: SRP - Create validation context ===
const ValidationContext = createContext<ValidationContextType | null>(null);

// === SOLID: SRP - Validation provider props ===
interface ValidationProviderProps {
  children: React.ReactNode;
  service?: ValidationService;
  realTimeValidation?: boolean;
  debounceDelay?: number;
}

// === SOLID: SRP - Validation provider component ===
export const ValidationProvider: React.FC<ValidationProviderProps> = ({
  children,
  service = validationService,
  realTimeValidation = true,
  debounceDelay = 300
}) => {
  // === SOLID: SRP - Component state ===
  const [state, setState] = useState<ValidationState>({
    errors: {},
    warnings: {},
    suggestions: {},
    isValidating: false,
    lastValidated: {}
  });
  
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(realTimeValidation);
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});
  
  // === SOLID: SRP - Validate single field ===
  const validateField = useCallback(async (
    fieldId: string, 
    value: any, 
    context: ValidationServiceContext
  ): Promise<ValidationResult> => {
    setState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = await service.validateField(fieldId, value, context);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldId]: result.errors
        },
        warnings: {
          ...prev.warnings,
          [fieldId]: result.warnings
        },
        suggestions: {
          ...prev.suggestions,
          [fieldId]: result.suggestions || []
        },
        lastValidated: {
          ...prev.lastValidated,
          [fieldId]: Date.now()
        }
      }));
      
      return result;
    } catch (error) {
      console.error(`Validation error for field ${fieldId}:`, error);
      return {
        isValid: false,
        errors: ['Validation error occurred'],
        warnings: []
      };
    } finally {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [service]);
  
  // === SOLID: SRP - Validate entire form ===
  const validateForm = useCallback(async (
    values: FormValues, 
    configs: FilterConfig[], 
    ageGroup: AgeGroupId
  ): Promise<ValidationErrors> => {
    setState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const errors = await service.validateForm(values, configs, ageGroup);
      
      setState(prev => ({
        ...prev,
        errors,
        lastValidated: configs.reduce((acc, config) => {
          acc[config.field] = Date.now();
          return acc;
        }, {} as Record<string, number>)
      }));
      
      return errors;
    } catch (error) {
      console.error('Form validation error:', error);
      return {};
    } finally {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [service]);
  
  // === SOLID: SRP - Debounced validation ===
  const debouncedValidateField = useCallback((
    fieldId: string, 
    value: any, 
    context: ValidationServiceContext
  ) => {
    // Clear existing timer for this field
    if (debounceTimers[fieldId]) {
      clearTimeout(debounceTimers[fieldId]);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      if (isRealTimeEnabled) {
        validateField(fieldId, value, context);
      }
    }, debounceDelay);
    
    setDebounceTimers(prev => ({
      ...prev,
      [fieldId]: timer
    }));
  }, [validateField, isRealTimeEnabled, debounceDelay, debounceTimers]);
  
  // === SOLID: SRP - Rule management ===
  const registerRules = useCallback((fieldId: string, rules: ValidationRule[]) => {
    service.registerRules(fieldId, rules);
  }, [service]);
  
  const clearRules = useCallback((fieldId: string) => {
    service.clearRules(fieldId);
  }, [service]);
  
  const getRules = useCallback((fieldId: string) => {
    return service.getRules(fieldId);
  }, [service]);
  
  // === SOLID: SRP - Enable/disable real-time validation ===
  const enableRealTimeValidation = useCallback((enabled: boolean) => {
    setIsRealTimeEnabled(enabled);
  }, []);
  
  // === SOLID: SRP - Clear field validation ===
  const clearFieldValidation = useCallback((fieldId: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldId]: []
      },
      warnings: {
        ...prev.warnings,
        [fieldId]: []
      },
      suggestions: {
        ...prev.suggestions,
        [fieldId]: []
      }
    }));
  }, []);
  
  // === SOLID: SRP - Clear all validation ===
  const clearAllValidation = useCallback(() => {
    setState({
      errors: {},
      warnings: {},
      suggestions: {},
      isValidating: false,
      lastValidated: {}
    });
  }, []);
  
  // === SOLID: SRP - Get validation summary ===
  const getValidationSummary = useCallback(() => {
    const totalErrors = Object.values(state.errors).reduce((sum, errors) => sum + errors.length, 0);
    const totalWarnings = Object.values(state.warnings).reduce((sum, warnings) => sum + warnings.length, 0);
    const totalSuggestions = Object.values(state.suggestions).reduce((sum, suggestions) => sum + suggestions.length, 0);
    
    return {
      totalErrors,
      totalWarnings,
      totalSuggestions,
      isValid: totalErrors === 0
    };
  }, [state]);
  
  // === SOLID: SRP - Cleanup timers on unmount ===
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    };
  }, [debounceTimers]);
  
  // === SOLID: SRP - Context value ===
  const contextValue = useMemo<ValidationContextType>(() => ({
    state,
    validateField,
    validateForm,
    registerRules,
    clearRules,
    getRules,
    enableRealTimeValidation,
    isRealTimeEnabled,
    debouncedValidateField,
    clearFieldValidation,
    clearAllValidation,
    getValidationSummary
  }), [
    state,
    validateField,
    validateForm,
    registerRules,
    clearRules,
    getRules,
    enableRealTimeValidation,
    isRealTimeEnabled,
    debouncedValidateField,
    clearFieldValidation,
    clearAllValidation,
    getValidationSummary
  ]);
  
  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
};

// === SOLID: SRP - Custom hook for validation context ===
export const useValidation = (): ValidationContextType => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

// === SOLID: SRP - Custom hook for field validation ===
export const useFieldValidation = (fieldId: string) => {
  const validation = useValidation();
  
  return useMemo(() => ({
    errors: validation.state.errors[fieldId] || [],
    warnings: validation.state.warnings[fieldId] || [],
    suggestions: validation.state.suggestions[fieldId] || [],
    isValidating: validation.state.isValidating,
    lastValidated: validation.state.lastValidated[fieldId],
    validate: (value: any, context: ValidationServiceContext) => 
      validation.validateField(fieldId, value, context),
    debouncedValidate: (value: any, context: ValidationServiceContext) => 
      validation.debouncedValidateField(fieldId, value, context),
    clearValidation: () => validation.clearFieldValidation(fieldId),
    registerRules: (rules: ValidationRule[]) => validation.registerRules(fieldId, rules),
    clearRules: () => validation.clearRules(fieldId),
    getRules: () => validation.getRules(fieldId)
  }), [fieldId, validation]);
};

// === SOLID: SRP - Export validation context type ===
export type { ValidationContextType, ValidationState }; 