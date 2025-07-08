'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthContextType, UserProfile } from '@/types/auth'
import { SessionManager } from '@/components/auth/SessionManager'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    let initializationComplete = false

    // Функція для безпечного завершення ініціалізації
    const completeInitialization = () => {
      if (mounted && !initializationComplete) {
        initializationComplete = true
        setLoading(false)
        setInitialized(true)
      }
    }

    // Функція для ініціалізації авторизації
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Starting auth initialization...')
        
        // Отримуємо сесію з таймаутом
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )

        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (sessionError) {
          console.error('❌ AuthProvider: Error getting session:', sessionError)
        } else {
          console.log('✅ AuthProvider: Session retrieved:', session?.user ? 'User found' : 'No user')
        }

        if (mounted && !initializationComplete) {
          if (session?.user) {
            setUser(session.user)
            // Завантажуємо профіль асинхронно без блокування
            fetchUserProfile(session.user.id).catch(console.error)
          } else {
            setUser(null)
            setProfile(null)
          }
          completeInitialization()
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error initializing auth:', error)
        if (mounted) {
          completeInitialization()
        }
      }
    }

    // Скорочений таймаут для запобігання вічному loading
    const timeoutId = setTimeout(() => {
      if (mounted && !initializationComplete) {
        console.warn('Auth initialization timeout, forcing completion')
        completeInitialization()
      }
    }, 1000) // Зменшуємо до 1 секунди для швидшого редиректу

    // Запускаємо ініціалізацію
    initializeAuth()

    // Підписуємося на зміни аутентифікації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, session?.user ? 'User present' : 'No user')
        
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Завантажуємо профіль асинхронно
            fetchUserProfile(session.user.id).catch(console.error)
          } else {
            setProfile(null)
          }
          
          // Якщо ініціалізація ще не завершена, завершуємо її
          if (!initializationComplete) {
            completeInitialization()
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Функція для оновлення сесії
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      // Якщо реєстрація успішна, створюємо профіль користувача
      if (data.user && !error) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              role: 'teacher',
              subscription_type: 'free',
            },
          ])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ AuthProvider.signOut: Error during logout:', error)
        throw error
      }
      
      // Очищаємо локальний стан
      setUser(null)
      setProfile(null)
      
      // Перенаправляємо на сторінку логіну
      router.push('/auth/login')
      
    } catch (error) {
      console.error('❌ AuthProvider.signOut: Unexpected error during logout:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
  }

  // RouteGuard тепер обробляє loading screens та редиректи
  // AuthProvider просто надає контекст авторизації
  return (
    <AuthContext.Provider value={value}>
      <SessionManager />
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 