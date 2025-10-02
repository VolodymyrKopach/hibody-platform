# AI Worksheet Generation - Quick Start 🚀

## 1. Переконайтеся, що є API ключ

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

## 2. Відкрийте Worksheet Editor

```
http://localhost:3000/worksheet-editor
```

## 3. Заповніть параметри

- **Topic:** "Present Simple Tense"
- **Level:** Intermediate
- **Number of Pages:** 3
- **Exercise Types:** Fill in Blanks, Multiple Choice

## 4. Натисніть "Generate My Worksheet"

AI згенерує worksheet за 20-30 секунд.

## 5. Редагуйте в Canvas Editor

- Перетягуйте компоненти
- Змінюйте текст (double-click)
- Додавайте нові елементи з лівої панелі
- Налаштовуйте властивості в правій панелі

## 6. Експортуйте

- **PDF** - готовий для друку
- **PNG** - як зображення
- **Print** - пряма друк

## Приклад API виклику

```typescript
const response = await fetch('/api/worksheet/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Solar System',
    ageGroup: 'intermediate',
    pageCount: 2,
    exerciseTypes: ['fill-blank', 'multiple-choice'],
    difficulty: 'medium',
    language: 'en',
    includeImages: true,
  }),
});

const { worksheet } = await response.json();
```

## Доступні компоненти (14 типів)

### Text & Structure
- `title-block` - заголовки
- `body-text` - текст параграфів
- `bullet-list` - маркований список
- `numbered-list` - нумерований список
- `instructions-box` - інструкції з іконкою

### Exercises
- `fill-blank` - заповни пропуски
- `multiple-choice` - вибір з варіантів
- `true-false` - правда/неправда
- `short-answer` - короткі відповіді

### Helper Boxes
- `tip-box` - корисні поради (синій)
- `warning-box` - попередження (помаранчевий)

### Media & Layout
- `image-placeholder` - зображення
- `divider` - розділова лінія
- `table` - таблиця з даними

## Параметри генерації

### Topic (обов'язково)
Будь-яка освітня тема:
- "Present Simple Tense"
- "Animals and Their Habitats"
- "Solar System"
- "French Greetings"

### Age Group / Level
- `beginner` - A1
- `elementary` - A2
- `intermediate` - B1
- `upper-intermediate` - B2
- `advanced` - C1+

### Page Count
- 1-5 pages (рекомендовано)
- До 20 pages максимум

### Difficulty
- `easy` - прості вправи
- `medium` - середня складність
- `hard` - складні завдання

## Час генерації

- 1 page: ~10-15 sec
- 3 pages: ~20-30 sec
- 5 pages: ~30-45 sec

## Troubleshooting

### "GEMINI_API_KEY environment variable is required"
```bash
# Додайте в .env.local
GEMINI_API_KEY=your_key_here
```

### Generation takes too long
- Зменшіть кількість pages
- Перевірте інтернет з'єднання
- Подивіться console для помилок

### Empty pages
- Перевірте browser console
- Подивіться на відповідь API в Network tab
- Валідація може показати warnings

## Наступні кроки

1. **Читайте повну документацію:** `docs/AI_WORKSHEET_GENERATION.md`
2. **Експериментуйте з різними topics та age groups**
3. **Додайте власні компоненти** в Component Schema
4. **Налаштуйте промпт** для кращих результатів

---

**Happy Generating! 🎉**

