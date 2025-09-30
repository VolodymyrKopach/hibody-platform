# Worksheet Generator - HTML Wireframes

Цей каталог містить HTML wireframes для MVP Worksheet Generator - Canva-подібної платформи створення навчальних матеріалів.

## 📁 Структура Wireframes

### **01-template-wizard.html**
**Крок 1: Template Wizard**
- Форма вибору параметрів worksheet
- Налаштування: Age Group, Level, Focus, Type, Topic
- Інтуїтивний UI з кнопками-опціями
- Step indicator (прогрес 1/4)

### **02-ai-generation.html**
**Крок 2: AI Generation Loading**
- Екран завантаження з анімацією
- Покроковий прогрес генерації
- Estimated time та cancel опція
- Step indicator (прогрес 2/4)

### **03-worksheet-editor.html** *(видалено - об'єднано з Advanced Editor)*

### **04-export-download.html**
**Крок 4: Export & Download**
- Фінальний preview worksheet
- Опції завантаження (PDF, PNG)
- Save options та статистика
- Success state з додатковими діями
- Step indicator (прогрес 4/4)

### **05-worksheet-templates.html**
**Sample Templates Gallery**
- 5 основних типів worksheet темплейтів:
  - Grammar Practice Sheet
  - Vocabulary Builder  
  - Reading Comprehension
  - Speaking Activity Sheet
  - Mixed Skills Quiz
- Різні кольорові теми та структури

### **06-worksheet-editor.html**
**Unified Worksheet Editor**
- Єдиний редактор з можливістю Simple ↔ Advanced режимів
- Професійний canvas редактор з Fabric.js можливостями
- Трипанельний інтерфейс: Elements, Canvas, Properties
- Візуальні контроли (resize handles, selection boxes)
- Smart guides та grid system
- Layers panel з drag & drop
- Детальні properties для кожного елемента
- AI інтеграція для покращення контенту
- Кнопка переключення між Simple/Advanced режимами

## 🎨 **Design System**

### **Кольорова Палітра:**
- **Primary:** #667eea (фіолетовий)
- **Success:** #10b981 (зелений)
- **Background:** #f8fafc (світло-сірий)
- **Text:** #374151 (темно-сірий)
- **Secondary:** #6b7280 (сірий)

### **Типографія:**
- **Font Family:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Headers:** 18px-32px, font-weight: 600
- **Body:** 14px-16px, font-weight: 400
- **Small:** 12px, color: #6b7280

### **Компоненти:**
- **Buttons:** Rounded corners (8px), padding 12-20px
- **Cards:** White background, box-shadow, border-radius 12px
- **Form Elements:** Border-radius 8px, focus states
- **Step Indicator:** 4 steps, active/completed states

## 🚀 **Як Переглянути**

1. Відкрийте будь-який HTML файл у браузері
2. Кожен wireframe є повністю інтерактивним
3. Включає hover states та transitions
4. Responsive design для різних екранів

## 💡 **Ключові UX Принципи**

### **Простота:**
- Мінімум кліків до результату
- Зрозумілі іконки та labels
- Логічний flow між кроками

### **Швидкість:**
- Автоматична генерація контенту
- Inline editing без модальних вікон
- Instant preview змін

### **Персоналізація:**
- Параметри для різних аудиторій
- Кольорові теми та стилі
- AI адаптація під потреби

### **Професійність:**
- Чистий, сучасний дизайн
- Якісні експорт опції
- Статистика та метадані

## 🚀 **Fabric.js Enhancements**

### **Розширені Можливості:**
- **Visual Controls** - resize handles, rotation controls, selection boxes
- **Smart Positioning** - snap to grid, smart guides, alignment tools
- **Layer Management** - повний контроль над шарами та z-index
- **Multi-Selection** - групове редагування елементів
- **Keyboard Shortcuts** - професійні hotkeys для швидкої роботи
- **Undo/Redo System** - повна історія змін
- **High-Quality Export** - 300 DPI, SVG, множинні формати
- **Properties Panel** - точний контроль над кожним елементом
- **Advanced Typography** - line height, letter spacing, text wrapping

## 🔄 **User Journey**

```
Landing → Wizard → Generation → Editing → Export
   ↓        ↓         ↓          ↓        ↓
  30s      30s       2-3min     10s    Done
```

**Загальний час:** 5 хвилин від ідеї до готового worksheet

## 📱 **Responsive Considerations**

- **Desktop:** Повний функціонал, sidebar + main area
- **Tablet:** Адаптивна сітка, збережений workflow  
- **Mobile:** Стек layout, touch-friendly controls

## 🎯 **MVP Фокус**

Ці wireframes показують **мінімально життєздатний продукт** з:
- ✅ Базовою AI генерацією
- ✅ Простим редагуванням
- ✅ Якісним експортом
- ✅ Інтуїтивним UX

**Не включено в MVP:**
- ❌ Складний drag & drop
- ❌ Кастомні шаблони
- ❌ Колаборація
- ❌ Advanced AI features

## 🧩 **Atomic Components Integration**

### **Phase 1: MVP Компоненти (8):**
1. **Title Block** - заголовки з автостилізацією
2. **Body Text** - форматований основний текст
3. **Instructions Box** - інструкції з іконками та кольоровим дизайном
4. **Fill-in-the-Blank** - вправи з пропусками та підказками
5. **Multiple Choice** - питання з варіантами відповідей
6. **Warning Box** - попередження з жовтим акцентом
7. **Tip Box** - поради з синім дизайном та іконкою лампочки
8. **Image Placeholder** - зображення з підписами та alt text

### **Phase 2: Essential Extensions (+5):**
9. **True/False Component** - швидкі перевірки фактів
10. **Word Bank Component** - списки слів для вправ
11. **Table/Grid Component** - організація даних
12. **Speech Bubble Component** - діалоги та розмови
13. **QR Code Component** - посилання на ресурси

### **Переваги Атомарного Підходу:**
- **Семантичність** - кожен компонент має освітнє значення
- **Консистентність** - єдиний дизайн та поведінка
- **AI Integration** - розуміння контексту для кращої генерації
- **Швидкість** - готові компоненти замість створення з нуля
- **Професійність** - якісний дизайн без дизайнерських навичок

Ці wireframes служать як **blueprint для розробки** та **референс для дизайну** MVP версії Worksheet Generator з повною підтримкою атомарних компонентів.
