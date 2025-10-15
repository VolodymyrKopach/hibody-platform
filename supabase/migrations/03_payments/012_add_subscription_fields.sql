-- Add subscription tracking fields to user_profiles table
-- Note: subscription_type and subscription_expires_at already exist
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS generation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_generation_count ON public.user_profiles(generation_count);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_type ON public.user_profiles(subscription_type);

-- Add comments
COMMENT ON COLUMN public.user_profiles.generation_count IS 'Total number of lessons generated';
COMMENT ON COLUMN public.user_profiles.last_generation_at IS 'Last lesson generation timestamp';
COMMENT ON COLUMN public.user_profiles.subscription_type IS 'Subscription type: free, pro, etc';
COMMENT ON COLUMN public.user_profiles.subscription_expires_at IS 'Subscription expiration date';

