-- =============================================
-- User Cohorts Table
-- Track user retention by registration cohort
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Cohort information
  cohort_date DATE NOT NULL, -- First day of month when user registered
  registration_date DATE NOT NULL,
  
  -- Key milestones
  first_lesson_date DATE,
  first_payment_date DATE,
  first_slide_date DATE,
  first_worksheet_date DATE,
  
  -- Time to milestones (in days)
  days_to_first_lesson INTEGER,
  days_to_first_payment INTEGER,
  days_to_first_slide INTEGER,
  days_to_first_worksheet INTEGER,
  
  -- Activity status
  is_active BOOLEAN DEFAULT true,
  last_activity_date DATE,
  
  -- Retention tracking
  active_day_1 BOOLEAN DEFAULT false,
  active_day_7 BOOLEAN DEFAULT false,
  active_day_14 BOOLEAN DEFAULT false,
  active_day_30 BOOLEAN DEFAULT false,
  active_day_60 BOOLEAN DEFAULT false,
  active_day_90 BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id)
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_user_cohorts_user_id ON public.user_cohorts(user_id);
CREATE INDEX idx_user_cohorts_cohort_date ON public.user_cohorts(cohort_date);
CREATE INDEX idx_user_cohorts_registration ON public.user_cohorts(registration_date);
CREATE INDEX idx_user_cohorts_is_active ON public.user_cohorts(is_active);
CREATE INDEX idx_user_cohorts_cohort_active ON public.user_cohorts(cohort_date, is_active);

-- For retention analysis
CREATE INDEX idx_user_cohorts_retention ON public.user_cohorts(cohort_date, active_day_30, active_day_60, active_day_90);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.user_cohorts ENABLE ROW LEVEL SECURITY;

-- Users can view their own cohort data
CREATE POLICY "Users can view own cohort data"
  ON public.user_cohorts
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage cohorts
CREATE POLICY "System can manage cohorts"
  ON public.user_cohorts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "Admins have full access to cohorts"
  ON public.user_cohorts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- =============================================
-- Helper Functions
-- =============================================

-- Function to create cohort entry for new user
CREATE OR REPLACE FUNCTION create_user_cohort()
RETURNS TRIGGER AS $$
DECLARE
  v_cohort_date DATE := DATE_TRUNC('month', NEW.created_at)::DATE;
BEGIN
  INSERT INTO public.user_cohorts (
    user_id,
    cohort_date,
    registration_date,
    last_activity_date
  ) VALUES (
    NEW.id,
    v_cohort_date,
    NEW.created_at::DATE,
    NEW.created_at::DATE
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create cohort on user registration
CREATE TRIGGER trigger_create_user_cohort
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_cohort();

-- Function to update cohort milestones
CREATE OR REPLACE FUNCTION update_cohort_milestones()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_registration_date DATE;
  v_action_date DATE := NEW.created_at::DATE;
  v_days_diff INTEGER;
BEGIN
  -- Get user_id from activity
  v_user_id := NEW.user_id;
  
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get registration date
  SELECT registration_date INTO v_registration_date
  FROM public.user_cohorts
  WHERE user_id = v_user_id;
  
  IF v_registration_date IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_days_diff := v_action_date - v_registration_date;
  
  -- Update based on action type
  CASE NEW.action
    WHEN 'lesson_created' THEN
      UPDATE public.user_cohorts
      SET 
        first_lesson_date = COALESCE(first_lesson_date, v_action_date),
        days_to_first_lesson = COALESCE(days_to_first_lesson, v_days_diff),
        last_activity_date = v_action_date,
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
    WHEN 'payment_succeeded' THEN
      UPDATE public.user_cohorts
      SET 
        first_payment_date = COALESCE(first_payment_date, v_action_date),
        days_to_first_payment = COALESCE(days_to_first_payment, v_days_diff),
        last_activity_date = v_action_date,
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
    WHEN 'slide_generated' THEN
      UPDATE public.user_cohorts
      SET 
        first_slide_date = COALESCE(first_slide_date, v_action_date),
        days_to_first_slide = COALESCE(days_to_first_slide, v_days_diff),
        last_activity_date = v_action_date,
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
    WHEN 'worksheet_created' THEN
      UPDATE public.user_cohorts
      SET 
        first_worksheet_date = COALESCE(first_worksheet_date, v_action_date),
        days_to_first_worksheet = COALESCE(days_to_first_worksheet, v_days_diff),
        last_activity_date = v_action_date,
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
    ELSE
      UPDATE public.user_cohorts
      SET 
        last_activity_date = v_action_date,
        updated_at = NOW()
      WHERE user_id = v_user_id;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cohort milestones from activity
CREATE TRIGGER trigger_update_cohort_milestones
  AFTER INSERT ON public.activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_milestones();

-- =============================================
-- Retention Calculation Functions
-- =============================================

-- Function to calculate retention for all cohorts
CREATE OR REPLACE FUNCTION calculate_retention()
RETURNS VOID AS $$
BEGIN
  -- Update Day 1 retention
  UPDATE public.user_cohorts
  SET 
    active_day_1 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE = user_cohorts.registration_date + INTERVAL '1 day'
    ),
    updated_at = NOW()
  WHERE active_day_1 IS NULL OR active_day_1 = false;
  
  -- Update Day 7 retention
  UPDATE public.user_cohorts
  SET 
    active_day_7 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE BETWEEN 
          user_cohorts.registration_date + INTERVAL '6 days' AND
          user_cohorts.registration_date + INTERVAL '8 days'
    ),
    updated_at = NOW()
  WHERE registration_date <= CURRENT_DATE - INTERVAL '7 days'
    AND (active_day_7 IS NULL OR active_day_7 = false);
  
  -- Update Day 14 retention
  UPDATE public.user_cohorts
  SET 
    active_day_14 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE BETWEEN 
          user_cohorts.registration_date + INTERVAL '13 days' AND
          user_cohorts.registration_date + INTERVAL '15 days'
    ),
    updated_at = NOW()
  WHERE registration_date <= CURRENT_DATE - INTERVAL '14 days'
    AND (active_day_14 IS NULL OR active_day_14 = false);
  
  -- Update Day 30 retention
  UPDATE public.user_cohorts
  SET 
    active_day_30 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE BETWEEN 
          user_cohorts.registration_date + INTERVAL '28 days' AND
          user_cohorts.registration_date + INTERVAL '32 days'
    ),
    updated_at = NOW()
  WHERE registration_date <= CURRENT_DATE - INTERVAL '30 days'
    AND (active_day_30 IS NULL OR active_day_30 = false);
  
  -- Update Day 60 retention
  UPDATE public.user_cohorts
  SET 
    active_day_60 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE BETWEEN 
          user_cohorts.registration_date + INTERVAL '58 days' AND
          user_cohorts.registration_date + INTERVAL '62 days'
    ),
    updated_at = NOW()
  WHERE registration_date <= CURRENT_DATE - INTERVAL '60 days'
    AND (active_day_60 IS NULL OR active_day_60 = false);
  
  -- Update Day 90 retention
  UPDATE public.user_cohorts
  SET 
    active_day_90 = EXISTS (
      SELECT 1 FROM public.activity_log
      WHERE activity_log.user_id = user_cohorts.user_id
        AND activity_log.created_at::DATE BETWEEN 
          user_cohorts.registration_date + INTERVAL '88 days' AND
          user_cohorts.registration_date + INTERVAL '92 days'
    ),
    updated_at = NOW()
  WHERE registration_date <= CURRENT_DATE - INTERVAL '90 days'
    AND (active_day_90 IS NULL OR active_day_90 = false);
  
  -- Update is_active status (active if had activity in last 30 days)
  UPDATE public.user_cohorts
  SET 
    is_active = (last_activity_date >= CURRENT_DATE - INTERVAL '30 days'),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.user_cohorts IS 'User cohort tracking for retention analysis';
COMMENT ON COLUMN public.user_cohorts.cohort_date IS 'First day of the month when user registered';
COMMENT ON COLUMN public.user_cohorts.days_to_first_lesson IS 'Number of days from registration to first lesson';
COMMENT ON COLUMN public.user_cohorts.days_to_first_payment IS 'Number of days from registration to first payment';
COMMENT ON COLUMN public.user_cohorts.active_day_30 IS 'Whether user was active around day 30 after registration';


