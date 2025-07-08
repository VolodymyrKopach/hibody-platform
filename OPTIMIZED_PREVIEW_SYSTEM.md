# Оптимізована система превью уроків

## 🎯 Ключове рішення

**Зберігати в Supabase Storage тільки вибраний превью уроку, а не всі thumbnail'и слайдів!**

## 🔄 Новий процес збереження

### 1. **Створення/редагування слайдів**
```
Користувач створює слайди → Thumbnail'и генеруються ЛОКАЛЬНО
                        ↓
LocalThumbnailStorage.memoryCache (в пам'яті браузера)
```

### 2. **Вибір превью для уроку**
```
SaveLessonDialog → PreviewSelector → Користувач вибирає слайд
                                   ↓
dialogData.selectedPreviewId = "slide_123"
dialogData.previewUrl = "data:image/png;base64,..."
```

### 3. **Збереження уроку**
```
handleSaveLesson() → Тільки вибраний thumbnail завантажується в Storage
                   ↓
localThumbnailStorage.uploadToStorage(selectedPreviewId, lessonId)
                   ↓
lesson.thumbnail_url = "https://supabase.../lessons/lessonId/thumbnails/slide_123_timestamp.png"
```

## 📊 Порівняння: До vs Після

### ❌ **Було (неефективно):**
```typescript
// Завантажували ВСІ thumbnail'и
const storageUrls = await localThumbnailStorage.uploadAllToStorage(lessonId, selectedSlideIds);
// Результат: 5 слайдів = 5 файлів в Storage (1-2 MB)

slides: selectedSlideIds.map(slideId => ({
  ...slide,
  thumbnailUrl: storageUrls[slideId] // Кожен слайд мав свій URL
}))
```

### ✅ **Стало (оптимізовано):**
```typescript
// Завантажуємо ТІЛЬКИ вибраний превью
const lessonThumbnailUrl = await localThumbnailStorage.uploadToStorage(
  dialogData.selectedPreviewId, 
  lessonId
);
// Результат: 5 слайдів = 1 файл в Storage (200-400 KB)

// Превью уроку на рівні lesson
thumbnailUrl: lessonThumbnailUrl,

// Слайди без thumbnail'ів
slides: selectedSlideIds.map(slideId => ({
  ...slide,
  thumbnailUrl: null // Слайди не мають індивідуальних превью
}))
```

## 🏗️ Архітектура компонентів

### **SaveLessonDialog**
```tsx
<PreviewSelector
  slides={selectedSlides}
  selectedPreviewId={dialogData.selectedPreviewId}
  onPreviewSelect={(slideId, previewUrl) => {
    // Зберігаємо вибір користувача
    setSaveDialogData(prev => ({
      ...prev,
      selectedPreviewId: slideId,
      previewUrl: previewUrl
    }));
  }}
/>
```

### **useSlideManagement.saveSelectedSlides**
```typescript
// 1. Завантажуємо тільки вибраний превью
let lessonThumbnailUrl: string | null = null;

if (dialogData.selectedPreviewId && dialogData.previewUrl) {
  lessonThumbnailUrl = await localThumbnailStorage.uploadToStorage(
    dialogData.selectedPreviewId, 
    lessonId
  );
}

// 2. Відправляємо на сервер
const response = await fetch('/api/lessons', {
  method: 'POST',
  body: JSON.stringify({
    title: dialogData.title,
    subject: dialogData.subject,
    targetAge: dialogData.ageGroup,
    thumbnail_url: lessonThumbnailUrl, // ✅ Тільки вибраний превью
    slides: selectedSlideIds.map(slideId => ({
      title: slide.title,
      htmlContent: slide.htmlContent,
      // thumbnailUrl не передається для слайдів
    }))
  })
});
```

### **API Route /api/lessons**
```typescript
const lessonData: LessonInsert = {
  user_id: user.id,
  title: body.title,
  thumbnail_url: body.thumbnail_url, // ✅ Превью уроку
  // ...
};

// Слайди створюються без thumbnail_url
await slideService.createSlide({
  lesson_id: lesson.id,
  title: slideData.title,
  html_content: slideData.htmlContent,
  // thumbnail_url: null - не передається
});
```

## 📁 Структура файлів в Storage

### **Тепер:**
```
lesson-assets/
└── lessons/
    └── lesson_1751234567890/
        └── thumbnails/
            └── slide_abc123_1751234567890.png  ← Тільки вибраний превью
```

### **Раніше було:**
```
lesson-assets/
└── lessons/
    └── lesson_1751234567890/
        └── thumbnails/
            ├── slide_abc123_1751234567890.png
            ├── slide_def456_1751234567891.png
            ├── slide_ghi789_1751234567892.png
            ├── slide_jkl012_1751234567893.png
            └── slide_mno345_1751234567894.png  ← 5 файлів замість 1
```

## 💾 База даних

### **Таблиця `lessons`:**
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT, -- ✅ URL вибраного превью
  -- ...
);
```

### **Таблиця `slides`:**
```sql
CREATE TABLE slides (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),
  title TEXT NOT NULL,
  html_content TEXT,
  -- thumbnail_url TEXT, -- ❌ Поле існує, але не використовується
  -- ...
);
```

## 🚀 Переваги нової системи

### **1. Економія Storage**
- **Було:** 5 слайдів × 200KB = 1MB на урок
- **Стало:** 1 превью × 200KB = 200KB на урок
- **Економія:** 80% місця в Storage

### **2. Швидкість завантаження**
- **Було:** 5 API викликів до Storage
- **Стало:** 1 API виклик до Storage
- **Швидкість:** В 5 разів швидше

### **3. Простота управління**
- **Було:** Управління thumbnail'ами для кожного слайду
- **Стало:** Один превью на урок
- **Зручність:** Користувач сам вибирає найкращий превью

### **4. Узгодженість з UX**
- В MaterialsPage показується один превью на урок
- Користувач вибирає який саме слайд стане превью
- Логічно: урок = один превью

## 🎨 UX Flow

### **1. Створення слайдів:**
```
Чат → "Створи урок про космос"
  ↓
AI генерує 3 слайди
  ↓
Thumbnail'и генеруються локально для всіх слайдів
  ↓
Користувач бачить превью всіх слайдів в панелі
```

### **2. Збереження уроку:**
```
Користувач → "Зберегти урок"
  ↓
SaveLessonDialog відкривається
  ↓
PreviewSelector показує всі локальні превью
  ↓
Користувач натискає стрілочки ←→ і обирає найкращий
  ↓
"Зберегти" → Тільки вибраний превью завантажується в Storage
```

### **3. Перегляд збережених уроків:**
```
MaterialsPage → Показує уроки з їх превью
  ↓
Кожен урок має один красивий thumbnail
  ↓
Thumbnail'и завантажуються швидко (тільки 1 на урок)
```

## 🧪 Тестування

### **Перевірте що працює:**

1. **Створення слайдів:**
   - Thumbnail'и генеруються локально ✅
   - PreviewSelector показує всі превью ✅

2. **Вибір превью:**
   - Можна натискати ←→ для перегляду ✅
   - Вибраний превью зберігається в dialogData ✅

3. **Збереження уроку:**
   - Тільки вибраний превью завантажується в Storage ✅
   - lesson.thumbnail_url встановлюється правильно ✅

4. **Перегляд уроків:**
   - MaterialsPage показує превью уроків ✅
   - Thumbnail'и завантажуються швидко ✅

### **Логи для відстеження:**
```
☁️ NEW SAVE: Завантаження вибраного превью в Storage: slide_abc123
📊 NEW SAVE: Превью уроку завантажено: https://supabase.../lessons/.../slide_abc123_1751234567890.png
```

## 🔧 Технічні деталі

### **Файли що змінилися:**
1. `src/hooks/useSlideManagement.ts` - оновлена логіка збереження
2. `src/app/api/lessons/route.ts` - вже підтримує `thumbnail_url`
3. `src/types/api.ts` - вже має `thumbnail_url` в `CreateLessonRequest`

### **Файли що НЕ змінилися:**
1. `PreviewSelector.tsx` - продовжує працювати як раніше
2. `SaveLessonDialog.tsx` - продовжує працювати як раніше  
3. `LocalThumbnailService.ts` - метод `uploadToStorage` вже існував

## 🎯 Результат

✅ **Економія Storage:** 80% менше файлів  
✅ **Швидкість:** 5× швидше завантаження  
✅ **UX:** Користувач контролює вибір превью  
✅ **Простота:** Один превью на урок замість багатьох  

Система тепер оптимальна як з технічної, так і з користувацької точки зору! 🚀 