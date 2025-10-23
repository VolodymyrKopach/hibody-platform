/**
 * Type definitions for age-grouped drag and drop components
 * Each age group has its own specific component types and data structures
 */

// Base interface for all age group components
export interface BaseComponentData {
  id: string;
  title: string;
  description: string;
  items: any[];
  targets?: any[];
  settings?: Record<string, any>;
}

// Common drag item interface
export interface BaseDragItem {
  id: string;
  label?: string;
  imageUrl?: string;
}

// Common drop target interface
export interface BaseDropTarget {
  id: string;
  label: string;
  imageUrl?: string;
  backgroundColor?: string;
}

// Age group types
export type AgeGroup = '3-5' | '6-7' | '8-9' | '10-13' | '14-18';

// Component metadata for UI
export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  ageGroup: AgeGroup;
  preview?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  tags: string[];
}

// ===== TODDLERS (3-5 years) =====
export namespace ToddlerComponents {
  export interface MagneticPlaygroundData extends BaseComponentData {
    type: 'magnetic-playground';
    magneticStrength: number; // pixels for auto-snap distance
    animalHelper: 'bunny' | 'cat' | 'dog' | 'bear';
    autoComplete: boolean; // auto-complete when close enough
    celebrationLevel: 'high' | 'maximum';
    items: ToddlerDragItem[];
    targets: ToddlerDropTarget[];
  }

  export interface SimpleMatchingData extends BaseComponentData {
    type: 'simple-matching';
    pairCount: number;
    showLabels: boolean;
    largeElements: boolean;
    items: ToddlerDragItem[];
    targets: ToddlerDropTarget[];
  }

  export interface ColorSorterData extends BaseComponentData {
    type: 'color-sorter';
    colors: string[];
    itemsPerColor: number;
    showColorNames: boolean;
    items: ToddlerDragItem[];
    targets: ToddlerDropTarget[];
  }

  export interface ToddlerDragItem extends BaseDragItem {
    correctTarget: string;
    size: 'large' | 'extra-large';
    animations?: string[];
    sounds?: string[];
  }

  export interface ToddlerDropTarget extends BaseDropTarget {
    size: 'large' | 'extra-large';
    magneticZone: number; // pixels
    celebrationAnimation?: string;
  }
}

// ===== PRESCHOOLERS (6-7 years) =====
export namespace PreschoolComponents {
  export interface StoryAdventureData extends BaseComponentData {
    type: 'story-adventure';
    storyTheme: 'farm' | 'zoo' | 'space' | 'underwater' | 'fairy-tale';
    characters: Character[];
    chapters: Chapter[];
    rewardSystem: RewardSystem;
    items: PreschoolDragItem[];
    targets: PreschoolDropTarget[];
  }

  export interface AnimalHomesData extends BaseComponentData {
    type: 'animal-homes';
    habitat: 'forest' | 'ocean' | 'farm' | 'jungle';
    animals: Animal[];
    educationalFacts: boolean;
    items: PreschoolDragItem[];
    targets: PreschoolDropTarget[];
  }

  export interface ShapePuzzleData extends BaseComponentData {
    type: 'shape-puzzle';
    shapes: string[];
    difficulty: 'simple' | 'medium';
    showOutlines: boolean;
    items: PreschoolDragItem[];
    targets: PreschoolDropTarget[];
  }

  export interface Character {
    id: string;
    name: string;
    personality: 'cheerful' | 'wise' | 'playful' | 'helpful';
    dialogues: string[];
    animations: string[];
    avatar: string;
  }

  export interface Chapter {
    id: string;
    title: string;
    description: string;
    requiredActions: number;
    unlocked: boolean;
  }

  export interface RewardSystem {
    stars: number;
    badges: string[];
    unlockables: string[];
  }

  export interface Animal {
    id: string;
    name: string;
    habitat: string;
    funFact?: string;
    sound?: string;
  }

  export interface PreschoolDragItem extends BaseDragItem {
    correctTarget: string;
    category?: string;
    storyRole?: string;
  }

  export interface PreschoolDropTarget extends BaseDropTarget {
    category?: string;
    storyContext?: string;
    successMessage?: string;
  }
}

// ===== ELEMENTARY (8-9 years) =====
export namespace ElementaryComponents {
  export interface EducationalSorterData extends BaseComponentData {
    type: 'educational-sorter';
    subject: 'math' | 'science' | 'language' | 'geography' | 'history';
    educationalGoals: string[];
    explanations: Explanation[];
    progressTracking: ProgressTracking;
    items: ElementaryDragItem[];
    targets: ElementaryDropTarget[];
  }

  export interface MathMatcherData extends BaseComponentData {
    type: 'math-matcher';
    mathConcept: 'addition' | 'subtraction' | 'multiplication' | 'fractions' | 'geometry';
    difficulty: 'grade1' | 'grade2' | 'grade3';
    showWorkingOut: boolean;
    items: ElementaryDragItem[];
    targets: ElementaryDropTarget[];
  }

  export interface ScienceClassifierData extends BaseComponentData {
    type: 'science-classifier';
    scienceTopic: 'animals' | 'plants' | 'weather' | 'space' | 'human-body';
    factLevel: 'basic' | 'detailed';
    quizMode: boolean;
    items: ElementaryDragItem[];
    targets: ElementaryDropTarget[];
  }

  export interface Explanation {
    itemId: string;
    explanation: string;
    funFact?: string;
    relatedConcepts?: string[];
  }

  export interface ProgressTracking {
    skillsLearned: string[];
    masteryLevel: number; // 0-100
    timeSpent: number; // minutes
    accuracy: number; // percentage
  }

  export interface ElementaryDragItem extends BaseDragItem {
    correctTarget: string;
    category: string;
    educationalValue?: string;
    difficulty?: number;
  }

  export interface ElementaryDropTarget extends BaseDropTarget {
    category: string;
    educationalContext?: string;
    hints?: string[];
  }
}

// ===== MIDDLE SCHOOL (10-13 years) =====
export namespace MiddleComponents {
  export interface StrategicMatcherData extends BaseComponentData {
    type: 'strategic-matcher';
    strategyType: 'logic' | 'pattern' | 'sequence' | 'categorization' | 'analysis';
    complexity: ComplexitySettings;
    scoring: ScoringSystem;
    challenges: Challenge[];
    items: MiddleDragItem[];
    targets: MiddleDropTarget[];
  }

  export interface LogicPuzzleData extends BaseComponentData {
    type: 'logic-puzzle';
    puzzleType: 'deduction' | 'pattern' | 'sequence' | 'classification';
    rules: string[];
    hints: string[];
    items: MiddleDragItem[];
    targets: MiddleDropTarget[];
  }

  export interface DataOrganizerData extends BaseComponentData {
    type: 'data-organizer';
    dataType: 'statistics' | 'research' | 'survey' | 'experiment';
    organizationMethod: 'category' | 'priority' | 'chronology' | 'hierarchy';
    items: MiddleDragItem[];
    targets: MiddleDropTarget[];
  }

  export interface ComplexitySettings {
    multipleCorrectAnswers: boolean;
    dependentChoices: boolean;
    timeConstraints: boolean;
    maxAttempts?: number;
  }

  export interface ScoringSystem {
    pointsPerCorrect: number;
    penaltyPerMistake: number;
    bonusMultipliers: number[];
    timeBonus: boolean;
  }

  export interface Challenge {
    id: string;
    name: string;
    description: string;
    unlockCondition: string;
    reward: string;
  }

  export interface MiddleDragItem extends BaseDragItem {
    correctTargets: string[]; // can have multiple correct answers
    category: string;
    priority?: number;
    metadata?: Record<string, any>;
  }

  export interface MiddleDropTarget extends BaseDropTarget {
    acceptsMultiple: boolean;
    category?: string;
    validationRules?: string[];
  }
}

// ===== TEENS (14-18 years) =====
export namespace TeenComponents {
  export interface ProfessionalWorkflowData extends BaseComponentData {
    type: 'professional-workflow';
    workflowType: 'data-analysis' | 'project-management' | 'research' | 'design' | 'business';
    professionalContext: string;
    keyboardShortcuts: KeyboardShortcut[];
    exportOptions: ExportOptions;
    realWorldApplication: string;
    items: TeenDragItem[];
    targets: TeenDropTarget[];
  }

  export interface ResearchSorterData extends BaseComponentData {
    type: 'research-sorter';
    researchField: 'academic' | 'market' | 'scientific' | 'social';
    methodology: string[];
    citationRequired: boolean;
    items: TeenDragItem[];
    targets: TeenDropTarget[];
  }

  export interface AnalysisToolsData extends BaseComponentData {
    type: 'analysis-tools';
    analysisType: 'statistical' | 'qualitative' | 'comparative' | 'trend';
    toolsAvailable: string[];
    reportGeneration: boolean;
    items: TeenDragItem[];
    targets: TeenDropTarget[];
  }

  export interface KeyboardShortcut {
    action: string;
    keys: string[];
    description: string;
  }

  export interface ExportOptions {
    formats: ('json' | 'csv' | 'pdf' | 'xlsx')[];
    includeAnalytics: boolean;
    customFields: boolean;
  }

  export interface TeenDragItem extends BaseDragItem {
    correctTargets: string[];
    category: string;
    priority?: number;
    metadata: Record<string, any>;
    source?: string;
    reliability?: number;
  }

  export interface TeenDropTarget extends BaseDropTarget {
    acceptsMultiple: boolean;
    category: string;
    validationRules: string[];
    businessLogic?: string;
  }
}

// Union types for all components
export type AgeGroupComponentData = 
  | ToddlerComponents.MagneticPlaygroundData
  | ToddlerComponents.SimpleMatchingData
  | ToddlerComponents.ColorSorterData
  | PreschoolComponents.StoryAdventureData
  | PreschoolComponents.AnimalHomesData
  | PreschoolComponents.ShapePuzzleData
  | ElementaryComponents.EducationalSorterData
  | ElementaryComponents.MathMatcherData
  | ElementaryComponents.ScienceClassifierData
  | MiddleComponents.StrategicMatcherData
  | MiddleComponents.LogicPuzzleData
  | MiddleComponents.DataOrganizerData
  | TeenComponents.ProfessionalWorkflowData
  | TeenComponents.ResearchSorterData
  | TeenComponents.AnalysisToolsData;

// Component type strings
export type ComponentType = AgeGroupComponentData['type'];
