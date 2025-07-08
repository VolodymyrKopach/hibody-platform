# Claude Integration Guide - Нова Архітектура AI

## 🎯 Огляд

Ми реалізували повністю нову архітектуру для обробки запитів користувачів з використанням двох моделей Claude:
- **Claude Haiku** - для швидкої детекції інтентів та валідації даних
- **Claude Sonnet** - для генерації якісного контенту (плани уроків, слайди)

## 🔧 Архітектура

### 1. Intent Detection (Claude Haiku)
```typescript
// src/services/intent/ClaudeHaikuIntentService.ts
export class ClaudeHaikuIntentService implements IIntentDetectionService {
  // Швидко визначає намір + перевіряє достатність даних
  async detectIntent(message: string): Promise<EnhancedIntentDetectionResult>
}
```

**Особливості:**
- Визначає інтент з confidence score
- Перевіряє чи вистачає всіх необхідних даних
- Генерує питання для збору недостатніх даних

### 2. Content Generation (Claude Sonnet)
```typescript
// src/services/content/ClaudeSonnetContentService.ts
export class ClaudeSonnetContentService {
  // Генерує план уроку без захардкоджених шаблонів
  async generateLessonPlan(topic: string, age: string, language: string): Promise<string>
  
  // Генерує HTML код слайдів
  async generateSlideContent(slideDescription: string, topic: string, age: string): Promise<string>
}
```

## 🌟 Нові можливості

### Smart Data Collection
```typescript
// Приклад роботи
User: "створи урок про динозаврів"
Claude Haiku: 
{
  "intent": "CREATE_LESSON",
  "isDataSufficient": false,
  "missingData": ["age"],
  "suggestedQuestion": "Для якого віку дітей створити урок про динозаврів?"
}

User: "для дітей 8 років"
Claude Haiku: 
{
  "intent": "CREATE_LESSON", 
  "isDataSufficient": true,
  "parameters": { "topic": "динозаври", "age": "8 років" }
}
```

### Enhanced Handlers
```typescript
// src/services/chat/handlers/
DataCollectionHandler     // Збирає недостатні дані
EnhancedCreateLessonHandler // Створює уроки з Claude Sonnet
```

## 🚀 Потік виконання

1. **Користувач пише:** "створи урок про динозаврів для дитини 8 років"

2. **Claude Haiku аналізує:**
   - Intent: CREATE_LESSON
   - Topic: "динозаври"  
   - Age: "8 років"
   - Data sufficient: ✅

3. **Claude Sonnet генерує план:**
   - Без захардкоджених шаблонів
   - Адаптований під вік 8 років
   - З урахуванням специфіки теми

4. **Користувач схвалює план**

5. **Claude Sonnet генерує слайди:**
   - Повний HTML з CSS та JavaScript
   - Інтерактивні елементи
   - Адаптований дизайн

## ⚙️ Налаштування

### 1. Додайте Claude API ключ
```bash
# .env.local
CLAUDE_API_KEY=your_claude_api_key_here
```

### 2. Отримайте ключ
1. Зайдіть на https://console.anthropic.com/
2. Створіть API ключ
3. Додайте в .env.local

### 3. Обов'язковий Claude API
Система працює ТІЛЬКИ з Claude API - без fallback режиму:

```
❌ Claude API key is required for intent detection.

📝 How to fix:
1. Get your API key from: https://console.anthropic.com/
2. Add to .env.local file:
   CLAUDE_API_KEY=sk-ant-api03-your-key-here
3. Restart the development server

🚫 NO FALLBACK - Claude Haiku is required for intelligent intent detection.
```

## 🎨 Приклади використання

### Створення уроку
```
👤 "створи урок про космос для дітей 6 років"

🤖 Claude Haiku визначає:
   - Intent: CREATE_LESSON ✅
   - Topic: космос ✅  
   - Age: 6 років ✅
   - Достатньо даних ✅

🎨 Claude Sonnet генерує:
   - Повний план уроку
   - 5-6 слайдів з інтерактивними елементами
   - Ігрові завдання відповідні віку
```

### Збір недостатніх даних
```
👤 "хочу урок про тварин"

🤖 Claude Haiku:
   "🤔 Для якого віку дітей створити урок про тварин? 
   
   Приклади:
   • для дітей 6 років
   • для дошкільнят 4-5 років  
   • для школярів 8-10 років"

👤 "для дітей 5 років"

🤖 ✅ Тепер генерую план уроку...
```

## 📁 Структура файлів

```
src/services/
├── intent/
│   ├── ClaudeHaikuIntentService.ts     # Claude Haiku integration (ONLY)
│   ├── IIntentDetectionService.ts       # Enhanced interface
│   └── IntentDetectionServiceFactory.ts # Claude-only factory
├── content/
│   └── ClaudeSonnetContentService.ts    # NEW: Claude Sonnet integration
├── chat/
│   ├── ChatService.ts                   # Updated with new handlers
│   └── handlers/
│       ├── EnhancedCreateLessonHandler.ts # NEW: Enhanced with Claude Sonnet
│       ├── DataCollectionHandler.ts      # NEW: Smart data collection
│       └── IIntentHandler.ts             # Enhanced interface
```

## 🔍 Debugging

### Логи в консолі
```
🎯 Processing message: "створи урок про динозаврів для дитини 8 років"
📋 Conversation step: none
🎯 [INTENT] CREATE_LESSON (confidence: 0.95)
📝 [PARAMETERS] { topic: "динозаври", age: "8 років" }
✅ [DATA SUFFICIENT] true
🔧 [HANDLER] EnhancedCreateLessonHandler
🎨 Generating lesson plan with Claude Sonnet...
✅ Lesson plan generated successfully
```

### Без API ключа
```
❌ Claude API key is required for intent detection.
🚫 NO FALLBACK - система не запуститься
```

## 🚦 Тестування

1. **Без API ключа:** Система НЕ запуститься - покаже помилку з інструкціями
2. **З API ключем:** Повний функціонал Claude Haiku + Sonnet
3. **Помилки API:** Детальне логування з діагностикою Claude

## 📋 TODO / Розширення

- [ ] Підтримка інших мов (англійська, російська)
- [ ] Кешування відповідей Claude для оптимізації
- [ ] A/B тестування різних промптів
- [ ] Інтеграція з іншими AI моделями
- [ ] Аналітика якості згенерованого контенту

## 🎉 Переваги нової архітектури

1. **Розумність:** AI розуміє контекст і збирає потрібні дані
2. **Якість:** Claude Sonnet генерує кращий контент ніж шаблони
3. **Гнучкість:** Легко додавати нові інтенти та обробники
4. **Надійність:** Claude API обов'язковий для якісної роботи
5. **SOLID принципи:** Чистий код з розділенням відповідальності 