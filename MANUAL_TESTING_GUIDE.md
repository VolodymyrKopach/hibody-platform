# 🧪 Мануальний тестовий план - Admin Real Data

## 📋 Перед початком

### Підготовка:
1. ✅ Міграції застосовані
2. ✅ Сервер запущений (`npm run dev`)
3. ✅ Є admin доступ
4. ✅ Є хоча б 1 звичайний користувач

---

## 🎯 PHASE 1: Activity Tracking (Auto-tracking)

### Тест 1.1: Створення уроку ✨

**Мета:** Перевірити чи створюється запис в `activity_log`

**Кроки:**
1. Відкрити `/create-lesson`
2. Заповнити форму:
   - Тема: "Test Math Lesson"
   - Предмет: "Mathematics"
   - Вікова група: "8-10"
   - Тривалість: 45 хв
3. Натиснути "Створити урок"
4. Дочекатись створення

**Перевірка в SQL:**
```sql
SELECT 
  action,
  entity_type,
  metadata->>'title' as lesson_title,
  metadata->>'subject' as subject,
  created_at
FROM activity_log 
WHERE action = 'lesson_created' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Очікуваний результат:**
- ✅ Запис з `action = 'lesson_created'`
- ✅ `metadata` містить назву, предмет, вікову групу
- ✅ `created_at` = щойно

---

### Тест 1.2: Генерація слайдів ✨

**Мета:** Перевірити tracking генерації слайдів

**Кроки:**
1. Відкрити щойно створений урок
2. Перейти до Step 3 (генерація слайдів)
3. Згенерувати хоча б 1 слайд
4. Дочекатись завершення

**Перевірка в SQL:**
```sql
SELECT 
  action,
  entity_type,
  metadata->>'title' as slide_title,
  metadata->>'type' as slide_type,
  metadata->>'slide_number' as number,
  created_at
FROM activity_log 
WHERE action = 'slide_generated' 
ORDER BY created_at DESC 
LIMIT 3;
```

**Очікуваний результат:**
- ✅ Запис(и) з `action = 'slide_generated'`
- ✅ `metadata` містить номер слайду, тип, назву
- ✅ По 1 записі на кожен згенерований слайд

---

### Тест 1.3: Створення worksheet ✨

**Мета:** Перевірити tracking worksheets

**Кроки:**
1. Відкрити `/worksheet-editor`
2. Створити worksheet (будь-якого типу)
3. Зберегти

**Перевірка в SQL:**
```sql
SELECT 
  action,
  entity_type,
  metadata->>'title' as worksheet_title,
  metadata->>'type' as worksheet_type,
  created_at
FROM activity_log 
WHERE action = 'worksheet_created' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Очікуваний результат:**
- ✅ Запис з `action = 'worksheet_created'`
- ✅ `metadata` містить тип і назву worksheet

---

## 📊 PHASE 2: User Activity Stats (Aggregation)

### Тест 2.1: Перевірка daily stats ✨

**Мета:** Перевірити чи оновлюється `user_activity_stats`

**Після виконання Тестів 1.1-1.3:**

**Перевірка в SQL:**
```sql
SELECT 
  date,
  period_type,
  lessons_created,
  slides_generated,
  worksheets_created,
  actions_count,
  last_activity_at
FROM user_activity_stats 
WHERE user_id = auth.uid()  -- ← твій user_id
  AND period_type = 'daily'
  AND date = CURRENT_DATE
ORDER BY date DESC;
```

**Очікуваний результат:**
- ✅ Запис за сьогоднішній день
- ✅ `lessons_created >= 1`
- ✅ `slides_generated >= 1`  
- ✅ `worksheets_created >= 1`
- ✅ `actions_count >= 3`

---

### Тест 2.2: Історія активності ✨

**Мета:** Перевірити загальну статистику

**Перевірка в SQL:**
```sql
-- Вся активність поточного користувача
SELECT 
  action,
  COUNT(*) as count
FROM activity_log 
WHERE user_id = auth.uid()
GROUP BY action
ORDER BY count DESC;
```

**Очікуваний результат:**
- ✅ Список всіх дій з кількістю
- ✅ Мінімум: lesson_created, slide_generated, worksheet_created

---

## 👥 PHASE 3: User Cohorts (Retention)

### Тест 3.1: Перевірка cohort entry ✨

**Мета:** Переконатись що користувачі додаються в cohorts

**Перевірка в SQL:**
```sql
SELECT 
  cohort_date,
  registration_date,
  first_lesson_date,
  days_to_first_lesson,
  is_active,
  last_activity_date
FROM user_cohorts 
WHERE user_id = auth.uid();
```

**Очікуваний результат:**
- ✅ Запис існує
- ✅ `cohort_date` = перший день місяця реєстрації
- ✅ `first_lesson_date` = дата першого уроку (якщо був)
- ✅ `days_to_first_lesson` = різниця в днях
- ✅ `is_active = true` (якщо є активність за останні 30 днів)

---

### Тест 3.2: Cohort aggregation ✨

**Мета:** Подивитись на cohorts по місяцях

**Перевірка в SQL:**
```sql
SELECT 
  cohort_date,
  COUNT(*) as users_count,
  COUNT(CASE WHEN first_lesson_date IS NOT NULL THEN 1 END) as created_lesson,
  AVG(days_to_first_lesson) as avg_days_to_lesson,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM user_cohorts 
GROUP BY cohort_date
ORDER BY cohort_date DESC;
```

**Очікуваний результат:**
- ✅ Дані по кожному місяцю
- ✅ Кількість користувачів в cohort
- ✅ Скільки створили урок
- ✅ Середній час до першого уроку

---

## 🏦 PHASE 4: Finance & Payments (WayForPay)

### Тест 4.1: Симуляція платежу ✨

**⚠️ Важливо:** Це тільки для тестування БД логіки (НЕ реальний платіж!)

**Створення тестового платежу в SQL:**
```sql
INSERT INTO payments (
  user_id,
  order_reference,
  amount,
  currency,
  status,
  payment_system,
  plan_type,
  generations_granted
) VALUES (
  auth.uid(),  -- твій user_id
  'TEST-' || gen_random_uuid()::text,
  9.00,
  'USD',
  'pending',  -- спочатку pending
  'wayforpay',
  'professional',
  20
)
RETURNING id, order_reference;
```

**Копіюй `id` з результату!**

---

### Тест 4.2: Завершення платежу ✨

**Мета:** Перевірити автоматичну обробку платежу

**Оновлення статусу на completed:**
```sql
-- Заміни 'payment-id' на ID з попереднього кроку
UPDATE payments 
SET status = 'completed'
WHERE id = 'payment-id'::uuid;
```

**Перевірка результатів:**

1. **Subscription History:**
```sql
SELECT 
  previous_type,
  new_type,
  previous_generations,
  new_generations,
  generations_added,
  change_reason,
  created_at
FROM subscription_history 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 1;
```

**Очікуваний результат:**
- ✅ `previous_type = 'free'` (або попередній тип)
- ✅ `new_type = 'professional'`
- ✅ `generations_added = 20`
- ✅ `change_reason = 'payment_received'`

2. **User Profile:**
```sql
SELECT 
  subscription_type,
  generation_count
FROM user_profiles 
WHERE id = auth.uid();
```

**Очікуваний результат:**
- ✅ `subscription_type = 'professional'`
- ✅ `generation_count` збільшився на 20

3. **Activity Log:**
```sql
SELECT 
  action,
  metadata
FROM activity_log 
WHERE user_id = auth.uid()
  AND action IN ('payment_succeeded', 'subscription_started')
ORDER BY created_at DESC 
LIMIT 2;
```

**Очікуваний результат:**
- ✅ Запис `payment_succeeded` з деталями
- ✅ Запис `subscription_started` (якщо тип змінився)

---

## 📊 PHASE 5: Admin Dashboard

### Тест 5.1: Finance Dashboard ✨

**URL:** `http://localhost:3000/admin/finance`

**Що перевіряти:**

1. **Revenue Metrics:**
   - ✅ Total Revenue показує тестовий платіж ($9)
   - ✅ MRR відображається
   - ✅ Revenue by Plan показує Professional: $9

2. **Subscriptions:**
   - ✅ Total Active subscriptions >= 1
   - ✅ By Plan показує Professional: 1

3. **Trends:**
   - ✅ Графік показує дані за останні 30 днів
   - ✅ Є точка з тестовим платежем

**SQL для перевірки:**
```sql
-- Дані які має показувати dashboard
SELECT 
  SUM(amount) as total_revenue,
  COUNT(*) as payments_count,
  plan_type,
  COUNT(*) as count_by_plan
FROM payments 
WHERE status = 'completed'
GROUP BY plan_type;
```

---

### Тест 5.2: Analytics Dashboard ✨

**URL:** `http://localhost:3000/admin/analytics`

**Що перевіряти:**

1. **Engagement Metrics:**
   - ✅ DAU показує кількість активних користувачів сьогодні
   - ✅ Графік DAU має дані

2. **User Segments:**
   - ✅ Показує розподіл користувачів (Power/Regular/Occasional)
   - ✅ Числа відповідають реальності

3. **Feature Usage:**
   - ✅ Lesson Creation: кількість створених уроків
   - ✅ Slide Generation: кількість згенерованих слайдів
   - ✅ Adoption Rate показується

4. **Content Popularity:**
   - ✅ Popular Subjects (з твоїх уроків)
   - ✅ Popular Age Groups

**SQL для перевірки DAU:**
```sql
-- Унікальні користувачі сьогодні
SELECT COUNT(DISTINCT user_id) as dau
FROM activity_log 
WHERE DATE(created_at) = CURRENT_DATE;
```

---

### Тест 5.3: Settings Dashboard ✨

**URL:** `http://localhost:3000/admin/settings`

**Що перевіряти:**

1. **Platform Settings:**
   - ✅ Maintenance Mode (toggle працює)
   - ✅ Registration Enabled
   - ✅ AI Generation Enabled
   - ✅ Feature Flags відображаються

2. **Generation Limits:**
   - ✅ Free: 3 generations
   - ✅ Professional: 20 generations
   - ✅ Ціна $9

**SQL для перевірки:**
```sql
SELECT 
  setting_key,
  setting_value,
  category
FROM platform_settings 
ORDER BY category, setting_key;
```

3. **Спробувати змінити налаштування:**
   - Вимкнути/увімкнути Maintenance Mode
   - Перевірити в SQL чи зберіглось:
```sql
SELECT setting_value 
FROM platform_settings 
WHERE setting_key = 'maintenance_mode';
```

---

### Тест 5.4: Users Detail Page ✨

**URL:** `http://localhost:3000/admin/users/[твій-user-id]`

**Що перевіряти:**

1. **User Info:**
   - ✅ Email відображається
   - ✅ Subscription Type = 'professional'
   - ✅ Generation Count показує правильну кількість

2. **Activity Log:**
   - ✅ Список останніх дій
   - ✅ lesson_created, slide_generated, worksheet_created
   - ✅ payment_succeeded

3. **Statistics:**
   - ✅ Lessons Created: кількість
   - ✅ Slides Generated: кількість
   - ✅ Worksheets Created: кількість

4. **Subscription History:**
   - ✅ Історія змін підписки
   - ✅ Тестовий платіж відображається

---

## 🔄 PHASE 6: Background Jobs (Опціонально)

### Тест 6.1: Manual Stats Aggregation ✨

**Виконати в SQL:**
```sql
-- Weekly aggregation
SELECT aggregate_weekly_stats();

-- Monthly aggregation  
SELECT aggregate_monthly_stats();

-- Retention calculation
SELECT calculate_retention();
```

**Перевірка:**
```sql
-- Weekly stats
SELECT * FROM user_activity_stats 
WHERE period_type = 'weekly' 
ORDER BY date DESC LIMIT 5;

-- Monthly stats
SELECT * FROM user_activity_stats 
WHERE period_type = 'monthly' 
ORDER BY date DESC LIMIT 5;

-- Retention rates
SELECT 
  cohort_date,
  active_day_1,
  active_day_7,
  active_day_30
FROM user_cohorts 
ORDER BY cohort_date DESC;
```

---

## ✅ Чеклист швидкої перевірки

### Мінімальний тест (5 хвилин):
- [ ] 1. Створити урок → перевірити `activity_log`
- [ ] 2. Згенерувати слайд → перевірити `activity_log`
- [ ] 3. Відкрити `/admin/finance` → побачити метрики
- [ ] 4. Відкрити `/admin/analytics` → побачити DAU
- [ ] 5. Відкрити `/admin/settings` → побачити налаштування

### Повний тест (20 хвилин):
- [ ] Всі кроки з Phase 1-6
- [ ] Перевірка всіх SQL запитів
- [ ] Тестування admin dashboard
- [ ] Симуляція платежу

---

## 🐛 Що робити якщо щось не працює?

### Проблема: Activity log порожній
**Рішення:**
```sql
-- Перевірити тригери
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%track%';
```

### Проблема: Stats не оновлюються
**Рішення:**
```sql
-- Перевірити тригер на activity_log
SELECT trigger_name 
FROM information_schema.triggers
WHERE event_object_table = 'activity_log';

-- Manually оновити stats
SELECT increment_user_stats(auth.uid(), 'lesson_created', 1);
```

### Проблема: Finance dashboard порожній
**Рішення:**
```sql
-- Перевірити чи є payments
SELECT * FROM payments WHERE status = 'completed';

-- Створити тестовий платіж (див. Phase 4)
```

### Проблема: User detail page не працює
**Рішення:**
- Перевірити API endpoint: `/api/admin/users/[id]`
- Переконатись що є admin rights
- Перевірити консоль браузера на помилки

---

## 📝 Фінальна перевірка

Після всіх тестів:

```sql
-- Загальна статистика системи
SELECT 
  'Total Users' as metric, 
  COUNT(*)::text as value 
FROM user_profiles
UNION ALL
SELECT 
  'Total Lessons', 
  COUNT(*)::text 
FROM lessons
UNION ALL
SELECT 
  'Total Activity Records', 
  COUNT(*)::text 
FROM activity_log
UNION ALL
SELECT 
  'Total Payments', 
  COUNT(*)::text 
FROM payments WHERE status = 'completed'
UNION ALL
SELECT 
  'Platform Settings', 
  COUNT(*)::text 
FROM platform_settings;
```

---

**Готовий до тестування?** 🚀

1. Почни з Phase 1 (створи урок)
2. Перевіряй кожен крок в SQL
3. Потім переходь до Admin Dashboard
4. Фіналізуй тестовим платежем

**Успіхів!** ✨

