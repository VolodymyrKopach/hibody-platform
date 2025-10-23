/**
 * Service for managing age-specific drag and drop components
 * Handles component selection, registration, and rendering
 */

import React from 'react';
import { AgeGroup, ComponentDefinition, ComponentType } from '@/types/age-group-data';

// Component registry
const componentRegistry = new Map<string, ComponentDefinition>();

// Age group to component type mappings
const ageGroupComponents: Record<AgeGroup, ComponentDefinition[]> = {
  '3-5': [],
  '6-7': [],
  '8-9': [],
  '10-13': [],
  '14-18': [],
};

export class ComponentSelectorService {
  /**
   * Register a new component for specific age groups
   */
  static registerComponent(definition: ComponentDefinition): void {
    const key = `${definition.ageGroup}-${definition.type}`;
    componentRegistry.set(key, definition);
    
    // Add to age group mapping
    if (!ageGroupComponents[definition.ageGroup]) {
      ageGroupComponents[definition.ageGroup] = [];
    }
    ageGroupComponents[definition.ageGroup].push(definition);
    
    console.log(`📝 Registered component: ${definition.name} for age ${definition.ageGroup}`);
  }

  /**
   * Get all available components for a specific age group
   */
  static getComponentsForAge(ageGroup: AgeGroup): ComponentDefinition[] {
    return ageGroupComponents[ageGroup] || [];
  }

  /**
   * Get component definition by type and age group
   */
  static getComponentDefinition(type: ComponentType, ageGroup: AgeGroup): ComponentDefinition | null {
    const key = `${ageGroup}-${type}`;
    return componentRegistry.get(key) || null;
  }

  /**
   * Find component definition by type in any age group
   */
  static findComponentByType(type: ComponentType): ComponentDefinition | null {
    const allComponents = this.getAllComponents();
    return allComponents.find(c => c.type === type) || null;
  }

  /**
   * Get all registered components
   */
  static getAllComponents(): ComponentDefinition[] {
    return Array.from(componentRegistry.values());
  }

  /**
   * Filter components by criteria
   */
  static filterComponents(criteria: {
    ageGroup?: AgeGroup;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    category?: string;
    maxTime?: number;
  }): ComponentDefinition[] {
    let components = this.getAllComponents();

    if (criteria.ageGroup) {
      components = components.filter(c => c.ageGroup === criteria.ageGroup);
    }

    if (criteria.difficulty) {
      components = components.filter(c => c.difficulty === criteria.difficulty);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      components = components.filter(c => 
        criteria.tags!.some(tag => c.tags.includes(tag))
      );
    }

    if (criteria.category) {
      components = components.filter(c => 
        c.tags.includes(criteria.category)
      );
    }

    if (criteria.maxTime) {
      components = components.filter(c => c.estimatedTime <= criteria.maxTime!);
    }

    return components;
  }

  /**
   * Get recommended components for age group based on learning progression
   */
  static getRecommendedComponents(ageGroup: AgeGroup, completedComponents: string[] = []): ComponentDefinition[] {
    const availableComponents = this.getComponentsForAge(ageGroup);
    
    // Filter out completed components
    const uncompletedComponents = availableComponents.filter(
      c => !completedComponents.includes(c.type)
    );

    // Sort by difficulty and estimated time
    return uncompletedComponents.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      const aDifficulty = difficultyOrder[a.difficulty];
      const bDifficulty = difficultyOrder[b.difficulty];
      
      if (aDifficulty !== bDifficulty) {
        return aDifficulty - bDifficulty;
      }
      
      return a.estimatedTime - b.estimatedTime;
    });
  }

  /**
   * Get component statistics
   */
  static getComponentStats(): {
    totalComponents: number;
    componentsByAge: Record<AgeGroup, number>;
    componentsByDifficulty: Record<string, number>;
    averageEstimatedTime: number;
  } {
    const allComponents = this.getAllComponents();
    
    const componentsByAge = Object.keys(ageGroupComponents).reduce((acc, age) => {
      acc[age as AgeGroup] = ageGroupComponents[age as AgeGroup].length;
      return acc;
    }, {} as Record<AgeGroup, number>);

    const componentsByDifficulty = allComponents.reduce((acc, component) => {
      acc[component.difficulty] = (acc[component.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageEstimatedTime = allComponents.length > 0 
      ? allComponents.reduce((sum, c) => sum + c.estimatedTime, 0) / allComponents.length
      : 0;

    return {
      totalComponents: allComponents.length,
      componentsByAge,
      componentsByDifficulty,
      averageEstimatedTime,
    };
  }

  /**
   * Validate component data structure
   */
  static validateComponentData(type: ComponentType, data: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!data.id) errors.push('Component ID is required');
    if (!data.title) errors.push('Component title is required');
    if (!data.items || !Array.isArray(data.items)) errors.push('Items array is required');
    if (data.items && data.items.length === 0) warnings.push('No items provided');

    // Type-specific validation
    switch (type) {
      case 'magnetic-playground':
        if (!data.magneticStrength || data.magneticStrength < 50) {
          warnings.push('Magnetic strength should be at least 50px for toddlers');
        }
        if (!data.animalHelper) {
          warnings.push('Animal helper is recommended for toddlers');
        }
        break;

      case 'story-adventure':
        if (!data.storyTheme) errors.push('Story theme is required');
        if (!data.characters || data.characters.length === 0) {
          warnings.push('Characters enhance the story experience');
        }
        break;

      case 'educational-sorter':
        if (!data.subject) errors.push('Educational subject is required');
        if (!data.educationalGoals || data.educationalGoals.length === 0) {
          warnings.push('Educational goals help track learning progress');
        }
        break;

      case 'strategic-matcher':
        if (!data.strategyType) errors.push('Strategy type is required');
        if (!data.scoring) warnings.push('Scoring system enhances engagement');
        break;

      case 'professional-workflow':
        if (!data.workflowType) errors.push('Workflow type is required');
        if (!data.keyboardShortcuts || data.keyboardShortcuts.length === 0) {
          warnings.push('Keyboard shortcuts improve professional workflow experience');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate component template data
   */
  static generateTemplateData(type: ComponentType, ageGroup: AgeGroup): any {
    const baseTemplate = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${type.replace(/-/g, ' ')} Component`,
      description: 'Drag and drop component description',
      items: [],
      targets: [],
      settings: {},
    };

    // Age-specific templates
    switch (ageGroup) {
      case '3-5':
        return {
          ...baseTemplate,
          magneticStrength: 150,
          animalHelper: 'bunny',
          autoComplete: true,
          celebrationLevel: 'maximum',
        };

      case '6-7':
        return {
          ...baseTemplate,
          storyTheme: 'farm',
          characters: [],
          chapters: [],
          rewardSystem: { stars: 0, badges: [], unlockables: [] },
        };

      case '8-9':
        return {
          ...baseTemplate,
          subject: 'math',
          educationalGoals: [],
          explanations: [],
          progressTracking: { skillsLearned: [], masteryLevel: 0, timeSpent: 0, accuracy: 0 },
        };

      case '10-13':
        return {
          ...baseTemplate,
          strategyType: 'logic',
          complexity: { multipleCorrectAnswers: false, dependentChoices: false, timeConstraints: false },
          scoring: { pointsPerCorrect: 10, penaltyPerMistake: 5, bonusMultipliers: [], timeBonus: false },
          challenges: [],
        };

      case '14-18':
        return {
          ...baseTemplate,
          workflowType: 'data-analysis',
          professionalContext: 'Business analysis workflow',
          keyboardShortcuts: [],
          exportOptions: { formats: ['json'], includeAnalytics: true, customFields: false },
          realWorldApplication: 'Used in professional data analysis',
        };

      default:
        return baseTemplate;
    }
  }

  /**
   * Get component usage analytics
   */
  static getUsageAnalytics(): {
    mostUsedComponents: { type: string; usage: number }[];
    averageCompletionTime: Record<string, number>;
    successRates: Record<string, number>;
  } {
    // This would integrate with actual analytics service
    // For now, return mock data structure
    return {
      mostUsedComponents: [],
      averageCompletionTime: {},
      successRates: {},
    };
  }
}

// Pre-register component definitions (will be populated by actual components)
export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  // Toddlers (3-5 years ONLY)
  'magnetic-playground': {
    type: 'magnetic-playground',
    name: '🧲 Magnetic Playground (3-5 years)',
    description: 'Large, colorful items that magnetically snap to targets with cute animal helpers. Specifically designed for toddlers.',
    icon: '🧲',
    ageGroup: '3-5',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['matching', 'animals', 'colors', 'basic-concepts'],
  },
  'simple-matching': {
    type: 'simple-matching',
    name: '🎯 Simple Matching',
    description: 'Match pairs of items with large, touch-friendly elements',
    icon: '🎯',
    ageGroup: '3-5',
    difficulty: 'easy',
    estimatedTime: 3,
    tags: ['matching', 'pairs', 'recognition'],
  },
  'color-sorter': {
    type: 'color-sorter',
    name: '🌈 Color Sorter',
    description: 'Sort colorful objects into matching color buckets',
    icon: '🌈',
    ageGroup: '3-5',
    difficulty: 'easy',
    estimatedTime: 4,
    tags: ['colors', 'sorting', 'recognition'],
  },

  // Preschoolers (6-7)
  'story-adventure': {
    type: 'story-adventure',
    name: '📚 Story Adventure',
    description: 'Interactive storytelling with drag and drop elements and character guides',
    icon: '📚',
    ageGroup: '6-7',
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['storytelling', 'characters', 'adventure', 'narrative'],
  },
  'animal-homes': {
    type: 'animal-homes',
    name: '🏠 Animal Homes',
    description: 'Help animals find their correct habitats with educational facts',
    icon: '🏠',
    ageGroup: '6-7',
    difficulty: 'easy',
    estimatedTime: 6,
    tags: ['animals', 'habitats', 'nature', 'education'],
  },
  'shape-puzzle': {
    type: 'shape-puzzle',
    name: '🔷 Shape Puzzle',
    description: 'Fit geometric shapes into their matching outlines',
    icon: '🔷',
    ageGroup: '6-7',
    difficulty: 'medium',
    estimatedTime: 7,
    tags: ['shapes', 'geometry', 'spatial', 'puzzle'],
  },

  // Elementary (8-9)
  'educational-sorter': {
    type: 'educational-sorter',
    name: '📖 Educational Sorter',
    description: 'Sort items by educational categories with explanations and progress tracking',
    icon: '📖',
    ageGroup: '8-9',
    difficulty: 'medium',
    estimatedTime: 10,
    tags: ['education', 'categories', 'learning', 'progress'],
  },
  'math-matcher': {
    type: 'math-matcher',
    name: '🔢 Math Matcher',
    description: 'Match mathematical concepts, equations, and solutions',
    icon: '🔢',
    ageGroup: '8-9',
    difficulty: 'medium',
    estimatedTime: 12,
    tags: ['math', 'equations', 'numbers', 'calculation'],
  },
  'science-classifier': {
    type: 'science-classifier',
    name: '🔬 Science Classifier',
    description: 'Classify scientific concepts, organisms, and phenomena',
    icon: '🔬',
    ageGroup: '8-9',
    difficulty: 'medium',
    estimatedTime: 15,
    tags: ['science', 'classification', 'biology', 'physics'],
  },

  // Middle School (10-13)
  'strategic-matcher': {
    type: 'strategic-matcher',
    name: '🎯 Strategic Matcher',
    description: 'Complex matching with strategy, scoring, and multiple correct answers',
    icon: '🎯',
    ageGroup: '10-13',
    difficulty: 'hard',
    estimatedTime: 15,
    tags: ['strategy', 'logic', 'complex', 'scoring'],
  },
  'logic-puzzle': {
    type: 'logic-puzzle',
    name: '🧩 Logic Puzzle',
    description: 'Solve logical sequences and pattern-based challenges',
    icon: '🧩',
    ageGroup: '10-13',
    difficulty: 'hard',
    estimatedTime: 18,
    tags: ['logic', 'patterns', 'deduction', 'reasoning'],
  },
  'data-organizer': {
    type: 'data-organizer',
    name: '📊 Data Organizer',
    description: 'Organize and categorize data sets using various methodologies',
    icon: '📊',
    ageGroup: '10-13',
    difficulty: 'hard',
    estimatedTime: 20,
    tags: ['data', 'organization', 'analysis', 'methodology'],
  },

  // Teens (14-18)
  'professional-workflow': {
    type: 'professional-workflow',
    name: '💼 Professional Workflow',
    description: 'Professional-grade workflow tools with keyboard shortcuts and export options',
    icon: '💼',
    ageGroup: '14-18',
    difficulty: 'hard',
    estimatedTime: 25,
    tags: ['professional', 'workflow', 'business', 'productivity'],
  },
  'research-sorter': {
    type: 'research-sorter',
    name: '🔍 Research Sorter',
    description: 'Academic research organization with citation and methodology support',
    icon: '🔍',
    ageGroup: '14-18',
    difficulty: 'hard',
    estimatedTime: 30,
    tags: ['research', 'academic', 'citation', 'methodology'],
  },
  'analysis-tools': {
    type: 'analysis-tools',
    name: '📈 Analysis Tools',
    description: 'Advanced data analysis tools with statistical and reporting capabilities',
    icon: '📈',
    ageGroup: '14-18',
    difficulty: 'hard',
    estimatedTime: 35,
    tags: ['analysis', 'statistics', 'reporting', 'advanced'],
  },
};

// Auto-register all component definitions
Object.values(COMPONENT_DEFINITIONS).forEach(definition => {
  ComponentSelectorService.registerComponent(definition);
});

export default ComponentSelectorService;
