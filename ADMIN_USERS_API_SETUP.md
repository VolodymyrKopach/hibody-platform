# Admin Users API Setup

## Проблема

Початкова реалізація намагалася робити JOIN між `auth.users` та `admin_users` з клієнта, що неможливо через обмеження Supabase PostgREST. `auth.users` - це системна таблиця в схемі `auth`, до якої не можна робити JOIN з клієнта.

## Рішення

Створено server-side API endpoint `/api/admin/users`, який використовує **Supabase Service Role Key** для доступу до `auth.admin.listUsers()`.

## Архітектура

```
┌─────────────────┐
│  Client Side    │
│  (Browser)      │
└────────┬────────┘
         │
         │ fetch('/api/admin/users')
         ▼
┌─────────────────┐
│  Server Side    │
│  API Route      │
│  /api/admin/    │
│  users/route.ts │
└────────┬────────┘
         │
         ├──► adminAuthService.isAdmin() → Check if user is admin
         │
         ├──► adminSupabase.auth.admin.listUsers() → Get auth users (Service Role)
         │
         └──► supabase.from('admin_users') → Get admin roles
```

## Файли

### 1. `/src/lib/supabase/admin.ts` ✅
Admin client з Service Role Key для server-side операцій.

### 2. `/src/app/api/admin/users/route.ts` ✅
Server-side API endpoint для отримання списку юзерів.

### 3. `/src/services/admin/usersService.ts` ✅
Оновлений для використання API endpoint замість прямого запиту до БД.

## Environment Variables

У файлі `.env.local` **обов'язково** має бути:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin (Service Role Key)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Де взяти Service Role Key

1. Відкрий **Supabase Dashboard**
2. Project Settings → API
3. **Project API keys**
4. Скопіюй `service_role` key (⚠️ НЕ `anon` key!)
5. Додай в `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ⚠️ Важливо!

- **Service Role Key** дає **повний доступ** до бази даних, обходячи RLS policies
- Ніколи не експортуй його в клієнт (не використовуй `NEXT_PUBLIC_` prefix)
- Використовуй тільки в server-side коді (API routes, Server Components)
- Додай `.env.local` в `.gitignore`

## Безпека

API endpoint `/api/admin/users` захищено:
1. **Authentication**: Перевіряє, чи користувач залогінений
2. **Authorization**: Перевіряє, чи користувач має `admin` або `super_admin` роль
3. **RLS**: Всі інші запити (крім auth.admin) використовують RLS policies

## Testing

```bash
# 1. Додай SUPABASE_SERVICE_ROLE_KEY в .env.local
# 2. Перезапусти dev server
npm run dev

# 3. Відкрий Admin Panel
http://localhost:3000/admin/users

# 4. Побачиш список всіх юзерів
```

## API Response

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z",
      "last_sign_in_at": "2025-01-13T10:00:00Z",
      "is_admin": true,
      "admin_role": "super_admin",
      "lessons_count": 5,
      "slides_count": 42,
      "worksheets_count": 12,
      "subscription_status": "free",
      "subscription_plan": null
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "total_pages": 5
}
```

## Troubleshooting

### Error: Missing SUPABASE_SERVICE_ROLE_KEY
```
❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable
```

**Рішення**: Додай Service Role Key в `.env.local`

### Error: Unauthorized (403)
```json
{ "error": "Unauthorized" }
```

**Рішення**: Переконайся, що твій user_id є в таблиці `admin_users` з роллю `super_admin`

```sql
-- Supabase Dashboard → SQL Editor
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id', 'super_admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'super_admin';
```

### Error: Failed to fetch users (500)
```json
{ "error": "Failed to fetch users" }
```

**Рішення**: 
1. Перевір Service Role Key
2. Перевір логи в терміналі
3. Перевір Supabase Dashboard → Logs

## Next Steps

- [ ] Додати pagination на фронтенді
- [ ] Додати сортування
- [ ] Додати фільтри по даті
- [ ] Додати детальну інформацію про юзера
- [ ] Додати можливість редагувати юзера
- [ ] Додати можливість блокувати/розблокувати юзера

