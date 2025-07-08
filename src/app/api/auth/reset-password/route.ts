import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Валідація вхідних даних
    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Токен обов\'язковий',
          code: 'MISSING_TOKEN'
        }
      }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Новий пароль обов\'язковий',
          code: 'MISSING_PASSWORD'
        }
      }, { status: 400 })
    }

    // Валідація пароля
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

    // Спочатку верифікуємо OTP токен
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    })

    if (verifyError || !sessionData.user) {
      console.error('Error verifying reset token:', verifyError)
      
      if (verifyError?.message.includes('expired')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Токен для скидання пароля застарілий',
            code: 'TOKEN_EXPIRED'
          }
        }, { status: 400 })
      }

      if (verifyError?.message.includes('invalid')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Недійсний токен для скидання пароля',
            code: 'TOKEN_INVALID'
          }
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при верифікації токену',
          code: 'TOKEN_VERIFICATION_ERROR'
        }
      }, { status: 400 })
    }

    // Тепер оновлюємо пароль для верифікованого користувача
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('Error updating password:', updateError)

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
          message: 'Помилка при оновленні пароля',
          code: 'PASSWORD_UPDATE_ERROR'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Пароль успішно оновлено'
    })

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