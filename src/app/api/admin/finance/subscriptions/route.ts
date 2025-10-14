/**
 * Admin Finance API - Subscription Metrics
 * GET /api/admin/finance/subscriptions
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

    // Get subscription counts by type
    const { data: subscriptionCounts } = await supabase
      .from('user_profiles')
      .select('subscription_type');

    // Calculate totals
    let totalFree = 0;
    let totalProfessional = 0;
    let totalPremium = 0;

    subscriptionCounts?.forEach((user) => {
      switch (user.subscription_type) {
        case 'free':
          totalFree++;
          break;
        case 'professional':
          totalProfessional++;
          break;
        case 'premium':
          totalPremium++;
          break;
      }
    });

    const totalActive = totalProfessional + totalPremium;

    // Calculate MRR by plan (using pricing constants)
    const PROFESSIONAL_PRICE = 9; // From SUBSCRIPTION_PRICES
    const PREMIUM_PRICE = 19; // From SUBSCRIPTION_PRICES - TBD
    const professionalMrr = totalProfessional * PROFESSIONAL_PRICE;
    const premiumMrr = totalPremium * PREMIUM_PRICE;

    // Get cancelled subscriptions
    const { data: cancelledSubs } = await supabase
      .from('activity_log')
      .select('user_id, created_at')
      .eq('action', 'subscription_cancelled');

    const totalCancelled = cancelledSubs?.length || 0;

    // No past due tracking in MVP (no recurring payments yet)
    const totalPastDue = 0;

    // By plan breakdown
    const byPlan = [
      {
        plan: 'Free',
        count: totalFree,
        mrr: 0,
      },
      {
        plan: 'Professional',
        count: totalProfessional,
        mrr: professionalMrr,
      },
      {
        plan: 'Premium',
        count: totalPremium,
        mrr: premiumMrr,
      },
    ];

    // Get upcoming renewals (empty for now - no recurring billing in MVP)
    const upcomingRenewals: any[] = [];

    // Get expiring trials (empty for now - no trials in MVP)
    const expiringTrials: any[] = [];

    const metrics = {
      total_active: totalActive,
      total_trial: 0, // No trials in MVP
      total_cancelled: totalCancelled,
      total_past_due: totalPastDue,
      by_plan: byPlan,
      upcoming_renewals: upcomingRenewals,
      expiring_trials: expiringTrials,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching subscription metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

