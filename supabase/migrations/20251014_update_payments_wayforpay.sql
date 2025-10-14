-- =============================================
-- Update Payments Table for WayForPay
-- Add WayForPay specific fields and subscription tracking
-- =============================================

-- Add new columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_system TEXT DEFAULT 'wayforpay',
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('free', 'professional', 'premium')),
ADD COLUMN IF NOT EXISTS generations_granted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wayforpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS wayforpay_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS raw_response JSONB,
ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payments_payment_system ON public.payments(payment_system);
CREATE INDEX IF NOT EXISTS idx_payments_plan_type ON public.payments(plan_type);
CREATE INDEX IF NOT EXISTS idx_payments_wayforpay_order ON public.payments(wayforpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_webhook_received ON public.payments(webhook_received_at);

-- =============================================
-- Subscriptions History Table
-- Track subscription changes over time
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  
  -- Subscription details
  previous_type TEXT,
  new_type TEXT NOT NULL,
  change_reason TEXT,
  -- Reasons: payment_received, trial_started, trial_ended, cancelled, refunded, upgraded, downgraded
  
  -- Generation limits
  previous_generations INTEGER DEFAULT 0,
  new_generations INTEGER DEFAULT 0,
  generations_added INTEGER DEFAULT 0,
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_payment_id ON public.subscription_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_new_type ON public.subscription_history(new_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON public.subscription_history(created_at DESC);

-- RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription history"
  ON public.subscription_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscription history"
  ON public.subscription_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "Admins have full access to subscription history"
  ON public.subscription_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- =============================================
-- Helper Functions for Payment Processing
-- =============================================

-- Function to process payment and update subscription
CREATE OR REPLACE FUNCTION process_payment_subscription(
  p_payment_id UUID,
  p_user_id UUID,
  p_plan_type TEXT,
  p_generations INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_current_type TEXT;
  v_current_generations INTEGER;
  v_new_generations INTEGER;
BEGIN
  -- Get current subscription type and generations
  SELECT 
    subscription_type,
    COALESCE(generation_count, 0)
  INTO 
    v_current_type,
    v_current_generations
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- Calculate new total generations
  v_new_generations := v_current_generations + p_generations;
  
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    subscription_type = p_plan_type,
    generation_count = v_new_generations,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record subscription history
  INSERT INTO public.subscription_history (
    user_id,
    payment_id,
    previous_type,
    new_type,
    change_reason,
    previous_generations,
    new_generations,
    generations_added
  ) VALUES (
    p_user_id,
    p_payment_id,
    v_current_type,
    p_plan_type,
    'payment_received',
    v_current_generations,
    v_new_generations,
    p_generations
  );
  
  -- Track activity
  PERFORM public.track_activity(
    p_user_id,
    'payment_succeeded',
    'payment',
    p_payment_id::TEXT,
    jsonb_build_object(
      'plan_type', p_plan_type,
      'generations_granted', p_generations,
      'total_generations', v_new_generations
    )
  );
  
  -- Track subscription change if type changed
  IF v_current_type != p_plan_type THEN
    PERFORM public.track_activity(
      p_user_id,
      'subscription_started',
      'subscription',
      NULL,
      jsonb_build_object(
        'from', v_current_type,
        'to', p_plan_type,
        'generations', p_generations
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle payment completion (trigger)
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Process subscription update
    PERFORM process_payment_subscription(
      NEW.id,
      NEW.user_id,
      NEW.plan_type,
      NEW.generations_granted
    );
    
    -- Mark as processed
    NEW.processed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic subscription processing
DROP TRIGGER IF EXISTS trigger_handle_payment_completion ON public.payments;

CREATE TRIGGER trigger_handle_payment_completion
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION handle_payment_completion();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.payments IS 'Payment transactions (WayForPay integration)';
COMMENT ON COLUMN public.payments.payment_system IS 'Payment system used (wayforpay, etc.)';
COMMENT ON COLUMN public.payments.plan_type IS 'Subscription plan type (free, professional, premium)';
COMMENT ON COLUMN public.payments.generations_granted IS 'Number of generations granted with this payment';
COMMENT ON COLUMN public.payments.wayforpay_order_id IS 'WayForPay order ID';
COMMENT ON COLUMN public.payments.raw_response IS 'Full WayForPay webhook response';

COMMENT ON TABLE public.subscription_history IS 'History of subscription changes';
COMMENT ON COLUMN public.subscription_history.change_reason IS 'Reason for subscription change';
COMMENT ON COLUMN public.subscription_history.generations_added IS 'Number of generations added in this change';

