import { type SimpleSlide, type SlideDescription, type BulkSlideGenerationResult, type SimpleLesson } from '@/types/chat';
import { type ConversationHistory, type ChatResponse } from '../types';

// === SOLID: Interface Segregation Principle ===
// Specific interfaces for different responsibilities

export interface ISlideGenerationService {
  generateSlide(description: string, topic: string, age: string): Promise<SimpleSlide>;
  generateAllSlides(descriptions: SlideDescription[], topic: string, age: string): Promise<BulkSlideGenerationResult>;
}

export interface ISlideEditingService {
  editSlide(slide: SimpleSlide, instruction: string, topic: string, age: string): Promise<SimpleSlide>;
  regenerateSlide(slide: SimpleSlide, topic: string, age: string): Promise<SimpleSlide>;
  improveSlide(slide: SimpleSlide, instruction: string, topic: string, age: string): Promise<SimpleSlide>;
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