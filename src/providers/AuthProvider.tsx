'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthContextType, UserProfile, OAuthProvider } from '@/types/auth'
import { useAuthAnalytics } from '@/hooks/useAuthAnalytics'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [sessionSynced, setSessionSynced] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const analytics = useAuthAnalytics()

  useEffect(() => {
    let mounted = true
    let initializationComplete = false

    // Safe initialization completion function
    const completeInitialization = () => {
      if (mounted && !initializationComplete) {
        initializationComplete = true
        setLoading(false)
        setInitialized(true)
      }
    }

    // Authentication initialization function
    const initializeAuth = async () => {
      try {

        
        // Get session with timeout
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
            
            // Check if user signed in via OAuth
            const isOAuthUser = session.user.app_metadata?.provider && 
                               session.user.app_metadata?.provider !== 'email'
            
            if (isOAuthUser) {
              // Ensure profile exists for OAuth users
              ensureUserProfile(session.user).catch(() => {})
            } else {
              // Load profile asynchronously for email users
              fetchUserProfile(session.user.id).catch(() => {})
            }
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

    // Shortened timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && !initializationComplete) {

        completeInitialization()
      }
    }, 1000) // Reduced to 1 second for faster redirect

    // Start initialization
    initializeAuth()

    // Subscribe to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {

        
        if (mounted) {
          const newUser = session?.user ?? null
          
          // Update user only if changed
          setUser(prevUser => {
            const userChanged = prevUser?.id !== newUser?.id
            
            if (userChanged) {
              if (newUser) {
                // Check if user signed in via OAuth
                const isOAuthUser = newUser.app_metadata?.provider && 
                                   newUser.app_metadata?.provider !== 'email'
                
                if (isOAuthUser) {
                  // Ensure profile exists for OAuth users
                  ensureUserProfile(newUser).catch(() => {})
                } else {
                  // Load profile asynchronously for email users
                  fetchUserProfile(newUser.id).catch(() => {})
                }
              } else {
                setProfile(null)
              }
            }
            
            return newUser
          })
          
          // If initialization not complete, complete it
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

  // Ensure user profile exists, create if missing (for OAuth users)
  const ensureUserProfile = useCallback(async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        setProfile(existingProfile)
        return { data: existingProfile, error: null }
      }

      // Profile doesn't exist, create it
      const fullName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.user_metadata?.display_name || 
                       user.email?.split('@')[0]

      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture

      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: 'teacher' as const,
        subscription_type: 'free' as const,
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        console.error('Failed to create user profile:', error)
        return { data: null, error }
      }

      setProfile(data)
      
      // Track profile creation
      analytics.trackProfileCreated(user.id, {
        user_id: user.id,
        user_email: user.email,
        full_name: fullName,
        role: 'teacher',
        subscription_type: 'free',
        oauth_provider: user.app_metadata?.provider,
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return { data: null, error: error as Error }
    }
  }, [analytics])

  // Check session synchronization with server
  const checkSessionSync = useCallback(async () => {
    if (!user) {
      setSessionSynced(false)
      return
    }

    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user.id === user.id) {
          setSessionSynced(true)
          return
        }
      }
      
      // Retry after 500ms, but not more than 6 times (3 seconds total)
      setTimeout(() => {
        if (user) {
          checkSessionSync()
        }
      }, 500)
    } catch (error) {
      console.error('Session sync check failed:', error)
      // Fallback - assume synced after 3 seconds
      setTimeout(() => {
        setSessionSynced(true)
      }, 3000)
    }
  }, [user])

  // Manual session refresh function
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

  // Check session sync after initialization
  useEffect(() => {
    if (initialized && user && !sessionSynced) {
      checkSessionSync()
    } else if (!user) {
      setSessionSynced(false)
    }
  }, [initialized, user, sessionSynced, checkSessionSync])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

          // Track successful login with real user data
          if (data.user && !error) {
            analytics.trackLogin('email', {
              user_id: data.user.id,
              user_email: data.user.email,
              email_domain: data.user.email?.split('@')[1] || 'unknown',
              last_sign_in: data.user.last_sign_in_at
            })
            
            // Update user identification with real data
            analytics.identifyUser(data.user.id, {
              email: data.user.email,
              last_login: new Date().toISOString(),
              login_count: (data.user.user_metadata?.login_count || 0) + 1
            })
          }

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

      // If registration successful, create user profile
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
        } else {
                // Track successful signup with real user data
                analytics.trackSignup('email', {
                  user_id: data.user.id,
                  user_email: data.user.email,
                  has_full_name: !!fullName,
                  email_domain: data.user.email?.split('@')[1] || 'unknown',
                  full_name: fullName
                })
                
                // Identify user for future events with real data
                analytics.identifyUser(data.user.id, {
                  email: data.user.email,
                  full_name: fullName,
                  role: 'teacher',
                  subscription_type: 'free',
                  signup_date: new Date().toISOString()
                })
                
                // Track profile creation with real user data
                analytics.trackProfileCreated(data.user.id, {
                  user_id: data.user.id,
                  user_email: data.user.email,
                  full_name: fullName,
                  role: 'teacher',
                  subscription_type: 'free'
                })
        }
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error(`OAuth ${provider} error:`, error)
        return { error }
      }

      // Track OAuth login attempt
      analytics.trackLogin(provider, {
        oauth_provider: provider,
        redirect_url: window.location.origin,
      })

      return { error: null }
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
        try {
          // Track logout before clearing user data with real user info
          if (user) {
            analytics.trackLogout({
              user_id: user.id,
              user_email: user.email,
              session_duration: Date.now() - (user.created_at ? new Date(user.created_at).getTime() : Date.now())
            })
          }
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Clear local state
      setUser(null)
      setProfile(null)
      
      // Redirect to login page
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
    loading: loading || Boolean(user && !sessionSynced), // Show loading while session is not synced
    sessionSynced,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    updateProfile,
    refreshSession,
  }

  // RouteGuard handles loading screens and redirects
  // AuthProvider provides authentication context
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