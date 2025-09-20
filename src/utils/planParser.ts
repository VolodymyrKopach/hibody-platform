import { SlideDescription } from '@/types/chat';
import { ParsedSlide, SlideType } from '@/types/templates';

/**
 * Парсер markdown плану уроку в структуровані описи слайдів
 * Конвертує markdown з етапу 2 в формат SlideDescription[] для генерації
 */
export class PlanParser {
  /**
   * Основний метод парсингу markdown плану
   */
  static parseMarkdownToSlideDescriptions(
    planData: string | any,
    slideCount: number
  ): SlideDescription[] {
    console.log('🔍 [PlanParser] Starting plan parsing', {
      dataType: typeof planData,
      expectedSlideCount: slideCount
    });

    try {
      // Спочатку перевіряємо чи це JSON object
      if (typeof planData === 'object' && planData !== null) {
        console.log('📋 [PlanParser] Detected JSON object, parsing structured plan');
        return this.parseJSONPlan(planData, slideCount);
      }

      // Якщо це string, спробуємо парсити як JSON
      if (typeof planData === 'string') {
        try {
          const parsedJSON = JSON.parse(planData);
          console.log('📋 [PlanParser] Successfully parsed JSON from string');
          return this.parseJSONPlan(parsedJSON, slideCount);
        } catch (jsonError) {
          console.log('📄 [PlanParser] Not JSON, treating as markdown');
          // Логуємо початок плану для діагностики
          console.log('📄 [PlanParser] Plan preview:', planData.substring(0, 500) + '...');
        }
      }

      // Fallback: парсимо як markdown (старий код)
      const markdownPlan = planData as string;
      
      // Спочатку пробуємо парсити як структурований план
      const structuredSlides = this.parseStructuredSlides(markdownPlan);
      
      if (structuredSlides.length > 0) {
        console.log('✅ [PlanParser] Successfully parsed structured slides:', structuredSlides.length);
        const descriptions = this.convertParsedSlidesToDescriptions(structuredSlides);
        console.log('📋 [PlanParser] Converted slide titles:', descriptions.map(d => d.title));
        return descriptions;
      }

      // Fallback: парсимо як простий markdown
      console.log('⚠️ [PlanParser] No structured slides found, trying simple markdown parsing');
      const simpleSlides = this.parseSimpleMarkdown(markdownPlan, slideCount);
      console.log('✅ [PlanParser] Parsed as simple markdown:', simpleSlides.length);
      console.log('📋 [PlanParser] Simple slide titles:', simpleSlides.map(d => d.title));
      
      return simpleSlides;

    } catch (error) {
      console.error('❌ [PlanParser] Error parsing plan:', error);
      
      // Fallback: створюємо базові слайди
      console.log('🆘 [PlanParser] Using fallback slides');
      return this.createFallbackSlides(slideCount);
    }
  }

  /**
   * Парсинг JSON плану в SlideDescription[]
   */
  private static parseJSONPlan(jsonPlan: any, slideCount: number): SlideDescription[] {
    console.log('🔍 [PlanParser] Parsing JSON plan structure');
    
    try {
      // Перевіряємо наявність slides array
      if (!jsonPlan.slides || !Array.isArray(jsonPlan.slides)) {
        console.warn('⚠️ [PlanParser] JSON plan missing slides array');
        return this.createFallbackSlides(slideCount);
      }

      const slides: SlideDescription[] = [];
      
      jsonPlan.slides.forEach((slide: any, index: number) => {

        console.log('slide data', slide);

        const slideNumber = slide.slideNumber || index + 1;
        const title = slide.title || slide.name || `Slide ${slideNumber}`;
        const description = slide.content || slide.description || slide.goal || 'Educational content for this slide.';
        const type = this.mapJSONSlideType(slide.type, slideNumber, jsonPlan.slides.length);
        
        slides.push({
          slideNumber,
          title,
          description,
          type
        });
        
        console.log(`📋 [PlanParser] Parsed JSON slide ${slideNumber}:`, { title, type, descriptionLength: description.length });
      });

      // Доповнюємо до потрібної кількості якщо потрібно
      while (slides.length < slideCount) {
        const slideNum = slides.length + 1;
        slides.push({
          slideNumber: slideNum,
          title: `Slide ${slideNum}`,
          description: `Additional educational content for slide ${slideNum}.`,
          type: this.determineSlideTypeSimple(slideNum, slideCount)
        });
      }

      console.log(`✅ [PlanParser] Successfully parsed ${slides.length} slides from JSON`);
      return slides;

    } catch (error) {
      console.error('❌ [PlanParser] Error parsing JSON plan:', error);
      return this.createFallbackSlides(slideCount);
    }
  }

  /**
   * Мапінг типів слайдів з JSON до наших типів
   */
  private static mapJSONSlideType(jsonType: string, slideNumber: number, totalSlides: number): 'introduction' | 'content' | 'activity' | 'summary' {
    if (!jsonType) {
      return this.determineSlideTypeSimple(slideNumber, totalSlides);
    }

    const type = jsonType.toLowerCase();
    
    if (type.includes('introduction') || type.includes('intro')) {
      return 'introduction';
    }
    if (type.includes('activity') || type.includes('game') || type.includes('interactive')) {
      return 'activity';
    }
    if (type.includes('summary') || type.includes('conclusion') || type.includes('review')) {
      return 'summary';
    }
    
    // За замовчуванням - content
    return 'content';
  }

  /**
   * Парсинг структурованих слайдів з markdown
   */
  private static parseStructuredSlides(markdown: string): ParsedSlide[] {
    const slides: ParsedSlide[] = [];
    
    // Regex для пошуку слайдів: ### Slide X: Title
    const slideRegex = /### Slide (\d+): (.+?)(?=\n### Slide \d+:|$)/gs;
    let match;

    while ((match = slideRegex.exec(markdown)) !== null) {
      const slideNumber = parseInt(match[1]);
      const slideContent = match[0];
      
      const slide = this.parseIndividualSlide(slideContent, slideNumber);
      if (slide) {
        slides.push(slide);
      }
    }

    return slides.sort((a, b) => a.slideNumber - b.slideNumber);
  }

  /**
   * Парсинг окремого слайду
   */
  private static parseIndividualSlide(slideContent: string, slideNumber: number): ParsedSlide | null {
    try {
      // Витягуємо заголовок
      const titleMatch = slideContent.match(/### Slide \d+: (.+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Slide ${slideNumber}`;

      // Витягуємо тип слайду
      const type = this.determineSlideType(slideNumber, title, slideContent);

      // Витягуємо мету слайду
      const goalMatch = slideContent.match(/\*\*Мета:\*\*\s*(.+?)(?=\n|$)/i) ||
                       slideContent.match(/\*\*Goal:\*\*\s*(.+?)(?=\n|$)/i);
      const goal = goalMatch ? goalMatch[1].trim() : `Introduce ${title.toLowerCase()}`;

      // Витягуємо основний контент (все після заголовка)
      const contentMatch = slideContent.match(/### Slide \d+: .+?\n([\s\S]+)/);
      const content = contentMatch ? contentMatch[1].trim() : slideContent;

      return {
        slideNumber,
        title,
        type,
        goal,
        content
      };

    } catch (error) {
      console.error(`❌ [PlanParser] Error parsing slide ${slideNumber}:`, error);
      return null;
    }
  }

  /**
   * Визначення типу слайду на основі номера та контенту
   */
  private static determineSlideType(slideNumber: number, title: string, content: string): SlideType {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    // Перший слайд завжди Introduction
    if (slideNumber === 1) {
      return 'Introduction';
    }

    // Ключові слова для різних типів
    if (titleLower.includes('introduction') || titleLower.includes('greeting') || titleLower.includes('welcome')) {
      return 'Introduction';
    }

    if (titleLower.includes('activity') || titleLower.includes('game') || titleLower.includes('practice') ||
        contentLower.includes('activity') || contentLower.includes('game') || contentLower.includes('exercise')) {
      return 'Activity';
    }

    if (titleLower.includes('summary') || titleLower.includes('conclusion') || titleLower.includes('review') ||
        contentLower.includes('summary') || contentLower.includes('review') || contentLower.includes('recap')) {
      return 'Summary';
    }

    // За замовчуванням - Educational
    return 'Educational';
  }

  /**
   * Парсинг простого markdown без структури
   */
  private static parseSimpleMarkdown(markdown: string, slideCount: number): SlideDescription[] {
    const slides: SlideDescription[] = [];
    
    console.log('🔍 [PlanParser] Parsing simple markdown...');
    
    // Спробуємо різні підходи до розділення
    let sections: string[] = [];
    let foundSlideKeywords = false;
    
    // Спочатку шукаємо секції зі словом "Slide"
    const slidePattern = /(?:^|\n)(?:#{1,3}\s*)?(?:Slide\s*\d+|SLIDE\s*\d+)[:\-\s]*/gmi;
    if (slidePattern.test(markdown)) {
      sections = markdown.split(slidePattern).filter(section => section.trim());
      foundSlideKeywords = true;
      console.log('📄 [PlanParser] Found slide keywords, sections:', sections.length);
    }
    // Потім пробуємо розділити по заголовках різних рівнів
    else if (markdown.includes('###')) {
      sections = markdown.split(/###\s+/).filter(section => section.trim());
      console.log('📄 [PlanParser] Found ### headers, sections:', sections.length);
    } else if (markdown.includes('##')) {
      sections = markdown.split(/##\s+/).filter(section => section.trim());
      console.log('📄 [PlanParser] Found ## headers, sections:', sections.length);
    } else if (markdown.includes('#')) {
      sections = markdown.split(/#\s+/).filter(section => section.trim());
      console.log('📄 [PlanParser] Found # headers, sections:', sections.length);
    } else {
      // Якщо немає заголовків, розділяємо по абзацах
      sections = markdown.split(/\n\s*\n/).filter(section => section.trim());
      console.log('📄 [PlanParser] No headers found, splitting by paragraphs:', sections.length);
    }
    
    // Логуємо перші кілька секцій для діагностики
    sections.slice(0, 3).forEach((section, i) => {
      console.log(`📋 [PlanParser] Section ${i + 1} preview:`, section.substring(0, 100) + '...');
    });
    
    for (let i = 0; i < Math.min(sections.length, slideCount); i++) {
      const section = sections[i].trim();
      const lines = section.split('\n').filter(line => line.trim());
      
      // Витягуємо заголовок - перша лінія або перша значуща лінія
      let title = lines[0] || `Slide ${i + 1}`;
      
      // Очищуємо заголовок від markdown символів
      title = title.replace(/[#*_`]/g, '').replace(/[:\-\|]/g, '').trim();
      
      // Якщо заголовок порожній або дуже короткий, створюємо базовий
      if (!title || title.length < 3) {
        title = `Slide ${i + 1}`;
      }
      
      // Опис - все крім першої лінії
      const description = lines.slice(1).join('\n').trim() || 
                         section.trim() || 
                         `Educational content for slide ${i + 1} about the lesson topic.`;
      
      const slide = {
        slideNumber: i + 1,
        title,
        description,
        type: this.determineSlideTypeSimple(i + 1, slideCount)
      };
      
      console.log(`📋 [PlanParser] Created slide ${i + 1}:`, { title: slide.title, descriptionLength: slide.description.length });
      slides.push(slide);
    }

    // Доповнюємо до потрібної кількості
    while (slides.length < slideCount) {
      const slideNum = slides.length + 1;
      const slide = {
        slideNumber: slideNum,
        title: `Slide ${slideNum}`,
        description: `Educational content for slide ${slideNum}. This slide will cover important aspects of the lesson topic appropriate for the target age group.`,
        type: this.determineSlideTypeSimple(slideNum, slideCount)
      };
      
      console.log(`📋 [PlanParser] Added fallback slide ${slideNum}`);
      slides.push(slide);
    }

    return slides;
  }

  /**
   * Визначення типу слайду для простого парсингу
   */
  private static determineSlideTypeSimple(slideNumber: number, totalSlides: number): 'introduction' | 'content' | 'activity' | 'summary' {
    if (slideNumber === 1) return 'introduction';
    if (slideNumber === totalSlides) return 'summary';
    if (slideNumber === totalSlides - 1 && totalSlides > 2) return 'activity';
    return 'content';
  }

  /**
   * Конвертація ParsedSlide в SlideDescription
   */
  private static convertParsedSlidesToDescriptions(parsedSlides: ParsedSlide[]): SlideDescription[] {
    return parsedSlides.map(slide => ({
      slideNumber: slide.slideNumber,
      title: slide.title,
      description: slide.content,
      type: slide.type.toLowerCase() as 'introduction' | 'content' | 'activity' | 'summary'
    }));
  }

  /**
   * Створення fallback слайдів у випадку помилки парсингу
   */
  private static createFallbackSlides(slideCount: number): SlideDescription[] {
    console.log('⚠️ [PlanParser] Creating fallback slides');
    
    const slides: SlideDescription[] = [];
    
    for (let i = 1; i <= slideCount; i++) {
      slides.push({
        slideNumber: i,
        title: `Slide ${i}`,
        description: `Content for slide ${i}. This slide will be generated based on the lesson topic.`,
        type: this.determineSlideTypeSimple(i, slideCount)
      });
    }

    return slides;
  }

  /**
   * Валідація результатів парсингу
   */
  static validateSlideDescriptions(slides: SlideDescription[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!slides || slides.length === 0) {
      errors.push('No slides found');
      return { isValid: false, errors };
    }

    // Перевіряємо кожен слайд
    slides.forEach((slide, index) => {
      if (!slide.title || slide.title.trim() === '') {
        errors.push(`Slide ${index + 1}: Missing title`);
      }
      
      if (!slide.description || slide.description.trim() === '') {
        errors.push(`Slide ${index + 1}: Missing description`);
      }
      
      if (!slide.slideNumber || slide.slideNumber !== index + 1) {
        errors.push(`Slide ${index + 1}: Invalid slide number`);
      }
    });

    // Перевіряємо послідовність номерів
    const slideNumbers = slides.map(s => s.slideNumber).sort((a, b) => a - b);
    for (let i = 0; i < slideNumbers.length; i++) {
      if (slideNumbers[i] !== i + 1) {
        errors.push(`Missing slide number ${i + 1}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Отримання статистики парсингу
   */
  static getParsingStats(slides: SlideDescription[]): {
    totalSlides: number;
    slideTypes: Record<string, number>;
    averageDescriptionLength: number;
  } {
    const slideTypes: Record<string, number> = {};
    let totalDescriptionLength = 0;

    slides.forEach(slide => {
      slideTypes[slide.type] = (slideTypes[slide.type] || 0) + 1;
      totalDescriptionLength += slide.description.length;
    });

    return {
      totalSlides: slides.length,
      slideTypes,
      averageDescriptionLength: Math.round(totalDescriptionLength / slides.length)
    };
  }
}

/**
 * Utility функції для роботи з планами
 */
export const planParserUtils = {
  /**
   * Швидкий парсинг без детальної валідації
   */
  quickParse: (markdown: string, slideCount: number): SlideDescription[] => {
    return PlanParser.parseMarkdownToSlideDescriptions(markdown, slideCount);
  },

  /**
   * Парсинг з валідацією
   */
  parseAndValidate: (markdown: string, slideCount: number): {
    slides: SlideDescription[];
    validation: { isValid: boolean; errors: string[] };
    stats: { totalSlides: number; slideTypes: Record<string, number>; averageDescriptionLength: number };
  } => {
    const slides = PlanParser.parseMarkdownToSlideDescriptions(markdown, slideCount);
    const validation = PlanParser.validateSlideDescriptions(slides);
    const stats = PlanParser.getParsingStats(slides);

    return { slides, validation, stats };
  }
};
