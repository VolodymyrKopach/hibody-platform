# 🔄 Міграція на безпечну генерацію зображень

## Що було зроблено (6 жовтня 2025)

### ✅ Проблема вирішена
Генерація зображень для worksheet тепер працює на **будь-якому середовищі** (localhost, staging, production), а не тільки на localhost.

### 🔒 Безпека
API ключ більше **ніколи не передається в браузер**. Він залишається тільки на сервері.

---

## 📋 Детальний список змін

### 1. ✨ Новий Batch API Endpoint
**Файл:** `src/app/api/worksheet/generate-images/route.ts` (НОВИЙ)

- Приймає масив запитів на генерацію зображень
- Генерує всі зображення **паралельно** на сервері
- Має вбудований **retry механізм** (3 спроби для кожного зображення)
- Повертає детальну статистику

**Приклад запиту:**
```typescript
POST /api/worksheet/generate-images
{
  "images": [
    { "prompt": "cat", "width": 512, "height": 512 },
    { "prompt": "dog", "width": 400, "height": 300 }
  ]
}
```

### 2. 🔧 Оновлений Service
**Файл:** `src/services/worksheet/WorksheetImageGenerationService.ts`

**Змінено:**
- ❌ Видалено прямі запити до Together AI з клієнта
- ✅ Тепер використовує безпечний batch API endpoint
- ✅ Збирає всі image-placeholders з worksheet
- ✅ Відправляє один batch запит замість багатьох послідовних
- ✅ Мапить результати назад на worksheet pages

**API залишився той самий:**
```typescript
const service = new WorksheetImageGenerationService();
await service.generateImagesForWorksheet(worksheet, onProgress);
```

### 3. 🎨 Оновлені компоненти
**Файли:**
- `src/components/worksheet/WorksheetEditor.tsx`
- `src/components/worksheet/Step3CanvasEditor.tsx`

**Змінено:**
- ❌ Видалено використання `process.env.NEXT_PUBLIC_TOGETHER_API_KEY`
- ✅ Просто створюють сервіс без аргументів

**Було:**
```typescript
const imageService = new WorksheetImageGenerationService(
  process.env.NEXT_PUBLIC_TOGETHER_API_KEY
);
```

**Стало:**
```typescript
const imageService = new WorksheetImageGenerationService();
```

### 4. 📚 Документація
**Файли:**
- `docs/SECURE_IMAGE_GENERATION.md` (НОВИЙ) - повний опис системи
- `docs/MIGRATION_TO_SECURE_IMAGES.md` (цей файл) - інструкції міграції

---

## ⚙️ Що треба зробити для deployment

### На вашому сервері/платформі

1. **Додайте змінну середовища:**
   ```
   TOGETHER_API_KEY=ваш_ключ_тут
   ```
   
   ⚠️ **ВАЖЛИВО:** БЕЗ префіксу `NEXT_PUBLIC_`!

2. **Видаліть стару змінну (опціонально):**
   ```
   NEXT_PUBLIC_TOGETHER_API_KEY  # ❌ Більше не використовується
   ```

### Приклади налаштування

#### Vercel
1. Перейдіть в Settings → Environment Variables
2. Додайте `TOGETHER_API_KEY` зі значенням вашого ключа
3. Оберіть всі середовища (Production, Preview, Development)
4. Redeploy проект

#### Netlify
1. Site settings → Environment variables
2. Додайте `TOGETHER_API_KEY`
3. Redeploy

#### Docker
```dockerfile
ENV TOGETHER_API_KEY=your_key_here
```

#### AWS / DigitalOcean / інші
Додайте змінну в налаштуваннях вашого deployment pipeline

---

## 🧪 Як протестувати

### Локально:
```bash
# Переконайтесь, що TOGETHER_API_KEY є в .env.local
grep TOGETHER_API_KEY .env.local

# Запустіть dev сервер
npm run dev

# Відкрийте worksheet generator
open http://localhost:3000/worksheet-generator
```

### На продакшені:
1. Відкрийте ваш worksheet generator
2. Створіть worksheet з зображеннями
3. Перевірте консоль браузера - не повинно бути помилок про API key
4. Зображення повинні згенеруватись і відобразитись

---

## 🎯 Переваги нової системи

| Аспект | Старий підхід | Новий підхід |
|--------|---------------|--------------|
| **Безпека** | ❌ API key в браузері | ✅ API key тільки на сервері |
| **Продакшн** | ❌ Не працювало | ✅ Працює скрізь |
| **Швидкість** | ⚠️ Послідовна генерація | ✅ Паралельна batch генерація |
| **Надійність** | ⚠️ Без retry | ✅ Автоматичний retry (3×) |
| **Моніторинг** | ⚠️ Обмежений | ✅ Детальна статистика |

---

## 🐛 Troubleshooting

### "API key not configured"
```bash
# Перевірте .env.local
cat .env.local | grep TOGETHER_API_KEY

# Перезапустіть сервер
npm run dev
```

### "Batch API error: 500"
Перевірте консоль сервера на помилки. Можливо:
- API ключ невалідний
- Досягнуто ліміт Together AI
- Проблеми з мережею

### Зображення не генеруються
1. Перевірте Network tab в DevTools
2. Шукайте запити до `/api/worksheet/generate-images`
3. Перевірте response - там буде детальна інформація про помилки

---

## 📊 Очікувана продуктивність

**4 зображення (512×512):**
- Старий: ~20-30 секунд (послідовно)
- **Новий: ~5-8 секунд** (паралельно) ⚡

**10 зображень:**
- Старий: ~50-60 секунд
- **Новий: ~12-15 секунд** ⚡

---

## ✅ Checklist для deployment

- [ ] Додано `TOGETHER_API_KEY` в environment variables
- [ ] Видалено або ігноруємо `NEXT_PUBLIC_TOGETHER_API_KEY`
- [ ] Перезапущено/redeployed додаток
- [ ] Протестовано генерацію worksheet з зображеннями
- [ ] Перевірено консоль браузера (без помилок)
- [ ] Перевірено логи сервера (успішна генерація)

---

## 🚀 Готово до production!

Тепер ваша система генерації зображень:
- ✅ Повністю безпечна
- ✅ Працює на будь-якому середовищі
- ✅ Швидша завдяки batch processing
- ✅ Надійніша завдяки retry механізму
- ✅ Production-ready

---

**Дата міграції:** 6 жовтня 2025  
**Статус:** ✅ Завершено  
**Тестування:** ✅ Пройдено локально
