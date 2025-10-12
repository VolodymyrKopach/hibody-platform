# 👤 Account Page - Features Overview

Сторінка Account тепер включає повну інформацію про підписку та використання платформи.

## 📑 Структура сторінки

Сторінка має **4 основні табі**:

### 1. 👤 Профіль (Profile)
- Базова інформація про користувача
- Редагування профілю
- Аватар

### 2. 👑 Підписка (Subscription) - **НОВА**
Повна інформація про підписку та використання генерацій:

#### Статус підписки
- **Free користувачі:**
  - Показує "Безкоштовний план"
  - Обмеження: 3 генерації
  - Кнопка "Upgrade to Pro"

- **Pro користувачі:**
  - Показує "TeachSpark Pro 🎉"
  - Дата закінчення підписки
  - Кількість днів до закінчення
  - Badge "Необмежені генерації"

#### Використання генерацій
- **Лічильник**: показує скільки використано
- **Progress bar** (для Free): візуалізація ліміту
- **Статистика:**
  - Всього згенеровано уроків
  - Статус (Можна генерувати / Ліміт вичерпано)

#### Переваги Pro підписки
Для Free користувачів показує:
- ✅ Необмежена генерація уроків
- ✅ Повний експорт презентацій
- ✅ Кастомізація шаблонів
- ✅ Пріоритетна підтримка
- Ціна: **$9/міс**
- CTA: "Оформити Pro підписку"

#### Історія платежів
Таблиця з історією платежів (тільки для Pro):
- Дата платежу
- Номер замовлення
- Сума
- Статус (completed/pending/failed)

### 3. 📊 Статистика (Stats)
Розширена статистика використання:

**Основні метрики:**
- 📚 Всього уроків
- 🎨 Всього слайдів
- ⚡ **Генерації (NEW)** - кількість використаних генерацій
- 📅 Уроків цього місяця

**Активність:**
- Остання активність
- Продуктивність (слайдів на урок)

**Аналіз:**
- Середня кількість слайдів
- Тип підписки (badge)

**Інформація про акаунт:**
- Дата реєстрації
- Останній вхід

### 4. 🔒 Безпека (Security)
- Зміна паролю
- Налаштування безпеки

---

## 🎨 Дизайн Features

### Візуальні індикатори

**Free користувач:**
- ⚪ Сірий колір теми
- ⚠️ Warning alerts при досягненні ліміту
- Progress bar червоніє при наближенні до ліміту

**Pro користувач:**
- 👑 Золота корона
- 🌟 Градієнт з золотистим відтінком
- ✅ Success badges
- Немає обмежень

### Адаптивність
- 📱 **Mobile**: 1 колонка
- 💻 **Tablet**: 2 колонки
- 🖥️ **Desktop**: 4 колонки (для статистики)

---

## 🔌 API Endpoints

### GET `/api/user/subscription`
Повертає дані підписки:

```typescript
{
  success: true,
  data: {
    subscription_type: 'free' | 'pro',
    subscription_expires_at: '2024-11-12T...' | null,
    generation_count: 3,
    last_generation_at: '2024-10-12T...' | null,
    payments: [
      {
        id: 'uuid',
        order_reference: 'TS-...',
        amount: 9,
        currency: 'USD',
        status: 'completed',
        created_at: '2024-10-12T...'
      }
    ]
  }
}
```

### GET `/api/user/stats`
Розширена статистика (оновлений):

```typescript
{
  success: true,
  stats: {
    totalLessons: 5,
    totalSlides: 42,
    lastActivity: '2024-10-12T...',
    monthlyLessons: 3,
    joinedAt: '2024-09-01T...',
    subscriptionType: 'free' | 'pro',
    generationCount: 3,        // NEW
    subscriptionExpiresAt: '2024-11-12T...' | null, // NEW
    lastSignIn: '2024-10-12T...'
  }
}
```

---

## 📦 Компоненти

### Нові файли:

**1. `SubscriptionSection.tsx`**
Головний компонент tab "Підписка"

**Features:**
- Subscription status card
- Generation usage with progress
- Pro features list
- Payment history table
- CTA buttons

**2. `src/app/api/user/subscription/route.ts`**
API endpoint для даних підписки

---

## 🎯 User Flow

### Free користувач

1. **Заходить на сторінку Account**
   - Бачить свій статус "Free"
   - Бачить використання: "2 / 3"

2. **Переходить на tab "Підписка"**
   - Бачить обмеження
   - Бачить переваги Pro
   - Бачить ціну $9/міс

3. **Натискає "Upgrade to Pro"**
   - Редирект на `/payment`
   - Оформлює підписку

4. **Повертається після оплати**
   - Бачить статус "Pro 🎉"
   - Бачить дату закінчення
   - Бачить історію платежів

### Pro користувач

1. **Заходить на сторінку Account**
   - Бачить корону 👑
   - Бачить "TeachSpark Pro"

2. **Переходить на tab "Підписка"**
   - Бачить дні до закінчення
   - Бачить "Необмежені генерації"
   - Бачить історію платежів

3. **Може відстежувати:**
   - Скільки уроків створено
   - Коли закінчиться підписка
   - Історію транзакцій

---

## 🔔 Alerts & Notifications

### Warning states:

**Досягнення ліміту:**
```
⚠️ Ліміт безкоштовних генерацій вичерпано.
Оформіть Pro підписку для необмежених генерацій!
[Оформити Pro →]
```

**Закінчення Pro:**
```
⚠️ Ваша підписка закінчується через 3 дні.
[Продовжити підписку →]
```

---

## 💡 Tips для користувачів

В компоненті можна додати корисні підказки:

**Free користувачам:**
- "💡 Pro підписка дає необмежені можливості!"
- "🎯 Створюйте стільки уроків, скільки потрібно"
- "⏰ Заощадьте 6 годин щотижня"

**Pro користувачам:**
- "🎉 Дякуємо за підтримку TeachSpark!"
- "💪 У вас необмежений доступ до всіх функцій"
- "📈 Створено вже X уроків - продовжуйте!"

---

## 🧪 Testing Scenarios

### Test 1: Free User Journey
```sql
-- Setup: Free user with 2 generations
UPDATE user_profiles 
SET 
  subscription_type = 'free',
  generation_count = 2
WHERE email = 'test@example.com';
```
**Expected:**
- ✅ Shows "2 / 3" usage
- ✅ Progress bar at 66%
- ✅ "Upgrade" button visible
- ✅ Pro features listed

### Test 2: Pro User
```sql
-- Setup: Pro user with active subscription
UPDATE user_profiles 
SET 
  subscription_type = 'pro',
  subscription_expires_at = NOW() + INTERVAL '25 days',
  generation_count = 15
WHERE email = 'test@example.com';
```
**Expected:**
- ✅ Shows "TeachSpark Pro 🎉"
- ✅ Shows "25 днів" remaining
- ✅ Shows "15" generations (no limit)
- ✅ Success badge visible

### Test 3: Expired Pro
```sql
-- Setup: Expired Pro subscription
UPDATE user_profiles 
SET 
  subscription_type = 'pro',
  subscription_expires_at = NOW() - INTERVAL '1 day'
WHERE email = 'test@example.com';
```
**Expected:**
- ⚠️ Should revert to Free status
- ⚠️ Should show upgrade prompt

---

## 📈 Analytics Events

Track these on Account page:

```typescript
// View subscription tab
posthog.capture('view_subscription_tab');

// Click upgrade button
posthog.capture('click_upgrade_button', {
  source: 'account_page',
  current_count: 3
});

// View payment history
posthog.capture('view_payment_history');
```

---

## 🚀 Готово!

**Новий tab "Підписка" повністю інтегрований:**
- ✅ Показує статус підписки
- ✅ Відображає використання генерацій
- ✅ Пропонує upgrade для Free
- ✅ Показує історію платежів
- ✅ Адаптивний дизайн
- ✅ Beautiful UI

**Доступ:** `/account` → Tab "Підписка"

