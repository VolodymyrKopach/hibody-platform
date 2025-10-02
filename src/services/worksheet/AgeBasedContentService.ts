/**
 * Age-Based Content Service for Worksheets
 * 
 * Calculates appropriate content amount based on age and duration.
 * Younger children process content slower and need more visual support.
 * 
 * SOLID Principles:
 * - SRP: Only handles age-based content calculations
 * - OCP: Easy to extend with new age groups
 * - ISP: Focused interfaces for age configuration
 */

export interface AgeGroupConfig {
  ageRange: string;
  label: string;
  
  // Learning characteristics
  componentsPerMinute: number; // How fast they process content
  attentionSpanMinutes: number; // Sustained attention span
  
  // Content preferences
  preferredExerciseTypes: string[];
  avoidExerciseTypes: string[];
  
  // Visual requirements
  visualImportance: 'critical' | 'high' | 'medium' | 'low';
  requiresImages: boolean;
  
  // Text complexity
  maxTextLength: number; // Max characters per component
  instructionStyle: string;
  
  // Component size multiplier for pagination
  sizeMultiplier: number; // Younger = bigger components
}

export type Duration = 'quick' | 'standard' | 'extended';

export interface ContentAmountResult {
  targetCount: number;
  minCount: number;
  maxCount: number;
  explanation: string;
}

// === Age group configurations ===
const AGE_CONFIGURATIONS: Record<string, AgeGroupConfig> = {
  '3-5': {
    ageRange: '3-5',
    label: 'Preschool (3-5 years)',
    componentsPerMinute: 0.4, // Very slow - 2.5 minutes per component
    attentionSpanMinutes: 10,
    preferredExerciseTypes: ['match-pairs', 'true-false', 'image-placeholder'],
    avoidExerciseTypes: ['short-answer', 'word-bank'],
    visualImportance: 'critical',
    requiresImages: true,
    maxTextLength: 100,
    instructionStyle: 'Very simple, 1-2 words per instruction',
    sizeMultiplier: 1.5, // 50% larger components
  },
  
  '6-7': {
    ageRange: '6-7',
    label: 'Early Elementary (6-7 years)',
    componentsPerMinute: 0.6, // Slow - 1.7 minutes per component
    attentionSpanMinutes: 15,
    preferredExerciseTypes: ['fill-blank', 'match-pairs', 'true-false', 'multiple-choice'],
    avoidExerciseTypes: ['short-answer'],
    visualImportance: 'high',
    requiresImages: true,
    maxTextLength: 150,
    instructionStyle: 'Simple sentences, clear and direct',
    sizeMultiplier: 1.3, // 30% larger
  },
  
  '8-9': {
    ageRange: '8-9',
    label: 'Elementary (8-9 years)',
    componentsPerMinute: 0.8, // Medium - 1.25 minutes per component
    attentionSpanMinutes: 20,
    preferredExerciseTypes: ['fill-blank', 'multiple-choice', 'true-false', 'match-pairs', 'word-bank'],
    avoidExerciseTypes: [],
    visualImportance: 'high',
    requiresImages: false,
    maxTextLength: 250,
    instructionStyle: 'Clear sentences with some complexity',
    sizeMultiplier: 1.1, // 10% larger
  },
  
  '10-12': {
    ageRange: '10-12',
    label: 'Upper Elementary (10-12 years)',
    componentsPerMinute: 1.0, // Standard - 1 minute per component
    attentionSpanMinutes: 25,
    preferredExerciseTypes: ['fill-blank', 'multiple-choice', 'short-answer', 'word-bank', 'match-pairs'],
    avoidExerciseTypes: [],
    visualImportance: 'medium',
    requiresImages: false,
    maxTextLength: 400,
    instructionStyle: 'Standard instructions with detail',
    sizeMultiplier: 1.0, // Normal size
  },
  
  '13-15': {
    ageRange: '13-15',
    label: 'Middle School (13-15 years)',
    componentsPerMinute: 1.2, // Fast - 0.83 minutes per component
    attentionSpanMinutes: 30,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank', 'word-bank'],
    avoidExerciseTypes: ['match-pairs'],
    visualImportance: 'medium',
    requiresImages: false,
    maxTextLength: 600,
    instructionStyle: 'Detailed instructions, academic language',
    sizeMultiplier: 0.9, // 10% smaller
  },
  
  '16-18': {
    ageRange: '16-18',
    label: 'High School (16-18 years)',
    componentsPerMinute: 1.5, // Very fast - 0.67 minutes per component
    attentionSpanMinutes: 40,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank'],
    avoidExerciseTypes: ['match-pairs', 'true-false'],
    visualImportance: 'low',
    requiresImages: false,
    maxTextLength: 800,
    instructionStyle: 'Academic, detailed, complex',
    sizeMultiplier: 0.8, // 20% smaller
  },
  
  '19-25': {
    ageRange: '19-25',
    label: 'Young Adults (19-25 years)',
    componentsPerMinute: 1.8, // Fast - 0.56 minutes per component
    attentionSpanMinutes: 45,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank', 'word-bank'],
    avoidExerciseTypes: ['match-pairs', 'true-false'],
    visualImportance: 'low',
    requiresImages: false,
    maxTextLength: 1000,
    instructionStyle: 'Professional, concise, direct',
    sizeMultiplier: 0.75, // 25% smaller
  },
  
  '26-35': {
    ageRange: '26-35',
    label: 'Adults (26-35 years)',
    componentsPerMinute: 2.0, // Very fast - 0.5 minutes per component
    attentionSpanMinutes: 50,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank', 'word-bank'],
    avoidExerciseTypes: ['match-pairs', 'true-false'],
    visualImportance: 'low',
    requiresImages: false,
    maxTextLength: 1200,
    instructionStyle: 'Professional, efficient, business-like',
    sizeMultiplier: 0.7, // 30% smaller
  },
  
  '36-50': {
    ageRange: '36-50',
    label: 'Mature Adults (36-50 years)',
    componentsPerMinute: 1.8, // Fast - 0.56 minutes per component
    attentionSpanMinutes: 55,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank', 'word-bank'],
    avoidExerciseTypes: ['match-pairs', 'true-false'],
    visualImportance: 'low',
    requiresImages: false,
    maxTextLength: 1200,
    instructionStyle: 'Professional, detailed, comprehensive',
    sizeMultiplier: 0.75, // 25% smaller
  },
  
  '50+': {
    ageRange: '50+',
    label: 'Senior Adults (50+ years)',
    componentsPerMinute: 1.5, // Moderate - 0.67 minutes per component
    attentionSpanMinutes: 50,
    preferredExerciseTypes: ['short-answer', 'multiple-choice', 'fill-blank', 'word-bank'],
    avoidExerciseTypes: ['match-pairs'],
    visualImportance: 'medium',
    requiresImages: false,
    maxTextLength: 1000,
    instructionStyle: 'Clear, well-structured, patient',
    sizeMultiplier: 0.85, // 15% smaller (slightly larger for readability)
  },
};

// === Duration to minutes mapping ===
const DURATION_MINUTES: Record<Duration, number> = {
  quick: 12.5,      // 10-15 min average
  standard: 25,     // 20-30 min average
  extended: 45,     // 40-50 min average
};

export class AgeBasedContentService {
  
  /**
   * Get configuration for specific age group
   */
  public getConfig(ageRange: string): AgeGroupConfig | null {
    return AGE_CONFIGURATIONS[ageRange] || null;
  }
  
  /**
   * Get all available age groups
   */
  public getAllAgeGroups(): string[] {
    return Object.keys(AGE_CONFIGURATIONS);
  }
  
  /**
   * Calculate appropriate component count based on age and duration
   */
  public calculateComponentCount(
    ageRange: string,
    duration: Duration
  ): ContentAmountResult {
    const config = this.getConfig(ageRange);
    
    if (!config) {
      // Fallback for unknown age group
      return this.getDefaultContentAmount(duration);
    }
    
    // Calculate based on actual processing speed and attention span
    const durationMinutes = DURATION_MINUTES[duration];
    const maxByAttention = config.attentionSpanMinutes * config.componentsPerMinute;
    const maxByDuration = durationMinutes * config.componentsPerMinute;
    
    // Use the smaller of the two (don't exceed attention span)
    const targetCount = Math.round(Math.min(maxByAttention, maxByDuration));
    
    // Allow ±20% variance
    const minCount = Math.max(3, Math.round(targetCount * 0.8));
    const maxCount = Math.round(targetCount * 1.2);
    
    const explanation = this.generateExplanation(
      ageRange,
      duration,
      targetCount,
      config,
      durationMinutes
    );
    
    return {
      targetCount,
      minCount,
      maxCount,
      explanation,
    };
  }
  
  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    ageRange: string,
    duration: Duration,
    targetCount: number,
    config: AgeGroupConfig,
    durationMinutes: number
  ): string {
    const timePerComponent = Math.round(1 / config.componentsPerMinute);
    
    return `For ${config.label}, we recommend ${targetCount} components. ` +
      `At this age, children process about ${config.componentsPerMinute} components per minute ` +
      `(~${timePerComponent} min per component). For a ${duration} lesson (${durationMinutes} min), ` +
      `this provides engaging content without overwhelming.`;
  }
  
  /**
   * Default content amount for unknown age groups
   */
  private getDefaultContentAmount(duration: Duration): ContentAmountResult {
    const defaults: Record<Duration, ContentAmountResult> = {
      quick: {
        targetCount: 6,
        minCount: 5,
        maxCount: 8,
        explanation: 'Standard quick lesson content',
      },
      standard: {
        targetCount: 12,
        minCount: 10,
        maxCount: 15,
        explanation: 'Standard lesson content',
      },
      extended: {
        targetCount: 20,
        minCount: 18,
        maxCount: 25,
        explanation: 'Extended lesson content',
      },
    };
    
    return defaults[duration];
  }
  
  /**
   * Get size multiplier for pagination (younger = bigger components)
   */
  public getSizeMultiplier(ageRange: string): number {
    const config = this.getConfig(ageRange);
    return config?.sizeMultiplier || 1.0;
  }
  
  /**
   * Format age-specific guidelines for AI prompt
   */
  public formatForPrompt(ageRange: string, duration: Duration): string {
    const config = this.getConfig(ageRange);
    if (!config) return '';
    
    const contentAmount = this.calculateComponentCount(ageRange, duration);
    
    return `
**AGE-SPECIFIC CONTENT REQUIREMENTS FOR ${config.label}:**

📊 **Content Amount:**
- Target Components: ${contentAmount.targetCount}
- Acceptable Range: ${contentAmount.minCount}-${contentAmount.maxCount}
- Reason: ${contentAmount.explanation}

⏱️ **Pacing:**
- Processing Speed: ${config.componentsPerMinute} components/minute
- Time per Component: ~${Math.round(1 / config.componentsPerMinute)} minutes
- Attention Span: ${config.attentionSpanMinutes} minutes

✅ **Preferred Exercise Types:**
${config.preferredExerciseTypes.map(type => `  - ${type}`).join('\n')}

${config.avoidExerciseTypes.length > 0 ? `
❌ **Avoid These Types:**
${config.avoidExerciseTypes.map(type => `  - ${type}`).join('\n')}
` : ''}

📝 **Text Guidelines:**
- Max Text Length: ${config.maxTextLength} characters per component
- Instruction Style: ${config.instructionStyle}

🎨 **Visual Requirements:**
- Visual Importance: ${config.visualImportance}
- Images Required: ${config.requiresImages ? 'YES (critical for engagement)' : 'NO (use when helpful)'}
`;
  }
  
  /**
   * Validate if component count is appropriate for age and duration
   */
  public validateComponentCount(
    ageRange: string,
    duration: Duration,
    actualCount: number
  ): { valid: boolean; reason: string; suggestion: number } {
    const { targetCount, minCount, maxCount } = this.calculateComponentCount(ageRange, duration);
    
    if (actualCount >= minCount && actualCount <= maxCount) {
      return {
        valid: true,
        reason: `Component count (${actualCount}) is within appropriate range (${minCount}-${maxCount})`,
        suggestion: targetCount,
      };
    }
    
    if (actualCount < minCount) {
      return {
        valid: false,
        reason: `Too few components (${actualCount}). Children need more content for meaningful learning.`,
        suggestion: targetCount,
      };
    }
    
    return {
      valid: false,
      reason: `Too many components (${actualCount}). This may overwhelm children at this age.`,
      suggestion: targetCount,
    };
  }
  
  /**
   * Get recommended duration labels with component counts
   */
  public getDurationLabels(ageRange: string): Record<Duration, string> {
    const quick = this.calculateComponentCount(ageRange, 'quick');
    const standard = this.calculateComponentCount(ageRange, 'standard');
    const extended = this.calculateComponentCount(ageRange, 'extended');
    
    return {
      quick: `Quick (10-15 min, ~${quick.targetCount} components)`,
      standard: `Standard (20-30 min, ~${standard.targetCount} components)`,
      extended: `Extended (40-50 min, ~${extended.targetCount} components)`,
    };
  }
}

// Singleton instance
export const ageBasedContentService = new AgeBasedContentService();

