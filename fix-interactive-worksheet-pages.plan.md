<!-- 03d9bcb2-8e0c-475d-a8ae-805dbc23d89c 50e1de82-7b0c-4f2a-b451-4edc0458e3f5 -->
# План Виправлення Інтерактивних Worksheet Сторінок

## Проблема

Коли генеруємо worksheet з `contentMode: 'interactive'`, система використовує інтерактивні компоненти, але створює PDF сторінки (A4, фіксований розмір) замість інтерактивних сторінок (scrollable, динамічний розмір). Також потрібно реалізувати різну структуру сторінок для різних вікових груп.

## Основні Файли для Змін

1. `src/services/worksheet/GeminiWorksheetGenerationService.ts` - додати contentMode в метадані
2. `src/services/worksheet/ContentPaginationService.ts` - передавати і використовувати contentMode/pageType
3. `src/services/worksheet/GeminiWorksheetGenerationService.ts` (prompts) - додати age-specific структуру для інтерактивних сторінок
4. `src/types/worksheet-generation.ts` - додати pageType в GeneratedPage

## Кроки Реалізації

### 1. Оновити Типи

**Файл:** `src/types/worksheet-generation.ts`

Додати поле `pageType` в `GeneratedPage`:

```typescript
export interface GeneratedPage {
  pageNumber: number;
  title: string;
  background?: PageBackgroundConfig;
  elements: GeneratedElement[];
  ageGroup?: string;
  pageType?: 'pdf' | 'interactive'; // NEW
}
```

### 2. Передати contentMode Через Пагінацію

**Файл:** `src/services/worksheet/ContentPaginationService.ts`

Додати поле `contentMode` в клас і методи:

- Додати `private contentMode: 'pdf' | 'interactive' = 'pdf'` в клас
- Додати метод `setContentMode(mode: 'pdf' | 'interactive')`
- Оновити `createPage()` щоб встановлювати `pageType` на основі `contentMode`
- Оновити `paginateContent()` щоб приймати опціональний параметр `contentMode`

### 3. Використати contentMode в Генерації

**Файл:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

В методі `generateWorksheet()`:

- Зберегти `contentMode` з request
- Передати в `paginationService.setContentMode(request.contentMode || 'pdf')`
- Додати `contentMode` в metadata відповіді

### 4. Додати Age-Specific Структуру для Інтерактивних Сторінок

**Файл:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

Створити новий приватний метод `getAgeSpecificInteractiveStructureGuidelines(ageGroup: string)` який поверне інструкції для AI:

**Для 2-3 роки (вікова група '3-5' або '2-3'):**

- Структура: Giant Title (emoji + 1-2 слова) → 1 Interactive Component
- Без body text, без images
- Один великий інтерактивний елемент на всю сторінку

**Для 4-6 років (вікова група '6-7' або '4-6'):**

- Структура: Title → Simple Instructions (1 речення) → 1-2 Interactive Components
- Мінімум тексту, великі елементи
- Можливо 1 image якщо важливо для розуміння

**Для 7-8 років:**

- Структура: Title → Body Text (2-3 речення) → Image (optional) → Interactive Component → Instructions
- Більш складна структура, але все ще орієнтована на візуали

**Для 8+ років:**

- Структура: Title → Body Text → Multiple Interactive Components → Reflection Questions
- Повна структура з поясненнями

Інтегрувати ці guidelines в `buildGenerationPrompt()` коли `isInteractive === true`.

### 5. Оновити Prompt для Інтерактивного Режиму

**Файл:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

В методі `buildGenerationPrompt()`, коли `isInteractive === true`:

- Додати секцію з age-specific structure guidelines
- Наголосити що AI має генерувати компоненти згідно структури для віку
- Додати приклади для кожної вікової групи

### 6. Перевірити Рендеринг Інтерактивних Сторінок

**Файл:** `src/components/worksheet/Step3CanvasEditor.tsx`

Переконатися що код правильно визначає `pageType`:

- Рядок 214: `const isInteractive = page.pageType === 'interactive'`
- Рядок 229: `pageType: page.pageType || 'pdf'`

Це вже реалізовано правильно, просто перевіримо що працює.

### 7. Тестування

Перевірити генерацію для різних сценаріїв:

- PDF worksheet для різних віків
- Interactive worksheet для віків 3-5, 6-7, 8-9
- Перевірити що структура сторінок відповідає віковим вимогам
- Перевірити що pageType правильно встановлюється

## Технічні Деталі

### Розміри Сторінок

- PDF: 794px width, 1123px height (A4)
- Interactive: 900px width, min 1200px height (scrollable)

### Компоненти які Підтримуються

Інтерактивні компоненти вже існують в `src/components/worksheet/canvas/interactive/`:

- TapImage, ColorMatcher, SimpleCounter, MemoryCards
- SortingGame, ShapeTracer, EmotionRecognizer, SoundMatcher
- SimplePuzzle, PatternBuilder, RewardCollector, VoiceRecorder

## Очікуваний Результат

Після виправлення:

1. Worksheet з `contentMode: 'interactive'` створюватимуть сторінки з `pageType: 'interactive'`
2. Інтерактивні сторінки будуть scrollable і динамічного розміру
3. Структура сторінок буде адаптована під вікову групу
4. Молодші діти отримають простішу структуру (title + component)
5. Старші діти отримають складнішу структуру (title + body + images + components)

### To-dos

- [x] Додати поле pageType в GeneratedPage interface
- [x] Додати contentMode в ContentPaginationService і оновити createPage()
- [x] Передати contentMode через generateWorksheet() в пагінацію
- [x] Створити метод getAgeSpecificInteractiveStructureGuidelines()
- [x] Інтегрувати age-specific структуру в buildGenerationPrompt()
- [x] Перевірити що Step3CanvasEditor правильно рендерить обидва типи сторінок
- [x] Протестувати генерацію interactive worksheets для різних вікових груп

