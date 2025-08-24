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
