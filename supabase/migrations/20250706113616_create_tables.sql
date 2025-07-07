-- =============================================
-- HiBody Platform Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER PROFILES TABLE
-- =============================================
-- Розширення таблиці користувачів Supabase Auth
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'student')),
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'professional', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  age_group TEXT NOT NULL,
  duration INTEGER DEFAULT 45, -- тривалість в хвилинах
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  views INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  completion_rate INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- додаткові мета-дані
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SLIDES TABLE
-- =============================================
CREATE TABLE public.slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'content' CHECK (type IN ('welcome', 'content', 'activity', 'game', 'summary')),
  icon TEXT DEFAULT '📄',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'generating', 'error')),
  slide_number INTEGER NOT NULL,
  preview_text TEXT,
  thumbnail_url TEXT,
  
  -- HTML контент
  html_content TEXT,
  css_content TEXT,
  js_content TEXT,
  
  -- Мета-дані
  dependencies JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Інформація про обробку
  processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('processing', 'ready', 'error')),
  processing_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Унікальність номера слайду в межах уроку
  UNIQUE(lesson_id, slide_number)
);

-- =============================================
-- SLIDE IMAGES TABLE
-- =============================================
CREATE TABLE public.slide_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slide_id UUID REFERENCES public.slides(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  prompt_used TEXT,
  image_order INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('processing', 'ready', 'error')),
  processing_error TEXT,
  file_size INTEGER, -- розмір файлу в байтах
  dimensions JSONB, -- {width: number, height: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CHAT SESSIONS TABLE
-- =============================================
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT,
  session_type TEXT DEFAULT 'lesson_creation' CHECK (session_type IN ('lesson_creation', 'general_chat', 'support')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'lesson_creation', 'slide_generation', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION USAGE TABLE
-- =============================================
-- Відстеження використання ресурсів для підписок
CREATE TABLE public.subscription_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('ai_requests', 'image_generations', 'lessons_created', 'slides_created')),
  usage_count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Унікальність періоду для користувача та ресурсу
  UNIQUE(user_id, resource_type, period_start)
);

-- =============================================
-- LESSON SHARES TABLE
-- =============================================
-- Для публічних уроків та спільного доступу
CREATE TABLE public.lesson_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  share_type TEXT DEFAULT 'public' CHECK (share_type IN ('public', 'link', 'specific_users')),
  share_token TEXT UNIQUE, -- для доступу по посиланню
  permissions JSONB DEFAULT '{"can_view": true, "can_copy": false, "can_edit": false}',
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LESSON RATINGS TABLE
-- =============================================
CREATE TABLE public.lesson_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Один рейтинг від користувача на урок
  UNIQUE(lesson_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_subscription ON public.user_profiles(subscription_type);

-- Lessons indexes
CREATE INDEX idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX idx_lessons_status ON public.lessons(status);
CREATE INDEX idx_lessons_is_public ON public.lessons(is_public);
CREATE INDEX idx_lessons_subject ON public.lessons(subject);
CREATE INDEX idx_lessons_age_group ON public.lessons(age_group);
CREATE INDEX idx_lessons_created_at ON public.lessons(created_at DESC);

-- Slides indexes
CREATE INDEX idx_slides_lesson_id ON public.slides(lesson_id);
CREATE INDEX idx_slides_slide_number ON public.slides(lesson_id, slide_number);
CREATE INDEX idx_slides_status ON public.slides(status);

-- Slide images indexes
CREATE INDEX idx_slide_images_slide_id ON public.slide_images(slide_id);

-- Chat sessions indexes
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_lesson_id ON public.chat_sessions(lesson_id);
CREATE INDEX idx_chat_sessions_last_message ON public.chat_sessions(last_message_at DESC);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Subscription usage indexes
CREATE INDEX idx_subscription_usage_user_period ON public.subscription_usage(user_id, period_start, period_end);

-- Lesson shares indexes
CREATE INDEX idx_lesson_shares_lesson_id ON public.lesson_shares(lesson_id);
CREATE INDEX idx_lesson_shares_token ON public.lesson_shares(share_token);

-- Lesson ratings indexes
CREATE INDEX idx_lesson_ratings_lesson_id ON public.lesson_ratings(lesson_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Функція для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для автоматичного оновлення updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at 
    BEFORE UPDATE ON public.slides 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at 
    BEFORE UPDATE ON public.subscription_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_ratings_updated_at 
    BEFORE UPDATE ON public.lesson_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для автоматичного створення профілю користувача
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Тригер для створення профілю при реєстрації
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функція для оновлення рейтингу уроку
CREATE OR REPLACE FUNCTION update_lesson_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.lessons 
    SET rating = (
        SELECT ROUND(AVG(rating), 1) 
        FROM public.lesson_ratings 
        WHERE lesson_id = COALESCE(NEW.lesson_id, OLD.lesson_id)
    )
    WHERE id = COALESCE(NEW.lesson_id, OLD.lesson_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Тригери для оновлення рейтингу
CREATE TRIGGER update_lesson_rating_on_insert
    AFTER INSERT ON public.lesson_ratings
    FOR EACH ROW EXECUTE FUNCTION update_lesson_rating();

CREATE TRIGGER update_lesson_rating_on_update
    AFTER UPDATE ON public.lesson_ratings
    FOR EACH ROW EXECUTE FUNCTION update_lesson_rating();

CREATE TRIGGER update_lesson_rating_on_delete
    AFTER DELETE ON public.lesson_ratings
    FOR EACH ROW EXECUTE FUNCTION update_lesson_rating(); -- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- =============================================
-- USER PROFILES RLS
-- =============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити тільки свій профіль
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Користувачі можуть оновлювати тільки свій профіль
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Користувачі можуть видаляти тільки свій профіль
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- =============================================
-- LESSONS RLS
-- =============================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити свої уроки та публічні уроки
CREATE POLICY "Users can view own lessons and public lessons" ON public.lessons
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_public = true AND status = 'published')
  );

-- Користувачі можуть створювати уроки
CREATE POLICY "Users can create lessons" ON public.lessons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть оновлювати тільки свої уроки
CREATE POLICY "Users can update own lessons" ON public.lessons
  FOR UPDATE USING (auth.uid() = user_id);

-- Користувачі можуть видаляти тільки свої уроки
CREATE POLICY "Users can delete own lessons" ON public.lessons
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SLIDES RLS
-- =============================================
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити слайди своїх уроків та публічних уроків
CREATE POLICY "Users can view slides of accessible lessons" ON public.slides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = slides.lesson_id 
      AND (
        lessons.user_id = auth.uid() OR 
        (lessons.is_public = true AND lessons.status = 'published')
      )
    )
  );

-- Користувачі можуть створювати слайди тільки для своїх уроків
CREATE POLICY "Users can create slides for own lessons" ON public.slides
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = slides.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Користувачі можуть оновлювати слайди тільки своїх уроків
CREATE POLICY "Users can update slides of own lessons" ON public.slides
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = slides.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Користувачі можуть видаляти слайди тільки своїх уроків
CREATE POLICY "Users can delete slides of own lessons" ON public.slides
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = slides.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- =============================================
-- SLIDE IMAGES RLS
-- =============================================
ALTER TABLE public.slide_images ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити зображення слайдів доступних уроків
CREATE POLICY "Users can view images of accessible slides" ON public.slide_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.slides 
      JOIN public.lessons ON lessons.id = slides.lesson_id
      WHERE slides.id = slide_images.slide_id 
      AND (
        lessons.user_id = auth.uid() OR 
        (lessons.is_public = true AND lessons.status = 'published')
      )
    )
  );

-- Користувачі можуть створювати зображення тільки для слайдів своїх уроків
CREATE POLICY "Users can create images for own slides" ON public.slide_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.slides 
      JOIN public.lessons ON lessons.id = slides.lesson_id
      WHERE slides.id = slide_images.slide_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Користувачі можуть видаляти зображення тільки своїх слайдів
CREATE POLICY "Users can delete images of own slides" ON public.slide_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.slides 
      JOIN public.lessons ON lessons.id = slides.lesson_id
      WHERE slides.id = slide_images.slide_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- =============================================
-- CHAT SESSIONS RLS
-- =============================================
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити тільки свої чат-сесії
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Користувачі можуть створювати свої чат-сесії
CREATE POLICY "Users can create own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть оновлювати свої чат-сесії
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Користувачі можуть видаляти свої чат-сесії
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CHAT MESSAGES RLS
-- =============================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити повідомлення тільки своїх сесій
CREATE POLICY "Users can view messages of own sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Користувачі можуть створювати повідомлення тільки в своїх сеcіях
CREATE POLICY "Users can create messages in own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- =============================================
-- SUBSCRIPTION USAGE RLS
-- =============================================
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити тільки своє використання
CREATE POLICY "Users can view own usage" ON public.subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Система може створювати записи використання
CREATE POLICY "System can create usage records" ON public.subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Система може оновлювати записи використання
CREATE POLICY "System can update usage records" ON public.subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- LESSON SHARES RLS
-- =============================================
ALTER TABLE public.lesson_shares ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити публічні шери та свої власні
CREATE POLICY "Users can view public shares and own shares" ON public.lesson_shares
  FOR SELECT USING (
    share_type = 'public' OR 
    shared_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = lesson_shares.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Користувачі можуть створювати шери тільки для своїх уроків
CREATE POLICY "Users can create shares for own lessons" ON public.lesson_shares
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = lesson_shares.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Користувачі можуть оновлювати тільки свої шери
CREATE POLICY "Users can update own shares" ON public.lesson_shares
  FOR UPDATE USING (shared_by = auth.uid());

-- Користувачі можуть видаляти тільки свої шери
CREATE POLICY "Users can delete own shares" ON public.lesson_shares
  FOR DELETE USING (shared_by = auth.uid());

-- =============================================
-- LESSON RATINGS RLS
-- =============================================
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть бачити рейтинги публічних уроків та своїх уроків
CREATE POLICY "Users can view ratings of accessible lessons" ON public.lesson_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = lesson_ratings.lesson_id 
      AND (
        lessons.user_id = auth.uid() OR 
        (lessons.is_public = true AND lessons.status = 'published')
      )
    )
  );

-- Користувачі можуть створювати рейтинги тільки для публічних уроків інших користувачів
CREATE POLICY "Users can rate public lessons of others" ON public.lesson_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.id = lesson_ratings.lesson_id 
      AND lessons.is_public = true 
      AND lessons.status = 'published'
      AND lessons.user_id != auth.uid()
    )
  );

-- Користувачі можуть оновлювати тільки свої рейтинги
CREATE POLICY "Users can update own ratings" ON public.lesson_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Користувачі можуть видаляти тільки свої рейтинги
CREATE POLICY "Users can delete own ratings" ON public.lesson_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ADMIN POLICIES
-- =============================================

-- Адміністратори мають повний доступ до всіх таблиць
-- (Ці політики будуть активні тільки для користувачів з роллю 'admin')

CREATE POLICY "Admins have full access to user_profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to slides" ON public.slides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to chat_sessions" ON public.chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to chat_messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 