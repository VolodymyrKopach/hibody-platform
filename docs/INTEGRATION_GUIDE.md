# 📘 Component Library v1 - Integration Guide

## Швидкий Старт

### 1. Використання Компонентів

#### Базове використання
```typescript
import { Flashcards, WordBuilder, StoryBuilder } from '@/components/worksheet/canvas/interactive';

// Simple usage
<Flashcards 
  cards={[
    { front: { text: 'Hello' }, back: { text: 'Привіт' } }
  ]}
  ageGroup="7-8"
/>

<WordBuilder 
  targetWord="ELEPHANT"
  showHints={true}
  ageGroup="9-10"
/>

<StoryBuilder
  characters={characters}
  settings={settings}
  enableAI={true}
  ageGroup="11-12"
/>
```

#### Динамічне завантаження
```typescript
import { INTERACTIVE_COMPONENTS } from '@/components/worksheet/canvas/interactive';

// Dynamic component loading
const componentType = 'flashcards'; // from schema
const Component = INTERACTIVE_COMPONENTS[componentType];

<Component {...props} />
```

---

## 2. Система Тем

### ThemeProvider Setup

```typescript
// app/layout.tsx or _app.tsx
import { ThemeProvider } from '@/components/worksheet/themes/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider defaultTheme="Modern Minimal">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Selector Usage

```typescript
import ThemeSelector from '@/components/worksheet/themes/ThemeSelector';

// In any component
function MyComponent() {
  return (
    <Box>
      <ThemeSelector />
      {/* Your content */}
    </Box>
  );
}
```

### Using Theme in Components

```typescript
import { useVisualTheme } from '@/components/worksheet/themes/ThemeWrapper';

function MyCustomComponent() {
  const theme = useVisualTheme();
  
  return (
    <Box
      sx={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        borderRadius: theme.borderRadius,
        padding: theme.padding,
      }}
    >
      Content styled with current theme
    </Box>
  );
}
```

---

## 3. AI Feedback (Open Question)

### Environment Setup

```bash
# .env.local
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### Component Usage

```typescript
<OpenQuestion
  question="Describe your favorite animal and why you like it."
  expectedKeywords={['appearance', 'habitat', 'behavior']}
  maxLength={500}
  enableVoiceInput={true}
  feedbackType="encouraging"
  ageGroup="11-12"
/>
```

---

## 4. Schema Integration

### Adding to PropertiesPanel

Компоненти вже інтегровані через schema. PropertiesPanel автоматично підбере потрібні поля:

```typescript
import { getComponentPropertySchema } from '@/constants/interactive-properties-schema';

// Get schema for component
const schema = getComponentPropertySchema('flashcards');

// Schema містить всі editable properties
schema.properties.forEach(prop => {
  // Render input based on prop.type
  // 'string', 'number', 'boolean', 'select', 'array-object', etc.
});
```

### Adding to LeftSidebar

```typescript
import { INTERACTIVE_COMPONENT_SCHEMAS } from '@/constants/interactive-properties-schema';

// Get all components by category
const interactiveComponents = INTERACTIVE_COMPONENT_SCHEMAS.filter(
  schema => schema.category === 'interactive'
);

// Render in sidebar
interactiveComponents.map(schema => (
  <ComponentButton
    key={schema.componentType}
    icon={schema.icon}
    name={schema.componentName}
    onClick={() => addComponent(schema.componentType)}
  />
));
```

---

## 5. Age Adaptation

### Using Age Configurations

```typescript
import { AGE_CONFIGURATIONS } from '@/constants/templates';
import { AgeGroup } from '@/types/generation';

function MyComponent({ ageGroup }: { ageGroup: AgeGroup }) {
  const config = AGE_CONFIGURATIONS[ageGroup];
  
  return (
    <Box
      sx={{
        padding: config.padding,
        borderRadius: config.borderRadius,
        fontSize: config.fontSize,
        '& button': {
          width: config.buttonSize,
          height: config.buttonSize,
        },
      }}
    >
      {/* Age-adapted content */}
    </Box>
  );
}
```

### Age-specific Templates

```typescript
import { AGE_COMPONENT_TEMPLATES, AGE_TEMPLATE_DESCRIPTIONS } from '@/constants/templates';

// Get template for age group
const template = AGE_COMPONENT_TEMPLATES['11-12'];
const description = AGE_TEMPLATE_DESCRIPTIONS['11-12'];

// Use in generation
const generatedContent = await generateWithAI({
  template,
  description,
  ageGroup: '11-12',
});
```

---

## 6. Sound & Haptics

### Using Sound Service

```typescript
import { soundService } from '@/services/interactive/SoundService';

// Play predefined sounds
soundService.play('tap');
soundService.playCorrect();
soundService.playError();
soundService.playSuccess();

// Custom sounds
soundService.play('custom-sound', 0.8); // volume 0-1
```

### Using Haptic Feedback

```typescript
import { triggerHaptic } from '@/utils/interactive/haptics';

// Different intensities
triggerHaptic('light');   // subtle feedback
triggerHaptic('medium');  // normal feedback
triggerHaptic('heavy');   // strong feedback
triggerHaptic('success'); // success pattern
triggerHaptic('error');   // error pattern
```

---

## 7. Доступні Компоненти

### Всі 27 компонентів:

**Існуючі (15):**
- tap-image, simple-drag-drop, color-matcher, simple-counter
- memory-cards, sorting-game, sequence-builder, shape-tracer
- emotion-recognizer, sound-matcher, simple-puzzle
- pattern-builder, cause-effect, reward-collector, voice-recorder

**Нові (12):**
1. **flashcards** - Двосторонні картки
2. **word-builder** - Будівник слів
3. **open-question** - Відкриті питання з AI
4. **drawing-canvas** - Малювання
5. **dialog-roleplay** - Діалоги
6. **interactive-map** - Інтерактивна карта
7. **timer-challenge** - Завдання на час
8. **timeline-builder** - Таймлайн
9. **story-builder** - Конструктор історій
10. **categorization-grid** - Сортування
11. **interactive-board** - Дошка зі стікерами
12. **object-builder** - Конструктор об'єктів

---

## 8. Приклади Використання

### Example 1: Complete Lesson with Themes

```typescript
import { ThemeProvider } from '@/components/worksheet/themes/ThemeProvider';
import { Flashcards, WordBuilder, OpenQuestion } from '@/components/worksheet/canvas/interactive';

function EnglishLesson() {
  return (
    <ThemeProvider defaultTheme="Playful">
      <Flashcards 
        cards={vocabularyCards}
        ageGroup="7-8"
      />
      
      <WordBuilder
        targetWord="PLAYGROUND"
        showHints={true}
        ageGroup="7-8"
      />
      
      <OpenQuestion
        question="What do you like to do at the playground?"
        enableVoiceInput={true}
        ageGroup="7-8"
      />
    </ThemeProvider>
  );
}
```

### Example 2: Drawing Activity

```typescript
import { DrawingCanvas, InteractiveBoard } from '@/components/worksheet/canvas/interactive';

function ArtLesson() {
  return (
    <>
      <DrawingCanvas
        backgroundImage="/templates/coloring-page.jpg"
        tools={['brush', 'eraser', 'fill']}
        colorPalette={['#FF0000', '#00FF00', '#0000FF']}
        ageGroup="4-6"
      />
      
      <InteractiveBoard
        allowedStickerTypes={['emoji', 'image']}
        maxStickers={30}
        ageGroup="4-6"
      />
    </>
  );
}
```

### Example 3: Story Building

```typescript
import { StoryBuilder, DialogRoleplay } from '@/components/worksheet/canvas/interactive';

function CreativeWriting() {
  return (
    <>
      <StoryBuilder
        characters={[
          { id: '1', name: 'Knight', description: 'Brave warrior' },
          { id: '2', name: 'Dragon', description: 'Wise creature' }
        ]}
        settings={[
          { id: '1', name: 'Castle', description: 'Ancient fortress' }
        ]}
        enableAI={true}
        ageGroup="11-12"
      />
      
      <DialogRoleplay
        dialogTree={conversationTree}
        characters={roleplayCharacters}
        enableVoice={true}
        ageGroup="11-12"
      />
    </>
  );
}
```

---

## 9. Best Practices

### 1. Завжди вказуйте ageGroup
```typescript
// ✅ Good
<Flashcards cards={cards} ageGroup="7-8" />

// ❌ Bad - no age adaptation
<Flashcards cards={cards} />
```

### 2. Використовуйте ThemeProvider на найвищому рівні
```typescript
// ✅ Good - once in root
<ThemeProvider>
  <App />
</ThemeProvider>

// ❌ Bad - multiple providers
<ThemeProvider>
  <Page1 />
</ThemeProvider>
<ThemeProvider>
  <Page2 />
</ThemeProvider>
```

### 3. Динамічне завантаження для великих додатків
```typescript
// ✅ Good - lazy loading
const Component = lazy(() => import('@/components/worksheet/canvas/interactive/StoryBuilder'));

// ❌ Bad - import everything
import * from '@/components/worksheet/canvas/interactive';
```

### 4. Обробляйте помилки
```typescript
// ✅ Good
<ErrorBoundary fallback={<ErrorMessage />}>
  <OpenQuestion {...props} />
</ErrorBoundary>

// ❌ Bad - no error handling
<OpenQuestion {...props} />
```

---

## 10. Troubleshooting

### Проблема: Theme не застосовується
**Рішення:** Переконайтесь що ThemeProvider обгортає весь додаток

### Проблема: AI feedback не працює
**Рішення:** Перевірте ANTHROPIC_API_KEY в .env

### Проблема: Звуки не відтворюються
**Рішення:** Користувач повинен взаємодіяти з сторінкою перед першим звуком (browser policy)

### Проблема: Компонент не знайдено
**Рішення:** Перевірте правильність імпорту:
```typescript
// Correct
import { Flashcards } from '@/components/worksheet/canvas/interactive';

// Wrong
import Flashcards from '@/components/worksheet/canvas/interactive/Flashcards';
```

---

## 11. TypeScript Types

### Component Props
```typescript
import type { 
  FlashcardsProps,
  WordBuilderProps,
  OpenQuestionProps
} from '@/components/worksheet/canvas/interactive';
```

### Theme Types
```typescript
import type { ThemeName, VisualTheme } from '@/types/themes';
```

### Age Types
```typescript
import type { AgeGroup } from '@/types/generation';
```

---

## 12. API Reference

### Interactive Components
Детальна документація: `docs/components/interactive-components.md`

### Visual Themes
Детальна документація: `docs/themes/visual-themes.md`

### Complete Summary
Повний звіт: `COMPONENT_LIBRARY_COMPLETE.md`

---

## 🎯 Готово до використання!

Всі компоненти повністю готові до інтеграції в платформу. При виникненні питань дивіться детальну документацію або приклади вище.

**Happy Coding! 🚀**

