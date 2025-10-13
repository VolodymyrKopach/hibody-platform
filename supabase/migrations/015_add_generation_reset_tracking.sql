-- Add generation reset tracking to user_profiles
-- This allows us to track when the last reset happened for Pro users

-- Add last_generation_reset column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS last_generation_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_reset 
ON public.user_profiles(last_generation_reset);

-- Create index for finding users needing reset
CREATE INDEX IF NOT EXISTS idx_user_profiles_pro_reset 
ON public.user_profiles(subscription_type, last_generation_reset)
WHERE subscription_type = 'pro';

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.last_generation_reset IS 
'Timestamp of the last generation counter reset for Pro users. Used for monthly limit resets.';

-- Set initial value for existing Pro users
UPDATE public.user_profiles
SET last_generation_reset = NOW()
WHERE subscription_type = 'pro' AND last_generation_reset IS NULL;

