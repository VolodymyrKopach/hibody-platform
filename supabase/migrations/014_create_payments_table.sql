-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  product_name TEXT,
  transaction_id TEXT,
  card_pan TEXT,
  reason_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_reference ON public.payments(order_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update payments"
  ON public.payments
  FOR UPDATE
  USING (true);

-- Add comments
COMMENT ON TABLE public.payments IS 'Payment transactions and subscriptions';
COMMENT ON COLUMN public.payments.order_reference IS 'Unique order reference from payment gateway';
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN public.payments.transaction_id IS 'Transaction ID from payment gateway';

