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
        changes.push(`➕ Додано ${newImages - oldImages} нових зображень`);
      } else if (newImages < oldImages) {
        changes.push(`➖ Видалено ${oldImages - newImages} зображень`);
      } else if (newImages > 0) {
        changes.push(`🔄 Оновлено ${newImages} зображень`);
      }
      
      // Analyze text content
      const oldTextLength = oldHTML.replace(/<[^>]*>/g, '').trim().length;
      const newTextLength = newSlideHTML.replace(/<[^>]*>/g, '').trim().length;
      
      if (newTextLength > oldTextLength * 1.2) {
        changes.push(`📝 Значно розширено текстовий контент`);
      } else if (newTextLength < oldTextLength * 0.8) {
        changes.push(`✂️ Скорочено текстовий контент`);
      } else if (Math.abs(newTextLength - oldTextLength) > 50) {
        changes.push(`📝 Оновлено текстовий контент`);
      }
      
      // Analyze interactive elements
      const oldButtons = (oldHTML.match(/<button[^>]*>/g) || []).length;
      const newButtons = (newSlideHTML.match(/<button[^>]*>/g) || []).length;
      
      if (newButtons > oldButtons) {
        changes.push(`🎮 Додано ${newButtons - oldButtons} інтерактивних кнопок`);
      }
      
      // Analyze animations
      const hasNewAnimations = newSlideHTML.includes('animation') || newSlideHTML.includes('transition');
      const hadOldAnimations = oldHTML.includes('animation') || oldHTML.includes('transition');
      
      if (hasNewAnimations && !hadOldAnimations) {
        changes.push(`✨ Додано анімації та плавні переходи`);
      }
      
      // If no specific changes detected, add general changes
      if (changes.length === 0) {
        changes.push(`🔄 Повністю оновлено контент слайду`);
        changes.push(`📋 Застосовано інструкцію: "${instruction}"`);
      }
      
    } catch (error) {
      console.warn('Error analyzing slide changes:', error);
      changes.push(`🔄 Оновлено слайд згідно з інструкцією`);
    }
    
    return changes;
  }

  extractSlideDescriptions(planningResult: string): SlideDescription[] {
    const slideDescriptions: SlideDescription[] = [];
    
    try {
      const slidePatterns = [
        /###\s*Слайд\s+(\d+):\s*([^\n]+)[^#]*?(?=###\s*Слайд\s+|\s*##|\s*$)/gi,
        /##\s*Слайд\s+(\d+)[^#]*?(?=##\s*Слайд\s+|\s*$)/gi,
        /\*\*Слайд\s+(\d+)[^*]*?(?=\*\*Слайд\s+|\s*$)/gi,
        /(\d+)\.\s*[^0-9]*?(?=\d+\.\s*|\s*$)/gi
      ];

      for (const pattern of slidePatterns) {
        const matches = [...planningResult.matchAll(pattern)];
        
        if (matches.length > 0) {
          for (const match of matches) {
            const slideNumber = parseInt(match[1]);
            if (slideNumber && !slideDescriptions.find(s => s.slideNumber === slideNumber)) {
              let description = match[0].trim();
              let title = match[2]?.trim() || `Слайд ${slideNumber}`;
              
              description = description
                .replace(/^###\s*Слайд\s+\d+:\s*[^\n]+/i, '')
                .replace(/^##\s*Слайд\s+\d+[:\s]*/i, '')
                .replace(/^\*\*Слайд\s+\d+[:\s]*/i, '')
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
    
    if (slideNumber === 1 || titleLower.includes('вітання') || titleLower.includes('вступ')) {
      return 'welcome';
    }
    
    if (titleLower.includes('завдання') || titleLower.includes('гра') || descLower.includes('активність')) {
      return 'activity';
    }
    
    if (titleLower.includes('підсумок') || titleLower.includes('висновок')) {
      return 'summary';
    }
    
    return 'content';
  }

  private createDefaultSlideStructure(planningResult: string): SlideDescription[] {
    const firstLines = planningResult.split('\n').slice(0, 5).join(' ').substring(0, 300);
    
    return [
      {
        slideNumber: 1,
        title: 'Вітання та знайомство з темою',
        description: `Вступний слайд для знайомства з темою уроку. ${firstLines}`,
        type: 'welcome'
      },
      {
        slideNumber: 2,
        title: 'Основний матеріал',
        description: `Подача основного навчального матеріалу. ${firstLines}`,
        type: 'content'
      },
      {
        slideNumber: 3,
        title: 'Практичне завдання',
        description: `Інтерактивне завдання для закріплення знань. ${firstLines}`,
        type: 'activity'
      },
      {
        slideNumber: 4,
        title: 'Підсумок уроку',
        description: `Узагальнення вивченого матеріалу та висновки. ${firstLines}`,
        type: 'summary'
      }
    ];
  }
} 