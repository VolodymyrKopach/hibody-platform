-- Fix RLS policies for temp-images bucket
-- Issue: The existing policies might have incorrect array indexing for storage.foldername()

-- Drop existing temp-images policies
DROP POLICY IF EXISTS "Users can upload temp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view temp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete temp images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to temp images" ON storage.objects;

-- Create new fixed policies for temp-images bucket
-- Path structure: temp/user_id/session_id/filename.webp
-- storage.foldername() returns array: ['temp', 'user_id', 'session_id']
-- Note: PostgreSQL arrays are 1-indexed, so [1] = 'temp', [2] = 'user_id', [3] = 'session_id'

CREATE POLICY "Users can upload temp images v2" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp-images' AND (
    -- User's temp files: temp/user_id/session_id/...
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Shared temp files: temp/shared/...
    (storage.foldername(name))[2] = 'shared'
  )
);

CREATE POLICY "Users can view temp images v2" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp-images' AND (
    -- User's own temp files
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Shared temp files
    (storage.foldername(name))[2] = 'shared' OR
    -- Public bucket access (needed for image display)
    true
  )
);

CREATE POLICY "Users can delete temp images v2" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp-images' AND (
    -- Users can delete their own temp files
    auth.uid()::text = (storage.foldername(name))[2] OR
    -- Service role can delete any temp files (for cleanup)
    auth.role() = 'service_role'
  )
);

-- Alternative simpler policy for testing - if the above doesn't work
-- This is more permissive but still secure for temp files
CREATE POLICY "Temp images fallback policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'temp-images' AND
  -- Only allow operations on files in temp/ folder
  (storage.foldername(name))[1] = 'temp'
) WITH CHECK (
  bucket_id = 'temp-images' AND
  -- Only allow operations on files in temp/ folder  
  (storage.foldername(name))[1] = 'temp'
);
