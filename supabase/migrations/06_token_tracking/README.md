# Token Tracking Migrations

Міграції для відстеження використання токенів AI та розрахунку витрат.

## Що включає

- ✅ Таблиця `ai_model_pricing` (ціни на AI моделі)
- ✅ Таблиця `token_usage` (використання токенів)
- ✅ Автоматичний розрахунок вартості
- ✅ RLS політики

## Файли

1. `20251015_create_ai_model_pricing.sql` - Таблиця цін на AI моделі
2. `20251015_create_token_usage.sql` - Таблиця використання токенів

## Запуск

```bash
cd supabase/migrations/06_token_tracking
psql $DATABASE_URL -f 20251015_create_ai_model_pricing.sql
psql $DATABASE_URL -f 20251015_create_token_usage.sql
```

## Початкові дані

Після запуску автоматично додається:
- Ціна для `gemini-2.5-flash`:
  - Input: $0.075 per 1M tokens
  - Output: $0.30 per 1M tokens

## Використання в коді

Tracking автоматично працює в:
- `GeminiSlideEditingService`
- `GeminiWorksheetGenerationService`
- `GeminiWorksheetEditingService`
- `GeminiContentService`
- `GeminiIntentService`

Дані відображаються на сторінці `/admin/users/[id]`.

