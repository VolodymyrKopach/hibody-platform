import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Публічні маршрути - не потребують авторизації
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/test',
    '/api',
    '/_next',
    '/favicon.ico',
    '/images'
  ]
  
  // Перевіряємо чи поточний маршрут публічний
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Логування для дебагу
  console.log(`🔍 Middleware: ${request.nextUrl.pathname} (${isPublicRoute ? 'public' : 'protected'})`)

  try {
    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Логування результату авторизації
    if (error) {
      console.log(`❌ Middleware: Auth error for ${request.nextUrl.pathname}:`, error.message)
    } else {
      console.log(`✅ Middleware: Auth check for ${request.nextUrl.pathname}: ${user ? `User ${user.email}` : 'No user'}`)
    }

    // Якщо користувач не авторизований і намагається потрапити на захищену сторінку
    if (!user && !isPublicRoute) {
      console.log(`🔄 Middleware: Redirecting unauthorized user from ${request.nextUrl.pathname} to login`)
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      // Зберігаємо оригінальний URL для редиректу після входу
      url.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }

    // Якщо користувач авторизований і намагається потрапити на сторінку логіну/реєстрації
    if (user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register'))) {
      console.log(`🔄 Middleware: Redirecting authenticated user from ${request.nextUrl.pathname}`)
      const redirectTo = request.nextUrl.searchParams.get('redirectTo')
      const url = request.nextUrl.clone()
      
      // Якщо є збережений URL для редиректу, використовуємо його
      if (redirectTo && redirectTo !== '/auth/login' && redirectTo !== '/auth/register') {
        url.pathname = redirectTo
        url.search = ''
        console.log(`🎯 Middleware: Redirecting to saved URL: ${redirectTo}`)
      } else {
        url.pathname = '/'
        url.search = ''
        console.log(`🎯 Middleware: Redirecting to home page`)
      }
      
      return NextResponse.redirect(url)
    }

    console.log(`✅ Middleware: Access granted to ${request.nextUrl.pathname}`)

  } catch (error) {
    console.error(`❌ Middleware: Unexpected error for ${request.nextUrl.pathname}:`, error)
    // У разі помилки, якщо це не публічний маршрут, редиректимо на логін
    if (!isPublicRoute) {
      console.log(`🔄 Middleware: Error recovery - redirecting to login`)
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
} 