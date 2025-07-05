# Action Buttons Implementation - Гарячі Кнопки для Hibody Platform

## Огляд функціональності

Система гарячих кнопок (action buttons) дозволяє користувачам легко обирати наступні дії після отримання плану уроку від AI. Замість введення тексту, користувач може натиснути на кнопки для виконання конкретних дій.

## Як працює система

### 1. Backend - Формування Actions
Handlers повертають масив `actions` у відповіді:

```typescript
interface ChatHandlerResult {
  success: boolean;
  message: string;
  conversationHistory?: ConversationHistory;
  actions?: Array<{
    action: string;       // Унікальний ідентифікатор дії
    label: string;        // Текст кнопки
    description: string;  // Опис дії для обробки
  }>;
  error?: string;
}
```

### 2. API Route - Передача Actions
`src/app/api/chat/route.ts` повертає actions з handler result:

```typescript
const result = await chatService.processMessage(message, conversationHistory);
return NextResponse.json(result); // Включає actions
```

### 3. Frontend - Відображення та обробка

#### ChatMessage Component
`src/components/chat/ChatMessage.tsx` відображає action buttons:

```tsx
{message.sender === 'ai' && message.availableActions && message.availableActions.length > 0 && (
  <Box sx={{ mt: 3, mb: 1 }}>
    <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
      🚀 Доступні дії:
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {message.availableActions.map((action, index) => (
        <Button
          key={index}
          variant={action.action === 'approve_plan' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onActionClick?.(action.action, action.description)}
          sx={{ /* стилі кнопки */ }}
          title={action.description}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  </Box>
)}
```

#### useChatLogic Hook
`src/hooks/useChatLogic.ts` обробляє кліки на action buttons:

```typescript
const handleActionClick = useCallback(async (action: string, description: string) => {
  // Відправляємо дію як повідомлення користувача
  const actionMessage: Message = {
    id: messages.length + 1,
    text: description,
    sender: 'user',
    timestamp: new Date(),
    status: 'sent',
    feedback: null
  };

  setMessages(prev => [...prev, actionMessage]);
  
  // Викликаємо API з description як повідомленням
  const response = await sendMessageToAPI(description, conversationHistory);
  
  // Обробляємо AI відповідь
  const aiMessage: Message = {
    id: messages.length + 2,
    text: response.message,
    sender: 'ai',
    timestamp: new Date(),
    status: 'sent',
    feedback: null,
    availableActions: response.actions || []
  };

  setMessages(prev => [...prev, aiMessage]);
}, [messages, conversationHistory]);
```

## Actions від різних Handlers

### EnhancedCreateLessonHandler
Після створення плану уроку:

```typescript
actions: [
  {
    action: 'approve_plan',
    label: '✅ Почати генерацію слайдів',
    description: 'Схвалити план і перейти до створення слайдів'
  },
  {
    action: 'edit_plan',
    label: '✏️ Змінити план',
    description: 'Внести правки до плану уроку'
  },
  {
    action: 'regenerate_plan',
    label: '🔄 Створити новий план',
    description: 'Згенерувати альтернативний варіант плану'
  }
]
```

### EditPlanHandler
Після запиту редагування без активного плану:

```typescript
actions: [
  {
    action: 'create_new_lesson',
    label: '➕ Створити новий урок',
    description: 'Створити новий план уроку'
  }
]
```

### ChatService - handleApprovePlan
Після схвалення плану:

```typescript
actions: [
  {
    action: 'generate_next_slide',
    label: '▶️ Наступний слайд',
    description: `Генерувати слайд 2/${totalSlides}`
  },
  {
    action: 'regenerate_slide',
    label: '🔄 Перегенерувати',
    description: 'Створити новий варіант цього слайду'
  }
]
```

## Потік взаємодії

1. **Користувач**: "створи урок про динозаврів для дітей 6 років"
2. **AI**: Генерує план + відображає 3 кнопки:
   - ✅ Почати генерацію слайдів
   - ✏️ Змінити план  
   - 🔄 Створити новий план

3. **Користувач натискає** "✅ Почати генерацію слайдів"
4. **Система**: 
   - Додає повідомлення користувача: "Схвалити план і перейти до створення слайдів"
   - Генерує перший слайд
   - Показує нові кнопки: "▶️ Наступний слайд", "🔄 Перегенерувати"

## Стилізація кнопок

### Основні кнопки (approve_plan)
- `variant="contained"` - заповнена кнопка
- `fontWeight: 600` - жирний шрифт
- `boxShadow: 2` - тінь для виділення

### Додаткові кнопки
- `variant="outlined"` - обведена кнопка
- `fontWeight: 500` - нормальний шрифт
- Ховер ефект з тінню

### Адаптивність
- `flexWrap: 'wrap'` - кнопки переносяться на нові рядки
- `gap: 1.5` - відступи між кнопками
- `fontSize: '0.875rem'` - оптимальний розмір тексту

## Переваги системи

1. **UX покращення**: Менше введення тексту, швидший вибір дій
2. **Зрозумілість**: Чіткі підказки що робити далі
3. **Консистентність**: Однаковий інтерфейс для всіх дій
4. **Гнучкість**: Легко додавати нові дії до handlers
5. **Візуальна ієрархія**: Головні дії виділені кольором

## Розширення системи

Для додавання нових дій:

1. **У Handler**: додати action до масиву `actions`
2. **У ChatService**: додати обробку в `handleAction()` метод (якщо потрібно)
3. **Тестування**: перевірити відображення та функціональність

## Приклад повної реалізації

```typescript
// В Handler
return {
  success: true,
  message: "План уроку готовий!",
  actions: [
    {
      action: 'approve_plan',
      label: '✅ Почати генерацію',
      description: 'Схвалити план і перейти до створення слайдів'
    }
  ]
};

// В Component
<Button
  onClick={() => onActionClick('approve_plan', 'Схвалити план і перейти до створення слайдів')}
>
  ✅ Почати генерацію
</Button>

// В Hook
const handleActionClick = async (action, description) => {
  // Відправка як звичайне повідомлення
  await sendMessageToAPI(description, conversationHistory);
};
```

## Результат

Користувачі тепер можуть:
- ✅ Швидко обирати дії після отримання плану
- 🎯 Бачити чіткі підказки про наступні кроки
- 🚀 Ефективніше взаємодіяти з AI без зайвого введення тексту
- 📱 Користуватися інтуїтивним інтерфейсом на всіх пристроях 