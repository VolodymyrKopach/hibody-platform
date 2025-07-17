# Система відображення прогресу генерації слайдів

## Огляд

Реалізована система real-time відображення прогресу генерації слайдів через Server-Sent Events (SSE), яка показує користувачу актуальний стан процесу через повідомлення чату.

## Архітектура

```
┌─────────────────────────────────────────────────────────────────┐
│                    СИСТЕМА ПРОГРЕСУ ГЕНЕРАЦІЇ                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Chat UI)                Backend (API + SSE)          │
│  ┌───────────────────┐             ┌─────────────────────────┐   │
│  │ useChatLogic      │◄────SSE─────┤ /api/.../progress       │   │
│  │ + useSlideProgress│             │ (Server-Sent Events)    │   │
│  │   SSE Hook        │             └─────────────────────────┘   │
│  └─────────┬─────────┘                         ▲               │
│            │                                   │               │
│            ▼                                   │               │
│  ┌───────────────────┐             ┌─────────────────────────┐   │
│  │ ChatMessage       │             │ /api/.../sequential     │   │
│  │ (Progress UI)     │             │ (Slide Generation)      │   │
│  └───────────────────┘             └─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Компоненти системи

### 1. Server-Sent Events (SSE) API

**Файл:** `src/app/api/generation/slides/progress/route.ts`

- **Endpoint:** `GET /api/generation/slides/progress?sessionId={id}`
- **Призначення:** Створює SSE connection для real-time оновлень прогресу
- **Функції:**
  - `sendProgressUpdate(sessionId, data)` - відправляє оновлення прогресу
  - `sendCompletion(sessionId, data)` - відправляє повідомлення про завершення

```typescript
// Приклад повідомлення прогресу
{
  type: 'progress',
  sessionId: 'session_123',
  data: {
    progress: [
      { slideNumber: 1, title: 'Вступ', status: 'completed', progress: 100 },
      { slideNumber: 2, title: 'Основа', status: 'generating', progress: 45 },
      { slideNumber: 3, title: 'Практика', status: 'pending', progress: 0 }
    ],
    lesson: { /* урок з оновленими слайдами */ },
    totalSlides: 3,
    completedSlides: 1
  }
}
```

### 2. Модифікований Sequential API

**Файл:** `src/app/api/generation/slides/sequential/route.ts`

- **Призначення:** Генерує слайди послідовно і відправляє прогрес через SSE
- **Нові можливості:**
  - Приймає `sessionId` параметр для SSE з'єднання
  - Викликає `sendProgressUpdate()` після кожного слайду
  - Відправляє `sendCompletion()` при завершенні

### 3. Client-side SSE Hook

**Файл:** `src/hooks/useSlideProgressSSE.ts`

- **Призначення:** Управляє SSE з'єднанням та отримує оновлення прогресу
- **Основні функції:**
  - `connect(sessionId)` - підключається до SSE stream
  - `disconnect()` - закриває з'єднання
  - `startGenerationWithProgress()` - запускає генерацію з відстеженням прогресу

```typescript
const {
  isGenerating,
  currentProgress,
  startGenerationWithProgress
} = useSlideProgressSSE({
  onProgressUpdate: (data) => {
    // Оновлення UI з прогресом
  },
  onCompletion: (data) => {
    // Обробка завершення генерації
  },
  onError: (error) => {
    // Обробка помилок
  }
});
```

### 4. Інтеграція в Chat Logic

**Файл:** `src/hooks/useChatLogic.ts`

- **Призначення:** Інтегрує SSE прогрес в логіку чату
- **Функціональність:**
  - Створює повідомлення з початковим статусом
  - Оновлює повідомлення з прогресом в real-time
  - Додає фінальну статистику при завершенні

### 5. UI компонент прогресу

**Файл:** `src/components/chat/ChatMessage.tsx`

- **Призначення:** Відображає прогрес генерації в повідомленні чату
- **Елементи UI:**
  - Progress bars для кожного слайду
  - Status chips (Очікує, Генерується, Готово, Помилка)
  - Real-time оновлення відсотків

## Як це працює

### 1. Ініціація генерації

```typescript
// Користувач натискає "Схвалити план"
await handleActionClick('approve_plan');

// 1. Отримуємо plan від API
const response = await apiAdapter.sendMessage('', conversationHistory, 'approve_plan');

// 2. Створюємо повідомлення в чаті
const aiMessage = { text: response.message, ... };
setMessages(prev => [...prev, aiMessage]);

// 3. Запускаємо SSE генерацію
await startGenerationWithProgress(
  slideDescriptions,
  lesson,
  topic,
  age
);
```

### 2. Real-time оновлення

```typescript
// SSE Hook отримує оновлення
onProgressUpdate: (data) => {
  // Оновлюємо останнє повідомлення
  setMessages(prevMessages => {
    const lastMessage = prevMessages[prevMessages.length - 1];
    lastMessage.slideGenerationProgress = data.progress;
    lastMessage.isGeneratingSlides = true;
    return [...prevMessages];
  });
}
```

### 3. Відображення в UI

```typescript
// ChatMessage.tsx відображає прогрес
{message.isGeneratingSlides && slideGenerationProgress && (
  <Box>
    {slideGenerationProgress.map(slide => (
      <Box key={slide.slideNumber}>
        <Typography>{slide.slideNumber}. {slide.title}</Typography>
        <Chip 
          label={slide.status === 'generating' ? 'Генерується' : 'Готово'}
          color={slide.status === 'completed' ? 'success' : 'info'}
        />
        <LinearProgress value={slide.progress} />
      </Box>
    ))}
  </Box>
)}
```

## Переваги нової системи

### ✅ Real-time прогрес
- Користувач бачить стан кожного слайду в реальному часі
- Відсоток завершення для кожного слайду
- Статус: Очікує → Генерується → Готово/Помилка

### ✅ Візуальна зрозумілість
- Progress bars з кольоровим кодуванням
- Чіткі status chips
- Загальна статистика при завершенні

### ✅ Стабільність
- SSE connection автоматично закривається після завершення
- Graceful error handling
- Fallback на звичайну генерацію якщо SSE не працює

### ✅ Performance
- Мінімальне навантаження через SSE
- Оновлення тільки при зміні статусу
- Автоматичне очищення з'єднань

## Приклад користувацького досвіду

### До (без прогресу):
```
AI: 🎨 Розпочинаємо генерацію 5 слайдів...
[⏳ Чекання 2-3 хвилини без оновлень]
AI: ✅ Готово! Створено 5 слайдів.
```

### Після (з прогресом):
```
AI: 🎨 Розпочинаємо генерацію 5 слайдів...

📊 Прогрес генерації слайдів
1. Вступ                    [████████████] ✅ Готово
2. Теорія                   [██████░░░░░░] 🔄 Генерується (50%)
3. Практика                 [░░░░░░░░░░░░] ⏳ Очікує
4. Завдання                 [░░░░░░░░░░░░] ⏳ Очікує  
5. Підсумок                 [░░░░░░░░░░░░] ⏳ Очікує

[Оновлюється в реальному часі...]
```

## Технічні деталі

### SSE Message Types
```typescript
// З'єднання встановлено
{ type: 'connected', sessionId: 'session_123' }

// Оновлення прогресу
{ type: 'progress', data: { progress: [...], lesson: {...} } }

// Генерація завершена
{ type: 'completed', data: { lesson: {...}, statistics: {...} } }
```

### Error Handling
- SSE connection errors → fallback повідомлення
- Generation API errors → error message в чаті
- Network issues → automatic retry connection

### Cleanup
- SSE connections закриваються автоматично через 10 хвилин
- Manual cleanup при unmount компонентів
- Session cleanup при завершенні генерації

## Майбутні покращення

1. **WebSocket fallback** для кращої підтримки мереж
2. **Retry mechanism** для failed slides
3. **Pause/Resume** генерації
4. **Batch progress** для дуже великих уроків
5. **Background generation** зі сповіщеннями

---

Система готова до використання та забезпечує інтуїтивний UX для користувачів під час генерації слайдів! 🎉 