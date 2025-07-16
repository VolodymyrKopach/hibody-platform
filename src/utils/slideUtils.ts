// Utilities для роботи з slide-oriented системою

import { 
  LessonSlide, 
  SlideCommand,
  ProjectFile 
} from '../types/lesson';
import { GeminiCommandParsingService } from '../services/commands/GeminiCommandParsingService';

// Global instance of Gemini command parsing service
let geminiCommandService: GeminiCommandParsingService | null = null;

// Initialize Gemini service
function getGeminiCommandService(): GeminiCommandParsingService {
  if (!geminiCommandService) {
    geminiCommandService = new GeminiCommandParsingService();
  }
  return geminiCommandService;
}

// Функція для парсингу команд через Gemini 2.5 Flash Lite
async function parseCommandWithAI(message: string, currentSlide?: LessonSlide): Promise<SlideCommand> {
  const service = getGeminiCommandService();
  const result = await service.parseCommand(message, currentSlide);
  
  // Log confidence for debugging
  console.log(`Command parsing confidence: ${result.confidence}, language: ${result.language}`);
  
  return result.command;
}

export const slideUtils = {
  
  /**
   * Парсинг природних команд користувача ЧЕРЕЗ GEMINI 2.5 FLASH LITE
   */
  parseCommand: async (message: string, currentSlide?: LessonSlide): Promise<SlideCommand> => {
    // ВСЕ через Gemini нейронну мережу - НІЯКИХ regex patterns!
    return await parseCommandWithAI(message, currentSlide);
  },
  
  /**
   * Генерація превью слайду для користувача
   */
  generateSlidePreview: (slide: LessonSlide): string => {
    const { title, description, type } = slide;
    
    // Базовий HTML для превью
    const preview = `
      <div style="padding: 20px; font-family: Arial, sans-serif; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 200px;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 24px; margin-right: 10px;">${getTypeIcon(type)}</span>
          <h3 style="margin: 0; font-size: 20px;">${title}</h3>
        </div>
        <p style="font-size: 14px; line-height: 1.5; opacity: 0.9;">${description}</p>
        <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px; font-size: 12px;">
          ${type}
        </div>
      </div>
    `;

    return preview;
  },
  
  /**
   * Емодзі для типів слайдів
   */
  getSlideTypeEmoji: (type: LessonSlide['type']): string => {
    const emojiMap = {
      welcome: '👋',
      content: '📖',
      activity: '🎯',
      game: '🎮',
      summary: '📝'
    };
    return emojiMap[type] || '📄';
  },
  
  /**
   * Генерація іконки статусу
   */
  getStatusIcon: (status: LessonSlide['status']): string => {
    const statusMap = {
      draft: '✏️',
      ready: '✅',
      generating: '⏳',
      error: '❌'
    };
    return statusMap[status] || '❓';
  },
  
  /**
   * Синхронізація слайду з файлами (файли → слайд)
   */
  syncSlideFromFiles: (files: ProjectFile[], slideId: string): LessonSlide => {
    const slideFile = files.find(f => f.slideId === slideId && f.type === 'html');
    const cssFile = files.find(f => f.slideId === slideId && f.type === 'css');
    const jsFile = files.find(f => f.slideId === slideId && f.type === 'js');

    if (!slideFile) {
      throw new Error(`Slide file not found for slideId: ${slideId}`);
    }

    // Витягуємо інформацію з HTML файлу
    const titleMatch = slideFile.content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1] : slideFile.name;

    // Визначаємо тип слайду за іменем файлу
    let type: LessonSlide['type'] = 'content';
    if (slideFile.name.includes('welcome')) type = 'welcome';
    else if (slideFile.name.includes('game')) type = 'game';
    else if (slideFile.name.includes('activity')) type = 'activity';
    else if (slideFile.name.includes('summary')) type = 'summary';

    const slide: LessonSlide = {
      id: slideId,
      number: extractSlideNumberHelper(slideFile.name),
      title,
      description: extractDescription(slideFile.content),
      type,
      icon: getTypeIcon(type),
      status: 'ready',
      preview: slideFile.content,
      _internal: {
        filename: slideFile.name,
        htmlContent: slideFile.content,
        cssContent: cssFile?.content,
        jsContent: jsFile?.content,
        dependencies: [slideFile.id, cssFile?.id, jsFile?.id].filter(Boolean) as string[],
        lastModified: slideFile.updatedAt,
        version: slideFile.version,
      },
      createdAt: slideFile.createdAt,
      updatedAt: slideFile.updatedAt,
    };

    return slide;
  },
  
  /**
   * Синхронізація файлів зі слайду (слайд → файли)
   */
  syncFilesFromSlide: (slide: LessonSlide): ProjectFile[] => {
    const files: ProjectFile[] = [];

    // HTML файл
    files.push({
      id: `${slide.id}_html`,
      name: slide._internal.filename,
      type: 'html',
      path: `/${slide._internal.filename}`,
      content: slide._internal.htmlContent,
      size: slide._internal.htmlContent.length,
      version: slide._internal.version,
      slideId: slide.id,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
      dependencies: [],
      tags: [slide.type, `slide-${slide.number}`],
    });

    // CSS файл якщо є
    if (slide._internal.cssContent) {
      files.push({
        id: `${slide.id}_css`,
        name: slide._internal.filename.replace('.html', '.css'),
        type: 'css',
        path: `/styles/${slide._internal.filename.replace('.html', '.css')}`,
        content: slide._internal.cssContent,
        size: slide._internal.cssContent.length,
        version: slide._internal.version,
        slideId: slide.id,
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt,
        dependencies: [],
        tags: [slide.type, `slide-${slide.number}`],
      });
    }

    // JS файл якщо є
    if (slide._internal.jsContent) {
      files.push({
        id: `${slide.id}_js`,
        name: slide._internal.filename.replace('.html', '.js'),
        type: 'js',
        path: `/scripts/${slide._internal.filename.replace('.html', '.js')}`,
        content: slide._internal.jsContent,
        size: slide._internal.jsContent.length,
        version: slide._internal.version,
        slideId: slide.id,
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt,
        dependencies: [],
        tags: [slide.type, `slide-${slide.number}`],
      });
    }

    return files;
  },
  
  /**
   * Валідація слайду
   */
  validateSlide: (slide: LessonSlide): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Перевіряємо обов'язкові поля
    if (!slide.title?.trim()) {
      errors.push('Назва слайду не може бути порожньою');
    }

    if (!slide.description?.trim()) {
      errors.push('Опис слайду не може бути порожнім');
    }

    if (!slide._internal?.htmlContent?.trim()) {
      errors.push('HTML контент слайду не може бути порожнім');
    }

    // Перевіряємо валідність HTML
    if (slide._internal?.htmlContent) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(slide._internal.htmlContent, 'text/html');
        if (doc.querySelector('parsererror')) {
          errors.push('HTML контент містить помилки синтаксису');
        }
      } catch (error) {
        errors.push('Неможливо розпарсити HTML контент');
      }
    }

    // Перевіряємо номер слайду
    if (slide.number < 1) {
      errors.push('Номер слайду повинен бути більше 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  /**
   * Генерація унікального імені файлу для слайду
   */
  generateSlideFilename: (slideNumber: number, title: string, type: LessonSlide['type']): string => {
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    
    return `slide_${slideNumber}_${sanitizedTitle}_${type}.html`;
  },
  
  /**
   * Екстракт номеру слайду з команди
   */
  extractSlideNumber: (filename: string): number => {
    const match = filename.match(/slide[_-]?(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  },
  
  /**
   * Генерація контексту для AI промпту
   */
  generateSlideContext: (slide: LessonSlide, allSlides: LessonSlide[], lessonTitle: string): string => {
    const slideInfo = `Слайд ${slide.number}: "${slide.title}" (${slide.type})`;
    const totalSlides = allSlides.length;
    const position = `${slide.number} з ${totalSlides}`;
    
    const prevSlide = allSlides.find(s => s.number === slide.number - 1);
    const nextSlide = allSlides.find(s => s.number === slide.number + 1);
    
    let context = `
Урок: "${lessonTitle}"
Поточний слайд: ${slideInfo}
Позиція: ${position}
Статус: ${slide.status}
`;
    
    if (prevSlide) {
      context += `Попередній слайд: "${prevSlide.title}" (${prevSlide.type})\n`;
    }
    
    if (nextSlide) {
      context += `Наступний слайд: "${nextSlide.title}" (${nextSlide.type})\n`;
    }
    
    context += `\nОпис поточного слайду: ${slide.description}`;
    
    return context;
  },
  
  /**
   * Конвертація HTML в текстовий превью
   */
  htmlToPreview: (htmlContent: string, maxLength: number = 150): string => {
    // Видаляємо HTML теги
    const textOnly = htmlContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (textOnly.length <= maxLength) {
      return textOnly;
    }
    
    return textOnly.substring(0, maxLength - 3) + '...';
  },
  
  /**
   * Перевірка чи команда стосується конкретного слайду
   */
  isSlideSpecificCommand: (command: SlideCommand): boolean => {
    return !!(command.slideNumber || command.slideId || command.targetElement);
  },
  
  /**
   * Генерація швидких команд для UI (мова береться з i18n контексту)
   */
  generateQuickCommands: (currentSlide?: LessonSlide, interfaceLanguage: 'uk' | 'en' = 'uk'): string[] => {
    const service = getGeminiCommandService();
    return service.getQuickCommands(currentSlide, interfaceLanguage);
  },
};

// Допоміжні функції
function getTypeIcon(type: LessonSlide['type']): string {
  switch (type) {
    case 'welcome': return '🎬';
    case 'content': return '📚';
    case 'activity': return '🎮';
    case 'game': return '🕹️';
    case 'summary': return '🏆';
    default: return '📄';
  }
}

function extractSlideNumberHelper(filename: string): number {
  const match = filename.match(/slide[_-]?(\d+)/i);
  return match ? parseInt(match[1]) : 1;
}

function extractDescription(htmlContent: string): string {
  // Витягуємо опис з мета-тегу або першого параграфу
  const metaDescMatch = htmlContent.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  if (metaDescMatch) {
    return metaDescMatch[1];
  }

  const pMatch = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (pMatch) {
    return pMatch[1].substring(0, 100) + (pMatch[1].length > 100 ? '...' : '');
  }

  return 'Опис слайду';
}

// Responsive slide constants
export const SLIDE_DEFAULTS = {
  STANDARD_RESOLUTIONS: [
    { width: 1024, height: 768, label: 'Standard' },
    { width: 1280, height: 720, label: 'HD' },
    { width: 1920, height: 1080, label: 'Full HD' },
    { width: 1600, height: 900, label: 'Wide' }
  ],
  DEFAULT_RESOLUTION: { width: 1024, height: 768 }
} as const;

/**
 * Генерує CSS стилі для responsive слайдів
 */
export function generateResponsiveSlideStyles(): string {
  return `
    /* Responsive Slide Container */
    .slide-container {
      width: 100%;
      max-width: 1024px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    /* Responsive viewport */
    @media (max-width: 1024px) {
      .slide-container {
        max-width: 90vw;
      }
    }
    
    @media (max-width: 768px) {
      .slide-container {
        max-width: 95vw;
      }
    }
  `;
}

/**
 * Генерує viewport meta tag для responsive слайдів
 */
export function generateResponsiveViewportMeta(): string {
  return `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`;
}

/**
 * Генерує базовий HTML template для responsive слайду
 */
export function generateResponsiveSlideTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    ${generateResponsiveViewportMeta()}
    <title>${title}</title>
    <style>
        ${generateResponsiveSlideStyles()}
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .slide-content {
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        /* Responsive typography */
        h1 { font-size: min(4vw, 3rem); }
        h2 { font-size: min(3vw, 2.5rem); }
        p { font-size: min(2.5vw, 1.5rem); }
        
        /* Interactive elements */
        .interactive-button {
            padding: min(2vw, 20px) min(4vw, 40px);
            font-size: min(2.5vw, 1.2rem);
            border: none;
            border-radius: 15px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            cursor: pointer;
            transition: transform 0.3s ease;
            margin: 10px;
        }
        
        .interactive-button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="slide-container">
        <div class="slide-content">
            ${content}
        </div>
    </div>
</body>
</html>`;
}

export default slideUtils;
