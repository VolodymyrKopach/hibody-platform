import { ParsedLessonPlan, LessonMetadata, ParsedSlide, SlideType } from '@/types/templates';

/**
 * Parser for converting Markdown lesson plans to structured data
 */
export class LessonPlanParser {
  
  /**
   * Parse a markdown lesson plan into structured data
   */
  static parse(markdown: string): ParsedLessonPlan {
    try {
      const lines = markdown.split('\n');
      
      return {
        title: this.extractTitle(lines),
        metadata: this.extractMetadata(lines),
        objectives: this.extractObjectives(lines),
        slides: this.extractSlides(lines),
        gameElements: this.extractGameElements(lines),
        materials: this.extractMaterials(lines),
        recommendations: this.extractRecommendations(lines),
        rawMarkdown: markdown
      };
    } catch (error) {
      console.error('Error parsing lesson plan:', error);
      
      // Return fallback structure
      return {
        title: 'Lesson Plan',
        metadata: {
          targetAudience: 'Unknown',
          duration: '30-45 minutes',
          goal: 'Educational lesson'
        },
        objectives: [],
        slides: [],
        gameElements: [],
        materials: [],
        recommendations: [],
        rawMarkdown: markdown
      };
    }
  }

  /**
   * Extract lesson title from markdown
   */
  private static extractTitle(lines: string[]): string {
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return 'Lesson Plan';
  }

  /**
   * Extract metadata (target audience, duration, goal)
   */
  private static extractMetadata(lines: string[]): LessonMetadata {
    const metadata: LessonMetadata = {
      targetAudience: 'Unknown',
      duration: '30-45 minutes',
      goal: 'Educational lesson'
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('**Target Audience:**')) {
        metadata.targetAudience = line.replace('**Target Audience:**', '').trim();
      } else if (line.startsWith('**Duration:**')) {
        metadata.duration = line.replace('**Duration:**', '').trim();
      } else if (line.startsWith('**Lesson Goal:**')) {
        metadata.goal = line.replace('**Lesson Goal:**', '').trim();
      }
    }

    return metadata;
  }

  /**
   * Extract learning objectives
   */
  private static extractObjectives(lines: string[]): string[] {
    const objectives: string[] = [];
    let inObjectivesSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '## 🎯 Learning Objectives') {
        inObjectivesSection = true;
        continue;
      }
      
      if (inObjectivesSection) {
        if (trimmed.startsWith('##')) {
          break; // End of objectives section
        }
        
        if (trimmed.startsWith('- ')) {
          objectives.push(trimmed.substring(2).trim());
        }
      }
    }

    return objectives;
  }

  /**
   * Extract slides information
   */
  private static extractSlides(lines: string[]): ParsedSlide[] {
    const slides: ParsedSlide[] = [];
    let currentSlide: Partial<ParsedSlide> | null = null;
    let inLessonStructure = false;
    let collectingContent = false;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '## 📋 Lesson Structure') {
        inLessonStructure = true;
        continue;
      }
      
      if (!inLessonStructure) continue;
      
      if (line.startsWith('##') && line !== '## 📋 Lesson Structure') {
        // End of lesson structure section
        if (currentSlide) {
          this.finalizeSlide(currentSlide, contentLines, slides);
        }
        break;
      }
      
      // Check for slide header
      const slideMatch = line.match(/^### Slide (\d+): (.+)$/);
      if (slideMatch) {
        // Finalize previous slide
        if (currentSlide) {
          this.finalizeSlide(currentSlide, contentLines, slides);
        }
        
        // Start new slide
        currentSlide = {
          slideNumber: parseInt(slideMatch[1]),
          title: slideMatch[2].trim()
        };
        contentLines = [];
        collectingContent = false;
        continue;
      }
      
      if (currentSlide) {
        if (line.startsWith('**Type:**')) {
          currentSlide.type = this.parseSlideType(line.replace('**Type:**', '').trim());
        } else if (line.startsWith('**Goal:**')) {
          currentSlide.goal = line.replace('**Goal:**', '').trim();
        } else if (line.startsWith('**Content:**')) {
          collectingContent = true;
          const content = line.replace('**Content:**', '').trim();
          if (content) {
            contentLines.push(content);
          }
        } else if (collectingContent && line && !line.startsWith('###')) {
          contentLines.push(line);
        }
      }
    }
    
    // Finalize last slide
    if (currentSlide) {
      this.finalizeSlide(currentSlide, contentLines, slides);
    }

    return slides;
  }

  /**
   * Finalize slide and add to slides array
   */
  private static finalizeSlide(
    currentSlide: Partial<ParsedSlide>, 
    contentLines: string[], 
    slides: ParsedSlide[]
  ): void {
    if (currentSlide.slideNumber && currentSlide.title) {
      slides.push({
        slideNumber: currentSlide.slideNumber,
        title: currentSlide.title,
        type: currentSlide.type || 'Educational',
        goal: currentSlide.goal || 'Educational content',
        content: contentLines.join(' ').trim()
      });
    }
  }

  /**
   * Parse slide type from string
   */
  private static parseSlideType(typeStr: string): SlideType {
    const normalized = typeStr.toLowerCase();
    
    if (normalized.includes('introduction')) return 'Introduction';
    if (normalized.includes('activity')) return 'Activity';
    if (normalized.includes('summary')) return 'Summary';
    
    return 'Educational';
  }

  /**
   * Extract game elements
   */
  private static extractGameElements(lines: string[]): string[] {
    return this.extractListSection(lines, '## 🎮 Game Elements');
  }

  /**
   * Extract required materials
   */
  private static extractMaterials(lines: string[]): string[] {
    return this.extractListSection(lines, '## 📚 Required Materials');
  }

  /**
   * Extract teacher recommendations
   */
  private static extractRecommendations(lines: string[]): string[] {
    return this.extractListSection(lines, '## 💡 Teacher Recommendations');
  }

  /**
   * Generic method to extract list items from a section
   */
  private static extractListSection(lines: string[], sectionHeader: string): string[] {
    const items: string[] = [];
    let inSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === sectionHeader) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        if (trimmed.startsWith('##')) {
          break; // End of section
        }
        
        if (trimmed.startsWith('- ')) {
          items.push(trimmed.substring(2).trim());
        }
      }
    }

    return items;
  }

  /**
   * Get slide type configuration for styling
   */
  static getSlideTypeConfig(type: SlideType) {
    const configs = {
      Introduction: {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        icon: '👋',
        label: 'Introduction'
      },
      Educational: {
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
        icon: '📚',
        label: 'Educational'
      },
      Activity: {
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
        icon: '🎯',
        label: 'Activity'
      },
      Summary: {
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
        icon: '📝',
        label: 'Summary'
      }
    };

    return configs[type] || configs.Educational;
  }
}
