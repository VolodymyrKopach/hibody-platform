/**
 * === SOLID: SRP - Single Responsibility ===
 * The service is responsible only for validating forms for different age groups
 */

import { AgeGroup, FormData } from '../../types/generation';

// === SOLID: DIP - Abstraction for form validator ===
export interface IFormValidator {
  validate(ageGroup: AgeGroup, formData: FormData): boolean;
  getValidationErrors(ageGroup: AgeGroup, formData: FormData): string[];
}

// === SOLID: SRP - Validation Result ===
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// === SOLID: SRP - Concrete validator implementation ===
export class FormValidationService implements IFormValidator {
  
  validate(ageGroup: AgeGroup, formData: FormData): boolean {
    const errors = this.getValidationErrors(ageGroup, formData);
    return errors.length === 0;
  }

  getValidationErrors(ageGroup: AgeGroup, formData: FormData): string[] {
    // === SOLID: OCP - Easily extensible with new validation rules ===
    switch (ageGroup) {
      case '2-3':
        return this.validateFor2to3(formData);
      case '4-6':
        return this.validateFor4to6(formData);
      case '7-8':
        return this.validateFor7to8(formData);
      case '9-10':
        return this.validateFor9to10(formData);
      default:
        return [`Unsupported age group: ${ageGroup}`];
    }
  }

  // === SOLID: SRP - Public method to get validation result ===
  validateWithResult(ageGroup: AgeGroup, formData: FormData): ValidationResult {
    const errors = this.getValidationErrors(ageGroup, formData);
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // === SOLID: SRP - Separate validation methods for each age group ===
  
  private validateFor2to3(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Check if at least one of the main fields is filled
    if (!formData.thematic24?.trim() && !formData.topic?.trim()) {
      errors.push('Select a thematic or enter your own theme');
    }
    
    // Check specific fields for 2-3 years
    if (formData.lessonDuration24 && formData.lessonDuration24.includes('Long - 5-7 minutes')) {
      // This might be too long for 2-3 years, but not critical
      // Can add a warning, but not an error
    }
    
    return errors;
  }

  private validateFor4to6(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Check if at least one of the main fields is filled
    if (!formData.thematic?.trim() && !formData.topic?.trim()) {
      errors.push('Select a thematic or enter your own theme');
    }
    
    // Check logical combinations
    if (formData.complexityLevel === '🎯 Advanced - 7-8 elements, complex tasks' && 
        formData.lessonDuration === '⚡ Short - 3-5 minutes') {
      errors.push('Advanced complexity level requires more than 3-5 minutes');
    }
    
    // Check language and thematic consistency
    if (formData.language === '🇬🇧 English - first steps' && 
        formData.thematic?.includes('Ukrainian')) {
      errors.push('English language is not suitable for Ukrainian thematic');
    }
    
    return errors;
  }

  private validateFor7to8(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Check if at least one of the main fields is filled
    if (!formData.subject78?.trim() && !formData.topic?.trim()) {
      errors.push('Select a subject or enter your own theme');
    }
    
    // Check subject and skill consistency
    if (formData.subject78?.includes('Mathematics') && 
        formData.skills78?.includes('🎤 Oral speech')) {
      // This is not critical, but might be unusual
    }
    
    // Check complexity and class consistency
    if (formData.complexityLevel78 === '📖 2nd grade - second grade curriculum' && 
        formData.lessonDuration78 === '⚡ Short - 5-7 minutes') {
      errors.push('Second grade curriculum requires more than 5-7 minutes');
    }
    
    // Check platform and age group consistency
    if (formData.platform78?.includes('📞 Phone') && 
        formData.interactionType78 === '🖊️ Handwriting') {
      errors.push('Handwriting is not possible on the phone');
    }
    
    return errors;
  }

  private validateFor9to10(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Check if at least one of the main fields is filled
    if (!formData.subject910?.trim() && !formData.topic?.trim()) {
      errors.push('Select a subject or enter your own theme');
    }
    
    // Check complexity and duration consistency
    if (formData.complexity910 === '🎯 Olympiad - for gifted students' && 
        formData.lessonDuration910 === '⚡ Quick check - 5-10 minutes') {
      errors.push('Olympiad tasks require more than 5-10 minutes');
    }
    
    // Check pedagogical approach and independence level consistency
    if (formData.pedagogicalApproach910 === '👨‍🏫 Under guidance - step by step with teacher' && 
        formData.independenceLevel910 === '🔬 Research - full independence') {
      errors.push('"Under guidance" pedagogical approach is not compatible with full independence');
    }
    
    // Check digital tools and audio settings consistency
    if (formData.digitalTools910?.includes('🎤 Audio recordings') && 
        formData.audioSettings910 === '🔕 Silent - text and images only') {
      errors.push('Cannot use audio recordings without sound');
    }
    
    // Check student role and interaction format consistency
    if (formData.studentRole910 === '👤 Individual - independent work' && 
        formData.interactionFormat910 === '👥 Class - whole group together') {
      errors.push('Individual student role is not compatible with group interaction');
    }
    
    return errors;
  }

  // === SOLID: SRP - Helper validation methods ===
  
  private isFieldEmpty(value: string | string[] | boolean | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'boolean') return false; // boolean always has a value
    return true;
  }

  private hasMinimumRequiredFields(formData: FormData, requiredFields: (keyof FormData)[]): boolean {
    return requiredFields.some(field => !this.isFieldEmpty(formData[field]));
  }
}

// === SOLID: SRP - Singleton instance ===
export const formValidator = new FormValidationService(); 