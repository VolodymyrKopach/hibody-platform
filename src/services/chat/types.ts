// Export types for use in other parts of the system
import { SimpleLesson, SlideGenerationProgress, SlideDescription } from '@/types/chat';
import { IntentDetectionResult } from '../intent/IIntentDetectionService';

export interface ConversationHistory {
  step: 'planning' | 'slide_generation' | 'plan_editing' | 'data_collection' | 'bulk_generation';
  planningResult?: string;
  totalSlides?: number;
  originalMessage?: string;
  pendingIntent?: IntentDetectionResult; // For data collection
  missingData?: string[]; // For data collection
  
  // Additional fields for lesson generation
  lessonTopic?: string;
  lessonAge?: string;
  currentLesson?: SimpleLesson;
  
  // === NEW FIELDS FOR BULK SLIDE GENERATION ===
  slideDescriptions?: SlideDescription[]; // All slide descriptions from the plan
  slideGenerationProgress?: SlideGenerationProgress[]; // Progress of each slide generation
  isGeneratingAllSlides?: boolean; // Flag indicating if all slides are being generated
  sessionId?: string; // SSE session ID for real-time progress tracking
  
  // === CONVERSATION CONTEXT ===
  conversationContext?: string; // Compressed context of the entire conversation
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversationHistory?: ConversationHistory;
  actions?: ChatAction[];
  error?: string;
  lesson?: SimpleLesson; // Use SimpleLesson instead of any
  sessionId?: string; // SSE session ID for frontend to listen to progress
  batchEdit?: BatchEditResponse; // Batch editing information
}

export interface BatchEditResponse {
  batchId: string;
  progressEndpoint: string;
  affectedSlides: number[];
  editInstruction: string;
  totalSlides: number;
  estimatedTime: number; // in seconds
}

export interface ChatAction {
  action: string;
  label: string;
  description?: string;
} 