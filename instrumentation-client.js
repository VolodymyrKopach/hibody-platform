// instrumentation-client.js
// Next.js 15.3+ PostHog Integration
import posthog from 'posthog-js'

// Initialize PostHog with improved configuration
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  // Completely skip PostHog initialization in development
  if (process.env.NODE_ENV === 'development') {
    // Create a mock PostHog object to prevent errors
    window.posthog = {
      init: () => {},
      capture: () => {},
      identify: () => {},
      reset: () => {},
      debug: () => {},
      opt_out_capturing: () => {},
      opt_in_capturing: () => {},
      has_opted_out_capturing: () => false,
      has_opted_in_capturing: () => false,
      clear_opt_in_out_capturing: () => {},
      register: () => {},
      register_once: () => {},
      unregister: () => {},
      people: {
        set: () => {},
        set_once: () => {},
        increment: () => {},
        append: () => {},
        union: () => {},
        track_charge: () => {},
        clear_charges: () => {},
        delete_user: () => {}
      }
    }
  } else if (posthogKey && posthogKey !== 'phc_your_key_here') {
    try {
      // Production configuration only
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        defaults: '2025-05-24',
        
        // Performance optimizations
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        
        // Privacy settings
        respect_dnt: true,
        opt_out_capturing_by_default: false,
        
        // Error handling
        on_request_error: (error) => {
          console.warn('⚠️ PostHog request error:', error)
        }
      })
      
      // Set global reference for easier access
      window.posthog = posthog
      
    } catch (error) {
      console.error('❌ PostHog initialization failed:', error)
    }
  }
}

export default posthog
