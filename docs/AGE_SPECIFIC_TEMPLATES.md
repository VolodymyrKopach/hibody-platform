# Age-Specific компонентні шаблони

## Огляд системи

Система age-specific компонентних шаблонів дозволяє AI використовувати відповідні до віку приклади компонентів при генерації HTML слайдів для дітей різних вікових груп.

## Архітектура

### 1. AgeComponentTemplatesService (`src/services/templates/AgeComponentTemplatesService.ts`)

Основний сервіс для управління age-specific шаблонами компонентів.

**Ключові можливості:**
- Завантаження HTML шаблонів для різних вікових груп
- Кешування шаблонів для оптимізації
- Fallback шаблони при відсутності файлів
- Описи шаблонів для кожної вікової групи

**Методи:**
- `getTemplateForAge(ageGroup)` - отримати шаблон для вікової групи
- `getTemplateDescription(ageGroup)` - опис шаблону
- `getAllTemplates()` - завантажити всі шаблони одночасно

### 2. HTML шаблони (`public/templates/age-components/`)

Кожна вікова група має свій HTML файл з прикладами компонентів:

#### 2-3 роки (`2-3.html`)
- **Стиль:** Дуже великі кнопки, яскраві кольори, прості анімації
- **Компоненти:** Великі інтерактивні елементи, тваринки-друзі, звукові ефекти
- **Інтерактивність:** Клік, простий hover, автоматичні анімації
- **Шрифт:** 48-60px, Comic Sans MS

#### 4-6 років (`4-6.html`)
- **Стиль:** Ігрові елементи, персонажі, карти завдань
- **Компоненти:** Герої-персонажі, інтерактивні карти, міні-ігри
- **Інтерактивність:** Квізи, прогрес-бари, рівні складності
- **Шрифт:** 36-48px, дитячий стиль

#### 7-8 років (`7-8.html`)
- **Стиль:** Навчальні елементи, структурований дизайн
- **Компоненти:** Модулі навчання, тести, досягнення, прогрес
- **Інтерактивність:** Складні форми, навігація, система балів
- **Шрифт:** 28-36px, професійний стиль

#### 9-10 років (`9-10.html`)
- **Стиль:** Дашборди, аналітика, складні інтерфейси
- **Компоненти:** Таблиці даних, діаграми, рейтинги, форми
- **Інтерактивність:** Складна навігація, експорт даних, налаштування
- **Шрифт:** 24-32px, дорослий стиль

## Інтеграція з генерацією слайдів

### GeminiContentService

Оновлено метод `buildSlideContentPrompt()` для включення age-specific шаблонів:

```typescript
// Отримуємо age-specific шаблон компонентів
const ageGroup = this.mapAgeToAgeGroup(age);
const ageTemplate = await ageComponentTemplatesService.getTemplateForAge(ageGroup);

// Включаємо шаблон в контекст для AI
const prompt = `
**ПРИКЛАДИ КОМПОНЕНТІВ ДЛЯ ЦІЄЇ ВІКОВОЇ ГРУПИ:**
${ageTemplate}

**ІНСТРУКЦІЇ З ВИКОРИСТАННЯ ШАБЛОНУ:**
- Вивчи стилі та компоненти з прикладу вище
- Адаптуй дизайн під свій контент
- Використовуй схожі кольори, шрифти та розміри
- Повторюй інтерактивні паттерни
`;
```

### Маппінг вікових груп

```typescript
private mapAgeToAgeGroup(age: string): AgeGroup {
  const ageNumber = parseInt(age.match(/\d+/)?.[0] || '6');
  
  if (ageNumber <= 3) return '2-3';
  if (ageNumber <= 6) return '4-6';
  if (ageNumber <= 8) return '7-8';
  return '9-10';
}
```

## Принципи SOLID

### Single Responsibility Principle (SRP)
- `AgeComponentTemplatesService` відповідає тільки за управління шаблонами
- Кожен HTML шаблон відповідає за одну вікову групу
- Окремі методи для завантаження, кешування та fallback

### Open/Closed Principle (OCP)
- Можна додавати нові вікові групи без зміни існуючого коду
- Легко розширити новими типами шаблонів

### Dependency Inversion Principle (DIP)
- Сервіси залежать від абстрактних інтерфейсів
- AI генератор не прив'язаний до конкретної реалізації шаблонів

## Тестування

### Автоматичне тестування
Компонент `AgeTemplatesTest` (`src/components/debug/AgeTemplatesTest.tsx`) дозволяє:
- Перевірити завантаження всіх шаблонів
- Валідувати структуру HTML
- Переглянути шаблони в браузері
- Отримати статистику розмірів файлів

### Доступ до тестів
Відкрийте `/test-age-templates` для запуску тестів.

## Використання

### Базове використання
```typescript
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';

// Отримати шаблон для конкретної вікової групи
const template = await ageComponentTemplatesService.getTemplateForAge('4-6');

// Отримати опис шаблону
const description = ageComponentTemplatesService.getTemplateDescription('4-6');

// Завантажити всі шаблони
const allTemplates = await ageComponentTemplatesService.getAllTemplates();
```

### Інтеграція з AI генерацією
```typescript
// В сервісі генерації контенту
const prompt = await this.buildSlideContentPrompt(description, topic, age);
const slideHTML = await this.contentService.generateSlideContent(prompt, topic, age);
```

## Переваги

1. **Відповідність віку:** AI отримує конкретні приклади для кожної вікової групи
2. **Консистентність:** Всі слайди використовують схожі паттерни дизайну
3. **Якість:** AI краще розуміє очікувані стилі та компоненти
4. **Масштабованість:** Легко додавати нові вікові групи та оновлювати шаблони
5. **Продуктивність:** Кешування шаблонів зменшує навантаження
6. **Fallback:** Система працює навіть при відсутності шаблонів

## Розвиток

### Додавання нової вікової групи

1. Створити HTML файл `public/templates/age-components/{age}.html`
2. Додати новий `AgeGroup` в `src/types/generation.ts`
3. Оновити маппінг в `mapAgeToAgeGroup()`
4. Додати опис в `getTemplateDescription()`

### Оновлення шаблонів

1. Відредагувати відповідний HTML файл
2. Очистити кеш (автоматично при рестарті)
3. Протестувати зміни через `/test-age-templates`

## Структура HTML шаблонів

Кожен шаблон містить:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <style>/* Age-specific CSS */</style>
</head>
<body>
  <!-- Age-appropriate components -->
  <script>/* Interactive JavaScript */</script>
</body>
</html>
```

### Обов'язкові секції:
- Заголовок з віковою групою
- Основні візуальні компоненти
- Інтерактивні елементи
- Система відгуків/прогресу
- Адаптивний дизайн

## Моніторинг

Система автоматично логує:
- Успішне завантаження шаблонів
- Помилки завантаження (з fallback)
- Розміри завантажених шаблонів
- Час завантаження

Приклад логів:
```
✅ Loaded age template for 2-3, length: 12543
⚠️ Template for age 4-6 not found, using fallback
🎯 All templates loaded successfully
``` 