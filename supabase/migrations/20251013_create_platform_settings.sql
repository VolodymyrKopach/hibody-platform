-- =============================================
-- Platform Settings Table
-- Global platform configuration
-- =============================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Setting identification
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('boolean', 'string', 'number', 'json', 'array')),
  
  -- Metadata
  category TEXT DEFAULT 'general',
  -- Categories: general, ai, limits, features, monetization, email, security
  
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be read by non-admin users
  
  -- Audit
  updated_by UUID REFERENCES public.user_profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_platform_settings_key ON public.platform_settings(setting_key);
CREATE INDEX idx_platform_settings_category ON public.platform_settings(category);
CREATE INDEX idx_platform_settings_is_public ON public.platform_settings(is_public);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Public settings can be read by anyone
CREATE POLICY "Anyone can read public settings"
  ON public.platform_settings
  FOR SELECT
  USING (is_public = true);

-- Admins have full access
CREATE POLICY "Admins have full access to settings"
  ON public.platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get setting value
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT setting_value INTO v_value
  FROM public.platform_settings
  WHERE setting_key = p_key;
  
  RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set setting value
CREATE OR REPLACE FUNCTION set_setting(
  p_key TEXT,
  p_value JSONB,
  p_type TEXT,
  p_category TEXT DEFAULT 'general',
  p_description TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_admin_id UUID := auth.uid();
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = v_admin_id
  ) THEN
    RAISE EXCEPTION 'Only admins can modify settings';
  END IF;
  
  INSERT INTO public.platform_settings (
    setting_key,
    setting_value,
    setting_type,
    category,
    description,
    is_public,
    updated_by
  ) VALUES (
    p_key,
    p_value,
    p_type,
    p_category,
    p_description,
    p_is_public,
    v_admin_id
  )
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public,
    updated_by = v_admin_id,
    updated_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Insert Default Settings
-- =============================================

-- General Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode', false),
  ('registration_enabled', 'true', 'boolean', 'general', 'Allow new user registrations', true),
  ('platform_name', '"TeachSpark"', 'string', 'general', 'Platform name', true),
  ('support_email', '"support@teachspark.com"', 'string', 'general', 'Support contact email', true)
ON CONFLICT (setting_key) DO NOTHING;

-- AI Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('ai_generation_enabled', 'true', 'boolean', 'ai', 'Enable AI content generation', false),
  ('default_ai_model', '"claude-3-sonnet"', 'string', 'ai', 'Default AI model for generation', false),
  ('available_ai_models', '["claude-3-sonnet", "claude-3-opus", "gpt-4", "gpt-3.5-turbo"]', 'array', 'ai', 'Available AI models', false),
  ('ai_max_tokens', '4000', 'number', 'ai', 'Maximum tokens per AI request', false),
  ('ai_temperature', '0.7', 'number', 'ai', 'AI temperature setting', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Generation Limits
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('free_generation_limit', '3', 'number', 'limits', 'Free plan generation limit', true),
  ('pro_generation_limit', '20', 'number', 'limits', 'Professional plan generation limit', true),
  ('pro_plan_price', '9', 'number', 'limits', 'Professional plan price in USD', true),
  ('max_generation_limit', '100', 'number', 'limits', 'Maximum generation limit per user', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Feature Flags
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('feature_chat_enabled', 'true', 'boolean', 'features', 'Enable chat feature', true),
  ('feature_worksheets_enabled', 'true', 'boolean', 'features', 'Enable worksheets feature', true),
  ('feature_slide_editing_enabled', 'true', 'boolean', 'features', 'Enable slide editing', true),
  ('feature_batch_generation_enabled', 'true', 'boolean', 'features', 'Enable batch generation', true),
  ('feature_public_lessons_enabled', 'true', 'boolean', 'features', 'Enable public lesson sharing', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Monetization Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('payment_system', '"wayforpay"', 'string', 'monetization', 'Payment system provider', false),
  ('currency', '"USD"', 'string', 'monetization', 'Default currency', true),
  ('trial_period_days', '0', 'number', 'monetization', 'Trial period in days (0 = no trial)', false),
  ('allow_refunds', 'true', 'boolean', 'monetization', 'Allow payment refunds', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Email Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('email_enabled', 'true', 'boolean', 'email', 'Enable email notifications', false),
  ('email_from_address', '"noreply@teachspark.com"', 'string', 'email', 'From email address', false),
  ('email_from_name', '"TeachSpark"', 'string', 'email', 'From email name', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Security Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes', false),
  ('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout', false),
  ('password_min_length', '8', 'number', 'security', 'Minimum password length', true),
  ('require_email_verification', 'true', 'boolean', 'security', 'Require email verification', true)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- Trigger for updated_at
-- =============================================

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.platform_settings IS 'Global platform configuration settings';
COMMENT ON COLUMN public.platform_settings.setting_key IS 'Unique key identifier for the setting';
COMMENT ON COLUMN public.platform_settings.setting_value IS 'Value stored as JSONB for flexibility';
COMMENT ON COLUMN public.platform_settings.setting_type IS 'Type of the setting value';
COMMENT ON COLUMN public.platform_settings.is_public IS 'Whether non-admin users can read this setting';
COMMENT ON COLUMN public.platform_settings.updated_by IS 'Admin user who last updated this setting';


