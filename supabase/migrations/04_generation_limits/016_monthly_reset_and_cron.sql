-- Monthly generation counter reset for Pro users
-- This migration creates a function and cron job to automatically reset generation counts

-- ============================================
-- Function: reset_pro_generation_counts
-- ============================================
-- Resets generation_count to 0 for Pro users whose last reset was more than 1 month ago
CREATE OR REPLACE FUNCTION reset_pro_generation_counts()
RETURNS TABLE (
  reset_count INTEGER,
  affected_users TEXT[]
) AS $$
DECLARE
  reset_count INTEGER;
  affected_users TEXT[];
BEGIN
  -- Update Pro users who need reset
  WITH updated AS (
    UPDATE public.user_profiles
    SET 
      generation_count = 0,
      last_generation_reset = NOW(),
      updated_at = NOW()
    WHERE 
      subscription_type = 'pro'
      AND subscription_expires_at > NOW()  -- Only active subscriptions
      AND (
        last_generation_reset IS NULL  -- Never reset before
        OR last_generation_reset < (NOW() - INTERVAL '1 month')  -- Last reset > 1 month ago
      )
    RETURNING id, email
  )
  SELECT 
    COUNT(*)::INTEGER,
    ARRAY_AGG(email::TEXT)
  INTO reset_count, affected_users
  FROM updated;
  
  -- Log the reset
  RAISE NOTICE 'Generation counter reset completed: % users affected', reset_count;
  
  IF reset_count > 0 THEN
    RAISE NOTICE 'Affected users: %', affected_users;
  END IF;
  
  RETURN QUERY SELECT reset_count, affected_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for manual testing)
GRANT EXECUTE ON FUNCTION reset_pro_generation_counts() TO authenticated;

-- Add comment
COMMENT ON FUNCTION reset_pro_generation_counts() IS 
'Resets generation_count to 0 for all Pro users with active subscriptions at the start of each month. Returns the count of affected users and their emails.';

-- ============================================
-- Function: downgrade_expired_subscriptions
-- ============================================
-- Automatically downgrades expired Pro subscriptions to Free tier
CREATE OR REPLACE FUNCTION downgrade_expired_subscriptions()
RETURNS TABLE (
  downgraded_count INTEGER,
  affected_users TEXT[]
) AS $$
DECLARE
  downgraded_count INTEGER;
  affected_users TEXT[];
BEGIN
  -- Downgrade expired Pro subscriptions
  WITH downgraded AS (
    UPDATE public.user_profiles
    SET 
      subscription_type = 'free',
      generation_count = LEAST(generation_count, 3),  -- Cap at free tier limit
      updated_at = NOW()
    WHERE 
      subscription_type = 'pro'
      AND subscription_expires_at IS NOT NULL
      AND subscription_expires_at < NOW()  -- Expired
    RETURNING id, email
  )
  SELECT 
    COUNT(*)::INTEGER,
    ARRAY_AGG(email::TEXT)
  INTO downgraded_count, affected_users
  FROM downgraded;
  
  -- Log the downgrade
  RAISE NOTICE 'Subscription downgrade completed: % users affected', downgraded_count;
  
  IF downgraded_count > 0 THEN
    RAISE NOTICE 'Downgraded users: %', affected_users;
  END IF;
  
  RETURN QUERY SELECT downgraded_count, affected_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION downgrade_expired_subscriptions() TO authenticated;

-- Add comment
COMMENT ON FUNCTION downgrade_expired_subscriptions() IS 
'Downgrades expired Pro subscriptions to Free tier and caps their generation count at 3. Returns the count of affected users and their emails.';

-- ============================================
-- Setup pg_cron Extension (if not already enabled)
-- ============================================
-- Note: pg_cron may need to be enabled by Supabase support
-- You can check if it's available with: SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Enable pg_cron extension (may require superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- Cron Job: Monthly Generation Reset
-- ============================================
-- Runs on the 1st day of every month at 00:00 UTC
SELECT cron.schedule(
  'reset-pro-generations-monthly',           -- Job name
  '0 0 1 * *',                                -- Cron expression: At 00:00 on day 1 of every month
  $$SELECT reset_pro_generation_counts()$$   -- SQL command to execute
);

-- Add comment about the cron job
COMMENT ON EXTENSION pg_cron IS 
'Cron job scheduler. Job "reset-pro-generations-monthly" runs monthly to reset Pro user generation counts.';

-- ============================================
-- Cron Job: Daily Subscription Downgrade Check
-- ============================================
-- Runs every day at 01:00 UTC to check for expired subscriptions
SELECT cron.schedule(
  'downgrade-expired-subscriptions-daily',      -- Job name
  '0 1 * * *',                                   -- Cron expression: At 01:00 every day
  $$SELECT downgrade_expired_subscriptions()$$  -- SQL command to execute
);

-- ============================================
-- Helper: View Scheduled Cron Jobs
-- ============================================
-- Run this query to see all scheduled cron jobs:
-- SELECT * FROM cron.job WHERE jobname LIKE '%generation%' OR jobname LIKE '%subscription%';

-- ============================================
-- Helper: Unschedule Cron Jobs (if needed)
-- ============================================
-- To remove cron jobs, run:
-- SELECT cron.unschedule('reset-pro-generations-monthly');
-- SELECT cron.unschedule('downgrade-expired-subscriptions-daily');

-- ============================================
-- Manual Testing Commands
-- ============================================
-- Test monthly reset (returns affected users):
-- SELECT * FROM reset_pro_generation_counts();

-- Test subscription downgrade (returns downgraded users):
-- SELECT * FROM downgrade_expired_subscriptions();

-- Check last reset times:
-- SELECT email, subscription_type, generation_count, last_generation_reset, subscription_expires_at
-- FROM user_profiles 
-- WHERE subscription_type = 'pro'
-- ORDER BY last_generation_reset DESC;

