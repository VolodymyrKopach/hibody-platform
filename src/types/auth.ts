import { User } from '@supabase/supabase-js'

// Extended user profile
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'teacher' | 'admin' | 'student'
  subscription_type: 'free' | 'pro' | 'professional' | 'premium'
  created_at: string
  updated_at: string
}

// Authentication context
export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  sessionSynced: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<boolean>
}

// Authentication forms
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

// Subscription limits
export interface SubscriptionLimits {
  maxLessons: number
  maxSlidesPerLesson: number
  aiRequestsPerMonth: number
  imageGenerationsPerMonth: number
  canExport: boolean
  canShare: boolean
  canCreatePublicLessons: boolean
}

// Limits map by subscription type
export const SUBSCRIPTION_LIMITS: Record<UserProfile['subscription_type'], SubscriptionLimits> = {
  free: {
    maxLessons: 3,
    maxSlidesPerLesson: 10,
    aiRequestsPerMonth: 50,
    imageGenerationsPerMonth: 20,
    canExport: false,
    canShare: false,
    canCreatePublicLessons: false,
  },
  pro: {
    maxLessons: 20, // 20 lessons per month ($9/month)
    maxSlidesPerLesson: 30,
    aiRequestsPerMonth: 300,
    imageGenerationsPerMonth: 100,
    canExport: true,
    canShare: true,
    canCreatePublicLessons: true,
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