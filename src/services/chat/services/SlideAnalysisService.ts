import { type SimpleSlide, type SlideDescription } from '@/types/chat';
import { ISlideAnalysisService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Slide Analysis ===
export class SlideAnalysisService implements ISlideAnalysisService {
  analyzeSlideChanges(oldSlide: SimpleSlide, newSlideHTML: string, instruction: string): string[] {
    const changes: string[] = [];
    
    try {
      const oldHTML = oldSlide.htmlContent || '';
      
      // Analyze images
      const oldImages = (oldHTML.match(/<img[^>]*>/g) || []).length;
      const newImages = (newSlideHTML.match(/<img[^>]*>/g) || []).length;
      
      if (newImages > oldImages) {
        changes.push(`➕ Added ${newImages - oldImages} new images`); // Translated
      } else if (newImages < oldImages) {
        changes.push(`➖ Removed ${oldImages - newImages} images`); // Translated
      } else if (newImages > 0) {
        changes.push(`🔄 Updated ${newImages} images`); // Translated
      }
      
      // Analyze text content
      const oldTextLength = oldHTML.replace(/<[^>]*>/g, '').trim().length;
      const newTextLength = newSlideHTML.replace(/<[^>]*>/g, '').trim().length;
      
      if (newTextLength > oldTextLength * 1.2) {
        changes.push(`📝 Significantly expanded text content`); // Translated
      } else if (newTextLength < oldTextLength * 0.8) {
        changes.push(`✂️ Shortened text content`); // Translated
      } else if (Math.abs(newTextLength - oldTextLength) > 50) {
        changes.push(`📝 Updated text content`); // Translated
      }
      
      // Analyze interactive elements
      const oldButtons = (oldHTML.match(/<button[^>]*>/g) || []).length;
      const newButtons = (newSlideHTML.match(/<button[^>]*>/g) || []).length;
      
      if (newButtons > oldButtons) {
        changes.push(`🎮 Added ${newButtons - oldButtons} interactive buttons`); // Translated
      }
      
      // Analyze animations
      const hasNewAnimations = newSlideHTML.includes('animation') || newSlideHTML.includes('transition');
      const hadOldAnimations = oldHTML.includes('animation') || oldHTML.includes('transition');
      
      if (hasNewAnimations && !hadOldAnimations) {
        changes.push(`✨ Added animations and smooth transitions`); // Translated
      }
      
      // If no specific changes detected, add general changes
      if (changes.length === 0) {
        changes.push(`🔄 Fully updated slide content`); // Translated
        changes.push(`📋 Applied instruction: "${instruction}"`); // Translated
      }
      
    } catch (error) {
      console.warn('Error analyzing slide changes:', error);
      changes.push(`🔄 Updated slide according to instruction`); // Translated
    }
    
    return changes;
  }

  extractSlideDescriptions(planningResult: string): SlideDescription[] {
    const slideDescriptions: SlideDescription[] = [];
    
    try {
      const slidePatterns = [
        /###\s*Slide\s+(\d+):\s*([^\n]+)[^#]*?(?=###\s*Slide\s+|\s*##|\s*$)/gi,
        /##\s*Slide\s+(\d+)[^#]*?(?=##\s*Slide\s+|\s*$)/gi,
        /\*\*Slide\s+(\d+)[^*]*?(?=\*\*Slide\s+|\s*$)/gi,
        /(\d+)\.\s*[^0-9]*?(?=\d+\.\s*|\s*$)/gi
      ];

      for (const pattern of slidePatterns) {
        const matches = [...planningResult.matchAll(pattern)];
        
        if (matches.length > 0) {
          for (const match of matches) {
            const slideNumber = parseInt(match[1]);
            if (slideNumber && !slideDescriptions.find(s => s.slideNumber === slideNumber)) {
              let description = match[0].trim();
              let title = match[2]?.trim() || `Slide ${slideNumber}`; // Translated
              
              description = description
                .replace(/^###\s*Slide\s+\d+:\s*[^\n]+/i, '')
                .replace(/^##\s*Slide\s+\d+[:\s]*/i, '')
                .replace(/^\*\*Slide\s+\d+[:\s]*/i, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

              if (description.length > 20) {
                slideDescriptions.push({
                  slideNumber,
                  title,
                  description,
                  type: this.determineSlideType(title, description, slideNumber)
                });
              }
            }
          }
          
          if (slideDescriptions.length > 0) break;
        }
      }

      if (slideDescriptions.length === 0) {
        return this.createDefaultSlideStructure(planningResult);
      }

      return slideDescriptions.sort((a, b) => a.slideNumber - b.slideNumber);
      
    } catch (error) {
      console.error('Error extracting slide descriptions:', error);
      return this.createDefaultSlideStructure(planningResult);
    }
  }

  determineSlideType(title: string, description: string, slideNumber: number): 'welcome' | 'content' | 'activity' | 'summary' {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    if (slideNumber === 1 || titleLower.includes('welcome') || titleLower.includes('introduction')) {
      return 'welcome';
    }
    
    if (titleLower.includes('task') || titleLower.includes('game') || descLower.includes('activity')) {
      return 'activity';
    }
    
    if (titleLower.includes('summary') || titleLower.includes('conclusion')) {
      return 'summary';
    }
    
    return 'content';
  }

  private createDefaultSlideStructure(planningResult: string): SlideDescription[] {
    const firstLines = planningResult.split('\n').slice(0, 5).join(' ').substring(0, 300);
    
    return [
      {
        slideNumber: 1,
        title: 'Welcome and introduction to the topic',
        description: `Introductory slide for familiarization with the lesson topic. ${firstLines}`, // Translated
        type: 'welcome'
      },
      {
        slideNumber: 2,
        title: 'Main material',
        description: `Presentation of the main educational material. ${firstLines}`, // Translated
        type: 'content'
      },
      {
        slideNumber: 3,
        title: 'Practical task',
        description: `Interactive task for knowledge reinforcement. ${firstLines}`, // Translated
        type: 'activity'
      },
      {
        slideNumber: 4,
        title: 'Lesson summary',
        description: `Generalization of learned material and conclusions. ${firstLines}`, // Translated
        type: 'summary'
      }
    ];
  }
} 