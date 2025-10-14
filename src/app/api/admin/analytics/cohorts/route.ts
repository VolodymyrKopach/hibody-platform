/**
 * Admin Analytics API - Cohort Analysis
 * GET /api/admin/analytics/cohorts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Get cohort data from last 6 months
    const cohorts = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const cohortDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const cohortDateStr = cohortDate.toISOString().split('T')[0];

      // Get cohort stats
      const { data: cohortUsers } = await supabase
        .from('user_cohorts')
        .select('*')
        .eq('cohort_date', cohortDateStr);

      const cohortSize = cohortUsers?.length || 0;

      if (cohortSize > 0) {
        const retentionRates = {
          day_1: calculateRetention(cohortUsers, 'active_day_1'),
          day_7: calculateRetention(cohortUsers, 'active_day_7'),
          day_14: calculateRetention(cohortUsers, 'active_day_14'),
          day_30: calculateRetention(cohortUsers, 'active_day_30'),
          day_60: calculateRetention(cohortUsers, 'active_day_60'),
          day_90: calculateRetention(cohortUsers, 'active_day_90'),
        };

        cohorts.push({
          cohort_date: cohortDateStr,
          cohort_size: cohortSize,
          retention_rates: retentionRates,
        });
      }
    }

    return NextResponse.json(cohorts);
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateRetention(users: any[], field: string): number {
  if (!users || users.length === 0) return 0;
  const activeCount = users.filter(u => u[field] === true).length;
  return Number(((activeCount / users.length) * 100).toFixed(1));
}

