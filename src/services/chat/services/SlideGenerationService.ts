import { GeminiContentService } from '@/services/content/GeminiContentService';
import { type SimpleSlide, type SlideDescription, type BulkSlideGenerationResult } from '@/types/chat';
import { type ProcessedSlideData, processSlideWithImages } from '@/utils/slideImageProcessor';
import { ISlideGenerationService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Slide Generation ===
export class SlideGenerationService implements ISlideGenerationService {
  constructor(private contentService: GeminiContentService) {}

  async generateSlide(description: string, topic: string, age: string): Promise<SimpleSlide> {
    const slideHTML = await this.contentService.generateSlideContent(description, topic, age);
    
    // Process images
    const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(slideHTML);
    const finalSlideHTML = imageProcessingResult.htmlWithImages;

    return {
      id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.extractTitleFromDescription(description),
      content: description,
      htmlContent: finalSlideHTML,
      type: 'content',
      status: 'completed'
    };
  }

  async generateAllSlides(
    descriptions: SlideDescription[], 
    topic: string, 
    age: string
  ): Promise<BulkSlideGenerationResult> {
    const startTime = Date.now();
    const slides: SimpleSlide[] = [];
    const errors: string[] = [];

    for (let i = 0; i < descriptions.length; i++) {
      const desc = descriptions[i];
      try {
        const slide = await this.generateSlide(desc.description, topic, age);
        slide.title = desc.title;
        slide.type = this.mapSlideType(desc.type);
        slides.push(slide);

        // Rate limiting
        if (i < descriptions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Slide ${desc.slideNumber} "${desc.title}": ${errorMessage}`);
        
        // Create fallback slide
        const fallbackSlide = this.createFallbackSlide(desc);
        slides.push(fallbackSlide);
      }
    }

    return {
      totalSlides: descriptions.length,
      completedSlides: slides.filter(s => s.status === 'completed').length,
      failedSlides: errors.length,
      slides,
      errors,
      generationTime: Date.now() - startTime
    };
  }

  private extractTitleFromDescription(description: string): string {
    const lines = description.split('\n').filter(line => line.trim());
    return lines[0]?.substring(0, 50) || 'Новий слайд';
  }

  private mapSlideType(type: 'welcome' | 'content' | 'activity' | 'summary'): 'title' | 'content' | 'interactive' | 'summary' {
    const mapping = {
      'welcome': 'title' as const,
      'activity': 'interactive' as const,
      'summary': 'summary' as const,
      'content': 'content' as const
    };
    return mapping[type] || 'content';
  }

  private createFallbackSlide(desc: SlideDescription): SimpleSlide {
    return {
      id: `slide_${Date.now()}_${desc.slideNumber}_fallback`,
      title: desc.title,
      content: desc.description,
      htmlContent: `<div style="text-align: center; padding: 40px;">
        <h2>${desc.title}</h2>
        <p>Цей слайд буде згенеровано пізніше.</p>
        <p><small>Опис: ${desc.description.substring(0, 100)}...</small></p>
      </div>`,
      type: this.mapSlideType(desc.type),
      status: 'draft'
    };
  }
} 