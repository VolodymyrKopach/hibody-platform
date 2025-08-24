import { GeminiContentService } from '@/services/content/GeminiContentService';
import { LessonService } from '@/services/database/LessonService';
import { SlideService } from '@/services/database/SlideService';
import { AgeGroupConfig, FormData } from '@/types/generation';
import { LessonInsert } from '@/types/database';
import { configManager } from './ConfigManager';
import { slideTemplateService } from './SlideTemplateService';

// === SOLID: SRP - Types for generation ===
interface GenerationOptions {
  userId: string;
  title?: string;
  description?: string;
  generateSlides?: boolean;
  slideCount?: number;
}

interface GenerationContext {
  ageGroup: AgeGroupConfig;
  formData: FormData;
  options: GenerationOptions;
  prompt: string;
}

interface GeneratedLesson {
  id: string;
  title: string;
  description: string;
  slides: GeneratedSlide[];
}

interface GeneratedSlide {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  type: 'welcome' | 'content' | 'activity' | 'summary';
  status: 'ready' | 'generating' | 'error';
}

// === SOLID: SRP - Main generation service ===
export class GenerationConstructorService {
  private contentService: GeminiContentService;
  private lessonService: LessonService;
  private slideService: SlideService;

  constructor(private geminiApiKey: string) {
    this.contentService = new GeminiContentService();
    this.lessonService = new LessonService();
    this.slideService = new SlideService();
  }

  // === SOLID: SRP - Main generation method ===
  async generateLesson(
    ageGroupConfig: AgeGroupConfig,
    formData: FormData,
    options: GenerationOptions
  ): Promise<GeneratedLesson> {
    console.log('🎯 GENERATION SERVICE: Starting lesson generation');
    
    // === SOLID: SRP - Build generation context ===
    const context = await this.buildGenerationContext(ageGroupConfig, formData, options);
    
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
    formData: FormData,
    options: GenerationOptions
  ): Promise<GenerationContext> {
    console.log('📋 GENERATION SERVICE: Building generation context');
    
    // === SOLID: SRP - Get age group configuration ===
    const ageConfig = configManager.getAgeGroupConfig(ageGroupConfig.id || '2-3');
    
    if (!ageConfig) {
      throw new Error(`Age group configuration not found for ID: ${ageGroupConfig.id || '2-3'}`);
    }
    
    // === SOLID: SRP - Build AI prompt from form values ===
    const prompt = this.buildAIPrompt(ageConfig, formData, options);
    
    return {
      ageGroup: ageConfig,
      formData,
      options,
      prompt
    };
  }

  // === SOLID: SRP - Build AI prompt from configuration ===
  private buildAIPrompt(
    ageConfig: AgeGroupConfig,
    formData: FormData,
    options: GenerationOptions
  ): string {
    console.log('🤖 GENERATION SERVICE: Building AI prompt');
    
    const parts = [
      `Create lesson for children ${ageConfig.name || 'students'} (${ageConfig.description || 'educational content'}).`,
      `Lesson title: "${options.title || 'New Lesson'}"`,
      `Description: "${options.description || 'Lesson created using constructor'}"`,
    ];
    
    // === SOLID: SRP - Add form values to prompt ===
    Object.entries(formData).forEach(([field, value]) => {
      if (value && value !== '') {
        parts.push(`${field}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
    });
    
    // === SOLID: SRP - Add age-specific instructions ===
    parts.push(`Age features: ${ageConfig.fontSize?.primary || 'medium'}, ${ageConfig.layout?.elementsPerSlide || 3} elements per slide`);
    
    if (options.generateSlides) {
      parts.push(`Create ${options.slideCount || 4} slides for this lesson.`);
    }
    
    return parts.join('\n');
  }

  // === SOLID: SRP - Generate lesson metadata ===
  private async generateLessonMetadata(context: GenerationContext): Promise<LessonInsert> {
    console.log('📚 GENERATION SERVICE: Generating lesson metadata');
    
    let enhancedDescription = context.options.description || 'Lesson created using constructor';
    
    // === SOLID: SRP - Try to enhance description with AI ===
    try {
      const enhancementPrompt = `Create a brief educational description for: ${context.options.title || 'New Lesson'}. Topic: ${context.formData.topic || 'General'}. Age: ${context.ageGroup.name || 'students'}. Max 200 characters.`;
      
      const enhancedText = await this.contentService.generateLessonPlan(
        enhancementPrompt,
        context.ageGroup.ageRange || '6-8 years',
        'en',
        undefined,
        3 // Short description generation
      );
      
      if (enhancedText && enhancedText.length > 10 && enhancedText.length < 500) {
        enhancedDescription = enhancedText.substring(0, 200);
      }
    } catch (error) {
      console.error('❌ GENERATION SERVICE: Error enhancing description:', error);
      // Keep the original description
    }

    return {
      title: context.options.title || 'New Lesson',
      description: enhancedDescription,
      subject: context.formData.topic || 'General Education',
      age_group: context.ageGroup.id || '6-8',
      duration: 30,
      author_id: context.options.userId,
      status: 'ready',
      metadata: {
        generatedBy: 'constructor',
        ageGroup: context.ageGroup.id || '6-8',
        formData: context.formData,
        createdAt: new Date().toISOString()
      }
    };
  }

  // === SOLID: SRP - Create lesson in database ===
  private async createLessonInDatabase(lessonData: LessonInsert, options: GenerationOptions): Promise<any> {
    console.log('💾 GENERATION SERVICE: Creating lesson in database');
    
    try {
      const lesson = await this.lessonService.createLesson(lessonData);
      console.log('✅ GENERATION SERVICE: Lesson created with ID:', lesson.id);
      return lesson;
    } catch (error) {
      console.error('❌ GENERATION SERVICE: Database error:', error);
      throw new Error('Failed to create lesson in database');
    }
  }

  // === SOLID: SRP - Generate slides for lesson using centralized template service ===
  private async generateSlides(lessonId: string, context: GenerationContext): Promise<any[]> {
    console.log('🎨 GENERATION SERVICE: Generating slides');
    
    const slideCount = context.options.slideCount || 4;
    const slides = [];
    
    // === SOLID: SRP - Use centralized template service ===
    const slideTemplates = slideTemplateService.generateTemplatesForCount(slideCount, { 
      language: 'en',
      includeIcons: false 
    });
    
    // === SOLID: SRP - Create slides based on templates ===
    for (let i = 0; i < slideCount; i++) {
      const template = slideTemplates[i];
      
      try {
        console.log(`📄 GENERATION SERVICE: Creating slide ${i + 1}/${slideCount}`);
        
        const slide = await this.slideService.createSlide({
          lesson_id: lessonId,
          title: template.title,
          description: template.description,
          type: template.type as any,
          icon: slideTemplateService.getSlideIcon(template.type),
          slide_number: i + 1,
          status: 'ready',
          metadata: {
            generatedBy: 'constructor',
            ageGroup: context.ageGroup.id || '6-8',
            template: template.type
          }
        });
        
        slides.push(slide);
        
      } catch (error) {
        console.error(`❌ GENERATION SERVICE: Error creating slide ${i + 1}:`, error);
        
        // === SOLID: SRP - Create fallback slide ===
        slides.push({
          id: `slide_${Date.now()}_${i}`,
          title: `Slide ${i + 1}`,
          description: 'Slide will be generated later',
          type: 'content',
          status: 'error'
        });
      }
    }
    
    console.log('✅ GENERATION SERVICE: All slides created');
    return slides;
  }

  // === SOLID: SRP - Map slide type for compatibility ===
  private mapSlideType(type: string): 'welcome' | 'content' | 'activity' | 'summary' {
    const typeMap: Record<string, 'welcome' | 'content' | 'activity' | 'summary'> = {
      welcome: 'welcome',
      content: 'content',
      activity: 'activity',
      summary: 'summary',
      introduction: 'welcome',
      conclusion: 'summary'
    };
    
    return typeMap[type] || 'content';
  }
} 