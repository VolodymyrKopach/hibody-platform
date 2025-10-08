# Enhanced Smart Pagination System

## Огляд

Покращена система автоматичної пагінації контенту з чіткою ієрархією правил для логічного групування елементів.

## Проблема

Базова пагінація просто ділить контент по висоті, не враховуючи смисловий зв'язок між елементами:

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

## Рішення: Гібридний Підхід

### Основний Принцип

**НІКОЛИ не розбивати атомні компоненти** - якщо елемент не вміщується, переносимо його повністю.

**Розумно групувати структурні елементи** - якщо заголовок/розділювач/інструкції залишаться самі, переносимо їх разом з контентом.

### Атомні Компоненти (НЕ розбиваються)

```typescript
const atomicComponents = [
  'title-block',         // Заголовки
  'subtitle-block',
  'fill-blank',          // Вправи
  'multiple-choice',
  'match-pairs',
  'true-false',
  'short-answer',
  'word-bank',
  'table',               // Таблиці
  'image-block',         // Зображення
  'image-with-caption',
  'instructions-box',    // Інструкції
  'tip-box',            // Бокси
  'warning-box',
  'box',
  'divider',            // Роздільники
];
```

### Структурні Елементи (Груповані)

Елементи, які формують логічні групи:
- **Title** - заголовок секції
- **Divider** - візуальний роздільник
- **Instructions** - інструкції до вправи

---

## Ієрархія Правил Smart Pagination

### PRIORITY 1: Prevent Orphan Structural Elements

Запобігаємо "самотнім" структурним елементам.

#### Rule 1.1: Orphan Title Prevention

**Проблема:** Заголовок залишається сам на сторінці

```
❌ ПОГАНО:
Page 1:
  - Body text
  - Exercise 1: Fill the Blanks ← Title сам

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

**Логіка:**
```typescript
if (lastElement === 'title' && nextElement === 'content/exercise') {
  → Move title to next page
}
```

#### Rule 1.2: Divider + Title Prevention

**Проблема:** Divider і Title залишаються самі

```
❌ ПОГАНО:
Page 1:
  - Body text
  - ─────────────
  - Exercise 1: Fill the Blanks

Page 2:
  - Instructions
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - ─────────────
  - Exercise 1: Fill the Blanks
  - Instructions
  - Fill-blank exercise
```

**Логіка:**
```typescript
if (secondLastElement === 'divider' && 
    lastElement === 'title' && 
    nextElement === 'content/exercise') {
  → Move both divider and title to next page
}
```

#### Rule 1.3: Orphan Divider Prevention

**Проблема:** Divider залишається сам

```
❌ ПОГАНО:
Page 1:
  - Body text
  - ─────────────

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - ─────────────
  - Exercise 1: Fill the Blanks
  - Instructions
```

**Логіка:**
```typescript
if (lastElement === 'divider' && 
    (nextElement === 'title' || nextElement === 'content/exercise')) {
  → Move divider to next page
}
```

---

### PRIORITY 2: Keep Logical Pairs Together

Тримаємо логічні пари разом.

#### Rule 2.1: Instructions + Exercise

**Проблема:** Інструкції на одній сторінці, вправа на іншій

```
❌ ПОГАНО:
Page 1:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete the sentences...

Page 2:
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete the sentences...
  - Fill-blank exercise
```

**Логіка:**
```typescript
if (lastElement === 'instructions' && nextElement === 'exercise') {
  → Move instructions to next page to keep with exercise
}
```

#### Rule 2.2: Title + Instructions (if exercise follows)

**Проблема:** Title і Instructions розділені від exercise

```
❌ ПОГАНО:
Page 1:
  - Body text
  - Exercise 1: Fill the Blanks
  - Instructions: Complete...

Page 2:
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete...
  - Fill-blank exercise
```

**Логіка:**
```typescript
if (secondLastElement === 'title' && 
    lastElement === 'instructions' && 
    nextElement === 'exercise') {
  → Move title + instructions to next page
}
```

#### Rule 2.3: Title + First Content Paragraph

**Проблема:** Title без контенту (м'яке правило)

```
❌ ПОГАНО:
Page 1:
  - Body text
  - Section 2: New Topic

Page 2:
  - First paragraph about new topic...
  - More content...

✅ ДОБРЕ (якщо є місце):
Page 1:
  - Body text

Page 2:
  - Section 2: New Topic
  - First paragraph about new topic...
  - More content...
```

**Логіка:**
```typescript
if (lastElement === 'title' && 
    nextElement === 'content' && 
    moreSimilarContentFollows) {
  → Move title to next page to start section properly
}
```

---

### PRIORITY 3: Smart Lookahead (Multi-Element)

Дивимося вперед на кілька елементів для кращого групування.

#### Rule 3.1: Title's ALL Content Moves

**Проблема:** Title є, але весь його контент переноситься

```
❌ ПОГАНО:
Page 1:
  - Previous content
  - Exercise 1: Fill the Blanks  ← Title є
  - (no content for this title)

Page 2:
  - Instructions: Complete...     ← Весь контент тут
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Previous content

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete...
  - Fill-blank exercise
```

**Логіка:**
```typescript
// Знайти останній title на сторінці
const titleIndex = findLastTitleInPage(currentPage);

// Перевірити, чи є контент після title
const elementsAfterTitle = currentPage.slice(titleIndex + 1);
const hasContentAfterTitle = elementsAfterTitle.some(el => 
  isContentElement(el) || isExerciseElement(el)
);

// Якщо НЕ має контенту, але наступний елемент - контент
if (!hasContentAfterTitle && isContentOrExercise(nextElement)) {
  → Move title group to next page
}
```

#### Rule 3.2: Lookahead 2+ Elements

**Проблема:** Не бачимо повну картину activity block

```
Current page ends with: Title
Next element: Instructions
Element after next: Exercise

❌ ПОГАНО (без lookahead):
Page 1:
  - Body text
  - Exercise 1: Fill the Blanks  ← Title сам

Page 2:
  - Instructions
  - Fill-blank exercise

✅ ДОБРЕ (з lookahead):
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions
  - Fill-blank exercise
```

**Логіка:**
```typescript
if (remainingElements.length >= 1) {
  const elementAfterNext = remainingElements[0];
  
  // Pattern: Title → Instructions → Exercise
  if (lastElement === 'title' && 
      nextElement === 'instructions' && 
      elementAfterNext === 'exercise') {
    → Move title to start complete activity block on next page
  }
}
```

#### Rule 3.3: Section Start Detection

**Проблема:** Початок нової секції розбивається

```
❌ ПОГАНО:
Page 1:
  - Body text
  - ─────────────
  - Section 2: Grammar Rules
  - Instructions: Study the rules

Page 2:
  - Grammar explanation...
  - Exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - ─────────────
  - Section 2: Grammar Rules
  - Instructions: Study the rules
  - Grammar explanation...
```

**Логіка:**
```typescript
const lastThreeElements = currentPage.slice(-3);
const hasTitleInGroup = lastThreeElements.some(el => isTitleElement(el));
const hasOnlyStructural = lastThreeElements.every(el => 
  isTitleElement(el) || isDividerElement(el) || isInstructionsElement(el)
);

if (hasTitleInGroup && hasOnlyStructural && 
    (isExerciseElement(nextElement) || isContentElement(nextElement))) {
  → Move structural group to next page to start section properly
}
```

---

### PRIORITY 4: Activity Block Detection

Розпізнаємо повні activity blocks (Title + Instructions + Exercise).

#### Rule 4.1: Complete Activity Block

**Ситуація:** Activity block вже завершений, наступний - нова вправа

```
✅ ПРАВИЛЬНО:
Page 1:
  - Exercise 1: Fill the Blanks    ← Title
  - Instructions: Complete...       ← Instructions
  - Fill-blank exercise #1          ← Exercise (complete!)

Page 2:
  - Fill-blank exercise #2          ← Нова вправа (нова сторінка OK)
```

**Логіка:**
```typescript
if (thirdLastElement === 'title' && 
    secondLastElement === 'instructions' && 
    lastElement === 'exercise' && 
    nextElement === 'exercise') {
  → DON'T move (activity block complete, next exercise can start new page)
  return false;
}
```

#### Rule 4.2: Incomplete Activity Block

**Ситуація:** Activity block incomplete, exercise coming

```
❌ ПОГАНО:
Page 1:
  - Body text
  - Exercise 1: Fill the Blanks
  - Instructions: Complete...

Page 2:
  - Fill-blank exercise

✅ ДОБРЕ:
Page 1:
  - Body text

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete...
  - Fill-blank exercise
```

**Логіка:**
```typescript
if (secondLastElement === 'title' && 
    lastElement === 'instructions' && 
    nextElement === 'exercise') {
  → Move title + instructions to complete activity block on next page
}
```

---

## Стратегії Переміщення Елементів

Після того, як система вирішила, що потрібно переміщувати елементи, вона використовує стратегії для визначення **які саме** елементи переносити.

### Strategy 1: Activity Block (Highest Priority)

Детектуємо incomplete activity blocks.

**Pattern 1:** Divider + Title + Instructions (incomplete)
```typescript
if (elements[-3] === 'divider' && 
    elements[-2] === 'title' && 
    elements[-1] === 'instructions' && 
    nextElement === 'exercise') {
  → Move [divider, title, instructions]
}
```

**Pattern 2:** Title + Instructions (incomplete)
```typescript
if (elements[-2] === 'title' && 
    elements[-1] === 'instructions' && 
    nextElement === 'exercise') {
  // Check for divider before title
  if (elements[-3] === 'divider') {
    → Move [divider, title, instructions]
  } else {
    → Move [title, instructions]
  }
}
```

### Strategy 2: Title Group

Переміщуємо title з усіма structural elements після нього.

```typescript
// Знайти останній title
const titleIndex = findLastTitleInPage(currentPage);

// Перевірити, чи всі елементи після title structural
const elementsAfterTitle = currentPage.slice(titleIndex + 1);
const allStructural = elementsAfterTitle.every(el =>
  isDividerElement(el) || isInstructionsElement(el)
);

if (allStructural && isContentOrExercise(nextElement)) {
  → Move entire group [title, ...structuralElements]
}
```

**Приклад:**
```
Current page:
  - Body text
  - ─────────────    ← titleIndex = 1 (title starts here)
  - Exercise 1       ← Title
  - Instructions     ← Structural

Next element: Exercise

→ Move [divider, title, instructions] (entire group)
```

### Strategy 3: Structural Pairs

Переміщуємо логічні пари структурних елементів.

**Pair 3.1:** Divider + Title
```typescript
if (elements[-2] === 'divider' && 
    elements[-1] === 'title' && 
    isContentOrExercise(nextElement)) {
  → Move [divider, title]
}
```

**Pair 3.2:** Title + Instructions
```typescript
if (elements[-2] === 'title' && 
    elements[-1] === 'instructions') {
  // Check for divider before title
  if (elements[-3] === 'divider') {
    → Move [divider, title, instructions]
  } else {
    → Move [title, instructions]
  }
}
```

**Pair 3.3:** Instructions + Short Content (soft rule)
```typescript
if (elements[-2] === 'instructions' && 
    elements[-1] === 'content' && 
    nextElement === 'exercise') {
  → Move [instructions, content]
  // Only if content is short intro
}
```

### Strategy 4: Single Structural Elements

Переміщуємо одиничні структурні елементи.

```typescript
// Single 4.1: Title alone
if (lastElement === 'title') {
  → Move [title]
}

// Single 4.2: Divider alone
if (lastElement === 'divider') {
  → Move [divider]
}

// Single 4.3: Instructions alone
if (lastElement === 'instructions') {
  → Move [instructions]
}
```

### Strategy 5: Extended Lookahead (Last Resort)

Дивимося на останні 3-4 елементи і шукаємо title.

```typescript
if (currentPage.length >= 4) {
  const lastFour = currentPage.slice(-4);
  const titleInLastFour = lastFour.findIndex(el => isTitleElement(el));
  
  if (titleInLastFour !== -1) {
    const startIndex = currentPage.length - 4 + titleInLastFour;
    const groupToMove = currentPage.slice(startIndex);
    
    // Only if group doesn't contain complete content
    if (!groupToMove.some(el => isExerciseElement(el))) {
      → Move entire group from title to end
    }
  }
}
```

---

## Приклади Роботи

### Приклад 1: Basic Orphan Title

**Вхідні дані:**
```json
[
  { "type": "body-text", "height": 900 },
  { "type": "title-block", "height": 80 },
  { "type": "fill-blank", "height": 480 }
]
```

Available height: 1000px

**Процес:**

```
📄 Element 1: body-text (900px)
  ✅ Fits on page 1 (900px / 1000px)

📄 Element 2: title-block (80px)
  ✅ Fits on page 1 (980px / 1000px)

📄 Element 3: fill-blank (480px)
  ⚠️ Doesn't fit! (980 + 480 = 1460px > 1000px)
  🧠 Checking smart logic...
  
  Last element: title-block
  Next element: fill-blank (exercise)
  
  🧠 [P1.1] Orphan prevention: Title would be alone
  📦 [S4.1] Moving single: Title
  
  📝 Page 1: [body-text] (900px)
  📄 Page 2 starts with: [title-block, fill-blank]
```

**Результат:**
```
Page 1: (900px)
  - Body text

Page 2: (560px)
  - Exercise 1: Fill the Blanks
  - Fill-blank exercise
```

✅ Title разом з вправою!

### Приклад 2: Activity Block

**Вхідні дані:**
```json
[
  { "type": "body-text", "height": 850 },
  { "type": "divider", "height": 20 },
  { "type": "title-block", "height": 80 },
  { "type": "instructions-box", "height": 100 },
  { "type": "fill-blank", "height": 480 }
]
```

Available height: 1000px

**Процес:**

```
📄 Element 1: body-text (850px)
  ✅ Fits on page 1

📄 Element 2: divider (20px)
  ✅ Fits on page 1 (870px / 1000px)

📄 Element 3: title-block (80px)
  ✅ Fits on page 1 (950px / 1000px)

📄 Element 4: instructions-box (100px)
  ⚠️ Doesn't fit! (950 + 100 = 1050px > 1000px)
  🧠 Checking smart logic...
  
  Last element: title-block
  Next element: instructions-box
  Element after next: fill-blank (exercise)
  
  🧠 [P3.2] Lookahead detected: Title → Instructions → Exercise group
  📦 [S2] Moving title group: 2 elements (divider + title)
  
  📝 Page 1: [body-text] (850px)
  📄 Page 2 starts with: [divider, title-block, instructions-box]

📄 Element 5: fill-blank (480px)
  ⚠️ Doesn't fit! (200 + 480 = 680px with current elements)
  🧠 Checking smart logic...
  
  Last element: instructions-box
  Next element: fill-blank (exercise)
  
  🧠 [P2.1] Keep together: Instructions + Exercise
  📦 [S1] Moving activity block start: Divider + Title + Instructions
  
  📝 Page 1: [body-text] (850px)
  📄 Page 2: [divider, title, instructions, fill-blank]
```

**Результат:**
```
Page 1: (850px)
  - Body text

Page 2: (680px)
  - ─────────────
  - Exercise 1: Fill the Blanks
  - Instructions: Complete the sentences...
  - Fill-blank exercise
```

✅ Вся activity block разом!

### Приклад 3: Multiple Exercises

**Вхідні дані:**
```json
[
  { "type": "body-text", "height": 700 },
  { "type": "title-block", "height": 80 },
  { "type": "instructions-box", "height": 100 },
  { "type": "multiple-choice", "height": 150 },
  { "type": "multiple-choice", "height": 150 }
]
```

Available height: 1000px

**Процес:**

```
📄 Elements 1-4: body + title + instructions + choice
  Result: Page 1 = [body, title, instructions, choice1] (1030px)
  ⚠️ Slightly over, but title + instructions + choice1 form complete activity

📄 Element 5: multiple-choice (150px)
  🧠 Checking smart logic...
  
  Third last: title
  Second last: instructions
  Last: exercise
  Next: exercise
  
  🧠 [P4.1] Activity block complete: Don't move (multiple exercises)
  → New page is OK for second exercise
  
  📝 Page 1: [body, title, instructions, choice1]
  📄 Page 2: [choice2]
```

**Результат:**
```
Page 1:
  - Body text
  - Exercise 1: Choose correct answer
  - Instructions: Select...
  - Multiple choice #1

Page 2:
  - Multiple choice #2
```

✅ Перша вправа з activity block, друга на новій сторінці!

### Приклад 4: Section Start

**Вхідні дані:**
```json
[
  { "type": "body-text", "height": 850 },
  { "type": "body-text", "height": 100 },
  { "type": "divider", "height": 20 },
  { "type": "title-block", "height": 80 },
  { "type": "body-text", "height": 150 }
]
```

Available height: 1000px

**Процес:**

```
📄 Elements 1-2: body texts (950px)
  ✅ Fit on page 1

📄 Element 3: divider (20px)
  ✅ Fits (970px / 1000px)

📄 Element 4: title-block (80px)
  ⚠️ Doesn't fit! (970 + 80 = 1050px)
  🧠 Checking smart logic...
  
  Last element: divider
  Next element: title
  
  🧠 [P1.3] Orphan prevention: Divider would be alone
  📦 [S4.2] Moving single: Divider
  
  📝 Page 1: [body, body] (950px)
  📄 Page 2 starts with: [divider, title]

📄 Element 5: body-text (150px)
  ✅ Fits with divider + title (250px / 1000px)
```

**Результат:**
```
Page 1: (950px)
  - Body text
  - Body text

Page 2: (250px)
  - ─────────────
  - Section 2: New Topic
  - First paragraph...
```

✅ Секція починається чисто на новій сторінці!

---

## Порівняння: До і Після

### Scenario A: Research Paper

**До покращень:**
```
Page 1:
  - Introduction paragraph
  - ───────────────────────
  - Chapter 2: Methodology

Page 2:
  - Methodology paragraph
  - Methods list
```
❌ Chapter title alone

**Після покращень:**
```
Page 1:
  - Introduction paragraph

Page 2:
  - ───────────────────────
  - Chapter 2: Methodology
  - Methodology paragraph
  - Methods list
```
✅ Chapter starts cleanly

### Scenario B: Worksheet with Exercise

**До покращень:**
```
Page 1:
  - Grammar explanation
  - Exercise 1: Fill the Blanks
  - Instructions: Complete each sentence

Page 2:
  - 1. She _____ (go) to school
  - 2. They _____ (play) football
  - Word Bank: [go, goes, play, plays]
```
❌ Title + Instructions separated from exercise

**Після покращень:**
```
Page 1:
  - Grammar explanation

Page 2:
  - Exercise 1: Fill the Blanks
  - Instructions: Complete each sentence
  - 1. She _____ (go) to school
  - 2. They _____ (play) football
  - Word Bank: [go, goes, play, plays]
```
✅ Complete activity block together

### Scenario C: Multiple Activities

**До покращень:**
```
Page 1:
  - Warm-up activity
  - ───────────────────────
  - Activity 1: Vocabulary
  - Instructions: Match the words

Page 2:
  - Matching exercise
  - Activity 2: Grammar
  - Instructions: Fill in the blanks

Page 3:
  - Fill-blank exercise
```
❌ Poor organization

**Після покращень:**
```
Page 1:
  - Warm-up activity

Page 2:
  - ───────────────────────
  - Activity 1: Vocabulary
  - Instructions: Match the words
  - Matching exercise

Page 3:
  - Activity 2: Grammar
  - Instructions: Fill in the blanks
  - Fill-blank exercise
```
✅ Each activity complete on its page

---

## Implementation

### ContentPaginationService

**File:** `src/services/worksheet/ContentPaginationService.ts`

**Key Methods:**

```typescript
// Check if elements should be moved for better grouping
private shouldMoveElementsForBetterGrouping(
  currentPage: GeneratedElement[],
  nextElement: GeneratedElement,
  remainingElements: GeneratedElement[]
): boolean

// Find which elements to move
private findElementsToMoveToNextPage(
  currentPage: GeneratedElement[],
  nextElement: GeneratedElement
): GeneratedElement[]

// Helper methods
private isTitleElement(element): boolean
private isDividerElement(element): boolean
private isInstructionsElement(element): boolean
private isContentElement(element): boolean
private isExerciseElement(element): boolean
private findLastTitleInPage(currentPage): number
```

### DynamicPaginationService

**File:** `src/services/worksheet/DynamicPaginationService.ts`

Same methods but works with **measured heights** from DOM instead of estimated heights.

**Key Difference:**
```typescript
// ContentPaginationService: Uses estimated heights
const elementHeight = this.estimateElementHeight(element);

// DynamicPaginationService: Uses measured heights from DOM
const elementHeight = element.measuredHeight;
```

---

## Переваги

### 1. Природна Організація ✅
- Контент організований як людина б зробила
- Логічні групи залишаються разом
- Легко читати та розуміти

### 2. Краща UX ✅
- Учні не шукають інструкції на попередній сторінці
- Заголовок завжди з контентом
- Вправи повністю на одній сторінці (коли можливо)

### 3. Професійний Вигляд ✅
- Немає "самотніх" заголовків
- Роздільники роблять смисл
- Чисті розриви сторінок

### 4. Інтуїтивність ✅
- Система "думає" як людина
- Передбачає потреби користувача
- Автоматично виправляє погані розриви

### 5. Чітка Ієрархія ✅
- Правила мають пріоритети
- Зрозуміло, чому система робить певні рішення
- Легко розширювати нові правила

---

## Логування

Система детально логує всі рішення з мітками пріоритетів та стратегій:

```
📄 PAGINATION: Processing element 4/6 (title-block), height: 80px
  ⚠️ Element doesn't fit on page 1 (950 + 80 > 1000px)
  🧠 Smart logic: Applying orphan prevention
  🧠 [P1.1] Orphan prevention: Title would be alone
  📦 [S4.1] Moving single: Title
  📝 Created page 1 with 3 elements
  📄 Started new page 2 with moved elements + current element
```

### Розшифровка міток:

- `[P1.1]` - Priority 1, Rule 1 (Prevent Orphan Structural Elements)
- `[P2.1]` - Priority 2, Rule 1 (Keep Logical Pairs Together)
- `[P3.1]` - Priority 3, Rule 1 (Smart Lookahead)
- `[P4.1]` - Priority 4, Rule 1 (Activity Block Detection)

- `[S1]` - Strategy 1 (Activity Block)
- `[S2]` - Strategy 2 (Title Group)
- `[S3.1]` - Strategy 3, Pair 1 (Structural Pairs)
- `[S4.1]` - Strategy 4, Single 1 (Single Structural Elements)
- `[S5]` - Strategy 5 (Extended Lookahead)

---

## Тестування

### Test Cases

```typescript
// Test Case 1: Orphan Title
const elements = [
  { type: 'body-text', height: 900 },
  { type: 'title-block', height: 80 },
  { type: 'fill-blank', height: 480 }
];
// Expected: Page 1: [body], Page 2: [title, exercise]

// Test Case 2: Divider + Title
const elements = [
  { type: 'body-text', height: 850 },
  { type: 'divider', height: 20 },
  { type: 'title-block', height: 80 },
  { type: 'instructions-box', height: 100 },
  { type: 'fill-blank', height: 480 }
];
// Expected: Page 1: [body], Page 2: [divider, title, instructions, exercise]

// Test Case 3: Activity Block Complete
const elements = [
  { type: 'title-block', height: 80 },
  { type: 'instructions-box', height: 100 },
  { type: 'multiple-choice', height: 300 },
  { type: 'multiple-choice', height: 300 }
];
// Expected: Page 1: [title, instructions, choice1], Page 2: [choice2]

// Test Case 4: Lookahead
const elements = [
  { type: 'body-text', height: 950 },
  { type: 'title-block', height: 80 },
  { type: 'instructions-box', height: 100 },
  { type: 'fill-blank', height: 400 }
];
// Expected: Page 1: [body], Page 2: [title, instructions, exercise]
```

### Testing Commands

```bash
# Run pagination tests
npm test ContentPaginationService
npm test DynamicPaginationService

# Visual testing in UI
npm run dev
# Navigate to Worksheet Generator
# Generate worksheet with various content types
# Check page breaks in preview
```

---

## Обмеження

### 1. Атомність Компонентів

Якщо вся група (divider + title + instructions + exercise) не вміщується на сторінці, система все одно розмістить її на одній сторінці, тому що це **атомні компоненти**.

```
Page 2: (800px - більше за available 600px)
  - divider (20px)
  - title (80px)
  - instructions (100px)
  - fill-blank (600px)
  
✅ Це OK! Атомні компоненти не розбиваються.
```

### 2. Дуже Великі Вправи

Якщо вправа сама по собі більша за сторінку (800px+), вона все одно буде на окремій сторінці і може вийти за межі.

**Майбутнє покращення:** Warning для дуже великих компонентів.

### 3. Складні Вкладені Структури

Поточна система дивиться на плоску структуру елементів. Якщо є вкладені секції (Section > Subsection > Activity), вони обробляються як плоский список.

**Майбутнє покращення:** Hierarchical section detection.

---

## Майбутні Покращення

### 1. Hierarchical Section Detection
```typescript
// Detect nested sections
interface Section {
  level: number;         // 1, 2, 3 (H1, H2, H3)
  elements: Element[];
  subsections: Section[];
}

// Keep entire sections together when possible
```

### 2. Smart Paragraph Splitting
```typescript
// Split long paragraphs at sentence boundaries
if (paragraph.height > availableHeight) {
  const sentences = splitIntoSentences(paragraph);
  const part1 = fitSentences(sentences, availableHeight);
  const part2 = remaining(sentences);
  // Continue part2 on next page with "continued" indicator
}
```

### 3. Visual Indicators
```typescript
// Add "continued" markers
Page 1:
  - Long paragraph... (continued →)

Page 2:
  - (← continued) ...rest of paragraph
```

### 4. Configurable Rules
```typescript
interface PaginationConfig {
  enableOrphanPrevention: boolean;
  enableActivityBlockDetection: boolean;
  minElementsPerPage: number;
  maxElementsPerPage: number;
  strictGrouping: boolean;
}
```

### 5. Page Balance
```typescript
// Try to balance pages
// Instead of: Page 1 (900px), Page 2 (200px)
// Aim for: Page 1 (550px), Page 2 (550px)
```

### 6. Statistics & Analytics
```typescript
interface PaginationStats {
  totalPages: number;
  averagePageUtilization: number;  // % of page filled
  orphansPreventedCount: number;
  activityBlocksKept: number;
  improvementScore: number;        // vs. basic pagination
}
```

---

## Висновок

Покращена система Smart Pagination з чіткою ієрархією правил забезпечує:

✅ **Природне групування контенту** - як би людина організувала
✅ **Немає самотніх структурних елементів** - titles, dividers, instructions завжди з контентом
✅ **Activity blocks залишаються разом** - title + instructions + exercise
✅ **Чисті розриви сторінок** - секції починаються на нових сторінках
✅ **Зрозуміле логування** - кожне рішення пояснене з міткою пріоритету
✅ **Легко розширювати** - чітка структура дозволяє додавати нові правила

### Ключовий Принцип

> **Пагінація має бути не просто технічною (розділити по висоті), а смисловою (зберегти логіку контенту).** 🎯

### Відповідь на Початкове Питання

**Питання:** Розділяти контент чи переносити повністю?

**Відповідь:** **Гібридний підхід**
- Атомні компоненти → НІКОЛИ не розділяти, завжди переносити повністю
- Структурні елементи → Розумно групувати з контентом
- Логічні блоки → Тримати разом (activity blocks, sections)
- Довгі параграфи → (Майбутнє) Розділяти по реченнях з індикаторами

Це забезпечує найкращий баланс між технічними обмеженнями та природною організацією контенту.

