# Налаштування Supabase для Production

## Проблема з Password Reset

Ваше посилання для скидання пароля:
```
https://qrpyxpkuzljdfyasxjvr.supabase.co/auth/v1/verify?token=pkce_280ec8fe2f6eaa2ec422c7e21b133f06f755cefdb9bd550aa60913f8&type=recovery&redirect_to=https://teach.teachspark.online
```

**Проблема:** Посилання йде безпосередньо на Supabase Auth API, а не на вашу сторінку `/auth/reset-password`.

## Рішення

### 1. Налаштування в Supabase Dashboard

Зайдіть в **Supabase Dashboard** → **Authentication** → **URL Configuration**:

#### Site URL:
```
https://teach.teachspark.online
```

#### Redirect URLs:
Додайте ці URLs до списку дозволених redirect URLs:
```
https://teach.teachspark.online/auth/reset-password
https://teach.teachspark.online/auth/login
https://teach.teachspark.online/auth/register
http://localhost:3000/auth/reset-password
http://localhost:3004/auth/reset-password
```

### 2. Перевірка Environment Variables

Переконайтеся, що у production є правильні змінні:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qrpyxpkuzljdfyasxjvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Налаштування Email Templates (опціонально)

В **Supabase Dashboard** → **Authentication** → **Email Templates** → **Reset Password**:

Змініть template, щоб використовувати правильний URL:
```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=recovery">Reset Password</a></p>
```

### 4. Тестування

Після налаштування:

1. Зайдіть на `https://teach.teachspark.online/auth/forgot-password`
2. Введіть email
3. Перевірте, що посилання в email тепер виглядає як:
   ```
   https://teach.teachspark.online/auth/reset-password?access_token=...&refresh_token=...&type=recovery
   ```

### 5. Debugging

Якщо проблема залишається, перевірте:

1. **Network tab** в браузері при відправці forgot password запиту
2. **Server logs** для перевірки redirect URL
3. **Supabase logs** в Dashboard

### 6. Альтернативне рішення

Якщо Supabase продовжує використовувати свій домен, можна створити проміжну сторінку:

```typescript
// pages/auth/callback.tsx
export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      window.location.href = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`;
    }
  }, []);
  
  return <div>Redirecting...</div>;
}
```

## Поточний статус коду

✅ **Middleware** - налаштований правильно  
✅ **Reset Password Page** - працює коректно  
✅ **API Endpoint** - відправляє правильний redirect URL  
❌ **Supabase Dashboard** - потребує налаштування redirect URLs  

## Наступні кроки

1. Налаштуйте Supabase Dashboard згідно з інструкціями вище
2. Протестуйте функціональність на production
3. Перевірте, що посилання в email тепер правильні
