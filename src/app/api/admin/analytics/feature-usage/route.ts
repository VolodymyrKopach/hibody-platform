/**
 * Admin Analytics API - Feature Usage
 * GET /api/admin/analytics/feature-usage
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

    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const features = [
      { action: 'lesson_created', name: 'Lesson Creation' },
      { action: 'slide_generated', name: 'Slide Generation' },
      { action: 'worksheet_created', name: 'Worksheet Creation' },
      { action: 'chat_message_sent', name: 'Chat Assistant' },
    ];

    const featureUsage = [];

    for (const feature of features) {
      const { data: actions } = await supabase
        .from('activity_log')
        .select('user_id')
        .eq('action', feature.action);

      const usageCount = actions?.length || 0;
      const uniqueUsers = new Set(actions?.map(a => a.user_id)).size;
      const adoptionRate = totalUsers && totalUsers > 0 
        ? (uniqueUsers / totalUsers) * 100 
        : 0;

      featureUsage.push({
        feature_name: feature.name,
        usage_count: usageCount,
        unique_users: uniqueUsers,
        avg_time_spent: 0, // TODO: Implement time tracking
        adoption_rate: Number(adoptionRate.toFixed(1)),
      });
    }

    return NextResponse.json(featureUsage);
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

