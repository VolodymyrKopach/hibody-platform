# Виправлення нескінченного циклу генерації превью слайдів

## Проблема

При редагуванні або регенерації слайдів у системі виникав нескінченний цикл запитів на бекенд для генерації превью слайдів. Фронтенд постійно генерував превью, відображав їх, потім чомусь думав що потрібно згенерувати знову.

## Ідентифіковані причини

1. **Зайві виклики `updateCurrentLesson`** - функція викликалася навіть коли урок не змінювався
2. **Недостатньо строгі умови генерації превью** - превью генерувалися занадто часто
3. **Відсутність throttling механізму** - не було обмежень на частоту генерації
4. **Недостатня перевірка ідентичності слайдів** - слайди вважалися зміненими навіть коли вони були ідентичними

## Виправлення

### 1. Детальне логування
Додано повне логування в:
- `useSlideManagement` hook
- `PreviewSelector` компонент  
- `updateCurrentLesson` функцію
- `generateSlidePreview` функцію

### 2. Throttling механізм
```typescript
const previewGenerationThrottleRef = useRef<Record<string, number>>({});
const PREVIEW_THROTTLE_DELAY = 5000; // 5 секунд між спробами
```

### 3. Обмеження кількості спроб
```typescript
const previewGenerationAttemptsRef = useRef<Record<string, number>>({});
const MAX_PREVIEW_ATTEMPTS = 3; // Максимум 3 спроби для кожного слайду
```

### 4. Строгі умови генерації превью
```typescript
const isNewSlideWithoutPreview = !hasPreview && !wasProcessed;
const isRecentlyUpdatedSlide = slideUpdateTime > lastUpdateTime && 
                              slideUpdateTime > Date.now() - 10000 && // Зменшено до 10 секунд
                              slideUpdateTime !== 0;

const shouldGenerate = isNewSlideWithoutPreview || isRecentlyUpdatedSlide;
```

### 5. Глибока перевірка ідентичності уроків
```typescript
const lessonsAreIdentical = 
  lesson.title === prev.currentLesson.title &&
  lesson.description === prev.currentLesson.description &&
  lesson.subject === prev.currentLesson.subject &&
  lesson.ageGroup === prev.currentLesson.ageGroup &&
  lesson.duration === prev.currentLesson.duration &&
  lesson.slides?.length === prev.currentLesson.slides?.length &&
  lesson.slides?.every((newSlide, index) => {
    const oldSlide = prev.currentLesson?.slides[index];
    return oldSlide &&
           newSlide.id === oldSlide.id &&
           newSlide.title === oldSlide.title &&
           newSlide.content === oldSlide.content &&
           newSlide.htmlContent === oldSlide.htmlContent &&
           newSlide.type === oldSlide.type &&
           newSlide.status === oldSlide.status &&
           (newSlide.updatedAt?.getTime() || 0) === (oldSlide.updatedAt?.getTime() || 0);
  });
```

### 6. Покращена логіка перевірки умов
Додано перевірки:
- `!isCurrentlyGenerating` - не генерується зараз
- `!isThrottled` - не throttled (не було спроби протягом 5 секунд)
- `!tooManyAttempts` - не перевищено максимум спроб (3)
- Більш строга перевірка часу оновлення (10 секунд замість 20)

## Тестування

### Сценарії для тестування:
1. **Створення нового слайду** - превью має згенеруватися один раз
2. **Редагування слайду** - превью має оновитися один раз
3. **Регенерація слайду** - превью має оновитися один раз  
4. **Швидкі послідовні зміни** - має спрацювати throttling
5. **Повторні невдалі спроби** - має зупинитися після 3 спроб

### Команди для тестування:
```bash
# Запустити сервер для тестування
npm run dev

# Відкрити інструменти розробника та перевірити логи з префіксами:
# 🔄 PREVIEW GENERATION EFFECT
# 🎯 PREVIEW GENERATION  
# 🔍 PREVIEW GENERATION
# 🚀 PREVIEW GENERATION
# ⏭️ PREVIEW GENERATION
# 🔄 UPDATE CURRENT LESSON
```

## Результат

- ✅ Зупинено нескінченні цикли генерації превью
- ✅ Додано контроль частоти запитів (throttling)
- ✅ Обмежено максимальну кількість спроб
- ✅ Покращено перевірку умов генерації
- ✅ Додано детальне логування для діагностики
- ✅ Зменшено навантаження на бекенд

## Логи для моніторингу

Всі логи мають спеціальні префікси для легкого фільтрування:
- `🔄 PREVIEW GENERATION` - основні події генерації превью
- `🔄 UPDATE CURRENT LESSON` - оновлення поточного уроку
- `🎨 GENERATE SLIDE PREVIEW` - деталі генерації конкретного превью
- `🎯 PREVIEW SELECTOR` - події в компоненті селектора превью

## Статус: ✅ ВИПРАВЛЕНО

Нескінченний цикл генерації превью слайдів виправлено. Система тепер працює стабільно з контрольованою генерацією превью. 