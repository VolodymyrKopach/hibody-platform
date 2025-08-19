import { GeminiContentService } from '@/services/content/GeminiContentService';
import { SimpleSlide, SlideDescription } from '@/types/chat';
import { slideTemplateService } from '@/services/generation/SlideTemplateService';
import { logger } from '@/utils/logger';

export class SlideGenerationService {
  private contentService: GeminiContentService;

  constructor() {
    this.contentService = new GeminiContentService();
  }

  /**
   * Generate slides from lesson plan content
   */
  async generateSlidesFromPlan(
    planText: string,
    lessonTopic: string,
    lessonAge: string,
    options: { sessionId?: string; useTemporaryStorage?: boolean } = {}
  ): Promise<SimpleSlide[]> {
    logger.chat.info('Generating slides from lesson plan', {
      method: 'generateSlidesFromPlan',
      topic: lessonTopic,
      ageGroup: lessonAge
    });

    try {
      // Extract slide templates from the plan
      const slideTemplates = slideTemplateService.extractSlidesFromPlan(planText, {
        ageGroup: lessonAge,
        language: 'en'
      });

      logger.chat.debug(`Extracted ${slideTemplates.length} slide templates from plan`);

      // Generate HTML content for each slide
      const slides: SimpleSlide[] = [];
      
      for (let i = 0; i < slideTemplates.length; i++) {
        const template = slideTemplates[i];
        
        try {
          logger.chat.debug(`Generating HTML for slide ${i + 1}: ${template.title}`);
          
          // Generate HTML content using AI with temporary storage support
          const htmlContent = await this.contentService.generateSlideContent(
            template.content || template.description,
            lessonTopic,
            lessonAge,
            { 
              sessionId: options.sessionId || `plan_${Date.now()}`,
              useTemporaryStorage: options.useTemporaryStorage !== false
            }
          );

          const slide: SimpleSlide = {
            id: `slide_${Date.now()}_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
            title: template.title,
            content: template.content || template.description,
            htmlContent,
            status: 'completed',
            estimatedDuration: template.estimatedDuration,
            interactive: template.interactive,
            visualElements: template.visualElements,
            description: template.description,
            updatedAt: new Date()
          };

          slides.push(slide);
          logger.chat.debug(`Slide ${i + 1} generated successfully`);

        } catch (error) {
          logger.chat.error(`Failed to generate slide ${i + 1}`, error as Error);
          
          // Create fallback slide
          const fallbackSlide: SimpleSlide = {
            id: `slide_fallback_${Date.now()}_${i + 1}`,
            title: template.title || `Slide ${i + 1}`,
            content: template.description || 'Content will be generated',
            htmlContent: this.generateFallbackHTML(template.title, template.description),
            status: 'draft',
            estimatedDuration: template.estimatedDuration || 60,
            interactive: template.interactive || false,
            visualElements: template.visualElements || ['text'],
            description: template.description,
            updatedAt: new Date()
          };
          
          slides.push(fallbackSlide);
        }
      }

      logger.chat.info(`Successfully generated ${slides.length} slides from plan`);
      return slides;

    } catch (error) {
      logger.chat.error('Failed to generate slides from plan', error as Error);
      throw error;
    }
  }

  /**
   * Generate adaptive slides from content analysis
   */
  async generateAdaptiveSlides(
    content: string,
    slideCount: number,
    lessonTopic: string,
    lessonAge: string,
    options: { sessionId?: string; useTemporaryStorage?: boolean } = {}
  ): Promise<SimpleSlide[]> {
    logger.chat.info('Generating adaptive slides from content', {
      method: 'generateAdaptiveSlides',
      slideCount,
      topic: lessonTopic,
      ageGroup: lessonAge
    });

    try {
      // Use the adaptive slide generation
      const slideTemplates = slideTemplateService.generateAdaptiveSlides(content, slideCount, {
        ageGroup: lessonAge,
        language: 'en'
      });

      const slides: SimpleSlide[] = [];
      
      for (let i = 0; i < slideTemplates.length; i++) {
        const template = slideTemplates[i];
        
        try {
          const htmlContent = await this.contentService.generateSlideContent(
            template.content || template.description,
            lessonTopic,
            lessonAge,
            { 
              sessionId: options.sessionId || `adaptive_${Date.now()}`,
              useTemporaryStorage: options.useTemporaryStorage !== false
            }
          );

          const slide: SimpleSlide = {
            id: `adaptive_slide_${Date.now()}_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
            title: template.title,
            content: template.content || template.description,
            htmlContent,
            status: 'completed',
            estimatedDuration: template.estimatedDuration,
            interactive: template.interactive,
            visualElements: template.visualElements,
            description: template.description,
            updatedAt: new Date()
          };

          slides.push(slide);

        } catch (error) {
          logger.chat.error(`Failed to generate adaptive slide ${i + 1}`, error as Error);
          
          const fallbackSlide: SimpleSlide = {
            id: `adaptive_fallback_${Date.now()}_${i + 1}`,
            title: template.title || `Slide ${i + 1}`,
            content: template.description || 'Content will be generated',
            htmlContent: this.generateFallbackHTML(template.title, template.description),
            status: 'draft',
            estimatedDuration: template.estimatedDuration || 60,
            interactive: template.interactive || false,
            visualElements: template.visualElements || ['text'],
            description: template.description,
            updatedAt: new Date()
          };
          
          slides.push(fallbackSlide);
        }
      }

      logger.chat.info(`Successfully generated ${slides.length} adaptive slides`);
      return slides;

    } catch (error) {
      logger.chat.error('Failed to generate adaptive slides', error as Error);
      throw error;
    }
  }

  /**
   * Extract slide descriptions from lesson plan (legacy support)
   */
  extractSlideDescriptionsFromPlan(planText: string): SlideDescription[] {
    const slideTemplates = slideTemplateService.extractSlidesFromPlan(planText);
    
    return slideTemplates.map((template, index) => ({
      slideNumber: index + 1,
      title: template.title,
      description: template.content || template.description,
      type: this.inferSlideType(template, index, slideTemplates.length)
    }));
  }

  /**
   * Generate single slide from description
   */
  async generateSlide(
    description: string,
    title: string,
    lessonTopic: string,
    lessonAge: string
  ): Promise<SimpleSlide> {
    logger.chat.info('Generating single slide', {
      method: 'generateSlide',
      title,
      topic: lessonTopic
    });

    try {
      const htmlContent = await this.contentService.generateSlideContent(
        description,
        lessonTopic,
        lessonAge,
        { 
          sessionId: `single_${Date.now()}`,
          useTemporaryStorage: true 
        }
      );

      // Analyze content to determine properties
      const interactive = this.detectInteractiveContent(description);
      const visualElements = this.analyzeVisualElements(description);
      const estimatedDuration = this.estimateSlideDuration(description, lessonAge);

      const slide: SimpleSlide = {
        id: `single_slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title || 'Generated Slide',
        content: description,
        htmlContent,
        status: 'completed',
        estimatedDuration,
        interactive,
        visualElements,
        description,
        updatedAt: new Date()
      };

      logger.chat.info('Single slide generated successfully');
      return slide;

    } catch (error) {
      logger.chat.error('Failed to generate single slide', error as Error);
      throw error;
    }
  }

  // === Private helper methods ===

  private generateFallbackHTML(title?: string, description?: string): string {
    return `
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 2.5rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          ${title || 'Slide Title'}
        </h1>
        <p style="font-size: 1.2rem; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          ${description || 'This slide content will be generated. Please try again or provide more specific instructions.'}
        </p>
        <div style="margin-top: 30px;">
          <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.3); margin: 0 auto; border-radius: 2px;"></div>
        </div>
      </div>
    `;
  }

  private inferSlideType(template: any, index: number, totalSlides: number): string {
    // Legacy compatibility - infer type based on position and content
    if (index === 0) return 'introduction';
    if (index === totalSlides - 1) return 'summary';
    if (template.interactive) return 'activity';
    return 'content';
  }

  private detectInteractiveContent(content: string): boolean {
    const interactiveKeywords = [
      'click', 'tap', 'drag', 'select', 'choose', 'answer', 'question',
      'activity', 'exercise', 'practice', 'try', 'experiment', 'play', 'interactive'
    ];
    
    const lowerContent = content.toLowerCase();
    return interactiveKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private analyzeVisualElements(content: string): string[] {
    const elements: string[] = ['text'];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('image') || lowerContent.includes('picture') || lowerContent.includes('photo')) {
      elements.push('image');
    }
    if (lowerContent.includes('video') || lowerContent.includes('animation')) {
      elements.push('video');
    }
    if (lowerContent.includes('chart') || lowerContent.includes('graph') || lowerContent.includes('diagram')) {
      elements.push('chart');
    }
    if (lowerContent.includes('button') || lowerContent.includes('click') || lowerContent.includes('interactive')) {
      elements.push('interactive');
    }
    if (lowerContent.includes('quiz') || lowerContent.includes('question') || lowerContent.includes('answer')) {
      elements.push('quiz');
    }
    
    return elements;
  }

  private estimateSlideDuration(content: string, ageGroup: string): number {
    const wordCount = content.split(' ').length;
    const readingSpeed = this.getReadingSpeedForAge(ageGroup);
    
    // Base time for reading + additional time for interaction
    const baseTime = Math.ceil((wordCount / readingSpeed) * 60); // Convert to seconds
    const interactionTime = this.detectInteractiveContent(content) ? 30 : 0;
    
    return Math.max(30, baseTime + interactionTime);
  }

  private getReadingSpeedForAge(ageGroup: string): number {
    // Words per minute based on age group
    switch (ageGroup) {
      case '2-3': return 10; // Very slow, with adult help
      case '4-6': return 25; // Beginning readers
      case '7-8': return 60; // Elementary level
      case '9-10': return 90; // More fluent
      default: return 50;
    }
  }
} 