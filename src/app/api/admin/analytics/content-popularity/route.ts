/**
 * Admin Analytics API - Content Popularity
 * GET /api/admin/analytics/content-popularity
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

    // Get popular subjects
    const { data: lessons } = await supabase
      .from('lessons')
      .select('subject, age_group, created_at');

    const subjectMap = new Map<string, { count: number; oldCount: number }>();
    const ageGroupMap = new Map<string, { count: number; oldCount: number }>();

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    lessons?.forEach(lesson => {
      const lessonDate = new Date(lesson.created_at);
      const isRecent = lessonDate >= last30Days;
      const isPrevious = lessonDate >= last60Days && lessonDate < last30Days;

      // Track subjects
      const subjectData = subjectMap.get(lesson.subject) || { count: 0, oldCount: 0 };
      if (isRecent) subjectData.count++;
      if (isPrevious) subjectData.oldCount++;
      subjectMap.set(lesson.subject, subjectData);

      // Track age groups
      const ageData = ageGroupMap.get(lesson.age_group) || { count: 0, oldCount: 0 };
      if (isRecent) ageData.count++;
      if (isPrevious) ageData.oldCount++;
      ageGroupMap.set(lesson.age_group, ageData);
    });

    // Calculate growth rates and format
    const popularSubjects = Array.from(subjectMap.entries())
      .map(([subject, data]) => {
        const growthRate = data.oldCount > 0 
          ? ((data.count - data.oldCount) / data.oldCount) * 100 
          : 0;
        return {
          subject,
          count: data.count,
          growth_rate: Number(growthRate.toFixed(1)),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const popularAgeGroups = Array.from(ageGroupMap.entries())
      .map(([age_group, data]) => {
        const growthRate = data.oldCount > 0 
          ? ((data.count - data.oldCount) / data.oldCount) * 100 
          : 0;
        return {
          age_group,
          count: data.count,
          growth_rate: Number(growthRate.toFixed(1)),
        };
      })
      .sort((a, b) => b.count - a.count);

    // Peak usage hours (simplified - based on activity log)
    const { data: hourlyActivity } = await supabase
      .from('activity_log')
      .select('created_at')
      .gte('created_at', last30Days.toISOString());

    const hourMap = new Map<number, number>();
    hourlyActivity?.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const peakUsageHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      usage_count: hourMap.get(hour) || 0,
    }));

    return NextResponse.json({
      popular_subjects: popularSubjects,
      popular_age_groups: popularAgeGroups,
      popular_templates: [], // TODO: Implement template tracking
      peak_usage_hours: peakUsageHours,
      peak_usage_days: [], // TODO: Implement day tracking
    });
  } catch (error) {
    console.error('Error fetching content popularity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

