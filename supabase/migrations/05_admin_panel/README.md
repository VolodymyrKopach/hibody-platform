# Admin Panel Migrations

Міграції для адмін-панелі та системи аналітики.

## Що включає

- ✅ Таблиця `admin_users` (ролі адмінів)
- ✅ Таблиця `activity_log` (логування активності)
- ✅ Таблиця `system_metrics` (метрики системи)
- ✅ Таблиця `user_activity_stats` (статистика користувачів)
- ✅ Таблиця `user_cohorts` (когорти користувачів)
- ✅ Таблиця `platform_settings` (налаштування платформи)
- ✅ RLS політики для безпеки
- ✅ Helper функції

## Файли (у порядку запуску)

1. `20251013_admin_panel_schema.sql` - Основна схема адмін-панелі
2. `20251013_create_activity_log.sql` - Логування активності
3. `20251013_create_platform_settings.sql` - Налаштування
4. `20251013_create_user_activity_stats.sql` - Статистика
5. `20251013_create_user_cohorts.sql` - Когорти
6. `20251013_fix_admin_rls.sql` - Виправлення RLS
7. `20251014_add_activity_tracking.sql` - Додатковий tracking

## Запуск

```bash
cd supabase/migrations/05_admin_panel
for file in *.sql; do
  psql $DATABASE_URL -f "$file"
done
```

## Після запуску

Потрібно створити першого super admin:

```bash
node scripts/check-and-add-admin.js
```

Або вручну в SQL Editor:
```sql
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES ('YOUR_USER_ID', 'super_admin', 'YOUR_USER_ID');
```

