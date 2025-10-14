/**
 * Admin Analytics API - User Segments
 * GET /api/admin/analytics/segments
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

    // Get all users with stats
    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('id, subscription_type');

    const totalUsers = allUsers?.length || 1;

    // Count lessons per user
    const { data: lessonCounts } = await supabase
      .from('lessons')
      .select('user_id');

    const lessonMap = new Map<string, number>();
    lessonCounts?.forEach(l => {
      lessonMap.set(l.user_id, (lessonMap.get(l.user_id) || 0) + 1);
    });

    // Segment users
    const powerUsers = allUsers?.filter(u => (lessonMap.get(u.id) || 0) > 20) || [];
    const regularUsers = allUsers?.filter(u => {
      const count = lessonMap.get(u.id) || 0;
      return count >= 5 && count <= 20;
    }) || [];
    const occasionalUsers = allUsers?.filter(u => (lessonMap.get(u.id) || 0) < 5) || [];

    const segments = [
      {
        segment_name: 'Power Users',
        user_count: powerUsers.length,
        percentage: Number(((powerUsers.length / totalUsers) * 100).toFixed(1)),
        avg_revenue: 9, // Assuming professional subscription
        characteristics: {
          lessons_created: '> 20',
          engagement: 'high',
          subscription: 'professional',
        },
      },
      {
        segment_name: 'Regular Users',
        user_count: regularUsers.length,
        percentage: Number(((regularUsers.length / totalUsers) * 100).toFixed(1)),
        avg_revenue: 4.5,
        characteristics: {
          lessons_created: '5-20',
          engagement: 'medium',
          subscription: 'mixed',
        },
      },
      {
        segment_name: 'Occasional Users',
        user_count: occasionalUsers.length,
        percentage: Number(((occasionalUsers.length / totalUsers) * 100).toFixed(1)),
        avg_revenue: 0,
        characteristics: {
          lessons_created: '< 5',
          engagement: 'low',
          subscription: 'free',
        },
      },
    ];

    return NextResponse.json(segments);
  } catch (error) {
    console.error('Error fetching user segments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

