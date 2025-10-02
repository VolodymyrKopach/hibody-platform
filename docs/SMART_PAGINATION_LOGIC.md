# Smart Pagination Logic - Логічне Групування Контенту

## Проблема

Базова пагінація просто ділить контент по висоті, але не враховує **смисловий зв'язок** між елементами:

❌ **Погані розриви:**
```
Page 1:
  - Body text
  - Body text
  - Divider
  - Exercise Title ← Залишився сам!

Page 2:
  - Instructions
  - Fill-blank exercise
```

## Правила Смислового Групування

### 1. Orphan Title Prevention (Запобігання Самотнім Заголовкам)

**Проблема:** Заголовок залишається сам на сторінці

**Рішення:** Переносимо заголовок на наступну сторінку разом з контентом

```
❌ ПОГАНО:
Page 1:
  - Body text
  - Exercise 1: Fill the Blanks ← Заголовок сам

Page 2:
  - Instructions
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions
  - Fill-blank exercise
```

### 2. Divider + Title Grouping (Групування Роздільника і Заголовка)

**Проблема:** Divider і заголовок залишаються самі, а контент переноситься

**Рішення:** Переносимо і divider, і заголовок разом

```
❌ ПОГАНО:
Page 1:
  - Body text
  - ───────────── ← Divider
  - Exercise 1: Fill the Blanks ← Title

Page 2:
  - Instructions
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - ───────────── ← Divider
  - Exercise 1: Fill the Blanks
  - Instructions
  - Fill-blank exercise
```

### 3. Instructions + Exercise Grouping (Інструкції з Вправою)

**Проблема:** Інструкції залишаються на одній сторінці, вправа на іншій

**Рішення:** Тримаємо інструкції і вправу разом

```
❌ ПОГАНО:
Page 1:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete the sentences... ← Інструкції

Page 2:
  - Fill-blank exercise ← Вправа окремо

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete the sentences...
  - Fill-blank exercise ← Разом!
```

### 4. Title + Instructions + Exercise Group

**Ідеальне групування:** Заголовок, інструкції та вправа - це одна логічна група

```
✅ ІДЕАЛЬНО:
Page 1:
  - Main title
  - Body text
  - Body text

Page 2:
  ┌─────────────────────────────────┐
  │ Exercise 1: Fill the Blanks     │ ← Title
  │ Instructions: Complete...       │ ← Instructions
  │ 1. She _____ (go) to school    │ ← Exercise
  │ 2. They _____ (play) football  │
  │ Word Bank: [go, goes, play...] │
  └─────────────────────────────────┘
  Все разом як одна логічна група!
```

## Алгоритм Роботи

### Крок 1: Перевірка на Кінці Сторінки

Коли елемент не вміщується, перевіряємо:

```typescript
// Що залишається на поточній сторінці?
const lastElement = currentPage[currentPage.length - 1];
const secondLastElement = currentPage[currentPage.length - 2];

// Що буде на наступній сторінці?
const nextElement = element; // Елемент, який не вміщується
```

### Крок 2: Застосування Правил

```typescript
// Rule 1: Orphan title prevention
if (lastElement === 'title' && nextElement === 'content/exercise') {
  → Move title to next page
}

// Rule 2: Divider + Title prevention
if (secondLastElement === 'divider' && lastElement === 'title') {
  → Move both to next page
}

// Rule 3: Instructions + Exercise together
if (lastElement === 'instructions' && nextElement === 'exercise') {
  → Move instructions to next page
}
```

### Крок 3: Переміщення Елементів

```typescript
// 1. Знайти елементи для переміщення
const elementsToMove = findElementsToMove(currentPage, nextElement);

// 2. Видалити їх з поточної сторінки
const remainingElements = currentPage.slice(0, -elementsToMove.length);

// 3. Зберегти поточну сторінку (без переміщених)
savePage(remainingElements);

// 4. Початок нової сторінки (з переміщеними + поточним)
startNewPage([...elementsToMove, nextElement]);
```

## Приклад Роботи

### Вхідні Дані

```json
[
  { "type": "body-text", "height": 100 },
  { "type": "body-text", "height": 150 },
  { "type": "divider", "height": 20 },
  { "type": "title-block", "height": 80 },
  { "type": "instructions-box", "height": 100 },
  { "type": "fill-blank", "height": 480 }
]
```

Доступна висота сторінки: **400px**

### Без Смислової Логіки (❌)

```
Page 1: (400px)
  - body-text (100px)
  - body-text (150px)
  - divider (20px)
  - title-block (80px)
  Total: 350px ✅ Вміщується

Page 2:
  - instructions-box (100px)
  - fill-blank (480px) → Не вміститься!

Page 3:
  - fill-blank (480px)
```

**Проблема:** Title сам на Page 1, instructions сам на Page 2!

### З Смисловою Логікою (✅)

```
Processing...

📄 Element: body-text (100px)
  ✅ Fits on page 1

📄 Element: body-text (150px)
  ✅ Fits on page 1

📄 Element: divider (20px)
  ✅ Fits on page 1

📄 Element: title-block (80px)
  ✅ Fits on page 1
  Current page: 350px

📄 Element: instructions-box (100px)
  ⚠️ Would be 450px - doesn't fit!
  🧠 Checking smart logic...
  
  Last element: title-block
  Next element: instructions-box
  
  🧠 Orphan prevention: Title would be alone!
  📦 Moving 2 elements (divider + title)
  
  Page 1 final: [body-text, body-text] = 250px
  Page 2 starts with: [divider, title, instructions]

📄 Element: fill-blank (480px)
  ⚠️ Doesn't fit!
  🧠 Checking smart logic...
  
  Last element: instructions-box
  Next element: fill-blank (exercise)
  
  🧠 Keep together: Instructions + Exercise!
  📦 Moving 3 elements (divider + title + instructions)
  
  Page 2 starts with: [divider, title, instructions, fill-blank]
```

### Фінальний Результат (✅)

```
Page 1: (250px)
  - body-text (100px)
  - body-text (150px)

Page 2: (680px → не вміщується, але це ОК - один atomic компонент)
  - divider (20px)
  - title-block (80px)
  - instructions-box (100px)
  - fill-blank (480px)
  ┌─────────────────────────────────┐
  │ Все разом як логічна група!     │
  └─────────────────────────────────┘
```

## Типи Елементів

### Titles (Заголовки)
- `title-block`

### Dividers (Роздільники)
- `divider`

### Instructions (Інструкції)
- `instructions-box`

### Content (Контент)
- `body-text`
- `paragraph-block`
- `text-block`
- `tip-box`
- `warning-box`
- `bullet-list`
- `numbered-list`
- `image-placeholder`

### Exercises (Вправи)
- `fill-blank`
- `multiple-choice`
- `true-false`
- `short-answer`
- `match-pairs`
- `table`

## Реалізація

### ContentPaginationService

**Файл:** `src/services/worksheet/ContentPaginationService.ts`

**Нові методи:**
```typescript
// Check if should apply smart logic
private shouldMoveElementsForBetterGrouping(
  currentPage: GeneratedElement[],
  nextElement: GeneratedElement,
  remainingElements: GeneratedElement[]
): boolean

// Find elements to move
private findElementsToMoveToNextPage(
  currentPage: GeneratedElement[],
  nextElement: GeneratedElement
): GeneratedElement[]

// Helper: Check element types
private isTitleElement(element): boolean
private isDividerElement(element): boolean
private isInstructionsElement(element): boolean
private isContentElement(element): boolean
private isExerciseElement(element): boolean
```

### DynamicPaginationService

**Файл:** `src/services/worksheet/DynamicPaginationService.ts`

Ті самі методи для динамічної пагінації з реальними вимірюваннями.

## Переваги

### 1. Природна Організація ✅
- Контент організований як людина б зробила
- Логічні групи залишаються разом
- Легко читати та розуміти

### 2. Краща UX ✅
- Учні не шукають інструкції на попередній сторінці
- Заголовок завжди з контентом
- Вправи повністю на одній сторінці (якщо можливо)

### 3. Професійний Вигляд ✅
- Немає "самотніх" заголовків
- Роздільники роблять смисл
- Чисті розриви сторінок

### 4. Інтуїтивність ✅
- Система "думає" як людина
- Передбачає потреби користувача
- Автоматично виправляє погані розриви

## Логування

Система детально логує всі рішення:

```
📄 PAGINATION: Processing element 4/6 (title-block)
  ⚠️ Element doesn't fit on page 1
  🧠 Smart logic: Applying orphan prevention
  🧠 Orphan prevention: Title would be alone
  📦 Moving 1 element(s) to next page for better grouping
  📝 Created page 1 with 3 elements
  📄 Started new page 2 with moved elements + current element
```

## Тестування

### Test Case 1: Orphan Title

```typescript
const elements = [
  { type: 'body-text', height: 900 },
  { type: 'title-block', height: 80 },
  { type: 'fill-blank', height: 480 }
];

// Expected:
// Page 1: body-text
// Page 2: title + fill-blank (разом!)
```

### Test Case 2: Divider + Title

```typescript
const elements = [
  { type: 'body-text', height: 850 },
  { type: 'divider', height: 20 },
  { type: 'title-block', height: 80 },
  { type: 'instructions-box', height: 100 },
  { type: 'fill-blank', height: 480 }
];

// Expected:
// Page 1: body-text
// Page 2: divider + title + instructions + fill-blank (вся група!)
```

### Test Case 3: Instructions + Exercise

```typescript
const elements = [
  { type: 'body-text', height: 900 },
  { type: 'instructions-box', height: 100 },
  { type: 'fill-blank', height: 480 }
];

// Expected:
// Page 1: body-text
// Page 2: instructions + fill-blank (разом!)
```

## Обмеження

### Атомність Компонентів

Якщо вся група (divider + title + instructions + exercise) не вміщується на одній сторінці, система все одно розмістить її на одній сторінці, тому що це **атомні компоненти**.

```
Page 2: (800px - більше за доступні 600px)
  - divider (20px)
  - title (80px)
  - instructions (100px)
  - fill-blank (600px)
  
Це OK! Атомні компоненти не розбиваються.
```

### Край Випадок: Дуже Великі Вправи

Якщо вправа сама по собі більша за сторінку (600px+), вона все одно буде на окремій сторінці.

## Майбутні Покращення

- [ ] Multi-level grouping (секції з підсекціями)
- [ ] Configurable grouping rules
- [ ] Visual preview of grouping decisions
- [ ] Statistics on improved vs. basic pagination
- [ ] A/B testing framework

## Висновок

Smart Pagination Logic робить систему **інтелектуальною** - вона розуміє структуру контенту і організовує його природно, як би людина зробила. Це створює кращий UX та професійний вигляд worksheet'ів.

**Ключовий принцип:** Пагінація має бути не просто технічною (розділити по висоті), а **смисловою** (зберегти логіку контенту). 🎯

