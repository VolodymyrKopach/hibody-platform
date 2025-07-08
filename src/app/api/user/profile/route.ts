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

// GET /api/user/profile - отримати профіль користувача
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();

    // Отримуємо повний профіль користувача
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при отриманні профілю',
          code: 'PROFILE_FETCH_ERROR'
        }
      }, { status: 500 });
    }

    // Додаємо основну інформацію з auth
    const fullProfile = {
      ...profile,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
    };

    return NextResponse.json({
      success: true,
      profile: fullProfile,
      message: 'Профіль завантажено'
    });

  } catch (error) {
    console.error('Error in profile GET:', error);
    
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

// PUT /api/user/profile - оновити профіль користувача
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();
    const body = await request.json();

    // Валідація вхідних даних
    const allowedFields = ['full_name', 'avatar_url'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Додаємо updated_at
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 1) { // тільки updated_at
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Немає даних для оновлення',
          code: 'NO_DATA_TO_UPDATE'
        }
      }, { status: 400 });
    }

    // Оновлюємо профіль
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при оновленні профілю',
          code: 'PROFILE_UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Профіль оновлено успішно'
    });

  } catch (error) {
    console.error('Error in profile PUT:', error);
    
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