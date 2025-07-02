export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered';
  feedback: 'like' | 'dislike' | null;
  availableActions?: Array<{
    action: string;
    label: string;
    description: string;
  }>;
}

export interface SimpleSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type: 'title' | 'content' | 'interactive' | 'summary';
  status: 'completed' | 'draft';
  previewUrl?: string;
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