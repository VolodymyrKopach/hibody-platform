/**
 * === SOLID: SRP - Single Responsibility ===
 * Хук відповідальний лише за управління станом та логікою форми генерації
 */

import { useState, useCallback, useMemo } from 'react';
import { AgeGroup, FormData } from '../types/generation';
import { formValidator } from '../services/generation/FormValidationService';
import { promptGenerator } from '../services/generation/PromptGeneratorService';

// === SOLID: ISP - Спеціалізований інтерфейс для хука ===
interface UseGenerationFormOptions {
  onGenerate: (data: { ageGroup: AgeGroup; formData: FormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: FormData }) => void;
}

interface UseGenerationFormReturn {
  // Стан
  selectedAge: AgeGroup | null;
  formData: FormData;
  isFormValid: boolean;
  validationErrors: string[];
  
  // Дії
  handleAgeSelect: (age: AgeGroup) => void;
  handleFieldChange: (field: keyof FormData, value: string | string[] | boolean) => void;
  handleGenerate: () => void;
  handlePreview: () => void;
  resetForm: () => void;
}

// === SOLID: SRP - Початковий стан форми ===
const getInitialFormData = (): FormData => ({
  topic: '',
  difficulty: '',
  duration: '',
  activities: '',
  goals: ''
});

// === SOLID: SRP - Кастомний хук ===
export const useGenerationForm = ({ 
  onGenerate, 
  onPreview 
}: UseGenerationFormOptions): UseGenerationFormReturn => {
  
  // === SOLID: SRP - Стан форми ===
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  
  // === SOLID: SRP - Валідація форми ===
  const validationResult = useMemo(() => {
    if (!selectedAge) {
      return { isValid: false, errors: ['Оберіть вікову групу'] };
    }
    
    return formValidator.validateWithResult(selectedAge, formData);
  }, [selectedAge, formData]);
  
  const isFormValid = validationResult.isValid;
  const validationErrors = validationResult.errors;
  
  // === SOLID: SRP - Обробка вибору вікової групи ===
  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAge(age);
    // Скидаємо форму при зміні вікової групи
    setFormData(getInitialFormData());
  }, []);
  
  // === SOLID: SRP - Обробка зміни полів форми ===
  const handleFieldChange = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // === SOLID: SRP - Генерація уроку ===
  const handleGenerate = useCallback(() => {
    if (!selectedAge || !isFormValid) {
      console.warn('Cannot generate: form is invalid');
      return;
    }
    
    try {
      const detailedPrompt = promptGenerator.generatePrompt(selectedAge, formData);
      
      onGenerate({
        ageGroup: selectedAge,
        formData,
        detailedPrompt
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  }, [selectedAge, formData, isFormValid, onGenerate]);
  
  // === SOLID: SRP - Попередній перегляд ===
  const handlePreview = useCallback(() => {
    if (!selectedAge) {
      console.warn('Cannot preview: no age group selected');
      return;
    }
    
    onPreview({
      ageGroup: selectedAge,
      formData
    });
  }, [selectedAge, formData, onPreview]);
  
  // === SOLID: SRP - Скидання форми ===
  const resetForm = useCallback(() => {
    setSelectedAge(null);
    setFormData(getInitialFormData());
  }, []);
  
  return {
    // Стан
    selectedAge,
    formData,
    isFormValid,
    validationErrors,
    
    // Дії
    handleAgeSelect,
    handleFieldChange,
    handleGenerate,
    handlePreview,
    resetForm
  };
}; 