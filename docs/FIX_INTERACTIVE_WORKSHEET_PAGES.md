# Fix: Interactive Worksheet Pages

## Проблема

Коли генерували worksheet з `contentMode: 'interactive'`, система використовувала інтерактивні компоненти, але створювала PDF сторінки (A4, фіксований розмір) замість інтерактивних сторінок (scrollable, динамічний розмір). Також потрібно було реалізувати різну структуру сторінок для різних вікових груп.

## Рішення

### 1. Оновлено Типи

**Файл:** `src/types/worksheet-generation.ts`

Додано поля:
- `pageType?: 'pdf' | 'interactive'` в `GeneratedPage`
- `contentMode?: 'pdf' | 'interactive'` в `WorksheetMetadata`

### 2. Оновлено ContentPaginationService

**Файл:** `src/services/worksheet/ContentPaginationService.ts`

- Додано поле `private contentMode: 'pdf' | 'interactive' = 'pdf'`
- Додано метод `setContentMode(mode: 'pdf' | 'interactive')`
- Оновлено `createPage()` щоб встановлювати `pageType` на основі `contentMode`

### 3. Передано contentMode Через Генерацію

**Файл:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

В методі `generateWorksheet()`:
- Додано виклик `setContentMode(request.contentMode || 'pdf')`
- Додано `contentMode` в метадані відповіді

### 4. Реалізовано Age-Specific Структуру

**Файл:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

Створено метод `getAgeSpecificInteractiveStructureGuidelines(ageGroup: string)` який визначає структуру сторінок:

**Віки 2-5 (Toddlers & Preschool):**
- Структура: Giant Title (emoji) → 1 Large Interactive Component
- БЕЗ body text, БЕЗ окремих images
- Один великий інтерактивний елемент на всю сторінку
- Компоненти: tap-image, color-matcher, simple-counter, memory-cards (2-4 картки)

**Віки 6-7 (Early Elementary):**
- Структура: Title → Simple Instructions (1 речення) → 1-2 Interactive Components
- Мінімум тексту, великі елементи
- Можливо 1 image якщо потрібно
- Додаткові компоненти: simple-drag-and-drop, shape-tracer, emotion-recognizer

**Віки 8-10 (Elementary):**
- Структура: Title → Body Text (2-3 речення) → Image (optional) → Interactive Component → Instructions
- Короткі пояснення концепцій
- 1 основний інтерактивний компонент (або 2 менші)
- Складніші версії компонентів: memory-cards (6-12 карток), sequence-builder, sorting-game

**Віки 11+ (Upper Elementary & Middle School):**
- Структура: Title → Body Text → Multiple Interactive Components → Reflection Questions
- Детальні пояснення (3-5 речень)
- Множинні інтерактивні компоненти
- Рефлексійні запитання

### 5. Інтегровано в AI Prompts

Додано виклик `getAgeSpecificInteractiveStructureGuidelines(ageGroup)` в `buildGenerationPrompt()` для інтерактивного режиму.

## Технічні Деталі

### Розміри Сторінок
- **PDF:** 794px × 1123px (A4 format)
- **Interactive:** 1200px × 800px (широкий формат, scrollable)

### Доступні Інтерактивні Компоненти
В `src/components/worksheet/canvas/interactive/`:
- TapImage - натискай на картинки
- ColorMatcher - підбирай кольори
- SimpleCounter - лічи об'єкти
- MemoryCards - гра пам'яті
- SortingGame - сортування категорій
- ShapeTracer - обведи фігури
- EmotionRecognizer - розпізнай емоції
- SoundMatcher - підбирай звуки
- SimplePuzzle - прості пазли
- PatternBuilder - створюй паттерни
- CauseEffectGame - причина-наслідок
- RewardCollector - збирай нагороди
- VoiceRecorder - записуй голос

## Результат

Після виправлення:

✅ Worksheet з `contentMode: 'interactive'` створюють сторінки з `pageType: 'interactive'`
✅ Інтерактивні сторінки мають правильні розміри (1200×800) і можуть прокручуватись
✅ Структура сторінок адаптована під вікову групу
✅ Молодші діти отримують простішу структуру (title + 1 component)
✅ Старші діти отримують складнішу структуру (title + body + images + components)
✅ AI генерує контент згідно age-specific guidelines

## Тестування

Щоб протестувати:
1. Перейти на `/worksheet-editor`
2. Вибрати параметри worksheet
3. **Важливо:** Вибрати `Content Mode: Interactive`
4. Вибрати вікову групу (3-5, 6-7, 8-9, тощо)
5. Згенерувати worksheet
6. Перевірити що:
   - Сторінки мають значок ⚡ замість 📄
   - Структура відповідає віковій групі
   - Інтерактивні компоненти працюють правильно
   - Сторінка scrollable і має правильні розміри

## Змінені Файли

- `src/types/worksheet-generation.ts` - оновлено типи
- `src/services/worksheet/ContentPaginationService.ts` - додано contentMode логіку
- `src/services/worksheet/GeminiWorksheetGenerationService.ts` - додано age-specific структуру та інтеграцію

**Статистика:** 297 рядків додано, 2 видалено, 3 файли змінено

**Коміт:** `14a4c90` - "fix: Interactive worksheet pages now use correct pageType and age-specific structure"

