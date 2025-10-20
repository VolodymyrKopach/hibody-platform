# Interactive Component Properties System

Система редагування властивостей інтерактивних компонентів інтегрована безпосередньо в RightSidebar з можливістю ручного та AI редагування.

## Структура

```
properties/
├── ManualPropertyEditor.tsx      # Ручне редагування властивостей
├── ThemeSelector.tsx             # Вибір візуальної теми
├── VisualChipSelector.tsx       # ⭐ Універсальний chip-based селектор (SOLID)
└── README.md                     # Ця документація
```

## Архітектура

Система інтегрована безпосередньо в **RightSidebar** з умовною логікою для різних типів компонентів:

### Tab "Properties"
- **Інтерактивні компоненти** → `ManualPropertyEditor` з повною схемою властивостей
- **Звичайні компоненти** (title-block, body-text, etc.) → вбудовані UI контроли

### Tab "AI Assistant"
- **ВСІ компоненти** → `AIAssistantPanel` (універсальний AI асистент)
- **Page selection** → `AIAssistantPanel` для редагування сторінки

Це усуває дублювання табів і створює єдиний, універсальний AI інтерфейс.

## Компоненти

### ManualPropertyEditor

Компонент для ручного редагування властивостей інтерактивних компонентів.

**Props:**
- `schema: ComponentPropertySchema` - Схема властивостей компонента
- `properties: any` - Поточні значення властивостей
- `onChange: (newProperties: any) => void` - Callback для оновлення

**Підтримувані типи полів:**
- `string` - Текстове поле
- `number` - Числове поле (з min/max)
- `boolean` - Перемикач (Switch)
- `color` - Color picker + текстове поле
- `select` - Випадаючий список
- `array-simple` - Масив рядків (редагується як список)
- `array-object` - Масив об'єктів (складні структури з полями)
- `object` - Вкладений об'єкт з полями

**Функціональність:**
- Автоматична валідація (required fields)
- Підказки (tooltips) для складних полів
- Згортання/розгортання складних структур
- Додавання/видалення елементів масивів
- Real-time оновлення

### ThemeSelector

Компонент для вибору візуальної теми інтерактивних компонентів.

**Props:**
- `currentTheme?: ThemeName` - Поточна обрана тема
- `ageGroup?: string` - Вікова група для фільтрації тем
- `onChange: (theme: ThemeName) => void` - Callback при виборі теми
- `showAllThemes?: boolean` - Показати всі теми (без фільтрації)
- `componentSuitableAges?: string[]` - Підходящі вікові групи для компонента

**Можливості:**
- Візуальний preview кожної теми з кольорами
- Автоматична фільтрація тем по віковій групі
- Адаптивний scrollable layout
- Check mark на активній темі

### VisualChipSelector ⭐

**Універсальний SOLID компонент** для вибору опцій через візуальні чіпи. Використовується напряму без обгорток!

**Props:**
```typescript
interface ChipOption<T> {
  value: T;                    // Значення опції
  label: string;               // Текст на чіпі
  emoji?: string;              // Опціональне emoji
  color?: string;              // Опціональний колір (для colorMode='multi')
  tooltip?: {                  // Опціональний tooltip
    title: string;
    description: string;
    details?: string;
  };
}

interface VisualChipSelectorProps<T> {
  label: string;               // Заголовок селектора
  icon?: ReactNode;            // Іконка біля заголовка
  options: ChipOption<T>[];    // Масив опцій
  value?: T;                   // Поточне значення
  onChange: (value: T) => void; // Callback при виборі
  colorMode?: 'single' | 'multi'; // Режим кольорів
}
```

**Можливості:**
- ✅ **Generic тип** - працює з будь-яким типом значень
- ✅ **SOLID принципи** - один компонент, одна відповідальність
- ✅ **Підтримка emoji** на чіпах
- ✅ **Два режими кольорів:** 
  - `single` - всі чіпи theme.primary (для Age Group)
  - `multi` - кожен чіп свій колір (для Age Style)
- ✅ **Опціональні tooltips** з детальною інформацією
- ✅ **Horizontal scrollable** layout з кастомним scrollbar
- ✅ **Кастомні іконки** заголовків
- ✅ **Smooth анімації** та hover ефекти
- ✅ **Повністю переюзабельний** - без обгорток!

---

#### Приклад 1: Вибір Вікової Групи (Age Group)

```typescript
import { VisualChipSelector, ChipOption } from './VisualChipSelector';
import { Users } from 'lucide-react';

const AGE_LABELS: Record<string, string> = {
  '2-3': '2-3 yrs',
  '4-6': '4-6 yrs',
  '7-8': '7-8 yrs',
  '9-10': '9-10 yrs',
};

<VisualChipSelector
  label="Age Group"
  icon={<Users size={14} />}
  options={['2-3', '4-6', '7-8', '9-10'].map((age): ChipOption<string> => ({
    value: age,
    label: AGE_LABELS[age] || age,
  }))}
  value={currentAge}
  onChange={handleAgeChange}
  colorMode="single"  // ← Один колір для всіх чіпів
/>
```

**Використовується в:**
- `RightSidebar` для всіх інтерактивних компонентів:
  - Tap Image
  - Color Matcher
  - Simple Counter
  - Simple Drag & Drop
  - Voice Recorder

---

#### Приклад 2: Вибір Стилю Drag-Drop (Age Style)

```typescript
import { VisualChipSelector, ChipOption } from './VisualChipSelector';
import { Move } from 'lucide-react';
import { getAllDragDropStyles } from '@/constants/drag-drop-age-styles';
import { DragDropAgeStyleName } from '@/types/drag-drop-styles';

const STYLE_CONFIG: Record<DragDropAgeStyleName, { emoji: string; color: string }> = {
  'toddler': { emoji: '🐣', color: '#FF6B9D' },
  'preschool': { emoji: '🎨', color: '#667eea' },
  'elementary': { emoji: '📚', color: '#3B82F6' },
  'middle': { emoji: '🎯', color: '#8B5CF6' },
  'teen': { emoji: '🎓', color: '#1F2937' },
};

const AGE_LABELS: Record<DragDropAgeStyleName, string> = {
  'toddler': '3-5 yrs',
  'preschool': '6-7 yrs',
  'elementary': '8-9 yrs',
  'middle': '10-13 yrs',
  'teen': '14-18 yrs',
};

const allStyles = getAllDragDropStyles();
const options: ChipOption<DragDropAgeStyleName>[] = allStyles.map((style) => ({
  value: style.id,
  label: AGE_LABELS[style.id],
  emoji: STYLE_CONFIG[style.id].emoji,
  color: STYLE_CONFIG[style.id].color,  // ← Кожен чіп свій колір!
  tooltip: {
    title: style.name,
    description: style.description,
    details: `Item: ${style.elementSize.item}px • Target: ${style.elementSize.target}px`,
  },
}));

<VisualChipSelector
  label="Age Style"
  icon={<Move size={14} />}
  options={options}
  value={currentStyle}
  onChange={handleStyleChange}
  colorMode="multi"  // ← Мульти-колірний режим
/>
```

**Використовується в:**
- `ManualPropertyEditor` для `simple-drag-drop` компонента

---

#### Приклад 3: Власний Селектор (Custom)

```typescript
import { VisualChipSelector, ChipOption } from './VisualChipSelector';
import { Target } from 'lucide-react';

// Селектор складності
<VisualChipSelector
  label="Difficulty"
  icon={<Target size={14} />}
  options={[
    { 
      value: 'easy', 
      label: 'Easy', 
      emoji: '😊', 
      color: '#10B981',
      tooltip: {
        title: 'Easy Level',
        description: 'Perfect for beginners',
        details: 'Ages 3-5'
      }
    },
    { value: 'medium', label: 'Medium', emoji: '🤔', color: '#F59E0B' },
    { value: 'hard', label: 'Hard', emoji: '😰', color: '#EF4444' },
  ]}
  value={difficulty}
  onChange={setDifficulty}
  colorMode="multi"
/>
```

---

#### Чому Без Обгорток?

**SOLID Principles:**
- ✅ **Single Responsibility** - компонент робить одну річ добре
- ✅ **Open/Closed** - відкритий для розширення через props
- ✅ **Dependency Inversion** - залежить від конфігурації, не від конкретних випадків

**Переваги:**
- ✅ Менше коду (на 68% менше без обгорток!)
- ✅ Прямий виклик - зрозуміліше що відбувається
- ✅ Повний контроль над опціями
- ✅ Легко додавати нові селектори
- ✅ Немає зайвих шарів абстракції

### AIAssistantPanel

**Універсальний AI-асистент** для всіх типів компонентів та сторінок. Використовується в табі "AI Assistant" для редагування елементів та page settings.

**Props:**
- `selection: Selection` - Поточний вибраний елемент або сторінка
- `context: WorksheetEditContext` - Контекст worksheet
- `onEdit: (instruction: string) => Promise<void>` - Callback для AI редагування
- `editHistory: WorksheetEdit[]` - Історія змін
- `isEditing: boolean` - Статус процесу редагування
- `error: string | null` - Помилка якщо є
- `onClearError?: () => void` - Очистити помилку

**Можливості:**
1. **Quick Improvements** - Контекстні швидкі дії згенеровані динамічно для кожного типу:
   - Адаптуються до типу компонента
   - Враховують контекст worksheet
   
2. **Custom Instructions** - Довільні текстові інструкції для точного контролю
3. **Context-aware** - Враховує тип компонента/сторінки, вікову групу, складність
4. **Edit History** - Повна історія всіх змін з можливістю перегляду
5. **Real-time feedback** - Показує, які зміни були застосовані

**Приклади інструкцій:**
```
"Add 3 more animals and make the images bigger"
"Change all colors to pastel tones"
"Make it more suitable for 3-year-olds"
"Add a fun ocean theme with blue backgrounds"
"Change background to gradient blue"
```

**Технічна реалізація:**
- Використовує `WorksheetEditingService` для AI-редагування
- Генерує patch з змінами через Gemini AI
- Автоматично застосовує зміни до властивостей
- Підтримує як компоненти так і сторінки

## Схема властивостей

Властивості для кожного інтерактивного компонента визначені в:
```
src/constants/interactive-properties-schema.ts
```

### Приклад схеми:

```typescript
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
    // ... інші властивості
  ],
}
```

## Додавання нового інтерактивного компонента

### 1. Додати схему в `interactive-properties-schema.ts`

```typescript
export const INTERACTIVE_PROPERTIES_SCHEMAS: ComponentPropertySchema[] = [
  // ... існуючі компоненти
  {
    componentType: 'my-new-component',
    componentName: 'My New Component',
    category: 'interactive',
    icon: '🎮',
    properties: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: true,
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ],
  },
];
```

### 2. Готово!

Система автоматично:
- Відобразить ManualPropertyEditor в табі "Properties"
- Створить форму на основі схеми
- Підключить AI редагування через AIAssistantPanel

## Інтеграція в RightSidebar

Система інтегрована безпосередньо в RightSidebar з простою та чіткою логікою:

```typescript
// В RightSidebar.tsx - Tab "Properties"
{isInteractiveComponent(elementData.type) ? (
  (() => {
    const schema = getComponentPropertySchema(elementData.type);
    return schema ? (
      <ManualPropertyEditor
        schema={schema}
        properties={elementData.properties}
        onChange={(newProperties) => {
          onUpdate?.(newProperties);
        }}
      />
    ) : (
      // Fallback для компонентів без схеми
    );
  })()
) : (
  // Звичайні PDF компоненти (title-block, body-text, etc.)
  // Вбудовані UI контроли
)}

// Tab "AI Assistant" - УНІВЕРСАЛЬНИЙ для всіх типів
{aiContext && onAIEdit ? (
  // ✅ AIAssistantPanel для ВСІХ компонентів і сторінок
  <AIAssistantPanel
    selection={selection}
    context={aiContext}
    onEdit={onAIEdit}
    editHistory={editHistory}
    isEditing={isAIEditing}
    error={editError}
    onClearError={onClearEditError}
  />
) : (
  // Fallback: AI недоступний
)}
```

## Підтримувані інтерактивні компоненти

✅ Всі 15 інтерактивних компонентів мають повну підтримку:

1. **Tap Image** - Інтерактивне зображення з анімацією
2. **Simple Drag & Drop** - Перетягування елементів
3. **Color Matcher** - Вивчення кольорів
4. **Simple Counter** - Підрахунок об'єктів
5. **Memory Cards** - Гра на пам'ять
6. **Sorting Game** - Сортування за категоріями
7. **Sequence Builder** - Вибудовування послідовності
8. **Shape Tracer** - Малювання фігур
9. **Emotion Recognizer** - Розпізнавання емоцій
10. **Sound Matcher** - Співставлення звуків
11. **Simple Puzzle** - Пазл
12. **Pattern Builder** - Створення патернів
13. **Cause & Effect** - Причина та наслідок
14. **Reward Collector** - Збір нагород
15. **Voice Recorder** - Запис голосу

## Приклади використання

### Ручне редагування

1. Виберіть інтерактивний компонент на canvas
2. В RightSidebar оберіть таб "Properties"
3. Змініть потрібні властивості через UI контроли
4. Зміни застосовуються в real-time

### AI редагування

1. Виберіть інтерактивний компонент
2. В RightSidebar перейдіть на таб "AI Assistant"
3. Оберіть Quick Improvement або введіть свою інструкцію
4. Натисніть "Apply AI Edit"
5. AI проаналізує та застосує зміни

**Приклади інструкцій:**
- "Add 2 more colors to the game"
- "Make all images bigger and change the layout to grid"
- "Simplify for 3-year-olds with bigger buttons and simpler text"
- "Change the theme to ocean animals"

## Переваги системи

✅ **Пряма інтеграція** - Без зайвих обгорток і дублювання табів  
✅ **Єдиний AI компонент** - `AIAssistantPanel` для всіх типів елементів та сторінок  
✅ **Простота архітектури** - Немає умовної логіки для різних типів в AI табі  
✅ **Ручне + AI редагування** - Гнучкість у виборі способу через таби RightSidebar  
✅ **Уніфікований інтерфейс** - Однакова структура для всіх елементів  
✅ **Автоматична валідація** - Неможливо створити некоректний стан  
✅ **Type-safe** - Повна типізація TypeScript  
✅ **Розширюваність** - Легко додавати нові типи полів  
✅ **DRY принцип** - Немає дублювання коду  
✅ **Відповідає SOLID** - Чиста архітектура з розділенням відповідальностей  
✅ **Чистий UI** - Використання існуючих табів RightSidebar замість вкладених карток  
✅ **Універсальність AI** - Один асистент для всього, адаптується до контексту

## Технічні деталі

### Потік даних

```
User Action → ManualPropertyEditor → onChange callback
                                            ↓
                                      RightSidebar
                                            ↓
                                        onUpdate
                                            ↓
                                   Step3CanvasEditor
                                            ↓
                                 Update element in state
                                            ↓
                                     Re-render canvas
```

### AI Editing Flow

```
User Instruction → AIAssistantPanel (універсальний) → onAIEdit callback
                                                              ↓
                                                     Step3CanvasEditor
                                                              ↓
                                                 WorksheetEditingService
                                                              ↓
                                                       Gemini AI API
                                                              ↓
                                                      Generate patch
                                                              ↓
                                                Apply patch to properties
                                                              ↓
                                                     Update element state
                                                              ↓
                                                 Display changes in history
```

## Підтримка

Для питань та пропозицій:
- Створіть issue в репозиторії
- Зверніться до команди розробки

---

**Версія:** 2.1.0  
**Дата:** 2025-10-20  
**Автор:** AI Assistant  
**Зміни:** Спрощена архітектура AI - тепер використовується тільки AIAssistantPanel для всіх типів компонентів

