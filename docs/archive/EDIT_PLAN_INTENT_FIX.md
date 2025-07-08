# Виправлення розпізнавання інтенту "покращ план"

## Проблема
Система неправильно розпізнавала запити типу "покращ план" як `improve_html` замість `edit_plan`, що призводило до помилки:

```
❌ No handler found for intent: improve_html
💥 Chat service error: Error: No handler found for intent: improve_html
```

## Причина
Claude Haiku плутав "покращити план уроку" з "покращити HTML код" через неточні описи інтентів у промпті.

## Виправлення

### 1. Додано новий інтент EDIT_PLAN
**Файл:** `src/services/intent/IIntentDetectionService.ts`

```typescript
export enum UserIntent {
  // ... існуючі інтенти
  EDIT_PLAN = 'edit_plan',     // ← НОВИЙ ІНТЕНТ
  // ... інші інтенти
}
```

### 2. Покращено промпт Claude Haiku
**Файл:** `src/services/intent/ClaudeHaikuIntentService.ts`

Додано чіткі описи інтентів:
```
- EDIT_PLAN: змінити/покращити план уроку (фрази: "покращ план", "змін план", "оновити план")
- EDIT_HTML_INLINE: текстові зміни в HTML
- IMPROVE_HTML: загальні покращення HTML коду
```

Додано приклад відповіді:
```json
Для "покращ план":
{
  "intent": "EDIT_PLAN",
  "confidence": 0.9,
  "parameters": {
    "topic": null,
    "age": null,
    "slideNumber": null
  },
  "language": "uk",
  "reasoning": "Користувач хоче змінити план уроку",
  "isDataSufficient": true,
  "missingData": [],
  "suggestedQuestion": null
}
```

### 3. Оновлено EditPlanHandler
**Файл:** `src/services/chat/handlers/EditPlanHandler.ts`

**Покращено `canHandle()`:**
```typescript
canHandle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): boolean {
  return intent.intent === UserIntent.EDIT_PLAN || 
         conversationHistory?.step === 'plan_editing';
}
```

**Додано обробку без контексту:**
```typescript
// Handle case when user wants to edit plan but no conversation history exists
if (!conversationHistory || !conversationHistory.planningResult) {
  return {
    success: true,
    message: `🤔 Схоже, ви хочете покращити план уроку, але наразі немає активного плану.

💡 **Давайте створимо новий план!** Скажіть мені:
• Про що має бути урок? (тема)
• Для якого віку дітей? (вік)

**Приклад:** "Створи урок про динозаврів для дітей 6 років"`,
    conversationHistory: undefined,
    actions: []
  };
}
```

## Тестування

### Підтримувані фрази:
✅ "покращ план"
✅ "змініть план" 
✅ "оновити план"
✅ "edit plan" (англійською)

### Сценарії:
1. **Без активного плану:**
   - Вхід: "покращ план"
   - Вихід: Пропозиція створити новий план

2. **З активним планом:** 
   - Вхід: "покращ план" + conversation history
   - Вихід: Редагування існуючого плану

### Результати тестування:
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "покращ план"}'

# Успішно: повертає пропозицію створити план
```

## Покращення системи

### До виправлення:
- ❌ "покращ план" → `improve_html` → помилка
- ❌ Плутанина між інтентами

### Після виправлення:
- ✅ "покращ план" → `edit_plan` → коректна обробка
- ✅ Чітке розрізнення інтентів
- ✅ Інтелігентна поведінка без контексту

## Інші виправлення в майбутньому

Для подальшого покращення рекомендується:

1. **Додати тренувальні дані:** Більше прикладів фраз для кожного інтенту
2. **A/B тестування:** Порівняти якість розпізнавання різних версій промптів
3. **Логування:** Відстежувати неправильно розпізнані інтенти
4. **Фідбек система:** Дозволити користувачам виправляти неправильні інтенти

## Висновок

✅ **Проблему повністю вирішено.** Система тепер правильно розпізнає запити на редагування плану та надає корисні відповіді навіть без активного контексту. 