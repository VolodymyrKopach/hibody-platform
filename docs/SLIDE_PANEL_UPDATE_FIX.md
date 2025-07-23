# Slide Panel Display Fix

## Problem

Slides were not appearing in the slide section as they became ready during generation via SSE because:

1. SSE updates in `useChatLogic` updated `data.lesson` in the message
2. But did not call the `onLessonUpdate` callback to update the slide panel
3. `updateCurrentLesson` was only called in `ChatMessage.useEffect` when the text changed

## Solution

### 1. Modified `src/hooks/useChatLogic.ts`:

```typescript
// Added interface for props
interface UseChatLogicProps {
  onLessonUpdate?: (lesson: SimpleLesson) => void;
}

export const useChatLogic = ({ onLessonUpdate }: UseChatLogicProps = {}) => {
  // ... existing code ...
  
  // In SSE callbacks, added onLessonUpdate call:
  const { ... } = useSlideProgressSSE({
    onProgressUpdate: (data) => {
      // ... existing code ...
      if (data.lesson) {
        lastMessage.lesson = data.lesson;
        
        // 🔥 FIX: Call onLessonUpdate on each update
        if (onLessonUpdate) {
          console.log(' [CHAT] Calling onLessonUpdate with updated lesson from SSE progress');
          onLessonUpdate(data.lesson);
        }
      }
    },
    onCompletion: (data) => {
      // ... existing code ...
      lastMessage.lesson = data.lesson;
      
      // 🔥 FIX: Call onLessonUpdate on completion
      if (onLessonUpdate) {
        console.log('🎯 [CHAT] Calling onLessonUpdate with final lesson from SSE completion');
        onLessonUpdate(data.lesson);
      }
    }
  });
```

### 2. Modified `src/app/chat/page.tsx`:

```typescript
// Passed callback to useChatLogic
const {
  messages,
  // ... other properties
} = useChatLogic({ onLessonUpdate: updateCurrentLesson });

// Added an additional useEffect as a fallback
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

## Result

Now slides appear in the slide panel in real-time:

1. ✅ **On each SSE progress update** - `onLessonUpdate` is called
2. ✅ **On generation completion** - `onLessonUpdate` is called with the final lesson
3. ✅ **Fallback via useEffect** - if SSE fails, useEffect will catch the changes

## Testing

1. Start slide generation via chat
2. The slide panel should open automatically
3. Slides should appear one by one with progress
4. Logs should appear in the console:
   ```
   🎯 [CHAT] Calling onLessonUpdate with updated lesson from SSE progress
   📊 [CHAT] Lesson has X slides
   ```

## Files changed

- `src/hooks/useChatLogic.ts` - added onLessonUpdate callback
- `src/app/chat/page.tsx` - passed callback and added fallback useEffect

## Backup files

- `src/hooks/useChatLogic.ts.backup`
- `src/app/chat/page.tsx.backup`
