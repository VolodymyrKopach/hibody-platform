/**
 * === SOLID: SRP - Single Responsibility ===
 * Hook responsible only for managing state and logic of generation form
 */

import { useState, useCallback, useMemo } from 'react';
import { AgeGroup, FormData } from '../types/generation';
import { formValidator } from '../services/generation/FormValidationService';
import { PromptGeneratorFactory } from '../services/generation/generators/PromptGenerators';

// === SOLID: ISP - Specialized interface for hook ===
interface UseGenerationFormOptions {
  onGenerate: (data: { ageGroup: AgeGroup; formData: FormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: FormData }) => void;
}

interface UseGenerationFormReturn {
  // State
  selectedAge: AgeGroup | null;
  formData: FormData;
  isFormValid: boolean;
  validationErrors: string[];
  
  // Actions
  handleAgeSelect: (age: AgeGroup) => void;
  handleFieldChange: (field: keyof FormData, value: string | string[] | boolean) => void;
  handleGenerate: () => void;
  handlePreview: () => void;
  resetForm: () => void;
}

// === SOLID: SRP - Default form data initialization ===
const getDefaultFormData = (ageGroup?: AgeGroup): FormData => {
  const base: FormData = {
    topic: '',
    difficulty: '',
    duration: '',
    activities: '',
    goals: '',
    lessonGoal: '',
    activityType: []
  };

  // === SOLID: OCP - Easily extensible for new age groups ===
  switch (ageGroup) {
    case '2-3':
      return {
        ...base,
        thematic24: '',
        audioSupport24: false,
        complexityLevel24: '',
        lessonDuration24: '',
        presentationStyle24: '',
        participationFormat24: '',
        visualEffects: [],
        presentationSpeed24: ''
      };
    case '4-6':
      return {
        ...base,
        thematic: '',
        taskTypes: [],
        language: '',
        learningGoal: '',
        complexityLevel: '',
        lessonDuration: '',
        presentationStyle: '',
        audioSupport: [],
        participationFormat: '',
        visualDesign: [],
        presentationSpeed: '',
        interactivity: '',
        educationalProgram: '',
        gradingSystem: ''
      };
    case '7-8':
      return {
        ...base,
        subject78: '',
        lessonFormat78: [],
        skills78: [],
        complexityLevel78: '',
        lessonDuration78: '',
        thematicOrientation78: '',
        pedagogicalGoal78: '',
        assessmentMethod78: '',
        audioSettings78: [],
        interactionType78: '',
        presentationStyle78: '',
        socialFormat78: '',
        platform78: [],
        visualStyle78: '',
        educationalProgram78: '',
        competencies78: []
      };
    case '9-10':
      return {
        ...base,
        subject910: '',
        complexity910: '',
        taskTypes910: [],
        learningGoal910: '',
        lessonDuration910: '',
        thematicOrientation910: '',
        pedagogicalApproach910: '',
        independenceLevel910: '',
        gradingSystem910: '',
        digitalTools910: [],
        visualDesign910: '',
        audioSettings910: '',
        interactionFormat910: '',
        studentRole910: '',
        educationalProgram910: '',
        keyCompetencies910: []
      };
    default:
      return base;
  }
};

// === SOLID: SRP - Main hook implementation ===
export const useGenerationForm = (options: UseGenerationFormOptions): UseGenerationFormReturn => {
  // === SOLID: SRP - State management ===
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [formData, setFormData] = useState<FormData>(getDefaultFormData());

  // === SOLID: SRP - Form validation ===
  const { isFormValid, validationErrors } = useMemo(() => {
    if (!selectedAge) {
      return { isFormValid: false, validationErrors: ['Please select age group'] };
    }

    const validationResult = formValidator.validateWithResult(selectedAge, formData);
    return { 
      isFormValid: validationResult.isValid, 
      validationErrors: validationResult.errors 
    };
  }, [selectedAge, formData]);

  // === SOLID: SRP - Age selection handler ===
  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAge(age);
    setFormData(getDefaultFormData(age));
  }, []);

  // === SOLID: SRP - Field change handler ===
  const handleFieldChange = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // === SOLID: SRP - Generation handler ===
  const handleGenerate = useCallback(() => {
    if (!selectedAge || !isFormValid) {
      return;
    }

    // Use the new PromptGenerators factory
    const promptGenerator = PromptGeneratorFactory.createGenerator(selectedAge);
    const detailedPrompt = promptGenerator.generatePrompt(selectedAge, formData);

    options.onGenerate({
      ageGroup: selectedAge,
      formData,
      detailedPrompt
    });
  }, [selectedAge, formData, isFormValid, options]);

  // === SOLID: SRP - Preview handler ===
  const handlePreview = useCallback(() => {
    if (!selectedAge || !isFormValid) {
      return;
    }

    options.onPreview({
      ageGroup: selectedAge,
      formData
    });
  }, [selectedAge, formData, isFormValid, options]);

  // === SOLID: SRP - Form reset ===
  const resetForm = useCallback(() => {
    setSelectedAge(null);
    setFormData(getDefaultFormData());
  }, []);

  return {
    selectedAge,
    formData,
    isFormValid,
    validationErrors,
    handleAgeSelect,
    handleFieldChange,
    handleGenerate,
    handlePreview,
    resetForm
  };
};

// === SOLID: SRP - Export default for convenience ===
export default useGenerationForm; 