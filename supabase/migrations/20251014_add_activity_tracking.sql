-- =============================================
-- Add Activity Tracking to Existing activity_log
-- Only adds missing triggers and functions
-- =============================================

-- =============================================
-- Helper Function to track activity
-- =============================================

CREATE OR REPLACE FUNCTION public.track_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,  -- Changed from UUID to TEXT
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
    NEW.id::TEXT,  -- Cast UUID to TEXT
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

DROP TRIGGER IF EXISTS trigger_track_lesson_creation ON public.lessons;

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
    NEW.id::TEXT,  -- Cast UUID to TEXT
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

DROP TRIGGER IF EXISTS trigger_track_slide_generation ON public.slides;

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
    NEW.id::TEXT,  -- Cast UUID to TEXT
    jsonb_build_object(
      'type', NEW.type,
      'age_group', NEW.age_group,
      'title', NEW.title
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_worksheet_creation ON public.worksheets;

CREATE TRIGGER trigger_track_worksheet_creation
  AFTER INSERT ON public.worksheets
  FOR EACH ROW
  EXECUTE FUNCTION track_worksheet_creation();

-- =============================================
-- Comments
-- =============================================

COMMENT ON FUNCTION public.track_activity IS 'Helper function to track user activities';

