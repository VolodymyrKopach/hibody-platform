// === SOLID: ISP - Interface Segregation Principle ===
// Розділяємо інтерфейси за віковими групами для уникнення залежностей від невикористовуваних полів

export type AgeGroup = '2-3' | '4-6' | '7-8' | '9-10';

// Базовий інтерфейс для всіх форм
export interface BaseFormData {
  topic: string;
}

// Інтерфейс для конкретної вікової групи 2-3
export interface AgeGroup2to3FormData extends BaseFormData {
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
}

// Інтерфейс для конкретної вікової групи 4-6
export interface AgeGroup4to6FormData extends BaseFormData {
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
}

// Інтерфейс для конкретної вікової групи 7-8
export interface AgeGroup7to8FormData extends BaseFormData {
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
}

// Інтерфейс для конкретної вікової групи 9-10
export interface AgeGroup9to10FormData extends BaseFormData {
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
}

// Union type для всіх форм
export type FormData = AgeGroup2to3FormData | AgeGroup4to6FormData | AgeGroup7to8FormData | AgeGroup9to10FormData;

// === SOLID: LSP - Liskov Substitution Principle ===
// Всі конфігурації мають бути замінними через загальний інтерфейс

export interface FieldConfig {
  label: string;
  placeholder?: string;
  options?: string[];
  type: 'text' | 'select' | 'multiselect' | 'textarea' | 'checkbox';
  section?: string;
  description?: string;
  required?: boolean;
}

export interface SectionConfig {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface AgeGroupConfig {
  id: AgeGroup;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  color: string;
  fields: Record<string, FieldConfig>;
  sections: SectionConfig[];
}

// === SOLID: DIP - Dependency Inversion Principle ===
// Абстракції для роботи з формами

export interface IFormValidator<T extends BaseFormData> {
  validate(formData: T): boolean;
  getValidationErrors(formData: T): string[];
}

export interface IPromptGenerator<T extends BaseFormData> {
  generatePrompt(ageGroup: AgeGroup, formData: T): string;
}

export interface IAgeGroupConfigProvider {
  getConfig(ageGroup: AgeGroup): AgeGroupConfig;
  getAllConfigs(): AgeGroupConfig[];
}

// Props для компонентів
export interface GenerationFormProps<T extends BaseFormData> {
  onGenerate: (data: { ageGroup: AgeGroup; formData: T; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: T }) => void;
  configProvider: IAgeGroupConfigProvider;
  validator: IFormValidator<T>;
  promptGenerator: IPromptGenerator<T>;
} 