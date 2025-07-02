# Кастомні розміри зображень у HiBody Platform

## Огляд

Система тепер підтримує кастомні розміри для генерації зображень через FLUX.1-schnell API. Claude може вказувати оптимальний розмір зображення в залежності від контексту та призначення.

## Як використовувати

### Базовий синтаксис

```html
<!-- generate image: опис зображення [ширина:висота] -->
```

### Приклади

```html
<!-- generate image: friendly cartoon dinosaur [512:512] -->
<!-- generate image: colorful minions playing together [1024:512] -->
<!-- generate image: cute cat portrait [384:512] -->
<!-- generate image: magical forest background [1024:768] -->
```

### Без розмірів (використовуються дефолтні 512x512)

```html
<!-- generate image: simple character illustration -->
```

## Рекомендовані розміри

### Портрети персонажів
- **384x512** - стандартний портрет
- **512x640** - детальний портрет

### Широкі сцени
- **1024x512** - панорамна сцена
- **768x512** - широка сцена

### Квадратні ілюстрації
- **512x512** - стандартне квадратне зображення
- **768x768** - детальне квадратне зображення

### Фонові зображення
- **1024x768** - стандартний фон
- **1280x720** - широкий фон (16:9)

## Технічна реалізація

### 1. Системні промпти

Claude отримує інструкції використовувати новий формат:

```
🎨 ВАЖЛИВО ДЛЯ HTML СЛАЙДІВ:
- Використовуй коментарі для зображень: <!-- generate image: English description [width:height] -->
- Приклади з розмірами:
  * <!-- generate image: friendly cartoon dinosaur [512:512] --> (квадратне)
  * <!-- generate image: colorful minions playing [1024:512] --> (широке)
  * <!-- generate image: cute cat portrait [384:512] --> (вертикальне)
```

### 2. Парсинг коментарів

Функція `extractImageRequests` використовує regex для парсингу:

```javascript
const imageCommentRegex = /<!--\s*generate\s+image:\s*([^-\[]+)(?:\s*\[(\d+):(\d+)\])?\s*-->/gi;
```

Результат:
- `match[1]` - промпт для зображення
- `match[2]` - ширина (опціонально)
- `match[3]` - висота (опціонально)

### 3. Генерація зображень

Функція `processImageGeneration` використовує кастомні розміри:

```javascript
const imageWidth = request.width || 512;
const imageHeight = request.height || 512;

const imageResponse = await fetch(`http://localhost:3000/api/images`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: enhancedPrompt,
    width: imageWidth,
    height: imageHeight
  })
});
```

## Переваги кастомних розмірів

### 1. Оптимізація для контексту
- **Портрети**: вертикальний формат краще підходить для зображень персонажів
- **Сцени**: широкий формат ідеальний для пейзажів та групових сцен
- **Фони**: великі розміри забезпечують кращу якість фонових зображень

### 2. Ефективність генерації
- Claude вибирає оптимальний розмір відповідно до призначення
- Менші зображення генеруються швидше
- Великі зображення мають кращу деталізацію

### 3. Кращий UX
- Зображення краще вписуються в дизайн слайдів
- Правильні пропорції покращують сприйняття
- Оптимізація для різних типів контенту

## Приклади використання Claude

### Для портретів персонажів:
```html
<div class="character-container" style="position: relative; width: 200px; height: 260px;">
  <!-- generate image: happy minion with goggles [384:512] -->
</div>
```

### Для широких сцен:
```html
<div class="scene-container" style="position: relative; width: 100%; height: 300px;">
  <!-- generate image: colorful playground with children playing [1024:512] -->
</div>
```

### Для фонових зображень:
```html
<div class="background-container" style="position: relative; width: 100%; height: 400px;">
  <!-- generate image: magical forest background with fairy lights [1024:768] -->
</div>
```

## Тестування

### API Endpoint

```bash
# Широке зображення
curl -X POST http://localhost:3000/api/images \
  -H "Content-Type: application/json" \
  -d '{"prompt": "friendly dinosaur", "width": 1024, "height": 512}'

# Вертикальне зображення  
curl -X POST http://localhost:3000/api/images \
  -H "Content-Type: application/json" \
  -d '{"prompt": "cute cat portrait", "width": 384, "height": 512}'
```

### Парсинг коментарів

Система автоматично парсить розміри з коментарів та передає їх до FLUX API.

## Зворотна сумісність

- Старі коментарі без розмірів продовжують працювати
- Дефолтний розмір: 512x512
- Автоматичне додавання розмірів до нових коментарів

## Обмеження FLUX.1-schnell

- Мінімальний розмір: 256x256
- Максимальний розмір: 1024x1024
- Рекомендовані кратні 64 пікселі для оптимальної якості

## Майбутні покращення

1. **Автоматичний вибір розміру** - Claude може аналізувати контекст і автоматично вибирати оптимальний розмір
2. **Адаптивні розміри** - підтримка різних розмірів для мобільних та десктопних пристроїв  
3. **Попередній перегляд** - можливість бачити розміри зображення перед генерацією
4. **Шаблони розмірів** - готові пресети для різних типів контенту 