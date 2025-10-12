# 🚀 Quick Start: Monetization MVP

## Швидкий старт за 15 хвилин

### 1️⃣ Налаштування бази даних (5 хв)

```bash
# Запусти міграції в Supabase
cd supabase

# Якщо використовуєш Supabase CLI
supabase db push

# Або виконай міграції вручну в Supabase Dashboard → SQL Editor:
# - 012_add_subscription_fields.sql
# - 013_add_increment_function.sql
# - 014_create_payments_table.sql
```

### 2️⃣ Налаштування WayForPay (5 хв)

1. Зареєструйся на [wayforpay.com](https://wayforpay.com)
2. Отримай тестові креденшали
3. Додай в `.env.local`:

```bash
WAYFORPAY_MERCHANT_ACCOUNT=test_merch_n1
WAYFORPAY_SECRET_KEY=flk3409refn54t54t*FNJRET
WAYFORPAY_DOMAIN=https://secure.wayforpay.com/pay
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. В WayForPay Dashboard додай Service URL:
   ```
   http://localhost:3000/api/payment/callback
   ```

### 3️⃣ Перевірка роботи (5 хв)

```bash
# Запусти dev сервер
npm run dev

# Відкрий http://localhost:3000/create-lesson
```

**Тестовий сценарій:**

1. ✅ Створи 1-й урок → лічильник = 1
2. ✅ Створи 2-й урок → лічильник = 2  
3. ✅ Створи 3-й урок → 🎉 Paywall з'являється!
4. ✅ Натисни "Оформити Pro" → перехід на `/payment`
5. ✅ Перевір WayForPay форму

---

## 📊 Перевірка в PostHog

1. Відкрий [PostHog Dashboard](https://app.posthog.com)
2. Перейди в **Events**
3. Шукай події:
   - `generate_lesson`
   - `open_paywall`
   - `click_upgrade`

---

## 🔍 Debugging

### Перевірка лічильника

```sql
-- В Supabase SQL Editor
SELECT 
  email, 
  generation_count, 
  subscription_type, 
  subscription_expires_at 
FROM user_profiles;
```

### Скидання лічильника для тесту

```sql
UPDATE user_profiles 
SET generation_count = 0 
WHERE email = 'your-email@example.com';
```

### Імітація Pro користувача

```sql
UPDATE user_profiles 
SET 
  subscription_type = 'pro',
  subscription_expires_at = NOW() + INTERVAL '1 month'
WHERE email = 'your-email@example.com';
```

---

## 🎯 Готово до продакшну?

- [ ] Міграції виконані ✅
- [ ] WayForPay налаштований ✅
- [ ] Paywall показується після 3 генерацій ✅
- [ ] Analytics працює ✅
- [ ] Payment flow протестований ✅

**Далі:**
1. Додай Production креденшали WayForPay
2. Оновіть `NEXT_PUBLIC_APP_URL` на реальний домен
3. Deploy на Vercel/інший хостинг
4. Перевір webhook працює (callback endpoint доступний)

---

## 📈 Моніторинг

### PostHog Events

```typescript
// Ключові події для відстеження
generate_lesson         → Скільки уроків генерується
open_paywall           → Скільки разів показується paywall
click_upgrade          → Скільки кліків на upgrade
complete_payment       → Скільки успішних оплат
```

### Цільові метрики (MVP)

| Метрика | Ціль |
|---------|------|
| 3+ генерації | 30%+ користувачів |
| Paywall view | 20%+ користувачів |
| Click upgrade | 10%+ з тих хто бачив |
| Complete payment | 1-2%+ конверсія |

---

## 🆘 Проблеми?

**Paywall не з'являється:**
```sql
-- Перевір чи працює лічильник
SELECT * FROM users WHERE email = 'your@email.com';
```

**Payment не обробляється:**
```bash
# Перевір логи Next.js
npm run dev
# Подивись в консоль при callback
```

**Analytics не працює:**
```typescript
// Перевір в browser console
window.posthog.capture('test_event');
```

---

**🎉 Все готово! Запускай і валідуй гіпотезу!**

