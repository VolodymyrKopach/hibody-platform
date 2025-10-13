# 🔒 Server-Side Generation Limit Logic

## ⚠️ Проблема

**Зараз:**
- ✅ Frontend перевіряє `canGenerate` через `useGenerationLimit`
- ✅ Frontend інкрементить counter після успішної генерації
- ❌ **НЕМАЄ server-side валідації** - можна обійти через API
- ❌ **НЕМАЄ monthly reset** - counter ніколи не скидається для Pro
- ❌ **НЕМАЄ обробки expired підписок**

**Ризики:**
1. Хтось може викликати `/api/templates/lesson-plan` напряму і обійти ліміт
2. Pro користувачі які використали 20 генерацій **ніколи** не зможуть генерувати знову
3. Коли закінчується підписка, користувач все ще може генерувати

---

## ✅ Що потрібно імплементувати

### 1. Server-Side Validation Middleware

**Файл:** `src/middleware/generationLimit.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FREE_LIMIT = 3;
const PRO_LIMIT = 20;

export async function checkGenerationLimit(request: NextRequest) {
  const supabase = await createClient();
  
  // 1. Отримати користувача
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      allowed: false,
      error: 'Unauthorized',
      status: 401
    };
  }

  // 2. Отримати дані профілю
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('generation_count, subscription_type, subscription_expires_at, last_generation_reset')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      allowed: false,
      error: 'Profile not found',
      status: 404
    };
  }

  // 3. Перевірити чи підписка активна
  const isPro = profile.subscription_type === 'pro' && 
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

  // 4. Визначити ліміт
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
  const count = profile.generation_count || 0;

  // 5. Перевірити ліміт
  if (count >= limit) {
    return {
      allowed: false,
      error: isPro 
        ? 'Monthly generation limit reached. Your limit will reset at the start of next month.'
        : 'Free generation limit reached. Upgrade to Pro for 20 generations per month.',
      status: 403,
      limit,
      current: count,
      isPro
    };
  }

  return {
    allowed: true,
    limit,
    current: count,
    isPro
  };
}
```

---

### 2. Додати валідацію в API Endpoints

**Файл:** `src/app/api/templates/lesson-plan/route.ts`

```typescript
import { checkGenerationLimit } from '@/middleware/generationLimit';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`📝 LESSON PLAN API: POST request received [${requestId}]`);
    
    // ✅ ПЕРЕВІРКА ЛІМІТУ НА СЕРВЕРІ
    const limitCheck = await checkGenerationLimit(request);
    
    if (!limitCheck.allowed) {
      console.error(`❌ LESSON PLAN API: Generation limit reached [${requestId}]`);
      return NextResponse.json({
        success: false,
        error: {
          message: limitCheck.error,
          code: 'GENERATION_LIMIT_REACHED',
          limit: limitCheck.limit,
          current: limitCheck.current,
          isPro: limitCheck.isPro
        }
      }, { status: limitCheck.status });
    }
    
    console.log(`✅ LESSON PLAN API: Generation limit check passed [${requestId}]`, {
      current: limitCheck.current,
      limit: limitCheck.limit,
      isPro: limitCheck.isPro
    });
    
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // ... решта коду генерації ...
    
    // ✅ ІНКРЕМЕНТ COUNTER НА СЕРВЕРІ (після успішної генерації)
    const supabase = await createClient();
    await supabase.rpc('increment_generation_count', { user_id: user.id });
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    // ... error handling ...
  }
}
```

---

### 3. Monthly Reset для Pro Users

**Опція A: Supabase Cron Job (Рекомендовано)**

**Файл:** `supabase/migrations/015_add_monthly_reset.sql`

```sql
-- Додати поле для tracking коли був останній reset
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS last_generation_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Функція для reset counter для Pro користувачів
CREATE OR REPLACE FUNCTION reset_pro_generation_counts()
RETURNS void AS $$
BEGIN
  -- Reset counter тільки для Pro користувачів у яких минув місяць
  UPDATE public.user_profiles
  SET 
    generation_count = 0,
    last_generation_reset = NOW(),
    updated_at = NOW()
  WHERE 
    subscription_type = 'pro'
    AND subscription_expires_at > NOW()
    AND (
      last_generation_reset IS NULL 
      OR last_generation_reset < NOW() - INTERVAL '1 month'
    );
    
  -- Логування
  RAISE NOTICE 'Pro generation counts reset for active subscriptions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job - запускається кожного 1-го числа місяця о 00:00
SELECT cron.schedule(
  'reset-pro-generations',
  '0 0 1 * *',  -- Щомісяця 1-го числа о 00:00
  $$SELECT reset_pro_generation_counts()$$
);

COMMENT ON FUNCTION reset_pro_generation_counts() IS 
'Resets generation_count to 0 for all Pro users at the start of each month';
```

**Опція B: Next.js API Route (Backup)**

**Файл:** `src/app/api/cron/reset-generations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Cron endpoint для reset generation counts
 * Викликається Vercel Cron або зовнішнім cron сервісом
 * 
 * Security: Захищено через CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Перевірка authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Reset counters для Pro користувачів
    const { data, error } = await supabase.rpc('reset_pro_generation_counts');

    if (error) {
      throw error;
    }

    console.log('✅ Pro generation counts reset successfully');

    return NextResponse.json({
      success: true,
      message: 'Generation counts reset for Pro users'
    });

  } catch (error) {
    console.error('❌ Failed to reset generation counts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Configuration:** `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/reset-generations",
    "schedule": "0 0 1 * *"
  }]
}
```

---

### 4. Automatic Reset on Payment (Bonus)

**Файл:** `src/app/api/payment/callback/route.ts`

```typescript
// Коли користувач платить/поновлює підписку - reset counter
const { error: userError } = await supabase
  .from('user_profiles')
  .update({
    subscription_type: 'pro',
    subscription_expires_at: proExpiresAt.toISOString(),
    generation_count: 0,  // ✅ RESET COUNTER ПРИ ОПЛАТІ
    last_generation_reset: new Date().toISOString(),  // ✅ TRACK RESET DATE
    updated_at: new Date().toISOString(),
  })
  .eq('id', payment.user_id);
```

---

### 5. Handle Expired Subscriptions

**Функція автоматичної перевірки:** `supabase/migrations/016_handle_expired_subscriptions.sql`

```sql
-- Функція для downgrade expired підписок
CREATE OR REPLACE FUNCTION downgrade_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    subscription_type = 'free',
    generation_count = LEAST(generation_count, 3), -- Cap на free ліміт
    updated_at = NOW()
  WHERE 
    subscription_type = 'pro'
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at < NOW();
    
  RAISE NOTICE 'Expired Pro subscriptions downgraded to free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job - перевіряє кожного дня о 01:00
SELECT cron.schedule(
  'downgrade-expired-subs',
  '0 1 * * *',  -- Щодня о 01:00
  $$SELECT downgrade_expired_subscriptions()$$
);
```

---

## 📊 Flow Diagram

```
User clicks "Generate Plan"
    ↓
Frontend: Check canGenerate
    ↓ (if allowed)
POST /api/templates/lesson-plan
    ↓
Server: checkGenerationLimit()
    ├─ Get user profile
    ├─ Check subscription status
    ├─ Check generation_count < limit
    └─ Return allowed: true/false
    ↓ (if allowed)
Generate lesson plan
    ↓
Increment generation_count
    ↓
Return plan to frontend
    ↓
Frontend: increment counter locally (for real-time UI)

Monthly Reset (Cron):
    ↓
Every 1st day of month at 00:00
    ↓
reset_pro_generation_counts()
    ├─ Find Pro users with last_reset > 1 month ago
    ├─ Set generation_count = 0
    └─ Set last_generation_reset = NOW()
```

---

## 🎯 Priority Implementation Order

### Phase 1: Critical (Must Have)
1. ✅ **Server-side validation** в `/api/templates/lesson-plan` ← **НАЙВАЖЛИВІШЕ**
2. ✅ **Increment на сервері** після успішної генерації
3. ✅ Додати `last_generation_reset` поле в user_profiles

### Phase 2: Important (Should Have)
4. ✅ **Monthly reset function** в Supabase
5. ✅ **Cron job** для automatic reset
6. ✅ Reset counter при оплаті

### Phase 3: Nice to Have
7. ✅ Handle expired subscriptions
8. ✅ Admin dashboard для моніторингу
9. ✅ Notification коли ліміт майже досягнутий

---

## 🧪 Testing Scenarios

### Test 1: Free User Limit
```
1. Створити 3 уроки ✓
2. Спробувати створити 4-й ↓
   ✅ Frontend: показує paywall
   ✅ Backend: відхиляє запит з 403
```

### Test 2: Pro User Limit
```
1. Купити Pro ✓
2. Створити 20 уроків ✓
3. Спробувати створити 21-й ↓
   ✅ Frontend: показує "wait for next month" message
   ✅ Backend: відхиляє запит з 403
```

### Test 3: Monthly Reset
```
1. Pro user використав 20/20 генерацій
2. Наступного місяця 1-го числа о 00:00:
   ✅ Cron job скидає counter на 0
   ✅ User може знову генерувати
```

### Test 4: Expired Subscription
```
1. Pro підписка закінчилась
2. Daily cron downgrade до free:
   ✅ subscription_type = 'free'
   ✅ generation_count capped на 3
   ✅ User бачить paywall при спробі генерації
```

### Test 5: Bypass Attempt
```
1. Користувач спробує викликати API напряму (curl/Postman)
2. ✅ Backend перевіряє limit і відхиляє
3. ✅ Counter НЕ інкрементиться
```

---

## 💰 Business Logic Summary

| User Type | Limit | Reset Logic | After Limit Reached |
|-----------|-------|-------------|---------------------|
| **Free** | 3 total | Never resets | Paywall → Upgrade to Pro |
| **Pro** | 20/month | 1st of each month | Soft block → Wait for reset |
| **Expired Pro** | 3 total (downgraded to Free) | Daily check | Paywall → Renew subscription |

---

## 🚀 Implementation Checklist

- [ ] Create `src/middleware/generationLimit.ts`
- [ ] Update `src/app/api/templates/lesson-plan/route.ts`
- [ ] Add migration `015_add_monthly_reset.sql`
- [ ] Add migration `016_handle_expired_subscriptions.sql`
- [ ] Update `src/app/api/payment/callback/route.ts` (reset on payment)
- [ ] Create `src/app/api/cron/reset-generations/route.ts` (optional)
- [ ] Add `CRON_SECRET` to environment variables
- [ ] Configure Vercel Cron or Supabase pg_cron
- [ ] Update frontend error handling for limit errors
- [ ] Add tests for all scenarios
- [ ] Update documentation

---

## 📝 Environment Variables Needed

```bash
# Add to .env.local
CRON_SECRET=your_secure_random_string_here
```

Generate with:
```bash
openssl rand -base64 32
```

---

## ⚠️ Important Notes

1. **Supabase pg_cron потребує** PostgreSQL extension `pg_cron`
   - Check if available: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
   - Enable: Contact Supabase support or use Vercel Cron alternative

2. **Monthly reset vs. 30-day rolling**
   - Current: Calendar month (resets 1st day)
   - Alternative: 30 days from subscription date (more fair but complex)

3. **Grace period**
   - Consider 1-day grace after subscription expires before downgrade
   - Prevents accidental service interruption

4. **Testing in development**
   - Manual trigger: `SELECT reset_pro_generation_counts();`
   - Don't schedule cron in dev environment

