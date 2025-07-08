import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Функція для отримання користувача з аутентифікації
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Користувач не аутентифікований');
  }
  
  return user;
}

// GET /api/user/stats - отримати статистику користувача
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();

    // Отримуємо кількість уроків
    const { count: lessonsCount, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (lessonsError) {
      console.error('Error counting lessons:', lessonsError);
    }

    // Отримуємо кількість слайдів через JOIN
    const { count: slidesCount, error: slidesError } = await supabase
      .from('slides')
      .select(`
        *,
        lessons!inner(id)
      `, { count: 'exact', head: true })
      .eq('lessons.user_id', user.id);

    // Альтернативний запит для слайдів (якщо перший не працює)
    let totalSlides = 0;
    if (slidesError) {
      console.error('Error counting slides with JOIN, trying alternative:', slidesError);
      
      // Отримуємо всі уроки користувача
      const { data: lessons, error: lessonsListError } = await supabase
        .from('lessons')
        .select('id')
        .eq('user_id', user.id);

      if (!lessonsListError && lessons) {
        // Підраховуємо слайди для кожного уроку
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

    // Отримуємо дату останнього створеного уроку
    const { data: lastLesson, error: lastLessonError } = await supabase
      .from('lessons')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Отримуємо уроки за останній місяць
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

    // Отримуємо інформацію про профіль для дати реєстрації
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('created_at, subscription_type')
      .eq('id', user.id)
      .single();

    const stats = {
      totalLessons: lessonsCount || 0,
      totalSlides: totalSlides,
      lastActivity: lastLesson?.created_at || null,
      monthlyLessons: monthlyLessonsCount || 0,
      joinedAt: profile?.created_at || user.created_at,
      subscriptionType: profile?.subscription_type || 'free',
      lastSignIn: user.last_sign_in_at,
    };

    return NextResponse.json({
      success: true,
      stats,
      message: 'Статистика завантажена'
    });

  } catch (error) {
    console.error('Error in stats GET:', error);
    
    if (error instanceof Error && error.message.includes('аутентифікований')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Необхідна аутентифікація',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Внутрішня помилка сервера',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
} 