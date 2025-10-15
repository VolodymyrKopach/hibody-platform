-- =============================================
-- Add Lesson Plan Storage Fields
-- =============================================
-- This migration adds fields to store lesson plan data in the database
-- for better integration with the slide information system.

-- Add lesson plan fields to lessons table
ALTER TABLE public.lessons 
ADD COLUMN lesson_plan JSONB DEFAULT '{}',
ADD COLUMN plan_metadata JSONB DEFAULT '{}';

-- Add plan data field to slides table for quick access to slide-specific plan information
ALTER TABLE public.slides 
ADD COLUMN plan_data JSONB DEFAULT '{}';

-- Add indexes for better query performance on JSONB fields
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_plan ON public.lessons USING GIN (lesson_plan);
CREATE INDEX IF NOT EXISTS idx_lessons_plan_metadata ON public.lessons USING GIN (plan_metadata);
CREATE INDEX IF NOT EXISTS idx_slides_plan_data ON public.slides USING GIN (plan_data);

-- Add comments for documentation
COMMENT ON COLUMN public.lessons.lesson_plan IS 'Complete parsed lesson plan in JSON format (ParsedLessonPlan structure)';
COMMENT ON COLUMN public.lessons.plan_metadata IS 'Lesson plan metadata including targetAudience, duration, and goal';
COMMENT ON COLUMN public.slides.plan_data IS 'Slide-specific data extracted from lesson plan for quick access';

-- Add check constraint to ensure plan_metadata has expected structure (optional)
ALTER TABLE public.lessons 
ADD CONSTRAINT check_plan_metadata_structure 
CHECK (
  plan_metadata IS NULL OR 
  (
    plan_metadata ? 'targetAudience' OR 
    plan_metadata ? 'duration' OR 
    plan_metadata ? 'goal'
  )
);

-- Update the updated_at trigger to include new columns
-- (This ensures updated_at is automatically set when lesson_plan or plan_metadata changes)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for lessons table
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure trigger exists for slides table  
DROP TRIGGER IF EXISTS update_slides_updated_at ON public.slides;
CREATE TRIGGER update_slides_updated_at 
    BEFORE UPDATE ON public.slides 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
