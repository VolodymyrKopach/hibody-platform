-- Створення bucket для збереження ресурсів уроків
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-assets',
  'lesson-assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

-- Політики доступу для bucket lesson-assets
-- Дозволяємо користувачам завантажувати файли в свої власні папки (по user_id) 
-- або в загальні папки для thumbnail'ів уроків
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

-- Публічний доступ для читання всіх файлів уроків
CREATE POLICY "Public access to lesson files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lesson-assets' AND (
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR
    (storage.foldername(name))[1] = 'lessons'
  )
);
