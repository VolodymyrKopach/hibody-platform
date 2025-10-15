-- Migration: Create worksheet-images storage bucket and RLS policies
-- Date: 2025-10-01
-- Description: Storage bucket for worksheet editor image uploads

-- ============================================
-- 1. Create worksheet-images bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worksheet-images',
  'worksheet-images',
  true, -- Public read access
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. RLS Policies for authenticated users
-- ============================================

-- Policy: Users can upload images to their own folder
CREATE POLICY "Users can upload their own worksheet images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'worksheet-images' 
  AND (storage.foldername(name))[1] = 'worksheets'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can view their own images
CREATE POLICY "Users can view their own worksheet images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'worksheet-images' 
  AND (storage.foldername(name))[1] = 'worksheets'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own worksheet images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'worksheet-images' 
  AND (storage.foldername(name))[1] = 'worksheets'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'worksheet-images' 
  AND (storage.foldername(name))[1] = 'worksheets'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own worksheet images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'worksheet-images' 
  AND (storage.foldername(name))[1] = 'worksheets'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================
-- 3. Public read access policy
-- ============================================

-- Policy: Allow public read access (for sharing worksheets)
CREATE POLICY "Public read access for worksheet images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'worksheet-images');

-- ============================================
-- 4. Verify bucket creation
-- ============================================

-- Query to check if bucket exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'worksheet-images'
  ) THEN
    RAISE NOTICE '✅ Bucket "worksheet-images" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create bucket "worksheet-images"';
  END IF;
END $$;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';

-- Note: Expected folder structure in worksheet-images bucket:
-- worksheets/{user_id}/temp/{filename}           - Temporary uploads
-- worksheets/{user_id}/{worksheet_id}/{filename} - Permanent worksheets

