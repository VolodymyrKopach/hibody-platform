// === SOLID Services Exports ===
// Centralized exports for all chat services following SOLID principles

export { SlideGenerationService } from './SlideGenerationService';
export { SlideEditingService } from './SlideEditingService';
export { BatchSlideEditingService } from './BatchSlideEditingService';
export { LessonManagementService } from './LessonManagementService';
export { SlideAnalysisService } from './SlideAnalysisService';
export { ActionHandlerService } from './ActionHandlerService';
export { IntentMappingService } from './IntentMappingService';

// Re-export interfaces for convenience
export type {
  ISlideGenerationService,
  ISlideEditingService,
  IBatchSlideEditingService,
  ILessonManagementService,
  ISlideAnalysisService,
  IActionHandlerService,
  IIntentMappingService,
  BatchEditSession,
  BatchProgress,
  BatchEditResult,
  BatchEditParams
} from '../interfaces/IChatServices'; 