'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthContextType, UserProfile } from '@/types/auth'

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
          // Handle session error silently
        }

        if (mounted && !initializationComplete) {
          if (session?.user) {
            setUser(session.user)
            // Завантажуємо профіль асинхронно без блокування
            fetchUserProfile(session.user.id).catch(() => {})
          } else {
            setUser(null)
            setProfile(null)
          }
          completeInitialization()
        }
      } catch (error) {

        if (mounted) {
          completeInitialization()
        }
      }
    }

    // Скорочений таймаут для запобігання вічному loading
    const timeoutId = setTimeout(() => {
      if (mounted && !initializationComplete) {

        completeInitialization()
      }
    }, 1000) // Зменшуємо до 1 секунди для швидшого редиректу

    // Запускаємо ініціалізацію
    initializeAuth()

    // Підписуємося на зміни аутентифікації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {

        
        if (mounted) {
          const newUser = session?.user ?? null
          
          // Оновлюємо користувача тільки якщо він змінився
          setUser(prevUser => {
            const userChanged = prevUser?.id !== newUser?.id
            
            if (userChanged) {
              if (newUser) {
                // Завантажуємо профіль асинхронно тільки для нового користувача
                fetchUserProfile(newUser.id).catch(() => {})
              } else {
                setProfile(null)
              }
            }
            
            return newUser
          })
          
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {

        return
      }

      setProfile(data)
    } catch (error) {
      // Handle error silently
    }
  }, [])

  // Функція для оновлення сесії (для ручного використання)
  const refreshSession = useCallback(async () => {
    try {

      const { data, error } = await supabase.auth.refreshSession()
      if (error) {

        return false
      }

      return true
    } catch (error) {

      return false
    }
  }, [])

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
          // Handle profile creation error silently
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

        throw error
      }
      
      // Очищаємо локальний стан
      setUser(null)
      setProfile(null)
      
      // Перенаправляємо на сторінку логіну
      router.push('/auth/login')
      
    } catch (error) {

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
      {/* SessionManager removed - using Supabase's built-in autoRefreshToken instead */}
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