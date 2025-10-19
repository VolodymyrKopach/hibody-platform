/**
 * Service for AI-powered worksheet generation using Gemini 2.5 Flash
 * Generates complete worksheets with educational components based on topic and age group
 */

import { GoogleGenAI } from '@google/genai';
import {
  WorksheetGenerationRequest,
  WorksheetGenerationResponse,
  GeneratedPage,
  AIGenerationOptions,
  GeneratedElement,
} from '@/types/worksheet-generation';
import { worksheetComponentSchemaService } from './WorksheetComponentSchemaService';
import { ContentPaginationService, PAGE_CONFIGS } from './ContentPaginationService';
import { ageBasedContentService, type Duration as AgeDuration } from './AgeBasedContentService';
import { tokenTrackingService } from '@/services/tokenTrackingService';

export class GeminiWorksheetGenerationService {
  private client: GoogleGenAI;
  private paginationService: ContentPaginationService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.paginationService = new ContentPaginationService(PAGE_CONFIGS.A4);
  }

  /**
   * Generate complete worksheet with AI
   */
  async generateWorksheet(
    request: WorksheetGenerationRequest,
    options: AIGenerationOptions = {},
    userId?: string
  ): Promise<WorksheetGenerationResponse> {
    console.log('🎯 [WORKSHEET_GEN] Starting worksheet generation (AUTO-PAGINATION):', {
      topic: request.topic,
      ageGroup: request.ageGroup,
      duration: request.duration || 'standard',
    });

    try {
      // Build prompt with component library and educational guidelines
      // AI generates all content without page breaks
      const prompt = this.buildGenerationPrompt(request);

      // Call Gemini API - AI generates one big content list
      const response = await this.callGeminiAPI(prompt, options, userId);

      // Parse response to get all elements
      const allElements = this.parseGeminiResponseToElements(response, request);

      // === Validate component count for age group ===
      const validation = ageBasedContentService.validateComponentCount(
        request.ageGroup,
        request.duration as AgeDuration || 'standard',
        allElements.length
      );
      
      if (!validation.valid) {
        console.warn('⚠️ [WORKSHEET_GEN] Component count validation:', validation.reason);
        console.warn(`   Suggested: ${validation.suggestion}, Actual: ${allElements.length}`);
      } else {
        console.log('✅ [WORKSHEET_GEN] Component count appropriate for age group');
      }

      // Smart auto-pagination - distribute elements across pages
      console.log('📄 [WORKSHEET_GEN] Auto-paginating content...');
      // Set age range for proper component sizing
      this.paginationService.setAgeRange(request.ageGroup);
      // Set content mode for page type (pdf or interactive)
      const contentMode = request.contentMode || 'pdf';
      this.paginationService.setContentMode(contentMode);
      const paginationResult = this.paginationService.paginateContent(
        allElements
        // No title passed - pages will be named "Page 1", "Page 2", etc.
      );

      // Build final response with paginated content
      // Add ageGroup to each page for age-appropriate styling
      const pagesWithAgeGroup = paginationResult.pages.map(page => ({
        ...page,
        ageGroup: request.ageGroup,
      }));
      
      const finalResponse: WorksheetGenerationResponse = {
        pages: pagesWithAgeGroup,
        metadata: {
          topic: request.topic,
          ageGroup: request.ageGroup,
          difficulty: request.difficulty || 'medium',
          language: request.language || 'en',
          pageCount: paginationResult.totalPages,
          generatedAt: new Date().toISOString(),
          componentsUsed: this.getComponentTypesUsed(allElements),
          estimatedDuration: this.estimateDurationFromElements(allElements),
          autoPaginated: true,
          contentMode: request.contentMode || 'pdf',
        },
      };

      console.log('✅ [WORKSHEET_GEN] Generation successful (AUTO-PAGINATED):', {
        totalElements: allElements.length,
        totalPages: paginationResult.totalPages,
        elementsPerPage: paginationResult.elementsPerPage.join(', '),
        totalComponents: paginationResult.pages.reduce((sum, p) => sum + p.elements.length, 0),
      });

      return finalResponse;
    } catch (error) {
      console.error('❌ [WORKSHEET_GEN] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Get interactive component schemas for AI
   */
  private getInteractiveComponentSchemas() {
    return [
      {
        id: 'tap-image',
        name: 'Tap Image',
        category: 'Interactive',
        description: 'Interactive image that responds to taps with sounds and animations',
        useCases: ['Animal sounds', 'Object recognition', 'Cause-effect learning'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          imagePrompt: { required: true, description: 'Detailed prompt for AI image generation. Be descriptive and child-friendly (e.g., "friendly cartoon cat with orange fur, big eyes, sitting and smiling, educational illustration for children aged 4-6")' },
          caption: { required: true, description: 'Simple text caption (1-3 words for 2-3 years)' },
          size: { required: false, default: 'medium', enum: ['small', 'medium', 'large'], description: 'Image size' },
          animation: { required: false, default: 'bounce', enum: ['bounce', 'scale', 'shake', 'spin'], description: 'Animation on tap' },
          soundEffect: { required: false, enum: ['animal', 'action', 'praise'], description: 'Sound effect type' },
          showHint: { required: false, default: true, description: 'Show animated hand hint' },
        },
        examples: [{
          properties: {
            imagePrompt: 'friendly cartoon cat with orange fur and big eyes, sitting and smiling, bright colors, educational illustration for children aged 4-6',
            caption: 'Tap the cat!',
            size: 'large',
            animation: 'bounce',
            soundEffect: 'animal',
            showHint: true,
          }
        }]
      },
      {
        id: 'simple-drag-drop',
        name: 'Simple Drag & Drop',
        category: 'Interactive',
        description: 'Drag items to matching targets with snap-to-place and feedback',
        useCases: ['Matching objects', 'Sorting', 'Categorization'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          items: { 
            required: true, 
            description: 'Array of draggable items with imagePrompt (AI generation), correctTarget, and optional label',
            examples: [[
              { id: 'item-1', imagePrompt: 'cute cartoon cat with orange fur, simple friendly design for children aged 4-6', correctTarget: 'target-1', label: 'Cat' },
              { id: 'item-2', imagePrompt: 'friendly cartoon dog with brown fur and wagging tail, simple design for kids aged 4-6', correctTarget: 'target-2', label: 'Dog' }
            ]]
          },
          targets: { 
            required: true, 
            description: 'Array of drop targets with id, label, optional imagePrompt and backgroundColor',
            examples: [[
              { id: 'target-1', label: 'Meow', backgroundColor: '#FFF9E6' },
              { id: 'target-2', label: 'Woof', backgroundColor: '#E6F4FF' }
            ]]
          },
          layout: { required: false, default: 'horizontal', enum: ['horizontal', 'vertical', 'grid'], description: 'Layout of targets' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium'], description: 'Easy mode has snap helpers' },
        }
      },
      {
        id: 'color-matcher',
        name: 'Color Matcher',
        category: 'Interactive',
        description: 'Learn colors with voice prompts and visual feedback',
        useCases: ['Color recognition', 'Color naming', 'Visual discrimination'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          colors: {
            required: true,
            description: 'Array of colors with name, hex, and voicePrompt',
            examples: [[
              { name: 'Red', hex: '#EF4444', voicePrompt: 'Find red!' },
              { name: 'Blue', hex: '#3B82F6', voicePrompt: 'Find blue!' }
            ]]
          },
          mode: { required: false, default: 'single', enum: ['single', 'multiple'], description: 'Single = one at a time, Multiple = tap all' },
          showNames: { required: false, default: true, description: 'Show color names' },
          autoVoice: { required: false, default: true, description: 'Auto-play voice prompts' },
        }
      },
      {
        id: 'simple-counter',
        name: 'Simple Counter',
        category: 'Interactive',
        description: 'Count objects with tap-to-remove and voice feedback',
        useCases: ['Number recognition', 'Counting practice', 'One-to-one correspondence'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          objects: {
            required: true,
            description: 'Array of counting objects with imagePrompt (AI generation) and target count',
            examples: [[
              { imagePrompt: 'red apple fruit with green leaf, simple cartoon style for children aged 4-6', count: 3 },
              { imagePrompt: 'colorful bouncing ball with stripes, bright colors, simple design for kids aged 4-6', count: 5 }
            ]]
          },
          voiceEnabled: { required: false, default: true, description: 'Enable voice counting' },
          celebrationAtEnd: { required: false, default: true, description: 'Celebration when done' },
          showProgress: { required: false, default: true, description: 'Show progress bar' },
        }
      },
      {
        id: 'memory-cards',
        name: 'Memory Cards',
        category: 'Interactive',
        description: 'Match pairs of images in a classic memory game',
        useCases: ['Memory training', 'Visual recognition', 'Vocabulary building', 'Concentration'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          pairs: {
            required: true,
            description: 'Array of image pairs. Each pair object has id and imagePrompt (AI generation)',
            examples: [[
              { id: 'pair-1', imagePrompt: 'friendly cartoon cat with whiskers, simple colorful design for children aged 4-6' },
              { id: 'pair-2', imagePrompt: 'happy cartoon dog with floppy ears, bright colors, simple design for kids aged 4-6' },
              { id: 'pair-3', imagePrompt: 'cute cartoon bird with colorful feathers, simple friendly style for children aged 4-6' }
            ]]
          },
          gridSize: { required: false, default: '2x3', enum: ['2x2', '2x3', '3x3', '3x4'], description: 'Grid layout for cards' },
          cardBackImage: { required: false, description: 'Optional custom image for card backs' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium'], description: 'Difficulty level' },
        }
      },
      {
        id: 'sorting-game',
        name: 'Sorting Game',
        category: 'Interactive',
        description: 'Sort items into categories with drag-and-drop',
        useCases: ['Categorization', 'Classification', 'Logic', 'Grouping'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          items: {
            required: true,
            description: 'Array of items to sort with id, imagePrompt (AI generation), category, and optional emoji',
            examples: [[
              { id: 'item-1', imagePrompt: 'red apple fruit with green leaf, simple cartoon style for children aged 4-6', category: 'fruit', emoji: '🍎' },
              { id: 'item-2', imagePrompt: 'orange carrot vegetable with green top, simple bright design for kids aged 4-6', category: 'vegetable', emoji: '🥕' }
            ]]
          },
          categories: {
            required: true,
            description: 'Array of categories with id and label',
            examples: [[
              { id: 'fruit', label: 'Fruits', color: '#FEF3C7' },
              { id: 'vegetable', label: 'Vegetables', color: '#D1FAE5' }
            ]]
          },
          sortBy: { required: false, default: 'category', enum: ['category', 'color', 'size', 'type'], description: 'Sorting criterion' },
        }
      },
      {
        id: 'sequence-builder',
        name: 'Sequence Builder',
        category: 'Interactive',
        description: 'Order images or events in the correct sequence',
        useCases: ['Sequential thinking', 'Story ordering', 'Time concepts', 'Logical progression'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          items: {
            required: true,
            description: 'Array of sequence items with id, imagePrompt (AI generation), correctPosition (0-indexed), and optional text',
            examples: [[
              { id: 'step-1', imagePrompt: 'small brown seed in soil, simple educational illustration for children aged 4-6', correctPosition: 0, text: 'Plant seed' },
              { id: 'step-2', imagePrompt: 'tiny green sprout emerging from soil with water drops, simple style for kids aged 4-6', correctPosition: 1, text: 'Water it' },
              { id: 'step-3', imagePrompt: 'beautiful blooming flower with colorful petals, simple bright design for children aged 4-6', correctPosition: 2, text: 'Flower grows' }
            ]]
          },
          showNumbers: { required: false, default: true, description: 'Show position numbers' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium'], description: 'Easy mode shows hints' },
          instruction: { required: false, description: 'Custom instruction text' },
        }
      },
      {
        id: 'shape-tracer',
        name: 'Shape Tracer',
        category: 'Interactive',
        description: 'Trace shapes with finger or mouse for motor skills',
        useCases: ['Fine motor skills', 'Shape recognition', 'Pre-writing practice', 'Hand-eye coordination'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          shapePath: {
            required: true,
            description: 'SVG path string for the shape to trace',
            examples: ['M 100,50 L 200,50 L 200,150 L 100,150 Z']
          },
          shapeName: { required: true, description: 'Name of the shape (e.g., Circle, Square, Triangle)' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium', 'hard'], description: 'Affects tolerance' },
          strokeWidth: { required: false, default: 8, description: 'Width of the tracing line' },
          guideColor: { required: false, default: '#3B82F6', description: 'Color of the guide path' },
          traceColor: { required: false, default: '#10B981', description: 'Color of the traced line' },
        }
      },
      {
        id: 'emotion-recognizer',
        name: 'Emotion Recognizer',
        category: 'Interactive',
        description: 'Identify and match emotions from faces or emojis',
        useCases: ['Emotional intelligence', 'Facial recognition', 'Social skills', 'Empathy'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          emotions: {
            required: true,
            description: 'Array of emotions with id, name, emoji, optional imageUrl and description',
            examples: [[
              { id: 'happy', name: 'Happy', emoji: '😊', description: 'Smiling and joyful' },
              { id: 'sad', name: 'Sad', emoji: '😢', description: 'Crying and upset' },
              { id: 'angry', name: 'Angry', emoji: '😠', description: 'Mad and frustrated' }
            ]]
          },
          mode: { required: false, default: 'identify', enum: ['identify', 'match'], description: 'Game mode' },
          showDescriptions: { required: false, default: true, description: 'Show emotion descriptions' },
          voiceEnabled: { required: false, default: true, description: 'Enable voice prompts' },
        }
      },
      {
        id: 'sound-matcher',
        name: 'Sound Matcher',
        category: 'Interactive',
        description: 'Match sounds to images with audio playback',
        useCases: ['Auditory discrimination', 'Sound recognition', 'Listening skills', 'Animal sounds'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          items: {
            required: true,
            description: 'Array of sound items with id, imagePrompt (AI generation), soundText (for TTS), optional soundUrl and label',
            examples: [[
              { id: 'cat', imagePrompt: 'cute cartoon cat with whiskers and big eyes, simple friendly design for children aged 4-6', soundText: 'Meow meow', label: 'Cat' },
              { id: 'dog', imagePrompt: 'happy cartoon dog with floppy ears and wagging tail, bright colors for kids aged 4-6', soundText: 'Woof woof', label: 'Dog' }
            ]]
          },
          mode: { required: false, default: 'identify', enum: ['identify', 'match'], description: 'Game mode' },
          autoPlayFirst: { required: false, default: true, description: 'Auto-play sound on start' },
        }
      },
      {
        id: 'simple-puzzle',
        name: 'Simple Puzzle',
        category: 'Interactive',
        description: 'Complete picture puzzles with 2-6 pieces',
        useCases: ['Spatial reasoning', 'Problem solving', 'Visual perception', 'Fine motor skills'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          imagePrompt: { required: true, description: 'Detailed prompt for AI image generation. Use simple, clear subjects for puzzles (animals, objects, scenes) for children aged 4-6' },
          pieces: { required: false, default: 4, enum: [2, 4, 6], description: 'Number of puzzle pieces' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium'], description: 'Easy shows outline' },
          showOutline: { required: false, default: true, description: 'Show faint image outline as guide' },
        }
      },
      {
        id: 'pattern-builder',
        name: 'Pattern Builder',
        category: 'Interactive',
        description: 'Complete repeating patterns with colors, shapes, or images',
        useCases: ['Pattern recognition', 'Logical thinking', 'Sequencing', 'Math readiness'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          pattern: {
            required: true,
            description: 'Array of pattern elements. Each has id and one of: color, emoji, imagePrompt, or shape. Use imagePrompt for AI image generation',
            examples: [[
              { id: 'red', color: '#EF4444' },
              { id: 'blue', color: '#3B82F6' },
              { id: 'apple', imagePrompt: 'simple red apple icon, flat design for children aged 4-6' }
            ]]
          },
          patternType: { required: false, default: 'color', enum: ['color', 'shape', 'image', 'emoji'], description: 'Type of pattern' },
          difficulty: { required: false, default: 'easy', enum: ['easy', 'medium'], description: '2-element vs 3-element pattern' },
          repetitions: { required: false, default: 2, description: 'How many times pattern repeats before question' },
        }
      },
      {
        id: 'cause-effect',
        name: 'Cause & Effect Game',
        category: 'Interactive',
        description: 'Match causes to their effects to learn relationships',
        useCases: ['Logical thinking', 'Cause-effect relationships', 'Critical thinking', 'Real-world connections'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          pairs: {
            required: true,
            description: 'Array of cause-effect pairs. Each has id, cause object (emoji/imagePrompt/text), effect object (emoji/imagePrompt/text). Use imagePrompt for AI image generation',
            examples: [[
              { id: 'rain-puddle', cause: { emoji: '🌧️', text: 'Rain' }, effect: { emoji: '💧', text: 'Puddles' } },
              { id: 'sun-hot', cause: { emoji: '☀️', text: 'Sun' }, effect: { emoji: '🔥', text: 'Hot' } },
              { id: 'fire-warm', cause: { imagePrompt: 'bright fire flames, warm colors, simple illustration for children aged 4-6', text: 'Fire' }, effect: { imagePrompt: 'happy person warming hands, cartoon style for kids aged 4-6', text: 'Warm' } }
            ]]
          },
          showText: { required: false, default: true, description: 'Show text labels' },
          voiceEnabled: { required: false, default: true, description: 'Enable voice feedback' },
        }
      },
      {
        id: 'reward-collector',
        name: 'Star Rewards',
        category: 'Interactive',
        description: 'Complete tasks to collect stars and earn rewards',
        useCases: ['Motivation', 'Task completion', 'Goal setting', 'Achievement tracking'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          tasks: {
            required: true,
            description: 'Array of tasks with id, text, emoji, and completed (default false)',
            examples: [[
              { id: 'task1', text: 'Say hello', emoji: '👋', completed: false },
              { id: 'task2', text: 'Count to 5', emoji: '🔢', completed: false }
            ]]
          },
          rewardTitle: { required: false, default: 'Great Job!', description: 'Title shown when all tasks complete' },
          rewardEmoji: { required: false, default: '🎁', description: 'Emoji shown as reward' },
          starsPerTask: { required: false, default: 1, description: 'Number of stars earned per task' },
        }
      },
      {
        id: 'voice-recorder',
        name: 'Voice Recorder',
        category: 'Interactive',
        description: 'Record and play back voice with microphone',
        useCases: ['Language practice', 'Self-expression', 'Speaking confidence', 'Vocabulary practice'],
        ageGroups: ['2-3', '4-6'],
        properties: {
          prompt: { required: false, default: 'Record your voice!', description: 'Prompt text for recording' },
          maxDuration: { required: false, default: 30, description: 'Maximum recording duration in seconds' },
          showPlayback: { required: false, default: true, description: 'Show playback controls' },
          autoPlay: { required: false, default: false, description: 'Auto-play recording after stopping' },
        }
      }
    ];
  }

  /**
   * Get age-specific interactive page structure guidelines
   */
  private getAgeSpecificInteractiveStructureGuidelines(ageGroup: string): string {
    // Parse age group to determine category
    const age = parseInt(ageGroup.split('-')[0]);
    
    if (age <= 5) {
      // Ages 2-3 and 3-5
      return `
**INTERACTIVE PAGE STRUCTURE FOR AGES 2-5 (TODDLERS & PRESCHOOL):**

🎯 **PAGE STRUCTURE:**
1. Giant Title with emoji (e.g., "🐶 Dogs!" or "🔴 Colors!")
2. ONE Large Interactive Component (full screen focus)

**RULES:**
- NO body text - children this age can't read yet
- NO instructions boxes - teacher/parent guides verbally
- NO images separate from interactive component
- ONE interactive activity per page maximum
- Components should be HUGE (fill most of the screen)
- Use bright colors, big buttons, simple interactions

**RECOMMENDED COMPONENTS:**
- tap-image (tap pictures to hear sounds)
- color-matcher (match colors with big buttons)
- simple-counter (count objects by tapping)
- memory-cards (2-4 cards only)
- sorting-game (2-3 categories max)
- reward-collector (simple task checklist)

**EXAMPLE PAGE:**
\`\`\`json
{
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "🐕 Find Dogs!",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "tap-image",
      "properties": {
        "imagePrompt": "friendly cartoon dog with floppy ears, sitting and smiling, bright colors, educational illustration for children aged 3-5",
        "caption": "Tap the dog!",
        "size": "large",
        "animation": "bounce",
        "soundEffect": "animal",
        "showHint": true
      }
    }
  ]
}
\`\`\`
`;
    } else if (age >= 6 && age <= 7) {
      // Ages 6-7 (early elementary)
      return `
**INTERACTIVE PAGE STRUCTURE FOR AGES 6-7 (EARLY ELEMENTARY):**

🎯 **PAGE STRUCTURE:**
1. Title (emoji + short phrase)
2. Simple Instructions (1 sentence, optional)
3. 1-2 Interactive Components
4. Optional: 1 small supporting image

**RULES:**
- Keep text VERY SHORT (max 1-2 sentences)
- Instructions should be simple: "Tap the blue shapes" or "Match the animals"
- Can have 1-2 interactive components per page
- Components should be LARGE (children have developing motor skills)
- Use visual cues and colors to guide

**RECOMMENDED COMPONENTS:**
- All components from ages 2-5, plus:
- simple-drag-and-drop (4-6 items)
- shape-tracer (trace simple shapes)
- emotion-recognizer (identify feelings)
- pattern-builder (simple patterns)
- cause-effect-game (simple cause/effect)

**EXAMPLE PAGE:**
\`\`\`json
{
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "🔵 Find Blue Things",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "instructions-box",
      "properties": {
        "text": "Tap all the blue objects!",
        "type": "activity"
      }
    },
    {
      "type": "color-matcher",
      "properties": {
        "colors": [
          { "name": "Blue", "hex": "#3B82F6", "voicePrompt": "Find blue!" },
          { "name": "Yellow", "hex": "#FCD34D", "voicePrompt": "Find yellow!" },
          { "name": "Red", "hex": "#EF4444", "voicePrompt": "Find red!" }
        ],
        "mode": "multiple",
        "showNames": true,
        "autoVoice": true
      }
    }
  ]
}
\`\`\`
`;
    } else if (age >= 8 && age <= 10) {
      // Ages 8-10 (elementary)
      return `
**INTERACTIVE PAGE STRUCTURE FOR AGES 8-10 (ELEMENTARY):**

🎯 **PAGE STRUCTURE:**
1. Title
2. Body Text (2-3 sentences explaining concept)
3. Optional Image (supporting visual)
4. Interactive Component
5. Instructions (what to do)

**RULES:**
- Can include short explanations (2-3 sentences)
- Instructions can be more detailed
- 1 main interactive component per page (or 2 smaller ones)
- Can combine text + interactive learning
- Use educational images to support concepts

**RECOMMENDED COMPONENTS:**
- All previous components, plus:
- More complex memory-cards (6-12 cards)
- sequence-builder (order events)
- More advanced sorting-game (4-5 categories)
- pattern-builder (complex patterns)
- Multiple components on same page possible

**EXAMPLE PAGE:**
\`\`\`json
{
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Animal Habitats",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "body-text",
      "properties": {
        "text": "Animals live in different places. Fish live in water, birds live in trees, and bears live in forests. Let's sort them!",
        "variant": "paragraph"
      }
    },
    {
      "type": "image-placeholder",
      "properties": {
        "imagePrompt": "Educational illustration showing different animal habitats - ocean, forest, and sky",
        "width": 400,
        "height": 250,
        "align": "center"
      }
    },
    {
      "type": "sorting-game",
      "properties": {
        "categories": [
          { "id": "water", "name": "Water", "color": "#2196F3" },
          { "id": "land", "name": "Land", "color": "#4CAF50" },
          { "id": "air", "name": "Air", "color": "#87CEEB" }
        ],
        "items": [
          { "id": "fish", "imagePrompt": "colorful fish swimming, simple cartoon style for children aged 8-10", "category": "water", "emoji": "🐟" },
          { "id": "bear", "imagePrompt": "friendly brown bear standing, cartoon educational style for kids aged 8-10", "category": "land", "emoji": "🐻" },
          { "id": "bird", "imagePrompt": "small bird with colorful feathers, simple friendly design for children aged 8-10", "category": "air", "emoji": "🐦" }
        ],
        "sortBy": "category"
      }
    }
  ]
}
\`\`\`
`;
    } else {
      // Ages 11+
      return `
**INTERACTIVE PAGE STRUCTURE FOR AGES 11+ (UPPER ELEMENTARY & MIDDLE SCHOOL):**

🎯 **PAGE STRUCTURE:**
1. Title
2. Body Text (full explanation, 3-5 sentences)
3. Multiple Interactive Components (can have 2-3)
4. Reflection Questions (optional, to think about)
5. Images and visual aids as needed

**RULES:**
- Can include detailed explanations
- Multiple interactive components per page are fine
- Can combine different types of learning activities
- Add reflection or discussion prompts
- More complex interactions and problem-solving

**RECOMMENDED COMPONENTS:**
- All previous components
- Complex combinations possible
- Multiple activities in sequence
- Can mix interactive + traditional exercises

**EXAMPLE PAGE:**
\`\`\`json
{
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "The Water Cycle",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "body-text",
      "properties": {
        "text": "Water on Earth moves in a continuous cycle. The sun heats water in oceans and lakes, causing evaporation. Water vapor rises and forms clouds (condensation). When clouds get heavy, rain falls (precipitation), returning water to Earth.",
        "variant": "paragraph"
      }
    },
    {
      "type": "sequence-builder",
      "properties": {
        "items": [
          { "id": "1", "imagePrompt": "water evaporating from ocean with sun above, simple educational diagram for children aged 11+", "correctPosition": 0, "text": "Evaporation" },
          { "id": "2", "imagePrompt": "water vapor forming white clouds in blue sky, simple diagram for kids aged 11+", "correctPosition": 1, "text": "Condensation" },
          { "id": "3", "imagePrompt": "rain falling from grey clouds to earth, educational illustration for children aged 11+", "correctPosition": 2, "text": "Precipitation" }
        ],
        "instruction": "Drag the steps in the correct order:",
        "showNumbers": true,
        "difficulty": "easy"
      }
    },
    {
      "type": "memory-cards",
      "properties": {
        "pairs": [
          { "id": "p1", "front": "Evaporation", "back": "Water turning to vapor" },
          { "id": "p2", "front": "Condensation", "back": "Vapor forming clouds" },
          { "id": "p3", "front": "Precipitation", "back": "Rain falling from clouds" }
        ],
        "gridSize": "3x2"
      }
    },
    {
      "type": "body-text",
      "properties": {
        "text": "💭 Think: How does the water cycle affect weather in your area?",
        "variant": "emphasis"
      }
    }
  ]
}
\`\`\`
`;
    }
  }

  /**
   * Build detailed prompt for Gemini with component library
   */
  private buildGenerationPrompt(request: WorksheetGenerationRequest): string {
    const {
      topic,
      ageGroup,
      learningObjectives = '',
      difficulty = 'medium',
      language = 'en',
      duration = 'standard',
      includeImages = true,
      additionalInstructions = '',
      contentMode = 'pdf',
    } = request;

    // Check if interactive mode
    const isInteractive = contentMode === 'interactive';
    
    // Get component schemas - use interactive schemas if in interactive mode
    const schemas = isInteractive 
      ? this.getInteractiveComponentSchemas()
      : worksheetComponentSchemaService.getAllComponentSchemas();
    const ageGuidelines = worksheetComponentSchemaService.getAgeGroupGuidelines(ageGroup);

    // Build component library documentation
    const componentLibrary = this.buildComponentLibraryDoc(schemas);

    // Build examples
    const examples = this.buildExamples();

    // === Get age-based content requirements ===
    const ageSpecificGuidelines = ageBasedContentService.formatForPrompt(
      ageGroup,
      duration as AgeDuration
    );
    
    const contentAmount = ageBasedContentService.calculateComponentCount(
      ageGroup,
      duration as AgeDuration
    );

    // Map duration to time guidance
    const durationMap: Record<string, string> = {
      quick: '10-15 minutes',
      standard: '20-30 minutes',
      extended: '40-50 minutes',
    };
    const durationGuidance = durationMap[duration] || durationMap['standard'];

    const prompt = `You are an expert educational content creator specializing in ${isInteractive ? 'INTERACTIVE' : 'worksheet'} generation for children.

# TASK
Generate a complete ${isInteractive ? 'INTERACTIVE' : 'educational'} ${isInteractive ? 'activity' : 'worksheet'} about "${topic}" for age group ${ageGroup} (${ageGuidelines.readingLevel}).

${isInteractive ? `
**INTERACTIVE MODE ACTIVATED** 🎮
You are creating INTERACTIVE content with:
- Tap/touch interactions
- Sound effects and voice feedback
- Animations and celebrations
- Drag-and-drop activities
- Engaging games for young children

Focus on:
- HANDS-ON activities that children tap, drag, and interact with
- SIMPLE, LARGE elements (perfect for little fingers)
- IMMEDIATE FEEDBACK with sounds and animations
- FUN and ENGAGING gameplay
- EMOTIONAL rewards (celebrations, praise, stars)

${this.getAgeSpecificInteractiveStructureGuidelines(ageGroup)}

**CRITICAL: Follow the age-specific page structure above! Each "page" worth of content should match the structure for this age group.**
` : ''}

**IMPORTANT: Generate ALL content as a SINGLE list of components. Do NOT organize into pages. The system will automatically distribute content across pages based on actual component sizes.**

# GENERATION PARAMETERS
- **Topic:** ${topic}
- **Age Group:** ${ageGroup} years old
- **Reading Level:** ${ageGuidelines.readingLevel}
- **Difficulty:** ${difficulty}
- **Language:** ${language}
- **Duration:** ${duration} - ${durationGuidance}
- **Include Images:** ${includeImages ? 'Yes' : 'No'}
- **Attention Span:** ~${ageGuidelines.attentionSpan} minutes
${learningObjectives ? `- **Learning Objectives:** ${learningObjectives}` : ''}
${additionalInstructions ? `- **Additional Instructions:** ${additionalInstructions}` : ''}

# EDUCATIONAL GUIDELINES FOR AGE ${ageGroup}

${ageSpecificGuidelines}

## Text Length Guidelines
- **Title:** ${ageGuidelines.textLengthGuidelines.title}
- **Instructions:** ${ageGuidelines.textLengthGuidelines.instruction}
- **Body Text:** ${ageGuidelines.textLengthGuidelines.bodyText}
- **Questions:** ${ageGuidelines.textLengthGuidelines.question}

## Complexity Level
- **Complexity:** ${ageGuidelines.complexity}
- **Visual Importance:** ${ageGuidelines.visualImportance}

## Content Principles
1. **Age-Appropriate Language:** Use simple, clear vocabulary suitable for ${ageGuidelines.readingLevel}
2. **Engagement:** Include variety to maintain attention for ${ageGuidelines.attentionSpan} minutes
3. **Visual Support:** ${ageGuidelines.visualImportance === 'critical' || ageGuidelines.visualImportance === 'high' ? 'Use images and visual elements frequently' : 'Use images when helpful'}
4. **Progressive Difficulty:** Start easy, gradually increase challenge
5. **Clear Instructions:** Be explicit and step-by-step
6. **Smart Exercise Selection:** Analyze the topic and choose exercise types that best teach the concept. Consider what activities would be most effective for this specific subject and age group.
7. **Image Generation:** ${includeImages ? 'ALWAYS use "imagePrompt" for ALL components with images (both image-placeholder and interactive components). Provide detailed, descriptive, child-friendly prompts in English.' : 'Do not include image components.'}

${componentLibrary}

# CONTENT STRUCTURE RULES

## Content Organization (Linear Flow - Auto-Paginated Later)
1. **Start with Title:** Begin with title-block (level: 'main')
2. **Instructions Box:** Add instructions-box after title to guide students
3. **Content Flow:** Explanation → Examples → Exercises → Review
4. **Variety:** Mix different component types for engagement
5. **Visual Breaks:** Use dividers between major sections
6. **Images:** Place images near related content

## Component Ordering Best Practices
- **Introduction:** title-block → body-text/instructions-box
- **Teaching:** body-text → tip-box → examples (bullet-list/numbered-list)
- **Practice:** instructions-box → exercise components (fill-blank, multiple-choice, etc.)
- **Visual Aid:** image-placeholder near relevant content
- **Warnings:** warning-box before difficult exercises
- **Separation:** divider between major sections

## TARGET COMPONENT COUNT
**YOU MUST GENERATE ${contentAmount.targetCount} COMPONENTS (Range: ${contentAmount.minCount}-${contentAmount.maxCount})**

This count is specifically calculated for:
- Age Group: ${ageGroup} years
- Duration: ${duration} (${durationGuidance})
- Processing Speed: This age group processes content at a specific pace
- Attention Span: Optimized to maintain engagement without overwhelming

## Recommended Component Mix
${isInteractive ? `
For INTERACTIVE mode, focus on FUN and ENGAGING activities:
- **${Math.ceil(contentAmount.targetCount * 0.7)} Interactive Components** (tap-image, simple-drag-drop, color-matcher, simple-counter)
- **${Math.ceil(contentAmount.targetCount * 0.2)} Simple Instructions** (body-text with VERY simple text like "Tap the animals!")
- **${Math.ceil(contentAmount.targetCount * 0.1)} Helper Elements** (tip-box with encouraging messages)

**FOR INTERACTIVE CONTENT:**
- Keep text MINIMAL - 1-3 words per instruction for age 2-3
- Use LOTS of images and interactive elements
- Make activities SIMPLE and INTUITIVE (tap, drag, match)
- Include 2-4 items per activity (not overwhelming)
- Ensure IMMEDIATE feedback (sounds, animations)
- Create PROGRESSION (easy → slightly harder)
` : `
Distribute your ${contentAmount.targetCount} components as follows:
- **1 Main Title** (title-block with level 'main')
- **1-2 Instructions** (instructions-box)
- **${Math.ceil(contentAmount.targetCount * 0.3)} Text/Explanation Blocks** (body-text, bullet-list, numbered-list)
- **${Math.ceil(contentAmount.targetCount * 0.5)} Exercise Components** (choose the most appropriate exercise types for the topic: fill-blank, multiple-choice, true-false, match-pairs, short-answer, word-bank, etc.)
- **${Math.ceil(contentAmount.targetCount * 0.1)} Helper Elements** (tip-box, warning-box, dividers)
- **${includeImages ? Math.ceil(contentAmount.targetCount * 0.1) : 0} Images** (if includeImages is true)

**Exercise Selection Guidance:**
- For facts/knowledge: use multiple-choice or true-false
- For vocabulary/spelling: use fill-blank or word-bank
- For matching concepts: use match-pairs
- For understanding: use short-answer
- Mix different types for variety and engagement
`}

**CRITICAL:** Aim for exactly ${contentAmount.targetCount} components. Quality matters - ensure each component is engaging and age-appropriate.

# RESPONSE FORMAT

**IMPORTANT:** Generate content as a SINGLE linear list of components. Do NOT split into pages - the system will auto-paginate.

You MUST respond with ONLY valid JSON in this exact format:

{
  "topic": "${topic}",
  "ageGroup": "${ageGroup}",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Main Title",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "instructions-box",
      "properties": {
        "text": "Complete the exercises below.",
        "type": "general"
      }
    },
    {
      "type": "body-text",
      "properties": {
        "text": "Explanation text here...",
        "variant": "paragraph"
      }
    },
    {
      "type": "fill-blank",
      "properties": {
        "items": [
          {
            "number": 1,
            "text": "Sentence with ______ blank.",
            "hint": "answer"
          }
        ],
        "wordBank": ["word1", "word2", "word3"]
      }
    }
  ]
}

# CRITICAL RULES

1. **Valid JSON Only:** No markdown, no code blocks, no extra text - just pure JSON
2. **Required Fields:** Every component must have 'type' and 'properties'
3. **Component Types:** Only use types from the component library above
4. **Properties:** Match the property schema for each component type exactly
5. **Age-Appropriate:** Follow text length and complexity guidelines for age ${ageGroup}
6. **Logical Order:** Components should flow naturally (title → instructions → content → exercises)
7. **Balanced Content:** Don't overwhelm with too many exercises or too much text
8. **Language:** All user-facing text in ${language}, technical fields in English
9. **Images (IMPORTANT):** ${includeImages ? 
  `ALWAYS use "imagePrompt" for ALL components with images:
   - For image-placeholder: use imagePrompt in properties
   - For interactive components (tap-image, simple-drag-drop, sorting-game, etc.): use imagePrompt in items/objects/pairs arrays
   - imagePrompt should be detailed, in English, child-friendly and age-appropriate
   - Example: "friendly cartoon dog with brown fur and wagging tail, bright colors, simple educational illustration for children aged ${ageGroup}"
   - Include style keywords: "cartoon", "simple", "educational", "bright colors", "for children aged ${ageGroup}"
   - DO NOT use imageUrl, url, or placeholder filenames like "cat.jpg" or "dog.jpg"
   - System will automatically generate real images from prompts
   - Be specific about the subject, colors, style, and educational purpose` : 
  'Do not include any image components.'}

# EXAMPLES OF GOOD WORKSHEETS

${examples}

# FINAL CHECKLIST BEFORE GENERATING

- [ ] Age-appropriate vocabulary and sentence structure?
- [ ] Text lengths follow guidelines for age ${ageGroup}?
- [ ] Good mix of component types?
- [ ] Clear instructions for each exercise?
- [ ] Logical flow from introduction to exercises?
- [ ] Tips or warnings where helpful?
- [ ] Images included (if requested)?
- [ ] Dividers to separate sections?
- [ ] Valid JSON with correct component types and properties?

Now generate the worksheet as pure JSON:`;

    return prompt;
  }

  /**
   * Build component library documentation
   */
  private buildComponentLibraryDoc(schemas: any[]): string {
    let doc = '# COMPONENT LIBRARY\n\n';
    doc += 'You can use these educational components to build the worksheet:\n\n';

    schemas.forEach((schema, index) => {
      doc += `## ${index + 1}. ${schema.name} (type: "${schema.id}")\n`;
      doc += `**Category:** ${schema.category}\n`;
      doc += `**Description:** ${schema.description}\n`;
      doc += `**Use Cases:** ${schema.useCases.join(', ')}\n\n`;

      doc += '**Properties:**\n';
      Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
        const required = propSchema.required ? '(required)' : '(optional)';
        const defaultVal = propSchema.default ? ` [default: ${JSON.stringify(propSchema.default)}]` : '';
        doc += `- \`${propName}\` ${required}${defaultVal}: ${propSchema.description}\n`;
        
        if (propSchema.enum) {
          doc += `  - Allowed values: ${propSchema.enum.map((v: string) => `"${v}"`).join(', ')}\n`;
        }
        
        if (propSchema.examples && propSchema.examples.length > 0) {
          doc += `  - Examples: ${propSchema.examples.map((ex: any) => JSON.stringify(ex)).slice(0, 2).join(', ')}\n`;
        }
      });

      if (schema.examples && schema.examples.length > 0) {
        doc += '\n**Example Usage:**\n```json\n';
        doc += JSON.stringify({
          type: schema.id,
          properties: schema.examples[0].properties,
        }, null, 2);
        doc += '\n```\n';
      }

      doc += '\n---\n\n';
    });

    return doc;
  }

  /**
   * Build examples of good worksheets
   */
  private buildExamples(): string {
    return `
## Example 1: Simple Worksheet (Age 6-7)

\`\`\`json
{
  "topic": "Colors",
  "ageGroup": "6-7",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Learning Colors",
      "elements": [
        {
          "type": "title-block",
          "properties": {
            "text": "Colors Around Us",
            "level": "main",
            "align": "center"
          }
        },
        {
          "type": "instructions-box",
          "properties": {
            "text": "Look at the pictures and answer the questions.",
            "type": "general"
          }
        },
        {
          "type": "body-text",
          "properties": {
            "text": "Colors are everywhere! Red, blue, yellow, green - can you find them?",
            "variant": "paragraph"
          }
        },
        {
          "type": "image-placeholder",
          "properties": {
            "caption": "A colorful rainbow",
            "width": 400,
            "height": 300,
            "align": "center"
          }
        },
        {
          "type": "multiple-choice",
          "properties": {
            "items": [
              {
                "number": 1,
                "question": "What color is the sky?",
                "options": [
                  { "letter": "a", "text": "Red" },
                  { "letter": "b", "text": "Blue" },
                  { "letter": "c", "text": "Green" }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

## Example 2: Grammar Worksheet (Age 10-11)

\`\`\`json
{
  "topic": "Present Simple Tense",
  "ageGroup": "10-11",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Present Simple Practice",
      "elements": [
        {
          "type": "title-block",
          "properties": {
            "text": "Present Simple Tense",
            "level": "main",
            "align": "center"
          }
        },
        {
          "type": "body-text",
          "properties": {
            "text": "We use the present simple tense to talk about habits, routines, and general truths. The verb changes for he, she, and it.",
            "variant": "paragraph"
          }
        },
        {
          "type": "tip-box",
          "properties": {
            "text": "Remember: Add 's' or 'es' to the verb when the subject is he, she, or it.",
            "type": "study"
          }
        },
        {
          "type": "divider",
          "properties": {
            "style": "solid",
            "thickness": 2,
            "spacing": "medium"
          }
        },
        {
          "type": "title-block",
          "properties": {
            "text": "Exercise 1: Fill in the Blanks",
            "level": "section",
            "align": "left"
          }
        },
        {
          "type": "instructions-box",
          "properties": {
            "text": "Complete the sentences using the correct form of the verb in brackets.",
            "type": "writing"
          }
        },
        {
          "type": "fill-blank",
          "properties": {
            "items": [
              {
                "number": 1,
                "text": "She ______ (go) to school every day.",
                "hint": "goes"
              },
              {
                "number": 2,
                "text": "They ______ (play) football on Saturdays.",
                "hint": "play"
              }
            ],
            "wordBank": ["goes", "go", "plays", "play"]
          }
        }
      ]
    }
  ]
}
\`\`\`
`;
  }

  /**
   * Call Gemini API with retry logic
   */
  private async callGeminiAPI(
    prompt: string,
    options: AIGenerationOptions = {},
    userId?: string
  ): Promise<string> {
    const {
      temperature = 0.7,
      maxTokens = 32000,
      model = 'gemini-2.5-flash',
    } = options;

    console.log('🤖 [GEMINI_API] Calling Gemini:', {
      model,
      temperature,
      maxTokens,
      promptLength: prompt.length,
    });

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [GEMINI_API] Attempt ${attempt}/${maxRetries}`);
        
        const response = await this.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.9,
            topK: 40,
          },
        });

        const content = response.text;

        if (!content) {
          throw new Error('Empty response from Gemini API');
        }

        console.log('✅ [GEMINI_API] Response received:', {
          responseLength: content.length,
          attempt,
          hasUsageMetadata: !!response.usageMetadata
        });

        // Track token usage if userId is provided
        if (userId && response.usageMetadata) {
          await tokenTrackingService.trackTokenUsage({
            userId,
            serviceName: 'worksheet_generation',
            model,
            inputTokens: response.usageMetadata.promptTokenCount || 0,
            outputTokens: response.usageMetadata.candidatesTokenCount || 0,
            metadata: {
              operation: 'generate'
            }
          });
        }

        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ [GEMINI_API] Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s
          console.log(`⏳ [GEMINI_API] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    console.error('❌ [GEMINI_API] All retry attempts failed');
    throw lastError || new Error('Failed to generate content after retries');
  }

  /**
   * Parse Gemini response to array of elements (NEW FORMAT)
   * Response format: { "topic": "...", "ageGroup": "...", "elements": [...] }
   */
  private parseGeminiResponseToElements(
    response: string,
    request: WorksheetGenerationRequest
  ): GeneratedElement[] {
    console.log('🔍 [PARSER] Parsing Gemini response to elements...');

    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```$/, '');
      }

      // Try to fix incomplete JSON
      if (!cleanedResponse.endsWith('}')) {
        console.warn('⚠️ [PARSER] Response appears incomplete, attempting to fix...');
        cleanedResponse = this.repairIncompleteJSON(cleanedResponse);
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate structure - NEW FORMAT with elements array
      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        throw new Error('Invalid response: missing "elements" array');
      }

      console.log('✅ [PARSER] Parsing successful:', {
        totalElements: parsed.elements.length,
      });

      return parsed.elements;
    } catch (error) {
      console.error('❌ [PARSER] Parsing failed:', error);
      console.error('Response length:', response.length);
      console.error('Response preview (first 500):', response.substring(0, 500));
      console.error('Response preview (last 500):', response.substring(Math.max(0, response.length - 500)));
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Repair incomplete JSON response from LLM
   * Handles unterminated strings, missing brackets, and incomplete objects
   */
  private repairIncompleteJSON(json: string): string {
    console.log('🔧 [PARSER] Attempting to repair incomplete JSON...');
    
    let repaired = json;
    
    // Step 1: Fix unterminated strings
    // Find the last quote and check if it's properly closed
    const lastQuoteIndex = repaired.lastIndexOf('"');
    if (lastQuoteIndex !== -1) {
      // Count quotes before this position
      const quotesBeforeCount = (repaired.substring(0, lastQuoteIndex).match(/"/g) || []).length;
      
      // If odd number of quotes, we have an unterminated string
      if (quotesBeforeCount % 2 === 0) {
        console.log('🔧 [PARSER] Detected unterminated string, closing it');
        // Find where the unterminated string likely ends
        // Look for common JSON delimiters after the last quote
        const afterLastQuote = repaired.substring(lastQuoteIndex + 1);
        const truncateMatch = afterLastQuote.match(/^[^,\]\}]*/);
        
        if (truncateMatch) {
          // Remove incomplete text after last quote and close the string
          repaired = repaired.substring(0, lastQuoteIndex + 1 + truncateMatch[0].length) + '"';
        }
      }
    }
    
    // Step 2: Count opening and closing brackets/braces
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Step 3: Remove trailing commas before adding closing brackets
    repaired = repaired.replace(/,(\s*)$/, '$1');
    
    // Step 4: Add missing closing brackets and braces
    const missingBrackets = openBrackets - closeBrackets;
    const missingBraces = openBraces - closeBraces;
    
    if (missingBrackets > 0 || missingBraces > 0) {
      console.log(`🔧 [PARSER] Adding ${missingBrackets} brackets and ${missingBraces} braces`);
      
      // Close arrays first, then objects
      repaired += ']'.repeat(Math.max(0, missingBrackets));
      repaired += '}'.repeat(Math.max(0, missingBraces));
    }
    
    // Step 5: Validate the structure makes sense
    // If we have elements array, ensure it's properly closed
    if (repaired.includes('"elements"') && !repaired.includes('"elements":[]')) {
      // Make sure elements array is closed
      const elementsIndex = repaired.indexOf('"elements"');
      const arrayStartIndex = repaired.indexOf('[', elementsIndex);
      
      if (arrayStartIndex !== -1) {
        const afterArrayStart = repaired.substring(arrayStartIndex);
        const arrayOpenCount = (afterArrayStart.match(/\[/g) || []).length;
        const arrayCloseCount = (afterArrayStart.match(/\]/g) || []).length;
        
        if (arrayOpenCount > arrayCloseCount) {
          console.log('🔧 [PARSER] Elements array not properly closed');
        }
      }
    }
    
    console.log('✅ [PARSER] JSON repair completed');
    return repaired;
  }

  /**
   * Parse Gemini response to WorksheetGenerationResponse (LEGACY - for backwards compatibility)
   */
  private parseGeminiResponse(
    response: string,
    request: WorksheetGenerationRequest
  ): WorksheetGenerationResponse {
    console.log('🔍 [PARSER] Parsing Gemini response...');

    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```$/, '');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate structure
      if (!parsed.pages || !Array.isArray(parsed.pages)) {
        throw new Error('Invalid response: missing "pages" array');
      }

      // Extract component types used
      const componentsUsed = new Set<string>();
      parsed.pages.forEach((page: GeneratedPage) => {
        page.elements?.forEach((element) => {
          componentsUsed.add(element.type);
        });
      });

      // Build response
      const result: WorksheetGenerationResponse = {
        pages: parsed.pages,
        metadata: {
          topic: request.topic,
          ageGroup: request.ageGroup,
          difficulty: request.difficulty || 'medium',
          language: request.language || 'en',
          pageCount: parsed.pages.length,
          generatedAt: new Date().toISOString(),
          componentsUsed: Array.from(componentsUsed),
          estimatedDuration: this.estimateDuration(parsed.pages),
          autoPaginated: false, // LEGACY format - pages were manually structured
        },
      };

      console.log('✅ [PARSER] Parsing successful:', {
        pages: result.pages.length,
        componentsUsed: result.metadata.componentsUsed,
        estimatedDuration: result.metadata.estimatedDuration,
      });

      return result;
    } catch (error) {
      console.error('❌ [PARSER] Parsing failed:', error);
      console.error('Response was:', response.substring(0, 500));
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get component types used from elements array
   */
  private getComponentTypesUsed(elements: GeneratedElement[]): string[] {
    const componentsUsed = new Set<string>();
    elements.forEach((element) => {
      componentsUsed.add(element.type);
    });
    return Array.from(componentsUsed);
  }

  /**
   * Estimate completion duration from elements array (NEW)
   */
  private estimateDurationFromElements(elements: GeneratedElement[]): number {
    let minutes = 0;

    elements.forEach((element) => {
      // Rough estimates per component type
      switch (element.type) {
        case 'title-block':
          minutes += 0.5;
          break;
        case 'body-text':
          minutes += 1;
          break;
        case 'instructions-box':
          minutes += 0.5;
          break;
        case 'fill-blank':
          minutes += element.properties?.items?.length * 1 || 2;
          break;
        case 'multiple-choice':
          minutes += element.properties?.items?.length * 0.75 || 2;
          break;
        case 'true-false':
          minutes += element.properties?.items?.length * 0.5 || 1.5;
          break;
        case 'short-answer':
          minutes += element.properties?.items?.length * 2 || 4;
          break;
        case 'image-placeholder':
          minutes += 0.5;
          break;
        case 'match-pairs':
          minutes += element.properties?.pairs?.length * 1.5 || 3;
          break;
        case 'word-bank':
          minutes += 2;
          break;
        default:
          minutes += 0.5;
      }
    });

    return Math.ceil(minutes);
  }

  /**
   * Estimate completion duration based on content (LEGACY - for pages)
   */
  private estimateDuration(pages: GeneratedPage[]): number {
    const allElements: GeneratedElement[] = [];
    pages.forEach((page) => {
      if (page.elements) {
        allElements.push(...page.elements);
      }
    });
    return this.estimateDurationFromElements(allElements);
  }
}

// Singleton instance
export const geminiWorksheetGenerationService = new GeminiWorksheetGenerationService();

