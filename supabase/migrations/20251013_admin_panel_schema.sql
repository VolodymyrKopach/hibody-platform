-- Admin Panel Schema Migration
-- This migration creates tables and policies for admin panel functionality

-- =====================================================
-- 1. ADMIN USERS TABLE
-- =====================================================
-- Table to manage admin access rights
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast admin checks
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- RLS Policies for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only super admins can view admin list
CREATE POLICY "Super admins can view all admins"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can insert new admins
CREATE POLICY "Super admins can create admins"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can update admins
CREATE POLICY "Super admins can update admins"
  ON public.admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can delete admins
CREATE POLICY "Super admins can delete admins"
  ON public.admin_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- 2. ACTIVITY LOG TABLE
-- =====================================================
-- Table to track all user activities
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT, -- 'lesson', 'slide', 'worksheet', 'auth', 'payment', 'user'
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON public.activity_log(entity_type);

-- RLS Policies for activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log"
  ON public.activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Anyone authenticated can insert their own activity (via app)
CREATE POLICY "Users can insert their own activity"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- 3. SYSTEM METRICS TABLE
-- =====================================================
-- Table to store daily aggregated metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_users_7d INTEGER DEFAULT 0,
  active_users_30d INTEGER DEFAULT 0,
  new_registrations INTEGER DEFAULT 0,
  lessons_created INTEGER DEFAULT 0,
  slides_generated INTEGER DEFAULT 0,
  worksheets_created INTEGER DEFAULT 0,
  ai_requests INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date)
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_system_metrics_date ON public.system_metrics(date DESC);

-- RLS Policies for system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins can view metrics
CREATE POLICY "Admins can view system metrics"
  ON public.system_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can insert/update metrics
CREATE POLICY "Super admins can manage metrics"
  ON public.system_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
  );
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id AND role = 'super_admin'
  );
END;
$$;

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activity_log (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- =====================================================
-- 5. TRIGGERS FOR AUTOMATIC LOGGING
-- =====================================================

-- Trigger to update updated_at on admin_users
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. INITIAL DATA
-- =====================================================
-- You can manually insert first super admin after migration
-- INSERT INTO public.admin_users (user_id, role, created_by)
-- VALUES ('your-user-id-here', 'super_admin', 'your-user-id-here');

COMMENT ON TABLE public.admin_users IS 'Stores admin users with their roles for access control';
COMMENT ON TABLE public.activity_log IS 'Logs all user activities across the platform for audit and analytics';
COMMENT ON TABLE public.system_metrics IS 'Stores daily aggregated system metrics for dashboard';
COMMENT ON FUNCTION public.is_admin IS 'Helper function to check if a user has admin access';
COMMENT ON FUNCTION public.is_super_admin IS 'Helper function to check if a user has super admin access';
COMMENT ON FUNCTION public.log_activity IS 'Helper function to log user activities';

