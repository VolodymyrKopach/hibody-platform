# Тест-кейси Admin Users Page

**Версія:** 1.0 (після Token Tracking Implementation)  
**Дата:** 2024-10-15

---

## ТЕСТ #1: Відображення списку користувачів

**Мета:** Перевірити що список користувачів завантажується з реальними даними

**Кроки:**
1. Залогінься як Super Admin
2. Перейди `/admin/users`
3. Дочекайся завантаження (skeleton → дані)
4. Подивись на перших 5 користувачів

**Очікуваний результат:**
- ✅ Список відображається
- ✅ Email видно
- ✅ Full Name відображається (або "No Name")
- ✅ Lessons Count - це числа (не 0 для всіх)
- ✅ Subscription Status показує правильні значення (free/professional/etc)
- ✅ Last Sign In відображається (не "Never" для всіх)
- ✅ Admin badge видно для адмінів (червоний для Super Admin, синій для Admin)

**Що перевіряємо:**
- Реальні дані з auth.users
- Реальні підрахунки lessons/slides/worksheets
- Правильні ролі адмінів

---

## ТЕСТ #2: Пошук користувачів

**Мета:** Перевірити що пошук працює по email та імені

**Кроки:**
1. Перейди `/admin/users`
2. Запиши Total Users: _____
3. В поле пошуку введи частину email (наприклад "test")
4. Почекай 500ms (debounce)
5. Очисти пошук → введи частину імені

**Очікуваний результат:**
- ✅ Пошук по email працює
- ✅ Пошук по імені працює  
- ✅ Показує правильну кількість результатів
- ✅ Total count оновлюється
- ✅ Empty state якщо нічого не знайдено
- ✅ Можна очистити фільтр

**Що перевіряємо:**
- Filter-then-paginate логіка працює правильно

---

## ТЕСТ #3: Фільтрація по ролях

**Мета:** Перевірити фільтр Role (All/Users/Admin/Super Admin)

**Кроки:**
1. Перейди `/admin/users`
2. Запиши Total: _____
3. Фільтр Role → `Users`
4. Запиши кількість: _____
5. Фільтр Role → `Admin`
6. Запиши кількість: _____
7. Фільтр Role → `Super Admin`

**Очікуваний результат:**
- ✅ All - показує всіх користувачів
- ✅ Users - тільки без admin badge
- ✅ Admin - тільки з синім Admin badge
- ✅ Super Admin - тільки з червоним Super Admin badge
- ✅ Сума Users + Admins + Super Admins = Total Users

**Перевірка пагінації:**
- ✅ Після фільтрації показує правильну кількість сторінок
- ✅ Не показує порожні сторінки

---

## ТЕСТ #4: Фільтрація по підпискам

**Мета:** Перевірити фільтр Subscription Status

**Кроки:**
1. Перейди `/admin/users`
2. Фільтр Subscription → `Free`
3. Перевір що всі мають chip "Free"
4. Фільтр Subscription → `Active`
5. Перевір що всі мають chip "Active" (зелений)
6. Комбінуй з пошуком

**Очікуваний результат:**
- ✅ Free - тільки безкоштовні
- ✅ Active - тільки з активними підписками
- ✅ Trial - тільки trial користувачі
- ✅ Cancelled - скасовані підписки
- ✅ Комбінація пошук + фільтр працює

---

## ТЕСТ #5: Пагінація зі фільтрами

**Мета:** Перевірити що пагінація працює правильно після фільтрації

**Передумова:** Мінімум 25 користувачів в БД

**Кроки:**
1. Перейди `/admin/users`
2. Запиши Total Users: _____
3. Введи пошук (щоб залишилось >20 результатів)
4. Перевір Total Pages
5. Перейди на сторінку 2
6. Перевір що показано правильні користувачі (offset 20-40)
7. Введи фільтр що залишає <10 результатів
8. Перевір що pagination зник або показує 1 сторінку

**Очікуваний результат:**
- ✅ Total pages розраховується після фільтрації
- ✅ Кожна сторінка показує до 20 користувачів
- ✅ Немає дублікатів
- ✅ Немає порожніх сторінок
- ✅ Pagination ховається якщо ≤ 20 результатів

**Перевіряємо FIX:**
- ❌ СТАРА ПРОБЛЕМА: Пагінація спочатку, потім фільтр → неправильна кількість
- ✅ НОВА ЛОГІКА: Фільтр спочатку, потім пагінація → правильно

---

## ТЕСТ #6: Деталі користувача - основна інформація

**Мета:** Перевірити що UserDetail API повертає реальні дані

**Кроки:**
1. Перейди `/admin/users`
2. Клікни на будь-якого користувача
3. Дочекайся завантаження деталей
4. Перевір всі секції

**Очікуваний результат:**

**User Info Card:**
- ✅ Avatar з першою літерою email
- ✅ Full Name (або "No Name")
- ✅ Email правильний
- ✅ Admin badge якщо є
- ✅ Subscription chip (Free/Active/Trial/Cancelled)

**Dates:**
- ✅ Joined - реальна дата створення
- ✅ Last Sign In - НЕ null (реальна дата з auth.users)
- ✅ Last Activity - останній запис з activity_log
- ✅ Total Paid - сума платежів

**Перевіряємо FIX:**
- ❌ БУЛО: `last_sign_in_at: null // TODO: Track last sign in`
- ✅ ТЕПЕР: Реальна дата з `auth.users`

---

## ТЕСТ #7: Stats Cards - реальні підрахунки

**Мета:** Перевірити що статистика не замокана

**Кроки:**
1. Відкрий деталі користувача
2. Подивись на 4 stat cards
3. Порівняй з БД через Supabase Dashboard

**Очікуваний результат:**

**Lessons Created:**
- ✅ Відповідає `SELECT COUNT(*) FROM lessons WHERE user_id = '...'`

**Slides Generated:**
- ✅ Відповідає `SELECT COUNT(*) FROM slides s JOIN lessons l ON s.lesson_id = l.id WHERE l.user_id = '...'`

**Worksheets Created:**
- ✅ Відповідає `SELECT COUNT(*) FROM worksheets WHERE user_id = '...'`

**AI Requests:**
- ✅ Підраховує з activity_log (actions: slide_generated, worksheet_created, ai_request_completed)
- ❌ БУЛО: `total_ai_requests: 0 // TODO: Implement tracking`
- ✅ ТЕПЕР: Реальний COUNT з activity_log

---

## ТЕСТ #8: Token Usage & Cost 💰 (NEW!)

**Мета:** Перевірити новий функціонал tracking токенів

**Передумова:** Користувач згенерував щось через AI

**Кроки:**
1. Згенеруй worksheet або lesson plan як test user
2. Перейди `/admin/users` → клікни на test user
3. Знайди секцію "Token Usage & Cost"

**Очікуваний результат:**

**Total Tokens Used:**
- ✅ Показує число в K (наприклад "15.2K")
- ✅ Below: точне число токенів "15,234 tokens"

**Total Cost:**
- ✅ Показує вартість в USD (наприклад "$0.0045")
- ✅ Синій колір (primary)
- ✅ Below: "USD spent on AI"

**Average Cost per Request:**
- ✅ Розрахунок: total_cost / total_ai_requests
- ✅ Показує "$0.0003" format

**Перевірка в БД:**
```sql
SELECT 
  SUM(total_tokens) as total_tokens,
  SUM(total_cost) as total_cost,
  COUNT(*) as requests
FROM token_usage 
WHERE user_id = 'USER_ID';
```

**Перевіряємо FIX:**
- ❌ БУЛО: `total_tokens_used: 0 // TODO`, `total_tokens_cost: 0 // TODO`
- ✅ ТЕПЕР: Реальні дані з token_usage таблиці

---

## ТЕСТ #9: Generation Limit - реальні дані

**Мета:** Перевірити що ліміти не захардкоджені

**Кроки:**
1. Відкрий деталі користувача
2. Знайди "Generation Limit" секцію
3. Подивись на progress bar та числа

**Очікуваний результат:**
- ✅ Used / Total відповідає generation_limits таблиці
- ✅ Progress bar заповнений правильно (наприклад 3/10 = 30%)
- ✅ Кнопка "Edit" відкриває діалог

**Перевірка в БД:**
```sql
SELECT used, total, reset_at 
FROM generation_limits 
WHERE user_id = 'USER_ID';
```

**Перевіряємо FIX:**
- ❌ БУЛО: `generation_limit_used: 0`, `generation_limit_total: 10 // hardcoded`
- ✅ ТЕПЕР: Реальні дані з generation_limits таблиці

---

## ТЕСТ #10: Recent Activity

**Мета:** Перевірити що активність відображається

**Кроки:**
1. Користувач створює lesson
2. Користувач генерує slide
3. Відкрий деталі користувача
4. Прокрути до "Recent Activity"

**Очікуваний результат:**
- ✅ Показує останні 10-20 записів
- ✅ Action chips (lesson_created, slide_generated, etc)
- ✅ Entity Type (lesson, slide, worksheet)
- ✅ Дата правильна
- ✅ Сортування: найновіші зверху

---

## ТЕСТ #11: Make Admin - тільки Super Admin 👑

**Мета:** Перевірити що тільки Super Admin може призначати адмінів

**Кроки:**
1. Залогінься як **Super Admin**
2. Перейди `/admin/users`
3. Знайди звичайного користувача (без admin badge)
4. Подивись на Actions колонку

**Очікуваний результат (Super Admin):**
- ✅ Кнопка "PersonAdd" (Make Admin) видима
- ✅ Кнопка "View" (ViewIcon) видима
- ✅ Клік на PersonAdd відкриває діалог
- ✅ Діалог показує 2 опції: Admin / Super Admin
- ✅ Після призначення - admin badge з'являється
- ✅ Кнопка Make Admin зникає

**Кроки 2 (звичайний Admin):**
1. Вийди з Super Admin
2. Залогінься як **Admin** (не Super)
3. Перейди `/admin/users`

**Очікуваний результат (Admin):**
- ✅ Кнопка "Make Admin" НЕ видима
- ✅ Тільки кнопка "View" є

**Перевірка API:**
```javascript
// Від імені звичайного адміна
fetch('/api/admin/users/make-admin', {
  method: 'POST',
  body: JSON.stringify({ userId: 'xxx', role: 'admin' })
})
// Має повернути { error: "Only super admins can assign admin roles", status: 403 }
```

---

## ТЕСТ #12: Make Admin Dialog

**Мета:** Перевірити UI та логіку діалогу призначення адміна

**Кроки:**
1. Як Super Admin клікни "Make Admin" для користувача
2. В діалозі подивись на контент
3. Обери "Admin" → Confirm
4. Refresh сторінки

**Очікуваний результат:**

**Діалог:**
- ✅ Заголовок: "Assign Admin Role" з іконкою AdminPanelSettings
- ✅ User info: ім'я та email
- ✅ Dropdown з 2 опціями:
  - Admin: "Can manage users, lessons, and view analytics"
  - Super Admin: "Full access including admin management"
- ✅ Warning: "This user will gain admin access"
- ✅ Кнопки: Cancel / Confirm

**Після Confirm:**
- ✅ Діалог закривається
- ✅ Список оновлюється
- ✅ Користувач має admin badge
- ✅ Кнопка Make Admin зникла для цього користувача

**Activity Log:**
```sql
SELECT * FROM activity_log 
WHERE action = 'admin_created' 
ORDER BY created_at DESC LIMIT 1;
```
- ✅ Запис є з правильними даними

---

## ТЕСТ #13: Remove Admin

**Мета:** Перевірити видалення admin ролі

**Передумова:** Є користувач з admin роллю (не Super Admin)

**Кроки:**
1. Перейди `/admin/users`
2. Відкрий деталі користувача з Admin роллю
3. Клікни "Delete" (має бути кнопка для зняття ролі - якщо реалізовано)
4. АБО через діалог на main page

**Очікуваний результат:**
- ✅ Super Admin може видалити Admin
- ✅ Після видалення - admin badge зникає
- ✅ Кнопка Make Admin з'являється знову
- ✅ Activity log: `admin_deleted`

**Безпека:**
- ❌ Super Admin НЕ може видалити сам себе
- ✅ API повертає помилку: "Cannot remove your own admin role"

---

## ТЕСТ #14: Refresh Button

**Мета:** Перевірити що Refresh оновлює список

**Кроки:**
1. Перейди `/admin/users`
2. Запиши Total Users: _____
3. В іншій вкладці зареєструй нового користувача
4. Поверни до `/admin/users`
5. Клікни кнопку "Refresh" (RefreshIcon в header)

**Очікуваний результат:**
- ✅ Total Users +1
- ✅ Новий користувач в списку
- ✅ Loading state під час refresh

---

## ТЕСТ #15: Empty States

**Мета:** Перевірити що empty states виглядають добре

**Кроки:**
1. Перейди `/admin/users`
2. Введи пошук що нічого не знайде (наприклад "zzzzzzzzz")

**Очікуваний результат:**
- ✅ Іконка People (PeopleIcon) великого розміру
- ✅ Заголовок: "No Users Found"
- ✅ Текст: "No users match your current filters..."
- ✅ Кнопка "Clear All Filters"
- ✅ Клік очищає пошук та фільтри

---

## ТЕСТ #16: Sorting (якщо реалізовано)

**Мета:** Перевірити сортування

**Кроки:**
1. Перейди `/admin/users`
2. Клікни на header "Joined"
3. Перевір порядок

**Очікуваний результат:**
- ✅ Сортування DESC (найновіші зверху)
- ✅ ASC (найстаріші зверху)
- ✅ URL оновлюється з `sort_by=created_at&sort_order=desc`

---

## ТЕСТ #17: Security - RLS Policies

**Мета:** Перевірити що не-адміни не бачать список

**Кроки:**
1. Вийди з admin акаунту
2. Залогінься як звичайний користувач
3. Спробуй відкрити `/admin/users`
4. Спробуй API: `fetch('/api/admin/users').then(r => r.json())`

**Очікуваний результат:**
- ✅ Redirect на `/` або 403
- ✅ API: `{ error: "Unauthorized", status: 403 }`
- ✅ Дані НЕ витікають
- ✅ Console errors про доступ

**Перевірка token_usage RLS:**
```sql
-- Як звичайний юзер
SELECT * FROM token_usage WHERE user_id != auth.uid();
-- Має повернути 0 rows (бачить тільки свої)
```

---

## ТЕСТ #18: Performance - багато користувачів

**Мета:** Перевірити швидкість з великою кількістю користувачів

**Передумова:** 100+ користувачів в БД

**Кроки:**
1. Перейди `/admin/users`
2. Засіки час завантаження
3. Scroll вниз (всі 20 користувачів)
4. Змінюй фільтри
5. Pagination

**Очікуваний результат:**
- ✅ Завантаження < 2 секунди
- ✅ Фільтри працюють швидко (< 500ms)
- ✅ Pagination миттєва
- ✅ Немає лагів при scroll

**Network:**
- ✅ Один запит до `/api/admin/users?...`
- ✅ Розмір відповіді < 100KB для 20 користувачів
- ✅ Стискання (gzip) працює

---

## ТЕСТ #19: Token Usage - точність підрахунків

**Мета:** Перевірити правильність розрахунку вартості

**Кроки:**
1. Згенеруй worksheet (використовує ~5000-10000 токенів)
2. Запиши з БД скільки токенів витрачено
3. Відкрий деталі користувача
4. Порівняй Total Cost

**Розрахунок вручну:**
```
Input tokens: 2000
Output tokens: 8000
Total: 10000

Gemini 2.5 Flash ціна:
Input: $0.075 per 1M = 2000 * 0.075 / 1,000,000 = $0.00015
Output: $0.30 per 1M = 8000 * 0.30 / 1,000,000 = $0.0024
Total: $0.00255
```

**Очікуваний результат:**
- ✅ Total Cost збігається з розрахунком
- ✅ Округлення до 4 знаків після коми
- ✅ БД: `SELECT total_cost FROM token_usage WHERE user_id = '...'`

**Перевірка pricing:**
```sql
SELECT * FROM ai_model_pricing WHERE model_name = 'gemini-2.5-flash';
-- Має бути: input_price_per_1m = 0.075, output_price_per_1m = 0.30
```

---

## ТЕСТ #20: Multiple Admin Actions

**Мета:** Перевірити що одночасні дії не ламають систему

**Кроки:**
1. Відкрий 2 вкладки як Super Admin
2. Вкладка 1: Make Admin для User A
3. Вкладка 2: Make Admin для User B (швидко після першого)
4. Обидві вкладки: Refresh

**Очікуваний результат:**
- ✅ Обидва користувачі стали адмінами
- ✅ Немає race conditions
- ✅ Activity log має 2 записи `admin_created`
- ✅ UI правильно оновлюється в обох вкладках

---

## ФІНАЛЬНА ТАБЛИЦЯ ПЕРЕВІРКИ

```
ФУНКЦІЯ                        │ ПРАЦЮЄ │ ПРОБЛЕМИ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Список користувачів            │ ✅/❌  │ _______________
Реальні дані (не TODO)         │ ✅/❌  │ _______________
Last Sign In відображається    │ ✅/❌  │ _______________
Пошук (email + name)           │ ✅/❌  │ _______________
Фільтр Role                    │ ✅/❌  │ _______________
Фільтр Subscription            │ ✅/❌  │ _______________
Пагінація після фільтрів       │ ✅/❌  │ _______________
Деталі користувача             │ ✅/❌  │ _______________
Stats Cards (реальні)          │ ✅/❌  │ _______________
Token Usage & Cost             │ ✅/❌  │ _______________
Generation Limit (не hardcode) │ ✅/❌  │ _______________
Recent Activity                │ ✅/❌  │ _______________
Make Admin (Super Admin only)  │ ✅/❌  │ _______________
Make Admin Dialog              │ ✅/❌  │ _______________
Remove Admin                   │ ✅/❌  │ _______________
Refresh Button                 │ ✅/❌  │ _______________
Empty States                   │ ✅/❌  │ _______________
Security (RLS)                 │ ✅/❌  │ _______________
Performance (<2s load)         │ ✅/❌  │ _______________
Token Cost точність            │ ✅/❌  │ _______________
```

## ВИПРАВЛЕНІ ПРОБЛЕМИ ✅

**До реалізації (TODO коментарі):**
```typescript
phone: null, // TODO: Add phone field
last_sign_in_at: null, // TODO: Track last sign in
total_ai_requests: 0, // TODO: Implement tracking
generation_limit_used: 0, // TODO: Get from generation_limits
generation_limit_total: 10, // TODO: Get from config
```

**Після реалізації:**
- ✅ `phone` - видалено (не потрібно)
- ✅ `last_sign_in_at` - реальна дата з `auth.users`
- ✅ `total_ai_requests` - COUNT з `activity_log`
- ✅ `generation_limit_used` - з `generation_limits` таблиці
- ✅ `generation_limit_total` - з `generation_limits` таблиці
- ✅ `total_tokens_used` - SUM з `token_usage` таблиці (NEW!)
- ✅ `total_tokens_cost` - SUM з `token_usage` таблиці (NEW!)

**Виправлена пагінація:**
- ❌ БУЛО: Paginate → Filter (неправильна кількість)
- ✅ ТЕПЕР: Filter → Paginate (правильно)

**Нова функціональність:**
- ✅ Token Usage tracking з вартістю
- ✅ Make Admin (тільки Super Admin)
- ✅ Remove Admin
- ✅ AI Model Pricing в БД

---

**Знайдені баги (заповнити під час тестування):**
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Загальний висновок:** ✅ Все працює / ❌ Є проблеми

**Підпис тестувальника:** ________________ **Дата:** __________

