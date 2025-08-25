// Types for template generation system

export interface TemplateData {
  ageGroup: string;
  topic: string;
  slideCount: number;
  additionalInfo: string;
}

export interface GeneratedPlan {
  slides: SlideDescription[];
  totalDuration: string;
  difficulty: string;
  rawContent: string; // Full markdown content from AI
}

export interface SlideDescription {
  title: string;
  description: string;
  type: 'introduction' | 'content' | 'activity' | 'summary';
  estimatedDuration: number;
  hasInteraction: boolean;
  keyPoints: string[];
  customInstructions?: string;
}

// API Request/Response types
export interface LessonPlanRequest {
  ageGroup: string;
  topic: string;
  slideCount: number;
  additionalInfo?: string;
  language?: string;
}

export interface LessonPlanResponse {
  success: boolean;
  plan?: string;
  error?: {
    message: string;
    code: string;
  };
}

// Generation states
export type GenerationState = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationStatus {
  state: GenerationState;
  progress?: number;
  message?: string;
  error?: string;
}

// Step navigation
export interface StepProps {
  onNext?: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

// Template generation context
export interface TemplateGenerationContext {
  currentStep: number;
  templateData: TemplateData;
  generatedPlan: GeneratedPlan | null;
  generationStatus: GenerationStatus;
}

// New JSON-based lesson plan structure
export interface LessonPlanJSON {
  metadata: {
    title: string;
    targetAudience: string;
    duration: string;
    goal: string;
  };
  
  objectives: Array<{
    id: string;
    text: string;
    category?: 'knowledge' | 'skills' | 'attitude';
  }>;
  
  slides: Array<{
    slideNumber: number;
    type: 'Introduction' | 'Educational' | 'Activity' | 'Summary';
    title: string;
    goal: string;
    content: string; // Legacy field for backward compatibility
    duration?: string;
    interactiveElements?: string[];
    teacherNotes?: string;
    // New structured content
    structure?: {
      greeting?: {
        text: string;
        action?: string;
        tone?: string;
      };
      mainContent?: {
        text: string;
        keyPoints?: string[];
        visualElements?: string[];
      };
      interactions?: Array<{
        type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
        description: string;
        instruction: string;
        feedback?: string;
      }>;
      activities?: Array<{
        name: string;
        description: string;
        duration?: string;
        materials?: string[];
        expectedOutcome?: string;
      }>;
      teacherGuidance?: {
        preparation?: string[];
        delivery?: string[];
        adaptations?: string[];
        troubleshooting?: string[];
      };
    };
  }>;
  
  gameElements: Array<{
    id: string;
    name: string;
    description: string;
    type: 'movement' | 'cognitive' | 'creative' | 'social';
    duration?: string;
  }>;
  
  materials: Array<{
    id: string;
    name: string;
    quantity?: string;
    category: 'required' | 'optional';
    description?: string;
  }>;
  
  recommendations: Array<{
    id: string;
    category: 'preparation' | 'delivery' | 'adaptation';
    text: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Legacy structured lesson plan types (keep for backward compatibility)
export interface ParsedLessonPlan {
  title: string;
  metadata: LessonMetadata;
  objectives: string[];
  slides: ParsedSlide[];
  gameElements: string[];
  materials: string[];
  recommendations: string[];
  rawMarkdown?: string; // Keep original for fallback
}

export interface LessonMetadata {
  targetAudience: string;
  duration: string;
  goal: string;
}

export interface ParsedSlide {
  slideNumber: number;
  title: string;
  type: SlideType;
  goal: string;
  content: string;
}

export type SlideType = 'Introduction' | 'Educational' | 'Activity' | 'Summary';

// Slide type configuration for styling
export interface SlideTypeConfig {
  color: string;
  backgroundColor: string;
  icon: string;
  label: string;
}

// === Template Slide Generation Types ===

// Стани генерації слайдів
export type TemplateGenerationStatus = 'idle' | 'initializing' | 'generating' | 'paused' | 'completed' | 'error';

export type SlideGenerationStatus = 'pending' | 'generating' | 'completed' | 'error';

// Інтерфейс для прогресу генерації окремого слайду
export interface TemplateSlideProgress {
  slideId: string;
  slideNumber: number;
  title: string;
  status: SlideGenerationStatus;
  progress: number; // 0-100
  estimatedTime?: number; // в секундах
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

// Загальний прогрес генерації
export interface TemplateGenerationProgress {
  status: TemplateGenerationStatus;
  totalSlides: number;
  completedSlides: number;
  failedSlides: number;
  currentSlideNumber?: number;
  overallProgress: number; // 0-100
  estimatedTimeRemaining?: number; // в секундах
  startTime?: Date;
  endTime?: Date;
  slides: TemplateSlideProgress[];
}

// Налаштування генерації
export interface TemplateGenerationConfig {
  // Паралельність
  maxConcurrentSlides?: number;
  
  // Таймаути
  slideTimeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  
  // Якість
  imageQuality?: 'low' | 'medium' | 'high';
  generateThumbnails?: boolean;
  
  // Callbacks
  enableProgressCallbacks?: boolean;
  progressUpdateIntervalMs?: number;
  
  // Збереження
  autoSave?: boolean;
  saveInterval?: number;
}

// Результат генерації
export interface TemplateGenerationResult {
  success: boolean;
  lesson?: import('@/types/chat').SimpleLesson;
  stats?: import('@/services/chat/ParallelSlideGenerationService').GenerationStats;
  slideDescriptions?: import('@/types/chat').SlideDescription[];
  error?: string;
  progress?: TemplateGenerationProgress;
}

// Callbacks для генерації
export interface TemplateGenerationCallbacks {
  onSlideReady?: (slide: import('@/types/chat').SimpleSlide, lesson: import('@/types/chat').SimpleLesson) => void;
  onProgressUpdate?: (progress: import('@/types/chat').SlideGenerationProgress[]) => void;
  onSlideError?: (error: string, slideNumber: number) => void;
  onComplete?: (lesson: import('@/types/chat').SimpleLesson, stats: import('@/services/chat/ParallelSlideGenerationService').GenerationStats) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: TemplateGenerationStatus) => void;
}

// Стан template генерації для UI
export interface TemplateGenerationUIState {
  // Основний стан
  isGenerating: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Дані
  currentLesson?: import('@/types/chat').SimpleLesson | null;
  slides: import('@/types/chat').SimpleSlide[];
  progress: TemplateGenerationProgress;
  
  // UI стан
  selectedSlideId?: string;
  currentPreviewIndex: number;
  showPreview: boolean;
  
  // Нотифікації
  notifications: TemplateNotification[];
}

// Нотифікації для template flow
export interface TemplateNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // в мілісекундах, undefined = не зникає автоматично
  actions?: TemplateNotificationAction[];
}

export interface TemplateNotificationAction {
  label: string;
  action: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

// Налаштування UI компонентів
export interface TemplateSlideGridConfig {
  columns?: number;
  showProgress?: boolean;
  showStats?: boolean;
  compact?: boolean;
  autoScroll?: boolean;
  selectionMode?: 'single' | 'multiple' | 'none';
}

export interface TemplatePreviewConfig {
  aspectRatio?: '16:9' | '4:3' | '1:1';
  showNavigation?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  showThumbnails?: boolean;
}

export interface TemplateControlsConfig {
  showDetailedStats?: boolean;
  showEstimatedTime?: boolean;
  compact?: boolean;
  enablePause?: boolean;
  enableStop?: boolean;
  enableRestart?: boolean;
}

// Контекст для template генерації
export interface TemplateGenerationContext {
  // Дані
  templateData: TemplateData;
  generatedPlan: string;
  
  // Стан
  uiState: TemplateGenerationUIState;
  config: TemplateGenerationConfig;
  
  // Методи
  actions: {
    startGeneration: () => Promise<TemplateGenerationResult>;
    pauseGeneration: () => void;
    resumeGeneration: () => void;
    stopGeneration: () => void;
    restartGeneration: () => Promise<TemplateGenerationResult>;
    selectSlide: (slideId: string) => void;
    setPreviewIndex: (index: number) => void;
    addNotification: (notification: Omit<TemplateNotification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    updateConfig: (config: Partial<TemplateGenerationConfig>) => void;
  };
}

// Помічники для роботи з типами
export namespace TemplateGenerationTypes {
  export const isGenerating = (status: TemplateGenerationStatus): boolean => {
    return status === 'generating' || status === 'initializing';
  };
  
  export const isCompleted = (status: TemplateGenerationStatus): boolean => {
    return status === 'completed';
  };
  
  export const hasError = (status: TemplateGenerationStatus): boolean => {
    return status === 'error';
  };
  
  export const canPause = (status: TemplateGenerationStatus): boolean => {
    return status === 'generating';
  };
  
  export const canResume = (status: TemplateGenerationStatus): boolean => {
    return status === 'paused';
  };
  
  export const canRestart = (status: TemplateGenerationStatus): boolean => {
    return status === 'completed' || status === 'error';
  };
}

// === MVP Lesson Creation Global State Types ===

export type LessonCreationStep = 1 | 2 | 3;

export interface LessonCreationState {
  currentStep: LessonCreationStep;
  completedSteps: Set<LessonCreationStep>;
  templateData: TemplateData;
  generatedPlan: string | null;
  generatedLesson: import('@/types/chat').SimpleLesson | null;
  isLoading: boolean;
  error: string | null;
  // Generation state persistence
  slideGenerationState: {
    isGenerating: boolean;
    isCompleted: boolean;
    hasError: boolean;
    errorMessage: string;
    slides: import('@/types/chat').SimpleSlide[];
    currentLesson: import('@/types/chat').SimpleLesson | null;
    slideProgresses: import('@/types/chat').SlideGenerationProgress[];
  };
}

export interface LessonCreationContextValue {
  state: LessonCreationState;
  setCurrentStep: (step: LessonCreationStep) => void;
  updateTemplateData: (data: Partial<TemplateData>) => void;
  setGeneratedPlan: (plan: string) => void;
  setGeneratedLesson: (lesson: import('@/types/chat').SimpleLesson) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGeneratedPlan: () => void;
  clearGeneratedLesson: () => void;
  resetState: () => void;
  // Slide generation state management
  updateSlideGenerationState: (state: Partial<LessonCreationState['slideGenerationState']>) => void;
  clearSlideGenerationState: () => void;
  // Step completion management
  markStepCompleted: (step: LessonCreationStep) => void;
  canNavigateToStep: (step: LessonCreationStep) => boolean;
}
