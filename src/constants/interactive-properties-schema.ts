/**
 * Property schemas for interactive components
 * Defines editable properties for each interactive component type
 */

import { AgeStyleName } from '@/types/interactive-age-styles';

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'color' 
  | 'url' 
  | 'select' 
  | 'array-simple' // Array of strings
  | 'array-object' // Array of objects
  | 'object'
  | 'theme'; // Visual theme selector

export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropertyType;
  description?: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: Array<{ value: any; label: string }>; // For select type
  arrayItemType?: 'string' | 'object'; // For array types
  objectSchema?: PropertyDefinition[]; // For object and array-object types
  placeholder?: string;
  helperText?: string;
}

export interface ComponentPropertySchema {
  componentType: string;
  componentName: string;
  category: 'interactive';
  icon: string;
  suitableAgeStyles?: AgeStyleName[]; // Which age styles are suitable for this component
  properties: PropertyDefinition[];
}

/**
 * All interactive component property schemas
 */
export const INTERACTIVE_PROPERTIES_SCHEMAS: ComponentPropertySchema[] = [
  // 1. Tap Image
  {
    componentType: 'tap-image',
    componentName: 'Tap Image',
    category: 'interactive',
    icon: '👆',
    suitableAgeStyles: ['toddler', 'preschool', 'elementary'], // Simple component - only for younger kids
    properties: [
      {
        key: 'ageStyle',
        label: 'Age Style',
        type: 'select',
        default: 'preschool',
        options: [
          { value: 'toddler', label: '🐣 Toddler (3-5) - Extra large, simple' },
          { value: 'preschool', label: '🎨 Preschool (6-7) - Large, playful' },
          { value: 'elementary', label: '📚 Elementary (8-9) - Medium, structured' },
        ],
        helperText: 'Visual style optimized for different age groups',
      },
      {
        key: 'imageUrl',
        label: 'Image URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.com/image.jpg',
        helperText: 'URL of the image to display',
      },
      {
        key: 'caption',
        label: 'Caption',
        type: 'string',
        placeholder: 'Tap me!',
        helperText: 'Text shown below the image',
      },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small (200px)' },
          { value: 'medium', label: 'Medium (350px)' },
          { value: 'large', label: 'Large (500px)' },
        ],
      },
      {
        key: 'animation',
        label: 'Animation',
        type: 'select',
        default: 'bounce',
        options: [
          { value: 'bounce', label: 'Bounce' },
          { value: 'scale', label: 'Scale' },
          { value: 'shake', label: 'Shake' },
          { value: 'spin', label: 'Spin' },
        ],
      },
      {
        key: 'soundEffect',
        label: 'Sound Effect',
        type: 'select',
        default: 'praise',
        options: [
          { value: 'praise', label: 'Praise' },
          { value: 'animal', label: 'Animal' },
          { value: 'action', label: 'Action' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        key: 'showHint',
        label: 'Show Hint',
        type: 'boolean',
        default: false,
        helperText: 'Display animated hand hint',
      },
    ],
  },

  // 2. Simple Drag and Drop
  {
    componentType: 'simple-drag-drop',
    componentName: 'Drag and Drop',
    category: 'interactive',
    icon: '🎯',
    suitableAgeStyles: ['toddler', 'preschool', 'elementary', 'middle', 'teen'], // Works for all ages
    properties: [
      {
        key: 'ageStyle',
        label: 'Age Style',
        type: 'select',
        default: 'elementary',
        options: [
          { value: 'toddler', label: '🐣 Toddler (3-5) - Extra large, simple' },
          { value: 'preschool', label: '🎨 Preschool (6-7) - Large, playful' },
          { value: 'elementary', label: '📚 Elementary (8-9) - Medium, structured' },
          { value: 'middle', label: '🎯 Middle School (10-13) - Standard' },
          { value: 'teen', label: '🎓 Teen (14-18) - Compact, minimal' },
        ],
        helperText: 'Visual style optimized for different age groups',
      },
      {
        key: 'items',
        label: 'Draggable Items',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
          { key: 'correctTarget', label: 'Correct Target ID', type: 'string', required: true },
          { key: 'label', label: 'Label', type: 'string' },
        ],
      },
      {
        key: 'targets',
        label: 'Drop Targets',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'label', label: 'Label', type: 'string', required: true },
          { key: 'backgroundColor', label: 'Background Color', type: 'color' },
        ],
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
          { value: 'grid', label: 'Grid' },
        ],
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (with hints)' },
          { value: 'medium', label: 'Medium (no hints)' },
        ],
      },
      {
        key: 'snapDistance',
        label: 'Snap Distance (px)',
        type: 'number',
        default: 80,
        min: 50,
        max: 200,
        helperText: 'Distance at which items snap to targets',
      },
    ],
  },

  // 3. Color Matcher
  {
    componentType: 'color-matcher',
    componentName: 'Color Matcher',
    category: 'interactive',
    icon: '🎨',
    suitableAgeStyles: ['toddler', 'preschool', 'elementary'], // Simple matching - for younger kids
    properties: [
      {
        key: 'colors',
        label: 'Colors',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'hex', label: 'Hex Color', type: 'color', required: true },
          { key: 'voicePrompt', label: 'Voice Prompt', type: 'string' },
        ],
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'single',
        options: [
          { value: 'single', label: 'Single (one at a time)' },
          { value: 'multiple', label: 'Multiple (all at once)' },
        ],
      },
      {
        key: 'showNames',
        label: 'Show Color Names',
        type: 'boolean',
        default: true,
      },
      {
        key: 'autoVoice',
        label: 'Auto Voice Prompts',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 4. Simple Counter
  {
    componentType: 'simple-counter',
    componentName: 'Counter',
    category: 'interactive',
    icon: '🔢',
    suitableAgeStyles: ['preschool', 'elementary', 'middle'], // Counting - medium complexity
    properties: [
      {
        key: 'objects',
        label: 'Objects to Count',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
          { key: 'count', label: 'Count', type: 'number', required: true, min: 1, max: 20 },
        ],
      },
      {
        key: 'voiceEnabled',
        label: 'Voice Enabled',
        type: 'boolean',
        default: true,
      },
      {
        key: 'celebrationAtEnd',
        label: 'Celebration at End',
        type: 'boolean',
        default: true,
      },
      {
        key: 'showProgress',
        label: 'Show Progress',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 5. Memory Cards
  {
    componentType: 'memory-cards',
    componentName: 'Memory Cards',
    category: 'interactive',
    icon: '🃏',
    properties: [
      {
        key: 'pairs',
        label: 'Card Pairs',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
        ],
      },
      {
        key: 'gridSize',
        label: 'Grid Size',
        type: 'select',
        default: '2x2',
        options: [
          { value: '2x2', label: '2x2 (2 pairs)' },
          { value: '2x3', label: '2x3 (3 pairs)' },
          { value: '3x4', label: '3x4 (6 pairs)' },
          { value: '4x4', label: '4x4 (8 pairs)' },
        ],
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (slower flips)' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard (faster flips)' },
        ],
      },
      {
        key: 'cardBackImage',
        label: 'Card Back Image URL',
        type: 'url',
        placeholder: 'Leave empty for default pattern',
      },
    ],
  },

  // 6. Sorting Game
  {
    componentType: 'sorting-game',
    componentName: 'Sorting Game',
    category: 'interactive',
    icon: '📦',
    properties: [
      {
        key: 'items',
        label: 'Items to Sort',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
          { key: 'category', label: 'Category ID', type: 'string', required: true },
          { key: 'label', label: 'Label', type: 'string' },
        ],
      },
      {
        key: 'categories',
        label: 'Categories',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'color', label: 'Color', type: 'color', required: true },
          { key: 'icon', label: 'Icon (emoji)', type: 'string' },
        ],
      },
      {
        key: 'sortBy',
        label: 'Sort By',
        type: 'select',
        default: 'type',
        options: [
          { value: 'type', label: 'Type/Category' },
          { value: 'color', label: 'Color' },
          { value: 'size', label: 'Size' },
        ],
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
      },
    ],
  },

  // 7. Sequence Builder
  {
    componentType: 'sequence-builder',
    componentName: 'Sequence Builder',
    category: 'interactive',
    icon: '🔢',
    properties: [
      {
        key: 'steps',
        label: 'Sequence Steps',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
          { key: 'order', label: 'Correct Order', type: 'number', required: true, min: 1 },
          { key: 'label', label: 'Label', type: 'string' },
        ],
      },
      {
        key: 'instruction',
        label: 'Instruction',
        type: 'string',
        default: 'Put the pictures in the right order!',
      },
      {
        key: 'showNumbers',
        label: 'Show Numbers',
        type: 'boolean',
        default: true,
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (3-4 steps)' },
          { value: 'medium', label: 'Medium (5-6 steps)' },
          { value: 'hard', label: 'Hard (7+ steps)' },
        ],
      },
    ],
  },

  // 8. Shape Tracer
  {
    componentType: 'shape-tracer',
    componentName: 'Shape Tracer',
    category: 'interactive',
    icon: '✏️',
    properties: [
      {
        key: 'shapePath',
        label: 'SVG Path',
        type: 'string',
        required: true,
        placeholder: 'M 100,50 L 200,50 L 200,150 L 100,150 Z',
        helperText: 'SVG path data for the shape',
      },
      {
        key: 'shapeName',
        label: 'Shape Name',
        type: 'string',
        required: true,
        placeholder: 'Square',
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (simple shapes)' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard (complex shapes)' },
        ],
      },
      {
        key: 'strokeWidth',
        label: 'Stroke Width',
        type: 'number',
        default: 8,
        min: 4,
        max: 20,
      },
      {
        key: 'guideColor',
        label: 'Guide Color',
        type: 'color',
        default: '#3B82F6',
      },
      {
        key: 'traceColor',
        label: 'Trace Color',
        type: 'color',
        default: '#10B981',
      },
    ],
  },

  // 9. Emotion Recognizer
  {
    componentType: 'emotion-recognizer',
    componentName: 'Emotion Recognizer',
    category: 'interactive',
    icon: '😊',
    properties: [
      {
        key: 'emotions',
        label: 'Emotions',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'emoji', label: 'Emoji', type: 'string', required: true },
          { key: 'description', label: 'Description', type: 'string' },
        ],
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'identify',
        options: [
          { value: 'identify', label: 'Identify (tap to select)' },
          { value: 'match', label: 'Match (drag and drop)' },
        ],
      },
      {
        key: 'showDescriptions',
        label: 'Show Descriptions',
        type: 'boolean',
        default: true,
      },
      {
        key: 'voiceEnabled',
        label: 'Voice Prompts',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 10. Sound Matcher
  {
    componentType: 'sound-matcher',
    componentName: 'Sound Matcher',
    category: 'interactive',
    icon: '🔊',
    properties: [
      {
        key: 'items',
        label: 'Sound Items',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
          { key: 'soundText', label: 'Sound Text', type: 'string', required: true, helperText: 'Text to be spoken' },
          { key: 'label', label: 'Label', type: 'string' },
        ],
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'identify',
        options: [
          { value: 'identify', label: 'Identify (listen and tap)' },
          { value: 'match', label: 'Match (match sound to image)' },
        ],
      },
      {
        key: 'autoPlayFirst',
        label: 'Auto Play First',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 11. Simple Puzzle
  {
    componentType: 'simple-puzzle',
    componentName: 'Puzzle',
    category: 'interactive',
    icon: '🧩',
    properties: [
      {
        key: 'imageUrl',
        label: 'Image URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.com/puzzle-image.jpg',
      },
      {
        key: 'pieces',
        label: 'Number of Pieces',
        type: 'select',
        default: 4,
        options: [
          { value: 4, label: '4 pieces (2x2)' },
          { value: 6, label: '6 pieces (2x3)' },
          { value: 9, label: '9 pieces (3x3)' },
          { value: 12, label: '12 pieces (3x4)' },
        ],
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (with outline)' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard (no hints)' },
        ],
      },
      {
        key: 'showOutline',
        label: 'Show Outline',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 12. Pattern Builder
  {
    componentType: 'pattern-builder',
    componentName: 'Pattern Builder',
    category: 'interactive',
    icon: '🔷',
    properties: [
      {
        key: 'pattern',
        label: 'Pattern Elements',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'color', label: 'Color', type: 'color', required: true },
        ],
      },
      {
        key: 'patternType',
        label: 'Pattern Type',
        type: 'select',
        default: 'color',
        options: [
          { value: 'color', label: 'Color Pattern' },
          { value: 'shape', label: 'Shape Pattern' },
          { value: 'both', label: 'Color & Shape' },
        ],
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy (2 elements)' },
          { value: 'medium', label: 'Medium (3 elements)' },
          { value: 'hard', label: 'Hard (4+ elements)' },
        ],
      },
      {
        key: 'repetitions',
        label: 'Repetitions',
        type: 'number',
        default: 2,
        min: 1,
        max: 5,
        helperText: 'How many times the pattern repeats',
      },
    ],
  },

  // 13. Cause Effect Game
  {
    componentType: 'cause-effect',
    componentName: 'Cause & Effect',
    category: 'interactive',
    icon: '🔗',
    properties: [
      {
        key: 'pairs',
        label: 'Cause-Effect Pairs',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { 
            key: 'cause', 
            label: 'Cause', 
            type: 'object', 
            required: true,
            objectSchema: [
              { key: 'emoji', label: 'Emoji', type: 'string', required: true },
              { key: 'text', label: 'Text', type: 'string', required: true },
            ],
          },
          { 
            key: 'effect', 
            label: 'Effect', 
            type: 'object', 
            required: true,
            objectSchema: [
              { key: 'emoji', label: 'Emoji', type: 'string', required: true },
              { key: 'text', label: 'Text', type: 'string', required: true },
            ],
          },
        ],
      },
      {
        key: 'showText',
        label: 'Show Text Labels',
        type: 'boolean',
        default: true,
      },
      {
        key: 'voiceEnabled',
        label: 'Voice Prompts',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 14. Reward Collector
  {
    componentType: 'reward-collector',
    componentName: 'Reward Collector',
    category: 'interactive',
    icon: '⭐',
    properties: [
      {
        key: 'tasks',
        label: 'Tasks',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'text', label: 'Task Text', type: 'string', required: true },
          { key: 'emoji', label: 'Emoji', type: 'string' },
        ],
      },
      {
        key: 'rewardTitle',
        label: 'Reward Title',
        type: 'string',
        default: 'Great Job!',
      },
      {
        key: 'rewardEmoji',
        label: 'Reward Emoji',
        type: 'string',
        default: '🎁',
      },
      {
        key: 'starsPerTask',
        label: 'Stars Per Task',
        type: 'number',
        default: 1,
        min: 1,
        max: 5,
      },
    ],
  },

  // 15. Voice Recorder
  {
    componentType: 'voice-recorder',
    componentName: 'Voice Recorder',
    category: 'interactive',
    icon: '🎤',
    suitableAgeStyles: ['elementary', 'middle', 'teen'], // Recording - for older kids
    properties: [
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'string',
        required: true,
        default: 'Record your voice!',
        placeholder: 'Tell me about your day!',
      },
      {
        key: 'maxDuration',
        label: 'Max Duration (seconds)',
        type: 'number',
        default: 30,
        min: 5,
        max: 120,
      },
      {
        key: 'showPlayback',
        label: 'Show Playback',
        type: 'boolean',
        default: true,
      },
      {
        key: 'autoPlay',
        label: 'Auto Play Recording',
        type: 'boolean',
        default: false,
      },
    ],
  },

  // 16. Flashcards
  {
    componentType: 'flashcards',
    componentName: 'Flashcards',
    category: 'interactive',
    icon: '🎴',
    properties: [
      {
        key: 'cards',
        label: 'Cards',
        type: 'array-object',
        required: true,
        objectSchema: [
          {
            key: 'front',
            label: 'Front Side',
            type: 'object',
            required: true,
            objectSchema: [
              { key: 'text', label: 'Text', type: 'string' },
              { key: 'imageUrl', label: 'Image URL', type: 'url' },
            ],
          },
          {
            key: 'back',
            label: 'Back Side',
            type: 'object',
            required: true,
            objectSchema: [
              { key: 'text', label: 'Text', type: 'string' },
              { key: 'imageUrl', label: 'Image URL', type: 'url' },
            ],
          },
        ],
      },
      {
        key: 'cardSize',
        label: 'Card Size',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
      {
        key: 'autoFlip',
        label: 'Auto Flip',
        type: 'boolean',
        default: false,
        helperText: 'Automatically flip cards after a delay',
      },
      {
        key: 'showNavigation',
        label: 'Show Navigation',
        type: 'boolean',
        default: true,
        helperText: 'Show previous/next buttons',
      },
      {
        key: 'flipDirection',
        label: 'Flip Direction',
        type: 'select',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
      },
    ],
  },

  // 17. Word Builder
  {
    componentType: 'word-builder',
    componentName: 'Word Builder',
    category: 'interactive',
    icon: '✍️',
    properties: [
      {
        key: 'targetWord',
        label: 'Target Word',
        type: 'string',
        required: true,
        placeholder: 'ELEPHANT',
        helperText: 'The word students need to spell',
      },
      {
        key: 'shuffledLetters',
        label: 'Letters to Use',
        type: 'array-simple',
        helperText: 'Leave empty to use letters from target word',
      },
      {
        key: 'showHints',
        label: 'Show Hints',
        type: 'boolean',
        default: true,
        helperText: 'Allow students to see hints',
      },
      {
        key: 'mode',
        label: 'Interaction Mode',
        type: 'select',
        default: 'buttons',
        options: [
          { value: 'drag-drop', label: 'Drag and Drop' },
          { value: 'buttons', label: 'Tap Buttons' },
          { value: 'keyboard', label: 'Keyboard Input' },
        ],
      },
      {
        key: 'imageHint',
        label: 'Image Hint URL',
        type: 'url',
        placeholder: 'https://example.com/elephant.jpg',
        helperText: 'Optional image to help students',
      },
    ],
  },

  // 18. Open Question
  {
    componentType: 'open-question',
    componentName: 'Open Question',
    category: 'interactive',
    icon: '💭',
    properties: [
      {
        key: 'question',
        label: 'Question',
        type: 'string',
        required: true,
        placeholder: 'Describe your favorite animal and why you like it.',
        helperText: 'The open-ended question for students',
      },
      {
        key: 'expectedKeywords',
        label: 'Expected Keywords',
        type: 'array-simple',
        helperText: 'Keywords AI will look for in answers',
      },
      {
        key: 'maxLength',
        label: 'Max Length',
        type: 'number',
        default: 500,
        min: 50,
        max: 2000,
        helperText: 'Maximum character count',
      },
      {
        key: 'enableVoiceInput',
        label: 'Enable Voice Input',
        type: 'boolean',
        default: false,
        helperText: 'Allow students to use voice-to-text',
      },
      {
        key: 'feedbackType',
        label: 'Feedback Type',
        type: 'select',
        default: 'encouraging',
        options: [
          { value: 'encouraging', label: 'Encouraging (warm & positive)' },
          { value: 'detailed', label: 'Detailed (comprehensive)' },
          { value: 'concise', label: 'Concise (brief & direct)' },
        ],
      },
    ],
  },

  // 19. Drawing Canvas
  {
    componentType: 'drawing-canvas',
    componentName: 'Drawing Canvas',
    category: 'interactive',
    icon: '🎨',
    properties: [
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'url',
        placeholder: 'https://example.com/coloring-page.jpg',
        helperText: 'Optional background image to draw on',
      },
      {
        key: 'canvasSize',
        label: 'Canvas Size',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small (400x300)' },
          { value: 'medium', label: 'Medium (600x450)' },
          { value: 'large', label: 'Large (800x600)' },
        ],
      },
      {
        key: 'tools',
        label: 'Available Tools',
        type: 'array-simple',
        default: ['brush', 'eraser'],
        helperText: 'Tools: brush, eraser, fill',
      },
      {
        key: 'colorPalette',
        label: 'Color Palette',
        type: 'array-simple',
        default: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
        helperText: 'Hex color codes',
      },
      {
        key: 'brushSizes',
        label: 'Brush Sizes',
        type: 'array-simple',
        default: ['2', '5', '10', '15', '20'],
        helperText: 'Available brush sizes in pixels',
      },
    ],
  },

  // 20. Dialog Roleplay
  {
    componentType: 'dialog-roleplay',
    componentName: 'Dialog Roleplay',
    category: 'interactive',
    icon: '💬',
    properties: [
      {
        key: 'dialogTree',
        label: 'Dialog Tree',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'Node ID', type: 'string', required: true },
          { key: 'character', label: 'Character Name', type: 'string', required: true },
          { key: 'text', label: 'Dialog Text', type: 'string', required: true },
          {
            key: 'options',
            label: 'Response Options',
            type: 'array-object',
            required: true,
            objectSchema: [
              { key: 'id', label: 'Option ID', type: 'string', required: true },
              { key: 'text', label: 'Option Text', type: 'string', required: true },
              { key: 'nextNodeId', label: 'Next Node ID', type: 'string' },
              { key: 'isCorrect', label: 'Is Correct', type: 'boolean' },
              { key: 'points', label: 'Points', type: 'number' },
            ],
          },
          { key: 'isFinal', label: 'Is Final Node', type: 'boolean' },
        ],
      },
      {
        key: 'characters',
        label: 'Characters',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'avatar', label: 'Avatar URL', type: 'url', required: true },
          { key: 'voice', label: 'Voice', type: 'string' },
        ],
      },
      {
        key: 'showHints',
        label: 'Show Hints',
        type: 'boolean',
        default: true,
      },
      {
        key: 'enableVoice',
        label: 'Enable Voice',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 21. Interactive Map
  {
    componentType: 'interactive-map',
    componentName: 'Interactive Map',
    category: 'interactive',
    icon: '🗺️',
    properties: [
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'url',
        required: true,
        placeholder: 'https://example.com/map.jpg',
      },
      {
        key: 'hotspots',
        label: 'Hotspots',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'x', label: 'X Position (%)', type: 'number', required: true, min: 0, max: 100 },
          { key: 'y', label: 'Y Position (%)', type: 'number', required: true, min: 0, max: 100 },
          { key: 'width', label: 'Width (%)', type: 'number', required: true, min: 1, max: 50 },
          { key: 'height', label: 'Height (%)', type: 'number', required: true, min: 1, max: 50 },
          { key: 'label', label: 'Label', type: 'string', required: true },
          { key: 'info', label: 'Information', type: 'string', required: true },
          { key: 'isCorrect', label: 'Is Correct (quiz mode)', type: 'boolean' },
        ],
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'learning',
        options: [
          { value: 'learning', label: 'Learning (explore mode)' },
          { value: 'quiz', label: 'Quiz (test mode)' },
        ],
      },
      {
        key: 'showLabels',
        label: 'Show Labels',
        type: 'boolean',
        default: true,
      },
    ],
  },

  // 22. Timer Challenge
  {
    componentType: 'timer-challenge',
    componentName: 'Timer Challenge',
    category: 'interactive',
    icon: '⏱️',
    properties: [
      {
        key: 'duration',
        label: 'Duration (seconds)',
        type: 'number',
        required: true,
        default: 60,
        min: 10,
        max: 600,
      },
      {
        key: 'challengeType',
        label: 'Challenge Type',
        type: 'select',
        default: 'answer-questions',
        options: [
          { value: 'find-items', label: 'Find Items' },
          { value: 'answer-questions', label: 'Answer Questions' },
          { value: 'complete-task', label: 'Complete Task' },
        ],
      },
      {
        key: 'items',
        label: 'Challenge Items',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'question', label: 'Question', type: 'string', required: true },
          { key: 'answer', label: 'Answer', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
        ],
      },
      {
        key: 'showProgress',
        label: 'Show Progress Bar',
        type: 'boolean',
        default: true,
      },
      {
        key: 'bonusTime',
        label: 'Bonus Time per Correct Answer (seconds)',
        type: 'number',
        default: 5,
        min: 0,
        max: 30,
      },
    ],
  },

  // 23. Timeline Builder
  {
    componentType: 'timeline-builder',
    componentName: 'Timeline Builder',
    category: 'interactive',
    icon: '📅',
    properties: [
      {
        key: 'events',
        label: 'Timeline Events',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'date', label: 'Date', type: 'string', required: true },
          { key: 'title', label: 'Title', type: 'string', required: true },
          { key: 'description', label: 'Description', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'order', label: 'Correct Order', type: 'number', required: true, min: 1 },
        ],
      },
      {
        key: 'timelineType',
        label: 'Timeline Type',
        type: 'select',
        default: 'linear',
        options: [
          { value: 'linear', label: 'Linear (horizontal)' },
          { value: 'circular', label: 'Circular (vertical)' },
        ],
      },
      {
        key: 'showDates',
        label: 'Show Dates',
        type: 'boolean',
        default: true,
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        default: 'easy',
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ],
  },

  // 24. Story Builder
  {
    componentType: 'story-builder',
    componentName: 'Story Builder',
    category: 'interactive',
    icon: '📚',
    properties: [
      {
        key: 'characters',
        label: 'Characters',
        type: 'array-object',
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'type', label: 'Type', type: 'string', default: 'character' },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'description', label: 'Description', type: 'string', required: true },
        ],
      },
      {
        key: 'settings',
        label: 'Settings',
        type: 'array-object',
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'type', label: 'Type', type: 'string', default: 'setting' },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'description', label: 'Description', type: 'string', required: true },
        ],
      },
      {
        key: 'items',
        label: 'Items',
        type: 'array-object',
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'type', label: 'Type', type: 'string', default: 'item' },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'description', label: 'Description', type: 'string', required: true },
        ],
      },
      {
        key: 'events',
        label: 'Events',
        type: 'array-object',
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'type', label: 'Type', type: 'string', default: 'event' },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'description', label: 'Description', type: 'string', required: true },
        ],
      },
      {
        key: 'enableAI',
        label: 'Enable AI Story Generation',
        type: 'boolean',
        default: false,
        helperText: 'Use AI to generate more sophisticated stories',
      },
      {
        key: 'minSelections',
        label: 'Minimum Selections',
        type: 'number',
        default: 3,
        min: 1,
        max: 10,
      },
    ],
  },

  // 25. Categorization Grid
  {
    componentType: 'categorization-grid',
    componentName: 'Categorization Grid',
    category: 'interactive',
    icon: '🗂️',
    properties: [
      {
        key: 'items',
        label: 'Items to Categorize',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'imageUrl', label: 'Image URL', type: 'url' },
          { key: 'correctCategory', label: 'Correct Category ID', type: 'string', required: true },
        ],
      },
      {
        key: 'categories',
        label: 'Categories',
        type: 'array-object',
        required: true,
        objectSchema: [
          { key: 'id', label: 'ID', type: 'string', required: true },
          { key: 'name', label: 'Name', type: 'string', required: true },
          { key: 'color', label: 'Color', type: 'color', required: true },
          { key: 'icon', label: 'Icon (emoji)', type: 'string' },
        ],
      },
      {
        key: 'gridSize',
        label: 'Grid Size',
        type: 'select',
        default: '3x3',
        options: [
          { value: '2x2', label: '2x2 Grid' },
          { value: '3x3', label: '3x3 Grid' },
          { value: '4x4', label: '4x4 Grid' },
        ],
      },
      {
        key: 'showHints',
        label: 'Show Hints',
        type: 'boolean',
        default: false,
      },
    ],
  },

  // 26. Interactive Board
  {
    componentType: 'interactive-board',
    componentName: 'Interactive Board',
    category: 'interactive',
    icon: '🎨',
    properties: [
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'url',
        placeholder: 'https://example.com/board-bg.jpg',
        helperText: 'Optional background for the board',
      },
      {
        key: 'allowedStickerTypes',
        label: 'Allowed Sticker Types',
        type: 'array-simple',
        default: ['text', 'emoji', 'image'],
        helperText: 'Types: text, emoji, image',
      },
      {
        key: 'maxStickers',
        label: 'Maximum Stickers',
        type: 'number',
        default: 50,
        min: 10,
        max: 200,
      },
      {
        key: 'boardSize',
        label: 'Board Size',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small (600x400)' },
          { value: 'medium', label: 'Medium (900x600)' },
          { value: 'large', label: 'Large (1200x800)' },
        ],
      },
    ],
  },

  // 27. Object Builder
  {
    componentType: 'object-builder',
    componentName: 'Object Builder',
    category: 'interactive',
    icon: '🧱',
    properties: [
      {
        key: 'targetObject',
        label: 'Target Object',
        type: 'object',
        required: true,
        objectSchema: [
          { key: 'targetName', label: 'Object Name', type: 'string', required: true },
          {
            key: 'parts',
            label: 'Building Parts',
            type: 'array-object',
            required: true,
            objectSchema: [
              { key: 'id', label: 'ID', type: 'string', required: true },
              { key: 'name', label: 'Part Name', type: 'string', required: true },
              { key: 'color', label: 'Color', type: 'color', required: true },
              {
                key: 'shape',
                label: 'Shape',
                type: 'select',
                required: true,
                options: [
                  { value: 'square', label: 'Square' },
                  { value: 'rectangle', label: 'Rectangle' },
                  { value: 'circle', label: 'Circle' },
                  { value: 'triangle', label: 'Triangle' },
                ],
              },
              { key: 'size', label: 'Size (px)', type: 'number', required: true, min: 20, max: 200 },
              { key: 'requiredPosition', label: 'Required Position', type: 'number' },
            ],
          },
          { key: 'completionMessage', label: 'Completion Message', type: 'string' },
        ],
      },
      {
        key: 'showGuide',
        label: 'Show Guide',
        type: 'boolean',
        default: true,
        helperText: 'Show preview of target object',
      },
      {
        key: 'allowFreeform',
        label: 'Allow Freeform Building',
        type: 'boolean',
        default: false,
        helperText: 'Allow any order of parts (no strict validation)',
      },
    ],
  },

  // Magnetic Playground (Toddlers 3-5 ONLY)
  // Note: This component uses a specialized editor (MagneticPlaygroundEditor)
  // The schema here is just for reference; actual editing is done through the custom UI
  {
    componentType: 'magnetic-playground',
    componentName: 'Magnetic Playground (3-5 years)',
    category: 'interactive',
    icon: '🧲',
    suitableAgeStyles: ['toddler'], // Specifically designed for toddlers (3-5 years ONLY)
    properties: [], // Properties are managed by MagneticPlaygroundEditor
  },
];

/**
 * Universal theme property definition
 * Can be added to any component
 */
export const THEME_PROPERTY: PropertyDefinition = {
  key: 'theme',
  label: 'Visual Theme',
  type: 'theme',
  description: 'Visual theme affects colors, typography, spacing, and animations',
  required: false,
  helperText: 'Select a visual theme for this component',
};

/**
 * Get property schema for a component type
 * Note: Theme property is handled separately in RightSidebar, not included in schema
 */
export function getComponentPropertySchema(
  componentType: string
): ComponentPropertySchema | undefined {
  const schema = INTERACTIVE_PROPERTIES_SCHEMAS.find(
    (schema) => schema.componentType === componentType
  );

  return schema;
}

/**
 * Check if a component type is interactive
 */
export function isInteractiveComponent(componentType: string): boolean {
  return INTERACTIVE_PROPERTIES_SCHEMAS.some(
    (schema) => schema.componentType === componentType
  );
}

/**
 * Get all interactive component schemas
 * Note: Theme property is handled separately in RightSidebar, not included in schemas
 */
export function getAllInteractiveSchemas(): ComponentPropertySchema[] {
  return INTERACTIVE_PROPERTIES_SCHEMAS;
}

