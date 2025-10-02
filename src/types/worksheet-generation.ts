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
 */
export interface WorksheetGenerationRequest {
  topic: string; // Main topic (e.g., "Present Simple Tense", "Animals")
  ageGroup: string; // Age group (e.g., "3-5", "6-7", "8-9")
  exerciseTypes?: string[]; // Preferred exercise types
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string; // Content language (default: 'en')
  pageCount?: number; // Number of pages to generate (default: 1)
  includeImages?: boolean; // Whether to include images
  additionalInstructions?: string; // Custom instructions from user
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
  pageCount: number;
  generatedAt: string;
  componentsUsed: string[];
  estimatedDuration?: number; // Minutes to complete
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

