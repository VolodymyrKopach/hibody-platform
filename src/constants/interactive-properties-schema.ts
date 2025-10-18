/**
 * Property schemas for interactive components
 * Defines editable properties for each interactive component type
 */

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'color' 
  | 'url' 
  | 'select' 
  | 'array-simple' // Array of strings
  | 'array-object' // Array of objects
  | 'object';

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
    properties: [
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
    properties: [
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
];

/**
 * Get property schema for a component type
 */
export function getComponentPropertySchema(
  componentType: string
): ComponentPropertySchema | undefined {
  return INTERACTIVE_PROPERTIES_SCHEMAS.find(
    (schema) => schema.componentType === componentType
  );
}

/**
 * Check if a component type is interactive
 */
export function isInteractiveComponent(componentType: string): boolean {
  return INTERACTIVE_PROPERTIES_SCHEMAS.some(
    (schema) => schema.componentType === componentType
  );
}

