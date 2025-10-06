# 🔒 Безпечна генерація зображень через Server-Side API

## Проблема
Раніше генерація зображень для worksheet працювала тільки на localhost через використання `NEXT_PUBLIC_TOGETHER_API_KEY`, який відкритий в браузері. Це небезпечно на продакшені - будь-хто міг вкрасти API ключ з DevTools.

## Рішення
Реалізовано batch API endpoint на сервері, який безпечно генерує зображення паралельно.

---

## 🏗️ Архітектура

### 1. Batch API Endpoint
**Файл:** `src/app/api/worksheet/generate-images/route.ts`

```typescript
POST /api/worksheet/generate-images
{
  "images": [
    {
      "id": "0-1",
      "prompt": "Educational cartoon cat",
      "width": 512,
      "height": 512
    },
    {
      "id": "0-2",
      "prompt": "Friendly dinosaur learning math",
      "width": 400,
      "height": 300
    }
  ]
}
```

**Відповідь:**
```json
{
  "success": true,
  "results": [
    {
      "id": "0-1",
      "success": true,
      "image": "base64_encoded_image_data",
      "dimensions": { "width": 512, "height": 512 }
    }
  ],
  "stats": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "duration": 5420
  }
}
```

### 2. Оновлений сервіс
**Файл:** `src/services/worksheet/WorksheetImageGenerationService.ts`

Тепер сервіс:
- ✅ Не використовує API ключ на клієнті
- ✅ Генерує всі зображення паралельно через batch API
- ✅ Має retry логіку на сервері (3 спроби)
- ✅ Повідомляє прогрес через callback
- ✅ Повністю безпечний

### 3. Оновлені компоненти
**Файли:**
- `src/components/worksheet/WorksheetEditor.tsx`
- `src/components/worksheet/Step3CanvasEditor.tsx`

Більше не передають `NEXT_PUBLIC_TOGETHER_API_KEY`, просто створюють сервіс:
```typescript
const imageService = new WorksheetImageGenerationService();
```

---

## 🚀 Використання

### Генерація для всього worksheet
```typescript
import { WorksheetImageGenerationService } from '@/services/worksheet/WorksheetImageGenerationService';

const imageService = new WorksheetImageGenerationService();

const result = await imageService.generateImagesForWorksheet(
  worksheet,
  (progress) => {
    console.log(`Progress: ${progress.completed}/${progress.total}`);
    console.log(`Current: ${progress.current}`);
    console.log(`Errors: ${progress.errors}`);
  }
);

console.log(`Generated: ${result.stats.generated}/${result.stats.totalImages}`);
console.log(`Failed: ${result.stats.failed}`);
console.log(`Duration: ${result.stats.duration}ms`);
```

### Генерація одного зображення
```typescript
const imageService = new WorksheetImageGenerationService();

const imageUrl = await imageService.generateSingleImage(
  'Educational cartoon cat playing with yarn',
  512,
  512
);

// imageUrl = "data:image/png;base64,..."
```

---

## ⚙️ Налаштування

### Змінні середовища

**❌ Старий варіант (небезпечний):**
```env
NEXT_PUBLIC_TOGETHER_API_KEY=your_key_here  # ❌ Відкритий в браузері!
```

**✅ Новий варіант (безпечний):**
```env
TOGETHER_API_KEY=your_key_here  # ✅ Тільки на сервері
```

### Як налаштувати на продакшені

1. **Vercel / Netlify:**
   - Додайте змінну `TOGETHER_API_KEY` в Environment Variables
   - НЕ додавайте префікс `NEXT_PUBLIC_`

2. **Docker:**
   ```dockerfile
   ENV TOGETHER_API_KEY=your_key_here
   ```

3. **Local development:**
   ```bash
   # .env.local
   TOGETHER_API_KEY=your_together_api_key_here
   ```

---

## 🎯 Переваги нового підходу

### Безпека
- ✅ API ключ ніколи не потрапляє в браузер
- ✅ Неможливо вкрасти через DevTools
- ✅ Запити йдуть тільки з сервера

### Продуктивність
- ✅ Паралельна генерація всіх зображень (batch)
- ✅ Автоматичний retry при помилках (3 спроби)
- ✅ Оптимізація розмірів (multiples of 16 для FLUX)

### Зручність
- ✅ Прогрес-репортинг в реальному часі
- ✅ Детальна статистика генерації
- ✅ Логування для дебагу
- ✅ Зрозумілі помилки

---

## 📊 Приклад виводу в консоль

```
🎨 [WorksheetImageGen] Starting image generation for worksheet
📊 [WorksheetImageGen] Found 4 images to generate
🚀 [WorksheetImageGen] Calling batch API endpoint...
📋 [BatchImageGen] Received request for 4 images
🚀 [BatchImageGen] Starting parallel generation of 4 images...
🎨 [BatchImageGen] Generating: Educational cartoon cat... (512x512)
🎨 [BatchImageGen] Generating: Friendly dinosaur... (400x300)
🎨 [BatchImageGen] Generating: Math numbers colorful... (512x384)
🎨 [BatchImageGen] Generating: Science experiment... (600x400)
✅ [BatchImageGen] Completed in 5420ms: { total: 4, successful: 4, failed: 0 }
✅ [WorksheetImageGen] Batch generation completed: { total: 4, successful: 4, failed: 0, duration: 5420 }
✅ [WorksheetImageGen] Final results: { totalImages: 4, generated: 4, failed: 0, duration: '5432ms' }
```

---

## 🐛 Troubleshooting

### Помилка "API key not configured"
**Причина:** Відсутня змінна `TOGETHER_API_KEY` на сервері

**Рішення:**
1. Перевірте `.env.local`:
   ```bash
   cat .env.local | grep TOGETHER_API_KEY
   ```
2. Додайте змінну без `NEXT_PUBLIC_` префіксу
3. Перезапустіть dev сервер:
   ```bash
   npm run dev
   ```

### Помилка "Batch API error: 500"
**Причина:** Проблема на сервері під час генерації

**Рішення:**
1. Перевірте консоль сервера на помилки
2. Перевірте, що API ключ Together AI валідний
3. Перевірте ліміти вашого Together AI акаунту

### Повільна генерація
**Причина:** Багато зображень або великі розміри

**Рішення:**
- Batch API генерує паралельно, але Together AI має ліміти
- Для 10+ зображень може зайняти 10-30 секунд
- Це нормально для FLUX.1 schnell

---

## 🧪 Тестування

Перевірте генерацію:

1. **Перейдіть на worksheet generator:**
   ```
   http://localhost:3000/worksheet-generator
   ```

2. **Згенеруйте worksheet з зображеннями:**
   - Оберіть тему
   - Оберіть вікову групу
   - Натисніть "Генерувати з зображеннями"

3. **Перевірте консоль браузера:**
   - Повинні бути логи прогресу
   - НЕ повинно бути помилок API key

4. **Перевірте консоль сервера:**
   - Повинні бути логи batch generation
   - Повинна бути статистика

---

## 📈 Статистика продуктивності

### Порівняння старого і нового підходів

| Метрика | Старий (клієнт) | Новий (batch API) |
|---------|-----------------|-------------------|
| Безпека | ❌ API key в браузері | ✅ Тільки на сервері |
| Швидкість (4 зображення) | ~20s (послідовно) | ~5-6s (паралельно) |
| Retry при помилках | ❌ Ні | ✅ 3 спроби |
| Прогрес | ✅ Так | ✅ Так |
| Продакшн ready | ❌ Ні | ✅ Так |

---

## 🔄 Міграція зі старої версії

Якщо ви використовували старий код:

### Було:
```typescript
const imageService = new WorksheetImageGenerationService(
  process.env.NEXT_PUBLIC_TOGETHER_API_KEY
);
```

### Стало:
```typescript
const imageService = new WorksheetImageGenerationService();
```

### Оновіть .env:
```diff
- NEXT_PUBLIC_TOGETHER_API_KEY=your_key_here
+ TOGETHER_API_KEY=your_key_here
```

**Все інше працює так само!** API сервісу не змінився.

---

## 📚 Додаткові ресурси

- [Together AI Documentation](https://docs.together.ai/docs/quickstart)
- [FLUX.1 schnell Model Card](https://together.ai/models/flux)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Дата оновлення:** 6 жовтня 2025  
**Версія:** 2.0  
**Статус:** ✅ Production Ready
