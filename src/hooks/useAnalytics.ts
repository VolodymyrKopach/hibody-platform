import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/providers/AuthProvider'
import { useCallback } from 'react'

/**
 * Analytics Hook for PostHog Integration
 * Provides convenient methods for tracking user events
 */
export const useAnalytics = () => {
  const posthog = usePostHog()
  const { user } = useAuth()

  // Base tracking method with error handling
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    // Try to get PostHog from instrumentation-client.js or fallback to hook
    const posthogInstance = (typeof window !== 'undefined' ? window.posthog : null) || posthog
    
    if (!posthogInstance || typeof posthogInstance.capture !== 'function') {
      return
    }

    try {
      const eventProperties = {
        ...properties,
        user_id: user?.id,
        user_email: user?.email,
        timestamp: new Date().toISOString(),
        // Add app context
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV
      }

      posthogInstance.capture(event, eventProperties)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Analytics tracking failed:', error)
      }
    }
  }, [posthog, user])

  // User identification
  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    const posthogInstance = (typeof window !== 'undefined' ? window.posthog : null) || posthog
    
    if (!posthogInstance || typeof posthogInstance.identify !== 'function') {
      return
    }

    try {
      posthogInstance.identify(userId, {
        ...properties,
        last_seen: new Date().toISOString()
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ User identification failed:', error)
      }
    }
  }, [posthog])

  // Page tracking
  const trackPage = useCallback((pageName?: string, properties?: Record<string, any>) => {
    track('$pageview', {
      page_name: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...properties
    })
  }, [track])

  // =============================================
  // READY-TO-USE EVENT METHODS
  // =============================================

  // Authentication Events
  const trackSignup = useCallback((method: string = 'email', additionalProps?: Record<string, any>) => {
    track('user_signed_up', {
      signup_method: method,
      ...additionalProps
    })
  }, [track])

  const trackLogin = useCallback((method: string = 'email', additionalProps?: Record<string, any>) => {
    track('user_logged_in', {
      login_method: method,
      ...additionalProps
    })
  }, [track])

  const trackLogout = useCallback(() => {
    track('user_logged_out')
  }, [track])

  // Lesson Events
  const trackLessonCreated = useCallback((lessonData: {
    id: string
    age_group: string
    subject: string
    slides_count: number
    duration?: number
    method?: 'chat' | 'template' | 'manual'
  }) => {
    track('lesson_created', {
      lesson_id: lessonData.id,
      age_group: lessonData.age_group,
      subject: lessonData.subject,
      slides_count: lessonData.slides_count,
      duration_minutes: lessonData.duration || 30,
      creation_method: lessonData.method || 'unknown'
    })
  }, [track])

  const trackLessonViewed = useCallback((lessonId: string, lessonTitle?: string) => {
    track('lesson_viewed', {
      lesson_id: lessonId,
      lesson_title: lessonTitle
    })
  }, [track])

  const trackLessonShared = useCallback((lessonId: string, shareMethod: 'link' | 'export' | 'email') => {
    track('lesson_shared', {
      lesson_id: lessonId,
      share_method: shareMethod
    })
  }, [track])

  // Slide Events
  const trackSlideGenerated = useCallback((slideData: {
    id: string
    lesson_id: string
    type: string
    generation_time_ms?: number
  }) => {
    track('slide_generated', {
      slide_id: slideData.id,
      lesson_id: slideData.lesson_id,
      slide_type: slideData.type,
      generation_time_ms: slideData.generation_time_ms
    })
  }, [track])

  const trackSlideEdited = useCallback((slideId: string, editType: 'content' | 'design' | 'properties') => {
    track('slide_edited', {
      slide_id: slideId,
      edit_type: editType
    })
  }, [track])

  // Chat Events
  const trackChatMessage = useCallback((messageType: 'user' | 'assistant', messageLength?: number) => {
    track('chat_message_sent', {
      message_type: messageType,
      message_length: messageLength
    })
  }, [track])

  const trackChatCommand = useCallback((command: string, success: boolean = true) => {
    track('chat_command_used', {
      command: command,
      success: success
    })
  }, [track])

  // Feature Usage Events
  const trackFeatureUsed = useCallback((featureName: string, context?: string) => {
    track('feature_used', {
      feature_name: featureName,
      context: context
    })
  }, [track])

  const trackError = useCallback((errorType: string, errorMessage?: string, context?: string) => {
    track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context: context
    })
  }, [track])

  // Engagement Events
  const trackSessionStart = useCallback(() => {
    track('session_started')
  }, [track])

  const trackSessionEnd = useCallback((durationMs: number) => {
    track('session_ended', {
      session_duration_ms: durationMs
    })
  }, [track])

  // Monetization Events
  const trackGenerateLesson = useCallback((generationNumber: number, isPro: boolean = false) => {
    track('generate_lesson', {
      generation_number: generationNumber,
      is_pro: isPro
    })
  }, [track])

  const trackPaywallOpened = useCallback((generationCount: number, trigger: 'limit_reached' | 'manual') => {
    track('open_paywall', {
      generation_count: generationCount,
      trigger: trigger
    })
  }, [track])

  const trackUpgradeClicked = useCallback((source: 'paywall' | 'settings' | 'banner') => {
    track('click_upgrade', {
      source: source
    })
  }, [track])

  const trackPaymentCompleted = useCallback((amount: number, currency: string = 'USD') => {
    track('complete_payment', {
      amount: amount,
      currency: currency
    })
  }, [track])

  const trackGenerateAfterPaywall = useCallback((dismissed: boolean) => {
    track('generate_after_paywall', {
      dismissed_paywall: dismissed
    })
  }, [track])

  // Return all methods
  return {
    // Base methods
    track,
    identify,
    trackPage,

    // Authentication
    trackSignup,
    trackLogin,
    trackLogout,

    // Lessons
    trackLessonCreated,
    trackLessonViewed,
    trackLessonShared,

    // Slides
    trackSlideGenerated,
    trackSlideEdited,

    // Chat
    trackChatMessage,
    trackChatCommand,

    // Features & Errors
    trackFeatureUsed,
    trackError,

    // Session
    trackSessionStart,
    trackSessionEnd,

    // Monetization
    trackGenerateLesson,
    trackPaywallOpened,
    trackUpgradeClicked,
    trackPaymentCompleted,
    trackGenerateAfterPaywall,

    // Utility
    isReady: (() => {
      const posthogInstance = (typeof window !== 'undefined' ? window.posthog : null) || posthog
      return !!(posthogInstance && typeof posthogInstance.capture === 'function')
    })()
  }
}

export default useAnalytics
