# 🚀 Deployment Guide - TeachSpark Platform

## Огляд

TeachSpark Platform - це Next.js 14+ додаток з TypeScript, використовує Supabase як backend та Material-UI для інтерфейсу.

## 📋 Передумови

- Node.js 18+
- npm або yarn
- Git репозиторій
- Supabase проект

## 🌟 Рекомендований варіант: Vercel

### Швидкий деплой

1. **Підключити до GitHub**
   ```bash
   git push origin master
   ```

2. **Деплой через Vercel CLI**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Або через Vercel Dashboard**
   - Зайти на [vercel.com](https://vercel.com)
   - Import Git Repository
   - Вибрати teachspark-platform
   - Налаштувати environment variables

### Environment Variables для Vercel

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
FAL_KEY=your_fal_key
```

## 🌐 Альтернативні варіанти

### Netlify

1. **Підключити репозиторій**
   ```bash
   # netlify.toml вже створений
   git push origin master
   ```

2. **Через Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Railway

1. **Через Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway deploy
   ```

2. **Environment Variables**
   - Додати через Railway Dashboard
   - Або через CLI: `railway variables set KEY=value`

### DigitalOcean App Platform

1. **Створити App**
   - Зайти в DigitalOcean Dashboard
   - Create → Apps
   - Підключити GitHub репозиторій

2. **Налаштування**
   ```yaml
   name: hibody-platform
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/hibody-platform
       branch: master
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     routes:
     - path: /
   ```

## 🔧 Налаштування для всіх платформ

### 1. Environment Variables

Необхідні змінні середовища:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
FAL_KEY=your_fal_key

# Optional
NODE_ENV=production
```

### 2. Build Settings

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### 3. Redirects (для SPA)

Більшість платформ автоматично налаштовують redirects для Next.js.

## 🗄️ База даних (Supabase)

### Автоматичне налаштування

Supabase автоматично надає:
- PostgreSQL базу даних
- Автентифікацію
- API endpoints
- Real-time підписки
- Storage для файлів

### Міграції

```bash
# Якщо потрібно запустити міграції
npm run db:migrate
```

## 📁 Структура файлів

```
hibody-platform/
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React компоненти
│   ├── services/          # Business logic
│   ├── types/            # TypeScript типи
│   └── utils/            # Utility функції
├── public/               # Статичні файли
├── vercel.json          # Vercel конфігурація
├── netlify.toml         # Netlify конфігурація
└── package.json         # Залежності
```

## 🔍 Моніторинг та логи

### Vercel
- Вбудований моніторинг
- Real-time логи
- Analytics

### Netlify
- Build логи
- Function логи
- Analytics

### Railway
- Application логи
- Metrics dashboard

## 🚨 Troubleshooting

### Помилки збірки

1. **Node.js версія**
   ```bash
   node --version  # Повинна бути 18+
   ```

2. **Залежності**
   ```bash
   npm ci  # Чиста установка
   ```

3. **Environment variables**
   - Перевірити всі ключі Supabase
   - Перевірити API ключі

### Помилки runtime

1. **Supabase підключення**
   - Перевірити URL та ключі
   - Переглянути логи в Supabase Dashboard

2. **API endpoints**
   - Перевірити CORS налаштування
   - Переглянути логи functions

## 📊 Performance

### Оптимізації включені

- ✅ Next.js Image Optimization
- ✅ Automatic Code Splitting
- ✅ Static Generation (SSG)
- ✅ Server-side Rendering (SSR)
- ✅ Material-UI Tree Shaking

### Metrics

- **Core Web Vitals**: Optimized
- **Bundle Size**: ~273kB (materials page)
- **First Load**: ~250kB (homepage)

## 🎯 Рекомендації

1. **Для продакшну**: Vercel (найкраща інтеграція з Next.js)
2. **Для експериментів**: Netlify (простий setup)
3. **Для enterprise**: AWS Amplify або DigitalOcean
4. **Для бюджетних проектів**: Railway або Render

## 🔗 Корисні посилання

- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment) 