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

export interface GeneratedPlanResponse {
  success: boolean;
  plan: {
    metadata: {
      title: string;
      targetAudience: string;
      duration: string;
      goal: string;
    };
    objectives: Array<{
      id: string;
      text: string;
      category: string;
    }>;
    slides: Array<{
      slideNumber: number;
      type: string;
      title: string;
      goal: string;
      content: string;
      duration: string;
      interactiveElements: string[];
      teacherNotes: string;
      structure: any; // Складна структура слайду
    }>;
    gameElements: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      duration: string;
    }>;
    materials: Array<{
      id: string;
      name: string;
      quantity: string;
      category: string;
      description: string;
    }>;
    recommendations: Array<{
      id: string;
      category: string;
      text: string;
      priority: string;
    }>;
  };
}

export interface SlideDescription {
  slideNumber?: number;
  title: string;
  description: string;
  type: 'introduction' | 'content' | 'activity' | 'summary';
  estimatedDuration?: number;
  hasInteraction?: boolean;
  keyPoints?: string[];
  customInstructions?: string;
  
  // Enhanced slide structure from lesson plan
  slideStructure?: {
    goal?: string;
    duration?: string;
    interactiveElements?: string[];
    teacherNotes?: string;
    
    // Detailed structure from lesson plan
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
  };
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
export interface TemplateGenerationContextV2 {
  // Дані
  templateData: TemplateData;
  generatedPlan: GeneratedPlanResponse;
  
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

// === Plan Editing System Types ===

export type CommentSectionType = 'slide' | 'objective' | 'material' | 'game' | 'recommendation' | 'general';

export interface PlanComment {
  id: string;
  sectionType: CommentSectionType;
  sectionId?: string; // ID слайду, об'єктиву тощо
  comment: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'applied' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
}

export interface PlanEditingState {
  isEditingMode: boolean;
  selectedSection: string | null;
  pendingComments: PlanComment[];
  isProcessingComments: boolean;
  lastEditTimestamp: Date | null;
  editHistory: PlanEditHistoryEntry[];
}

export interface PlanEditHistoryEntry {
  id: string;
  timestamp: Date;
  originalPlan: GeneratedPlanResponse;
  editedPlan: GeneratedPlanResponse;
  appliedComments: PlanComment[];
  success: boolean;
  error?: string;
}

export interface PlanEditRequest {
  originalPlan: string;
  comments: Array<{
    section: CommentSectionType;
    sectionId?: string;
    instruction: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
  language: 'uk' | 'en';
  preserveStructure: boolean;
  metadata?: {
    ageGroup: string;
    topic: string;
    slideCount: number;
  };
}

export interface PlanEditResponse {
  success: boolean;
  editedPlan?: string;
  appliedChanges?: Array<{
    sectionType: CommentSectionType;
    sectionId?: string;
    changeDescription: string;
    success: boolean;
  }>;
  error?: {
    message: string;
    code: string;
    failedComments?: string[];
  };
  metadata?: {
    processingTime: number;
    changesCount: number;
    preservedStructure: boolean;
  };
}

export interface CommentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// === MVP Lesson Creation Global State Types ===

export type LessonCreationStep = 1 | 2 | 3;

export interface LessonCreationState {
  currentStep: LessonCreationStep;
  completedSteps: Set<LessonCreationStep>;
  templateData: TemplateData;
  generatedPlan: GeneratedPlanResponse | null;
  generatedLesson: import('@/types/chat').SimpleLesson | null;
  isLoading: boolean;
  error: string | null;
  // Plan editing state
  planEditingState: PlanEditingState;
  // Plan changes feedback
  planChanges: PlanChanges | null;
  // Slide editing state
  slideEditingState: SlideEditingState;
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
  setGeneratedPlan: (plan: GeneratedPlanResponse) => void;
  setGeneratedLesson: (lesson: import('@/types/chat').SimpleLesson) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGeneratedPlan: () => void;
  clearGeneratedLesson: () => void;
  resetState: () => void;
  // Plan editing methods
  enterEditMode: () => void;
  exitEditMode: () => void;
  addComment: (comment: Omit<PlanComment, 'id' | 'timestamp'>) => void;
  removeComment: (commentId: string) => void;
  updateComment: (commentId: string, updates: Partial<PlanComment>) => void;
  clearAllComments: () => void;
  processComments: () => Promise<void>;
  updatePlanEditingState: (state: Partial<PlanEditingState>) => void;
  // Slide editing methods
  enterSlideEditMode: () => void;
  exitSlideEditMode: () => void;
  addSlideComment: (comment: Omit<SlideComment, 'id' | 'timestamp'>) => void;
  removeSlideComment: (commentId: string) => void;
  clearAllSlideComments: () => void;
  processSlideComments: (onComplete?: () => void) => Promise<void>;
  updateSlideEditingState: (state: Partial<SlideEditingState>) => void;
  // Slide generation state management
  updateSlideGenerationState: (state: Partial<LessonCreationState['slideGenerationState']>) => void;
  clearSlideGenerationState: () => void;
  // Step completion management
  markStepCompleted: (step: LessonCreationStep) => void;
  canNavigateToStep: (step: LessonCreationStep) => boolean;
  // Plan changes management
  setPlanChanges: (changes: PlanChanges | null) => void;
  clearPlanChanges: () => void;
}

// === Plan Changes Feedback System Types ===

export interface PlanChanges {
  summary: {
    totalChanges: number;
    sectionsModified: number;
  };
  changes: PlanChangeItem[];
}

export interface PlanChangeItem {
  section: string;
  sectionType: 'objectives' | 'activities' | 'materials' | 'assessment' | 'homework' | 'slides' | 'games' | 'recommendations' | 'general';
  shortDescription: string;
  detailedDescription: string;
  changeType: 'modified' | 'added' | 'removed' | 'restructured';
}

export interface PlanEditResponseWithChanges extends PlanEditResponse {
  changes?: PlanChanges;
}

// === Slide Editing System Types ===

export interface SlideComment {
  id: string;
  slideId: string;
  comment: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  sectionType: 'title' | 'content' | 'styling' | 'interactions' | 'general';
}

export interface SlideEditingState {
  isEditingMode: boolean;
  selectedSlideId: string | null;
  pendingComments: SlideComment[];
  isProcessingComments: boolean;
  editingProgress: SlideEditingProgress[];
  slideChanges: Record<string, SlideChanges> | null;
}

export interface SlideEditingProgress {
  slideId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  currentOperation?: string;
}

export interface SlideChanges {
  slideId: string;
  changes: Array<{
    section: string;
    shortDescription: string;
    detailedDescription: string;
  }>;
  summary: {
    totalChanges: number;
    affectedSections: string[];
  };
}

export interface SlideEditRequest {
  slide: import('@/types/chat').SimpleSlide;
  comments: SlideComment[];
  context: {
    ageGroup: string;
    topic: string;
  };
  language?: 'uk' | 'en';
}

export interface SlideEditResponse {
  success: boolean;
  editedSlide?: import('@/types/chat').SimpleSlide;
  slideChanges?: SlideChanges;
  error?: {
    message: string;
    code: string;
  };
}
