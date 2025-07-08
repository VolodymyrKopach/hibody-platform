# Реалізація Thumbnails для карточок матеріалів

## Проблема
На карточках презентацій у "Мої матеріали" відображалися тільки іконки предметів замість справжніх thumbnails слайдів.

## Аналіз існуючого функціоналу

### ✅ Що вже було реалізовано:
1. **База даних** - поле `thumbnail_url` в таблиці `lessons`
2. **API для збереження превью** - `/api/images/preview` для збереження base64 зображень
3. **Генерація превью** - `src/utils/slidePreview.ts` для конвертації HTML в canvas
4. **Селектор превью** - `src/components/PreviewSelector.tsx` для вибору thumbnail
5. **Збереження в файли** - thumbnails зберігаються в `/public/images/lessons/{lessonId}/previews/`

### ❌ Що не працювало:
1. **API не приймав thumbnail_url** - при створенні уроку thumbnail_url не передавався
2. **Карточки не показували thumbnails** - показувалися тільки іконки предметів
3. **Існуючі уроки без thumbnails** - старі уроки не мали thumbnail_url в БД

## Виправлення

### 1. Оновлення API для уроків (`src/app/api/lessons/route.ts`)

```typescript
// Додано thumbnail_url до LessonInsert
const lessonData: LessonInsert = {
  user_id: user.id,
  title: body.title.trim(),
  description: body.description?.trim() || null,
  subject: body.subject || 'Загальна освіта',
  age_group: body.targetAge,
  duration: body.duration || 45,
  difficulty: 'medium',
  status: 'draft',
  thumbnail_url: body.thumbnail_url || null, // ✅ Додано
  is_public: false,
  tags: [],
  metadata: {
    originalRequest: {
      title: body.title,
      targetAge: body.targetAge,
      subject: body.subject,
      description: body.description,
      thumbnail_url: body.thumbnail_url // ✅ Додано
    }
  }
};
```

### 2. Оновлення типу API (`src/types/api.ts`)

```typescript
export interface CreateLessonRequest {
  title: string;
  description: string;
  targetAge: string;
  subject: string;
  duration: number;
  thumbnail_url?: string; // ✅ Додано
  initialSlides?: Partial<LessonSlide>[];
  slides?: Array<{
    title: string;
    content?: string;
    description?: string;
    htmlContent?: string;
    type?: string;
    status?: string;
  }>;
}
```

### 3. Оновлення saveSelectedSlides (`src/hooks/useSlideManagement.ts`)

```typescript
// Передача thumbnail_url в API
const lessonResponse = await fetch('/api/lessons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: dialogData.title.trim(),
    description: dialogData.description.trim(),
    subject: dialogData.subject.trim(),
    targetAge: dialogData.ageGroup.trim(),
    duration: slideUIState.currentLesson.duration,
    thumbnail_url: savedPreviewUrl, // ✅ Додано
    slides: selectedSlides.map((slide, index) => ({
      title: slide.title,
      description: slide.content,
      htmlContent: slide.htmlContent,
      type: slide.type,
      slideNumber: index + 1
    }))
  })
});
```

### 4. Оновлення відображення карточок (`src/app/materials/page.tsx`)

```typescript
const renderMaterialCard = (material: Material) => {
  return (
    <Card>
      <Box sx={{ height: 200 }}>
        {/* ✅ Показуємо thumbnail якщо є */}
        {material.thumbnail && material.thumbnail !== '/images/default-lesson.png' ? (
          <Box
            component="img"
            src={material.thumbnail}
            alt={material.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              // Fallback до іконки предмету
              e.currentTarget.style.display = 'none';
              const fallbackContainer = e.currentTarget.nextElementSibling;
              if (fallbackContainer) {
                fallbackContainer.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* ✅ Fallback з іконкою предмету */}
        <Box sx={{
          position: material.thumbnail ? 'absolute' : 'static',
          display: material.thumbnail ? 'none' : 'flex',
          background: `linear-gradient(135deg, ${getSubjectColor(material.subject)})`,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <SubjectIcon size={48} color="#ffffff" />
        </Box>
      </Box>
    </Card>
  );
};
```

### 5. Оновлення існуючих уроків

Створено скрипти для оновлення існуючих уроків:

#### `scripts/check-thumbnails.js`
```javascript
// Перевіряє які уроки мають/не мають thumbnails
const { data: lessons } = await supabase
  .from('lessons')
  .select('id, title, thumbnail_url, created_at')
  .order('created_at', { ascending: false });
```

#### `scripts/update-thumbnails.js`
```javascript
// Знаходить thumbnail файли та оновлює БД
function findThumbnailForLesson(lessonId) {
  // Шукає файли в /public/images/lessons/lesson_*/previews/*lesson-thumbnail*.png
}

// Оновлює уроки в БД
const { error } = await supabase
  .from('lessons')
  .update({ thumbnail_url: thumbnailPath })
  .eq('id', lesson.id);
```

## Результат

### ✅ Що працює тепер:
1. **Створення нових уроків** - автоматично зберігають thumbnail_url
2. **Відображення карточок** - показують справжні thumbnails слайдів
3. **Fallback система** - якщо thumbnail не завантажується, показується іконка предмету
4. **Існуючі уроки** - оновлені з правильними thumbnail_url

### 📊 Статистика:
- **Усього уроків**: 2
- **З thumbnails**: 2 (100%)
- **Без thumbnails**: 0 (0%)

### 🎯 UX покращення:
- Карточки матеріалів тепер показують візуальний контент слайдів
- Легше розрізнити уроки за змістом
- Професійний вигляд сторінки "Мої матеріали"
- Плавні переходи та error handling

## Технічні деталі

### Структура файлів:
```
public/images/lessons/
├── lesson_1751713698810/
│   └── previews/
│       └── slide_1751713276464-lesson-thumbnail-1751713699538.png
└── lesson_1751795496520/
    └── previews/
        └── slide_1751793977240-lesson-thumbnail-1751795497281.png
```

### Формат thumbnail_url в БД:
```
/images/lessons/lesson_1751713698810/previews/slide_1751713276464-lesson-thumbnail-1751713699538.png
```

### Розміри зображень:
- **Карточка**: 200px висота, повна ширина
- **Object-fit**: cover для правильного масштабування
- **Fallback**: градієнтний фон з іконкою предмету

## Майбутні покращення

1. **Оптимізація зображень**: WebP формат, різні розміри
2. **Lazy loading**: Завантаження thumbnails по потребі
3. **Кешування**: Browser cache для швидшого завантаження
4. **Batch оновлення**: Масове оновлення thumbnails
5. **Аналітика**: Відстеження ефективності thumbnails

## Статус: ✅ ЗАВЕРШЕНО

Thumbnails повністю реалізовані та працюють. Користувачі тепер бачать візуальні превью своїх уроків на сторінці "Мої матеріали". 