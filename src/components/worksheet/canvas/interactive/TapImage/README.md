# TapImage Component - Optimized for Ages 3-5

Повністю переробленний інтерактивний компонент для дітей віком 3-5 років з ігровими режимами, прогресією та мотиваційною системою.

## 🎮 Features

### Game Modes

1. **Simple Tap Mode** 🎯
   - Дитина тапає на одну картинку і збирає зірки
   - Кожен тап = звук + анімація + зірка
   - Мета: зібрати N зірочок
   - Підходить для: самих маленьких (3 роки)

2. **Find & Tap Mode** 🔍
   - 2-4 картинки на екрані
   - Дитина має знайти правильну картинку
   - Правильний вибір = святкування
   - Неправильний = м'яка підказка
   - Підходить для: 4-5 років

3. **Sequence Mode** 🔢
   - 3-4 картинки з номерами
   - Треба тапнути в правильній послідовності
   - Progress bar показує прогрес
   - Підходить для: 4-5 років

4. **Memory Mode** 🧠
   - Показати картинку, потім сховати
   - Знайти серед інших
   - Розвиває пам'ять
   - Підходить для: 5 років

### Visual Enhancements

- ✨ Великі розміри (150-180px) для легкого тапу
- 🌈 Яскраві кольори та градієнти
- 🎨 Товсті rounded borders (6-8px)
- ⭐ Анімовані частинки при успіху
- 🐻 Mascot-помічник з емоціями
- 💫 Glow та pulse ефекти для підказок

### Progression System

- ⭐ Візуальні зірки (збирається колекція)
- 📊 Progress bar з анімацією
- 🎉 Celebration overlay при завершенні
- 💬 Заохочувальні повідомлення

### Accessibility for Toddlers

- 👆 Animated hand hints
- 🎵 Sound feedback на кожну дію
- 📳 Haptic feedback
- 🔊 **Voice guidance (Text-to-Speech)** - озвучка інструкцій та фідбеку
- 🌍 Підтримка мов: українська, англійська, російська
- 🎯 Велика hit area (+20px padding)

## 📦 Component Structure

```
TapImage/
├── index.tsx                 # Main component with game logic
├── types.ts                  # TypeScript definitions
├── TapImageCard.tsx          # Individual image card
├── TapImageReward.tsx        # Stars display
├── TapImageProgress.tsx      # Progress bar
├── TapImageMascot.tsx        # Animated mascot helper
├── TapImageHint.tsx          # Hint system (hand, glow, arrow)
├── TapImageCelebration.tsx   # Success celebration overlay
└── README.md                 # This file
```

## 🚀 Usage

### Simple Mode Example

```tsx
<TapImage
  mode="simple"
  images={[
    { 
      id: '1', 
      url: '/dog.jpg', 
      label: 'Собака' 
    }
  ]}
  targetCount={5}
  showProgress
  showStars
  showMascot
  enableVoice
  voiceLanguage="uk-UA"
  speakPrompt
  speakFeedback
  ageStyle="toddler"
/>
```

### Find Mode Example

```tsx
<TapImage
  mode="find"
  images={[
    { id: '1', url: '/dog.jpg', label: 'Собака' },
    { id: '2', url: '/cat.jpg', label: 'Кіт' },
    { id: '3', url: '/bird.jpg', label: 'Птах' },
  ]}
  correctAnswer="1"
  prompt="Знайди собачку!"
  showHints
  showMascot
  ageStyle="toddler"
  onCorrectTap={(id) => console.log('Correct!', id)}
  onWrongTap={(id) => console.log('Try again!', id)}
/>
```

### Sequence Mode Example

```tsx
<TapImage
  mode="sequence"
  images={[
    { id: 'a', url: '/one.jpg', label: '1' },
    { id: 'b', url: '/two.jpg', label: '2' },
    { id: 'c', url: '/three.jpg', label: '3' },
  ]}
  sequence={['a', 'b', 'c']}
  prompt="Тапай по порядку!"
  showProgress
  ageStyle="toddler"
  onComplete={() => console.log('Sequence completed!')}
/>
```

### Memory Mode Example

```tsx
<TapImage
  mode="memory"
  images={[
    { id: '1', url: '/apple.jpg', label: 'Яблуко' },
    { id: '2', url: '/banana.jpg', label: 'Банан' },
  ]}
  memoryTime={3000}
  prompt="Запам'ятай картинку!"
  showMascot
  ageStyle="toddler"
/>
```

## 🎨 Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'simple' \| 'find' \| 'sequence' \| 'memory'` | `'simple'` | Game mode |
| `images` | `TapImageItem[]` | `[]` | Array of images |
| `imageUrl` | `string` | - | Legacy: single image URL |
| `caption` | `string` | - | Legacy: image caption |

### Game Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetCount` | `number` | `5` | Stars to collect (simple mode) |
| `correctAnswer` | `string` | - | Correct image ID (find mode) |
| `sequence` | `string[]` | - | Sequence of IDs (sequence mode) |
| `memoryTime` | `number` | `3000` | Time to show image (memory mode) |
| `prompt` | `string` | - | Instruction text |

### Display Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'large'` | Image size |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showStars` | `boolean` | `true` | Show star counter |
| `showMascot` | `boolean` | `true` | Show mascot helper |
| `showHints` | `boolean` | `true` | Show hints on inactivity |
| `hintDelay` | `number` | `5000` | Delay before hint (ms) |

### Voice Options (Text-to-Speech)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableVoice` | `boolean` | `true` | Enable text-to-speech |
| `voiceLanguage` | `'uk-UA' \| 'en-US' \| 'ru-RU'` | `'uk-UA'` | Voice language |
| `speakPrompt` | `boolean` | `true` | Speak prompt on load |
| `speakFeedback` | `boolean` | `true` | Speak feedback messages |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ageGroup` | `string` | - | Auto-detect age style |
| `ageStyle` | `AgeStyleName` | `'toddler'` | Force specific age style |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onComplete` | `() => void` | Called when task completed |
| `onLevelUp` | `() => void` | Called when level up |
| `onCorrectTap` | `(id: string) => void` | Called on correct tap |
| `onWrongTap` | `(id: string) => void` | Called on wrong tap |
| `onProgress` | `(progress: number) => void` | Called on progress change |

## 🎯 UX Principles for 3-5 Years

1. **Instant Feedback** - React to every action < 100ms
2. **Clear Goals** - Always clear what to do
3. **Frequent Rewards** - Reward every 3-5 seconds
4. **Forgiving Errors** - No punishment, only gentle hints
5. **Visual Clarity** - Large elements, high contrast
6. **Fun Sounds** - Audio on every action
7. **Animated Guidance** - Mascot shows what to do
8. **Progressive Difficulty** - Start very simple

## 🎨 Age Styles

Component automatically adapts to age group:

- **Toddler (3-5)**: Largest size, brightest colors, most feedback
- **Preschool (6-7)**: Large, playful
- **Elementary (8-9)**: Medium, balanced
- **Middle (10-13)**: Standard, clean
- **Teen (14-18)**: Compact, minimal

## 🧪 Testing

Test different scenarios:

```tsx
// Test simple mode
<TapImage mode="simple" targetCount={3} />

// Test find mode with wrong taps
<TapImage mode="find" correctAnswer="2" />

// Test sequence with reset
<TapImage mode="sequence" sequence={['a', 'b', 'c']} />

// Test memory with short time
<TapImage mode="memory" memoryTime={2000} />
```

## 📝 Editor Integration

The `TapImageEditor` component provides a user-friendly interface for configuring all options:

- 🎮 Game mode selector with descriptions
- 🖼️ Multi-image uploader with preview
- ⚙️ Mode-specific settings
- 🎨 Display toggles
- 📏 Size selector

## 🔄 Migration from Old TapImage

Old component still works for backward compatibility:

```tsx
// Old way (still works)
<TapImage 
  imageUrl="/dog.jpg" 
  caption="Dog" 
/>

// New way (recommended)
<TapImage
  mode="simple"
  images={[{ id: '1', url: '/dog.jpg', label: 'Dog' }]}
  targetCount={5}
/>
```

## 🚀 Performance

- Memoized animations
- Optimized re-renders
- Lazy sound loading
- Efficient particle system

## 🎯 Best Practices

1. Use `large` size for 3-5 years
2. Enable all helper features (mascot, hints, progress)
3. Start with `simple` mode for youngest
4. Use clear, simple prompts
5. Provide high-quality images (min 200x200px)
6. Test on touch devices

## 📱 Mobile Optimization

- Touch-optimized hit areas
- Haptic feedback support
- Prevent multi-touch
- Orientation adaptive

## 🐛 Troubleshooting

**Images not showing?**
- Check image URLs are accessible
- Verify CORS settings
- Use https:// URLs

**No sound?**
- Check browser sound permissions
- Verify sound service initialization
- Test on user interaction

**Hints not appearing?**
- Set `showHints={true}`
- Adjust `hintDelay` if needed
- Check component is active

## 🔊 Voice Guidance (Text-to-Speech)

### Features

Використовує **Web Speech API** (нативний JavaScript) для озвучки:

- ✅ Озвучка інструкцій при завантаженні
- ✅ Озвучка фідбеку (успіх/помилка)
- ✅ Озвучка підказок
- ✅ Підтримка 3 мов (українська, англійська, російська)
- ✅ Адаптивна швидкість та тон голосу для різних вікових груп
- ✅ Без додаткових залежностей

### Age-Adapted Voice

- **Toddler (3-5)**: Повільніше (0.8x), вищий тон (1.3x)
- **Preschool (6-7)**: Трохи повільніше (0.9x), трохи вищий тон (1.1x)
- **Elementary (8-9)**: Нормальна швидкість і тон

### Browser Support

Web Speech API підтримується в більшості сучасних браузерів:
- ✅ Chrome/Edge
- ✅ Safari
- ✅ Firefox
- ⚠️ Потрібний HTTPS (або localhost)

### Implementation

```tsx
// Enable voice with Ukrainian
<TapImage
  enableVoice
  voiceLanguage="uk-UA"
  speakPrompt
  speakFeedback
/>

// Disable voice
<TapImage
  enableVoice={false}
/>

// English voice
<TapImage
  enableVoice
  voiceLanguage="en-US"
/>
```

### Technical Details

Utility: `src/utils/interactive/textToSpeech.ts`

```typescript
// Manual usage
import { speakText, speakForAge } from '@/utils/interactive/textToSpeech';

// Simple speak
await speakText('Молодець!', 'uk-UA');

// Age-adapted speak
await speakForAge('Супер!', 'toddler', 'uk-UA');
```

## 📚 Related Components

- `SimpleDragAndDrop` - Drag and drop for toddlers
- `SimpleCounter` - Number learning
- `MemoryCards` - Card matching game
- `ColorMatcher` - Color learning

## 🎓 Educational Value

- **Cognitive**: Pattern recognition, memory
- **Motor**: Fine motor skills, hand-eye coordination
- **Attention**: Focus, sustained attention
- **Emotional**: Confidence, achievement

## 📄 License

Part of the TeachSpark platform.

