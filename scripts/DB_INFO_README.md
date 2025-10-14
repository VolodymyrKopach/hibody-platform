# 📊 Database Information Collection

## 🎯 Мета

Ці скрипти збирають повну інформацію про структуру БД для:
- Створення правильних міграцій
- Генерації TypeScript типів
- Розуміння зв'язків між таблицями
- Роботи з AI помічниками

---

## 🚀 Як використовувати

### Варіант 1: Автоматично (Рекомендовано)

```bash
# Зробити скрипт виконуваним
chmod +x scripts/export-db-structure.sh

# Запустити експорт
bash scripts/export-db-structure.sh
```

**Результат:**
- ✅ `db-structure.json` - JSON структура БД
- ✅ `db-structure.txt` - текстовий опис
- ✅ `db-schema.sql` - повна SQL схема

---

### Варіант 2: Вручну через Supabase Dashboard

#### 1. JSON структура:
1. Відкрити SQL Editor в Supabase
2. Вставити вміст `scripts/collect-db-info-json.sql`
3. Запустити
4. Скопіювати результат → зберегти як `db-structure.json`

#### 2. Текстовий опис:
1. Вставити вміст `scripts/collect-db-info.sql`
2. Запустити
3. Скопіювати результат → зберегти як `db-structure.txt`

---

### Варіант 3: Через Supabase CLI

```bash
# JSON
supabase db execute --file scripts/collect-db-info-json.sql > db-structure.json

# Text
supabase db execute --file scripts/collect-db-info.sql > db-structure.txt

# Full schema
supabase db dump --schema public > db-schema.sql
```

---

## 📋 Що збирається

### 1. **Tables** - список всіх таблиць
### 2. **Columns** - всі колонки (тип, nullable, default)
### 3. **Foreign Keys** - зв'язки між таблицями
### 4. **Unique Constraints** - унікальні обмеження
### 5. **Indexes** - всі індекси
### 6. **Functions** - SQL функції
### 7. **Triggers** - тригери
### 8. **RLS Policies** - політики безпеки
### 9. **Table Sizes** - розмір таблиць
### 10. **Enums** - enum типи

---

## 🤖 Використання з AI

Коли працюєш з AI помічником (ChatGPT, Claude, etc.):

1. **Запустити експорт:**
```bash
bash scripts/export-db-structure.sh
```

2. **Відкрити `db-structure.json`**

3. **Скопіювати і надати AI:**
```
Ось структура моєї БД:

[вставити вміст db-structure.json]

Тепер створи міграцію для...
```

---

## 📊 Формат JSON

```json
{
  "tables": {
    "users": {
      "columns": {
        "id": {
          "type": "uuid",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        ...
      },
      "foreign_keys": [...],
      "indexes": [...],
      "rls_enabled": true
    }
  },
  "functions": [...],
  "triggers": [...],
  "policies": [...]
}
```

---

## ✅ Перевірка

Після експорту перевір:

```bash
# Перевірити чи створились файли
ls -lh db-structure.*

# Перевірити розмір
wc -l db-structure.txt

# Перевірити JSON
cat db-structure.json | jq .
```

---

## 🔄 Коли оновлювати

Запускай експорт після:
- Застосування нових міграцій
- Зміни структури БД
- Додавання нових таблиць/колонок
- Зміни RLS policies

---

## 💡 Поради

1. **Додай до .gitignore:**
```
db-structure.json
db-structure.txt
db-schema.sql
```

2. **Створи alias:**
```bash
# В ~/.zshrc або ~/.bashrc
alias dbexport="bash scripts/export-db-structure.sh"
```

3. **Автоматизуй:**
```bash
# Після кожної міграції
supabase db push && bash scripts/export-db-structure.sh
```

---

## 📝 Приклад використання

**Задача:** Створити API для finance analytics

**Крок 1:** Зібрати структуру БД
```bash
bash scripts/export-db-structure.sh
```

**Крок 2:** Надати AI контекст
```
Маю таку структуру БД: [db-structure.json]

Створи API endpoint для revenue metrics який:
- Рахує MRR з payments таблиці
- Групує по subscription_type
- Повертає trends за 30 днів
```

**Крок 3:** AI створить правильний код бо знає:
- Які таблиці існують
- Які колонки доступні
- Які зв'язки між таблицями
- Які є indexes для оптимізації

---

## 🎯 Результат

Тепер AI може:
- ✅ Створювати правильні міграції
- ✅ Генерувати типи TypeScript
- ✅ Писати оптимізовані запити
- ✅ Пропонувати правильні indexes
- ✅ Враховувати існуючі зв'язки

**Без помилок типу:**
- ❌ "table doesn't exist"
- ❌ "column not found"
- ❌ "foreign key violation"

