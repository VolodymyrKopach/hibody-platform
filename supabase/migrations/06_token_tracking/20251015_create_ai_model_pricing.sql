-- =============================================
-- AI Model Pricing Table
-- Store pricing information for different AI models
-- =============================================

CREATE TABLE IF NOT EXISTS public.ai_model_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Model details
  provider TEXT NOT NULL, -- 'google', 'anthropic', 'openai', etc.
  model_name TEXT NOT NULL,
  
  -- Pricing per 1M tokens (in USD)
  input_price_per_1m DECIMAL(10, 6) NOT NULL,
  output_price_per_1m DECIMAL(10, 6) NOT NULL,
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider, model_name, valid_from)
);

-- =============================================
-- Insert Initial Pricing Data
-- =============================================

-- Gemini 2.5 Flash pricing (as of October 2024)
-- Source: https://ai.google.dev/pricing
INSERT INTO public.ai_model_pricing (provider, model_name, input_price_per_1m, output_price_per_1m)
VALUES ('google', 'gemini-2.5-flash', 0.075, 0.30)
ON CONFLICT (provider, model_name, valid_from) DO NOTHING;

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_ai_model_pricing_model ON public.ai_model_pricing(model_name);
CREATE INDEX idx_ai_model_pricing_active ON public.ai_model_pricing(is_active);
CREATE INDEX idx_ai_model_pricing_provider ON public.ai_model_pricing(provider);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.ai_model_pricing ENABLE ROW LEVEL SECURITY;

-- Everyone can view pricing
CREATE POLICY "Everyone can view pricing"
  ON public.ai_model_pricing
  FOR SELECT
  USING (true);

-- Only admins can manage pricing
CREATE POLICY "Only admins can manage pricing"
  ON public.ai_model_pricing
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- =============================================
-- Trigger for updated_at
-- =============================================

CREATE TRIGGER update_ai_model_pricing_updated_at
  BEFORE UPDATE ON public.ai_model_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.ai_model_pricing IS 'Pricing information for different AI models';
COMMENT ON COLUMN public.ai_model_pricing.provider IS 'AI provider (google, anthropic, openai, etc.)';
COMMENT ON COLUMN public.ai_model_pricing.model_name IS 'Model identifier (gemini-2.5-flash, etc.)';
COMMENT ON COLUMN public.ai_model_pricing.input_price_per_1m IS 'Price per 1 million input tokens in USD';
COMMENT ON COLUMN public.ai_model_pricing.output_price_per_1m IS 'Price per 1 million output tokens in USD';

