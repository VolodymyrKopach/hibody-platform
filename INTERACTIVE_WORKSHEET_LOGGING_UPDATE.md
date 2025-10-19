# 🔍 Логування для відстеження створення інтерактивних сторінок

**Дата:** 19 жовтня 2025  
**Статус:** ✅ Додано детальне логування + виправлено баги

---

## 🐛 Виявлені проблеми

### Проблема #1: `useEffect` перезаписував `pageType`
**Файл:** `src/components/worksheet/Step3CanvasEditor.tsx:284-322`

При оновленні сторінок через `useEffect`, **не копіювався `pageType`** з `generatedWorksheet.pages`. Всі сторінки ставали PDF.

```typescript
// ❌ БУЛО:
const newPages = generatedWorksheet.pages.map((page, index) => ({
  // ...
  width: A4_WIDTH,  // Завжди PDF розмір!
  height: A4_HEIGHT,
  thumbnail: '📄',
  // pageType не копіювався!
}));
```

```typescript
// ✅ ЗАРАЗ:
const newPages = generatedWorksheet.pages.map((page, index) => {
  const isInteractive = page.pageType === 'interactive';
  const pageWidth = isInteractive ? INTERACTIVE_WIDTH : A4_WIDTH;
  const pageHeight = isInteractive ? INTERACTIVE_MIN_HEIGHT : A4_HEIGHT;
  
  return {
    // ...
    width: pageWidth, // ✅ Правильний розмір
    height: pageHeight,
    thumbnail: isInteractive ? '⚡' : '📄', // ✅ Правильна іконка
    pageType: page.pageType || 'pdf', // ✅ Копіюється!
  };
});
```

---

### Проблема #2: Дефолтний тип при ручному додаванні завжди PDF
**Файл:** `src/components/worksheet/Step3CanvasEditor.tsx:1547-1610`

При натисканні на плюсик, завжди створювалася PDF сторінка, навіть якщо в параметрах було `contentMode: 'interactive'`.

```typescript
// ❌ БУЛО:
const handleAddNewPage = (pageType: 'pdf' | 'interactive' = 'pdf') => {
  // Завжди дефолт 'pdf'
}
```

```typescript
// ✅ ЗАРАЗ:
const handleAddNewPage = (pageType?: 'pdf' | 'interactive') => {
  // Визначаємо дефолтний тип з пріоритетів:
  const defaultPageType = 
    pageType ||                    // 1. Явно вказаний тип (з меню)
    parameters?.contentMode ||     // 2. З параметрів генерації
    (pages.length > 0 ? pages[pages.length - 1].pageType : undefined) || // 3. Як остання сторінка
    'pdf';                         // 4. Fallback
}
```

---

## 🔍 Додане логування

### 1️⃣ При генерації worksheet

**`WorksheetEditor.tsx:77`**
```typescript
console.log('📝 [EDITOR] Content mode:', requestBody.contentMode);
```

**`GeminiWorksheetGenerationService.ts:77`**
```typescript
console.log(`📝 [WORKSHEET_GEN] Content mode: ${contentMode}`);
```

**`WorksheetGenerationParser.ts:68`**
```typescript
console.log(`✅ [PARSER] Page ${page.pageNumber} parsed:`, {
  elements: parsedElements.length,
  types: parsedElements.map((e) => e.type),
  pageType: parsedPage.pageType, // ✅ Логування pageType
});
```

---

### 2️⃣ При оновленні сторінок в Editor

**`Step3CanvasEditor.tsx:286-318`**
```typescript
console.log('🔄 [EDITOR] Updating pages from generatedWorksheet');

generatedWorksheet.pages.map((page, index) => {
  console.log(`📄 [EDITOR] Page ${page.pageNumber}: pageType="${page.pageType || 'undefined'}" -> ${isInteractive ? 'INTERACTIVE' : 'PDF'}`);
  // ...
});

console.log(`✅ [EDITOR] Updated ${newPages.length} pages:`, newPages.map(p => `${p.pageNumber}:${p.pageType}`));
```

---

### 3️⃣ При ручному додаванні сторінки

**`Step3CanvasEditor.tsx:1555-1591`**
```typescript
console.log('➕ [EDITOR] Adding new page:', {
  providedType: pageType,
  parametersContentMode: parameters?.contentMode,
  lastPageType: pages.length > 0 ? pages[pages.length - 1].pageType : 'none',
  finalType: defaultPageType,
});

// ... створення сторінки

console.log(`✅ [EDITOR] Created page ${newPageNumber} with type: ${defaultPageType}`);
```

---

### 4️⃣ При дублюванні сторінки

**`Step3CanvasEditor.tsx:1693-1712`**
```typescript
console.log('📑 [EDITOR] Duplicating page:', {
  originalPageId: pageId,
  originalPageType: page.pageType,
});

// ... створення копії

console.log(`✅ [EDITOR] Duplicated page ${newPageNumber} with type: ${duplicatedPage.pageType}`);
```

---

### 5️⃣ При вставці сторінки

**`Step3CanvasEditor.tsx:2054-2074`**
```typescript
console.log('📋 [EDITOR] Pasting page:', {
  operation: clipboard.operation,
  originalPageType: clipboard.page.pageType,
});

// ... створення вставленої сторінки

console.log(`✅ [EDITOR] Pasted page ${newPageNumber} with type: ${pastedPage.pageType}`);
```

---

### 6️⃣ При рендерингу сторінки

**`Step3CanvasEditor.tsx:2668-2676`**
```typescript
if (page.pageNumber === 1) { // Лог тільки першої сторінки
  console.log(`🎨 [RENDER] Page ${page.pageNumber}:`, {
    pageId: page.id,
    pageType: page.pageType,
    width: page.width,
    height: page.height,
    thumbnail: page.thumbnail,
  });
}
```

---

## 🧪 Як протестувати

### Сценарій 1: Генерація інтерактивного worksheet

1. **Відкрити Worksheet Editor:**
   ```
   http://localhost:3000/worksheet-editor
   ```

2. **Вибрати параметри:**
   - Вікова група: `2-3`, `3-5` або `4-6`
   - Тип worksheet: **Interactive** ⚡
   - Тема: "Colors and Animals"

3. **Натиснути "Generate My Worksheet"**

4. **Перевірити консоль браузера** (F12 → Console):

```
📝 [EDITOR] Content mode: interactive
📡 Sending request to API: { contentMode: 'interactive', ... }
📝 [WORKSHEET_GEN] Content mode: interactive
📄 [WORKSHEET_GEN] Auto-paginating content...
✅ [PARSER] Page 1 parsed: { elements: 3, types: [...], pageType: 'interactive' }
✅ [PARSER] Page 2 parsed: { elements: 4, types: [...], pageType: 'interactive' }
🔄 [EDITOR] Updating pages from generatedWorksheet
📄 [EDITOR] Page 1: pageType="interactive" -> INTERACTIVE
📄 [EDITOR] Page 2: pageType="interactive" -> INTERACTIVE
✅ [EDITOR] Updated 2 pages: ['1:interactive', '2:interactive']
🎨 [RENDER] Page 1: { pageType: 'interactive', width: 1200, height: 800, thumbnail: '⚡' }
```

5. **Перевірити UI:**
   - Сторінки мають іконку `⚡` замість `📄`
   - Ширина сторінки `1200px` (не `794px`)
   - Badge "Interactive ✨" на сторінці
   - `data-page-type="interactive"` в HTML

---

### Сценарій 2: Ручне додавання сторінки (плюсик)

1. **Після генерації інтерактивного worksheet**

2. **Натиснути плюсик (+) внизу справа**

3. **Вибрати тип з меню:**
   - "PDF Worksheet" або
   - "Interactive ⚡"

4. **Перевірити консоль:**

```
➕ [EDITOR] Adding new page: {
  providedType: 'interactive',
  parametersContentMode: 'interactive',
  lastPageType: 'interactive',
  finalType: 'interactive'
}
✅ [EDITOR] Created page 3 with type: interactive
🎨 [RENDER] Page 1: { pageType: 'interactive', ... }
```

5. **Якщо НЕ вибрати з меню, а просто натиснути плюсик:**
   - Має створитися сторінка того ж типу, що й попередні
   - Або відповідно до `parameters.contentMode`

---

### Сценарій 3: Дублювання інтерактивної сторінки

1. **ПКМ на інтерактивній сторінці**

2. **Вибрати "Duplicate Page"**

3. **Перевірити консоль:**

```
📑 [EDITOR] Duplicating page: {
  originalPageId: 'page-...',
  originalPageType: 'interactive'
}
✅ [EDITOR] Duplicated page 4 with type: interactive
```

4. **Копія має бути ТАКОЖ інтерактивною**

---

## 📊 Очікувані результати

### ✅ Для інтерактивного worksheet:

| Етап | Що перевіряти | Очікуване значення |
|------|--------------|-------------------|
| 1. Параметри | `parameters.contentMode` | `'interactive'` |
| 2. API Request | `requestBody.contentMode` | `'interactive'` |
| 3. Генерація | `contentMode` в service | `'interactive'` |
| 4. Парсинг | `page.pageType` | `'interactive'` |
| 5. useEffect | `newPages[].pageType` | `'interactive'` |
| 6. Render | `pageType` prop | `'interactive'` |
| 7. UI | Thumbnail | `⚡` |
| 8. UI | Width | `1200px` |
| 9. UI | Badge | "Interactive ✨" |

### ✅ Для PDF worksheet:

| Етап | Що перевіряти | Очікуване значення |
|------|--------------|-------------------|
| 1. Параметри | `parameters.contentMode` | `'pdf'` |
| 2-6. Те саме | `pageType` | `'pdf'` |
| 7. UI | Thumbnail | `📄` |
| 8. UI | Width | `794px` |
| 9. UI | Badge | Відсутній |

---

## 🔍 Діагностика проблем

### Якщо сторінки все ще PDF замість Interactive:

1. **Перевірити логи в порядку:**
   ```
   📝 [EDITOR] Content mode: ???
   📝 [WORKSHEET_GEN] Content mode: ???
   ✅ [PARSER] pageType: ???
   📄 [EDITOR] Page: pageType="???"
   🎨 [RENDER] pageType: ???
   ```

2. **Знайти, де губиться `pageType`:**
   - Якщо в EDITOR `'interactive'`, але в WORKSHEET_GEN `'pdf'` → проблема в передачі
   - Якщо в PARSER `'interactive'`, але в RENDER `'pdf'` → проблема в useEffect
   - Якщо в RENDER `'interactive'`, але UI показує PDF → проблема в CanvasPage

3. **Перевірити `parameters` при старті:**
   ```typescript
   console.log('Parameters:', parameters);
   // Має бути: { contentMode: 'interactive', ... }
   ```

4. **Перевірити `generatedWorksheet.pages`:**
   ```typescript
   console.log('Generated pages:', generatedWorksheet.pages.map(p => p.pageType));
   // Має бути: ['interactive', 'interactive', ...]
   ```

---

## 📝 Файли, що змінилися

### Додано логування:

1. ✅ `src/components/worksheet/WorksheetEditor.tsx` (рядок 77)
2. ✅ `src/services/worksheet/GeminiWorksheetGenerationService.ts` (рядок 77)
3. ✅ `src/services/worksheet/WorksheetGenerationParser.ts` (рядок 68)
4. ✅ `src/components/worksheet/Step3CanvasEditor.tsx` (рядки 286, 294, 318)
5. ✅ `src/components/worksheet/Step3CanvasEditor.tsx` (рядки 1555, 1591)
6. ✅ `src/components/worksheet/Step3CanvasEditor.tsx` (рядки 1693, 1712)
7. ✅ `src/components/worksheet/Step3CanvasEditor.tsx` (рядки 2054, 2074)
8. ✅ `src/components/worksheet/Step3CanvasEditor.tsx` (рядки 2668-2676)

### Виправлено баги:

1. ✅ `src/components/worksheet/Step3CanvasEditor.tsx:284-322` - useEffect тепер копіює `pageType`
2. ✅ `src/components/worksheet/Step3CanvasEditor.tsx:1547-1610` - `handleAddNewPage` використовує правильний дефолт

---

## 🎯 Висновок

Тепер система має **детальне логування** на кожному етапі:
- ✅ Генерація
- ✅ Парсинг
- ✅ Оновлення в Editor
- ✅ Додавання нової сторінки
- ✅ Дублювання
- ✅ Вставка
- ✅ Рендеринг

Якщо `pageType` все ще губиться - логи точно покажуть, де саме це відбувається!

---

## 🚀 Наступні кроки

Після тестування та підтвердження, що все працює:
1. Можна видалити деякі логи (залишити тільки критичні)
2. Додати unit тести для функцій створення сторінок
3. Додати E2E тест для флоу генерації інтерактивного worksheet

