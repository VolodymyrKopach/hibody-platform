# Drag and Drop Bug - Testing Guide

> ✅ **STATUS: BUGS FIXED** - 2025-10-07
> 
> Виправлено 2 критичні баги:
> 1. Event handlers не викликали `preventDefault()`
> 2. Drop indicators блокували mouse events
> 
> Детальний опис виправлень: [`DRAG_AND_DROP_FIX_COMPLETE.md`](./DRAG_AND_DROP_FIX_COMPLETE.md)

## Швидкий Тест

### Підготовка

1. Відкрийте Worksheet Generator (Step 3 - Canvas Editor)
2. Переконайтесь що у вас є:
   - Мінімум 1 сторінка з 3+ елементами
   - Або 2+ сторінки з елементами на кожній
3. **Важливо:** Відкрийте Browser Console (F12 або Cmd+Option+I)

### Тест 1: Within-Page Drag (перетягування на тій самій сторінці)

**Крок 1:** Знайдіть елемент, який хочете перемістити

**Крок 2:** Натисніть і утримуйте drag handle (іконка ⠿ зліва від елемента)

**Крок 3:** Перетягніть елемент на нову позицію (між іншими елементами)

**Крок 4:** Відпустіть елемент

**Що має статися:**
- ✅ Синій індикатор показує позицію drop
- ✅ Елементи розсуваються (space expansion)
- ✅ Елемент переміщується на нову позицію після drop

**Що перевірити в console:**
```
🔍 [handleElementDragOver] - під час hover
📦 [handleElementDrop] Drop event triggered
🔄 [handleElementDrop] Attempting within-page reorder
✅ [handleElementDrop] Calling onElementReorder
🔄 [handleElementReorder] Called with: { pageId, fromIndex, toIndex }
✅ [handleElementReorder] Elements reordered successfully
```

### Тест 2: Cross-Page Drag (перетягування між сторінками)

**Крок 1:** Знайдіть елемент на Page 1

**Крок 2:** Натисніть і утримуйте drag handle

**Крок 3:** Перетягніть елемент на Page 2 (hover over елементами)

**Крок 4:** Відпустіть елемент

**Що має статися:**
- ✅ Зелений індикатор показує позицію drop на Page 2
- ✅ Елемент зникає з Page 1
- ✅ Елемент з'являється на Page 2 на обраній позиції

**Що перевірити в console:**
```
🔍 [handleElementDragOver] - isCrossPageDrag: true
📥 [handleElementDrop] Cross-page drop at index: X
📥 Handling cross-page drop: { from: page1, to: page2 }
✅ Element moved from page X to Y via drag
```

## Якщо Drag and Drop НЕ працює

### Scenario A: Ніяких логів немає

**Проблема:** Event handlers не під'єднані

**Перевірити:**
```typescript
// У CanvasPage.tsx має бути:
draggable={!element.locked}
onDragStart={(e) => !element.locked && handleElementDragStart(e, realIndex)}
```

**Фікс:** Переконатись що `draggable` та `onDragStart` є на елементі

---

### Scenario B: Логи є, але `draggedIndex: null` при drop

**Проблема:** State очищається занадто рано

**Перевірити в console:**
```
📦 [handleElementDrop] Drop event triggered
  draggedIndex: null  ❌ <- Проблема тут
```

**Фікс:** Перевірити `handleElementDragEnd` - можливо викликається передчасно

---

### Scenario C: Логи показують "Reorder skipped"

**Проблема:** Callback не передається або умова не виконується

**Перевірити в console:**
```
⚠️ [handleElementDrop] Reorder skipped: {
  draggedIndexNull: false,
  samePosition: false,
  noCallback: true  ❌ <- Проблема тут
}
```

**Фікс:** Перевірити що `onElementReorder` prop передається з Step3CanvasEditor:
```typescript
<CanvasPage
  onElementReorder={(fromIndex, toIndex) => handleElementReorder(page.id, fromIndex, toIndex)}
/>
```

---

### Scenario D: handleElementReorder викликається, але UI не оновлюється

**Проблема:** State update не тригерить re-render

**Перевірити в console:**
```
✅ [handleElementReorder] Elements reordered successfully
```
Але візуально нічого не змінилось ❌

**Діагностика:**
1. Відкрийте React DevTools
2. Знайдіть CanvasPage component
3. Перевірте `elements` prop - чи він змінюється після drop?

**Можливі причини:**
- Map/Array не створюється заново (immutability)
- Component не re-render через memo/optimization

**Фікс:**
```typescript
// Переконатись що створюємо НОВІ instances:
const newMap = new Map(prev);  // Новий Map
const elements = [...pageContent.elements];  // Новий Array
```

---

### Scenario E: Cross-page drag показує як within-page

**Проблема:** `isCrossPageDrag` визначається неправильно

**Перевірити в console:**
```
🔍 [handleElementDrop] isCrossPageDrag: false  ❌
```

**Фікс:** Використовувати state замість dataTransfer:
```typescript
const isCrossPageDrag = crossPageDrag && crossPageDrag.sourcePageId !== pageId;
```

---

## Швидкі Перевірки

### ✅ Checklist для Within-Page Drag

- [ ] `draggable={true}` на елементі
- [ ] `handleElementDragStart` встановлює `draggedIndex`
- [ ] `handleElementDragOver` показує синій індикатор
- [ ] `handleElementDrop` викликає `onElementReorder`
- [ ] `handleElementReorder` виконує state update
- [ ] UI оновлюється з новим порядком

### ✅ Checklist для Cross-Page Drag

- [ ] `handleCrossPageDragStart` встановлює `crossPageDrag` state
- [ ] `handleElementDragOver` показує зелений індикатор на target page
- [ ] `handleElementDrop` викликає `onCrossPageDrop`
- [ ] `handleCrossPageDrop` оновлює обидві сторінки
- [ ] Елемент видаляється з source page
- [ ] Елемент додається на target page

---

## Очікувані Console Logs

### Within-Page Reorder (Successful):

```
🔍 [handleElementDragOver] { pageId: "1", index: 2, isCrossPageDrag: false, draggedIndex: 0 }
✅ [handleElementDragOver] Within-page drag, showing indicator at index: 2
📦 [handleElementDrop] Drop event triggered { pageId: "1", dropIndex: 2, draggedIndex: 0 }
🔍 [handleElementDrop] isCrossPageDrag: false
🔄 [handleElementDrop] Attempting within-page reorder { draggedIndex: 0, dropIndex: 2, hasReorderCallback: true }
✅ [handleElementDrop] Calling onElementReorder: { from: 0, to: 2 }
🔄 [handleElementReorder] Called with: { pageId: "1", fromIndex: 0, toIndex: 2 }
📋 [handleElementReorder] Current elements count: 5
🎯 [handleElementReorder] Moved element: { id: "element-123", type: "title-block", fromIndex: 0, toIndex: 2 }
✅ [handleElementReorder] Elements reordered successfully
```

### Cross-Page Drag (Successful):

```
🔍 [handleElementDragOver] { pageId: "2", index: 1, isCrossPageDrag: true, crossPageDrag: { sourcePageId: "1", elementId: "element-123" } }
✅ [handleElementDragOver] Cross-page drag detected, showing indicator at index: 1
📦 [handleElementDrop] Drop event triggered { pageId: "2", dropIndex: 1, crossPageDrag: { sourcePageId: "1" } }
🔍 [handleElementDrop] isCrossPageDrag: true
📥 [handleElementDrop] Cross-page drop at index: 1
📥 Handling cross-page drop: { from: "1", to: "2", elementId: "element-123", dropIndex: 1 }
✅ Inserted element at position 1
✅ Element moved from page 1 to 2 via drag
```

---

## Як поділитися результатами тестування

1. **Скопіюйте всі console logs** під час drag and drop
2. **Скриншот "до"** - показати початковий стан
3. **Скриншот "після"** - показати фінальний стан
4. **Опишіть що сталося:**
   - Чи перемістився елемент візуально?
   - Які логи з'явились?
   - Які логи НЕ з'явились (очікувалися)?

**Приклад звіту:**
```
❌ БАГ: Within-page drag не працює

Що я зробив:
1. Перетягнув "Title Block" з позиції 0
2. Навів на позицію 2 (синій індикатор з'явився)
3. Відпустив елемент

Що сталося:
- Візуально елемент НЕ перемістився
- Залишився на позиції 0

Console logs:
🔍 [handleElementDragOver] ... 
📦 [handleElementDrop] ...
⚠️ [handleElementDrop] Reorder skipped: { noCallback: true }  <- Проблема!

Висновок: onElementReorder callback не передається в CanvasPage
```

---

## Наступні Кроки

Після тестування з console logs ми зможемо:

1. **Визначити точну причину** - який саме handler/callback не спрацьовує
2. **Застосувати фікс** - виправити конкретне місце в коді
3. **Повторно протестувати** - підтвердити що баг виправлено

---

**Готовий до тестування! 🚀**

Відкрийте Worksheet Generator, відкрийте console (F12), і спробуйте перетягнути елементи. Поділіться console logs з результатами.
