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
CREATE POLICY "Users can upload their own lesson assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own lesson assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lesson-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own lesson assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own lesson assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Політики для публічного доступу до lesson-thumbnails
CREATE POLICY "Public access to lesson thumbnails" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lesson-assets' AND 
  (storage.foldername(name))[1] = 'lesson-thumbnails'
);
