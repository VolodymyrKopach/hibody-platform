import { SimpleLesson, SimpleSlide } from './chat';

// === SOLID: ISP - Специфічні інтерфейси замість монолітних ===

export interface SlideState {
  currentLesson: SimpleLesson | null;
  slides: SimpleSlide[];
  selectedSlides: Set<string>;
  slidePreviews: Record<string, string>;
  previewsUpdating: Set<string>;
  slidePanelOpen: boolean;
  currentSlideIndex: number;
  slideDialogOpen: boolean;
  isSavingLesson: boolean;
  isGenerating: boolean;
  generationProgress: Map<string, number>;
}

export interface SlideActions {
  // === Lesson Management ===
  setCurrentLesson: (lesson: SimpleLesson | null) => void;
  updateLesson: (updates: Partial<SimpleLesson>) => void;
  
  // === Slide Management ===
  addSlide: (slide: SimpleSlide) => void;
  addSlides: (slides: SimpleSlide[]) => void;
  updateSlide: (slideId: string, updates: Partial<SimpleSlide>) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  
  // === Selection Management ===
  toggleSlideSelection: (slideId: string) => void;
  selectAllSlides: () => void;
  deselectAllSlides: () => void;
  setSelectedSlides: (slideIds: string[]) => void;
  
  // === Preview Management ===
  setSlidePreview: (slideId: string, previewUrl: string) => void;
  setPreviewUpdating: (slideId: string, updating: boolean) => void;
  clearPreviews: () => void;
  
  // === UI State Management ===
  toggleSlidePanelOpen: () => void;
  setSlidePanelOpen: (open: boolean) => void;
  setSlideDialogOpen: (open: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  
  // === Generation State ===
  setGenerating: (generating: boolean) => void;
  setSlideGenerationProgress: (slideId: string, progress: number) => void;
  
  // === Persistence ===
  setSavingLesson: (saving: boolean) => void;
  reset: () => void;
}

// === SOLID: DIP - Абстракції для залежностей ===

export interface ISlideStore {
  getState: () => SlideState;
  subscribe: (listener: StoreListener) => () => void;
  dispatch: (action: SlideActionType) => void;
  actions: SlideActions;
}

export interface ISlideObserver {
  onSlideAdded: (slide: SimpleSlide) => void;
  onSlideUpdated: (slide: SimpleSlide) => void;
  onSlideRemoved: (slideId: string) => void;
  onLessonUpdated: (lesson: SimpleLesson) => void;
  onSelectionChanged: (selectedSlides: Set<string>) => void;
}

export interface ISlidePreviewService {
  generatePreview: (slideId: string, htmlContent: string) => Promise<string>;
  hasPreview: (slideId: string) => boolean;
  getPreview: (slideId: string) => string | null;
  clearPreview: (slideId: string) => void;
}

export interface ISlideGenerationService {
  generateSlide: (description: string, lesson: SimpleLesson) => Promise<SimpleSlide>;
  generateSlides: (descriptions: string[], lesson: SimpleLesson) => Promise<SimpleSlide[]>;
  updateSlide: (slide: SimpleSlide, instruction: string) => Promise<SimpleSlide>;
}

export interface ISlidePersistenceService {
  saveLesson: (lesson: SimpleLesson, selectedSlideIds: string[]) => Promise<void>;
  loadLesson: (lessonId: string) => Promise<SimpleLesson>;
  exportLesson: (lesson: SimpleLesson, format: 'html' | 'pdf' | 'pptx') => Promise<Blob>;
}

// === Store Events ===

export type StoreListener = (state: SlideState, prevState: SlideState) => void;

export type SlideActionType = 
  | { type: 'SET_CURRENT_LESSON'; payload: SimpleLesson | null }
  | { type: 'UPDATE_LESSON'; payload: Partial<SimpleLesson> }
  | { type: 'ADD_SLIDE'; payload: SimpleSlide }
  | { type: 'ADD_SLIDES'; payload: SimpleSlide[] }
  | { type: 'UPDATE_SLIDE'; payload: { slideId: string; updates: Partial<SimpleSlide> } }
  | { type: 'REMOVE_SLIDE'; payload: string }
  | { type: 'REORDER_SLIDES'; payload: { startIndex: number; endIndex: number } }
  | { type: 'TOGGLE_SLIDE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_SLIDES' }
  | { type: 'DESELECT_ALL_SLIDES' }
  | { type: 'SET_SELECTED_SLIDES'; payload: string[] }
  | { type: 'SET_SLIDE_PREVIEW'; payload: { slideId: string; previewUrl: string } }
  | { type: 'SET_PREVIEW_UPDATING'; payload: { slideId: string; updating: boolean } }
  | { type: 'CLEAR_PREVIEWS' }
  | { type: 'TOGGLE_SLIDE_PANEL_OPEN' }
  | { type: 'SET_SLIDE_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_SLIDE_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_CURRENT_SLIDE_INDEX'; payload: number }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SLIDE_GENERATION_PROGRESS'; payload: { slideId: string; progress: number } }
  | { type: 'SET_SAVING_LESSON'; payload: boolean }
  | { type: 'RESET' };

// === Store Configuration ===

export interface SlideStoreConfig {
  persistence?: {
    enabled: boolean;
    key: string;
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  performance?: {
    debounceMs: number;
    maxSubscribers: number;
  };
}

export const DEFAULT_SLIDE_STATE: SlideState = {
  currentLesson: null,
  slides: [],
  selectedSlides: new Set(),
  slidePreviews: {},
  previewsUpdating: new Set(),
  slidePanelOpen: false,
  currentSlideIndex: 0,
  slideDialogOpen: false,
  isSavingLesson: false,
  isGenerating: false,
  generationProgress: new Map(),
}; 