import { User } from '@supabase/supabase-js'

// Розширений профіль користувача
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'teacher' | 'admin' | 'student'
  subscription_type: 'free' | 'professional' | 'premium'
  created_at: string
  updated_at: string
}

// Контекст аутентифікації
export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<boolean>
}

// Форми аутентифікації
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

// Ліміти підписки
export interface SubscriptionLimits {
  maxLessons: number
  maxSlidesPerLesson: number
  aiRequestsPerMonth: number
  imageGenerationsPerMonth: number
  canExport: boolean
  canShare: boolean
  canCreatePublicLessons: boolean
}

// Мапа лімітів за типом підписки
export const SUBSCRIPTION_LIMITS: Record<UserProfile['subscription_type'], SubscriptionLimits> = {
  free: {
    maxLessons: 5,
    maxSlidesPerLesson: 10,
    aiRequestsPerMonth: 50,
    imageGenerationsPerMonth: 20,
    canExport: false,
    canShare: false,
    canCreatePublicLessons: false,
  },
  professional: {
    maxLessons: 50,
    maxSlidesPerLesson: 50,
    aiRequestsPerMonth: 500,
    imageGenerationsPerMonth: 200,
    canExport: true,
    canShare: true,
    canCreatePublicLessons: true,
  },
  premium: {
    maxLessons: -1, // Unlimited
    maxSlidesPerLesson: -1, // Unlimited
    aiRequestsPerMonth: -1, // Unlimited
    imageGenerationsPerMonth: -1, // Unlimited
    canExport: true,
    canShare: true,
    canCreatePublicLessons: true,
  },
} 