# Atomic Components System для Worksheet Generator

## 🧩 **Концепція Атомарних Компонентів**

Замість простих текстових блоків та зображень, ми створюємо **семантичні освітні компоненти** з готовим дизайном та функціональністю. Кожен компонент має свою структуру, стилізацію та поведінку.

## 📚 **Must Have Components (MVP - Топ-8)**

### **1. Title Block**
**Призначення:** Заголовки різних рівнів для структурування контенту

**Структура:**
- Текст заголовка
- Рівень важливості (H1, H2, H3)
- Автоматичне стилізування
- Responsive розміри шрифтів

**Варіації:**
- **Main Title** - основний заголовок worksheet (28px, bold, center)
- **Section Title** - заголовки розділів (20px, bold, left)
- **Exercise Title** - заголовки вправ (16px, semi-bold, left)

**AI Integration:**
- Автоматична генерація заголовків на основі контенту
- Пропозиції покращення формулювання
- Адаптація під вікову групу

### **2. Body Text**
**Призначення:** Основний текстовий контент з форматуванням

**Структура:**
- Rich text з можливістю форматування
- Автоматичні відступи та інтервали
- Підтримка списків та виділень
- Responsive typography

**Варіації:**
- **Paragraph** - звичайні абзаци (14px, regular)
- **Description** - описи вправ (13px, regular)
- **Example** - приклади (13px, italic)

**AI Integration:**
- Генерація контенту відповідно до теми
- Перевірка граматики та стилю
- Адаптація складності під рівень

### **3. Instructions Box**
**Призначення:** Виділені інструкції з візуальним акцентом

**Структура:**
```
┌─────────────────────────────────┐
│ 📋 Instructions                 │
│ ─────────────────────────────── │
│ Complete the exercises below... │
│                                 │
└─────────────────────────────────┘
```

**Дизайн:**
- Синій фон (#EFF6FF)
- Ліва синя межа (4px, #2563EB)
- Іконка інструкції (📋, ✏️, 👀)
- Заголовок "Instructions"
- Основний текст інструкції

**Варіації:**
- **Reading Instructions** (📖) - для читання
- **Writing Instructions** (✏️) - для письма
- **Listening Instructions** (👂) - для аудіювання
- **Speaking Instructions** (🗣️) - для говоріння

**AI Integration:**
- Генерація чітких інструкцій
- Адаптація складності мови
- Додавання релевантних іконок

### **4. Fill-in-the-Blank**
**Призначення:** Вправи з пропусками для заповнення

**Структура:**
```
1. She _______ (go) to school every day.
   ────────

2. They _______ (play) football on Sundays.
   ────────
```

**Компоненти:**
- Номер питання в кружечку
- Текст з пропуском (______)
- Підказка в дужках (опціонально)
- Лінія для відповіді
- Word bank (якщо потрібно)

**Варіації:**
- **Short Answer** - коротка лінія (50px)
- **Long Answer** - довга лінія (100px)
- **Multiple Blanks** - кілька пропусків в одному реченні
- **With Word Bank** - з банком слів зверху

**AI Integration:**
- Генерація речень з пропусками
- Підбір відповідної складності
- Створення підказок та word bank

### **5. Multiple Choice**
**Призначення:** Питання з варіантами відповідей

**Структура:**
```
1. She _____ coffee every morning.
   ○ a) drink
   ○ b) drinks  
   ○ c) drinking
```

**Компоненти:**
- Номер питання
- Текст питання
- Варіанти відповідей (A, B, C, D)
- Radio buttons або літери в кружечках
- Простір для позначення

**Варіації:**
- **True/False** - 2 варіанти
- **Three Options** - A, B, C
- **Four Options** - A, B, C, D
- **Image Options** - варіанти з картинками

**AI Integration:**
- Генерація питань та варіантів
- Створення правдоподібних дистракторів
- Балансування складності варіантів

### **6. Warning Box**
**Призначення:** Важливі попередження та застереження

**Структура:**
```
┌─────────────────────────────────┐
│ ⚠️  Warning                     │
│ ─────────────────────────────── │
│ Pay attention to the spelling   │
│ of irregular verbs!             │
└─────────────────────────────────┘
```

**Дизайн:**
- Жовтий/помаранчевий фон (#FFF7ED)
- Ліва помаранчева межа (4px, #EA580C)
- Іконка попередження (⚠️, ❗)
- Заголовок "Warning" або "Увага"
- Текст попередження

**Варіації:**
- **Grammar Warning** - граматичні помилки
- **Time Warning** - обмеження часу
- **Difficulty Warning** - підвищена складність
- **Common Mistake** - типові помилки

**AI Integration:**
- Виявлення потенційних складностей
- Генерація релевантних попереджень
- Адаптація під рівень учня

### **7. Tip Box**
**Призначення:** Корисні поради та підказки

**Структура:**
```
┌─────────────────────────────────┐
│ 💡 Tip                          │
│ ─────────────────────────────── │
│ Remember: add 's' for third     │
│ person singular!                │
└─────────────────────────────────┘
```

**Дизайн:**
- Світло-синій фон (#F0F4FF)
- Ліва синя межа (4px, #667EEA)
- Іконка лампочки (💡) або зірки (⭐)
- Заголовок "Tip" або "Порада"
- Корисна порада

**Варіації:**
- **Study Tip** - поради для навчання
- **Memory Tip** - мнемонічні правила
- **Practice Tip** - поради для практики
- **Cultural Tip** - культурні особливості

**AI Integration:**
- Генерація релевантних порад
- Персоналізація під стиль навчання
- Контекстуальні підказки

### **8. Image Placeholder**
**Призначення:** Зображення з підписами та контекстом

**Структура:**
```
┌─────────────────────┐
│                     │
│    📚 [Image]       │
│                     │
└─────────────────────┘
     Caption text
```

**Компоненти:**
- Рамка для зображення
- Placeholder іконка
- Caption/підпис
- Alt text для accessibility
- Можливість заміни

**Варіації:**
- **Illustration** - ілюстрації до тексту
- **Photo** - фотографії реальних об'єктів
- **Diagram** - схеми та діаграми
- **Icon** - іконки та символи

**AI Integration:**
- Підбір релевантних зображень
- Генерація alt text
- Створення підписів
- Пропозиції покращення

## 🎨 **Design System для Компонентів**

### **Кольорова Схема:**
- **Instructions:** #EFF6FF фон, #2563EB accent
- **Warning:** #FFF7ED фон, #EA580C accent  
- **Tip:** #F0F4FF фон, #667EEA accent
- **Text:** #374151 основний, #6B7280 вторинний

### **Typography:**
- **Title Block:** Inter Bold, 28px/20px/16px
- **Body Text:** Inter Regular, 14px
- **Instructions:** Inter Medium, 13px
- **Labels:** Inter Semi-Bold, 12px

### **Spacing:**
- **Component Margin:** 20px bottom
- **Internal Padding:** 16px
- **Border Radius:** 8px для boxes
- **Border Width:** 4px для accent borders

### **Icons:**
- **Instructions:** 📋, ✏️, 👀, 👂, 🗣️
- **Warning:** ⚠️, ❗, 🚨
- **Tip:** 💡, ⭐, 🎯
- **Exercise:** 📝, ❓, ✅

## 🔧 **Technical Implementation**

### **Component Structure:**
```typescript
interface WorksheetComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: ComponentProperties;
  aiGenerated: boolean;
  editable: boolean;
}

type ComponentType = 
  | 'title-block'
  | 'body-text'
  | 'instructions-box'
  | 'fill-blank'
  | 'multiple-choice'
  | 'warning-box'
  | 'tip-box'
  | 'image-placeholder';
```

### **AI Integration Points:**
- **Content Generation** - створення тексту для кожного компонента
- **Style Adaptation** - адаптація під вікову групу та рівень
- **Context Awareness** - розуміння контексту worksheet
- **Personalization** - налаштування під потреби учня

### **Fabric.js Integration:**
- Кожен компонент як Fabric.js Group
- Кастомні контроли для редагування
- Збереження семантичної структури
- Експорт з збереженням стилів

## 🚀 **Переваги Атомарного Підходу**

### **Для Користувачів:**
- **Швидкість** - готові компоненти замість створення з нуля
- **Консистентність** - єдиний стиль всіх елементів
- **Професійність** - якісний дизайн без дизайнерських навичок
- **Семантичність** - компоненти мають освітнє значення

### **Для Розробників:**
- **Модульність** - легко додавати нові компоненти
- **Перевикористання** - один компонент в різних контекстах
- **Тестування** - ізольоване тестування кожного компонента
- **Масштабування** - легко розширювати функціональність

### **Для AI:**
- **Контекст** - розуміння призначення кожного елемента
- **Оптимізація** - покращення конкретних типів контенту
- **Персоналізація** - адаптація кожного компонента окремо
- **Аналітика** - відстеження ефективності різних типів

## 📋 **Implementation Roadmap**

### **Phase 1: MVP (8 компонентів)**
1. ✅ Title Block - базова реалізація
2. ✅ Body Text - з форматуванням
3. ✅ Instructions Box - з іконками
4. ✅ Fill-in-the-Blank - основна функціональність
5. ✅ Multiple Choice - всі варіації
6. ✅ Warning Box - з різними типами
7. ✅ Tip Box - з персоналізацією
8. ✅ Image Placeholder - з AI підбором

### **Phase 2: Essential Extensions (+5 компонентів)**
9. ✅ True/False Component - швидкі перевірки знань
10. ✅ Word Bank Component - vocabulary exercises
11. ✅ Table/Grid Component - організація даних
12. ✅ Speech Bubble Component - dialogue practice
13. ✅ QR Code Component - додаткові ресурси

### **Phase 3: Advanced Features (+5 компонентів)**
14. Matching Component - паруваня елементів
15. Timeline Component - хронологія подій
16. Progress Bar Component - відстеження прогресу
17. Audio/Video Placeholder - мультимедіа
18. Rubric Component - система оцінювання

### **Phase 4: Specialized (+5 компонентів)**
19. Ordering/Sequencing Component - послідовності
20. Crossword/Word Search - інтерактивні головоломки
21. Diagram/Chart Component - складні схеми
22. Drawing Area Component - творчі вправи
23. Reflection Box Component - self-assessment

## 🧩 **Phase 2 Components - Детальний Опис**

### **9. True/False Component**
**Призначення:** Швидкі перевірки фактів та базових знань

**Структура:**
```
┌─────────────────────────────────┐
│ ❓ True or False                │
│ ─────────────────────────────── │
│ 1. London is the capital of UK │
│    ○ True    ○ False           │
│ 2. Cats can fly               │
│    ○ True    ○ False           │
└─────────────────────────────────┘
```

**Дизайн:**
- Сірий фон (#F9FAFB)
- Ліва межа #6B7280
- Іконка питання (❓)
- Radio buttons для вибору
- Автоматична нумерація

**AI Integration:**
- Генерація true/false statements
- Балансування складності
- Створення правдоподібних false statements

### **10. Word Bank Component**
**Призначення:** Надання списку слів для використання у вправах

**Структура:**
```
┌─────────────────────────────────┐
│ 📚 Word Bank                   │
│ ─────────────────────────────── │
│ [apple] [run] [happy] [house]  │
│ [blue] [quickly] [yesterday]   │
└─────────────────────────────────┘
```

**Дизайн:**
- Світло-зелений фон (#ECFDF5)
- Слова в rounded pills
- Drag-friendly interface
- Можливість вичеркувати використані

**AI Integration:**
- Підбір релевантних слів
- Організація по категоріям
- Адаптація до рівня складності

### **11. Table/Grid Component**
**Призначення:** Організація даних у структурованому вигляді

**Структура:**
```
┌─────────────────────────────────┐
│ 📋 Comparison Table            │
│ ─────────────────────────────── │
│ │ Column 1 │ Column 2 │ Col 3 ││
│ │ Data 1   │ Data 2   │ Data 3││
│ │ Data 4   │ Data 5   │ Data 6││
└─────────────────────────────────┘
```

**Дизайн:**
- Чергування кольорів рядків
- Виділені заголовки
- Responsive grid
- Editable cells

**AI Integration:**
- Генерація табличних даних
- Автоматичне форматування
- Підбір прикладів для порівняння

### **12. Speech Bubble Component**
**Призначення:** Dialogue practice та conversation scenarios

**Структура:**
```
┌─────────────────────────────────┐
│ 💬 Dialogue                    │
│ ─────────────────────────────── │
│  👨 "Hello, how are you?"      │
│      ╭─────────────────╮       │
│  👩  │ Your response:  │       │
│      │ _______________ │       │
│      ╰─────────────────╯       │
└─────────────────────────────────┘
```

**Дизайн:**
- Speech bubble shapes
- Character avatars/icons
- Turn-taking visual flow
- Role indicators

**AI Integration:**
- Генерація realistic dialogues
- Context-appropriate responses
- Cultural adaptation

### **13. QR Code Component**
**Призначення:** Посилання на додаткові онлайн ресурси

**Структура:**
```
┌─────────────────────────────────┐
│ 📱 Additional Resources        │
│ ─────────────────────────────── │
│   ████ ██  ██ ████            │
│   █  █    ██  █  █            │
│   █ ██ ██  ██ █ ██            │
│   ████ ██  ██ ████            │
│                                 │
│ Scan for: Extra Practice       │
└─────────────────────────────────┘
```

**Дизайн:**
- Centered QR code
- Descriptive label
- Optional caption
- Print-optimized

**AI Integration:**
- Auto-generate QR codes
- Smart link suggestions
- Related resources matching

**Цей атомарний підхід перетворює простий canvas редактор на потужний інструмент створення освітнього контенту!** 🎓✨
