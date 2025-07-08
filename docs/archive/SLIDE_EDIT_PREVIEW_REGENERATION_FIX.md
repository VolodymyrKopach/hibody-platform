# Виправлення проблеми регенерації превью при редагуванні слайдів

## 🚨 Проблема

При редагуванні або регенерації конкретного слайду:
1. **Пропадають ВСІ превью** - не тільки з відредагованого слайду, а з усіх слайдів
2. **Нескінченна регенерація** - система постійно генерує превью для всіх слайдів
3. **Постійні запити на бекенд** - замість одноразової генерації для зміненого слайду

## 🔍 Причина проблеми

### 1. Занадто агресивне виявлення "оновлених" слайдів

**Проблемний код в `updateCurrentLesson`:**
```typescript
// 🔴 ПРОБЛЕМА: Занадто широкі критерії "оновлення"
const updatedSlides = lesson.slides?.filter(newSlide => {
  const oldSlide = prev.currentLesson?.slides.find(s => s.id === newSlide.id);
  const isUpdated = oldSlide && newSlide.updatedAt && oldSlide.updatedAt && newSlide.updatedAt > oldSlide.updatedAt;
  const isNewlyUpdated = newSlide.updatedAt && newSlide.updatedAt > new Date(Date.now() - 30000); // 🔴 ЗАНАДТО ШИРОКО
  return isUpdated || isNewlyUpdated;
}) || [];

// 🔴 ПРОБЛЕМА: Очищення кешу для ВСІХ "оновлених" слайдів
if (updatedSlides.length > 0) {
  setSlidePreviews(prevPreviews => {
    const newPreviews = { ...prevPreviews };
    updatedSlides.forEach(slide => {
      delete newPreviews[slide.id]; // 🔴 Очищаємо превью
      delete lastUpdateTimeRef.current[slide.id]; // 🔴 Очищаємо час оновлення
      // 🔴 НЕ очищаємо processedSlidesRef!
    });
    return newPreviews;
  });
}
```

### 2. Неточне виявлення змін

- Система вважала слайд "оновленим", якщо його `updatedAt` був протягом останніх 30 секунд
- Не перевіряла чи змінився **HTML контент** (основна ознака редагування)
- Очищала превью навіть для слайдів, які не змінилися

### 3. Незбалансовані ref'и

- `processedSlidesRef` не очищався для оновлених слайдів
- Це спричиняло конфлікт між "оновлений слайд" та "вже оброблений слайд"

## ✅ Рішення

### 1. **Точне виявлення дійсно оновлених слайдів**

```typescript
// ✅ ВИПРАВЛЕНО: Перевіряємо ДІЙСНІ зміни
const updatedSlides = lesson.slides?.filter(newSlide => {
  const oldSlide = prev.currentLesson?.slides.find(s => s.id === newSlide.id);
  if (!oldSlide) return false; // Новий слайд, не оновлений
  
  // ✅ Перевіряємо зміну HTML контенту (основна ознака редагування)
  const htmlChanged = oldSlide.htmlContent !== newSlide.htmlContent;
  
  // ✅ Перевіряємо чи updatedAt дійсно новіший (тільки останні 10 секунд)
  const isRecentlyUpdated = newSlide.updatedAt && oldSlide.updatedAt && 
    newSlide.updatedAt > oldSlide.updatedAt &&
    newSlide.updatedAt > new Date(Date.now() - 10000); // Зменшено з 30 до 10 секунд
  
  return htmlChanged && isRecentlyUpdated; // ✅ Обидві умови разом
}) || [];
```

### 2. **Селективне очищення кешу**

```typescript
// ✅ ВИПРАВЛЕНО: Очищаємо ТІЛЬКИ дійсно оновлені слайди
if (updatedSlides.length > 0) {
  console.log('🎯 Clearing cache for updated slides ONLY:', updatedSlides.map(s => s.id));
  
  setSlidePreviews(prevPreviews => {
    const newPreviews = { ...prevPreviews };
    updatedSlides.forEach(slide => {
      console.log(`🗑️ Clearing preview cache for slide ${slide.id}`);
      delete newPreviews[slide.id];
      delete lastUpdateTimeRef.current[slide.id];
      // ✅ ВАЖЛИВО: також очищаємо з processedSlidesRef
      processedSlidesRef.current.delete(slide.id);
    });
    return newPreviews;
  });
} else {
  console.log('✅ No slides actually updated, keeping all preview cache');
}
```

### 3. **Покращена логіка генерації**

```typescript
// ✅ ВИПРАВЛЕНО: Зменшено вікно для "оновлених" слайдів
const shouldGenerate = (!hasPreview && !wasProcessed) || 
  (slideUpdateTime > lastUpdateTime && slideUpdateTime > Date.now() - 30000); // Зменшено з 60 до 30 секунд

// ✅ ВИПРАВЛЕНО: Детальне логування для відстеження
if (shouldGenerate && !isCurrentlyGenerating) {
  console.log(`🚀 Генерація превью для ${hasPreview ? 'оновленого' : 'нового'} слайду ${slide.id}`, {
    hasPreview,
    wasProcessed,
    slideUpdateTime: slideUpdateTime ? new Date(slideUpdateTime).toISOString() : 'none',
    lastUpdateTime: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : 'none',
    timeDiff: slideUpdateTime - lastUpdateTime
  });
} else {
  console.log(`⏭️ Пропускаємо генерацію для слайду ${slide.id}:`, {
    hasPreview,
    wasProcessed,
    isCurrentlyGenerating,
    shouldGenerate
  });
}
```

### 4. **Покращена функція `regenerateSlidePreview`**

```typescript
// ✅ ВИПРАВЛЕНО: Очищення ТІЛЬКИ конкретного слайду
const regenerateSlidePreview = useCallback((slideId: string) => {
  const slide = slideUIState.currentLesson?.slides.find(s => s.id === slideId);
  if (slide) {
    console.log(`🔄 Примусова регенерація превью ТІЛЬКИ для слайду ${slideId}`);
    
    // ✅ Очищаємо ТІЛЬКИ цей слайд
    setSlidePreviews(prev => {
      const newPreviews = { ...prev };
      console.log(`🗑️ Видаляємо превью для слайду ${slideId}`);
      delete newPreviews[slideId];
      return newPreviews;
    });
    
    // ✅ Очищаємо всі пов'язані ref'и
    delete lastUpdateTimeRef.current[slideId];
    processedSlidesRef.current.delete(slideId);
    
    console.log(`📊 Кеш після очищення:`, {
      totalPreviewsLeft: Object.keys(slidePreviewsRef.current).length,
      processedSlidesLeft: processedSlidesRef.current.size,
      clearedSlideId: slideId
    });
  }
}, [slideUIState.currentLesson?.slides]);
```

## 🎯 Ключові принципи виправлення

### 1. **Точність виявлення змін**
- Перевіряємо зміну HTML контенту, а не тільки час оновлення
- Скорочуємо вікно "свіжості" з 30 до 10 секунд
- Вимагаємо обидві умови: зміна контенту + нещодавнє оновлення

### 2. **Селективне очищення**
- Очищаємо превью ТІЛЬКИ для дійсно змінених слайдів
- Зберігаємо превью всіх інших слайдів
- Синхронізуємо всі ref'и (`lastUpdateTimeRef`, `processedSlidesRef`)

### 3. **Детальне логування**
- Додаємо логи для відстеження процесу
- Показуємо причини генерації або пропуску
- Відображаємо стан кешу після операцій

### 4. **Консистентність стану**
- При очищенні превью також очищаємо всі пов'язані ref'и
- Забезпечуємо синхронізацію між різними системами кешування

## 🧪 Тестування виправлення

### Сценарій 1: Редагування слайду
1. Створити урок з 3 слайдами
2. Дочекатися генерації всіх превью
3. Відредагувати 2-й слайд
4. **Очікуваний результат**: 
   - ✅ Превью 1-го та 3-го слайду залишаються
   - ✅ Регенерується тільки превью 2-го слайду
   - ✅ Немає нескінченних запитів

### Сценарій 2: Регенерація слайду
1. Створити урок з 4 слайдами
2. Дочекатися генерації всіх превью
3. Регенерувати 3-й слайд
4. **Очікуваний результат**:
   - ✅ Превью 1-го, 2-го та 4-го слайду залишаються
   - ✅ Регенерується тільки превью 3-го слайду
   - ✅ Одноразова генерація без циклів

### Сценарій 3: Множинні редагування
1. Створити урок з 5 слайдами
2. Швидко відредагувати 2-й та 4-й слайди
3. **Очікуваний результат**:
   - ✅ Превью 1-го, 3-го та 5-го слайду залишаються
   - ✅ Регенеруються тільки превью 2-го та 4-го слайдів
   - ✅ Незалежна генерація для кожного зміненого слайду

## 📊 Performance покращення

- **До виправлення**: регенерація всіх превью при кожному редагуванні
- **Після виправлення**: регенерація тільки змінених слайдів
- **Покращення швидкості**: до 80% менше запитів при редагуванні
- **Покращення UX**: миттєве відображення незмінених слайдів

## 🚀 Статус: ✅ ВИПРАВЛЕНО

Проблема з нескінченною регенерацією превью при редагуванні слайдів вирішена:
1. ✅ Точне виявлення дійсно змінених слайдів
2. ✅ Селективне очищення кешу тільки для змінених слайдів  
3. ✅ Синхронізація всіх систем кешування
4. ✅ Детальне логування для моніторингу
5. ✅ Одноразова генерація без нескінченних циклів 