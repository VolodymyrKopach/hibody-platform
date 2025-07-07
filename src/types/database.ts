// =============================================
// Database Types for Supabase
// =============================================

// Базові типи для таблиць бази даних
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRow
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      lessons: {
        Row: LessonRow
        Insert: LessonInsert
        Update: LessonUpdate
      }
      slides: {
        Row: SlideRow
        Insert: SlideInsert
        Update: SlideUpdate
      }
      slide_images: {
        Row: SlideImageRow
        Insert: SlideImageInsert
        Update: SlideImageUpdate
      }
      chat_sessions: {
        Row: ChatSessionRow
        Insert: ChatSessionInsert
        Update: ChatSessionUpdate
      }
      chat_messages: {
        Row: ChatMessageRow
        Insert: ChatMessageInsert
        Update: ChatMessageUpdate
      }
      subscription_usage: {
        Row: SubscriptionUsageRow
        Insert: SubscriptionUsageInsert
        Update: SubscriptionUsageUpdate
      }
      lesson_shares: {
        Row: LessonShareRow
        Insert: LessonShareInsert
        Update: LessonShareUpdate
      }
      lesson_ratings: {
        Row: LessonRatingRow
        Insert: LessonRatingInsert
        Update: LessonRatingUpdate
      }
    }
  }
}

// =============================================
// USER PROFILES
// =============================================
export interface UserProfileRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'teacher' | 'admin' | 'student'
  subscription_type: 'free' | 'professional' | 'premium'
  subscription_expires_at: string | null
  onboarding_completed: boolean
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserProfileInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role?: 'teacher' | 'admin' | 'student'
  subscription_type?: 'free' | 'professional' | 'premium'
  subscription_expires_at?: string | null
  onboarding_completed?: boolean
  preferences?: Record<string, any>
}

export interface UserProfileUpdate {
  email?: string
  full_name?: string | null
  avatar_url?: string | null
  role?: 'teacher' | 'admin' | 'student'
  subscription_type?: 'free' | 'professional' | 'premium'
  subscription_expires_at?: string | null
  onboarding_completed?: boolean
  preferences?: Record<string, any>
}

// =============================================
// LESSONS
// =============================================
export interface LessonRow {
  id: string
  user_id: string
  title: string
  description: string | null
  subject: string
  age_group: string
  duration: number
  status: 'draft' | 'published' | 'archived'
  thumbnail_url: string | null
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  views: number
  rating: number
  completion_rate: number
  is_public: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LessonInsert {
  user_id: string
  title: string
  description?: string | null
  subject: string
  age_group: string
  duration?: number
  status?: 'draft' | 'published' | 'archived'
  thumbnail_url?: string | null
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  is_public?: boolean
  metadata?: Record<string, any>
}

export interface LessonUpdate {
  title?: string
  description?: string | null
  subject?: string
  age_group?: string
  duration?: number
  status?: 'draft' | 'published' | 'archived'
  thumbnail_url?: string | null
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  views?: number
  completion_rate?: number
  is_public?: boolean
  metadata?: Record<string, any>
}

// =============================================
// SLIDES
// =============================================
export interface SlideRow {
  id: string
  lesson_id: string
  title: string
  description: string | null
  type: 'welcome' | 'content' | 'activity' | 'game' | 'summary'
  icon: string
  status: 'draft' | 'ready' | 'generating' | 'error'
  slide_number: number
  preview_text: string | null
  thumbnail_url: string | null
  html_content: string | null
  css_content: string | null
  js_content: string | null
  dependencies: any[]
  metadata: Record<string, any>
  processing_status: 'processing' | 'ready' | 'error'
  processing_error: string | null
  created_at: string
  updated_at: string
}

export interface SlideInsert {
  lesson_id: string
  title: string
  description?: string | null
  type?: 'welcome' | 'content' | 'activity' | 'game' | 'summary'
  icon?: string
  status?: 'draft' | 'ready' | 'generating' | 'error'
  slide_number: number
  preview_text?: string | null
  thumbnail_url?: string | null
  html_content?: string | null
  css_content?: string | null
  js_content?: string | null
  dependencies?: any[]
  metadata?: Record<string, any>
  processing_status?: 'processing' | 'ready' | 'error'
  processing_error?: string | null
}

export interface SlideUpdate {
  title?: string
  description?: string | null
  type?: 'welcome' | 'content' | 'activity' | 'game' | 'summary'
  icon?: string
  status?: 'draft' | 'ready' | 'generating' | 'error'
  slide_number?: number
  preview_text?: string | null
  thumbnail_url?: string | null
  html_content?: string | null
  css_content?: string | null
  js_content?: string | null
  dependencies?: any[]
  metadata?: Record<string, any>
  processing_status?: 'processing' | 'ready' | 'error'
  processing_error?: string | null
}

// =============================================
// SLIDE IMAGES
// =============================================
export interface SlideImageRow {
  id: string
  slide_id: string
  image_url: string
  alt_text: string | null
  prompt_used: string | null
  image_order: number
  processing_status: 'processing' | 'ready' | 'error'
  processing_error: string | null
  file_size: number | null
  dimensions: Record<string, any> | null
  created_at: string
}

export interface SlideImageInsert {
  slide_id: string
  image_url: string
  alt_text?: string | null
  prompt_used?: string | null
  image_order?: number
  processing_status?: 'processing' | 'ready' | 'error'
  processing_error?: string | null
  file_size?: number | null
  dimensions?: Record<string, any> | null
}

export interface SlideImageUpdate {
  image_url?: string
  alt_text?: string | null
  prompt_used?: string | null
  image_order?: number
  processing_status?: 'processing' | 'ready' | 'error'
  processing_error?: string | null
  file_size?: number | null
  dimensions?: Record<string, any> | null
}

// =============================================
// CHAT SESSIONS
// =============================================
export interface ChatSessionRow {
  id: string
  user_id: string
  lesson_id: string | null
  title: string | null
  session_type: 'lesson_creation' | 'general_chat' | 'support'
  status: 'active' | 'completed' | 'archived'
  last_message_at: string
  metadata: Record<string, any>
  created_at: string
}

export interface ChatSessionInsert {
  user_id: string
  lesson_id?: string | null
  title?: string | null
  session_type?: 'lesson_creation' | 'general_chat' | 'support'
  status?: 'active' | 'completed' | 'archived'
  metadata?: Record<string, any>
}

export interface ChatSessionUpdate {
  lesson_id?: string | null
  title?: string | null
  session_type?: 'lesson_creation' | 'general_chat' | 'support'
  status?: 'active' | 'completed' | 'archived'
  last_message_at?: string
  metadata?: Record<string, any>
}

// =============================================
// CHAT MESSAGES
// =============================================
export interface ChatMessageRow {
  id: string
  session_id: string
  sender: 'user' | 'ai'
  content: string
  message_type: 'text' | 'lesson_creation' | 'slide_generation' | 'system'
  metadata: Record<string, any>
  created_at: string
}

export interface ChatMessageInsert {
  session_id: string
  sender: 'user' | 'ai'
  content: string
  message_type?: 'text' | 'lesson_creation' | 'slide_generation' | 'system'
  metadata?: Record<string, any>
}

export interface ChatMessageUpdate {
  content?: string
  message_type?: 'text' | 'lesson_creation' | 'slide_generation' | 'system'
  metadata?: Record<string, any>
}

// =============================================
// SUBSCRIPTION USAGE
// =============================================
export interface SubscriptionUsageRow {
  id: string
  user_id: string
  resource_type: 'ai_requests' | 'image_generations' | 'lessons_created' | 'slides_created'
  usage_count: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface SubscriptionUsageInsert {
  user_id: string
  resource_type: 'ai_requests' | 'image_generations' | 'lessons_created' | 'slides_created'
  usage_count?: number
  period_start: string
  period_end: string
}

export interface SubscriptionUsageUpdate {
  usage_count?: number
}

// =============================================
// LESSON SHARES
// =============================================
export interface LessonShareRow {
  id: string
  lesson_id: string
  shared_by: string
  share_type: 'public' | 'link' | 'specific_users'
  share_token: string | null
  permissions: Record<string, any>
  expires_at: string | null
  view_count: number
  created_at: string
}

export interface LessonShareInsert {
  lesson_id: string
  shared_by: string
  share_type?: 'public' | 'link' | 'specific_users'
  share_token?: string | null
  permissions?: Record<string, any>
  expires_at?: string | null
}

export interface LessonShareUpdate {
  share_type?: 'public' | 'link' | 'specific_users'
  permissions?: Record<string, any>
  expires_at?: string | null
  view_count?: number
}

// =============================================
// LESSON RATINGS
// =============================================
export interface LessonRatingRow {
  id: string
  lesson_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
}

export interface LessonRatingInsert {
  lesson_id: string
  user_id: string
  rating: number
  review?: string | null
}

export interface LessonRatingUpdate {
  rating?: number
  review?: string | null
}

// =============================================
// UTILITY TYPES
// =============================================

// Для join запитів
export interface LessonWithSlides extends LessonRow {
  slides: SlideRow[]
}

export interface SlideWithImages extends SlideRow {
  slide_images: SlideImageRow[]
}

export interface ChatSessionWithMessages extends ChatSessionRow {
  chat_messages: ChatMessageRow[]
}

// Для пагінації
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Для фільтрації уроків
export interface LessonFilters {
  subject?: string
  ageGroup?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  status?: 'draft' | 'published' | 'archived'
  isPublic?: boolean
  search?: string
}

// Для статистики
export interface UserStats {
  totalLessons: number
  publishedLessons: number
  totalSlides: number
  totalViews: number
  averageRating: number
} 