# Interactive Component Properties System

Система редагування властивостей інтерактивних компонентів інтегрована безпосередньо в RightSidebar з можливістю ручного та AI редагування.

## Структура

```
properties/
├── PropertiesPanel.tsx           # [DEPRECATED] Старий компонент-обгортка
├── ManualPropertyEditor.tsx      # Ручне редагування властивостей
├── AIPropertyEditor.tsx          # AI редагування через текстові інструкції
└── README.md                     # Ця документація
```

## Архітектура

Система інтегрована безпосередньо в **RightSidebar** з умовною логікою для різних типів компонентів:

### Tab "Properties"
- **Інтерактивні компоненти** → `ManualPropertyEditor` з повною схемою властивостей
- **Звичайні компоненти** (title-block, body-text, etc.) → вбудовані UI контроли

### Tab "AI Assistant"
- **Інтерактивні компоненти** → `AIPropertyEditor` з контекстними Quick Improvements
- **Звичайні компоненти** → `AIAssistantPanel` з загальним AI асистентом
- **Page selection** → `AIAssistantPanel` для редагування сторінки

Це усуває дублювання табів і створює чисту, контекстно-залежну архітектуру.

## Компоненти

### ManualPropertyEditor

Компонент для ручного редагування властивостей інтерактивних компонентів.

**Props:**
- `schema: ComponentPropertySchema` - Схема властивостей компонента
- `properties: any` - Поточні значення властивостей
- `onChange: (newProperties: any) => void` - Callback для оновлення

**Підтримувані типи полів:**
- `string` - Текстове поле
- `number` - Числове поле (з min/max)
- `boolean` - Перемикач (Switch)
- `color` - Color picker + текстове поле
- `select` - Випадаючий список
- `array-simple` - Масив рядків (редагується як список)
- `array-object` - Масив об'єктів (складні структури з полями)
- `object` - Вкладений об'єкт з полями

**Функціональність:**
- Автоматична валідація (required fields)
- Підказки (tooltips) для складних полів
- Згортання/розгортання складних структур
- Додавання/видалення елементів масивів
- Real-time оновлення

### AIPropertyEditor

**Спеціалізований AI-редактор для інтерактивних компонентів.** Використовується в табі "AI Assistant" RightSidebar.

**Props:**
- `element: CanvasElement` - Інтерактивний елемент
- `pageId: string` - ID сторінки
- `schema: ComponentPropertySchema` - Схема властивостей
- `context: WorksheetEditContext` - Контекст worksheet
- `onPropertiesChange: (newProperties: any) => void` - Callback для оновлення

**Можливості:**
1. **Quick Improvements** - Контекстні швидкі дії для кожного типу компонента:
   - Tap Image: "Make it bigger", "Add caption", "Change animation"
   - Simple Drag & Drop: "Add more items", "Make it easier", "Change colors"
   - Color Matcher: "Add more colors", "Enable voice", "Simplify"
   - Memory Cards: "More pairs", "Make easier", "Add theme"
   - Sorting Game: "Add category", "Change layout", "More items"
   
2. **Custom Instructions** - Довільні текстові інструкції для точного контролю
3. **Context-aware** - Враховує тип компонента, вікову групу, складність
4. **Real-time feedback** - Показує, які зміни були застосовані
5. **AI Tips** - Підказки як краще формулювати інструкції

**Приклади інструкцій:**
```
"Add 3 more animals and make the images bigger"
"Change all colors to pastel tones"
"Make it more suitable for 3-year-olds"
"Add a fun ocean theme with blue backgrounds"
```

**Технічна реалізація:**
- Використовує `WorksheetEditingService` для AI-редагування
- Генерує patch з змінами через Gemini AI
- Автоматично застосовує зміни до властивостей

### AIAssistantPanel

Загальний AI-асистент для неінтерактивних компонентів та сторінок. Використовується для редагування звичайних елементів (title-block, body-text, etc.) та page settings.

## Схема властивостей

Властивості для кожного інтерактивного компонента визначені в:
```
src/constants/interactive-properties-schema.ts
```

### Приклад схеми:

```typescript
{
  componentType: 'tap-image',
  componentName: 'Tap Image',
  category: 'interactive',
  icon: '👆',
  properties: [
    {
      key: 'imageUrl',
      label: 'Image URL',
      type: 'url',
      required: true,
      placeholder: 'https://example.com/image.jpg',
      helperText: 'URL of the image to display',
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: 'medium',
      options: [
        { value: 'small', label: 'Small (200px)' },
        { value: 'medium', label: 'Medium (350px)' },
        { value: 'large', label: 'Large (500px)' },
      ],
    },
    // ... інші властивості
  ],
}
```

## Додавання нового інтерактивного компонента

### 1. Додати схему в `interactive-properties-schema.ts`

```typescript
export const INTERACTIVE_PROPERTIES_SCHEMAS: ComponentPropertySchema[] = [
  // ... існуючі компоненти
  {
    componentType: 'my-new-component',
    componentName: 'My New Component',
    category: 'interactive',
    icon: '🎮',
    properties: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: true,
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ],
  },
];
```

### 2. Готово!

Система автоматично:
- Відобразить ManualPropertyEditor в табі "Properties"
- Створить форму на основі схеми
- Підключить AI редагування через AIAssistantPanel

## Інтеграція в RightSidebar

Обидва редактори інтегровані безпосередньо в RightSidebar з умовною логікою:

```typescript
// В RightSidebar.tsx - Tab "Properties"
{isInteractiveComponent(elementData.type) ? (
  (() => {
    const schema = getComponentPropertySchema(elementData.type);
    return schema ? (
      <ManualPropertyEditor
        schema={schema}
        properties={elementData.properties}
        onChange={(newProperties) => {
          onUpdate?.(newProperties);
        }}
      />
    ) : (
      // Fallback для компонентів без схеми
    );
  })()
) : (
  // Звичайні PDF компоненти (title-block, body-text, etc.)
  // Вбудовані UI контроли
)}

// Tab "AI Assistant" - умовний рендеринг
{aiContext ? (
  isInteractiveComponent(elementData.type) ? (
    // Для інтерактивних компонентів - спеціалізований AI Editor
    <AIPropertyEditor
      element={elementData}
      pageId={pageData.id}
      schema={schema}
      context={aiContext}
      onPropertiesChange={(newProperties) => {
        onUpdate?.(newProperties);
      }}
    />
  ) : (
    // Для звичайних компонентів - загальний AI Assistant
    <AIAssistantPanel
      selection={selection}
      context={aiContext}
      onEdit={onAIEdit}
      // ...
    />
  )
) : (
  // Fallback: AI недоступний
)}
```

## Підтримувані інтерактивні компоненти

✅ Всі 15 інтерактивних компонентів мають повну підтримку:

1. **Tap Image** - Інтерактивне зображення з анімацією
2. **Simple Drag & Drop** - Перетягування елементів
3. **Color Matcher** - Вивчення кольорів
4. **Simple Counter** - Підрахунок об'єктів
5. **Memory Cards** - Гра на пам'ять
6. **Sorting Game** - Сортування за категоріями
7. **Sequence Builder** - Вибудовування послідовності
8. **Shape Tracer** - Малювання фігур
9. **Emotion Recognizer** - Розпізнавання емоцій
10. **Sound Matcher** - Співставлення звуків
11. **Simple Puzzle** - Пазл
12. **Pattern Builder** - Створення патернів
13. **Cause & Effect** - Причина та наслідок
14. **Reward Collector** - Збір нагород
15. **Voice Recorder** - Запис голосу

## Приклади використання

### Ручне редагування

1. Виберіть інтерактивний компонент на canvas
2. В RightSidebar оберіть таб "Properties"
3. Змініть потрібні властивості через UI контроли
4. Зміни застосовуються в real-time

### AI редагування

1. Виберіть інтерактивний компонент
2. В RightSidebar перейдіть на таб "AI Assistant"
3. Оберіть Quick Improvement або введіть свою інструкцію
4. Натисніть "Apply AI Edit"
5. AI проаналізує та застосує зміни

**Приклади інструкцій:**
- "Add 2 more colors to the game"
- "Make all images bigger and change the layout to grid"
- "Simplify for 3-year-olds with bigger buttons and simpler text"
- "Change the theme to ocean animals"

## Переваги системи

✅ **Пряма інтеграція** - Без зайвих обгорток і дублювання табів  
✅ **Контекстно-залежна архітектура** - Різні компоненти для різних типів елементів  
✅ **Спеціалізований AI** - `AIPropertyEditor` з контекстними Quick Improvements для інтерактивних компонентів  
✅ **Ручне + AI редагування** - Гнучкість у виборі способу через таби RightSidebar  
✅ **Уніфікований інтерфейс** - Однакова структура для всіх інтерактивних елементів  
✅ **Автоматична валідація** - Неможливо створити некоректний стан  
✅ **Type-safe** - Повна типізація TypeScript  
✅ **Розширюваність** - Легко додавати нові типи полів та Quick Improvements  
✅ **DRY принцип** - Немає дублювання коду  
✅ **Відповідає SOLID** - Чиста архітектура з розділенням відповідальностей  
✅ **Чистий UI** - Використання існуючих табів RightSidebar замість вкладених карток

## Технічні деталі

### Потік даних

```
User Action → ManualPropertyEditor → onChange callback
                                            ↓
                                      RightSidebar
                                            ↓
                                        onUpdate
                                            ↓
                                   Step3CanvasEditor
                                            ↓
                                 Update element in state
                                            ↓
                                     Re-render canvas
```

### AI Editing Flow

```
User Instruction → AIAssistantPanel → onAIEdit callback
                                            ↓
                                   Step3CanvasEditor
                                            ↓
                               WorksheetEditingService
                                            ↓
                                     Gemini AI API
                                            ↓
                                    Generate patch
                                            ↓
                              Apply patch to properties
                                            ↓
                                   Update element state
```

## Підтримка

Для питань та пропозицій:
- Створіть issue в репозиторії
- Зверніться до команди розробки

---

**Версія:** 2.0.0  
**Дата:** 2025-10-19  
**Автор:** AI Assistant  
**Зміни:** Видалено дублювання табів, інтеграція безпосередньо в RightSidebar

