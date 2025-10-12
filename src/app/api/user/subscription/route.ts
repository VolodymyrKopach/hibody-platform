import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/subscription
 * Get user subscription data including generation count and payment history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with subscription data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_type, subscription_expires_at, generation_count, last_generation_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Get payment history
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, order_reference, amount, currency, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      // Don't fail the request if payments fetch fails
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription_type: profile.subscription_type || 'free',
        subscription_expires_at: profile.subscription_expires_at,
        generation_count: profile.generation_count || 0,
        last_generation_at: profile.last_generation_at,
        payments: payments || [],
      },
    });

  } catch (error) {
    console.error('Subscription data error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

