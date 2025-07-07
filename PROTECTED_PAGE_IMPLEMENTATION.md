# Реалізація ProtectedPage компонента

## Проблема
При заході неавторизованих користувачів на захищені сторінки (наприклад, `/chat` або `/materials`) відбувалося мигання контенту - спочатку показувалася сторінка, а потім виконувався редирект на логін.

## Рішення
Створено компонент `ProtectedPage`, який показує завантаження поки відбувається перевірка авторизації, запобігаючи миганню контенту.

## Компоненти

### 1. ProtectedPage (`src/components/auth/ProtectedPage.tsx`)

```typescript
interface ProtectedPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Функціональність:**
- Використовує `useAuth` для перевірки стану авторизації
- Показує fallback (за замовчуванням `LoadingScreen`) поки йде перевірка
- Показує fallback якщо користувач не авторизований (редирект виконується AuthProvider)
- Рендерить дітей тільки для авторизованих користувачів

**Логіка:**
1. `loading = true` → показує завантаження
2. `user = null` → показує завантаження (редирект виконується в AuthProvider)
3. `user` існує → показує контент

## Інтеграція

### 2. Оновлені сторінки

#### Chat Page (`src/app/chat/page.tsx`)
```typescript
return (
  <ProtectedPage>
    <Layout title="Чат з ШІ" ...>
      {/* контент */}
    </Layout>
  </ProtectedPage>
);
```

#### Materials Page (`src/app/materials/page.tsx`)
```typescript
// Loading state
if (isLoading) {
  return (
    <ProtectedPage>
      <Layout title="Мої матеріали" ...>
        {/* завантаження */}
      </Layout>
    </ProtectedPage>
  );
}

return (
  <ProtectedPage>
    <Layout title="Мої матеріали" ...>
      {/* контент */}
    </Layout>
  </ProtectedPage>
);
```

## Переваги

1. **Запобігання миганню контенту** - користувачі не бачать захищений контент перед редиректом
2. **Уніфікований підхід** - всі захищені сторінки використовують один компонент
3. **Гнучкість** - можна налаштувати fallback для різних сценаріїв
4. **Простота використання** - достатньо обгорнути контент в `<ProtectedPage>`

## Робочий процес

1. Користувач заходить на захищену сторінку
2. `ProtectedPage` перевіряє стан авторизації через `useAuth`
3. Якщо `loading = true` → показує `LoadingScreen`
4. Якщо `user = null` → показує `LoadingScreen` (AuthProvider виконує редирект)
5. Якщо `user` існує → показує контент сторінки

## Експорт

Компонент додано до `src/components/auth/index.ts`:
```typescript
export { default as ProtectedPage } from './ProtectedPage';
```

## Результат

Тепер при заході неавторизованих користувачів на захищені сторінки:
- ❌ Раніше: мигання контенту → редирект
- ✅ Тепер: завантаження → редирект

Користувач бачить плавний перехід без мигання контенту, що покращує UX. 