import { 
  SlideState, 
  SlideActions, 
  SlideActionType, 
  ISlideStore, 
  StoreListener,
  SlideStoreConfig,
  DEFAULT_SLIDE_STATE
} from '@/types/store';
import { SimpleLesson, SimpleSlide } from '@/types/chat';

// === SOLID: SRP - SlideStore відповідає тільки за управління станом слайдів ===
export class SlideStore implements ISlideStore {
  private state: SlideState;
  private listeners: Set<StoreListener> = new Set();
  private config: SlideStoreConfig;

  constructor(config: Partial<SlideStoreConfig> = {}) {
    this.config = {
      persistence: { enabled: false, key: 'teachspark-slide-store' },
      logging: { enabled: true, level: 'info' },
      performance: { debounceMs: 10, maxSubscribers: 100 },
      ...config
    };

    this.state = this.loadInitialState();
    this.log('info', 'SlideStore initialized', { state: this.state });
  }

  // === SOLID: ISP - Специфічний інтерфейс для отримання стану ===
  getState(): SlideState {
    return { ...this.state };
  }

  // === SOLID: OCP - Відкритий для розширення через підписки ===
  subscribe(listener: StoreListener): () => void {
    if (this.listeners.size >= this.config.performance!.maxSubscribers) {
      throw new Error(`Maximum subscribers limit reached: ${this.config.performance!.maxSubscribers}`);
    }

    this.listeners.add(listener);
    this.log('debug', 'Subscriber added', { totalSubscribers: this.listeners.size });

    // Повертаємо функцію unsubscribe
    return () => {
      this.listeners.delete(listener);
      this.log('debug', 'Subscriber removed', { totalSubscribers: this.listeners.size });
    };
  }

  // === SOLID: SRP - Dispatch відповідає тільки за обробку actions ===
  dispatch(action: SlideActionType): void {
    const prevState = { ...this.state };
    
    this.log('debug', 'Action dispatched', { 
      type: action.type, 
      payload: 'payload' in action ? action.payload : undefined 
    });

    try {
      this.state = this.reducer(this.state, action);
      this.notifyListeners(this.state, prevState);
      
      // Опціональне збереження стану
      if (this.config.persistence?.enabled) {
        this.persistState();
      }
    } catch (error) {
      this.log('error', 'Action dispatch failed', { action, error });
      throw error;
    }
  }

  // === SOLID: SRP - Reducer відповідає тільки за обчислення нового стану ===
  private reducer(state: SlideState, action: SlideActionType): SlideState {
    switch (action.type) {
      // === Lesson Management ===
      case 'SET_CURRENT_LESSON':
        return {
          ...state,
          currentLesson: action.payload,
          slides: action.payload?.slides || [],
          selectedSlides: new Set(),
          currentSlideIndex: 0
        };

      case 'UPDATE_LESSON':
        if (!state.currentLesson) return state;
        return {
          ...state,
          currentLesson: {
            ...state.currentLesson,
            ...action.payload,
            updatedAt: new Date()
          }
        };

      // === Slide Management ===
      case 'ADD_SLIDE':
        const newSlide = action.payload;
        const updatedSlides = [...state.slides, newSlide];
        
        return {
          ...state,
          slides: updatedSlides,
          currentLesson: state.currentLesson ? {
            ...state.currentLesson,
            slides: updatedSlides,
            updatedAt: new Date()
          } : null
        };

      case 'ADD_SLIDES':
        const addedSlides = [...state.slides, ...action.payload];
        
        return {
          ...state,
          slides: addedSlides,
          currentLesson: state.currentLesson ? {
            ...state.currentLesson,
            slides: addedSlides,
            updatedAt: new Date()
          } : null
        };

      case 'UPDATE_SLIDE':
        const { slideId, updates } = action.payload;
        const updatedSlidesList = state.slides.map(slide =>
          slide.id === slideId ? { ...slide, ...updates } : slide
        );
        
        return {
          ...state,
          slides: updatedSlidesList,
          currentLesson: state.currentLesson ? {
            ...state.currentLesson,
            slides: updatedSlidesList,
            updatedAt: new Date()
          } : null
        };

      case 'REMOVE_SLIDE':
        const filteredSlides = state.slides.filter(slide => slide.id !== action.payload);
        const newSelectedSlides = new Set(state.selectedSlides);
        newSelectedSlides.delete(action.payload);
        
        return {
          ...state,
          slides: filteredSlides,
          selectedSlides: newSelectedSlides,
          currentLesson: state.currentLesson ? {
            ...state.currentLesson,
            slides: filteredSlides,
            updatedAt: new Date()
          } : null,
          currentSlideIndex: Math.min(state.currentSlideIndex, filteredSlides.length - 1)
        };

      case 'REORDER_SLIDES':
        const { startIndex, endIndex } = action.payload;
        const reorderedSlides = [...state.slides];
        const [movedSlide] = reorderedSlides.splice(startIndex, 1);
        reorderedSlides.splice(endIndex, 0, movedSlide);
        
        return {
          ...state,
          slides: reorderedSlides,
          currentLesson: state.currentLesson ? {
            ...state.currentLesson,
            slides: reorderedSlides,
            updatedAt: new Date()
          } : null
        };

      // === Selection Management ===
      case 'TOGGLE_SLIDE_SELECTION':
        const toggledSelected = new Set(state.selectedSlides);
        if (toggledSelected.has(action.payload)) {
          toggledSelected.delete(action.payload);
        } else {
          toggledSelected.add(action.payload);
        }
        return { ...state, selectedSlides: toggledSelected };

      case 'SELECT_ALL_SLIDES':
        return { 
          ...state, 
          selectedSlides: new Set(state.slides.map(slide => slide.id)) 
        };

      case 'DESELECT_ALL_SLIDES':
        return { ...state, selectedSlides: new Set() };

      case 'SET_SELECTED_SLIDES':
        return { ...state, selectedSlides: new Set(action.payload) };

      // === Preview Management ===
      case 'SET_SLIDE_PREVIEW':
        return {
          ...state,
          slidePreviews: {
            ...state.slidePreviews,
            [action.payload.slideId]: action.payload.previewUrl
          }
        };

      case 'SET_PREVIEW_UPDATING':
        const updatingSet = new Set(state.previewsUpdating);
        if (action.payload.updating) {
          updatingSet.add(action.payload.slideId);
        } else {
          updatingSet.delete(action.payload.slideId);
        }
        return { ...state, previewsUpdating: updatingSet };

      case 'CLEAR_PREVIEWS':
        return { 
          ...state, 
          slidePreviews: {}, 
          previewsUpdating: new Set() 
        };

      // === UI State Management ===
      case 'TOGGLE_SLIDE_PANEL_OPEN':
        return { ...state, slidePanelOpen: !state.slidePanelOpen };

      case 'SET_SLIDE_PANEL_OPEN':
        return { ...state, slidePanelOpen: action.payload };

      case 'SET_SLIDE_DIALOG_OPEN':
        return { ...state, slideDialogOpen: action.payload };

      case 'SET_CURRENT_SLIDE_INDEX':
        return { 
          ...state, 
          currentSlideIndex: Math.max(0, Math.min(action.payload, state.slides.length - 1))
        };

      // === Generation State ===
      case 'SET_GENERATING':
        return { ...state, isGenerating: action.payload };

      case 'SET_SLIDE_GENERATION_PROGRESS':
        const progressMap = new Map(state.generationProgress);
        progressMap.set(action.payload.slideId, action.payload.progress);
        return { ...state, generationProgress: progressMap };

      // === Persistence ===
      case 'SET_SAVING_LESSON':
        return { ...state, isSavingLesson: action.payload };

      case 'RESET':
        return { ...DEFAULT_SLIDE_STATE };

      default:
        this.log('warn', 'Unknown action type', { action });
        return state;
    }
  }

  // === SOLID: OCP - Підтримка Observer pattern ===
  private notifyListeners(newState: SlideState, prevState: SlideState): void {
    this.listeners.forEach(listener => {
      try {
        listener(newState, prevState);
      } catch (error) {
        this.log('error', 'Listener error', { error });
      }
    });
  }

  // === Utility Methods ===
  private loadInitialState(): SlideState {
    if (!this.config.persistence?.enabled) {
      return { ...DEFAULT_SLIDE_STATE };
    }

    try {
      const stored = localStorage.getItem(this.config.persistence.key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Відновлюємо Set та Map об'єкти
        return {
          ...parsed,
          selectedSlides: new Set(parsed.selectedSlides || []),
          previewsUpdating: new Set(parsed.previewsUpdating || []),
          generationProgress: new Map(parsed.generationProgress || [])
        };
      }
    } catch (error) {
      this.log('warn', 'Failed to load persisted state', { error });
    }

    return { ...DEFAULT_SLIDE_STATE };
  }

  private persistState(): void {
    try {
      const serializable = {
        ...this.state,
        selectedSlides: Array.from(this.state.selectedSlides),
        previewsUpdating: Array.from(this.state.previewsUpdating),
        generationProgress: Array.from(this.state.generationProgress.entries())
      };
      localStorage.setItem(this.config.persistence!.key, JSON.stringify(serializable));
    } catch (error) {
      this.log('error', 'Failed to persist state', { error });
    }
  }

  private log(level: string, message: string, data?: any): void {
    if (!this.config.logging?.enabled) return;

    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = logLevels.indexOf(this.config.logging.level);
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      const logMessage = `[SlideStore] ${message}`;
      const logData = data || '';
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, logData);
          break;
        case 'info':
          console.info(logMessage, logData);
          break;
        case 'warn':
          console.warn(logMessage, logData);
          break;
        case 'error':
          console.error(logMessage, logData);
          break;
        default:
          console.log(logMessage, logData);
      }
    }
  }

  // === Public Actions API ===
  get actions(): SlideActions {
    return {
      // Lesson Management
      setCurrentLesson: (lesson) => this.dispatch({ type: 'SET_CURRENT_LESSON', payload: lesson }),
      updateLesson: (updates) => this.dispatch({ type: 'UPDATE_LESSON', payload: updates }),
      
      // Slide Management
      addSlide: (slide) => this.dispatch({ type: 'ADD_SLIDE', payload: slide }),
      addSlides: (slides) => this.dispatch({ type: 'ADD_SLIDES', payload: slides }),
      updateSlide: (slideId, updates) => this.dispatch({ type: 'UPDATE_SLIDE', payload: { slideId, updates } }),
      removeSlide: (slideId) => this.dispatch({ type: 'REMOVE_SLIDE', payload: slideId }),
      reorderSlides: (startIndex, endIndex) => this.dispatch({ type: 'REORDER_SLIDES', payload: { startIndex, endIndex } }),
      
      // Selection Management
      toggleSlideSelection: (slideId) => this.dispatch({ type: 'TOGGLE_SLIDE_SELECTION', payload: slideId }),
      selectAllSlides: () => this.dispatch({ type: 'SELECT_ALL_SLIDES' }),
      deselectAllSlides: () => this.dispatch({ type: 'DESELECT_ALL_SLIDES' }),
      setSelectedSlides: (slideIds) => this.dispatch({ type: 'SET_SELECTED_SLIDES', payload: slideIds }),
      
      // Preview Management
      setSlidePreview: (slideId, previewUrl) => this.dispatch({ type: 'SET_SLIDE_PREVIEW', payload: { slideId, previewUrl } }),
      setPreviewUpdating: (slideId, updating) => this.dispatch({ type: 'SET_PREVIEW_UPDATING', payload: { slideId, updating } }),
      clearPreviews: () => this.dispatch({ type: 'CLEAR_PREVIEWS' }),
      
      // UI State Management
      toggleSlidePanelOpen: () => this.dispatch({ type: 'TOGGLE_SLIDE_PANEL_OPEN' }),
      setSlidePanelOpen: (open) => this.dispatch({ type: 'SET_SLIDE_PANEL_OPEN', payload: open }),
      setSlideDialogOpen: (open) => this.dispatch({ type: 'SET_SLIDE_DIALOG_OPEN', payload: open }),
      setCurrentSlideIndex: (index) => this.dispatch({ type: 'SET_CURRENT_SLIDE_INDEX', payload: index }),
      
      // Generation State
      setGenerating: (generating) => this.dispatch({ type: 'SET_GENERATING', payload: generating }),
      setSlideGenerationProgress: (slideId, progress) => this.dispatch({ type: 'SET_SLIDE_GENERATION_PROGRESS', payload: { slideId, progress } }),
      
      // Persistence
      setSavingLesson: (saving) => this.dispatch({ type: 'SET_SAVING_LESSON', payload: saving }),
      reset: () => this.dispatch({ type: 'RESET' })
    };
  }
}

// === SOLID: SRP - Factory для створення store з конфігурацією ===
export class SlideStoreFactory {
  static create(config?: Partial<SlideStoreConfig>): SlideStore {
    return new SlideStore(config);
  }

  static createWithPersistence(key = 'teachspark-slide-store'): SlideStore {
    return new SlideStore({
      persistence: { enabled: true, key },
      logging: { enabled: true, level: 'info' }
    });
  }

  static createForTesting(): SlideStore {
    return new SlideStore({
      persistence: { enabled: false, key: '' },
      logging: { enabled: false, level: 'error' }
    });
  }
}

// === Singleton instance (опціонально) ===
export const slideStore = SlideStoreFactory.createWithPersistence(); 