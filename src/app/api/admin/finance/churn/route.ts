/**
 * Admin Finance API - Churn Metrics
 * GET /api/admin/finance/churn
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get subscription cancellations from activity log
    const { data: cancellations30d } = await supabase
      .from('activity_log')
      .select('user_id, metadata')
      .eq('action', 'subscription_cancelled')
      .gte('created_at', last30Days.toISOString());

    const { data: cancellations7d } = await supabase
      .from('activity_log')
      .select('user_id, metadata')
      .eq('action', 'subscription_cancelled')
      .gte('created_at', last7Days.toISOString());

    // Get total active subscribers at start of period
    const { count: totalSubscribers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_type', 'professional');

    // Calculate churn rates
    const churned30d = cancellations30d?.length || 0;
    const churned7d = cancellations7d?.length || 0;
    const activeSubscribers = totalSubscribers || 1; // Avoid division by zero

    const churnRate30d = (churned30d / activeSubscribers) * 100;
    const churnRate7d = (churned7d / activeSubscribers) * 100;

    // Calculate revenue lost (assuming $9 per churned customer)
    const revenueLost30d = churned30d * 9;

    // Get churn reasons from metadata
    const churnByReason: Array<{ reason: string; count: number }> = [];
    const reasonMap = new Map<string, number>();

    cancellations30d?.forEach((cancellation) => {
      const reason = cancellation.metadata?.reason || 'Unknown';
      const current = reasonMap.get(reason) || 0;
      reasonMap.set(reason, current + 1);
    });

    reasonMap.forEach((count, reason) => {
      churnByReason.push({ reason, count });
    });

    // Sort by count descending
    churnByReason.sort((a, b) => b.count - a.count);

    const metrics = {
      churn_rate_30d: Number(churnRate30d.toFixed(1)),
      churn_rate_7d: Number(churnRate7d.toFixed(1)),
      churned_customers_30d: churned30d,
      revenue_lost_30d: revenueLost30d,
      churn_by_reason: churnByReason,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching churn metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

