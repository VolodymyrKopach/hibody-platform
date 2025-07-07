-- =============================================
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