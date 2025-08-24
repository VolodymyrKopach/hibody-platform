import { LessonPlanJSON, ParsedLessonPlan, LessonMetadata, ParsedSlide } from '@/types/templates';

export class LessonPlanJSONProcessor {
  /**
   * Process JSON lesson plan and convert to legacy format for backward compatibility
   */
  static processJSON(jsonString: string): ParsedLessonPlan {
    try {
      const lessonPlan: LessonPlanJSON = JSON.parse(jsonString);
      
      // Validate required fields
      if (!lessonPlan.metadata || !lessonPlan.slides) {
        throw new Error('Invalid lesson plan JSON structure');
      }

      // Convert to legacy format
      const metadata: LessonMetadata = {
        targetAudience: lessonPlan.metadata.targetAudience,
        duration: lessonPlan.metadata.duration,
        goal: lessonPlan.metadata.goal
      };

      const slides: ParsedSlide[] = lessonPlan.slides.map(slide => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        type: slide.type as 'Introduction' | 'Educational' | 'Activity' | 'Summary',
        goal: slide.goal,
        content: slide.content,
        // Preserve structure for new components
        structure: slide.structure
      } as any));

      const objectives = lessonPlan.objectives?.map(obj => obj.text) || [];
      const gameElements = lessonPlan.gameElements?.map(game => game.description) || [];
      const materials = lessonPlan.materials?.map(material => material.name) || [];
      const recommendations = lessonPlan.recommendations?.map(rec => rec.text) || [];

      return {
        title: lessonPlan.metadata.title,
        metadata,
        objectives,
        slides,
        gameElements,
        materials,
        recommendations,
        rawMarkdown: jsonString // Store original JSON as "markdown" for fallback
      };
    } catch (error) {
      console.error('Error processing lesson plan JSON:', error);
      throw new Error(`Failed to process lesson plan JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse JSON lesson plan directly (new format)
   */
  static parseJSON(jsonString: string): LessonPlanJSON {
    try {
      const lessonPlan: LessonPlanJSON = JSON.parse(jsonString);
      
      // Validate required fields
      if (!lessonPlan.metadata) {
        throw new Error('Missing metadata in lesson plan JSON');
      }
      
      if (!lessonPlan.slides || !Array.isArray(lessonPlan.slides)) {
        throw new Error('Missing or invalid slides in lesson plan JSON');
      }

      // Validate slide structure
      lessonPlan.slides.forEach((slide, index) => {
        if (!slide.slideNumber || !slide.title || !slide.type || !slide.goal || !slide.content) {
          throw new Error(`Invalid slide structure at index ${index}`);
        }
      });

      // Ensure arrays exist
      lessonPlan.objectives = lessonPlan.objectives || [];
      lessonPlan.gameElements = lessonPlan.gameElements || [];
      lessonPlan.materials = lessonPlan.materials || [];
      lessonPlan.recommendations = lessonPlan.recommendations || [];

      return lessonPlan;
    } catch (error) {
      console.error('Error parsing lesson plan JSON:', error);
      throw new Error(`Failed to parse lesson plan JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate JSON structure without parsing
   */
  static validateJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      return !!(parsed.metadata && parsed.slides && Array.isArray(parsed.slides));
    } catch {
      return false;
    }
  }

  /**
   * Get slide type configuration for styling (same as LessonPlanParser)
   */
  static getSlideTypeConfig(type: string) {
    const configs = {
      'Introduction': {
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
        icon: '👋',
        label: 'Introduction'
      },
      'Educational': {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        icon: '📚',
        label: 'Educational'
      },
      'Activity': {
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
        icon: '🎯',
        label: 'Activity'
      },
      'Summary': {
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
        icon: '✅',
        label: 'Summary'
      }
    };

    return configs[type as keyof typeof configs] || configs['Educational'];
  }
}
