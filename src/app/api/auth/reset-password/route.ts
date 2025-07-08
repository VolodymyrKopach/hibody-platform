import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('Reset password API called')

    // Валідація пароля
    if (!password || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Новий пароль обов\'язковий',
          code: 'MISSING_PASSWORD'
        }
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Пароль повинен містити щонайменше 6 символів',
          code: 'PASSWORD_TOO_SHORT'
        }
      }, { status: 400 })
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Пароль повинен містити щонайменше одну малу літеру',
          code: 'PASSWORD_MISSING_LOWERCASE'
        }
      }, { status: 400 })
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Пароль повинен містити щонайменше одну велику літеру',
          code: 'PASSWORD_MISSING_UPPERCASE'
        }
      }, { status: 400 })
    }

    if (!/(?=.*\d)/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Пароль повинен містити щонайменше одну цифру',
          code: 'PASSWORD_MISSING_NUMBER'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Перевіряємо чи користувач автентифікований
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('User not authenticated for password reset')
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Користувач не автентифікований. Перейдіть за посиланням з email ще раз.',
          code: 'USER_NOT_AUTHENTICATED'
        }
      }, { status: 401 })
    }

    console.log('User authenticated for password reset:', user.email)

    // Оновлюємо пароль для автентифікованого користувача
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('Password update failed:', updateError)
        
        if (updateError.message.includes('same as the old password')) {
          return NextResponse.json({
            success: false,
            error: { 
              message: 'Новий пароль повинен відрізнятися від поточного',
              code: 'SAME_PASSWORD'
            }
          }, { status: 400 })
        }

        return NextResponse.json({
          success: false,
          error: { 
            message: 'Помилка при оновленні пароля: ' + updateError.message,
            code: 'PASSWORD_UPDATE_ERROR'
          }
        }, { status: 500 })
      }

      console.log('Password reset successful for user:', user.email)
      return NextResponse.json({
        success: true,
        message: 'Пароль успішно оновлено'
      })

    } catch (updateErr) {
      console.error('Password update error:', updateErr)
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при оновленні пароля',
          code: 'PASSWORD_UPDATE_ERROR'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in reset-password POST:', error)
    
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Внутрішня помилка сервера',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
} 