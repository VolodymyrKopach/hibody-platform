-- =============================================
-- Worksheets Table Migration
-- Create worksheets table for admin management
-- =============================================

CREATE TABLE IF NOT EXISTS public.worksheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'other' CHECK (type IN ('coloring', 'writing', 'math', 'reading', 'puzzle', 'drawing', 'other')),
  age_group TEXT NOT NULL,
  thumbnail_url TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER DEFAULT 0, -- size in bytes
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_worksheets_user_id ON public.worksheets(user_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_lesson_id ON public.worksheets(lesson_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_type ON public.worksheets(type);
CREATE INDEX IF NOT EXISTS idx_worksheets_age_group ON public.worksheets(age_group);
CREATE INDEX IF NOT EXISTS idx_worksheets_created_at ON public.worksheets(created_at DESC);

-- Enable RLS
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worksheets

-- Users can view their own worksheets
CREATE POLICY "Users can view own worksheets"
  ON public.worksheets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own worksheets
CREATE POLICY "Users can insert own worksheets"
  ON public.worksheets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own worksheets
CREATE POLICY "Users can update own worksheets"
  ON public.worksheets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own worksheets
CREATE POLICY "Users can delete own worksheets"
  ON public.worksheets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all worksheets
CREATE POLICY "Admins can view all worksheets"
  ON public.worksheets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can update all worksheets
CREATE POLICY "Admins can update all worksheets"
  ON public.worksheets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can delete all worksheets
CREATE POLICY "Admins can delete all worksheets"
  ON public.worksheets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create worksheet downloads tracking table
CREATE TABLE IF NOT EXISTS public.worksheet_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worksheet_downloads_worksheet_id ON public.worksheet_downloads(worksheet_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_downloads_user_id ON public.worksheet_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_downloads_downloaded_at ON public.worksheet_downloads(downloaded_at DESC);

-- Comment on tables
COMMENT ON TABLE public.worksheets IS 'Stores worksheet metadata and file references';
COMMENT ON TABLE public.worksheet_downloads IS 'Tracks worksheet downloads for analytics';

