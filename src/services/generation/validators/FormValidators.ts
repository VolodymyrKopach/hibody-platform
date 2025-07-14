// === SOLID: SRP - Single Responsibility Principle ===
// Кожен валідатор відповідає тільки за валідацію своєї вікової групи

import { 
  BaseFormData,
  AgeGroup2to3FormData,
  AgeGroup4to6FormData,
  AgeGroup7to8FormData,
  AgeGroup9to10FormData,
  IFormValidator
} from '../../../types/generation';

// === SOLID: DIP - Dependency Inversion Principle ===
// Реалізуємо абстракцію IFormValidator

export abstract class BaseFormValidator<T extends BaseFormData> implements IFormValidator<T> {
  abstract validate(formData: T): boolean;
  abstract getValidationErrors(formData: T): string[];
  
  protected isEmpty(value: string | undefined): boolean {
    return !value || value.trim().length === 0;
  }
  
  protected isEmptyArray(value: string[] | undefined): boolean {
    return !value || value.length === 0;
  }
  
  protected hasValidTopic(formData: BaseFormData): boolean {
    return !this.isEmpty(formData.topic);
  }
}

export class AgeGroup2to3Validator extends BaseFormValidator<AgeGroup2to3FormData> {
  validate(formData: AgeGroup2to3FormData): boolean {
    // Для 2-3 років потрібно або тематику, або власну тему
    return this.hasValidTopic(formData) || !this.isEmpty(formData.thematic24);
  }
  
  getValidationErrors(formData: AgeGroup2to3FormData): string[] {
    const errors: string[] = [];
    
    if (!this.hasValidTopic(formData) && this.isEmpty(formData.thematic24)) {
      errors.push('Оберіть тематику або введіть власну тему');
    }
    
    return errors;
  }
}

export class AgeGroup4to6Validator extends BaseFormValidator<AgeGroup4to6FormData> {
  validate(formData: AgeGroup4to6FormData): boolean {
    // Для 4-6 років потрібно або тематику, або власну тему
    return this.hasValidTopic(formData) || !this.isEmpty(formData.thematic);
  }
  
  getValidationErrors(formData: AgeGroup4to6FormData): string[] {
    const errors: string[] = [];
    
    if (!this.hasValidTopic(formData) && this.isEmpty(formData.thematic)) {
      errors.push('Оберіть тематику або введіть власну тему');
    }
    
    return errors;
  }
}

export class AgeGroup7to8Validator extends BaseFormValidator<AgeGroup7to8FormData> {
  validate(formData: AgeGroup7to8FormData): boolean {
    // Для 7-8 років потрібно або предмет, або власну тему
    return this.hasValidTopic(formData) || !this.isEmpty(formData.subject78);
  }
  
  getValidationErrors(formData: AgeGroup7to8FormData): string[] {
    const errors: string[] = [];
    
    if (!this.hasValidTopic(formData) && this.isEmpty(formData.subject78)) {
      errors.push('Оберіть предмет або введіть власну тему');
    }
    
    return errors;
  }
}

export class AgeGroup9to10Validator extends BaseFormValidator<AgeGroup9to10FormData> {
  validate(formData: AgeGroup9to10FormData): boolean {
    // Для 9-10 років потрібно або предмет, або власну тему
    return this.hasValidTopic(formData) || !this.isEmpty(formData.subject910);
  }
  
  getValidationErrors(formData: AgeGroup9to10FormData): string[] {
    const errors: string[] = [];
    
    if (!this.hasValidTopic(formData) && this.isEmpty(formData.subject910)) {
      errors.push('Оберіть предмет або введіть власну тему');
    }
    
    return errors;
  }
}

// === SOLID: Factory Pattern + DIP ===
// Фабрика для створення валідаторів

export class ValidatorFactory {
  static createValidator(ageGroup: string): IFormValidator<any> {
    switch (ageGroup) {
      case '2-3':
        return new AgeGroup2to3Validator();
      case '4-6':
        return new AgeGroup4to6Validator();
      case '7-8':
        return new AgeGroup7to8Validator();
      case '9-10':
        return new AgeGroup9to10Validator();
      default:
        throw new Error(`No validator found for age group: ${ageGroup}`);
    }
  }
} 