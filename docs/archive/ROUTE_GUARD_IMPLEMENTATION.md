# RouteGuard Implementation - Централізований гард маршрутів

## Огляд
Створено універсальний компонент `RouteGuard`, який централізовано керує доступом до сторінок на основі статусу авторизації користувача.

## Проблема, яку вирішує
- **Дублювання логіки**: Раніше кожна сторінка мала свою логіку захисту через `ProtectedPage`
- **Складність підтримки**: Зміни в логіці доступу потребували оновлень у багатьох файлах
- **Неконсистентність**: Різні сторінки могли мати різну поведінку авторизації

## Архітектура

### Компонент RouteGuard (`src/components/auth/RouteGuard.tsx`)

```typescript
interface RouteGuardProps {
  children: React.ReactNode;
}
```

**Функціональність:**
- Перевіряє тип поточного маршруту (публічний, захищений, тільки для неавторизованих)
- Автоматично перенаправляє користувачів на відповідні сторінки
- Показує loading screen під час перевірок та редиректів
- Логує всі операції для дебагу

### Типи маршрутів

#### 1. Публічні маршрути (`publicRoutes`)
```typescript
const publicRoutes = [
  '/auth/login',
  '/auth/register', 
  '/test'
];
```
- Доступні всім користувачам
- Не потребують авторизації

#### 2. Маршрути тільки для неавторизованих (`authOnlyRoutes`)
```typescript
const authOnlyRoutes = [
  '/auth/login',
  '/auth/register'
];
```
- Доступні тільки неавторизованим користувачам
- Авторизовані користувачі перенаправляються

#### 3. Захищені маршрути (`protectedRoutes`)
```typescript
const protectedRoutes = [
  '/',
  '/chat',
  '/materials',
  '/account'
];
```
- Потребують авторизації
- Неавторизовані користувачі перенаправляються на логін

## Логіка роботи

### 1. Неавторизований користувач → Захищена сторінка
```
Користувач заходить на /chat
↓
RouteGuard виявляє: !user && isProtectedRoute
↓
Редирект на /auth/login?redirectTo=/chat
↓
Показує loading: "Перенаправлення на сторінку входу..."
```

### 2. Авторизований користувач → Сторінка авторизації
```
Користувач заходить на /auth/login
↓
RouteGuard виявляє: user && isAuthOnlyRoute
↓
Перевіряє redirectTo параметр
↓
Редирект на збережену сторінку або на /
↓
Показує loading: "Перенаправлення..."
```

### 3. Дозволений доступ
```
Перевірки пройдені
↓
Логування: "✅ RouteGuard: Access granted to /path"
↓
Рендер дочірніх компонентів
```

## Інтеграція в додаток

### Root Layout (`src/app/layout.tsx`)
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>
        <MUIThemeProvider>
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </MUIThemeProvider>
      </body>
    </html>
  );
}
```

**Порядок обгортання:**
1. `MUIThemeProvider` - надає тему Material-UI
2. `AuthProvider` - надає контекст авторизації
3. `RouteGuard` - перевіряє доступ до маршрутів
4. `children` - контент сторінки

## Відмінності від попереднього підходу

### Раніше (з ProtectedPage)
```typescript
// Кожна сторінка окремо
const ChatPage = () => (
  <ProtectedPage>
    <Layout>
      {/* контент */}
    </Layout>
  </ProtectedPage>
);

const MaterialsPage = () => (
  <ProtectedPage>
    <Layout>
      {/* контент */}
    </Layout>
  </ProtectedPage>
);
```

### Тепер (з RouteGuard)
```typescript
// Централізовано в layout
const RootLayout = ({ children }) => (
  <AuthProvider>
    <RouteGuard>
      {children}
    </RouteGuard>
  </AuthProvider>
);

// Сторінки спрощені
const ChatPage = () => (
  <Layout>
    {/* контент */}
  </Layout>
);

const MaterialsPage = () => (
  <Layout>
    {/* контент */}
  </Layout>
);
```

## Логування та дебаг

RouteGuard використовує детальне логування для відстеження:

```
🛡️ RouteGuard: Checking access to /chat
🛡️ RouteGuard: User status: Not authenticated
🛡️ RouteGuard: Route type: Protected
🔄 RouteGuard: Redirecting unauthorized user to login
```

**Емодзі позначення:**
- 🛡️ - Перевірка доступу
- 🔄 - Редирект
- ✅ - Доступ дозволено
- ❌ - Помилка

## Loading States

RouteGuard показує різні повідомлення залежно від ситуації:

1. **"Перевірка доступу..."** - під час ініціалізації
2. **"Перенаправлення на сторінку входу..."** - для неавторизованих на захищених сторінках
3. **"Перенаправлення..."** - для авторизованих на сторінках авторизації

## Переваги нового підходу

### 1. Централізація
- Вся логіка доступу в одному місці
- Легко змінювати правила для всього додатку

### 2. Зменшення дублювання коду
- Не потрібно обгортати кожну сторінку в `ProtectedPage`
- Менше коду для підтримки

### 3. Консистентність
- Однакова поведінка на всіх сторінках
- Уніфіковані повідомлення та логування

### 4. Гнучкість
- Легко додавати нові типи маршрутів
- Можна налаштувати різні правила для різних ролей

### 5. Краща UX
- Швидкі редиректи без мигання
- Зрозумілі повідомлення під час переходів

## Тестування

### Тестові сценарії

1. **Неавторизований доступ до захищених сторінок:**
   - `/chat` → редирект на `/auth/login?redirectTo=/chat`
   - `/materials` → редирект на `/auth/login?redirectTo=/materials`
   - `/account` → редирект на `/auth/login?redirectTo=/account`

2. **Авторизований доступ до сторінок авторизації:**
   - `/auth/login` → редирект на `/`
   - `/auth/register` → редирект на `/`

3. **Збереження redirectTo:**
   - `/auth/login?redirectTo=/chat` → після логіну редирект на `/chat`

4. **Публічний доступ:**
   - `/test` → доступ дозволено всім

### Перевірка в браузері

```bash
# Відкрити в режимі інкогніто:
http://localhost:3009/chat      # → /auth/login?redirectTo=/chat
http://localhost:3009/materials # → /auth/login?redirectTo=/materials
http://localhost:3009/account   # → /auth/login?redirectTo=/account
http://localhost:3009/test      # → доступ дозволено
```

## Файли, що були змінені

1. **Створено:**
   - `src/components/auth/RouteGuard.tsx` - новий компонент
   - `ROUTE_GUARD_IMPLEMENTATION.md` - документація

2. **Оновлено:**
   - `src/app/layout.tsx` - додано RouteGuard
   - `src/components/auth/index.ts` - додано експорт RouteGuard
   - `src/providers/AuthProvider.tsx` - спрощено (прибрано loading screen)

3. **Очищено від ProtectedPage:**
   - `src/app/chat/page.tsx`
   - `src/app/materials/page.tsx`
   - `src/app/account/page.tsx`

## Майбутні можливості

### Розширення функціональності
- Додати перевірку ролей користувачів
- Реалізувати conditional routing на основі subscription_type
- Додати whitelist/blacklist для IP адрес
- Інтегрувати з analytics для відстеження доступу

### Приклад розширення для ролей:
```typescript
const adminOnlyRoutes = ['/admin'];
const teacherRoutes = ['/chat', '/materials'];
const studentRoutes = ['/lessons', '/progress'];

// В RouteGuard
if (user && !hasPermission(user.role, pathname)) {
  // Редирект на unauthorized page
}
```

## Висновок

RouteGuard значно спрощує та покращує систему авторизації в додатку, забезпечуючи:
- Централізоване управління доступом
- Кращу безпеку та UX
- Легшу підтримку та розширення
- Детальне логування для дебагу

Система тепер готова до масштабування та додавання нових функцій авторизації. 