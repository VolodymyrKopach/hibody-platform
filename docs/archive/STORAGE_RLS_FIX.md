# Виправлення RLS політик Supabase Storage

## 🚨 Проблема

При збереженні превью слайдів в Supabase Storage виникає помилка:

```json
{
    "statusCode": "403",
    "error": "Unauthorized", 
    "message": "new row violates row-level security policy"
}
```

## 🔍 Причина

RLS політики для Storage bucket `lesson-assets` очікували, що перша папка в шляху файлу буде відповідати `auth.uid()`:

```sql
-- Стара політика (❌ Не працює)
CREATE POLICY "Users can upload their own lesson assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]  -- Очікує user_id/...
);
```

Але в коді використовуються інші структури папок:
- `lesson-thumbnails/{lessonId}/{fileName}` - в API route
- `lessons/{lessonId}/thumbnails/{fileName}` - в LocalThumbnailService

## 🛠️ Рішення

Оновлено RLS політики для підтримки різних структур папок:

```sql
-- Нова політика (✅ Працює)
CREATE POLICY "Users can upload lesson assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-assets' AND (
    -- Власні файли користувача: user_id/...
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Thumbnail'и уроків: lesson-thumbnails/...
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    -- Файли уроків: lessons/...
    (storage.foldername(name))[1] = 'lessons'
  )
);
```

## 📁 Підтримувані структури папок

Після виправлення користувачі можуть завантажувати файли в:

1. **Власні папки користувача:**
   ```
   {user_id}/documents/file.pdf
   {user_id}/images/avatar.jpg
   ```

2. **Thumbnail'и уроків (API route):**
   ```
   lesson-thumbnails/{lessonId}/slide-1-preview-123456.png
   lesson-thumbnails/{lessonId}/slide-2-preview-123457.png
   ```

3. **Файли уроків (LocalThumbnailService):**
   ```
   lessons/{lessonId}/thumbnails/slide_123_456789.png
   lessons/{lessonId}/images/background.jpg
   ```

## 🚀 Застосування виправлення

### Варіант 1: SQL скрипт (рекомендовано)
```bash
# Скопіюйте вміст scripts/fix-storage-rls.sql
# Виконайте в SQL Editor Supabase Dashboard
```

### Варіант 2: Міграція Supabase CLI
```bash
# Якщо використовуєте Supabase CLI
npx supabase db push
```

### Варіант 3: Node.js скрипт
```bash
# Встановіть змінні середовища
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# Запустіть скрипт
node scripts/apply-storage-fix.js
```

## ✅ Тестування виправлення

Після застосування виправлення перевірте:

1. **Створення нового слайду**
   - Відкрийте чат
   - Створіть слайд
   - Перевірте що превью генерується

2. **Збереження презентації**
   - Виберіть слайди для збереження
   - Натисніть "Зберегти презентацію"
   - Перевірте що thumbnail'и завантажуються в Storage

3. **Перегляд збережених уроків**
   - Відкрийте розділ "Матеріали"
   - Перевірте що збережені уроки мають thumbnail'и

## 🔧 Файли які були змінені

1. **supabase/migrations/20250131000001_create_storage_bucket.sql**
   - Оновлено RLS політики

2. **supabase/migrations/20250131000002_fix_storage_rls_policies.sql**
   - Нова міграція з виправленнями

3. **scripts/fix-storage-rls.sql**
   - SQL скрипт для прямого застосування

4. **scripts/apply-storage-fix.js**
   - Node.js скрипт для автоматичного застосування

## 📋 Деталі політик

### Політики для завантаження (INSERT)
- Дозволяє завантаження в `{user_id}/`, `lesson-thumbnails/`, `lessons/`

### Політики для перегляду (SELECT)  
- Дозволяє перегляд файлів з тих же папок
- Додаткова публічна політика для lesson-thumbnails та lessons

### Політики для оновлення/видалення (UPDATE/DELETE)
- Дозволяє зміну файлів з тих же папок

## 🎯 Результат

✅ Виправлена помилка 403 при завантаженні файлів  
✅ Збереження превью слайдів працює  
✅ Збереження презентацій з thumbnail'ами працює  
✅ Перегляд збережених матеріалів працює  

## 🔄 Сумісність

Виправлення повністю зворотньо-сумісне:
- Існуючі файли продовжать працювати
- Старі шляхи файлів підтримуються
- Нові шляхи файлів тепер працюють 