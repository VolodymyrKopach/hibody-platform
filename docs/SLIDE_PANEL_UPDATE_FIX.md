# Виправлення відображення слайдів в панелі

## Проблема

Слайди не з'являлися в секції слайдів по мірі готовності під час генерації через SSE, оскільки:

1. SSE оновлення в `useChatLogic` оновлювали `data.lesson` в повідомленні
2. Але не викликали `onLessonUpdate` callback для оновлення слайд-панелі
3. `updateCurrentLesson` викликався тільки в `ChatMessage.useEffect` при зміні тексту

## Рішення

### 1. Модифіковано `src/hooks/useChatLogic.ts`:

```typescript
// Додано interface для props
interface UseChatLogicProps {
  onLessonUpdate?: (lesson: SimpleLesson) => void;
}

export const useChatLogic = ({ onLessonUpdate }: UseChatLogicProps = {}) => {
  // ... existing code ...
  
  // В SSE callbacks додано виклик onLessonUpdate:
  const { ... } = useSlideProgressSSE({
    onProgressUpdate: (data) => {
      // ... existing code ...
      if (data.lesson) {
        lastMessage.lesson = data.lesson;
        
        // 🔥 ВИПРАВЛЕННЯ: Викликаємо onLessonUpdate при кожному оновленні
        if (onLessonUpdate) {
          console.log('�� [CHAT] Calling onLessonUpdate with updated lesson from SSE progress');
          onLessonUpdate(data.lesson);
        }
      }
    },
    onCompletion: (data) => {
      // ... existing code ...
      lastMessage.lesson = data.lesson;
      
      // 🔥 ВИПРАВЛЕННЯ: Викликаємо onLessonUpdate при завершенні
      if (onLessonUpdate) {
        console.log('🎯 [CHAT] Calling onLessonUpdate with final lesson from SSE completion');
        onLessonUpdate(data.lesson);
      }
    }
  });
```

### 2. Модифіковано `src/app/chat/page.tsx`:

```typescript
// Передано callback в useChatLogic
const {
  messages,
  // ... other properties
} = useChatLogic({ onLessonUpdate: updateCurrentLesson });

// Додано додатковий useEffect як fallback
React.useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.sender === 'ai' && (lastMessage as any).lesson) {
    const lesson = (lastMessage as any).lesson;
    console.log('🎯 [CHAT] Detected lesson update in message, updating slide panel');
    console.log('📊 [CHAT] Lesson has', lesson.slides?.length || 0, 'slides');
    updateCurrentLesson(lesson);
  }
}, [messages, updateCurrentLesson]);
```

## Результат

Тепер слайди з'являються в панелі слайдів в реальному часі:

1. ✅ **При кожному SSE progress update** - викликається `onLessonUpdate`
2. ✅ **При завершенні генерації** - викликається `onLessonUpdate` з фінальним уроком
3. ✅ **Fallback через useEffect** - якщо SSE не спрацював, useEffect підхопить зміни

## Тестування

1. Запустіть генерацію слайдів через чат
2. Панель слайдів повинна відкритися автоматично
3. Слайди повинні з'являтися один за одним з прогресом
4. В консолі повинні з'являтися логи:
   ```
   🎯 [CHAT] Calling onLessonUpdate with updated lesson from SSE progress
   📊 [CHAT] Lesson has X slides
   ```

## Файли змінено

- `src/hooks/useChatLogic.ts` - додано onLessonUpdate callback
- `src/app/chat/page.tsx` - передано callback та додано fallback useEffect

## Backup файли

- `src/hooks/useChatLogic.ts.backup`
- `src/app/chat/page.tsx.backup`
