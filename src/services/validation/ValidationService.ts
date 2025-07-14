import { FilterConfig, FormValues, ValidationErrors, AgeGroupId } from '@/types/generation';

// === SOLID: SRP - Validation result interface ===
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// === SOLID: SRP - Validation rule interface ===
export interface ValidationRule {
  name: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  validate: (value: any, context?: ValidationContext) => boolean | Promise<boolean>;
  dependencies?: string[];
  conditions?: ValidationCondition[];
}

// === SOLID: SRP - Validation context for complex rules ===
export interface ValidationContext {
  fieldId: string;
  config: FilterConfig;
  formValues: FormValues;
  ageGroup: AgeGroupId;
  otherFields?: FormValues;
}

// === SOLID: SRP - Conditional validation ===
export interface ValidationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
}

// === SOLID: SRP - Validation strategy interface ===
export interface ValidationStrategy {
  validateField(fieldId: string, value: any, context: ValidationContext): Promise<ValidationResult>;
  validateForm(values: FormValues, configs: FilterConfig[], ageGroup: AgeGroupId): Promise<ValidationErrors>;
}

// === SOLID: SRP - Built-in validation rules ===
export class ValidationRules {
  
  // === SOLID: SRP - Required field validation ===
  static required(): ValidationRule {
    return {
      name: 'required',
      message: 'This field is required',
      severity: 'error',
      validate: (value: any) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== '';
      }
    };
  }
  
  // === SOLID: SRP - String length validation ===
  static stringLength(min?: number, max?: number): ValidationRule {
    return {
      name: 'length',
      message: `Length must be ${min ? `at least ${min}` : ''}${min && max ? ' and ' : ''}${max ? `at most ${max}` : ''} characters`,
      severity: 'error',
      validate: (value: string) => {
        if (!value) return true; // Let required rule handle empty values
        const len = value.length;
        return (!min || len >= min) && (!max || len <= max);
      }
    };
  }
  
  // === SOLID: SRP - Pattern validation ===
  static pattern(regex: RegExp, message?: string): ValidationRule {
    return {
      name: 'pattern',
      message: message || 'Invalid format',
      severity: 'error',
      validate: (value: string) => {
        if (!value) return true; // Let required rule handle empty values
        return regex.test(value);
      }
    };
  }
  
  // === SOLID: SRP - Email validation ===
  static email(): ValidationRule {
    return ValidationRules.pattern(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    );
  }
  
  // === SOLID: SRP - Number validation ===
  static number(min?: number, max?: number): ValidationRule {
    return {
      name: 'number',
      message: `Must be a number${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`,
      severity: 'error',
      validate: (value: any) => {
        if (!value) return true;
        const num = Number(value);
        if (isNaN(num)) return false;
        return (min === undefined || num >= min) && (max === undefined || num <= max);
      }
    };
  }
  
  // === SOLID: SRP - Array validation ===
  static arrayLength(min?: number, max?: number): ValidationRule {
    return {
      name: 'arrayLength',
      message: `Select ${min ? `at least ${min}` : ''}${min && max ? ' and ' : ''}${max ? `at most ${max}` : ''} items`,
      severity: 'error',
      validate: (value: any[]) => {
        if (!Array.isArray(value)) return false;
        const len = value.length;
        return (!min || len >= min) && (!max || len <= max);
      }
    };
  }
  
  // === SOLID: SRP - Custom validation ===
  static custom(
    validator: (value: any, context?: ValidationContext) => boolean | Promise<boolean>,
    message: string,
    severity: 'error' | 'warning' | 'info' = 'error'
  ): ValidationRule {
    return {
      name: 'custom',
      message,
      severity,
      validate: validator
    };
  }
  
  // === SOLID: SRP - Conditional validation ===
  static conditional(
    conditions: ValidationCondition[],
    rule: ValidationRule
  ): ValidationRule {
    return {
      ...rule,
      name: `conditional_${rule.name}`,
      conditions,
      validate: async (value: any, context?: ValidationContext) => {
        if (!context) return true;
        
        // Check if all conditions are met
        for (const condition of conditions) {
          const fieldValue = context.formValues[condition.field];
          if (!ValidationRules.evaluateCondition(fieldValue, condition)) {
            return true; // Condition not met, validation passes
          }
        }
        
        // All conditions met, apply the rule
        return await rule.validate(value, context);
      }
    };
  }
  
  // === SOLID: SRP - Evaluate condition ===
  static evaluateCondition(value: any, condition: ValidationCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return Array.isArray(value) ? value.includes(condition.value) : String(value).includes(condition.value);
      case 'not_contains':
        return Array.isArray(value) ? !value.includes(condition.value) : !String(value).includes(condition.value);
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  }
}

// === SOLID: SRP - Main validation service ===
export class ValidationService implements ValidationStrategy {
  private rules: Map<string, ValidationRule[]> = new Map();
  
  // === SOLID: SRP - Register validation rules for a field ===
  registerRules(fieldId: string, rules: ValidationRule[]): void {
    this.rules.set(fieldId, rules);
  }
  
  // === SOLID: SRP - Clear rules for a field ===
  clearRules(fieldId: string): void {
    this.rules.delete(fieldId);
  }
  
  // === SOLID: SRP - Get rules for a field ===
  getRules(fieldId: string): ValidationRule[] {
    return this.rules.get(fieldId) || [];
  }
  
  // === SOLID: SRP - Auto-generate rules from config ===
  generateRulesFromConfig(config: FilterConfig): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    // Required validation
    if (config.required) {
      rules.push(ValidationRules.required());
    }
    
    // Length validation for text fields
    if (config.type === 'text' || config.type === 'textarea') {
      if (config.validation?.minLength || config.validation?.maxLength) {
        rules.push(ValidationRules.stringLength(config.validation.minLength, config.validation.maxLength));
      }
    }
    
    // Array length validation for multi-select fields
    if (config.type === 'multiselect' || config.type === 'checkbox') {
      // You can add min/max selection rules here
    }
    
    // Pattern validation
    if (config.validation?.pattern) {
      const patterns = {
        email: ValidationRules.email(),
        number: ValidationRules.number(),
        phone: ValidationRules.pattern(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
      };
      
      const patternRule = patterns[config.validation.pattern as keyof typeof patterns];
      if (patternRule) {
        rules.push(patternRule);
      }
    }
    
    // Custom validation
    if (config.validation?.custom) {
      rules.push(ValidationRules.custom(
        config.validation.custom,
        'Invalid value'
      ));
    }
    
    return rules;
  }
  
  // === SOLID: SRP - Validate single field ===
  async validateField(fieldId: string, value: any, context: ValidationContext): Promise<ValidationResult> {
    const rules = this.getRules(fieldId);
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    for (const rule of rules) {
      try {
        // Check conditions if any
        if (rule.conditions) {
          const conditionsMet = rule.conditions.every(condition => 
            ValidationRules.evaluateCondition(context.formValues[condition.field], condition)
          );
          if (!conditionsMet) continue;
        }
        
        const isValid = await rule.validate(value, context);
        
        if (!isValid) {
          switch (rule.severity) {
            case 'error':
              errors.push(rule.message);
              break;
            case 'warning':
              warnings.push(rule.message);
              break;
            case 'info':
              suggestions.push(rule.message);
              break;
          }
        }
      } catch (error) {
        console.error(`Validation error for rule ${rule.name}:`, error);
        errors.push('Validation error occurred');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  // === SOLID: SRP - Validate entire form ===
  async validateForm(values: FormValues, configs: FilterConfig[], ageGroup: AgeGroupId): Promise<ValidationErrors> {
    const errors: ValidationErrors = {};
    
    for (const config of configs) {
      const fieldId = config.field;
      const fieldValue = values[fieldId];
      
      // Generate rules if not already registered
      if (!this.rules.has(fieldId)) {
        const autoRules = this.generateRulesFromConfig(config);
        this.registerRules(fieldId, autoRules);
      }
      
      const context: ValidationContext = {
        fieldId,
        config,
        formValues: values,
        ageGroup,
        otherFields: values
      };
      
      const result = await this.validateField(fieldId, fieldValue, context);
      
      if (!result.isValid) {
        errors[fieldId] = result.errors;
      }
    }
    
    return errors;
  }
  
  // === SOLID: SRP - Validate with dependencies ===
  async validateWithDependencies(fieldId: string, value: any, context: ValidationContext): Promise<ValidationResult> {
    const rules = this.getRules(fieldId);
    const dependentFields = new Set<string>();
    
    // Find all dependent fields
    for (const rule of rules) {
      if (rule.dependencies) {
        rule.dependencies.forEach(dep => dependentFields.add(dep));
      }
    }
    
    // Validate current field
    const result = await this.validateField(fieldId, value, context);
    
    // Re-validate dependent fields
    for (const depFieldId of dependentFields) {
      const depValue = context.formValues[depFieldId];
      const depResult = await this.validateField(depFieldId, depValue, context);
      
      // You can handle dependent field validation results here
      // For now, we just validate the current field
    }
    
    return result;
  }
}

// === SOLID: SRP - Export singleton instance ===
export const validationService = new ValidationService(); 