/**
 * === SOLID: SRP - Single Responsibility ===
 * Content-driven slide generation based on lesson plans
 */

export interface SlideTemplate {
  title: string;
  description: string;
  content?: string;
  estimatedDuration?: number;
  interactive?: boolean;
  visualElements?: string[];
}

export interface SlideGenerationOptions {
  language?: 'en' | 'uk';
  ageGroup?: string;
  duration?: number;
  interactiveLevel?: 'low' | 'medium' | 'high';
}

/**
 * === SOLID: SRP - Content-driven slide template management ===
 * Generates slides based on lesson plans and content structure
 */
export class SlideTemplateService {
  
  /**
   * Extract slide templates from a lesson plan text
   */
  extractSlidesFromPlan(planText: string, options: SlideGenerationOptions = {}): SlideTemplate[] {
    const slides: SlideTemplate[] = [];
    
    // Extract slides based on plan structure (### Slide X: or ## Slide X:)
    const slideRegex = /###?\s*(?:Slide|Слайд)\s*(\d+):\s*([^\n]+)(?:\n([\s\S]*?)(?=###?\s*(?:Slide|Слайд)\s*\d+:|$))?/gi;
    
    let match;
    while ((match = slideRegex.exec(planText)) !== null) {
      const slideNumber = parseInt(match[1]);
      const title = match[2].trim();
      const content = match[3] ? this.cleanSlideContent(match[3]) : '';
      
      slides.push({
        title: this.cleanTitle(title),
        description: this.extractDescription(content),
        content: content.trim(),
        estimatedDuration: this.estimateDuration(content, options.ageGroup),
        interactive: this.detectInteractiveElements(content),
        visualElements: this.extractVisualElements(content)
      });
    }
    
    return slides.length > 0 ? slides : this.generateFallbackSlides(options);
  }

  /**
   * Generate slide templates from a structured lesson outline
   */
  generateSlidesFromOutline(
    outline: {
      title: string;
      objectives: string[];
      topics: string[];
      activities: string[];
      summary: string;
    },
    slideCount: number,
    options: SlideGenerationOptions = {}
  ): SlideTemplate[] {
    const slides: SlideTemplate[] = [];
    
    // Introduction slide
    slides.push({
      title: outline.title,
      description: `Introduction to ${outline.title.toLowerCase()}`,
      content: `Welcome! Today we will learn about: ${outline.objectives.join(', ')}`,
      estimatedDuration: this.estimateDuration('introduction', options.ageGroup),
      interactive: false,
      visualElements: ['title', 'objectives']
    });

    // Topic slides
    const topicsPerSlide = Math.max(1, Math.floor((slideCount - 2) / outline.topics.length));
    outline.topics.forEach((topic, index) => {
      slides.push({
        title: topic,
        description: `Learning about ${topic.toLowerCase()}`,
        content: `Let's explore ${topic}. ${outline.activities[index] || 'Interactive activity will be included.'}`,
        estimatedDuration: this.estimateDuration(topic, options.ageGroup),
        interactive: outline.activities[index] ? true : false,
        visualElements: this.suggestVisualElements(topic)
      });
    });

    // Summary slide
    if (slideCount > outline.topics.length + 1) {
      slides.push({
        title: 'Summary',
        description: 'Lesson summary and key takeaways',
        content: outline.summary || 'Let\'s review what we learned today.',
        estimatedDuration: this.estimateDuration('summary', options.ageGroup),
        interactive: true,
        visualElements: ['recap', 'key-points']
      });
    }

    return slides.slice(0, slideCount);
  }

  /**
   * Generate adaptive slides based on content analysis
   */
  generateAdaptiveSlides(
    content: string,
    targetSlideCount: number,
    options: SlideGenerationOptions = {}
  ): SlideTemplate[] {
    // Analyze content structure
    const sections = this.analyzeContentStructure(content);
    const slides: SlideTemplate[] = [];

    // Distribute content across slides
    const contentPerSlide = Math.max(1, Math.floor(sections.length / targetSlideCount));
    
    for (let i = 0; i < targetSlideCount; i++) {
      const startIndex = i * contentPerSlide;
      const endIndex = Math.min(startIndex + contentPerSlide, sections.length);
      const slideContent = sections.slice(startIndex, endIndex);
      
      if (slideContent.length > 0) {
        slides.push({
          title: this.generateSlideTitle(slideContent, i + 1),
          description: this.generateSlideDescription(slideContent),
          content: slideContent.join('\n\n'),
          estimatedDuration: this.estimateDuration(slideContent.join(' '), options.ageGroup),
          interactive: this.shouldBeInteractive(slideContent, i, targetSlideCount),
          visualElements: this.extractVisualElements(slideContent.join(' '))
        });
      }
    }

    return slides;
  }

  // === Private helper methods ===

  private cleanSlideContent(content: string): string {
    return content
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown
      .replace(/^\s*-\s+/gm, '• ')      // Convert dashes to bullets
      .trim();
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/[\(\)]/g, '')           // Remove parentheses
      .replace(/\s+/g, ' ')             // Normalize whitespace
      .trim();
  }

  private extractDescription(content: string): string {
    // Extract first meaningful sentence as description
    const firstSentence = content.split('.')[0];
    return firstSentence.length > 10 && firstSentence.length < 100 
      ? firstSentence + '.'
      : 'Slide content';
  }

  private estimateDuration(content: string, ageGroup?: string): number {
    const wordCount = content.split(' ').length;
    const baseWordsPerMinute = this.getReadingSpeed(ageGroup);
    return Math.max(30, Math.ceil((wordCount / baseWordsPerMinute) * 60)); // seconds
  }

  private getReadingSpeed(ageGroup?: string): number {
    // Words per minute based on age
    switch (ageGroup) {
      case '2-3': return 20;
      case '4-6': return 40;
      case '7-8': return 80;
      case '9-10': return 120;
      default: return 60;
    }
  }

  private detectInteractiveElements(content: string): boolean {
    const interactiveKeywords = [
      'click', 'tap', 'drag', 'select', 'choose', 'answer', 'question',
      'activity', 'exercise', 'practice', 'try', 'experiment', 'play'
    ];
    
    const lowerContent = content.toLowerCase();
    return interactiveKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private extractVisualElements(content: string): string[] {
    const elements: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('image') || lowerContent.includes('picture')) {
      elements.push('image');
    }
    if (lowerContent.includes('chart') || lowerContent.includes('graph')) {
      elements.push('chart');
    }
    if (lowerContent.includes('animation') || lowerContent.includes('movement')) {
      elements.push('animation');
    }
    if (lowerContent.includes('button') || lowerContent.includes('click')) {
      elements.push('interactive-button');
    }
    
    return elements.length > 0 ? elements : ['text', 'basic-layout'];
  }

  private analyzeContentStructure(content: string): string[] {
    // Split content into logical sections
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const sections: string[] = [];
    
    let currentSection = '';
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 50) {
        // Short paragraph, likely a header or transition
        if (currentSection) {
          sections.push(currentSection.trim());
          currentSection = '';
        }
        currentSection = paragraph + '\n\n';
      } else {
        currentSection += paragraph + '\n\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection.trim());
    }
    
    return sections;
  }

  private generateSlideTitle(content: string[], slideNumber: number): string {
    // Extract meaningful title from content
    const firstLine = content[0].split('\n')[0];
    if (firstLine.length < 60 && firstLine.length > 5) {
      return firstLine.replace(/[#*]/g, '').trim();
    }
    return `Slide ${slideNumber}`;
  }

  private generateSlideDescription(content: string[]): string {
    const text = content.join(' ').substring(0, 150);
    return text.split('.')[0] + (text.includes('.') ? '.' : '...');
  }

  private shouldBeInteractive(content: string[], slideIndex: number, totalSlides: number): boolean {
    // Make every 2nd or 3rd slide interactive, depending on content
    const contentText = content.join(' ').toLowerCase();
    const hasInteractiveContent = this.detectInteractiveElements(contentText);
    const isMiddleSlide = slideIndex > 0 && slideIndex < totalSlides - 1;
    
    return hasInteractiveContent || (isMiddleSlide && slideIndex % 2 === 0);
  }

  private suggestVisualElements(topic: string): string[] {
    const topicLower = topic.toLowerCase();
    const elements: string[] = ['text'];
    
    if (topicLower.includes('math') || topicLower.includes('number')) {
      elements.push('numbers', 'calculation');
    }
    if (topicLower.includes('science') || topicLower.includes('nature')) {
      elements.push('diagram', 'experiment');
    }
    if (topicLower.includes('history') || topicLower.includes('story')) {
      elements.push('timeline', 'image');
    }
    if (topicLower.includes('language') || topicLower.includes('reading')) {
      elements.push('text-emphasis', 'pronunciation');
    }
    
    return elements;
  }

  private generateFallbackSlides(options: SlideGenerationOptions): SlideTemplate[] {
    return [
      {
        title: 'Introduction',
        description: 'Welcome to the lesson',
        content: 'Welcome to today\'s lesson! We\'re going to learn something new and exciting.',
        estimatedDuration: 60,
        interactive: false,
        visualElements: ['title', 'welcome']
      },
      {
        title: 'Main Content',
        description: 'Core lesson material',
        content: 'Here we will explore the main topics and concepts for today.',
        estimatedDuration: 120,
        interactive: true,
        visualElements: ['content', 'interactive']
      },
      {
        title: 'Summary',
        description: 'Lesson recap',
        content: 'Let\'s review what we\'ve learned and think about next steps.',
        estimatedDuration: 60,
        interactive: true,
        visualElements: ['recap', 'reflection']
      }
    ];
  }
}

// === SOLID: SRP - Singleton instance ===
export const slideTemplateService = new SlideTemplateService(); 