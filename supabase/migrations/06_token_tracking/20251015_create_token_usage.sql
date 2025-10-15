-- =============================================
-- Token Usage Table
-- Track token usage and costs for AI API calls
-- =============================================

CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Request details
  service_name TEXT NOT NULL, -- 'worksheet_generation', 'slide_editing', 'chat', etc.
  model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  
  -- Token counts
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  
  -- Cost calculation (will be calculated based on pricing table)
  input_cost DECIMAL(10, 6),
  output_cost DECIMAL(10, 6),
  total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (input_cost + output_cost) STORED,
  
  -- Metadata
  request_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX idx_token_usage_created_at ON public.token_usage(created_at DESC);
CREATE INDEX idx_token_usage_user_created ON public.token_usage(user_id, created_at DESC);
CREATE INDEX idx_token_usage_service ON public.token_usage(service_name);
CREATE INDEX idx_token_usage_model ON public.token_usage(model);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Admins can view all token usage
CREATE POLICY "Admins can view all token usage"
  ON public.token_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- System can insert token usage (no auth check for service operations)
CREATE POLICY "System can insert token usage"
  ON public.token_usage
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own token usage
CREATE POLICY "Users can view own token usage"
  ON public.token_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.token_usage IS 'Tracks token usage and costs for AI API calls';
COMMENT ON COLUMN public.token_usage.service_name IS 'Name of the service using AI (worksheet_generation, slide_editing, etc.)';
COMMENT ON COLUMN public.token_usage.model IS 'AI model used (gemini-2.5-flash, etc.)';
COMMENT ON COLUMN public.token_usage.input_tokens IS 'Number of input tokens used';
COMMENT ON COLUMN public.token_usage.output_tokens IS 'Number of output tokens generated';
COMMENT ON COLUMN public.token_usage.total_cost IS 'Total cost in USD for this request';

