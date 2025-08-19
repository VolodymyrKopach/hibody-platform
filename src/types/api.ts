// API Types для lesson система

import { Lesson, LessonSlide, SlideCommand, SlideAction, SlidePreview, LessonChatMessage } from './lesson';

// Lesson API Endpoints
export interface CreateLessonRequest {
  title: string;
  description: string;
  targetAge: string;
  subject: string;
  duration: number;
  thumbnail_url?: string;
  initialSlides?: Partial<LessonSlide>[];
  slides?: Array<{
    title: string;
    content?: string;
    description?: string;
    htmlContent?: string;
    type?: string;
    status?: string;
  }>;
  // Note: Temporary images are auto-extracted from slide HTML content - no need to send separately
}

export interface CreateLessonResponse {
  lesson: Lesson;
  success: boolean;
  message: string;
}

export interface UpdateLessonRequest {
  lessonId: string;
  updates: Partial<Lesson>;
}

export interface UpdateLessonResponse {
  lesson: Lesson;
  success: boolean;
  message: string;
}

export interface GetLessonRequest {
  lessonId: string;
  includeFiles?: boolean;
  includeSlides?: boolean;
}

export interface GetLessonResponse {
  lesson: Lesson;
  success: boolean;
  message: string;
}

// Slide API Endpoints
export interface CreateSlideRequest {
  lessonId: string;
  slide: Partial<LessonSlide>;
  position?: number; // Позиція в списку слайдів
  generateContent?: boolean; // Автоматично згенерувати HTML
}

export interface CreateSlideResponse {
  slide: LessonSlide;
  htmlFile?: string;
  preview?: string;
  success: boolean;
  message: string;
}

export interface UpdateSlideRequest {
  lessonId: string;
  slideId: string;
  updates: Partial<LessonSlide>;
  regenerateFiles?: boolean;
}

export interface UpdateSlideResponse {
  slide: LessonSlide;
  updatedFiles?: string[];
  preview?: string;
  success: boolean;
  message: string;
}

export interface DeleteSlideRequest {
  lessonId: string;
  slideId: string;
  deleteFiles?: boolean;
}

export interface DeleteSlideResponse {
  deletedSlideId: string;
  deletedFiles?: string[];
  success: boolean;
  message: string;
}

export interface ReorderSlidesRequest {
  lessonId: string;
  slideOrder: string[]; // Масив slide IDs в новому порядку
}

export interface ReorderSlidesResponse {
  lesson: Lesson;
  success: boolean;
  message: string;
}

// Chat Command API
export interface ProcessSlideCommandRequest {
  lessonId: string;
  message: string;
  currentSlideId?: string;
  sessionId?: string;
  
  // AI налаштування
  model?: string;
  temperature?: number;
  includeContext?: boolean;
}

export interface ProcessSlideCommandResponse {
  message: string;
  command: SlideCommand;
  actions: SlideAction[];
  updatedSlides: LessonSlide[];
  preview?: SlidePreview[];
  suggestions?: string[];
  chatMessage: LessonChatMessage;
  
  // Статус виконання
  success: boolean;
  needsConfirmation?: boolean;
  estimatedTime?: number;
}

export interface ConfirmSlideActionRequest {
  lessonId: string;
  messageId: string;
  actionIds: string[];
  approved: boolean;
  modifications?: Record<string, any>;
}

export interface ConfirmSlideActionResponse {
  executedActions: SlideAction[];
  updatedSlides: LessonSlide[];
  finalPreview?: SlidePreview[];
  success: boolean;
  message: string;
}

// File Management API (Internal)
export interface GenerateSlideHTMLRequest {
  slideId: string;
  slideData: LessonSlide;
  lessonContext: Lesson;
  template?: string;
  customPrompt?: string;
}

export interface GenerateSlideHTMLResponse {
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  preview: string;
  metadata: {
    generatedAt: Date;
    template: string;
    tokens: number;
  };
  success: boolean;
  message: string;
}

export interface ValidateSlideRequest {
  slideId: string;
  htmlContent: string;
  checkAccessibility?: boolean;
  checkPerformance?: boolean;
}

export interface ValidateSlideResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  accessibility?: AccessibilityReport;
  performance?: PerformanceReport;
  suggestions?: string[];
}

export interface ValidationError {
  type: 'html' | 'css' | 'js' | 'accessibility' | 'performance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  element?: string;
  fixSuggestion?: string;
}

export interface ValidationWarning {
  type: 'html' | 'css' | 'js' | 'accessibility' | 'performance';
  message: string;
  line?: number;
  column?: number;
  element?: string;
  improvementSuggestion?: string;
}

export interface AccessibilityReport {
  score: number; // 0-100
  issues: {
    type: 'missing_alt' | 'low_contrast' | 'keyboard_nav' | 'aria_labels';
    count: number;
    details: string[];
  }[];
  recommendations: string[];
}

export interface PerformanceReport {
  loadTime: number;
  fileSize: number;
  imageOptimization: boolean;
  unusedCSS: string[];
  recommendations: string[];
}

// Chat Session API
export interface CreateChatSessionRequest {
  lessonId: string;
  title?: string;
  model?: string;
  temperature?: number;
}

export interface CreateChatSessionResponse {
  session: LessonChatSession;
  success: boolean;
  message: string;
}

export interface GetChatHistoryRequest {
  lessonId: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
}

export interface GetChatHistoryResponse {
  messages: LessonChatMessage[];
  totalCount: number;
  hasMore: boolean;
  success: boolean;
  message: string;
}

// Bulk Operations
export interface BulkSlideOperationRequest {
  lessonId: string;
  operation: 'improve_all' | 'regenerate_all' | 'optimize_all' | 'validate_all';
  slideIds?: string[]; // Якщо не вказано - всі слайди
  options?: Record<string, any>;
}

export interface BulkSlideOperationResponse {
  results: {
    slideId: string;
    success: boolean;
    message: string;
    changes?: string[];
    errors?: string[];
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    timeElapsed: number;
  };
  updatedLesson: Lesson;
  success: boolean;
  message: string;
}

// Export/Import API
export interface ExportLessonRequest {
  lessonId: string;
  format: 'zip' | 'pdf' | 'scorm' | 'html' | 'json';
  includeAssets?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface ExportLessonResponse {
  downloadUrl: string;
  fileSize: number;
  format: string;
  expiresAt: Date;
  success: boolean;
  message: string;
}

export interface ImportLessonRequest {
  file: File;
  format: 'zip' | 'pptx' | 'pdf' | 'json';
  convertToSlides?: boolean;
  targetAge?: string;
  subject?: string;
}

export interface ImportLessonResponse {
  lesson: Lesson;
  importStats: {
    slidesCreated: number;
    filesProcessed: number;
    errors: string[];
    warnings: string[];
  };
  success: boolean;
  message: string;
}

// Analytics & Insights
export interface LessonAnalyticsRequest {
  lessonId: string;
  period?: 'day' | 'week' | 'month';
}

export interface LessonAnalyticsResponse {
  metrics: {
    slidesCount: number;
    totalInteractions: number;
    averageEditTime: number;
    mostEditedSlides: { slideId: string; edits: number }[];
    popularCommands: { command: string; usage: number }[];
  };
  insights: string[];
  recommendations: string[];
  success: boolean;
  message: string;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId: string;
}

export interface ValidationErrorResponse {
  success: false;
  error: APIError;
  validationErrors: ValidationError[];
}

// Response wrapper
export type APIResponse<T> = 
  | (T & { success: true })
  | ValidationErrorResponse;

// Utility types for API
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string[];
  type?: string[];
  ageGroup?: string[];
  subject?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface SearchParams {
  query?: string;
  fields?: string[];
  fuzzy?: boolean;
}

// Image Generation API Types
export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  aspectRatio?: '1:1' | '16:9' | '3:4' | '9:16';
  style?: 'cartoon' | 'realistic' | 'illustration';
  ageGroup?: string;
  topic?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  image?: string; // base64 encoded image
  prompt?: string;
  model?: string;
  metadata?: {
    width: number;
    height: number;
    style: string;
    generatedAt: Date;
    tokens?: number;
  };
  error?: string;
}

export interface GenerateSlideImageRequest {
  lessonId: string;
  slideId: string;
  imagePrompt?: string;
  autoGenerate?: boolean; // Автоматично створити промпт на основі слайду
  imageType?: 'hero' | 'illustration' | 'activity' | 'decoration';
  size?: 'small' | 'medium' | 'large';
}

export interface GenerateSlideImageResponse {
  imageUrl: string;
  imageData: string; // base64
  prompt: string;
  updatedSlide: LessonSlide;
  success: boolean;
  message: string;
}

export interface OptimizeImageRequest {
  imageData: string; // base64
  targetFormat?: 'webp' | 'png' | 'jpg';
  quality?: number; // 1-100
  maxWidth?: number;
  maxHeight?: number;
}

export interface OptimizeImageResponse {
  optimizedImage: string; // base64
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  success: boolean;
  message: string;
}
