-- Function to safely increment generation count
CREATE OR REPLACE FUNCTION increment_generation_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    generation_count = COALESCE(generation_count, 0) + 1,
    last_generation_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_generation_count(UUID) TO authenticated;

