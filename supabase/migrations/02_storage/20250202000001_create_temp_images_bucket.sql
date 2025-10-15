-- Створення тимчасового bucket для зображень під час генерації
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-images',
  'temp-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

-- Політики доступу для тимчасового bucket
-- Дозволяємо користувачам завантажувати файли в свої тимчасові папки
CREATE POLICY "Users can upload temp images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp-images' AND (
    -- Тимчасові файли: temp/user_id/session_id/...
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Загальні тимчасові файли: temp/shared/...
    (storage.foldername(name))[1] = 'temp'
  )
);

-- Дозволяємо користувачам переглядати тимчасові зображення
CREATE POLICY "Users can view temp images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp-images' AND (
    -- Власні тимчасові файли
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Публічний доступ до тимчасових файлів (для перегляду)
    (storage.foldername(name))[1] = 'temp'
  )
);

-- Дозволяємо користувачам видаляти свої тимчасові файли
CREATE POLICY "Users can delete temp images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp-images' AND (
    -- Користувачі можуть видаляти свої тимчасові файли
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Системний доступ для cleanup (service role)
    auth.uid() IS NULL
  )
);

-- Публічний доступ для читання тимчасових файлів (потрібно для показу зображень)
CREATE POLICY "Public access to temp images" ON storage.objects
FOR SELECT USING (bucket_id = 'temp-images');
