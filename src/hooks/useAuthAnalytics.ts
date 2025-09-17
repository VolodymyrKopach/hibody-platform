import { useCallback } from 'react'

/**
 * Auth-specific analytics hook
 * Separated to avoid circular dependencies with AuthProvider
 */
export const useAuthAnalytics = () => {
  
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    // Get PostHog from global window or import directly
    const posthog = typeof window !== 'undefined' ? window.posthog : null
    
    if (!posthog || typeof posthog.capture !== 'function') {
      return
    }

    try {
      const eventProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV
      }

      posthog.capture(event, eventProperties)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Auth analytics tracking failed:', error)
      }
    }
  }, [])

  const identifyUser = useCallback((userId: string, properties?: Record<string, any>) => {
    const posthog = typeof window !== 'undefined' ? window.posthog : null
    
    if (!posthog || typeof posthog.identify !== 'function') {
      return
    }

    try {
      posthog.identify(userId, {
        ...properties,
        last_seen: new Date().toISOString()
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Auth user identification failed:', error)
      }
    }
  }, [])

  // Ready-to-use auth event methods
  const trackSignup = useCallback((method: string = 'email', additionalProps?: Record<string, any>) => {
    trackEvent('user_signed_up', {
      signup_method: method,
      ...additionalProps
    })
  }, [trackEvent])

  const trackLogin = useCallback((method: string = 'email', additionalProps?: Record<string, any>) => {
    trackEvent('user_logged_in', {
      login_method: method,
      ...additionalProps
    })
  }, [trackEvent])

  const trackLogout = useCallback((additionalProps?: Record<string, any>) => {
    trackEvent('user_logged_out', additionalProps)
  }, [trackEvent])

  const trackProfileCreated = useCallback((userId: string, userProps?: Record<string, any>) => {
    trackEvent('user_profile_created', {
      user_id: userId,
      ...userProps
    })
  }, [trackEvent])

  return {
    trackEvent,
    identifyUser,
    trackSignup,
    trackLogin,
    trackLogout,
    trackProfileCreated
  }
}

export default useAuthAnalytics
