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

// POST /api/user/change-password - змінити пароль користувача
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();
    const body = await request.json();

    // Валідація вхідних даних
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Новий пароль обов\'язковий',
          code: 'MISSING_PASSWORD'
        }
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Пароль повинен містити щонайменше 6 символів',
          code: 'PASSWORD_TOO_SHORT'
        }
      }, { status: 400 });
    }

    // Змінюємо пароль через Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error changing password:', error);
      
      // Специфічні помилки Supabase
      if (error.message.includes('same as the old password')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Новий пароль повинен відрізнятися від поточного',
            code: 'SAME_PASSWORD'
          }
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при зміні пароля',
          code: 'PASSWORD_UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Пароль успішно змінено'
    });

  } catch (error) {
    console.error('Error in change-password POST:', error);
    
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