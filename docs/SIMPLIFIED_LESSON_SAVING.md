# Simplified Lesson Saving Architecture

## Overview

Реалізована спрощена архітектура збереження уроків в Template Generation системі, де всі дані передаються напряму з Step3 до діалогу збереження.

## Key Changes

### 1. New Data Flow Architecture

**Before:**
- Step3 → SaveLessonDialog (через складні props)
- Діалог отримував окремо slides, cachedPreviews, dialogData
- Збереження відбувалося через callback в Step3

**After:**
- Step3 → SimplifiedSaveLessonDialog (через LessonSaveData)
- Діалог отримує всі дані в одному об'єкті
- Діалог сам обробляє збереження через API

### 2. New Types

```typescript
// Новий інтерфейс для передачі всіх даних
interface LessonSaveData {
  // Метадані уроку
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  duration: number;
  
  // Слайди та превью
  slides: SimpleSlide[];
  slidePreviews: Record<string, string>; // slideId -> base64 preview
  
  // Опціональні дані
  selectedPreviewId?: string | null;
  previewUrl?: string | null;
}
```

### 3. Simplified Components

#### Step3SlideGeneration.tsx
- **prepareLessonSaveData()** - збирає всі дані в один об'єкт
- **openSaveDialog()** - підготовує дані та відкриває діалог
- Видалено складні функції управління станом діалогу

#### SimplifiedSaveLessonDialog.tsx
- Приймає `LessonSaveData` як props
- Автоматично заповнює поля з переданих даних
- Сам обробляє збереження через `/api/lessons`
- Викликає callbacks для success/error

### 4. Benefits

1. **Простота** - менше коду, простіша логіка
2. **Інкапсуляція** - діалог сам відповідає за збереження
3. **Переносимість** - діалог можна використати в інших місцях
4. **Надійність** - всі дані передаються разом, немає проблем синхронізації

### 5. Data Collection Process

```typescript
const prepareLessonSaveData = (): LessonSaveData | null => {
  // 1. Перевіряємо наявність даних
  if (!currentLesson || !slides || slides.length === 0) {
    return null;
  }

  // 2. Отримуємо превью з LocalThumbnailStorage
  const allPreviews = thumbnailStorage.getAll();
  
  // 3. Фільтруємо превью для поточних слайдів
  const slidePreviews: Record<string, string> = {};
  slides.forEach(slide => {
    if (allPreviews[slide.id]) {
      slidePreviews[slide.id] = allPreviews[slide.id];
    }
  });

  // 4. Створюємо об'єкт з усіма даними
  return {
    title: currentLesson.title || `${templateData.topic} - ${templateData.ageGroup}`,
    description: currentLesson.description || `Interactive lesson about ${templateData.topic}...`,
    subject: templateData.topic,
    ageGroup: templateData.ageGroup,
    duration: currentLesson.duration || 45,
    slides: slides,
    slidePreviews: slidePreviews,
    selectedPreviewId: null,
    previewUrl: null
  };
};
```

### 6. Usage Example

```typescript
// В Step3SlideGeneration.tsx
const handleSaveLesson = () => {
  openSaveDialog(); // Підготовує дані та відкриває діалог
};

// В SimplifiedSaveLessonDialog.tsx
<SimplifiedSaveLessonDialog
  open={saveDialogOpen}
  lessonData={lessonSaveData}
  onClose={closeSaveDialog}
  onSuccess={handleSaveSuccess}
  onError={handleSaveError}
/>
```

## Migration Notes

- Старий `SaveLessonDialog` залишається для chat системи
- `SimplifiedSaveLessonDialog` використовується в template системі
- Видалено залежність від складних callback функцій
- Почищено debug логи для production готовності

## Future Improvements

1. Можна об'єднати обидва діалоги в один універсальний
2. Додати валідацію даних перед збереженням
3. Реалізувати retry механізм для failed saves
4. Додати progress indicator для великих уроків
