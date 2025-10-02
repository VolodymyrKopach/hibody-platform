# Smart Lookahead Pagination - Розумна Логіка "Наперед"

## Концепція

Система тепер **дивиться наперед** і розуміє, чи весь контент, пов'язаний з заголовком, переноситься на наступну сторінку. Якщо так - переносимо і заголовок!

## Нова Логіка: Rule 4 - Smart Lookahead

### Що Перевіряється?

```typescript
// 1. Знайти останній title на поточній сторінці
const titleIndex = findLastTitleInPage(currentPage);

// 2. Перевірити, що після title є
const elementsAfterTitle = currentPage.slice(titleIndex + 1);

// 3. Чи є контент/вправи після title?
const hasContentAfterTitle = elementsAfterTitle.some(el => 
  isContent(el) || isExercise(el)
);

// 4. Якщо НІ контенту після title, але наступний елемент - це контент
//    → Весь контент переноситься! → Переносимо і title!
if (!hasContentAfterTitle && isContentOrExercise(nextElement)) {
  → Move title + все після нього
}
```

## Приклад 1: Title в Середині Сторінки

### Сценарій

```json
Elements:
[
  { "type": "body-text", "height": 700 }, // Page content
  { "type": "divider", "height": 20 },    // Separator
  { "type": "title-block", "height": 80 }, // Exercise title
  { "type": "instructions-box", "height": 100 }, // Instructions
  { "type": "fill-blank", "height": 480 }  // Exercise (won't fit!)
]

Available height: 1000px
```

### Без Smart Lookahead (❌)

```
Processing...

body-text (700px): ✅ Page 1
divider (20px): ✅ Page 1 (720px)
title (80px): ✅ Page 1 (800px)
instructions (100px): ✅ Page 1 (900px)
fill-blank (480px): ⚠️ Doesn't fit! (would be 1380px)

Result:
┌─────────────────────────────────┐
│         Page 1                  │
│                                 │
│  Body text...                   │
│  ─────────────                  │
│  Exercise 1: Fill the Blanks    │ ← Title
│  Instructions: Complete...      │ ← Instructions
│                                 │ ← NO EXERCISE!
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         Page 2                  │
│                                 │
│  1. She _____ (go) to school   │ ← Exercise alone!
│  2. They _____ (play) football │
│  Word Bank: [go, goes...]      │
└─────────────────────────────────┘

❌ ПРОБЛЕМА: Title і Instructions на Page 1, але ВПРАВА на Page 2!
```

### З Smart Lookahead (✅)

```
Processing...

body-text (700px): ✅ Page 1
divider (20px): ✅ Page 1 (720px)
title (80px): ✅ Page 1 (800px)
instructions (100px): ✅ Page 1 (900px)

fill-blank (480px): ⚠️ Doesn't fit!

🧠 Smart Lookahead activated!

Analysis:
  - Title is at index 2
  - Elements after title: [instructions]
  - Has content after title? NO (instructions is structural, not content)
  - Next element is exercise? YES
  
  🧠 Conclusion: ALL content is moving to page 2!
  📦 Moving title group: 3 elements (divider + title + instructions)

Result:
┌─────────────────────────────────┐
│         Page 1                  │
│                                 │
│  Body text...                   │
│                                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         Page 2                  │
│                                 │
│  ─────────────                  │ ← Divider
│  Exercise 1: Fill the Blanks    │ ← Title
│  Instructions: Complete...      │ ← Instructions
│  1. She _____ (go) to school   │ ← Exercise
│  2. They _____ (play) football │
│  Word Bank: [go, goes...]      │
│                                 │
└─────────────────────────────────┘

✅ ВСЯ ГРУПА РАЗОМ!
```

## Приклад 2: Два Title на Сторінці

### Сценарій

```json
Elements:
[
  { "type": "title-block", "height": 80 },  // Main title
  { "type": "body-text", "height": 150 },   // Intro text
  { "type": "divider", "height": 20 },      
  { "type": "title-block", "height": 80 },  // Exercise 1 title
  { "type": "instructions-box", "height": 100 },
  { "type": "fill-blank", "height": 480 }   // Won't fit
]

Available: 1000px
```

### Обробка

```
Processing...

title (80px): ✅ Page 1
body-text (150px): ✅ Page 1 (230px)
divider (20px): ✅ Page 1 (250px)
title (80px): ✅ Page 1 (330px) ← Exercise 1 title
instructions (100px): ✅ Page 1 (430px)

fill-blank (480px): ⚠️ Doesn't fit!

🧠 Smart Lookahead:

Find last title: index 3 (Exercise 1)
Elements after title: [instructions]
Has content? NO
Next is exercise? YES

🧠 Move title group from index 3!
📦 Moving: [divider, title, instructions]

Result:
┌─────────────────────────────────┐
│         Page 1                  │
│                                 │
│  Main Title                     │ ← First title stays
│  Introduction text...           │ ← Its content
│                                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         Page 2                  │
│                                 │
│  ─────────────                  │
│  Exercise 1: Fill the Blanks    │ ← Second title moved
│  Instructions: Complete...      │
│  1. She _____ (go) to school   │
└─────────────────────────────────┘

✅ Кожен title з своїм контентом!
```

## Логіка Визначення "Структурних" Елементів

**Структурні** (не контент):
- `divider` - роздільник
- `instructions-box` - інструкції
- `title-block` - заголовок

**Контент/Вправи**:
- `body-text` - текст
- `fill-blank` - вправа
- `multiple-choice` - вправа
- `tip-box` - порада
- тощо

## Алгоритм Smart Lookahead

```typescript
function smartLookahead(currentPage, nextElement) {
  // 1. Знайти останній title
  const titleIndex = findLastTitle(currentPage);
  if (titleIndex === -1) return false; // No title
  
  // 2. Перевірити елементи після title
  const afterTitle = currentPage.slice(titleIndex + 1);
  
  // 3. Чи всі вони структурні?
  const onlyStructural = afterTitle.every(el => 
    isStructural(el) // divider, instructions
  );
  
  // 4. Чи наступний елемент - це контент?
  const nextIsContent = isContent(nextElement) || isExercise(nextElement);
  
  // 5. Якщо після title тільки структурні елементи
  //    І наступний - це контент
  //    → Весь контент переноситься!
  if (onlyStructural && nextIsContent) {
    return true; // Move title group
  }
  
  return false;
}
```

## Переваги Smart Lookahead

### 1. Контекстне Розуміння ✅
Система розуміє **смисловий зв'язок** між елементами:
- Title → Instructions → Exercise = одна група
- Якщо Exercise переноситься → вся група переноситься

### 2. Природна Організація ✅
Контент організований так, як людина б зробила:
```
❌ НЕ ТАК:
Page 1: Title + Instructions (без вправи)
Page 2: Exercise (без контексту)

✅ ТАК:
Page 1: General content
Page 2: Title + Instructions + Exercise (разом!)
```

### 3. Гнучкість ✅
Працює з будь-якою кількістю title на сторінці:
- Один title → його група
- Два title → кожен з своєю групою
- Title в середині сторінки → його група

### 4. Передбачуваність ✅
Логіка зрозуміла і передбачувана:
- Якщо контент переноситься → title теж
- Структурні елементи тримаються з title
- Група завжди разом

## Логування

Система детально логує рішення:

```
📄 Processing fill-blank (480px)...
  ⚠️ Element doesn't fit on page 1
  🧠 Smart logic activated
  🧠 Smart lookahead: Title's content is all moving to next page
  📦 Moving title group: 3 elements (title + structural)
  📝 Created page 1 with 2 elements
  📄 Started new page 2 with moved elements + current element
```

## Комбінація з Іншими Правилами

Smart Lookahead працює разом з іншими правилами:

### Rule 1: Orphan Title Prevention
```
Last element: title
Next element: content
→ Move title
```

### Rule 4: Smart Lookahead
```
Title in middle of page
Only structural after title
Next element: content
→ Move title group
```

### Rule 5: Group Detection
```
Last 3 elements: structural group with title
Next element: exercise
→ Move entire group
```

## Приклад Складного Випадку

```json
Elements:
[
  { "type": "body-text", "height": 600 },
  { "type": "tip-box", "height": 80 },
  { "type": "divider", "height": 20 },
  { "type": "title-block", "height": 80 },
  { "type": "warning-box", "height": 60 },
  { "type": "instructions-box", "height": 100 },
  { "type": "fill-blank", "height": 480 },
  { "type": "multiple-choice", "height": 200 }
]
```

**Обробка:**

```
body-text (600px): ✅ Page 1
tip-box (80px): ✅ Page 1 (680px) ← Content after body-text
divider (20px): ✅ Page 1 (700px)
title (80px): ✅ Page 1 (780px)
warning-box (60px): ✅ Page 1 (840px) ← Structural
instructions (100px): ✅ Page 1 (940px) ← Structural

fill-blank (480px): ⚠️ Doesn't fit!

🧠 Smart Lookahead:
  Title at index 3
  After title: [warning-box, instructions]
  All structural? YES
  Next is exercise? YES
  
  🧠 Move title group: [divider, title, warning, instructions]

Result:
Page 1: body-text + tip-box (контент закінчився)
Page 2: divider + title + warning + instructions + fill-blank + multiple-choice
```

## Тестування

### Test Case 1: Basic Lookahead

```typescript
test('Smart lookahead: moves title when all content moves', () => {
  const elements = [
    { type: 'body-text', height: 900 },
    { type: 'title-block', height: 80 },
    { type: 'instructions-box', height: 100 },
    { type: 'fill-blank', height: 480 }
  ];
  
  const result = paginateContent(elements);
  
  expect(result.pages[0].elements).toHaveLength(1); // body-text
  expect(result.pages[1].elements).toHaveLength(3); // title + instructions + fill-blank
});
```

### Test Case 2: Multiple Titles

```typescript
test('Smart lookahead: handles multiple titles correctly', () => {
  const elements = [
    { type: 'title-block', height: 80 }, // Main
    { type: 'body-text', height: 150 },
    { type: 'title-block', height: 80 }, // Exercise 1
    { type: 'instructions-box', height: 100 },
    { type: 'fill-blank', height: 480 }
  ];
  
  const result = paginateContent(elements);
  
  // First title stays with its content
  expect(result.pages[0].elements[0].type).toBe('title-block');
  expect(result.pages[0].elements[1].type).toBe('body-text');
  
  // Second title moves with its group
  expect(result.pages[1].elements[0].type).toBe('title-block');
  expect(result.pages[1].elements[1].type).toBe('instructions-box');
  expect(result.pages[1].elements[2].type).toBe('fill-blank');
});
```

## Висновок

Smart Lookahead робить систему пагінації **по-справжньому розумною**:

- ✅ Розуміє контекст і зв'язки
- ✅ Передбачає, що буде далі
- ✅ Тримає логічні групи разом
- ✅ Думає як людина

**Результат:** Професійна пагінація, яка завжди виглядає правильно! 🎯

