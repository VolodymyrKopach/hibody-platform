import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Валідація вхідних даних
    if (!email || typeof email !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Електронна пошта обов\'язкова',
          code: 'MISSING_EMAIL'
        }
      }, { status: 400 })
    }

    // Валідація формату email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Введіть коректну електронну адресу',
          code: 'INVALID_EMAIL'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Динамічно отримуємо host з request
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    // Відправляємо запит на скидання пароля через Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) {
      console.error('Error sending reset password email:', error)
      
      // Специфічні помилки Supabase
      if (error.message.includes('rate limit')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Забагато спроб. Спробуйте пізніше',
            code: 'RATE_LIMIT'
          }
        }, { status: 429 })
      }

      if (error.message.includes('User not found')) {
        // З міркувань безпеки, не повідомляємо що користувача не знайдено
        return NextResponse.json({
          success: true,
          message: 'Якщо користувач з такою поштою існує, лист буде відправлено'
        })
      }

      return NextResponse.json({
        success: false,
        error: { 
          message: 'Помилка при відправці листа',
          code: 'EMAIL_SEND_ERROR'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Лист для скидання пароля відправлено'
    })

  } catch (error) {
    console.error('Error in forgot-password POST:', error)
    
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Внутрішня помилка сервера',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
} 