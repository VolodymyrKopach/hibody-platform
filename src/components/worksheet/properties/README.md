# Interactive Component Properties Panel

Система Properties Panel забезпечує потужне редагування інтерактивних компонентів з можливістю ручного та AI редагування.

## Структура

```
properties/
├── PropertiesPanel.tsx           # Головний компонент з вкладками Manual/AI
├── ManualPropertyEditor.tsx      # Ручне редагування властивостей
├── AIPropertyEditor.tsx          # AI редагування через текстові інструкції
└── README.md                     # Ця документація
```

## Компоненти

### PropertiesPanel

Головний компонент, який відображається в RightSidebar при виборі інтерактивного елемента.

**Props:**
- `element: CanvasElement` - Вибраний елемент
- `pageId: string` - ID сторінки
- `context: WorksheetEditContext` - Контекст worksheet (тема, вікова група, складність)
- `onPropertiesChange: (elementId: string, newProperties: any) => void` - Callback для оновлення властивостей
- `onClose?: () => void` - Опціональний callback для закриття панелі

**Вкладки:**
1. **Manual Edit** - Ручне редагування через UI контроли
2. **AI Edit** - Редагування через текстові інструкції для AI

### ManualPropertyEditor

Відображає форму з полями для ручного редагування властивостей компонента.

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

Надає інтерфейс для редагування через AI.

**Можливості:**
1. **Quick Improvements** - Швидкі дії одним кліком:
   - "Make it bigger" - Збільшити розмір
   - "Add more items" - Додати елементи
   - "Change colors" - Змінити кольори
   - і т.д. (залежить від типу компонента)

2. **Custom Instructions** - Довільні текстові інструкції:
   ```
   "Add 3 more animals and make the images bigger"
   "Change all colors to pastel tones"
   "Make it more suitable for 3-year-olds"
   ```

3. **AI Tips** - Підказки як краще формулювати інструкції

**Як це працює:**
1. Користувач вводить інструкцію
2. Система відправляє запит до `WorksheetEditingService`
3. AI аналізує компонент та інструкцію
4. Генерується patch з змінами
5. Зміни автоматично застосовуються

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

### 2. Додати Quick Improvements в `AIPropertyEditor.tsx`

```typescript
const QUICK_IMPROVEMENTS: Record<string, Array<...>> = {
  // ... існуючі
  'my-new-component': [
    { label: 'Make easier', instruction: 'Set difficulty to easy', icon: '🎯' },
    { label: 'Add challenge', instruction: 'Increase difficulty and add more items', icon: '🔥' },
  ],
};
```

### 3. Готово!

Система автоматично:
- Відобразить Properties Panel для нового компонента
- Створить форму на основі схеми
- Підключить AI редагування

## Інтеграція в RightSidebar

Properties Panel автоматично відображається для всіх інтерактивних компонентів:

```typescript
// В RightSidebar.tsx
{isInteractiveComponent(elementData.type) && aiContext ? (
  <PropertiesPanel
    element={elementData}
    pageId={pageData.id}
    context={aiContext}
    onPropertiesChange={(elementId, newProperties) => {
      onUpdate?.(newProperties);
    }}
  />
) : (
  // Звичайні PDF компоненти
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
2. Відкрийте Properties Panel (вкладка "Manual Edit")
3. Змініть потрібні властивості через UI контроли
4. Зміни застосовуються в real-time

### AI редагування

1. Виберіть інтерактивний компонент
2. Перейдіть на вкладку "AI Edit"
3. Оберіть Quick Improvement або введіть свою інструкцію
4. Натисніть "Apply AI Edit"
5. AI проаналізує та застосує зміни

**Приклади інструкцій:**
- "Add 2 more colors to the game"
- "Make all images bigger and change the layout to grid"
- "Simplify for 3-year-olds with bigger buttons and simpler text"
- "Change the theme to ocean animals"

## Переваги системи

✅ **Уніфікований інтерфейс** - Один компонент для всіх інтерактивних елементів
✅ **Ручне + AI редагування** - Гнучкість у виборі способу редагування
✅ **Автоматична валідація** - Неможливо створити некоректний стан
✅ **Type-safe** - Повна типізація TypeScript
✅ **Розширюваність** - Легко додавати нові типи полів
✅ **DRY принцип** - Немає дублювання коду
✅ **Відповідає SOLID** - Чиста архітектура

## Технічні деталі

### Потік даних

```
User Action → Properties Panel → onPropertiesChange
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
User Instruction → AIPropertyEditor → WorksheetEditingService
                                            ↓
                                  Gemini AI API
                                            ↓
                                    Generate patch
                                            ↓
                               Apply patch to properties
                                            ↓
                                onPropertiesChange callback
```

## Підтримка

Для питань та пропозицій:
- Створіть issue в репозиторії
- Зверніться до команди розробки

---

**Версія:** 1.0.0  
**Дата:** 2025-10-18  
**Автор:** AI Assistant

