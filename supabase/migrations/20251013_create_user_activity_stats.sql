-- =============================================
-- User Activity Stats Table
-- Pre-calculated daily/weekly/monthly statistics
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Period
  date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- Activity counts
  lessons_created INTEGER DEFAULT 0,
  slides_generated INTEGER DEFAULT 0,
  worksheets_created INTEGER DEFAULT 0,
  chat_messages_sent INTEGER DEFAULT 0,
  ai_requests_made INTEGER DEFAULT 0,
  
  -- Engagement
  sessions_count INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  
  -- First/Last activity
  first_activity_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, date, period_type)
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_user_activity_stats_user_id ON public.user_activity_stats(user_id);
CREATE INDEX idx_user_activity_stats_date ON public.user_activity_stats(date DESC);
CREATE INDEX idx_user_activity_stats_period ON public.user_activity_stats(period_type);
CREATE INDEX idx_user_activity_stats_user_period ON public.user_activity_stats(user_id, period_type, date DESC);

-- For analytics queries
CREATE INDEX idx_user_activity_stats_created_at ON public.user_activity_stats(date, lessons_created);
CREATE INDEX idx_user_activity_stats_engagement ON public.user_activity_stats(date, actions_count);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.user_activity_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY "Users can view own activity stats"
  ON public.user_activity_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage stats
CREATE POLICY "System can manage activity stats"
  ON public.user_activity_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "Admins have full access to activity stats"
  ON public.user_activity_stats
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

-- Function to increment daily stats
CREATE OR REPLACE FUNCTION public.increment_user_stats(
  p_user_id UUID,
  p_action TEXT,
  p_increment_value INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_column_name TEXT;
BEGIN
  -- Map action to column name
  v_column_name := CASE p_action
    WHEN 'lesson_created' THEN 'lessons_created'
    WHEN 'slide_generated' THEN 'slides_generated'
    WHEN 'worksheet_created' THEN 'worksheets_created'
    WHEN 'chat_message_sent' THEN 'chat_messages_sent'
    WHEN 'ai_request_completed' THEN 'ai_requests_made'
    ELSE NULL
  END;
  
  IF v_column_name IS NULL THEN
    RETURN;
  END IF;
  
  -- Insert or update daily stats
  INSERT INTO public.user_activity_stats (
    user_id,
    date,
    period_type,
    lessons_created,
    slides_generated,
    worksheets_created,
    chat_messages_sent,
    ai_requests_made,
    actions_count,
    last_activity_at
  ) VALUES (
    p_user_id,
    v_today,
    'daily',
    CASE WHEN v_column_name = 'lessons_created' THEN p_increment_value ELSE 0 END,
    CASE WHEN v_column_name = 'slides_generated' THEN p_increment_value ELSE 0 END,
    CASE WHEN v_column_name = 'worksheets_created' THEN p_increment_value ELSE 0 END,
    CASE WHEN v_column_name = 'chat_messages_sent' THEN p_increment_value ELSE 0 END,
    CASE WHEN v_column_name = 'ai_requests_made' THEN p_increment_value ELSE 0 END,
    1,
    NOW()
  )
  ON CONFLICT (user_id, date, period_type)
  DO UPDATE SET
    lessons_created = public.user_activity_stats.lessons_created + 
      CASE WHEN v_column_name = 'lessons_created' THEN p_increment_value ELSE 0 END,
    slides_generated = public.user_activity_stats.slides_generated + 
      CASE WHEN v_column_name = 'slides_generated' THEN p_increment_value ELSE 0 END,
    worksheets_created = public.user_activity_stats.worksheets_created + 
      CASE WHEN v_column_name = 'worksheets_created' THEN p_increment_value ELSE 0 END,
    chat_messages_sent = public.user_activity_stats.chat_messages_sent + 
      CASE WHEN v_column_name = 'chat_messages_sent' THEN p_increment_value ELSE 0 END,
    ai_requests_made = public.user_activity_stats.ai_requests_made + 
      CASE WHEN v_column_name = 'ai_requests_made' THEN p_increment_value ELSE 0 END,
    actions_count = public.user_activity_stats.actions_count + 1,
    last_activity_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update stats from activity_log
CREATE OR REPLACE FUNCTION update_user_stats_from_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    PERFORM public.increment_user_stats(NEW.user_id, NEW.action, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON public.activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_activity();

-- =============================================
-- Aggregation Functions
-- =============================================

-- Function to aggregate weekly stats (run weekly)
CREATE OR REPLACE FUNCTION aggregate_weekly_stats()
RETURNS VOID AS $$
DECLARE
  v_week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_week_end DATE := v_week_start + INTERVAL '6 days';
BEGIN
  INSERT INTO public.user_activity_stats (
    user_id,
    date,
    period_type,
    lessons_created,
    slides_generated,
    worksheets_created,
    chat_messages_sent,
    ai_requests_made,
    sessions_count,
    time_spent_minutes,
    actions_count,
    first_activity_at,
    last_activity_at
  )
  SELECT
    user_id,
    v_week_start,
    'weekly',
    SUM(lessons_created),
    SUM(slides_generated),
    SUM(worksheets_created),
    SUM(chat_messages_sent),
    SUM(ai_requests_made),
    SUM(sessions_count),
    SUM(time_spent_minutes),
    SUM(actions_count),
    MIN(first_activity_at),
    MAX(last_activity_at)
  FROM public.user_activity_stats
  WHERE period_type = 'daily'
    AND date >= v_week_start
    AND date <= v_week_end
  GROUP BY user_id
  ON CONFLICT (user_id, date, period_type)
  DO UPDATE SET
    lessons_created = EXCLUDED.lessons_created,
    slides_generated = EXCLUDED.slides_generated,
    worksheets_created = EXCLUDED.worksheets_created,
    chat_messages_sent = EXCLUDED.chat_messages_sent,
    ai_requests_made = EXCLUDED.ai_requests_made,
    sessions_count = EXCLUDED.sessions_count,
    time_spent_minutes = EXCLUDED.time_spent_minutes,
    actions_count = EXCLUDED.actions_count,
    first_activity_at = EXCLUDED.first_activity_at,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate monthly stats (run daily)
CREATE OR REPLACE FUNCTION aggregate_monthly_stats()
RETURNS VOID AS $$
DECLARE
  v_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_month_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
BEGIN
  INSERT INTO public.user_activity_stats (
    user_id,
    date,
    period_type,
    lessons_created,
    slides_generated,
    worksheets_created,
    chat_messages_sent,
    ai_requests_made,
    sessions_count,
    time_spent_minutes,
    actions_count,
    first_activity_at,
    last_activity_at
  )
  SELECT
    user_id,
    v_month_start,
    'monthly',
    SUM(lessons_created),
    SUM(slides_generated),
    SUM(worksheets_created),
    SUM(chat_messages_sent),
    SUM(ai_requests_made),
    SUM(sessions_count),
    SUM(time_spent_minutes),
    SUM(actions_count),
    MIN(first_activity_at),
    MAX(last_activity_at)
  FROM public.user_activity_stats
  WHERE period_type = 'daily'
    AND date >= v_month_start
    AND date <= v_month_end
  GROUP BY user_id
  ON CONFLICT (user_id, date, period_type)
  DO UPDATE SET
    lessons_created = EXCLUDED.lessons_created,
    slides_generated = EXCLUDED.slides_generated,
    worksheets_created = EXCLUDED.worksheets_created,
    chat_messages_sent = EXCLUDED.chat_messages_sent,
    ai_requests_made = EXCLUDED.ai_requests_made,
    sessions_count = EXCLUDED.sessions_count,
    time_spent_minutes = EXCLUDED.time_spent_minutes,
    actions_count = EXCLUDED.actions_count,
    first_activity_at = EXCLUDED.first_activity_at,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.user_activity_stats IS 'Pre-calculated user activity statistics for performance';
COMMENT ON COLUMN public.user_activity_stats.period_type IS 'Period type: daily, weekly, or monthly';
COMMENT ON COLUMN public.user_activity_stats.date IS 'Start date of the period';
COMMENT ON COLUMN public.user_activity_stats.time_spent_minutes IS 'Total time spent in the platform (minutes)';


