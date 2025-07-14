import { ClaudeSonnetContentService } from '@/services/content/ClaudeSonnetContentService';
import { LessonService } from '@/services/database/LessonService';
import { SlideService } from '@/services/database/SlideService';
import { AgeGroupConfig, FormValues } from '@/types/generation';
import { LessonInsert } from '@/types/database';
import { configManager } from './ConfigManager';

// === SOLID: SRP - Types for generation ===
interface GenerationOptions {
  userId: string;
  title?: string;
  description?: string;
  generateSlides?: boolean;
  slideCount?: number;
}

interface GeneratedLesson {
  id: string;
  title: string;
  description: string;
  slides: Array<{
    id: string;
    title: string;
    content: string;
    htmlContent?: string;
    type: 'welcome' | 'content' | 'activity' | 'summary';
    status: 'ready' | 'generating' | 'error';
  }>;
}

interface GenerationContext {
  ageGroup: AgeGroupConfig;
  formValues: FormValues;
  options: GenerationOptions;
  prompt: string;
}

// === SOLID: SRP - Main generation service ===
export class GenerationConstructorService {
  private contentService: ClaudeSonnetContentService;
  private lessonService: LessonService;
  private slideService: SlideService;

  constructor(private claudeApiKey: string) {
    this.contentService = new ClaudeSonnetContentService(claudeApiKey);
    this.lessonService = new LessonService();
    this.slideService = new SlideService();
  }

  // === SOLID: SRP - Main generation method ===
  async generateLesson(
    ageGroupConfig: AgeGroupConfig,
    formValues: FormValues,
    options: GenerationOptions
  ): Promise<GeneratedLesson> {
    console.log('🎯 GENERATION SERVICE: Starting lesson generation');
    
    // === SOLID: SRP - Build generation context ===
    const context = await this.buildGenerationContext(ageGroupConfig, formValues, options);
    
    // === SOLID: SRP - Generate lesson metadata ===
    const lessonData = await this.generateLessonMetadata(context);
    
    // === SOLID: SRP - Create lesson in database ===
    const lesson = await this.createLessonInDatabase(lessonData, options);
    
    // === SOLID: SRP - Generate slides if requested ===
    let slides: any[] = [];
    if (options.generateSlides) {
      slides = await this.generateSlides(lesson.id, context);
    }
    
    console.log('✅ GENERATION SERVICE: Lesson generated successfully');
    
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      slides: slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        content: slide.description || '',
        htmlContent: slide.html_content || undefined,
        type: this.mapSlideType(slide.type),
        status: slide.status === 'ready' ? 'ready' : 'generating'
      }))
    };
  }

  // === SOLID: SRP - Build generation context ===
  private async buildGenerationContext(
    ageGroupConfig: AgeGroupConfig,
    formValues: FormValues,
    options: GenerationOptions
  ): Promise<GenerationContext> {
    console.log('📋 GENERATION SERVICE: Building generation context');
    
    // === SOLID: SRP - Get age group configuration ===
    const ageConfig = configManager.getAgeGroupConfig(ageGroupConfig.id);
    
    if (!ageConfig) {
      throw new Error(`Age group configuration not found for ID: ${ageGroupConfig.id}`);
    }
    
    // === SOLID: SRP - Build AI prompt from form values ===
    const prompt = this.buildAIPrompt(ageConfig, formValues, options);
    
    return {
      ageGroup: ageConfig,
      formValues,
      options,
      prompt
    };
  }

  // === SOLID: SRP - Build AI prompt from configuration ===
  private buildAIPrompt(
    ageConfig: AgeGroupConfig,
    formValues: FormValues,
    options: GenerationOptions
  ): string {
    console.log('🤖 GENERATION SERVICE: Building AI prompt');
    
    const parts = [
      `Створи урок для дітей ${ageConfig.name} (${ageConfig.description}).`,
      `Назва уроку: "${options.title || 'Новий урок'}"`,
      `Опис: "${options.description || 'Урок створено за допомогою конструктора'}"`,
    ];
    
    // === SOLID: SRP - Add form values to prompt ===
    Object.entries(formValues).forEach(([field, value]) => {
      if (value && value !== '') {
        parts.push(`${field}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
    });
    
    // === SOLID: SRP - Add age-specific instructions ===
    parts.push(`Вікові особливості: ${ageConfig.fontSize.primary}, ${ageConfig.layout.elementsPerSlide} елементів на слайд`);
    
    if (options.generateSlides) {
      parts.push(`Створи ${options.slideCount || 4} слайди для цього уроку.`);
    }
    
    return parts.join('\n');
  }

  // === SOLID: SRP - Generate lesson metadata ===
  private async generateLessonMetadata(context: GenerationContext): Promise<LessonInsert> {
    console.log('📚 GENERATION SERVICE: Generating lesson metadata');
    
    // === SOLID: SRP - Use Claude to enhance lesson description ===
    const enhancedDescription = await this.enhanceLessonDescription(context);
    
    return {
      user_id: context.options.userId,
      title: context.options.title || 'Урок створений конструктором',
      description: enhancedDescription,
      subject: context.formValues.subject || 'Загальна освіта',
      age_group: context.ageGroup.id,
      duration: parseInt(context.formValues.duration as string) || 45,
      difficulty: context.formValues.difficulty || 'medium',
      status: 'draft',
      is_public: false,
      tags: [],
      metadata: {
        generatedBy: 'constructor',
        ageGroupConfig: context.ageGroup,
        formValues: context.formValues,
        generationTimestamp: new Date().toISOString()
      }
    };
  }

  // === SOLID: SRP - Enhance lesson description with AI ===
  private async enhanceLessonDescription(context: GenerationContext): Promise<string> {
    try {
      const prompt = `Створи короткий, привабливий опис уроку на основі наступної інформації:
      
${context.prompt}

Опис повинен бути:
- Коротким (2-3 речення)
- Привабливим для дітей ${context.ageGroup.name}
- Включати основні теми та цілі уроку
- Написаним українською мовою`;

      const description = await this.contentService.generateLessonPlan(
        context.options.title || 'урок',
        context.ageGroup.name,
        'uk'
      );

      // === SOLID: SRP - Extract first paragraph as description ===
      const firstParagraph = description.split('\n')[0];
      return firstParagraph || context.options.description || 'Урок створено за допомогою конструктора';
      
    } catch (error) {
      console.error('❌ GENERATION SERVICE: Error enhancing description:', error);
      return context.options.description || 'Урок створено за допомогою конструктора';
    }
  }

  // === SOLID: SRP - Create lesson in database ===
  private async createLessonInDatabase(lessonData: LessonInsert, options: GenerationOptions): Promise<any> {
    console.log('💾 GENERATION SERVICE: Creating lesson in database');
    
    // === SOLID: SRP - Check if user can create lesson ===
    const canCreate = await this.lessonService.canCreateLesson(options.userId);
    if (!canCreate) {
      throw new Error('Досягнуто ліміт уроків для вашої підписки');
    }
    
    // === SOLID: SRP - Create lesson ===
    const lesson = await this.lessonService.createLesson(lessonData);
    
    console.log('✅ GENERATION SERVICE: Lesson created with ID:', lesson.id);
    return lesson;
  }

  // === SOLID: SRP - Generate slides for lesson ===
  private async generateSlides(lessonId: string, context: GenerationContext): Promise<any[]> {
    console.log('🎨 GENERATION SERVICE: Generating slides');
    
    const slideCount = context.options.slideCount || 4;
    const slides = [];
    
    // === SOLID: SRP - Generate default slide structure ===
    const slideTemplates = [
      { title: 'Вітання', type: 'welcome', description: 'Знайомство з темою уроку' },
      { title: 'Основний матеріал', type: 'content', description: 'Подача нового матеріалу' },
      { title: 'Практичне завдання', type: 'activity', description: 'Закріплення знань' },
      { title: 'Підсумок', type: 'summary', description: 'Узагальнення вивченого' }
    ];
    
    // === SOLID: SRP - Create slides based on templates ===
    for (let i = 0; i < slideCount; i++) {
      const template = slideTemplates[i % slideTemplates.length];
      
      try {
        console.log(`📄 GENERATION SERVICE: Creating slide ${i + 1}/${slideCount}`);
        
        const slide = await this.slideService.createSlide({
          lesson_id: lessonId,
          title: `${template.title} ${i + 1}`,
          description: template.description,
          type: template.type as any,
          icon: this.getSlideIcon(template.type),
          slide_number: i + 1,
          status: 'ready',
          metadata: {
            generatedBy: 'constructor',
            ageGroup: context.ageGroup.id,
            template: template.type
          }
        });
        
        slides.push(slide);
        
      } catch (error) {
        console.error(`❌ GENERATION SERVICE: Error creating slide ${i + 1}:`, error);
        
        // === SOLID: SRP - Create fallback slide ===
        slides.push({
          id: `slide_${Date.now()}_${i}`,
          title: `Слайд ${i + 1}`,
          description: 'Слайд буде згенеровано пізніше',
          type: 'content',
          status: 'error'
        });
      }
    }
    
    console.log('✅ GENERATION SERVICE: All slides created');
    return slides;
  }

  // === SOLID: SRP - Helper methods ===
  private getSlideIcon(type: string): string {
    const icons: Record<string, string> = {
      welcome: '👋',
      content: '📚',
      activity: '🎯',
      summary: '📝'
    };
    
    return icons[type] || '📄';
  }

  private mapSlideType(type: string): 'welcome' | 'content' | 'activity' | 'summary' {
    const mapping: Record<string, 'welcome' | 'content' | 'activity' | 'summary'> = {
      welcome: 'welcome',
      content: 'content',
      activity: 'activity',
      summary: 'summary'
    };
    
    return mapping[type] || 'content';
  }
} 