# Система редиректів авторизації

## Проблема
Потрібно було реалізувати логіку, щоб неавторизовані користувачі автоматично перенаправлялися на сторінку входу, а авторизовані - на запитану сторінку.

## Рішення
Реалізовано комплексну систему редиректів через middleware та покращення форм авторизації.

## Архітектура

### 1. Middleware рівень
**Файл:** `src/lib/supabase/middleware.ts`

#### Логіка роботи:
1. **Перевірка автентифікації** - `supabase.auth.getUser()`
2. **Визначення типу маршруту** - публічний чи захищений
3. **Редирект неавторизованих** - на `/auth/login` з параметром `redirectTo`
4. **Редирект авторизованих** - з auth сторінок на цільову сторінку

#### Публічні маршрути:
```typescript
const publicRoutes = [
  '/auth/login',
  '/auth/register', 
  '/test',
  '/api',
  '/_next',
  '/favicon.ico',
  '/images'
]
```

#### Захищені маршрути:
- Всі інші маршрути (за замовчуванням)
- `/chat`, `/materials`, `/`, тощо

### 2. AuthProvider рівень
**Файл:** `src/providers/AuthProvider.tsx`

#### Покращення:
- **Умовний loading екран** - показується тільки на захищених сторінках
- **Перевірка pathname** - визначення типу поточної сторінки
- **Оптимізація UX** - немає loading на публічних сторінках

```typescript
// Показуємо loading екран поки йде ініціалізація авторизації
// але тільки на захищених сторінках
if (loading && !isPublicRoute) {
  return <LoadingScreen message="Перевірка авторизації..." />
}
```

### 3. Форми авторизації
**Файли:** `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`

#### Функціональність:
- **Читання redirectTo параметру** з URL
- **Автоматичний редирект** після успішного входу/реєстрації
- **Fallback на головну** якщо немає збереженого URL

```typescript
// Успішний вхід - перенаправляємо користувача
const redirectTo = searchParams?.get('redirectTo')
if (redirectTo && redirectTo !== '/auth/login' && redirectTo !== '/auth/register') {
  router.push(redirectTo)
} else {
  router.push('/')
}
```

## Сценарії використання

### 1. Неавторизований користувач → Захищена сторінка
```
Користувач → /chat
Middleware → /auth/login?redirectTo=/chat
Після входу → /chat
```

### 2. Авторизований користувач → Auth сторінка
```
Користувач → /auth/login
Middleware → /
```

### 3. Авторизований користувач → Auth сторінка з redirectTo
```
Користувач → /auth/login?redirectTo=/materials
Middleware → /materials
```

### 4. Прямий вхід на публічну сторінку
```
Користувач → /auth/login (без redirectTo)
Після входу → /
```

## Тестування

### Компонент RedirectTest
**Файл:** `src/components/debug/RedirectTest.tsx`

#### Тестові сценарії:
1. **Доступ до /chat без авторизації** - має редиректити на логін
2. **Доступ до /materials без авторизації** - має редиректити на логін  
3. **Прямий перехід на логін** - має показати форму
4. **Логін з redirectTo=/chat** - має перенаправити на чат після входу
5. **Реєстрація з redirectTo=/materials** - має перенаправити на матеріали

### Як тестувати:
1. Відкрийте `/test`
2. Використовуйте кнопки тестування
3. Перевіряйте поведінку редиректів
4. Тестуйте з авторизованим та неавторизованим станом

## Технічні деталі

### Middleware конфігурація
**Файл:** `middleware.ts`

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/images).*)',
  ],
}
```

### Обробка помилок JWT
```typescript
// Якщо є помилка з токеном, спробуємо оновити сесію
if (error && error.message.includes('Invalid JWT')) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.auth.refreshSession()
    }
  } catch (refreshError) {
    console.error('Failed to refresh session:', refreshError)
  }
}
```

### URL параметри
- **redirectTo** - зберігає оригінальний URL для редиректу
- **Очищення параметрів** - після успішного редиректу
- **Валідація** - запобігання циклічним редиректам

## Переваги системи

### 1. Безпека
- **Захист всіх маршрутів** за замовчуванням
- **Валідація токенів** на middleware рівні
- **Автоматичне оновлення сесій**

### 2. UX
- **Збереження намірів користувача** через redirectTo
- **Плавні переходи** без втрати контексту
- **Умовний loading** тільки де потрібно

### 3. Гнучкість
- **Легке додавання публічних маршрутів**
- **Централізована логіка** в middleware
- **Кастомізація поведінки** для різних сценаріїв

## Налагодження

### Логування
```typescript
console.log('Redirecting to login:', request.nextUrl.pathname)
console.log('User authenticated, redirecting from auth page')
```

### Перевірка стану
- Використовуйте компонент `RedirectTest`
- Перевіряйте Network tab в DevTools
- Моніторьте console для логів middleware

## Майбутні покращення

1. **Role-based redirects** - різні редиректи для різних ролей
2. **Remember intended action** - збереження дій, не тільки URL
3. **Expired session handling** - спеціальна логіка для expired токенів
4. **Analytics integration** - трекінг редиректів для аналітики 