# 📁 Database Migrations Structure

## ✅ Реорганізація завершена!

Всі міграції організовані по категоріях для зручності управління.

## 📊 Статистика

- **8 категорій**
- **26 SQL файлів**
- **4 README файли**
- **2 helper скрипти**

## 🗂️ Структура

```
supabase/migrations/
├── README.md                    # Головна інструкція
│
├── 01_initial_setup/            # 3 файли
│   ├── README.md
│   ├── 20240101000001_initial_schema.sql
│   ├── 20240101000002_rls_policies.sql
│   └── 20250706113616_create_tables.sql
│
├── 02_storage/                  # 5 файлів
│   ├── 011_worksheet_images_bucket.sql
│   ├── 20250131000001_create_storage_bucket.sql
│   ├── 20250131000002_fix_storage_rls_policies.sql
│   ├── 20250202000001_create_temp_images_bucket.sql
│   └── 20250819000001_fix_temp_images_rls_policies.sql
│
├── 03_payments/                 # 3 файли
│   ├── 012_add_subscription_fields.sql
│   ├── 014_create_payments_table.sql
│   └── 20251014_update_payments_wayforpay.sql
│
├── 04_generation_limits/        # 3 файли
│   ├── 013_add_increment_function.sql
│   ├── 015_add_generation_reset_tracking.sql
│   └── 016_monthly_reset_and_cron.sql
│
├── 05_admin_panel/              # 7 файлів ⭐
│   ├── README.md
│   ├── 20251013_admin_panel_schema.sql
│   ├── 20251013_create_activity_log.sql
│   ├── 20251013_create_platform_settings.sql
│   ├── 20251013_create_user_activity_stats.sql
│   ├── 20251013_create_user_cohorts.sql
│   ├── 20251013_fix_admin_rls.sql
│   └── 20251014_add_activity_tracking.sql
│
├── 06_token_tracking/           # 2 файли 💰
│   ├── README.md
│   ├── 20251015_create_ai_model_pricing.sql
│   └── 20251015_create_token_usage.sql
│
├── 07_features/                 # 2 файли
│   ├── 20250921194755_add_lesson_plan_fields.sql
│   └── 20251013_create_worksheets_table.sql
│
└── 08_rls_fixes/                # 2 файли
    ├── 20250706113814_fix_rls_policies.sql
    └── 20250706113850_disable_rls_temporarily.sql
```

## 🛠️ Helper Scripts

```
scripts/
├── run-migrations.sh       # Bash скрипт (рекомендовано)
└── run-migrations.js       # Node.js скрипт (альтернатива)
```

## 🚀 Швидкий старт

### Для нового проекту (всі міграції):
```bash
./scripts/run-migrations.sh all
```

### Тільки Admin Panel:
```bash
./scripts/run-migrations.sh 05_admin_panel
```

### Тільки Token Tracking:
```bash
./scripts/run-migrations.sh 06_token_tracking
```

### Список всіх категорій:
```bash
./scripts/run-migrations.sh list
```

## 📋 Категорії

| № | Категорія | Файлів | Опис |
|---|-----------|--------|------|
| 1 | `01_initial_setup` | 3 | Базова схема БД (обов'язкова) |
| 2 | `02_storage` | 5 | Storage buckets для зображень |
| 3 | `03_payments` | 3 | Платежі та підписки |
| 4 | `04_generation_limits` | 3 | Ліміти генерації контенту |
| 5 | `05_admin_panel` | 7 | Адмін-панель та аналітика ⭐ |
| 6 | `06_token_tracking` | 2 | Відстеження витрат AI 💰 |
| 7 | `07_features` | 2 | Lesson plans, worksheets |
| 8 | `08_rls_fixes` | 2 | Виправлення RLS політик |

## ✨ Переваги нової структури

✅ **Модульність** - кожна категорія окремо  
✅ **Зручність** - запускай тільки те що потрібно  
✅ **Документація** - README для кожної важливої категорії  
✅ **Автоматизація** - helper скрипти для швидкого запуску  
✅ **Порядок** - зрозуміла послідовність виконання  

## 🎯 Приклади використання

### Розгортання нового проекту:
```bash
# 1. Базова схема (обов'язково)
./scripts/run-migrations.sh 01_initial_setup

# 2. Storage (якщо потрібні зображення)
./scripts/run-migrations.sh 02_storage

# 3. Admin panel (для адмін-панелі)
./scripts/run-migrations.sh 05_admin_panel

# 4. Token tracking (для відстеження витрат)
./scripts/run-migrations.sh 06_token_tracking
```

### Оновлення існуючого проекту:
```bash
# Тільки нові фічі
./scripts/run-migrations.sh 06_token_tracking
```

## 📚 Документація

Детальні інструкції:
- **Головна**: `supabase/migrations/README.md`
- **Initial Setup**: `supabase/migrations/01_initial_setup/README.md`
- **Admin Panel**: `supabase/migrations/05_admin_panel/README.md`
- **Token Tracking**: `supabase/migrations/06_token_tracking/README.md`

---

**Створено**: 2025-10-15  
**Версія**: 1.0  
**Статус**: ✅ Production Ready
