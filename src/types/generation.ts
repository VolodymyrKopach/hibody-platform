// === SOLID: SRP - Кожен тип має одну відповідальність ===

/**
 * Базова конфігурація шрифтів для вікової групи
 */
export interface FontConfig {
  primary: string;
  secondary: string;
  body: string;
}

/**
 * Конфігурація макету для вікової групи
 */
export interface LayoutConfig {
  elementsPerSlide: number;
  maxWords: number;
  spacing: 'compact' | 'normal' | 'spacious';
}

/**
 * Конфігурація аудіо для вікової групи
 */
export interface AudioConfig {
  required: boolean;
  types: ('narration' | 'music' | 'effects')[];
  volume: 'low' | 'medium' | 'high';
}

/**
 * Основна конфігурація вікової групи
 * SOLID: SRP - відповідає тільки за характеристики вікової групи
 */
export interface AgeGroupConfig {
  id: string;
  name: string;
  icon: string;
  ageRange: string;
  description: string;
  fontSize: FontConfig;
  layout: LayoutConfig;
  audio: AudioConfig;
  timeRange: string;
  complexity: 'simple' | 'medium' | 'complex';
}

/**
 * Опції для фільтрів
 */
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

/**
 * Конфігурація одного фільтра
 * SOLID: SRP - відповідає тільки за один фільтр
 */
export interface FilterConfig {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'radio' | 'checkbox' | 'text' | 'textarea';
  required: boolean;
  options?: FilterOption[];
  placeholder?: string;
  section?: string;
  width?: 'full' | 'half' | 'third';
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
}

/**
 * Група фільтрів для вікової групи
 * SOLID: ISP - специфічний інтерфейс для групи фільтрів
 */
export interface AgeGroupFilters {
  ageGroupId: string;
  groups: FilterGroup[];
}

/**
 * Логічна група фільтрів
 */
export interface FilterGroup {
  id: string;
  title: string;
  description?: string;
  filters: FilterConfig[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

/**
 * Значення форми
 */
export interface FormValues {
  [filterId: string]: any;
}

/**
 * Помилки валідації
 */
export interface ValidationErrors {
  [filterId: string]: string[];
}

/**
 * Стан форми
 * SOLID: SRP - відповідає тільки за стан форми
 */
export interface FormState {
  selectedAgeGroup: AgeGroupId;
  values: FormValues;
  errors: ValidationErrors;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Дані для превю
 * SOLID: SRP - відповідає тільки за превю
 */
export interface PreviewData {
  ageGroup: AgeGroupConfig;
  characteristics: {
    fontSize: FontConfig;
    layout: LayoutConfig;
    audio: AudioConfig;
    estimatedDuration: string;
  };
  sampleSlide: {
    title: string;
    content: string;
    elements: PreviewElement[];
  };
}

/**
 * Елемент превю слайду
 */
export interface PreviewElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'interactive';
  content: string;
  style: {
    fontSize: string;
    color: string;
    position: 'top' | 'center' | 'bottom';
  };
}

/**
 * Стан превю
 * SOLID: SRP - відповідає тільки за стан превю
 */
export interface PreviewState {
  visible: boolean;
  loading: boolean;
  data: PreviewData | null;
  error: string | null;
}

/**
 * Загальний стан конструктора генерації
 * SOLID: SRP - агрегує всі стани, але не містить логіки
 */
export interface GenerationConstructorState {
  form: FormState;
  preview: PreviewState;
  availableAgeGroups: AgeGroupConfig[];
  availableFilters: AgeGroupFilters[];
}

/**
 * Параметри для генерації контенту
 * SOLID: SRP - відповідає тільки за параметри генерації
 */
export interface GenerationParameters {
  ageGroup: string;
  filters: FormValues;
  requirements: {
    slideCount?: number;
    duration?: number;
    includeAudio: boolean;
    complexity: string;
  };
}

// === SOLID: OCP - Інтерфейси для розширення ===

/**
 * Базовий інтерфейс для валідатора
 * SOLID: DIP - залежимо від абстракції, не від конкретної реалізації
 */
export interface IValidator {
  validate(value: any, config: FilterConfig): string[];
  validateForm(values: FormValues, filters: FilterConfig[]): ValidationErrors;
}

/**
 * Інтерфейс для генератора превю
 * SOLID: DIP - залежимо від абстракції
 */
export interface IPreviewGenerator {
  generatePreview(ageGroup: AgeGroupConfig, values: FormValues): PreviewData;
  generateSampleSlide(ageGroup: AgeGroupConfig): PreviewElement[];
}

/**
 * Інтерфейс для менеджера конфігурацій
 * SOLID: DIP - залежимо від абстракції
 */
export interface IConfigManager {
  getAgeGroups(): AgeGroupConfig[];
  getFiltersForAge(ageGroupId: string): AgeGroupFilters;
  getDefaultValues(ageGroupId: string): FormValues;
}

// === Utility Types ===

/**
 * Тип для ID вікових груп
 */
export type AgeGroupId = '2-3' | '4-6' | '7-8' | '9-10';

/**
 * Тип для статусу форми
 */
export type FormStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

/**
 * Тип для подій форми
 */
export type FormEvent = 
  | { type: 'SET_AGE_GROUP'; payload: AgeGroupId }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value: any } }
  | { type: 'SET_ERRORS'; payload: ValidationErrors }
  | { type: 'RESET_FORM' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }; 