# Initial Setup Migrations

Базова схема бази даних. **Обов'язково потрібна** для нового проекту.

## Файли

1. `20240101000001_initial_schema.sql` - Основні таблиці (users, lessons, slides)
2. `20240101000002_rls_policies.sql` - Базові RLS політики
3. `20250706113616_create_tables.sql` - Додаткові таблиці

## Запуск

```bash
cd supabase/migrations/01_initial_setup
psql $DATABASE_URL -f 20240101000001_initial_schema.sql
psql $DATABASE_URL -f 20240101000002_rls_policies.sql
psql $DATABASE_URL -f 20250706113616_create_tables.sql
```

Або через Supabase Dashboard (SQL Editor).

