import { GeminiContentService } from '@/services/content/GeminiContentService';
import { AgeGroupConfig, FormValues } from '@/types/generation';
import { configManager } from './ConfigManager';

// === SOLID: SRP - Types for preview generation ===
export interface PreviewSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type: 'welcome' | 'content' | 'activity' | 'summary';
  estimatedDuration: number; // in seconds
  elements: PreviewElement[];
}

export interface PreviewElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'interactive' | 'animation';
  content: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    fontSize: string;
    color: string;
    fontWeight: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounce' | 'zoom';
    duration: number;
    delay: number;
  };
}

export interface EnhancedPreviewData {
  ageGroup: AgeGroupConfig;
  formValues: FormValues;
  characteristics: {
    fontSize: {
      primary: string;
      secondary: string;
      body: string;
    };
    layout: {
      elementsPerSlide: number;
      maxWords: number;
      spacing: 'compact' | 'normal' | 'spacious';
    };
    audio: {
      required: boolean;
      types: string[];
      volume: string;
    };
    estimatedDuration: string;
    complexity: string;
  };
  slides: PreviewSlide[];
  totalSlides: number;
  metadata: {
    generatedAt: string;
    generationTime: number; // in milliseconds
    aiProvider: string;
    version: string;
  };
}

// === SOLID: SRP - Preview generation service ===
export class PreviewGenerationService {
  private contentService: GeminiContentService | null = null;

  constructor(private geminiApiKey?: string) {
    if (geminiApiKey) {
      this.contentService = new GeminiContentService();
    }
  }

  // === SOLID: SRP - Generate enhanced preview ===
  async generateEnhancedPreview(
    ageGroupConfig: AgeGroupConfig,
    formValues: FormValues,
    options: {
      slideCount?: number;
      includeInteractiveElements?: boolean;
      deviceType?: 'desktop' | 'tablet' | 'mobile';
    } = {}
  ): Promise<EnhancedPreviewData> {
    const startTime = Date.now();
    console.log('🎯 PREVIEW SERVICE: Generating enhanced preview');

    try {
      // === SOLID: SRP - Get age group configuration ===
      const ageConfig = configManager.getAgeGroupConfig(ageGroupConfig.id);
      if (!ageConfig) {
        throw new Error(`Age group configuration not found: ${ageGroupConfig.id}`);
      }

      // === SOLID: SRP - Generate preview slides ===
      const slides = await this.generatePreviewSlides(
        ageConfig,
        formValues,
        options.slideCount || 3
      );

      // === SOLID: SRP - Calculate characteristics ===
      const characteristics = this.calculateCharacteristics(ageConfig, formValues, slides);

      // === SOLID: SRP - Build metadata ===
      const metadata = {
        generatedAt: new Date().toISOString(),
        generationTime: Date.now() - startTime,
        aiProvider: this.contentService ? 'AI' : 'Mock',
        version: '3.0.0'
      };

      console.log('✅ PREVIEW SERVICE: Preview generated successfully');

      return {
        ageGroup: ageConfig,
        formValues,
        characteristics,
        slides,
        totalSlides: slides.length,
        metadata
      };

    } catch (error) {
      console.error('❌ PREVIEW SERVICE: Error generating preview:', error);
      
      // === SOLID: SRP - Fallback to mock data ===
      return this.generateMockPreview(ageGroupConfig, formValues);
    }
  }

  // === SOLID: SRP - Generate preview slides ===
  private async generatePreviewSlides(
    ageConfig: AgeGroupConfig,
    formValues: FormValues,
    slideCount: number
  ): Promise<PreviewSlide[]> {
    console.log('🎨 PREVIEW SERVICE: Generating preview slides');

    const slides: PreviewSlide[] = [];
    const slideTemplates = [
      { title: 'Вітання', type: 'welcome', baseContent: 'Привіт! Сьогодні ми вивчаємо' },
      { title: 'Основний матеріал', type: 'content', baseContent: 'Давайте дізнаємося про' },
      { title: 'Практичне завдання', type: 'activity', baseContent: 'Тепер спробуймо самі' },
      { title: 'Підсумок', type: 'summary', baseContent: 'Що ми сьогодні вивчили?' }
    ];

    for (let i = 0; i < slideCount; i++) {
      const template = slideTemplates[i % slideTemplates.length];
      
      try {
        // === SOLID: SRP - Generate slide content ===
        let htmlContent = '';
        let content = '';

        if (this.contentService) {
          // Real AI generation
          const prompt = this.buildSlidePrompt(template, ageConfig, formValues, i + 1);
          htmlContent = await this.contentService.generateSlideContent(
            prompt,
            formValues.subject as string || 'урок',
            ageConfig.name
          );
          content = this.extractTextFromHtml(htmlContent);
        } else {
          // Mock generation
          content = `${template.baseContent} ${formValues.subject || 'цікаву тему'}`;
          htmlContent = this.generateMockHtml(content, ageConfig);
        }

        // === SOLID: SRP - Generate elements ===
        const elements = this.generateSlideElements(content, ageConfig, template.type);

        slides.push({
          id: `preview-slide-${i + 1}`,
          title: `${template.title} ${i + 1}`,
          content,
          htmlContent,
          type: template.type as any,
          estimatedDuration: this.calculateSlideDuration(content, ageConfig),
          elements
        });

      } catch (error) {
        console.error(`❌ PREVIEW SERVICE: Error generating slide ${i + 1}:`, error);
        
        // === SOLID: SRP - Fallback slide ===
        slides.push(this.generateFallbackSlide(i + 1, template, ageConfig));
      }
    }

    return slides;
  }

  // === SOLID: SRP - Build slide prompt ===
  private buildSlidePrompt(
    template: any,
    ageConfig: AgeGroupConfig,
    formValues: FormValues,
    slideNumber: number
  ): string {
    const parts = [
      `Створи ${template.title.toLowerCase()} для дітей ${ageConfig.name} (${ageConfig.ageRange}).`,
      `Тема: ${formValues.subject || 'загальна тема'}`,
      `Слайд ${slideNumber}`,
      `Тип: ${template.type}`,
      `Базовий контент: ${template.baseContent}`
    ];

    // === SOLID: SRP - Add form-specific instructions ===
    Object.entries(formValues).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'subject') {
        parts.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
    });

    // === SOLID: SRP - Add age-specific constraints ===
    parts.push(`Розмір шрифту: ${ageConfig.fontSize.primary}`);
    parts.push(`Максимум елементів: ${ageConfig.layout.elementsPerSlide}`);
    parts.push(`Максимум слів: ${ageConfig.layout.maxWords}`);

    return parts.join('\n');
  }

  // === SOLID: SRP - Generate slide elements ===
  private generateSlideElements(
    content: string,
    ageConfig: AgeGroupConfig,
    slideType: string
  ): PreviewElement[] {
    const elements: PreviewElement[] = [];
    const words = content.split(' ');
    const maxElements = ageConfig.layout.elementsPerSlide;

    // === SOLID: SRP - Main text element ===
    elements.push({
      id: 'main-text',
      type: 'text',
      content: words.slice(0, ageConfig.layout.maxWords).join(' '),
      position: { x: 10, y: 20, width: 80, height: 40 },
      style: {
        fontSize: ageConfig.fontSize.primary,
        color: '#2D3748',
        fontWeight: '600'
      },
      animation: {
        type: 'fadeIn',
        duration: 1000,
        delay: 0
      }
    });

    // === SOLID: SRP - Add type-specific elements ===
    if (slideType === 'welcome' && maxElements > 1) {
      elements.push({
        id: 'welcome-image',
        type: 'image',
        content: '🎉',
        position: { x: 70, y: 10, width: 20, height: 20 },
        style: {
          fontSize: '3rem',
          color: '#4299E1',
          fontWeight: 'normal'
        },
        animation: {
          type: 'bounce',
          duration: 1500,
          delay: 500
        }
      });
    }

    if (slideType === 'activity' && maxElements > 1) {
      elements.push({
        id: 'activity-button',
        type: 'interactive',
        content: 'Натисни мене! 🎯',
        position: { x: 25, y: 70, width: 50, height: 15 },
        style: {
          fontSize: ageConfig.fontSize.secondary,
          color: '#FFFFFF',
          fontWeight: '500',
          backgroundColor: '#48BB78',
          borderRadius: '8px'
        },
        animation: {
          type: 'slideIn',
          duration: 800,
          delay: 1000
        }
      });
    }

    return elements.slice(0, maxElements);
  }

  // === SOLID: SRP - Calculate characteristics ===
  private calculateCharacteristics(
    ageConfig: AgeGroupConfig,
    formValues: FormValues,
    slides: PreviewSlide[]
  ) {
    const totalDuration = slides.reduce((sum, slide) => sum + slide.estimatedDuration, 0);
    
    return {
      fontSize: ageConfig.fontSize,
      layout: ageConfig.layout,
      audio: ageConfig.audio,
      estimatedDuration: this.formatDuration(totalDuration),
      complexity: ageConfig.complexity
    };
  }

  // === SOLID: SRP - Helper methods ===
  private calculateSlideDuration(content: string, ageConfig: AgeGroupConfig): number {
    const wordCount = content.split(' ').length;
    const baseTime = 30; // seconds
    const timePerWord = ageConfig.complexity === 'simple' ? 2 : 
                       ageConfig.complexity === 'medium' ? 1.5 : 1;
    
    return Math.max(baseTime, wordCount * timePerWord);
  }

  private extractTextFromHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private generateMockHtml(content: string, ageConfig: AgeGroupConfig): string {
    return `
      <div style="font-size: ${ageConfig.fontSize.primary}; padding: 20px; text-align: center;">
        <h1 style="color: #2D3748; margin-bottom: 20px;">${content}</h1>
      </div>
    `;
  }

  private generateFallbackSlide(
    slideNumber: number,
    template: any,
    ageConfig: AgeGroupConfig
  ): PreviewSlide {
    const content = `${template.baseContent} - це прикладовий слайд ${slideNumber}`;
    
    return {
      id: `fallback-slide-${slideNumber}`,
      title: `${template.title} ${slideNumber}`,
      content,
      htmlContent: this.generateMockHtml(content, ageConfig),
      type: template.type,
      estimatedDuration: 60,
      elements: [{
        id: 'fallback-text',
        type: 'text',
        content,
        position: { x: 10, y: 30, width: 80, height: 40 },
        style: {
          fontSize: ageConfig.fontSize.primary,
          color: '#718096',
          fontWeight: 'normal'
        },
        animation: {
          type: 'fadeIn',
          duration: 1000,
          delay: 0
        }
      }]
    };
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} сек`;
    }
    
    return `${minutes} хв ${remainingSeconds} сек`;
  }

  // === SOLID: SRP - Generate mock preview for fallback ===
  private generateMockPreview(
    ageGroupConfig: AgeGroupConfig,
    formValues: FormValues
  ): EnhancedPreviewData {
    const ageConfig = configManager.getAgeGroupConfig(ageGroupConfig.id) || ageGroupConfig;
    
    return {
      ageGroup: ageConfig,
      formValues,
      characteristics: {
        fontSize: ageConfig.fontSize,
        layout: ageConfig.layout,
        audio: ageConfig.audio,
        estimatedDuration: '3-5 хвилин',
        complexity: ageConfig.complexity
      },
      slides: [],
      totalSlides: 0,
      metadata: {
        generatedAt: new Date().toISOString(),
        generationTime: 100,
        aiProvider: 'Mock',
        version: '3.0.0'
      }
    };
  }
}

// === SOLID: SRP - Singleton instance ===
export const previewGenerationService = new PreviewGenerationService(
          process.env.NEXT_PUBLIC_GEMINI_API_KEY
); 