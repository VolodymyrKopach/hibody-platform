-- =============================================
-- Activity Log Table
-- Track all user actions for analytics and audit
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL,
  -- Actions: lesson_created, lesson_updated, lesson_deleted,
  --          slide_generated, slide_updated, slide_deleted,
  --          worksheet_created, worksheet_updated, worksheet_deleted,
  --          payment_succeeded, payment_failed,
  --          subscription_started, subscription_cancelled, subscription_renewed,
  --          login, logout, registration,
  --          chat_message_sent, ai_request_completed
  
  -- Entity reference
  entity_type TEXT,
  -- Types: lesson, slide, worksheet, payment, subscription, chat_session, user
  entity_id UUID,
  
  -- Additional context
  metadata JSONB DEFAULT '{}',
  -- Examples:
  -- For payments: {amount: 900, currency: 'USD', plan: 'professional', generations: 20}
  -- For lessons: {subject: 'Math', age_group: '8-10', duration: 45}
  -- For AI: {model: 'claude-3-sonnet', tokens_used: 1500, response_time_ms: 2300}
  
  -- Request info
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Primary queries
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_action ON public.activity_log(action);
CREATE INDEX idx_activity_log_entity_type ON public.activity_log(entity_type);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_activity_log_user_created ON public.activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_action_created ON public.activity_log(action, created_at DESC);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- Analytics queries
CREATE INDEX idx_activity_log_user_action ON public.activity_log(user_id, action);
CREATE INDEX idx_activity_log_created_date ON public.activity_log(DATE(created_at));

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity log"
  ON public.activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "Admins have full access to activity log"
  ON public.activity_log
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

-- Function to track activity (can be called from other triggers/functions)
CREATE OR REPLACE FUNCTION public.track_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
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
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Auto-track lesson creation
-- =============================================

CREATE OR REPLACE FUNCTION track_lesson_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.track_activity(
    NEW.user_id,
    'lesson_created',
    'lesson',
    NEW.id,
    jsonb_build_object(
      'subject', NEW.subject,
      'age_group', NEW.age_group,
      'duration', NEW.duration,
      'title', NEW.title
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_lesson_creation
  AFTER INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION track_lesson_creation();

-- =============================================
-- Auto-track slide generation
-- =============================================

CREATE OR REPLACE FUNCTION track_slide_generation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.track_activity(
    (SELECT user_id FROM public.lessons WHERE id = NEW.lesson_id),
    'slide_generated',
    'slide',
    NEW.id,
    jsonb_build_object(
      'lesson_id', NEW.lesson_id,
      'type', NEW.type,
      'title', NEW.title,
      'slide_number', NEW.slide_number
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_slide_generation
  AFTER INSERT ON public.slides
  FOR EACH ROW
  EXECUTE FUNCTION track_slide_generation();

-- =============================================
-- Auto-track worksheet creation
-- =============================================

CREATE OR REPLACE FUNCTION track_worksheet_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.track_activity(
    NEW.user_id,
    'worksheet_created',
    'worksheet',
    NEW.id,
    jsonb_build_object(
      'type', NEW.type,
      'age_group', NEW.age_group,
      'title', NEW.title
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_worksheet_creation
  AFTER INSERT ON public.worksheets
  FOR EACH ROW
  EXECUTE FUNCTION track_worksheet_creation();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.activity_log IS 'Tracks all user actions for analytics and audit purposes';
COMMENT ON COLUMN public.activity_log.action IS 'Type of action performed';
COMMENT ON COLUMN public.activity_log.entity_type IS 'Type of entity the action was performed on';
COMMENT ON COLUMN public.activity_log.entity_id IS 'ID of the entity the action was performed on';
COMMENT ON COLUMN public.activity_log.metadata IS 'Additional context and data about the action (JSON)';
COMMENT ON COLUMN public.activity_log.ip_address IS 'IP address of the request';
COMMENT ON COLUMN public.activity_log.user_agent IS 'User agent string from the request';


