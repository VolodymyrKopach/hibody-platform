# Slide Components

Цей пакет містить переюзабельні компоненти для відображення різних секцій слайдів у планах уроків.

## Компоненти

### SlideHeader
Відображає заголовок слайду з навігацією та коментарями.

**Props:**
- `slideNumber: number` - номер слайду
- `slideType: string` - тип слайду (Introduction/Educational/Activity/Summary)
- `title: string` - назва слайду
- `goal: string` - мета слайду
- `currentIndex: number` - поточний індекс
- `totalSlides: number` - загальна кількість слайдів
- `onPrevSlide?: () => void` - обробник попереднього слайду
- `onNextSlide?: () => void` - обробник наступного слайду
- `isEditingMode?: boolean` - режим редагування
- `hasComments?: boolean` - наявність коментарів
- `commentCount?: number` - кількість коментарів
- `onAddComment?: (comment) => void` - обробник додавання коментарів

### SlideGreeting
Відображає секцію привітання слайду.

**Props:**
- `greeting: GreetingData` - дані привітання
- `showAction?: boolean` - показувати дію (default: true)
- `showTone?: boolean` - показувати тон (default: true)

**GreetingData:**
```typescript
interface GreetingData {
  text: string;
  action?: string;
  tone?: string;
}
```

### SlideMainContent
Відображає основний контент слайду з ключовими пунктами та візуальними елементами.

**Props:**
- `mainContent: MainContentData` - основний контент
- `showSayItPrompt?: boolean` - показувати підказку "Промовте" (default: true)
- `showKeyPoints?: boolean` - показувати ключові пункти (default: true)
- `showVisualElements?: boolean` - показувати візуальні елементи (default: true)

**MainContentData:**
```typescript
interface MainContentData {
  text: string;
  keyPoints?: string[];
  visualElements?: string[];
}
```

### SlideInteractions
Відображає інтерактивні елементи слайду.

**Props:**
- `interactions: InteractionData[]` - масив взаємодій
- `showTypes?: boolean` - показувати типи взаємодій (default: true)
- `showFeedback?: boolean` - показувати зворотний зв'язок (default: true)

**InteractionData:**
```typescript
interface InteractionData {
  type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
  description: string;
  instruction: string;
  feedback?: string;
}
```

### SlideActivities
Відображає активності слайду.

**Props:**
- `activities: ActivityData[]` - масив активностей
- `showDuration?: boolean` - показувати тривалість (default: true)
- `showMaterials?: boolean` - показувати матеріали (default: true)
- `showExpectedOutcome?: boolean` - показувати очікуваний результат (default: true)

**ActivityData:**
```typescript
interface ActivityData {
  name: string;
  description: string;
  duration?: string;
  materials?: string[];
  expectedOutcome?: string;
}
```

### SlideTeacherGuidance
Відображає керівництво для вчителя.

**Props:**
- `teacherGuidance: TeacherGuidanceData` - керівництво для вчителя
- `showSectionTitles?: boolean` - показувати заголовки секцій (default: true)

**TeacherGuidanceData:**
```typescript
interface TeacherGuidanceData {
  preparation?: string[];
  delivery?: string[];
  adaptations?: string[];
  troubleshooting?: string[];
}
```

### SlideFallbackContent
Відображає legacy контент слайду (HTML або звичайний текст).

**Props:**
- `content: string` - контент для відображення
- `allowHtml?: boolean` - дозволити HTML (default: true)
- `showPlaceholder?: boolean` - показувати заглушку (default: true)
- `placeholderText?: string` - текст заглушки

## Використання

```typescript
import {
  SlideHeader,
  SlideGreeting,
  SlideMainContent,
  SlideInteractions,
  SlideActivities,
  SlideTeacherGuidance,
  SlideFallbackContent
} from '@/components/templates/lesson-plan/slide-components';

// Або через основний експорт
import {
  SlideHeader,
  SlideGreeting
} from '@/components/templates/lesson-plan';
```

## Особливості

- **Переюзабельність**: Всі компоненти можуть використовуватися незалежно
- **Типізація**: Повна підтримка TypeScript
- **Кастомізація**: Більшість візуальних елементів можна вимкнути через props
- **Локалізація**: Підтримка i18n через react-i18next
- **Теми**: Інтеграція з Material-UI theming
- **Доступність**: Семантичний HTML та ARIA атрибути

## Стилізація

Всі компоненти використовують Material-UI theming систему:
- **Primary** - основний контент, привітання
- **Secondary** - активності
- **Success** - ключові пункти
- **Warning** - візуальні елементи
- **Info** - керівництво для вчителя
