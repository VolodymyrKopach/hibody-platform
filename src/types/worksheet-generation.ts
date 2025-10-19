// Types for AI Worksheet Generation System

import { CanvasElement } from './canvas-element';

/**
 * Component schema for AI understanding
 */
export interface ComponentSchema {
  id: string; // Component type ID (e.g., 'title-block', 'fill-blank')
  name: string; // Human-readable name
  description: string; // What this component does
  category: 'text' | 'exercise' | 'media' | 'layout' | 'box';
  useCases: string[]; // When to use this component
  properties: {
    [key: string]: ComponentPropertySchema;
  };
  examples: ComponentExample[];
}

/**
 * Property schema for component
 */
export interface ComponentPropertySchema {
  type: 'string' | 'number' | 'array' | 'object' | 'boolean' | 'enum';
  required: boolean;
  default?: any;
  description: string;
  examples?: any[];
  enum?: string[]; // For enum types
  arrayItemType?: string; // For array types
}

/**
 * Example of component usage
 */
export interface ComponentExample {
  description: string;
  ageGroup?: string;
  properties: any;
}

/**
 * Request to generate worksheet
 * NOTE: pageCount is removed - content will be auto-paginated based on actual content
 */
export interface WorksheetGenerationRequest {
  topic: string; // Main topic (e.g., "Animals", "Counting", "Colors")
  ageGroup: string; // Age group (e.g., "3-5", "6-7", "8-9")
  learningObjectives?: string; // Optional custom learning goals
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string; // Content language (default: 'en')
  includeImages?: boolean; // Whether to include images
  additionalInstructions?: string; // Custom instructions from user
  duration?: string; // Lesson duration (affects content amount, not page count)
  contentMode?: 'pdf' | 'interactive'; // PDF for print or interactive for online
  componentSelectionMode?: 'auto' | 'manual'; // AI chooses or user selects components
  selectedComponents?: string[]; // Manually selected component types (if manual mode)
}

/**
 * Response from AI generation
 */
export interface WorksheetGenerationResponse {
  pages: GeneratedPage[];
  metadata: WorksheetMetadata;
}

/**
 * Single generated page
 */
export interface GeneratedPage {
  pageNumber: number;
  title: string;
  background?: PageBackgroundConfig;
  elements: GeneratedElement[]; // Elements without id and zIndex
  ageGroup?: string; // Age group for age-appropriate styling
  pageType?: 'pdf' | 'interactive'; // PDF = fixed A4, Interactive = scrollable
}

/**
 * Generated element (before conversion to CanvasElement)
 */
export interface GeneratedElement {
  type: string; // Component type
  properties: any; // Component-specific properties
}

/**
 * Metadata about generated worksheet
 */
export interface WorksheetMetadata {
  topic: string;
  ageGroup: string;
  difficulty: string;
  language: string;
  pageCount: number; // Calculated after auto-pagination
  generatedAt: string;
  componentsUsed: string[];
  estimatedDuration?: number; // Minutes to complete
  autoPaginated: boolean; // Whether pages were auto-generated
  contentMode?: 'pdf' | 'interactive'; // Content mode used
}

/**
 * Page background configuration
 */
export interface PageBackgroundConfig {
  type: 'solid' | 'gradient' | 'pattern';
  color?: string;
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
  };
}

/**
 * AI Generation options
 */
export interface AIGenerationOptions {
  temperature?: number; // Creativity level (0-1)
  maxTokens?: number; // Max response tokens
  model?: string; // Gemini model to use
  includeExamples?: boolean; // Include examples in prompt
}

/**
 * Parsed worksheet ready for canvas
 */
export interface ParsedWorksheet {
  pages: ParsedPage[];
  metadata: WorksheetMetadata;
}

/**
 * Parsed page with full CanvasElements
 */
export interface ParsedPage {
  pageNumber: number;
  title: string;
  pageId: string;
  background?: PageBackgroundConfig;
  elements: CanvasElement[]; // Full elements with id, zIndex, etc.
  pageType?: 'pdf' | 'interactive'; // PDF = fixed A4, Interactive = scrollable
  ageGroup?: string; // Age group for age-appropriate styling
  generationContext?: {
    topic: string;
    ageGroup: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
  };
}

/**
 * Interactive page configuration
 */
export interface InteractivePage extends ParsedPage {
  pageType: 'interactive';
  allowScroll: boolean;
  maxHeight?: number; // If not set, unlimited scroll
}

/**
 * Base interface for interactive components
 */
export interface InteractiveComponentBase {
  type: string;
  soundEffects?: string[]; // Sound effect IDs
  animations?: AnimationConfig[];
  hapticFeedback?: boolean;
}

/**
 * Animation configuration for interactive components
 */
export interface AnimationConfig {
  trigger: 'tap' | 'correct' | 'incorrect' | 'complete';
  type: 'bounce' | 'scale' | 'shake' | 'spin' | 'confetti' | 'pulse';
  duration?: number; // milliseconds
  intensity?: 'low' | 'medium' | 'high';
}

/**
 * Educational guidelines for different age groups
 */
export interface AgeGroupGuidelines {
  ageGroup: string;
  readingLevel: string;
  attentionSpan: number; // Minutes
  recommendedExerciseTypes: string[];
  complexity: 'very-simple' | 'simple' | 'moderate' | 'complex';
  visualImportance: 'critical' | 'high' | 'medium' | 'low';
  textLengthGuidelines: {
    title: string;
    instruction: string;
    bodyText: string;
    question: string;
  };
}

// ============================================
// AI EDITING TYPES
// ============================================

/**
 * Context for AI editing worksheet
 */
export interface WorksheetEditContext {
  topic: string;
  ageGroup: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  userId?: string; // For token tracking
}

/**
 * Target for AI editing (component or page)
 */
export interface WorksheetEditTarget {
  type: 'component' | 'page';
  pageId: string;
  elementId?: string; // Only for component type
  data: CanvasElement | ParsedPage;
}

/**
 * Request to edit worksheet via AI
 */
export interface WorksheetEditRequest {
  editTarget: WorksheetEditTarget;
  instruction: string;
  context: WorksheetEditContext;
}

/**
 * Patch with only changed fields
 */
export interface WorksheetEditPatch {
  properties?: Partial<any>; // Changed properties for component
  title?: string; // Changed title for page
  elements?: CanvasElement[]; // Updated elements array for page
}

/**
 * Description of a single change
 */
export interface WorksheetEditChange {
  field: string;
  oldValue: any;
  newValue: any;
  description: string;
}

/**
 * Response from AI editing
 */
export interface WorksheetEditResponse {
  success: boolean;
  patch: WorksheetEditPatch;
  changes: WorksheetEditChange[];
  error?: string;
}

/**
 * Quick improvement action
 */
export interface QuickImprovement {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  instruction: string; // Auto-generated instruction for AI
}

/**
 * Edit history entry for UI
 */
export interface WorksheetEdit {
  id: string;
  timestamp: Date;
  instruction: string;
  changes: WorksheetEditChange[];
  target: 'component' | 'page';
  success: boolean;
  error?: string;
}

