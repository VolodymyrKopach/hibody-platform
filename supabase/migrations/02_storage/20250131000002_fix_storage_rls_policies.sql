-- Виправлення RLS політик для Supabase Storage
-- Проблема: попередні політики очікували user_id як першу папку,
-- але ми використовуємо lesson-thumbnails/ та lessons/

-- Видаляємо старі політики
DROP POLICY IF EXISTS "Users can upload their own lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Public access to lesson thumbnails" ON storage.objects;

-- Створюємо нові політики з підтримкою lesson-thumbnails/ та lessons/
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

CREATE POLICY "Users can view lesson assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lesson-assets' AND (
    -- Власні файли користувача: user_id/...
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Thumbnail'и уроків: lesson-thumbnails/...
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    -- Файли уроків: lessons/...
    (storage.foldername(name))[1] = 'lessons'
  )
);

CREATE POLICY "Users can update lesson assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-assets' AND (
    -- Власні файли користувача: user_id/...
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Thumbnail'и уроків: lesson-thumbnails/...
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    -- Файли уроків: lessons/...
    (storage.foldername(name))[1] = 'lessons'
  )
);

CREATE POLICY "Users can delete lesson assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-assets' AND (
    -- Власні файли користувача: user_id/...
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Thumbnail'и уроків: lesson-thumbnails/...
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    -- Файли уроків: lessons/...
    (storage.foldername(name))[1] = 'lessons'
  )
);

-- Публічний доступ для читання файлів уроків
CREATE POLICY "Public access to lesson files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lesson-assets' AND (
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    (storage.foldername(name))[1] = 'lessons'
  )
); 