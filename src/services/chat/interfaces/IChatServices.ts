import { type SimpleSlide, type SlideDescription, type BulkSlideGenerationResult, type SimpleLesson } from '@/types/chat';
import { type ConversationHistory, type ChatResponse } from '../types';

// === SOLID: Interface Segregation Principle ===
// Specific interfaces for different responsibilities

export interface ISlideGenerationService {
  // Legacy methods for backward compatibility
  generateSlide(description: string, title: string, lessonTopic: string, lessonAge: string): Promise<SimpleSlide>;
  generateAllSlides?(descriptions: SlideDescription[], topic: string, age: string): Promise<BulkSlideGenerationResult>;
  
  // New content-driven methods
  generateSlidesFromPlan(planText: string, lessonTopic: string, lessonAge: string): Promise<SimpleSlide[]>;
  generateAdaptiveSlides?(content: string, slideCount: number, lessonTopic: string, lessonAge: string): Promise<SimpleSlide[]>;
  extractSlideDescriptionsFromPlan?(planText: string): SlideDescription[];
}

export interface ISlideEditingService {
  editSlide(slide: SimpleSlide, instruction: string, topic: string, age: string, sessionId?: string): Promise<SimpleSlide>;
  regenerateSlide(slide: SimpleSlide, topic: string, age: string, sessionId?: string): Promise<SimpleSlide>;
  improveSlide(slide: SimpleSlide, instruction: string, topic: string, age: string, sessionId?: string): Promise<SimpleSlide>;
}

// Batch editing types
export interface BatchEditSession {
  batchId: string;
  lessonId: string;
  slideNumbers: number[];
  editInstruction: string;
  status: 'pending' | 'editing' | 'completed' | 'error';
  createdAt: Date;
  completedSlides: number[];
  failedSlides: number[];
  totalSlides: number;
}

export interface BatchProgress {
  batchId: string;
  completed: number;
  total: number;
  currentSlide?: number;
  status: 'editing' | 'completed' | 'error';
  results?: BatchEditResult[];
  estimatedTimeRemaining?: number;
}

export interface BatchEditResult {
  slideId: string;
  slideIndex: number;
  success: boolean;
  updatedSlide?: SimpleSlide;
  previewUrl?: string;
  thumbnailUrl?: string; // New thumbnail after editing
  error?: string;
  editingTime: number;
}

export interface IBatchSlideEditingService {
  startBatchEdit(params: BatchEditParams): Promise<BatchEditSession>;
  editSlideInBatch(slideId: string, batchId: string, slideIndex: number): Promise<BatchEditResult>;
  getBatchProgress(batchId: string): Promise<BatchProgress>;
  cancelBatchEdit(batchId: string): Promise<boolean>;
}

export interface BatchEditParams {
  lessonId: string;
  slideNumbers: number[];
  editInstruction: string;
  sessionId: string;
  topic: string;
  age: string;
}

export interface ILessonManagementService {
  createLesson(topic: string, age: string): SimpleLesson;
  addSlideToLesson(lesson: SimpleLesson, slide: SimpleSlide): SimpleLesson;
  updateLesson(lesson: SimpleLesson, updates: Partial<SimpleLesson>): SimpleLesson;
}

export interface ISlideAnalysisService {
  analyzeSlideChanges(oldSlide: SimpleSlide, newSlideHTML: string, instruction: string): string[];
  extractSlideDescriptions(planningResult: string): SlideDescription[];
  determineSlideType(title: string, description: string, slideNumber: number): 'welcome' | 'content' | 'activity' | 'summary';
}

export interface IActionHandlerService {
  handleAction(action: string, history?: ConversationHistory, intent?: any): Promise<ChatResponse>;
}

export interface IIntentMappingService {
  mapUnknownIntent(intent: any): any | null;
  findBestIntentMatch(unknownIntent: string, availableIntents: string[], parameters: any): { intent: string; confidence: number; reason: string } | null;
} 