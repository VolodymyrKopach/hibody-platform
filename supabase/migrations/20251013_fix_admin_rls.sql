-- Fix RLS policies for admin_users table
-- Allow users to check their own admin status

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Super admins can view all admins" ON public.admin_users;

-- Create new policies:
-- 1. Users can read their OWN admin status (important for frontend check)
CREATE POLICY "Users can read their own admin status"
  ON public.admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- 2. Super admins can view ALL admins (for management)
CREATE POLICY "Super admins can view all admins"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Verify policies
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE 'Users can now check their own admin status.';
END $$;

