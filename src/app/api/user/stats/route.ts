import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Function to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user;
}

// GET /api/user/stats - get user statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();

    // Get lesson count
    const { count: lessonsCount, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (lessonsError) {
      console.error('Error counting lessons:', lessonsError);
    }

    // Get slide count via JOIN
    const { count: slidesCount, error: slidesError } = await supabase
      .from('slides')
      .select(`
        *,
        lessons!inner(id)
      `, { count: 'exact', head: true })
      .eq('lessons.user_id', user.id);

    // Alternative query for slides (if the first one doesn't work)
    let totalSlides = 0;
    if (slidesError) {
      console.error('Error counting slides with JOIN, trying alternative:', slidesError);
      
      // Get all user lessons
      const { data: lessons, error: lessonsListError } = await supabase
        .from('lessons')
        .select('id')
        .eq('user_id', user.id);

      if (!lessonsListError && lessons) {
        // Count slides for each lesson
        for (const lesson of lessons) {
          const { count: lessonSlidesCount } = await supabase
            .from('slides')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);
          
          totalSlides += lessonSlidesCount || 0;
        }
      }
    } else {
      totalSlides = slidesCount || 0;
    }

    // Get date of last created lesson
    const { data: lastLesson, error: lastLessonError } = await supabase
      .from('lessons')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get lessons from last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { count: monthlyLessonsCount, error: monthlyError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMonthAgo.toISOString());

    if (monthlyError) {
      console.error('Error counting monthly lessons:', monthlyError);
    }

    // Get profile information for registration date
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('created_at, subscription_type, generation_count, subscription_expires_at')
      .eq('id', user.id)
      .single();

    const stats = {
      totalLessons: lessonsCount || 0,
      totalSlides: totalSlides,
      lastActivity: lastLesson?.created_at || null,
      monthlyLessons: monthlyLessonsCount || 0,
      joinedAt: profile?.created_at || user.created_at,
      subscriptionType: profile?.subscription_type || 'free',
      generationCount: profile?.generation_count || 0,
      subscriptionExpiresAt: profile?.subscription_expires_at || null,
      lastSignIn: user.last_sign_in_at,
    };

    return NextResponse.json({
      success: true,
      stats,
      message: 'Statistics loaded'
    });

  } catch (error) {
    console.error('Error in stats GET:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
} 