# Виправлення помилки з порядком хуків в AuthProvider

## Проблема

Виникла помилка: "React has detected a change in the order of Hooks called by AuthProvider"

```
Previous render            Next render
------------------------------------------------------
1. useState                   useState
2. useState                   useState
3. useState                   useState
4. useState                   useState
5. useState                   useState
6. useContext                 useContext
7. useContext                 useContext
8. useEffect                  useEffect
9. undefined                  useEffect
```

## Причина

В `AuthProvider` було два `useEffect` хуки:
1. Основний `useEffect` для ініціалізації авторизації
2. Умовний `useEffect` в кінці компонента для обробки редиректів

Це порушувало правила хуків React, тому що:
- Хуки повинні викликатися в тому самому порядку в кожному рендері
- Не можна розміщувати хуки після умовних операторів або return statements

## Рішення

Переструктурував код `AuthProvider`:

### До:
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useState хуки...
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Основна логіка ініціалізації
  }, [])

  // Інші функції...

  const value = { ... }
  
  // Публічні маршрути
  const publicRoutes = ['/auth/login', '/auth/register', '/test']
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  if (loading && !isPublicRoute) {
    return <LoadingScreen message="Перевірка авторизації..." />
  }

  // ❌ ПРОБЛЕМА: useEffect після умовного return
  useEffect(() => {
    if (!loading && initialized && authChecked && !user && !isPublicRoute && pathname) {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`
    }
  }, [loading, initialized, authChecked, user, isPublicRoute, pathname])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Після:
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useState хуки...
  const pathname = usePathname()
  const router = useRouter()

  // ✅ Публічні маршрути визначені на початку
  const publicRoutes = ['/auth/login', '/auth/register', '/test']
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  useEffect(() => {
    // Основна логіка ініціалізації
  }, [])

  // ✅ Окремий useEffect для редиректів на початку
  useEffect(() => {
    if (!loading && initialized && authChecked && !user && !isPublicRoute && pathname) {
      console.log('User not authenticated, redirecting to login from:', pathname)
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`
    }
  }, [loading, initialized, authChecked, user, isPublicRoute, pathname])

  // Інші функції...

  const value = { ... }

  if (loading && !isPublicRoute) {
    return <LoadingScreen message="Перевірка авторизації..." />
  }

  return (
    <AuthContext.Provider value={value}>
      <SessionManager />
      {children}
    </AuthContext.Provider>
  )
}
```

## Ключові зміни

1. **Переміщення логіки публічних маршрутів** - на початок компонента
2. **Переміщення useEffect для редиректів** - після основного useEffect
3. **Забезпечення сталого порядку хуків** - всі хуки викликаються в тому самому порядку

## Правила хуків React

1. **Завжди викликайте хуки на верхньому рівні** - не в циклах, умовах або вкладених функціях
2. **Викликайте хуки в тому самому порядку** - кожен рендер повинен мати однакову послідовність
3. **Не розміщуйте хуки після умовних return statements**

## Результат

- ❌ Раніше: Помилка "change in the order of Hooks"
- ✅ Тепер: Стабільний порядок хуків, немає помилок

Авторизація працює коректно без порушення правил React. 