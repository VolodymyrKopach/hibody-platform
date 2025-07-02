# 🎨 Налаштування FLUX.1 [schnell] для генерації зображень

## Про FLUX.1 [schnell]

**FLUX.1 [schnell]** - це найновіша модель генерації зображень від Black Forest Labs, оптимізована для швидкості та якості. Вона ідеально підходить для створення освітніх ілюстрацій для дітей.

### Переваги FLUX.1 [schnell]:
- ⚡ **Швидкість**: Генерація за 2-4 секунди
- 🎯 **Якість**: Високодеталізовані зображення
- 🎨 **Стилі**: Мультяшний, реалістичний, ілюстративний
- 👶 **Безпека**: Оптимізовано для дітей
- 💰 **Ціна**: Економічний варіант

## Налаштування API

### 1. Отримання API ключа Together AI

1. Перейдіть на [together.ai](https://together.ai)
2. Зареєструйтесь або увійдіть в акаунт
3. Перейдіть в розділ API Keys
4. Створіть новий ключ для FLUX.1

### 2. Налаштування змінних середовища

Створіть файл `.env.local` у корені проекту:

```bash
# Claude API (для генерації контенту)
ANTHROPIC_API_KEY=your_claude_api_key_here

# Together AI API (для FLUX.1 schnell)
TOGETHER_API_KEY=your_together_api_key_here

# Environment
NODE_ENV=development
```

### 3. Перевірка підключення

Запустіть проект та перейдіть на `/images`:

```bash
npm run dev
```

Відкрийте http://localhost:3000/images

## Використання

### Базова генерація

```typescript
import { generateImage } from '@/utils/imageGeneration';

const result = await generateImage({
  prompt: 'Educational children illustration about mathematics',
  width: 1024,
  height: 768
});

if (result.success) {
  console.log('Generated:', result.image); // base64 string
}
```

### Генерація для слайдів

```typescript
const response = await fetch('/api/images/slide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Додавання чисел до 10',
    ageGroup: '6-12',
    style: 'cartoon',
    imageType: 'illustration'
  })
});
```

### Інтеграція з чатом

```typescript
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Створи урок про математику',
    generateImages: true,
    imagePrompts: ['Математичні числа', 'Додавання']
  })
});
```

## API Endpoints

### `/api/images` - Базова генерація
- **POST**: Генерація зображення за промптом
- **Параметри**: `prompt`, `width`, `height`, `aspectRatio`

### `/api/images/slide` - Для слайдів
- **POST**: Генерація освітнього зображення для слайду
- **Параметри**: `topic`, `ageGroup`, `style`, `imageType`

## Компоненти

### `ImageGenerator`
Повнофункціональний компонент для генерації зображень:

```tsx
import ImageGenerator from '@/components/ImageGenerator';

<ImageGenerator 
  onImageGenerated={(imageData, prompt) => {
    // Обробка згенерованого зображення
  }}
  initialTopic="Математика"
  initialAgeGroup="6-12"
  mode="embedded"
/>
```

## Оптимізація для освіти

### Автоматичні промпти
Система автоматично створює промпти, оптимізовані для дітей:

```typescript
import { createEducationalImagePrompt } from '@/utils/imageGeneration';

const prompt = createEducationalImagePrompt(
  'математика', // тема
  '6-12',       // вік
  'cartoon'     // стиль
);
// Результат: "High-quality cartoon style educational illustration for children (age 6-12) about математика. Bright colors, friendly characters..."
```

### Розміри зображень
Оптимальні розміри для різних цілей:

- **Слайди**: 1024x768 (4:3)
- **Мініатюри**: 512x512 (1:1)
- **Заголовки**: 1200x630 (широкий)
- **Активності**: 800x600

### Безпека контенту
Всі зображення автоматично фільтруються:
- ✅ Безпечний контент для дітей
- ✅ Позитивна атмосфера
- ✅ Освітня цінність
- ❌ Насильство
- ❌ Страшний контент

## Ціни

### Together AI (FLUX.1 schnell)
- **Ціна**: ~$0.003 за зображення
- **Швидкість**: 2-4 секунди
- **Якість**: Висока
- **Ліміти**: 1000 зображень/день (стандартний план)

### Порівняння з альтернативами
| Модель | Ціна | Швидкість | Якість |
|--------|------|-----------|--------|
| FLUX.1 schnell | $0.003 | 2-4с | ⭐⭐⭐⭐⭐ |
| DALL-E 3 | $0.04 | 10-30с | ⭐⭐⭐⭐⭐ |
| Midjourney | $0.025 | 30-60с | ⭐⭐⭐⭐⭐ |
| Stable Diffusion | Free | 5-15с | ⭐⭐⭐⭐ |

## Troubleshooting

### Помилка "API key not configured"
- Перевірте файл `.env.local`
- Переконайтесь, що `TOGETHER_API_KEY` встановлено
- Перезапустіть сервер розробки

### Помилка "Failed to generate image"
- Перевірте баланс Together AI
- Перевірте промпт на заборонений контент
- Спробуйте менший розмір зображення

### Повільна генерація
- FLUX.1 schnell має бути швидким (2-4с)
- Перевірте інтернет з'єднання
- Зменшіть розмір зображення

## Розширення функціональності

### Додавання нових стилів
Редагуйте `/utils/imageGeneration.ts`:

```typescript
const styleModifiers = {
  cartoon: 'Bright colors, friendly characters...',
  realistic: 'Photorealistic but appropriate...',
  illustration: 'Digital art style...',
  watercolor: 'Soft watercolor painting style...', // новий стиль
};
```

### Додавання нових розмірів
```typescript
const sizes = {
  slide: { width: 1024, height: 768 },
  story: { width: 800, height: 1000 }, // новий розмір
};
```

### Інтеграція з CMS
Можна інтегрувати з будь-якою CMS для збереження зображень:

```typescript
// Збереження в базу даних
const savedImage = await saveImageToDB({
  base64: result.image,
  prompt: result.prompt,
  metadata: result.metadata
});
```

## Підтримка

Якщо виникають проблеми:
1. Перевірте консоль браузера
2. Перевірте логи сервера
3. Перевірте статус Together AI API
4. Звертайтесь до документації Together AI

## Примітки

- FLUX.1 підтримує лише англійські промпти
- Система автоматично перекладає українські теми в англійські промпти
- Рекомендований розмір зображень: до 1024x1024 для кращої швидкості
- Модель оптимізована для 1-4 кроків генерації 