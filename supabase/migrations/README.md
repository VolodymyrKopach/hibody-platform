# Database Migrations

Міграції організовані по категоріях для зручності управління та запуску.

## 📁 Структура

```
migrations/
├── 01_initial_setup/      # Базова схема БД (завжди потрібна)
├── 02_storage/            # Storage buckets для зображень
├── 03_payments/           # Платежі та підписки
├── 04_generation_limits/  # Ліміти генерації контенту
├── 05_admin_panel/        # Адмін-панель та аналітика
├── 06_token_tracking/     # Відстеження токенів AI
├── 07_features/           # Окремі фічі (lesson plans, worksheets)
└── 08_rls_fixes/          # Виправлення RLS політик
```

## 🚀 Як запускати

### Метод 1: Через helper скрипт (рекомендовано) 🎯

```bash
# Всі міграції в правильному порядку
./scripts/run-migrations.sh all

# Тільки одна категорія
./scripts/run-migrations.sh 05_admin_panel

# Список доступних категорій
./scripts/run-migrations.sh list
```

### Метод 2: Через Node.js скрипт

```bash
# Всі міграції
node scripts/run-migrations.js all

# Конкретна категорія
node scripts/run-migrations.js 06_token_tracking

# Список категорій
node scripts/run-migrations.js list
```

⚠️ **Важливо**: Node.js версія має обмеження. Для production краще використовувати bash скрипт або Dashboard.

### Метод 3: Вручну через Supabase Dashboard

1. Відкрийте Dashboard → SQL Editor
2. Скопіюйте вміст SQL файлу
3. Виконайте
4. Повторіть для всіх файлів у категорії

### Метод 4: Через psql (якщо є DATABASE_URL)

```bash
# Експортуйте DATABASE_URL
export DATABASE_URL="postgresql://..."

# Одна категорія
cd supabase/migrations/05_admin_panel
for file in *.sql; do
  psql $DATABASE_URL -f "$file"
done
```

## 📋 Порядок запуску (для нового проекту)

1. **01_initial_setup** - обов'язково першим
2. **02_storage** - якщо потрібні зображення
3. **03_payments** - якщо потрібна монетизація
4. **04_generation_limits** - якщо потрібні ліміти
5. **05_admin_panel** - для адмін-панелі
6. **06_token_tracking** - для відстеження витрат AI
7. **07_features** - додаткові фічі
8. **08_rls_fixes** - якщо потрібні виправлення

## ⚠️ Важливо

- Завжди робіть backup перед запуском міграцій
- Перевіряйте що міграції не конфліктують
- Не запускайте `08_rls_fixes` на production без тестування

