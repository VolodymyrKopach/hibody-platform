-- =============================================
-- Add INSERT policy for user_profiles
-- Allows users to create their own profile during OAuth signup
-- =============================================

-- Drop existing policy if exists (for idempotency)
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Create policy that allows users to insert their own profile
-- This is needed for OAuth signup flow where profile is created after authentication
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Note: This policy allows authenticated users to create a profile 
-- with their own user ID. The auth.uid() = id check ensures users 
-- can only create profiles for themselves.

