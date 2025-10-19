// Canvas Element Types for Canva-style editor

export interface CanvasElement {
  id: string;
  type: 
    | 'title-block' 
    | 'body-text' 
    | 'instructions-box' 
    | 'fill-blank' 
    | 'multiple-choice' 
    | 'tip-box' 
    | 'warning-box' 
    | 'image-placeholder' 
    | 'bullet-list' 
    | 'numbered-list' 
    | 'true-false' 
    | 'short-answer' 
    | 'match-pairs'
    | 'table' 
    | 'divider'
    // Interactive components
    | 'tap-image'
    | 'simple-drag-drop'
    | 'color-matcher'
    | 'simple-counter'
    | 'memory-cards'
    | 'sorting-game'
    | 'sequence-builder'
    | 'shape-tracer'
    | 'emotion-recognizer'
    | 'sound-matcher'
    | 'simple-puzzle'
    | 'pattern-builder'
    | 'cause-effect'
    | 'reward-collector'
    | 'voice-recorder'
    // New interactive components
    | 'flashcards'
    | 'word-builder'
    | 'open-question'
    | 'drawing-canvas'
    | 'dialog-roleplay'
    | 'interactive-map'
    | 'timer-challenge'
    | 'timeline-builder'
    | 'story-builder'
    | 'categorization-grid'
    | 'interactive-board'
    | 'object-builder';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  properties: any; // Component-specific properties
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

export interface PageContent {
  id?: string;
  pageId?: string;
  elements: CanvasElement[];
  generationContext?: {
    topic: string;
    ageGroup: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
  };
}

export interface DragState {
  isDragging: boolean;
  draggedElement: CanvasElement | null;
  draggedComponentType: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  offset: { x: number; y: number } | null;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  color: string;
  elements: string[]; // IDs of aligned elements
}

