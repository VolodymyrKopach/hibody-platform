# Base64 Images Handling Implementation

## Проблема

При редагуванні слайдів з base64 зображеннями виникала помилка "prompt is too long: 212906 tokens > 200000 maximum" через великий розмір HTML коду.

## Рішення

Реалізовано систему витягування та відновлення base64 зображень:

1. **Витягування** - base64 дані замінюються на placeholder'и
2. **Обробка** - стислий HTML надсилається до Claude
3. **Відновлення** - base64 дані вставляються назад у результат

## Реалізація

### 1. Методи в SimpleEditService

#### extractBase64Images()
```typescript
private extractBase64Images(html: string): { 
  cleanedHTML: string; 
  extractedImages: Array<{ placeholder: string; data: string }> 
}
```

**Що робить:**
- Знаходить всі `src="data:image/..."` атрибути
- Знаходить всі `url(data:image/...)` в CSS
- Замінює на placeholder'и: `[BASE64_IMAGE_0]`, `[BASE64_CSS_1]`
- Зберігає оригінальні дані

#### restoreBase64Images()
```typescript
private restoreBase64Images(
  html: string, 
  extractedImages: Array<{ placeholder: string; data: string }>
): string
```

**Що робить:**
- Шукає placeholder'и в результаті від Claude
- Замінює їх на оригінальні base64 дані
- Відновлює як в `src` атрибутах, так і в CSS `url()`

#### compressHTML()
```typescript
private compressHTML(html: string): string
```

**Що робить:**
- Видаляє HTML коментарі (окрім IMAGE_PROMPT)
- Стискає пробіли та переноси рядків
- Видаляє зайві пробіли між тегами

### 2. Процес обробки

1. **Витягування:**
   ```
   Оригінал: 212,906 символів
   Очищений: 15,234 символів
   Стислий: 12,890 символів
   ```

2. **Відправка до Claude:**
   - Надсилається стислий HTML без base64
   - Додаються інструкції про placeholder'и
   - Claude отримує зрозумілий, компактний код

3. **Відновлення:**
   - Результат від Claude обробляється
   - Placeholder'и замінюються на оригінальні base64
   - Повертається повний HTML з зображеннями

### 3. Інструкції для Claude

Додано в промпт:
```
7. 🔄 PLACEHOLDER'И: Якщо бачиш [BASE64_IMAGE_X] або [BASE64_CSS_X] - це тимчасові placeholder'и, НЕ видаляй їх

**РОБОТА З ЗОБРАЖЕННЯМИ:**
- ⚠️ PLACEHOLDER'И: Якщо бачиш src="[BASE64_IMAGE_X]" - це тимчасові placeholder'и, зберігай їх як є
```

## Приклад роботи

### До обробки:
```html
<img src="data:image/webp;base64,UklGRrQJAABXRUJQVlA4IKgJAABwLQCdASqAAIAAPm0wlEckIyIhITEsOIANiWdu4XcNMVF+..." />
```

### Під час обробки:
```html
<img src="[BASE64_IMAGE_0]" />
```

### Після відновлення:
```html
<img src="data:image/webp;base64,UklGRrQJAABXRUJQVlA4IKgJAABwLQCdASqAAIAAPm0wlEckIyIhITEsOIANiWdu4XcNMVF+..." />
```

## Логування

Система логує процес:
```
📏 Original: 212906, Cleaned: 15234, Compressed: 12890
🖼️ Extracted 3 base64 images
🔧 Simple slide editing with Claude...
✅ Simple slide edit completed, length: 198450
```

## Переваги

1. **Розв'язує проблему token limit** - HTML стає в 10-15 разів менший
2. **Зберігає всі зображення** - нічого не втрачається
3. **Прозорість для Claude** - AI отримує чистий, зрозумілий код
4. **Автоматичність** - працює без додаткових налаштувань

## Обмеження

1. **Regex складність** - потребує точних регулярних виразів
2. **Порядок відновлення** - важливо зберігати правильну послідовність
3. **CSS підтримка** - потрібно обробляти як HTML, так і CSS

## Тестування

Для тестування:
1. Створити слайд з великими base64 зображеннями
2. Спробувати редагувати ("заміни заголовок")
3. Перевірити, що зображення зберігаються
4. Перевірити розмір промпту в логах

## Майбутні покращення

1. **Кешування** - зберігати витягнуті зображення
2. **Оптимізація** - стискати base64 дані
3. **Валідація** - перевіряти цілісність після відновлення
4. **Метрики** - збирати статистику ефективності стискання 