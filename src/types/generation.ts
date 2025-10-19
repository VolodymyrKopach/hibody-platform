/**
 * === SOLID: ISP - Interface Segregation ===
 * Розділяємо інтерфейси на менші, більш спеціалізовані
 */

import { ComponentType } from 'react';

// === Базові типи ===
export type AgeGroup = '2-3' | '4-6' | '7-8' | '9-10' | '11-12' | '13-15' | '16-18';

export type FieldType = 'text' | 'select' | 'multiselect' | 'textarea' | 'checkbox';

// === Конфігурація полів ===
export interface FieldConfig {
  label: string;
  placeholder?: string;
  options?: string[];
  type: FieldType;
  section?: string;
  description?: string;
}

// === Конфігурація секцій ===
export interface SectionConfig {
  id: string;
  title: string;
  description: string;
}

// === Конфігурація вікових груп ===
export interface AgeGroupConfig {
  icon: ComponentType<{ size?: number }>;
  label: string;
  color: string;
  fields: Record<string, FieldConfig>;
  sections: SectionConfig[];
}

// === Base validator interface ===
export interface IFormValidator<T> {
  validate(formData: T): boolean;
  getValidationErrors(formData: T): string[];
}

// === Base form data interface ===
export interface BaseFormData {
  topic: string;
  // Common fields that all age groups have
}

// === Age-specific form data interfaces ===
export interface AgeGroup2to3FormData extends BaseFormData {
  thematic24?: string;
  // Other 2-3 specific fields
}

export interface AgeGroup4to6FormData extends BaseFormData {
  thematic?: string;
  // Other 4-6 specific fields
}

export interface AgeGroup7to8FormData extends BaseFormData {
  subject78?: string;
  // Other 7-8 specific fields
}

export interface AgeGroup9to10FormData extends BaseFormData {
  subject910?: string;
  // Other 9-10 specific fields
}

// === Форма даних ===
export interface FormData {
  // Базові поля
  topic: string;
  difficulty: string;
  duration: string;
  activities: string;
  goals: string;
  
  // Поля для 4-6 років
  thematic?: string;
  taskTypes?: string[];
  language?: string;
  learningGoal?: string;
  complexityLevel?: string;
  lessonDuration?: string;
  presentationStyle?: string;
  audioSupport?: string[];
  participationFormat?: string;
  visualDesign?: string[];
  presentationSpeed?: string;
  interactivity?: string;
  educationalProgram?: string;
  gradingSystem?: string;
  
  // Поля для 2-3 років
  lessonGoal?: string;
  activityType?: string[];
  thematic24?: string;
  audioSupport24?: boolean;
  complexityLevel24?: string;
  lessonDuration24?: string;
  presentationStyle24?: string;
  participationFormat24?: string;
  visualEffects?: string[];
  presentationSpeed24?: string;
  
  // Поля для 7-8 років
  subject78?: string;
  lessonFormat78?: string[];
  skills78?: string[];
  complexityLevel78?: string;
  lessonDuration78?: string;
  thematicOrientation78?: string;
  pedagogicalGoal78?: string;
  assessmentMethod78?: string;
  audioSettings78?: string[];
  interactionType78?: string;
  presentationStyle78?: string;
  socialFormat78?: string;
  platform78?: string[];
  visualStyle78?: string;
  educationalProgram78?: string;
  competencies78?: string[];

  // Поля для 9-10 років
  subject910?: string;
  complexity910?: string;
  taskTypes910?: string[];
  learningGoal910?: string;
  lessonDuration910?: string;
  thematicOrientation910?: string;
  pedagogicalApproach910?: string;
  independenceLevel910?: string;
  gradingSystem910?: string;
  digitalTools910?: string[];
  visualDesign910?: string;
  audioSettings910?: string;
  interactionFormat910?: string;
  studentRole910?: string;
  educationalProgram910?: string;
  keyCompetencies910?: string[];
  
  // Додаткова інформація (для всіх вікових груп)
  additionalInfo?: string;
}

// === Пропси компонентів ===
export interface SimpleGenerationFormProps {
  onGenerate: (data: { ageGroup: AgeGroup; formData: FormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: FormData }) => void;
}

export interface AgeGroupSelectorProps {
  selectedAge: AgeGroup | null;
  onAgeSelect: (age: AgeGroup) => void;
}

export interface GenerationFormProps {
  ageGroup: AgeGroup;
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: string | string[] | boolean) => void;
  onGenerate: () => void;
  onPreview: () => void;
  isFormValid: boolean;
}

export interface FieldRendererProps {
  fieldKey: string;
  fieldConfig: FieldConfig;
  value: string | string[] | boolean;
  onChange: (value: string | string[] | boolean) => void;
} 