# 🎓 TeachSpark Platform

> AI-powered educational platform for creating interactive lessons with presentations

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui)](https://mui.com/)

## ✨ Особливості

🤖 **AI-генерація контенту** - Створення слайдів та уроків за допомогою Claude AI  
🎨 **Інтерактивні презентації** - Повноекранний режим презентації з навігацією  
📱 **Адаптивний дизайн** - Працює на всіх пристроях  
🔐 **Автентифікація** - Безпечна система користувачів через Supabase  
💾 **База даних** - PostgreSQL з Row Level Security  
🎯 **Чат-інтерфейс** - Інтуїтивне створення уроків через діалог  
📊 **Управління матеріалами** - Організація та перегляд створених уроків  

## 🚀 Демо

[🔗 Переглянути живу демо](https://teachspark-platform.vercel.app)

## 📸 Скріншоти

### Головна сторінка
![Home Page](docs/images/home.png)

### Чат для створення уроків
![Chat Interface](docs/images/chat.png)

### Перегляд матеріалів
![Materials View](docs/images/materials.png)

### Режим презентації
![Presentation Mode](docs/images/presentation.png)

## 🛠️ Технології

### Frontend
- **Next.js 14+** - React framework з App Router
- **TypeScript** - Типізований JavaScript
- **Material-UI** - Готові React компоненти
- **Lucide React** - Іконки

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Реляційна база даних
- **Row Level Security** - Безпека на рівні даних

### AI & Services
- **Anthropic Claude** - Генерація контенту
- **FAL.ai** - Генерація зображень
- **Next.js API Routes** - Serverless functions

### Розробка
- **ESLint** - Лінтинг коду
- **Prettier** - Форматування коду
- **Git** - Контроль версій

## 📦 Установка

### Передумови
- Node.js 18+
- npm або yarn
- Git

### Крок 1: Клонування
```bash
git clone https://github.com/VolodymyrKopach/teachspark-platform.git
cd teachspark-platform
```

### Крок 2: Встановлення залежностей
```bash
npm install
```

### Крок 3: Налаштування середовища
Створіть файл `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
FAL_KEY=your_fal_key
```

### Крок 4: Налаштування бази даних
```bash
# Запустіть міграції в Supabase Dashboard
# або використайте файли з папки database/migrations/
```

### Крок 5: Запуск
```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) в браузері.

## 🎯 Використання

### Створення уроку
1. Перейдіть на сторінку **Чат**
2. Опишіть урок, який хочете створити
3. AI згенерує слайди з контентом
4. Збережіть урок для подальшого використання

### Перегляд матеріалів
1. Відкрийте сторінку **Матеріали**
2. Переглядайте створені уроки
3. Клікніть на картку для перегляду слайдів
4. Використайте кнопку "Режим презентації" для повноекранного показу

### Навігація в презентаціях
- **← →** - Навігація по слайдах
- **F11** - Переключення режиму презентації
- **Esc** - Вихід з презентації

## 🏗️ Архітектура

```
teachspark-platform/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API endpoints
│   │   ├── auth/           # Автентифікація
│   │   ├── chat/           # Чат-інтерфейс
│   │   └── materials/      # Перегляд матеріалів
│   ├── components/         # React компоненти
│   │   ├── auth/          # Компоненти автентифікації
│   │   ├── chat/          # Компоненти чату
│   │   ├── slides/        # Компоненти слайдів
│   │   └── ui/            # UI компоненти
│   ├── services/          # Бізнес-логіка
│   │   ├── chat/          # Сервіси чату
│   │   ├── database/      # Робота з БД
│   │   └── intent/        # Розпізнавання намірів
│   ├── types/             # TypeScript типи
│   └── utils/             # Утиліти
├── database/              # Міграції БД
├── public/                # Статичні файли
└── docs/                  # Документація
```

## 🚀 Деплой

### Vercel (Рекомендовано)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VolodymyrKopach/teachspark-platform)

### Manual Deploy
```bash
npm run build
npx vercel --prod
```

### Інші платформи
- **Netlify** - [`netlify.toml`](netlify.toml) готовий
- **Railway** - Підтримується out-of-the-box
- **DigitalOcean** - App Platform сумісний

Детальні інструкції: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Внесок у проект

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Commit зміни (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

## 📋 План розвитку

- [ ] 🌐 Інтернаціоналізація (i18n)
- [ ] 📊 Аналітика використання
- [ ] 🎮 Інтерактивні завдання в слайдах
- [ ] 🔄 Експорт в PowerPoint/PDF
- [ ] 👥 Співпраця в реальному часі
- [ ] 📱 Мобільний додаток
- [ ] 🎨 Больше тем та шаблонів
- [ ] 🤖 Покращені AI можливості

## 📄 Ліцензія

Цей проект ліцензовано під [MIT License](LICENSE).

## 👨‍💻 Автор

**Volodymyr Kopach**
- GitHub: [@VolodymyrKopach](https://github.com/VolodymyrKopach)
- Email: kopachvldmr@gmail.com

## 🙏 Подяки

- [Next.js](https://nextjs.org/) за чудовий framework
- [Supabase](https://supabase.com/) за backend-as-a-service
- [Material-UI](https://mui.com/) за готові компоненти
- [Anthropic](https://www.anthropic.com/) за Claude AI
- [FAL.ai](https://fal.ai/) за генерацію зображень

---

⭐ **Сподобався проект? Поставте зірочку!** ⭐
