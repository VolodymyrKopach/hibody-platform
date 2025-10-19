/**
 * Interactive Components Index
 * Centralized export for all interactive worksheet components
 */

// Existing components
export { default as TapImage } from './TapImage';
export { default as SimpleDragAndDrop } from './SimpleDragAndDrop';
export { default as ColorMatcher } from './ColorMatcher';
export { default as SimpleCounter } from './SimpleCounter';
export { default as MemoryCards } from './MemoryCards';
export { default as SortingGame } from './SortingGame';
export { default as SequenceBuilder } from './SequenceBuilder';
export { default as ShapeTracer } from './ShapeTracer';
export { default as EmotionRecognizer } from './EmotionRecognizer';
export { default as SoundMatcher } from './SoundMatcher';
export { default as SimplePuzzle } from './SimplePuzzle';
export { default as PatternBuilder } from './PatternBuilder';
export { default as CauseEffectGame } from './CauseEffectGame';
export { default as RewardCollector } from './RewardCollector';
export { default as VoiceRecorder } from './VoiceRecorder';

// New components - Phase 1
export { default as Flashcards } from './Flashcards';
export { default as WordBuilder } from './WordBuilder';
export { default as OpenQuestion } from './OpenQuestion';

// New components - Phase 3
export { default as DrawingCanvas } from './DrawingCanvas';
export { default as DialogRoleplay } from './DialogRoleplay';
export { default as InteractiveMap } from './InteractiveMap';
export { default as TimerChallenge } from './TimerChallenge';
export { default as TimelineBuilder } from './TimelineBuilder';

// New components - Phase 4
export { default as StoryBuilder } from './StoryBuilder';
export { default as CategorizationGrid } from './CategorizationGrid';
export { default as InteractiveBoard } from './InteractiveBoard';
export { default as ObjectBuilder } from './ObjectBuilder';

// Component mapping for dynamic loading
export const INTERACTIVE_COMPONENTS = {
  // Existing
  'tap-image': TapImage,
  'simple-drag-drop': SimpleDragAndDrop,
  'color-matcher': ColorMatcher,
  'simple-counter': SimpleCounter,
  'memory-cards': MemoryCards,
  'sorting-game': SortingGame,
  'sequence-builder': SequenceBuilder,
  'shape-tracer': ShapeTracer,
  'emotion-recognizer': EmotionRecognizer,
  'sound-matcher': SoundMatcher,
  'simple-puzzle': SimplePuzzle,
  'pattern-builder': PatternBuilder,
  'cause-effect': CauseEffectGame,
  'reward-collector': RewardCollector,
  'voice-recorder': VoiceRecorder,
  
  // New
  'flashcards': Flashcards,
  'word-builder': WordBuilder,
  'open-question': OpenQuestion,
  'drawing-canvas': DrawingCanvas,
  'dialog-roleplay': DialogRoleplay,
  'interactive-map': InteractiveMap,
  'timer-challenge': TimerChallenge,
  'timeline-builder': TimelineBuilder,
  'story-builder': StoryBuilder,
  'categorization-grid': CategorizationGrid,
  'interactive-board': InteractiveBoard,
  'object-builder': ObjectBuilder,
} as const;

export type InteractiveComponentType = keyof typeof INTERACTIVE_COMPONENTS;

