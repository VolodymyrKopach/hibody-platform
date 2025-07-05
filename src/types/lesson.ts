// Slide-Oriented User Interface Types
// Користувач бачить слайди, під капотом - файли

export interface SlideImageInfo {
  prompt: string;
  width: number;
  height: number;
  base64Image: string;
  model: string;
  success: boolean;
  generatedAt: Date;
}

export interface LessonSlide {
  id: string;
  number: number;
  title: string;
  description: string;
  type: 'welcome' | 'content' | 'activity' | 'game' | 'summary';
  icon: string; // емодзі для відображення
  status: 'draft' | 'ready' | 'generating' | 'error';
  
  // Preview для користувача
  preview: string;
  thumbnailUrl?: string;
  
  // Інформація про згенеровані зображення
  images?: SlideImageInfo[];
  imageProcessingErrors?: string[];
  
  // Внутрішні дані (користувач не бачить)
  _internal: {
    filename: string;
    htmlContent: string;
    cssContent?: string;
    jsContent?: string;
    dependencies: string[];
    lastModified: Date;
    version: number;
    // Мета-дані про обробку зображень
    imageProcessingCompleted?: boolean;
    imageProcessingTime?: number; // в мілісекундах
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  targetAge: string;
  subject: string;
  duration: number;
  
  // Слайди (те що бачить користувач)
  slides: LessonSlide[];
  
  // Внутрішня структура файлів
  _internal: {
    projectPath: string;
    files: ProjectFile[];
    structure: FileTree;
    metadata: ProjectMetadata;
    lastSync: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
  status: 'planning' | 'creating' | 'ready' | 'published';
}

// File system types (під капотом)
export interface ProjectFile {
  id: string;
  name: string;
  type: 'html' | 'css' | 'js' | 'json' | 'md' | 'txt';
  path: string;
  content: string;
  size: number;
  version: number;
  slideId?: string; // Зв'язок з слайдом
  createdAt: Date;
  updatedAt: Date;
  dependencies?: string[];
  tags?: string[];
}

export interface FileTree {
  [key: string]: FileTree | ProjectFile;
}

export interface ProjectMetadata {
  lessonTitle: string;
  targetAge: string;
  subject: string;
  duration: number;
  slidesCount: number;
  language: string;
  createdBy: string;
  version: string;
}

// Command parsing для природних команд ЧЕРЕЗ НЕЙРОННІ МЕРЕЖІ
export interface SlideCommand {
  type: 'edit_slide' | 'improve_slide' | 'create_slide' | 'delete_slide' | 'reorder_slides' | 'general';
  slideNumber?: number;
  slideId?: string;
  instruction: string;
  context?: string;
  targetElement?: string; // "фон", "кнопка", "текст" тощо
}

// AI Response types
export interface SlideResponse {
  message: string;
  actions: SlideAction[];
  updatedSlides: LessonSlide[];
  suggestions?: string[];
  needsConfirmation?: boolean;
  preview?: SlidePreview[];
}

export interface SlideAction {
  type: 'create_slide' | 'update_slide' | 'delete_slide' | 'create_file' | 'update_file' | 'delete_file';
  slideId?: string;
  fileId?: string;
  changes: any;
  reason: string;
}

export interface SlidePreview {
  slideId: string;
  preview: string;
  changes: string;
  thumbnailUrl?: string;
}

// Chat types для lesson context
export interface LessonChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'command' | 'slide_action' | 'suggestion';
  
  // Slide context
  targetSlideId?: string;
  targetSlideNumber?: number;
  affectedSlides?: string[];
  
  // Command info
  command?: SlideCommand;
  
  // Результати
  actions?: SlideAction[];
  preview?: SlidePreview[];
  
  // Статус
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface LessonChatSession {
  id: string;
  lessonId: string;
  title: string;
  messages: LessonChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  
  // AI налаштування
  model: string;
  temperature: number;
  
  // Контекст
  currentSlideId?: string;
  isActive: boolean;
}

// Utility types
export interface SlideUtils {
  parseCommand: (message: string, currentSlide?: LessonSlide) => Promise<SlideCommand>;
  generateSlidePreview: (slide: LessonSlide) => string;
  syncSlideFromFiles: (files: ProjectFile[], slideId: string) => LessonSlide;
  syncFilesFromSlide: (slide: LessonSlide) => ProjectFile[];
  validateSlide: (slide: LessonSlide) => { isValid: boolean; errors: string[] };
}
