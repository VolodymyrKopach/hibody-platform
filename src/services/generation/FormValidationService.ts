/**
 * === SOLID: SRP - Single Responsibility ===
 * Сервіс відповідальний лише за валідацію форм для різних вікових груп
 */

import { AgeGroup, FormData } from '../../types/generation';

// === SOLID: DIP - Абстракція для валідатора форм ===
export interface IFormValidator {
  validate(ageGroup: AgeGroup, formData: FormData): boolean;
  getValidationErrors(ageGroup: AgeGroup, formData: FormData): string[];
}

// === SOLID: SRP - Результат валідації ===
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// === SOLID: SRP - Конкретна реалізація валідатора ===
export class FormValidationService implements IFormValidator {
  
  validate(ageGroup: AgeGroup, formData: FormData): boolean {
    const errors = this.getValidationErrors(ageGroup, formData);
    return errors.length === 0;
  }

  getValidationErrors(ageGroup: AgeGroup, formData: FormData): string[] {
    // === SOLID: OCP - Легко розширюється новими правилами валідації ===
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

  // === SOLID: SRP - Публічний метод для отримання результату валідації ===
  validateWithResult(ageGroup: AgeGroup, formData: FormData): ValidationResult {
    const errors = this.getValidationErrors(ageGroup, formData);
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // === SOLID: SRP - Окремі методи валідації для кожної вікової групи ===
  
  private validateFor2to3(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Перевіряємо, чи заповнена хоча б одна з основних полів
    if (!formData.thematic24?.trim() && !formData.topic?.trim()) {
      errors.push('Оберіть тематику або введіть власну тему');
    }
    
    // Перевіряємо специфічні для 2-3 років поля
    if (formData.lessonDuration24 && formData.lessonDuration24.includes('Довга - 5-7 хвилин')) {
      // Це може бути занадто довго для 2-3 років, але не критично
      // Можна додати попередження, але не помилку
    }
    
    return errors;
  }

  private validateFor4to6(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Перевіряємо, чи заповнена хоча б одна з основних полів
    if (!formData.thematic?.trim() && !formData.topic?.trim()) {
      errors.push('Оберіть тематику або введіть власну тему');
    }
    
    // Перевіряємо логічні комбінації
    if (formData.complexityLevel === '🎯 Просунутий - 7-8 елементів, складні завдання' && 
        formData.lessonDuration === '⚡ Коротка - 3-5 хвилин') {
      errors.push('Просунутий рівень складності потребує більше часу ніж 3-5 хвилин');
    }
    
    // Перевіряємо відповідність мови та тематики
    if (formData.language === '🇬🇧 Англійська - перші кроки' && 
        formData.thematic?.includes('Українська')) {
      errors.push('Англійська мова не підходить для української тематики');
    }
    
    return errors;
  }

  private validateFor7to8(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Перевіряємо, чи заповнена хоча б одна з основних полів
    if (!formData.subject78?.trim() && !formData.topic?.trim()) {
      errors.push('Оберіть предмет або введіть власну тему');
    }
    
    // Перевіряємо відповідність предмета та навичок
    if (formData.subject78?.includes('Математика') && 
        formData.skills78?.includes('🗣️ Усне мовлення')) {
      // Це не критично, але може бути незвично
    }
    
    // Перевіряємо відповідність складності та класу
    if (formData.complexityLevel78 === '📖 2-й клас - програма другого класу' && 
        formData.lessonDuration78 === '⚡ Коротка - 5-7 хвилин') {
      errors.push('Програма другого класу потребує більше часу ніж 5-7 хвилин');
    }
    
    // Перевіряємо платформу та вікову групу
    if (formData.platform78?.includes('📞 Телефон') && 
        formData.interactionType78 === '🖊️ Письмо від руки') {
      errors.push('Письмо від руки неможливе на телефоні');
    }
    
    return errors;
  }

  private validateFor9to10(formData: FormData): string[] {
    const errors: string[] = [];
    
    // Перевіряємо, чи заповнена хоча б одна з основних полів
    if (!formData.subject910?.trim() && !formData.topic?.trim()) {
      errors.push('Оберіть предмет або введіть власну тему');
    }
    
    // Перевіряємо відповідність складності та тривалості
    if (formData.complexity910 === '🎯 Олімпіадна - для обдарованих учнів' && 
        formData.lessonDuration910 === '⚡ Швидка перевірка - 5-10 хвилин') {
      errors.push('Олімпіадні завдання потребують більше часу ніж 5-10 хвилин');
    }
    
    // Перевіряємо відповідність педагогічного підходу та рівня самостійності
    if (formData.pedagogicalApproach910 === '👨‍🏫 Під керівництвом - крок за кроком з вчителем' && 
        formData.independenceLevel910 === '🔬 Дослідницька - повна самостійність') {
      errors.push('Педагогічний підхід "під керівництвом" не поєднується з повною самостійністю');
    }
    
    // Перевіряємо відповідність цифрових інструментів та аудіо налаштувань
    if (formData.digitalTools910?.includes('🎤 Аудіозаписи') && 
        formData.audioSettings910 === '🔕 Без звуку - тільки текст та зображення') {
      errors.push('Неможливо використовувати аудіозаписи без звуку');
    }
    
    // Перевіряємо відповідність ролі учня та формату взаємодії
    if (formData.studentRole910 === '👤 Індивідуальний - самостійна робота' && 
        formData.interactionFormat910 === '👥 Клас - вся група разом') {
      errors.push('Індивідуальна роль учня не поєднується з груповою взаємодією');
    }
    
    return errors;
  }

  // === SOLID: SRP - Допоміжні методи валідації ===
  
  private isFieldEmpty(value: string | string[] | boolean | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'boolean') return false; // boolean завжди має значення
    return true;
  }

  private hasMinimumRequiredFields(formData: FormData, requiredFields: (keyof FormData)[]): boolean {
    return requiredFields.some(field => !this.isFieldEmpty(formData[field]));
  }
}

// === SOLID: SRP - Singleton instance ===
export const formValidator = new FormValidationService(); 