/**
 * Service that provides schema information about all available worksheet components
 * This is used by AI to understand what components exist and how to use them
 */

import { ComponentSchema, AgeGroupGuidelines } from '@/types/worksheet-generation';

export class WorksheetComponentSchemaService {
  /**
   * Get all available component schemas
   */
  getAllComponentSchemas(): ComponentSchema[] {
    return [
      this.getTitleBlockSchema(),
      this.getBodyTextSchema(),
      this.getInstructionsBoxSchema(),
      this.getFillInBlankSchema(),
      this.getMultipleChoiceSchema(),
      this.getTrueFalseSchema(),
      this.getShortAnswerSchema(),
      this.getMatchPairsSchema(),
      this.getTipBoxSchema(),
      this.getWarningBoxSchema(),
      this.getImagePlaceholderSchema(),
      this.getDividerSchema(),
      this.getBulletListSchema(),
      this.getNumberedListSchema(),
      this.getTableSchema(),
      // Interactive components
      this.getTapImageSchema(),
      this.getSimpleDragDropSchema(),
      this.getColorMatcherSchema(),
      this.getSimpleCounterSchema(),
      this.getMemoryCardsSchema(),
      this.getSortingGameSchema(),
      this.getSequenceBuilderSchema(),
      this.getShapeTracerSchema(),
      this.getEmotionRecognizerSchema(),
      this.getSoundMatcherSchema(),
      this.getSimplePuzzleSchema(),
      this.getPatternBuilderSchema(),
      this.getCauseEffectSchema(),
      this.getRewardCollectorSchema(),
      this.getVoiceRecorderSchema(),
    ];
  }

  /**
   * Get schema by component type
   */
  getSchemaByType(type: string): ComponentSchema | null {
    const schemas = this.getAllComponentSchemas();
    return schemas.find((s) => s.id === type) || null;
  }

  /**
   * Get educational guidelines for age group
   */
  getAgeGroupGuidelines(ageGroup: string): AgeGroupGuidelines {
    const guidelines: Record<string, AgeGroupGuidelines> = {
      '3-5': {
        ageGroup: '3-5',
        readingLevel: 'pre-reading / early reading',
        attentionSpan: 5,
        recommendedExerciseTypes: ['image-placeholder', 'true-false', 'multiple-choice'],
        complexity: 'very-simple',
        visualImportance: 'critical',
        textLengthGuidelines: {
          title: '2-4 words',
          instruction: '5-8 words',
          bodyText: '10-15 words',
          question: '5-8 words',
        },
      },
      '6-7': {
        ageGroup: '6-7',
        readingLevel: 'early reader',
        attentionSpan: 10,
        recommendedExerciseTypes: ['fill-blank', 'multiple-choice', 'true-false', 'image-placeholder'],
        complexity: 'simple',
        visualImportance: 'high',
        textLengthGuidelines: {
          title: '3-5 words',
          instruction: '8-12 words',
          bodyText: '20-30 words',
          question: '8-12 words',
        },
      },
      '8-9': {
        ageGroup: '8-9',
        readingLevel: 'developing reader',
        attentionSpan: 15,
        recommendedExerciseTypes: ['fill-blank', 'multiple-choice', 'short-answer', 'table'],
        complexity: 'moderate',
        visualImportance: 'medium',
        textLengthGuidelines: {
          title: '3-6 words',
          instruction: '10-15 words',
          bodyText: '40-60 words',
          question: '10-15 words',
        },
      },
      '10-11': {
        ageGroup: '10-11',
        readingLevel: 'fluent reader',
        attentionSpan: 20,
        recommendedExerciseTypes: ['fill-blank', 'short-answer', 'table', 'multiple-choice'],
        complexity: 'moderate',
        visualImportance: 'medium',
        textLengthGuidelines: {
          title: '3-7 words',
          instruction: '12-18 words',
          bodyText: '60-100 words',
          question: '12-18 words',
        },
      },
      '12-13': {
        ageGroup: '12-13',
        readingLevel: 'advanced reader',
        attentionSpan: 25,
        recommendedExerciseTypes: ['short-answer', 'fill-blank', 'table', 'multiple-choice'],
        complexity: 'complex',
        visualImportance: 'low',
        textLengthGuidelines: {
          title: '4-8 words',
          instruction: '15-25 words',
          bodyText: '100-150 words',
          question: '15-25 words',
        },
      },
    };

    return guidelines[ageGroup] || guidelines['8-9']; // Default to 8-9
  }

  // ============================================
  // COMPONENT SCHEMAS
  // ============================================

  private getTitleBlockSchema(): ComponentSchema {
    return {
      id: 'title-block',
      name: 'Title Block',
      description: 'Large heading text for page titles, section headers, or exercise titles',
      category: 'text',
      useCases: [
        'Main worksheet title',
        'Section headers',
        'Exercise group titles',
        'Topic introductions',
      ],
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'The title text content',
          examples: ['Present Simple Tense', 'Exercise 1: Fill in the Blanks', 'Animals Around Us'],
        },
        level: {
          type: 'enum',
          required: false,
          default: 'main',
          description: 'Title importance level',
          enum: ['main', 'section', 'exercise'],
        },
        align: {
          type: 'enum',
          required: false,
          default: 'center',
          description: 'Text alignment',
          enum: ['left', 'center', 'right'],
        },
        color: {
          type: 'string',
          required: false,
          default: '#1F2937',
          description: 'Text color (hex)',
          examples: ['#1F2937', '#2563EB', '#059669'],
        },
      },
      examples: [
        {
          description: 'Main worksheet title',
          ageGroup: '8-9',
          properties: {
            text: 'Learning About Dinosaurs',
            level: 'main',
            align: 'center',
            color: '#1F2937',
          },
        },
        {
          description: 'Section title',
          ageGroup: '10-11',
          properties: {
            text: 'Part 1: Vocabulary',
            level: 'section',
            align: 'left',
            color: '#2563EB',
          },
        },
      ],
    };
  }

  private getBodyTextSchema(): ComponentSchema {
    return {
      id: 'body-text',
      name: 'Body Text',
      description: 'Regular paragraph text for explanations, descriptions, and content',
      category: 'text',
      useCases: [
        'Explanations',
        'Instructions details',
        'Story text',
        'Educational content',
        'Examples',
      ],
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'The paragraph text content',
          examples: [
            'The present simple tense is used for actions that happen regularly or facts that are always true.',
            'Dinosaurs lived millions of years ago. They were reptiles that came in many sizes.',
          ],
        },
        variant: {
          type: 'enum',
          required: false,
          default: 'paragraph',
          description: 'Text style variant',
          enum: ['paragraph', 'description', 'example'],
        },
      },
      examples: [
        {
          description: 'Grammar explanation',
          ageGroup: '10-11',
          properties: {
            text: 'We use the present simple tense to talk about habits, routines, and facts. For example: "I play tennis every Saturday." or "The sun rises in the east."',
            variant: 'paragraph',
          },
        },
      ],
    };
  }

  private getInstructionsBoxSchema(): ComponentSchema {
    return {
      id: 'instructions-box',
      name: 'Instructions Box',
      description: 'Highlighted box with instructions for students, includes icon and colored border',
      category: 'box',
      useCases: [
        'Exercise instructions',
        'Reading tasks',
        'Activity guidelines',
        'Step-by-step directions',
      ],
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'Instruction text',
          examples: [
            'Complete the sentences using the correct form of the verb in brackets.',
            'Read the text below and answer the questions.',
            'Circle the correct answer for each question.',
          ],
        },
        type: {
          type: 'enum',
          required: false,
          default: 'general',
          description: 'Type of instruction (determines icon)',
          enum: ['reading', 'writing', 'listening', 'speaking', 'general'],
        },
        title: {
          type: 'string',
          required: false,
          default: 'Instructions',
          description: 'Box title',
          examples: ['Instructions', 'How to Complete', 'Task'],
        },
      },
      examples: [
        {
          description: 'Fill-in-blank instructions',
          ageGroup: '8-9',
          properties: {
            text: 'Fill in the blanks with the correct words from the word bank below.',
            type: 'writing',
            title: 'Instructions',
          },
        },
      ],
    };
  }

  private getFillInBlankSchema(): ComponentSchema {
    return {
      id: 'fill-blank',
      name: 'Fill in the Blank',
      description: 'Exercise with sentences containing blanks for students to fill in',
      category: 'exercise',
      useCases: [
        'Grammar practice',
        'Vocabulary exercises',
        'Sentence completion',
        'Verb conjugation practice',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'Array of fill-in-blank items',
          examples: [
            [
              { number: 1, text: 'She ______ (go) to school every day.', hint: 'goes' },
              { number: 2, text: 'They ______ (play) football on Sundays.', hint: 'play' },
            ],
          ],
        },
        wordBank: {
          type: 'array',
          required: false,
          arrayItemType: 'string',
          description: 'Optional word bank with answer choices',
          examples: [['goes', 'go', 'going', 'plays', 'play', 'playing']],
        },
      },
      examples: [
        {
          description: 'Present simple practice',
          ageGroup: '8-9',
          properties: {
            items: [
              { number: 1, text: 'He ______ (like) ice cream.', hint: 'likes' },
              { number: 2, text: 'We ______ (watch) TV in the evening.', hint: 'watch' },
              { number: 3, text: 'The cat ______ (sleep) on the sofa.', hint: 'sleeps' },
            ],
            wordBank: ['likes', 'watch', 'sleeps', 'like', 'watches', 'sleep'],
          },
        },
      ],
    };
  }

  private getMultipleChoiceSchema(): ComponentSchema {
    return {
      id: 'multiple-choice',
      name: 'Multiple Choice',
      description: 'Questions with multiple answer options (A, B, C, D)',
      category: 'exercise',
      useCases: [
        'Comprehension checks',
        'Vocabulary tests',
        'Grammar exercises',
        'Fact verification',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'Array of multiple choice questions',
          examples: [
            [
              {
                number: 1,
                question: 'She _____ coffee every morning.',
                options: [
                  { letter: 'a', text: 'drink' },
                  { letter: 'b', text: 'drinks' },
                  { letter: 'c', text: 'drinking' },
                ],
              },
            ],
          ],
        },
      },
      examples: [
        {
          description: 'Grammar multiple choice',
          ageGroup: '10-11',
          properties: {
            items: [
              {
                number: 1,
                question: 'My brother _____ basketball every Saturday.',
                options: [
                  { letter: 'a', text: 'play' },
                  { letter: 'b', text: 'plays' },
                  { letter: 'c', text: 'playing' },
                  { letter: 'd', text: 'played' },
                ],
              },
            ],
          },
        },
      ],
    };
  }

  private getTrueFalseSchema(): ComponentSchema {
    return {
      id: 'true-false',
      name: 'True or False',
      description: 'Statements that students mark as true or false',
      category: 'exercise',
      useCases: [
        'Fact checking',
        'Quick comprehension',
        'Statement verification',
        'Knowledge assessment',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'Array of true/false statements',
          examples: [
            [
              { number: 1, statement: 'The sun rises in the west.' },
              { number: 2, statement: 'Water freezes at 0°C (32°F).' },
            ],
          ],
        },
      },
      examples: [
        {
          description: 'Science facts',
          ageGroup: '8-9',
          properties: {
            items: [
              { number: 1, statement: 'Plants need sunlight to grow.' },
              { number: 2, statement: 'Fish can live without water.' },
              { number: 3, statement: 'The Earth is round.' },
            ],
          },
        },
      ],
    };
  }

  private getShortAnswerSchema(): ComponentSchema {
    return {
      id: 'short-answer',
      name: 'Short Answer',
      description: 'Questions requiring written responses with lines for answers',
      category: 'exercise',
      useCases: [
        'Open-ended questions',
        'Writing practice',
        'Personal responses',
        'Creative answers',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'Array of short answer questions',
          examples: [
            [
              { number: 1, question: 'What is your favorite animal?', lines: 1 },
              { number: 2, question: 'Describe your best friend.', lines: 3 },
            ],
          ],
        },
      },
      examples: [
        {
          description: 'Personal questions',
          ageGroup: '8-9',
          properties: {
            items: [
              { number: 1, question: 'What is your favorite subject at school?', lines: 1 },
              { number: 2, question: 'Why do you like this subject?', lines: 2 },
            ],
          },
        },
      ],
    };
  }

  private getTipBoxSchema(): ComponentSchema {
    return {
      id: 'tip-box',
      name: 'Tip Box',
      description: 'Helpful hints and tips for students, with light blue background',
      category: 'box',
      useCases: [
        'Study tips',
        'Memory aids',
        'Grammar reminders',
        'Learning strategies',
      ],
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'Tip text',
          examples: [
            'Remember: add "s" for third person singular!',
            'Tip: Read the question carefully before answering.',
          ],
        },
        type: {
          type: 'enum',
          required: false,
          default: 'study',
          description: 'Type of tip',
          enum: ['study', 'memory', 'practice', 'cultural'],
        },
        title: {
          type: 'string',
          required: false,
          default: 'Tip',
          description: 'Box title',
        },
      },
      examples: [
        {
          description: 'Grammar tip',
          ageGroup: '8-9',
          properties: {
            text: 'Remember: He, She, It takes "s" or "es" at the end of the verb in present simple.',
            type: 'study',
            title: 'Grammar Tip',
          },
        },
      ],
    };
  }

  private getWarningBoxSchema(): ComponentSchema {
    return {
      id: 'warning-box',
      name: 'Warning Box',
      description: 'Important warnings and cautions for students, with orange/yellow background',
      category: 'box',
      useCases: [
        'Common mistakes',
        'Important notes',
        'Things to avoid',
        'Critical information',
      ],
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'Warning text',
          examples: [
            'Watch out for irregular verbs!',
            'Don\'t forget the apostrophe in contractions.',
          ],
        },
        type: {
          type: 'enum',
          required: false,
          default: 'grammar',
          description: 'Type of warning',
          enum: ['grammar', 'time', 'difficulty', 'mistake'],
        },
        title: {
          type: 'string',
          required: false,
          default: 'Warning',
          description: 'Box title',
        },
      },
      examples: [
        {
          description: 'Common mistake warning',
          ageGroup: '10-11',
          properties: {
            text: 'Common mistake: Don\'t say "He go" - it should be "He goes"!',
            type: 'mistake',
            title: 'Watch Out!',
          },
        },
      ],
    };
  }

  private getImagePlaceholderSchema(): ComponentSchema {
    return {
      id: 'image-placeholder',
      name: 'Image Placeholder',
      description: 'Image with caption and customizable size and alignment. Use imagePrompt for AI generation.',
      category: 'media',
      useCases: [
        'Visual aids',
        'Examples',
        'Illustrations',
        'Reference images',
      ],
      properties: {
        imagePrompt: {
          type: 'string',
          required: false,
          description: 'Prompt for AI image generation (Flux). If provided, image will be generated on client. Leave url empty when using this.',
          examples: [
            'A friendly T-Rex dinosaur in prehistoric forest, educational illustration for children',
            'Solar system planets in space, colorful educational diagram',
            'Simple addition math problem with colorful numbers and objects',
          ],
        },
        url: {
          type: 'string',
          required: false,
          description: 'Image URL (optional, can use placeholder). Leave empty if using imagePrompt.',
          examples: ['https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'],
        },
        caption: {
          type: 'string',
          required: false,
          description: 'Image caption',
          examples: ['A cute cat', 'Example of a dinosaur'],
        },
        width: {
          type: 'number',
          required: false,
          default: 400,
          description: 'Image width in pixels',
          examples: [300, 400, 500],
        },
        height: {
          type: 'number',
          required: false,
          default: 300,
          description: 'Image height in pixels',
          examples: [200, 300, 400],
        },
        align: {
          type: 'enum',
          required: false,
          default: 'center',
          description: 'Image alignment',
          enum: ['left', 'center', 'right'],
        },
      },
      examples: [
        {
          description: 'AI-generated educational image',
          ageGroup: '6-7',
          properties: {
            imagePrompt: 'A colorful butterfly on a flower, child-friendly illustration, educational content',
            caption: 'A beautiful butterfly',
            width: 400,
            height: 300,
            align: 'center',
          },
        },
      ],
    };
  }

  private getDividerSchema(): ComponentSchema {
    return {
      id: 'divider',
      name: 'Divider',
      description: 'Horizontal line to separate sections',
      category: 'layout',
      useCases: [
        'Section separation',
        'Visual breaks',
        'Content organization',
      ],
      properties: {
        style: {
          type: 'enum',
          required: false,
          default: 'solid',
          description: 'Line style',
          enum: ['solid', 'dashed', 'dotted'],
        },
        thickness: {
          type: 'number',
          required: false,
          default: 1,
          description: 'Line thickness in pixels',
          examples: [1, 2, 3],
        },
        color: {
          type: 'string',
          required: false,
          default: '#D1D5DB',
          description: 'Line color (hex)',
          examples: ['#D1D5DB', '#9CA3AF', '#374151'],
        },
        spacing: {
          type: 'enum',
          required: false,
          default: 'medium',
          description: 'Spacing around divider',
          enum: ['small', 'medium', 'large'],
        },
      },
      examples: [
        {
          description: 'Section divider',
          properties: {
            style: 'solid',
            thickness: 2,
            color: '#D1D5DB',
            spacing: 'medium',
          },
        },
      ],
    };
  }

  private getBulletListSchema(): ComponentSchema {
    return {
      id: 'bullet-list',
      name: 'Bullet List',
      description: 'Unordered list with bullet points',
      category: 'text',
      useCases: [
        'Lists of items',
        'Key points',
        'Examples',
        'Features',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'List items',
          examples: [
            [
              { id: '1', text: 'First item' },
              { id: '2', text: 'Second item' },
            ],
          ],
        },
        style: {
          type: 'enum',
          required: false,
          default: 'dot',
          description: 'Bullet style',
          enum: ['dot', 'circle', 'square', 'arrow'],
        },
      },
      examples: [
        {
          description: 'Key points',
          ageGroup: '10-11',
          properties: {
            items: [
              { id: '1', text: 'Present simple is used for habits' },
              { id: '2', text: 'Add "s" for he/she/it' },
              { id: '3', text: 'Use "do/does" for questions' },
            ],
            style: 'dot',
          },
        },
      ],
    };
  }

  private getNumberedListSchema(): ComponentSchema {
    return {
      id: 'numbered-list',
      name: 'Numbered List',
      description: 'Ordered list with numbers',
      category: 'text',
      useCases: [
        'Steps',
        'Instructions',
        'Sequences',
        'Rankings',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'List items',
          examples: [
            [
              { id: '1', text: 'First step' },
              { id: '2', text: 'Second step' },
            ],
          ],
        },
        style: {
          type: 'enum',
          required: false,
          default: 'decimal',
          description: 'Number style',
          enum: ['decimal', 'roman', 'letter'],
        },
      },
      examples: [
        {
          description: 'Step-by-step instructions',
          ageGroup: '8-9',
          properties: {
            items: [
              { id: '1', text: 'Read the sentence carefully' },
              { id: '2', text: 'Choose the correct verb form' },
              { id: '3', text: 'Write your answer in the blank' },
            ],
            style: 'decimal',
          },
        },
      ],
    };
  }

  private getTableSchema(): ComponentSchema {
    return {
      id: 'table',
      name: 'Table',
      description: 'Data table with headers and rows',
      category: 'layout',
      useCases: [
        'Data organization',
        'Comparisons',
        'Schedules',
        'Information display',
      ],
      properties: {
        headers: {
          type: 'array',
          required: true,
          arrayItemType: 'string',
          description: 'Table column headers',
          examples: [['Verb', 'Present Simple', 'Example']],
        },
        rows: {
          type: 'array',
          required: true,
          arrayItemType: 'array',
          description: 'Table rows',
          examples: [
            [
              ['go', 'goes', 'She goes to school'],
              ['play', 'plays', 'He plays football'],
            ],
          ],
        },
        hasHeaders: {
          type: 'boolean',
          required: false,
          default: true,
          description: 'Whether to show header row',
        },
        borderStyle: {
          type: 'enum',
          required: false,
          default: 'all',
          description: 'Border style',
          enum: ['all', 'horizontal', 'none'],
        },
      },
      examples: [
        {
          description: 'Verb conjugation table',
          ageGroup: '10-11',
          properties: {
            headers: ['Subject', 'Verb', 'Example'],
            rows: [
              ['I / You / We / They', 'play', 'I play tennis'],
              ['He / She / It', 'plays', 'She plays piano'],
            ],
            hasHeaders: true,
            borderStyle: 'all',
          },
        },
      ],
    };
  }

  private getMatchPairsSchema(): ComponentSchema {
    return {
      id: 'match-pairs',
      name: 'Match Pairs',
      description: 'Matching exercise with two columns to connect',
      category: 'exercise',
      useCases: [
        'Vocabulary matching',
        'Concept pairing',
        'Translation exercises',
        'Association activities',
      ],
      properties: {
        items: {
          type: 'array',
          required: true,
          arrayItemType: 'object',
          description: 'Pairs to match',
          examples: [
            [
              { number: 1, left: 'Apple', right: 'Fruit' },
              { number: 2, left: 'Carrot', right: 'Vegetable' },
            ],
          ],
        },
      },
      examples: [
        {
          description: 'Animals and sounds',
          ageGroup: '6-7',
          properties: {
            items: [
              { number: 1, left: 'Dog', right: 'Woof!' },
              { number: 2, left: 'Cat', right: 'Meow!' },
              { number: 3, left: 'Cow', right: 'Moo!' },
            ],
          },
        },
      ],
    };
  }

  // Interactive Components
  private getTapImageSchema(): ComponentSchema {
    return {
      id: 'tap-image',
      name: 'Tap Image',
      description: 'Interactive image that responds to taps',
      category: 'media',
      useCases: ['Interactive exploration', 'Discovery activities', 'Recognition games'],
      properties: {
        imageUrl: { type: 'string', required: true, description: 'Image URL' },
        targetObjects: { type: 'array', required: false, description: 'Objects to tap', arrayItemType: 'object' },
      },
      examples: [{ description: 'Tap the cat', ageGroup: '3-5', properties: { imageUrl: '', targetObjects: [] } }],
    };
  }

  private getSimpleDragDropSchema(): ComponentSchema {
    return {
      id: 'simple-drag-drop',
      name: 'Simple Drag & Drop',
      description: 'Drag items to correct positions',
      category: 'exercise',
      useCases: ['Sorting', 'Categorization', 'Ordering'],
      properties: {
        items: { type: 'array', required: true, description: 'Items to drag', arrayItemType: 'object' },
        zones: { type: 'array', required: true, description: 'Drop zones', arrayItemType: 'object' },
      },
      examples: [{ description: 'Sort items', ageGroup: '6-7', properties: { items: [], zones: [] } }],
    };
  }

  private getColorMatcherSchema(): ComponentSchema {
    return {
      id: 'color-matcher',
      name: 'Color Matcher',
      description: 'Match colors or color names',
      category: 'exercise',
      useCases: ['Color recognition', 'Learning colors'],
      properties: { colors: { type: 'array', required: true, description: 'Colors', arrayItemType: 'string' } },
      examples: [{ description: 'Match colors', ageGroup: '3-5', properties: { colors: [] } }],
    };
  }

  private getSimpleCounterSchema(): ComponentSchema {
    return {
      id: 'simple-counter',
      name: 'Simple Counter',
      description: 'Count objects interactively',
      category: 'exercise',
      useCases: ['Counting practice', 'Number recognition'],
      properties: { maxCount: { type: 'number', required: true, description: 'Max count' } },
      examples: [{ description: 'Count to 10', ageGroup: '3-5', properties: { maxCount: 10 } }],
    };
  }

  private getMemoryCardsSchema(): ComponentSchema {
    return {
      id: 'memory-cards',
      name: 'Memory Cards',
      description: 'Memory matching game',
      category: 'exercise',
      useCases: ['Memory games', 'Vocabulary practice'],
      properties: { pairs: { type: 'array', required: true, description: 'Card pairs', arrayItemType: 'object' } },
      examples: [{ description: 'Match pairs', ageGroup: '6-7', properties: { pairs: [] } }],
    };
  }

  private getSortingGameSchema(): ComponentSchema {
    return {
      id: 'sorting-game',
      name: 'Sorting Game',
      description: 'Sort items into categories',
      category: 'exercise',
      useCases: ['Classification', 'Categorization'],
      properties: { categories: { type: 'array', required: true, description: 'Categories', arrayItemType: 'object' } },
      examples: [{ description: 'Sort items', ageGroup: '6-7', properties: { categories: [] } }],
    };
  }

  private getSequenceBuilderSchema(): ComponentSchema {
    return {
      id: 'sequence-builder',
      name: 'Sequence Builder',
      description: 'Build sequences in correct order',
      category: 'exercise',
      useCases: ['Ordering', 'Story sequencing'],
      properties: { steps: { type: 'array', required: true, description: 'Sequence steps', arrayItemType: 'object' } },
      examples: [{ description: 'Order steps', ageGroup: '8-9', properties: { steps: [] } }],
    };
  }

  private getShapeTracerSchema(): ComponentSchema {
    return {
      id: 'shape-tracer',
      name: 'Shape Tracer',
      description: 'Trace shapes with finger/mouse',
      category: 'exercise',
      useCases: ['Fine motor skills', 'Shape recognition'],
      properties: { shape: { type: 'string', required: true, description: 'Shape to trace' } },
      examples: [{ description: 'Trace circle', ageGroup: '3-5', properties: { shape: 'circle' } }],
    };
  }

  private getEmotionRecognizerSchema(): ComponentSchema {
    return {
      id: 'emotion-recognizer',
      name: 'Emotion Recognizer',
      description: 'Identify emotions',
      category: 'exercise',
      useCases: ['Emotional intelligence', 'Facial expressions'],
      properties: { emotions: { type: 'array', required: true, description: 'Emotions', arrayItemType: 'string' } },
      examples: [{ description: 'Find happy face', ageGroup: '3-5', properties: { emotions: [] } }],
    };
  }

  private getSoundMatcherSchema(): ComponentSchema {
    return {
      id: 'sound-matcher',
      name: 'Sound Matcher',
      description: 'Match sounds to objects',
      category: 'exercise',
      useCases: ['Audio recognition', 'Sound association'],
      properties: { sounds: { type: 'array', required: true, description: 'Sounds', arrayItemType: 'object' } },
      examples: [{ description: 'Match animal sounds', ageGroup: '3-5', properties: { sounds: [] } }],
    };
  }

  private getSimplePuzzleSchema(): ComponentSchema {
    return {
      id: 'simple-puzzle',
      name: 'Simple Puzzle',
      description: 'Simple jigsaw puzzle',
      category: 'exercise',
      useCases: ['Problem solving', 'Spatial reasoning'],
      properties: { pieces: { type: 'number', required: true, description: 'Number of pieces' } },
      examples: [{ description: '4-piece puzzle', ageGroup: '3-5', properties: { pieces: 4 } }],
    };
  }

  private getPatternBuilderSchema(): ComponentSchema {
    return {
      id: 'pattern-builder',
      name: 'Pattern Builder',
      description: 'Build patterns with shapes/colors',
      category: 'exercise',
      useCases: ['Pattern recognition', 'Logic'],
      properties: { pattern: { type: 'array', required: true, description: 'Pattern', arrayItemType: 'string' } },
      examples: [{ description: 'Continue pattern', ageGroup: '6-7', properties: { pattern: [] } }],
    };
  }

  private getCauseEffectSchema(): ComponentSchema {
    return {
      id: 'cause-effect',
      name: 'Cause & Effect',
      description: 'Match causes with effects',
      category: 'exercise',
      useCases: ['Logical thinking', 'Reasoning'],
      properties: { pairs: { type: 'array', required: true, description: 'Cause-effect pairs', arrayItemType: 'object' } },
      examples: [{ description: 'Match cause to effect', ageGroup: '8-9', properties: { pairs: [] } }],
    };
  }

  private getRewardCollectorSchema(): ComponentSchema {
    return {
      id: 'reward-collector',
      name: 'Reward Collector',
      description: 'Collect rewards/stars for progress',
      category: 'layout',
      useCases: ['Motivation', 'Progress tracking'],
      properties: { rewards: { type: 'number', required: false, description: 'Number of rewards', default: 3 } },
      examples: [{ description: 'Collect 3 stars', ageGroup: '3-5', properties: { rewards: 3 } }],
    };
  }

  private getVoiceRecorderSchema(): ComponentSchema {
    return {
      id: 'voice-recorder',
      name: 'Voice Recorder',
      description: 'Record voice responses',
      category: 'exercise',
      useCases: ['Speaking practice', 'Pronunciation'],
      properties: { maxDuration: { type: 'number', required: false, description: 'Max duration in seconds', default: 30 } },
      examples: [{ description: 'Record your answer', ageGroup: '8-9', properties: { maxDuration: 30 } }],
    };
  }
}

// Singleton instance
export const worksheetComponentSchemaService = new WorksheetComponentSchemaService();

