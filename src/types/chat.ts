export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered';
  availableActions?: Array<{
    action: string;
    label: string;
    description: string;
  }>;
  lesson?: SimpleLesson;
}

export interface SimpleSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  status: 'completed' | 'draft' | 'generating';
  previewUrl?: string;
  thumbnailUrl?: string;
  updatedAt?: Date;
  isPlaceholder?: boolean; // Flag for placeholder slides during generation
  thumbnailReady?: boolean; // Flag to prevent regeneration of existing thumbnails
  // Content-driven properties
  estimatedDuration?: number; // in seconds
  interactive?: boolean;
  visualElements?: string[];
  description?: string;
}

export interface SimpleLesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  duration: number;
  slides: SimpleSlide[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  // Note: Temporary images are auto-migrated from slide HTML content when saving
}

export interface SlideUIState {
  currentLesson: SimpleLesson | null;
  selectedSlideId: string | null;
  selectedSlides: Set<string>;
  viewMode: 'grid' | 'list';
  slidePanelOpen: boolean;
  isGenerating: boolean;
  slideDialogOpen: boolean;
  currentSlideIndex: number;
  isSavingLesson: boolean;
  saveDialogOpen: boolean;
}

export interface SaveLessonDialogData {
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  selectedPreviewId: string | null;
  previewUrl: string | null;
}

// === НОВІ ТИПИ ДЛЯ МАСОВОЇ ГЕНЕРАЦІЇ СЛАЙДІВ ===

export interface SlideDescription {
  slideNumber: number;
  title: string;
  description: string;
  type?: string; // Made flexible to support content-driven types
}

export interface SlideGenerationProgress {
  slideNumber: number;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
  htmlContent?: string;
  progress?: number; // 0-100
}

export interface BulkSlideGenerationResult {
  totalSlides: number;
  completedSlides: number;
  failedSlides: number;
  slides: SimpleSlide[];
  errors: string[];
  generationTime: number; // в мілісекундах
} 