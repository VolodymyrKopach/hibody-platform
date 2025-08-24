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
