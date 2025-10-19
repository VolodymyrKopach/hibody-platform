# Interactive Components Documentation

This document provides comprehensive information about all interactive components in the Component Library v1.

## Overview

The Component Library includes **23 interactive components** designed for different age groups and learning objectives. All components follow SOLID principles and support age-based theming.

---

## New Components (Phase 1-3)

### 1. Flashcards 🎴

**File:** `/src/components/worksheet/canvas/interactive/Flashcards.tsx`

**Description:** Two-sided cards with 3D flip animation for vocabulary learning and memorization.

**Key Features:**
- 3D flip animation (horizontal/vertical)
- Text and image support on both sides
- Auto-flip mode for automated learning
- Voice synthesis for pronunciation
- Progress tracking
- Celebration on completion

**Props:**
```typescript
interface FlashcardsProps {
  cards: Array<{
    front: { text?: string; imageUrl?: string };
    back: { text?: string; imageUrl?: string };
  }>;
  cardSize?: 'small' | 'medium' | 'large';
  autoFlip?: boolean;
  showNavigation?: boolean;
  flipDirection?: 'horizontal' | 'vertical';
}
```

**Use Cases:**
- Language learning (word ↔ translation)
- Vocabulary building
- Concept memorization
- Historical facts

---

### 2. Word Builder ✍️

**File:** `/src/components/worksheet/canvas/interactive/WordBuilder.tsx`

**Description:** Interactive spelling game where students build words from letters.

**Key Features:**
- Drag-and-drop letter placement
- Visual feedback (shake on wrong, celebrate on correct)
- Image hints
- First letter hints
- Mistake tracking
- Sound effects

**Props:**
```typescript
interface WordBuilderProps {
  targetWord: string;
  shuffledLetters?: string[];
  showHints?: boolean;
  mode?: 'drag-drop' | 'buttons' | 'keyboard';
  imageHint?: string;
}
```

**Use Cases:**
- Spelling practice
- Phonics learning
- Vocabulary reinforcement
- Language acquisition

---

### 3. Open Question 💭

**File:** `/src/components/worksheet/canvas/interactive/OpenQuestion.tsx`

**Description:** Text input with AI-powered feedback for open-ended questions.

**Key Features:**
- Rich text input
- Voice-to-text support
- AI feedback with Claude API
- Keyword detection
- Encouragement system
- Score visualization

**API Endpoint:** `/src/app/api/interactive/ai-feedback/route.ts`

**Props:**
```typescript
interface OpenQuestionProps {
  question: string;
  expectedKeywords?: string[];
  maxLength?: number;
  enableVoiceInput?: boolean;
  feedbackType?: 'encouraging' | 'detailed' | 'concise';
}
```

**Use Cases:**
- Essay practice
- Critical thinking
- Creative writing
- Comprehension questions

---

### 4. Drawing Canvas 🎨

**File:** `/src/components/worksheet/canvas/interactive/DrawingCanvas.tsx`

**Description:** Full-featured drawing canvas with tools and coloring support.

**Key Features:**
- Brush and eraser tools
- Color palette
- Adjustable brush size
- Background image support (coloring mode)
- Download functionality
- Touch and mouse support

**Props:**
```typescript
interface DrawingCanvasProps {
  backgroundImage?: string;
  canvasSize?: 'small' | 'medium' | 'large';
  tools?: Array<'brush' | 'eraser' | 'fill'>;
  colorPalette?: string[];
  brushSizes?: number[];
}
```

**Use Cases:**
- Coloring activities
- Creative drawing
- Fine motor skills
- Art projects

---

### 5. Dialog Roleplay 💬

**File:** `/src/components/worksheet/canvas/interactive/DialogRoleplay.tsx`

**Description:** Branching conversation tree for communication practice.

**Key Features:**
- Dialog tree navigation
- Character avatars
- Score system
- Voice synthesis
- Branching conversations
- Correct answer hints

**Props:**
```typescript
interface DialogRoleplayProps {
  dialogTree: Array<{
    id: string;
    character: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      nextNodeId?: string;
      isCorrect?: boolean;
      points?: number;
    }>;
    isFinal?: boolean;
  }>;
  characters: Array<{
    name: string;
    avatar: string;
    voice?: string;
  }>;
  showHints?: boolean;
  enableVoice?: boolean;
}
```

**Use Cases:**
- Language conversations
- Social skills
- Scenario practice
- Decision making

---

### 6. Interactive Map 🗺️

**File:** `/src/components/worksheet/canvas/interactive/InteractiveMap.tsx`

**Description:** Clickable hotspots on images for geography, anatomy, and more.

**Key Features:**
- Clickable regions
- Learning and quiz modes
- Tooltips and information panels
- Progress tracking
- Visual feedback

**Props:**
```typescript
interface InteractiveMapProps {
  backgroundImage: string;
  hotspots: Array<{
    id: string;
    x: number; // percentage
    y: number; // percentage
    width: number;
    height: number;
    label: string;
    info: string;
    isCorrect?: boolean;
  }>;
  mode?: 'learning' | 'quiz';
  showLabels?: boolean;
}
```

**Use Cases:**
- Geography lessons
- Anatomy learning
- Historical maps
- Diagram labeling

---

### 7. Timer Challenge ⏱️

**File:** `/src/components/worksheet/canvas/interactive/TimerChallenge.tsx`

**Description:** Timed challenges with bonus time for correct answers.

**Key Features:**
- Countdown timer
- Bonus time rewards
- Progress tracking
- Multiple question types
- Pause/resume functionality
- Time penalty for errors

**Props:**
```typescript
interface TimerChallengeProps {
  duration: number; // seconds
  challengeType?: 'find-items' | 'answer-questions' | 'complete-task';
  items: Array<{
    id: string;
    question: string;
    answer: string;
    imageUrl?: string;
  }>;
  showProgress?: boolean;
  bonusTime?: number;
}
```

**Use Cases:**
- Speed drills
- Quick recall
- Math facts
- Vocabulary practice

---

### 8. Timeline Builder 📅

**File:** `/src/components/worksheet/canvas/interactive/TimelineBuilder.tsx`

**Description:** Drag-and-drop events into chronological order.

**Key Features:**
- Visual timeline
- Drag-and-drop mechanics
- Date display
- Event images
- Correctness checking
- Linear or circular layout

**Props:**
```typescript
interface TimelineBuilderProps {
  events: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    imageUrl?: string;
    order: number;
  }>;
  timelineType?: 'linear' | 'circular';
  showDates?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

**Use Cases:**
- History lessons
- Story sequencing
- Process steps
- Daily routines

---

## Age Adaptation

All components support age-based theming through the `ageGroup` prop:

- **2-3 years:** Extra large elements, simple interactions
- **4-6 years:** Large, colorful, playful
- **7-8 years:** Moderate size, more structure
- **9-10 years:** Standard size, organized
- **11-12 years:** Compact, information-dense
- **13-15 years:** Academic style
- **16-18 years:** Modern minimal

## Common Features

All interactive components include:

1. **Sound Effects:** Via `soundService`
2. **Haptic Feedback:** Via `triggerHaptic`
3. **Animations:** Using Framer Motion
4. **Accessibility:** ARIA labels, keyboard navigation
5. **Editor Integration:** `isSelected`, `onEdit`, `onFocus` props
6. **Responsive Design:** Adapts to screen sizes

## Technical Implementation

### Import Example
```typescript
import Flashcards from '@/components/worksheet/canvas/interactive/Flashcards';
import { soundService } from '@/services/interactive/SoundService';
```

### Usage Example
```tsx
<Flashcards
  cards={[
    {
      front: { text: 'Apple', imageUrl: '/apple.jpg' },
      back: { text: 'A fruit', imageUrl: '/apple-tree.jpg' }
    }
  ]}
  cardSize="medium"
  autoFlip={false}
  showNavigation={true}
  flipDirection="horizontal"
  ageGroup="7-8"
/>
```

## Performance Considerations

- Components use `React.memo` where appropriate
- Canvas operations are optimized
- Large datasets are paginated
- Images are lazy-loaded

## Future Enhancements

Components planned for Phase 4:
- Story Builder
- Categorization Grid
- Interactive Board
- Object Builder (LEGO-style)
- Video Task
- Quiz Battle
- Mini Simulation
- Reaction Meter

---

For visual theme documentation, see [visual-themes.md](../themes/visual-themes.md)

